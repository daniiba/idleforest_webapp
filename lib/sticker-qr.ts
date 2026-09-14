import QRCode from 'qrcode'

export const MAX_STICKERS = 100
export const DEFAULT_STICKER_CTA = 'Scan to grow your tree'
export type StickerCorrection = 'M' | 'Q'
export type StickerDraft = {
    campaign: string
    mode: 'numbered' | 'custom'
    prefix: string
    start: number
    count: number
    customIds: string
    cta: string
    correction: StickerCorrection
}
export type StickerLink = { campaign: string; content: string; url: string; filename: string }
export type StickerAsset = StickerLink & { qrSvg: string; stickerSvg: string }

function trackingName(value: string, label: string) {
    const name = value.trim()
    if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(name)) {
        throw new Error(`${label} must be 1–80 letters, numbers, underscores or hyphens, starting with a letter or number.`)
    }
    return name
}

export function validateStickerDesign(cta: string, correction: StickerCorrection) {
    if (!cta.trim() || Array.from(cta.trim()).length > 48 || /[\u0000-\u001f\u007f-\u009f]/.test(cta)) {
        throw new Error('Enter a call to action of 1–48 characters on one line.')
    }
    if (correction !== 'M' && correction !== 'Q') throw new Error('Choose error correction M or Q.')
}

export function buildStickerLinks(draft: StickerDraft): StickerLink[] {
    const campaign = trackingName(draft.campaign, 'Campaign')
    validateStickerDesign(draft.cta, draft.correction)
    let ids: string[]
    if (draft.mode === 'numbered') {
        const prefix = trackingName(draft.prefix, 'ID prefix')
        if (!Number.isInteger(draft.count) || draft.count < 1 || draft.count > MAX_STICKERS) {
            throw new Error(`Choose between 1 and ${MAX_STICKERS} codes per batch.`)
        }
        if (!Number.isInteger(draft.start) || draft.start < 1 || draft.start + draft.count - 1 > 999999) {
            throw new Error('Start numbers must be positive, and the last ID cannot exceed 999999.')
        }
        ids = Array.from({ length: draft.count }, (_, index) => `${prefix}_${String(draft.start + index).padStart(2, '0')}`)
    } else if (draft.mode === 'custom') {
        ids = draft.customIds.split(/\r?\n/).map(id => id.trim()).filter(Boolean)
        if (!ids.length || ids.length > MAX_STICKERS) throw new Error(`Enter 1–${MAX_STICKERS} IDs, one per line.`)
    } else {
        throw new Error('Choose numbered or custom IDs.')
    }
    ids = ids.map(id => trackingName(id, 'Batch / sticker ID'))
    if (new Set(ids.map(id => id.toLowerCase())).size !== ids.length) {
        throw new Error('Each ID must be unique in this batch (including capitalization).')
    }
    return ids.map((content, index) => {
        const url = new URL('https://idleforest.com/')
        url.search = new URLSearchParams({ utm_source: 'sticker', utm_medium: 'offline', utm_campaign: campaign, utm_content: content }).toString()
        return { campaign, content, url: url.toString(), filename: `${String(index + 1).padStart(3, '0')}_${campaign}_${content}` }
    })
}

function escapeXml(value: string) {
    return value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[char]!)
}

function wrapCta(value: string) {
    const lines: string[] = []
    let remaining = Array.from(value.trim())
    while (remaining.length) {
        let end = Math.min(22, remaining.length)
        if (remaining.length > 22) {
            const space = remaining.slice(0, 23).lastIndexOf(' ')
            if (space >= 10) end = space
        }
        lines.push(remaining.slice(0, end).join(''))
        remaining = Array.from(remaining.slice(end).join('').trimStart())
    }
    return lines
}

export async function generateSticker(link: StickerLink, cta: string, correction: StickerCorrection): Promise<StickerAsset> {
    validateStickerDesign(cta, correction)
    const svg = await QRCode.toString(link.url, {
        type: 'svg', errorCorrectionLevel: correction, margin: 4,
        color: { dark: '#000000ff', light: '#ffffffff' },
    })
    // Preserve the renderer's viewBox and quiet zone; dimensions are physical print sizes.
    const qrSvg = svg.replace('<svg ', '<svg width="40mm" height="40mm" ')
    const embeddedQr = svg.replace('<svg ', '<svg x="5" y="10" width="40" height="40" ')
    const lines = wrapCta(cta)
    const stickerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="50mm" height="70mm" viewBox="0 0 50 70">
<title>${escapeXml(cta)} — ${escapeXml(link.content)}</title>
<rect width="50" height="70" fill="#fff"/>
<g fill="#000" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
<text x="25" y="6.5" font-size="3.3" font-weight="700">idleforest.com</text>
${embeddedQr}
${lines.map((line, index) => `<text x="25" y="${55 + index * 4.4}" font-size="3.1" font-weight="700">${escapeXml(line)}</text>`).join('\n')}
<text x="25" y="67.5" font-size="${Math.min(1.8, 68 / link.content.length)}">${escapeXml(link.content)}</text>
</g></svg>`
    return { ...link, qrSvg, stickerSvg }
}

export function stickerManifest(links: StickerLink[], cta: string, correction: StickerCorrection) {
    // Quote every field and neutralize spreadsheet formulas in user-entered copy.
    const cell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" + value : value).replace(/"/g, '""')}"`
    const header = ['qr_file', 'sticker_file', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'url', 'cta', 'error_correction']
    const rows = links.map(link => [`qr/${link.filename}.svg`, `stickers/${link.filename}.svg`, 'sticker', 'offline', link.campaign, link.content, link.url, cta.trim(), correction])
    return [header, ...rows].map(row => row.map(cell).join(',')).join('\r\n') + '\r\n'
}

export function stickerPrintSheet(assets: StickerAsset[]) {
    return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>IdleForest QR stickers</title>
<style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{margin:0;font-family:Arial,sans-serif;color:#000;background:#fff}.instructions{margin:0 0 8mm;max-width:180mm;font-size:14px}.sheet{display:grid;grid-template-columns:repeat(3,50mm);gap:5mm;align-items:start}.sticker{width:50mm;height:70mm;outline:0.2mm dashed #aaa;break-inside:avoid;page-break-inside:avoid}.sticker svg{display:block;width:50mm;height:70mm}@media print{.instructions{display:none}.sheet{display:block}.sticker{display:inline-block;vertical-align:top;margin:0 5mm 5mm 0}}</style></head>
<body><p class="instructions">Print on A4 at 100% / actual size. Disable browser headers and footers. Each sticker is 50 × 70 mm. Cut along the guides. Scan a printed sample before printing the full batch.</p><main class="sheet">${assets.map(asset => `<div class="sticker">${asset.stickerSvg}</div>`).join('')}</main></body></html>`
}
