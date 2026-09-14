import assert from 'node:assert/strict'
import { test } from 'node:test'
import { Resvg } from '@resvg/resvg-js'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate'
import { buildStickerLinks, generateSticker, stickerManifest, stickerPrintSheet, type StickerDraft } from '../lib/sticker-qr'

const draft: StickerDraft = {
    campaign: 'campus_launch', mode: 'numbered', prefix: 'pack', start: 1, count: 3,
    customIds: '', cta: 'Scan to grow your tree', correction: 'Q',
}

function decodeSvg(svg: string) {
    const rendered = new Resvg(svg, { fitTo: { mode: 'width', value: 1000 } }).render()
    return jsQR(new Uint8ClampedArray(rendered.pixels), rendered.width, rendered.height)?.data
}

test('numbered codes embed exact first-party URLs and unique tracking parameters', () => {
    const links = buildStickerLinks(draft)
    assert.equal(links.length, 3)
    assert.equal(links[0].url, 'https://idleforest.com/?utm_source=sticker&utm_medium=offline&utm_campaign=campus_launch&utm_content=pack_01')
    assert.equal(links[2].content, 'pack_03')
    assert.equal(new Set(links.map(link => link.url)).size, 3)
    assert.equal(buildStickerLinks({ ...draft, start: 99 })[2].content, 'pack_101')
})

test('custom batches preserve trimmed IDs and ignore blank lines', () => {
    const links = buildStickerLinks({ ...draft, mode: 'custom', campaign: 'cafe_drop', customIds: ' batch_a\r\n\r\nbatch_b ' })
    assert.deepEqual(links.map(link => link.content), ['batch_a', 'batch_b'])
    assert.equal(new URL(links[1].url).searchParams.get('utm_campaign'), 'cafe_drop')
})

test('reject invalid names, duplicate IDs, invalid ranges and unsafe or missing CTA', () => {
    for (const change of [
        { campaign: '' }, { campaign: '../escape' }, { campaign: 'launch&other=bad' },
        { count: 0 }, { count: 101 }, { count: 1.5 }, { count: NaN },
        { start: 0 }, { start: 999999 }, { prefix: 'a'.repeat(80) },
        { mode: 'custom', customIds: 'one\nONE' }, { mode: 'custom', customIds: '' },
        { mode: 'custom', customIds: 'café' }, { cta: ' ' }, { cta: 'a'.repeat(49) },
        { cta: 'Scan\nnow' }, { correction: 'L' },
    ]) assert.throws(() => buildStickerLinks({ ...draft, ...change } as StickerDraft), JSON.stringify(change))
})

for (const correction of ['M', 'Q'] as const) {
    test(`${correction} QR and sticker SVGs independently decode to the original URL`, async () => {
        const links = buildStickerLinks({ ...draft, correction })
        for (const link of links) {
            const asset = await generateSticker(link, draft.cta, correction)
            assert.equal(decodeSvg(asset.qrSvg), link.url)
            assert.equal(decodeSvg(asset.stickerSvg), link.url)
            assert.match(asset.qrSvg, /width="40mm" height="40mm"/)
            assert.match(asset.stickerSvg, /width="50mm" height="70mm"/)
            const modules = QRCode.create(link.url, { errorCorrectionLevel: correction }).modules.size
            assert.ok(asset.qrSvg.includes(`viewBox="0 0 ${modules + 8} ${modules + 8}"`), 'four-module quiet zone on every side')
        }
    })
}

test('longest accepted tracking values remain decodable', async () => {
    const [link] = buildStickerLinks({ ...draft, campaign: 'c'.repeat(80), mode: 'custom', customIds: 'i'.repeat(80) })
    const asset = await generateSticker(link, 'A'.repeat(48), 'Q')
    assert.equal(decodeSvg(asset.stickerSvg), link.url)
})

test('CTA markup is escaped in SVG and HTML; CSV neutralizes formula copy', async () => {
    const [link] = buildStickerLinks(draft)
    const asset = await generateSticker(link, '<script>alert("x")</script> & scan', 'Q')
    assert.ok(!asset.stickerSvg.includes('<script>'))
    assert.ok(asset.stickerSvg.includes('&lt;script&gt;'))
    assert.ok(!stickerPrintSheet([asset]).includes('<script>'))
    const csv = stickerManifest([link], '=HYPERLINK("bad")', 'Q')
    assert.ok(csv.includes('"\'=HYPERLINK(""bad"")"'))
    assert.ok(csv.includes(`"${link.url}"`))
})

test('bulk archive round-trips every SVG, manifest entry and print sheet', async () => {
    const assets = await Promise.all(buildStickerLinks(draft).map(link => generateSticker(link, draft.cta, draft.correction)))
    const files: Record<string, Uint8Array> = {}
    for (const asset of assets) {
        files[`qr/${asset.filename}.svg`] = strToU8(asset.qrSvg)
        files[`stickers/${asset.filename}.svg`] = strToU8(asset.stickerSvg)
    }
    files['tracking.csv'] = strToU8(stickerManifest(assets, draft.cta, draft.correction))
    files['print-stickers.html'] = strToU8(stickerPrintSheet(assets))
    const unpacked = unzipSync(zipSync(files))
    assert.equal(Object.keys(unpacked).length, assets.length * 2 + 2)
    for (const asset of assets) {
        assert.equal(strFromU8(unpacked[`qr/${asset.filename}.svg`]), asset.qrSvg)
        assert.ok(strFromU8(unpacked['tracking.csv']).includes(asset.filename))
    }
    assert.equal((strFromU8(unpacked['print-stickers.html']).match(/class="sticker"/g) ?? []).length, 3)
})
