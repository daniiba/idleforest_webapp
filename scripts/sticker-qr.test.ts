import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { Resvg } from '@resvg/resvg-js'
import jsQR from 'jsqr'
import QRCode from 'qrcode'
import { buildStickerLink, generateSticker, STICKER_CORRECTION, type StickerDraft } from '../lib/sticker-qr'

const logo = `data:image/png;base64,${readFileSync(new URL('../public/logo.png', import.meta.url)).toString('base64')}`
const draft: StickerDraft = {
    destination: 'https://idleforest.com/', campaign: 'campus_launch', content: '', cta: 'Scan to grow your tree',
}

function decodeSvg(svg: string, width = 1000) {
    const rendered = new Resvg(svg, { fitTo: { mode: 'width', value: width } }).render()
    return jsQR(new Uint8ClampedArray(rendered.pixels), rendered.width, rendered.height)?.data
}

test('one creation returns one reusable QR link without a per-sticker ID', () => {
    const link = buildStickerLink(draft)
    assert.equal(Array.isArray(link), false)
    assert.equal(link.url, 'https://idleforest.com/?utm_source=sticker&utm_medium=offline&utm_campaign=campus_launch')
    assert.equal(link.content, '')
    assert.equal(link.filename, 'campus_launch')
    assert.deepEqual(buildStickerLink(draft), link)
})

test('editable destinations preserve paths, existing parameters and fragments', () => {
    const link = buildStickerLink({ ...draft, destination: 'https://example.com/grow?lang=pt&utm_campaign=old&utm_source=old&utm_source=duplicate&utm_content=old#start', content: ' cafe_drop ' })
    const url = new URL(link.url)
    assert.equal(url.origin, 'https://example.com')
    assert.equal(url.pathname, '/grow')
    assert.equal(url.hash, '#start')
    assert.equal(url.searchParams.get('lang'), 'pt')
    assert.equal(url.searchParams.get('utm_campaign'), 'campus_launch')
    assert.deepEqual(url.searchParams.getAll('utm_source'), ['sticker'])
    assert.equal(url.searchParams.get('utm_content'), 'cafe_drop')
    assert.equal(new URL(buildStickerLink({ ...draft, destination: link.url }).url).searchParams.has('utm_content'), false)
    assert.notEqual(buildStickerLink({ ...draft, destination: 'https://example.com/another' }).url, link.url)
})

test('reject invalid destinations, oversized codes and invalid tracking or CTA', () => {
    for (const change of [
        { destination: '' }, { destination: '/relative' }, { destination: 'javascript:alert(1)' },
        { destination: 'ftp://example.com' }, { destination: 'https://user:secret@example.com' },
        { destination: `https://example.com/${'x'.repeat(500)}` },
        { campaign: '' }, { campaign: '../escape' }, { campaign: 'launch&other=bad' },
        { campaign: 'c'.repeat(81) }, { content: '../escape' },
        { cta: ' ' }, { cta: 'a'.repeat(49) }, { cta: 'Scan\nnow' },
    ]) assert.throws(() => buildStickerLink({ ...draft, ...change }), JSON.stringify(change))
})

test('QR and sticker exports embed the actual centered logo and decode at print resolution', async () => {
    const link = buildStickerLink(draft)
    const asset = await generateSticker(link, draft.cta, logo)
    for (const svg of [asset.qrSvg, asset.stickerSvg]) {
        assert.ok(svg.includes(`href="${logo}"`), 'the actual logo is embedded, without external requests')
        assert.ok(svg.includes('data-logo="idleforest"'))
        assert.equal(decodeSvg(svg), link.url)
    }
    assert.equal(decodeSvg(asset.qrSvg, 473), link.url, '40 mm QR at 300 DPI')
    assert.equal(decodeSvg(asset.stickerSvg, 591), link.url, '50 mm sticker at 300 DPI')
    assert.match(asset.qrSvg, /width="40mm" height="40mm"/)
    assert.match(asset.stickerSvg, /width="50mm" height="70mm"/)
    const size = QRCode.create(link.url, { errorCorrectionLevel: STICKER_CORRECTION }).modules.size + 8
    assert.ok(asset.qrSvg.includes(`viewBox="0 0 ${size} ${size}"`), 'quiet zone remains four modules')
    const image = asset.qrSvg.match(/<image x="([^"]+)" y="([^"]+)" width="([^"]+)" height="([^"]+)"/)
    assert.ok(image)
    assert.ok(Math.abs(Number(image[1]) + Number(image[3]) / 2 - size / 2) < 0.000001)
    assert.ok(Math.abs(Number(image[2]) + Number(image[4]) / 2 - size / 2) < 0.000001)
})

test('logo remains scannable across different URLs, campaigns and QR sizes', async () => {
    for (const length of [0, 10, 35, 80, 150, 250, 350, 400]) {
        const link = buildStickerLink({ ...draft, destination: `https://example.com/${'x'.repeat(length)}`, campaign: `test_${length}` })
        const asset = await generateSticker(link, draft.cta, logo)
        assert.equal(decodeSvg(asset.qrSvg, 473), link.url, `300 DPI, path length ${length}`)
        assert.equal(decodeSvg(asset.stickerSvg, 591), link.url, `sticker, path length ${length}`)
    }
})

test('CTA markup is escaped and sticker heading reflects the chosen host', async () => {
    const link = buildStickerLink({ ...draft, destination: 'https://example.com' })
    const asset = await generateSticker(link, '<script>alert("x")</script> & scan', logo)
    assert.ok(!asset.stickerSvg.includes('<script>'))
    assert.ok(asset.stickerSvg.includes('&lt;script&gt;'))
    assert.ok(asset.stickerSvg.includes('>example.com</text>'))
    assert.ok(!asset.stickerSvg.includes('>idleforest.com</text>'))
    await assert.rejects(() => generateSticker(link, draft.cta, 'https://example.com/logo.png'))
})
