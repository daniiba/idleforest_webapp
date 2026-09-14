import QRCode from 'qrcode'

export const DEFAULT_STICKER_CTA = 'Scan to grow your tree'
export const STICKER_CORRECTION = 'Q'
export type StickerDraft = {
    destination: string
    campaign: string
    content: string
    cta: string
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

function validateCta(cta: string) {
    if (!cta.trim() || Array.from(cta.trim()).length > 48 || /[\u0000-\u001f\u007f-\u009f]/.test(cta)) {
        throw new Error('Enter a call to action of 1–48 characters on one line.')
    }
}

export function buildStickerLink(draft: StickerDraft): StickerLink {
    const campaign = trackingName(draft.campaign, 'Campaign')
    const content = draft.content.trim() ? trackingName(draft.content, 'Distribution label') : ''
    validateCta(draft.cta)
    let url: URL
    try { url = new URL(draft.destination.trim()) }
    catch { throw new Error('Enter a complete destination URL starting with https:// or http://.') }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) {
        throw new Error('Use an http:// or https:// destination without a username or password.')
    }
    // Preserve the destination path, unrelated query parameters and fragment.
    url.searchParams.set('utm_source', 'sticker')
    url.searchParams.set('utm_medium', 'offline')
    url.searchParams.set('utm_campaign', campaign)
    if (content) url.searchParams.set('utm_content', content)
    else url.searchParams.delete('utm_content')
    if (url.toString().length > 500) throw new Error('Keep the destination and tracking parameters within 500 characters for a readable printed code.')
    return { campaign, content, url: url.toString(), filename: content ? `${campaign}_${content}` : campaign }
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

export async function generateSticker(link: StickerLink, cta: string, logoDataUrl: string): Promise<StickerAsset> {
    validateCta(cta)
    if (!/^data:image\/png;base64,[a-zA-Z0-9+/]+=*$/.test(logoDataUrl)) {
        throw new Error('The IdleForest logo could not be loaded. Please try again.')
    }
    const svg = await QRCode.toString(link.url, {
        type: 'svg', errorCorrectionLevel: STICKER_CORRECTION, margin: 4,
        color: { dark: '#000000ff', light: '#ffffffff' },
    })
    const size = Number(svg.match(/viewBox="0 0 (\d+) (\d+)"/)?.[1])
    if (!Number.isFinite(size)) throw new Error('The QR code could not be rendered.')
    // A small, wide logo covers less than 5% of the symbol. The four-module quiet
    // zone is untouched. Embed the PNG so downloaded SVGs need no network access.
    const logoWidth = (size - 8) * 0.3
    const logoHeight = logoWidth * 281 / 1024
    const x = (size - logoWidth) / 2
    const y = (size - logoHeight) / 2
    const logo = `<g data-logo="idleforest"><rect x="${x - 1}" y="${y - 1}" width="${logoWidth + 2}" height="${logoHeight + 2}" rx="0.5" fill="#fff"/><image x="${x}" y="${y}" width="${logoWidth}" height="${logoHeight}" href="${logoDataUrl}"/></g>`
    const brandedSvg = svg.replace('</svg>', `${logo}</svg>`)
    const qrSvg = brandedSvg.replace('<svg ', '<svg width="40mm" height="40mm" ')
    const embeddedQr = brandedSvg.replace('<svg ', '<svg x="5" y="10" width="40" height="40" ')
    const host = new URL(link.url).hostname
    const lines = wrapCta(cta)
    const stickerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="50mm" height="70mm" viewBox="0 0 50 70">
<title>${escapeXml(cta)} — ${escapeXml(link.campaign)}</title>
<rect width="50" height="70" fill="#fff"/>
<g fill="#000" font-family="Arial, Helvetica, sans-serif" text-anchor="middle">
<text x="25" y="6.5" font-size="${Math.min(3.3, 68 / host.length)}" font-weight="700">${escapeXml(host)}</text>
${embeddedQr}
${lines.map((line, index) => `<text x="25" y="${55 + index * 4.4}" font-size="3.1" font-weight="700">${escapeXml(line)}</text>`).join('\n')}
</g></svg>`
    return { ...link, qrSvg, stickerSvg }
}
