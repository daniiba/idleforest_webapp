'use client'

/* eslint-disable @next/next/no-img-element -- Preview a locally generated SVG data URL without an image optimization request. */

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, QrCode } from 'lucide-react'
import { buildStickerLink, DEFAULT_STICKER_CTA, generateSticker, type StickerAsset, type StickerDraft } from '@/lib/sticker-qr'

const initialDraft: StickerDraft = {
    destination: 'https://idleforest.com/', campaign: 'campus_launch', content: '', cta: DEFAULT_STICKER_CTA,
}
const inputClass = 'mt-2 w-full border-2 border-black bg-white px-3 py-2 text-sm font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
const buttonClass = 'inline-flex items-center justify-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50'

let logoPromise: Promise<string> | undefined
function loadLogo() {
    if (!logoPromise) {
        logoPromise = fetch('/logo.png').then(async response => {
            if (!response.ok) throw new Error('Logo request failed')
            const blob = new Blob([await response.arrayBuffer()], { type: 'image/png' })
            return new Promise<string>((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(String(reader.result))
                reader.onerror = () => reject(new Error('Logo could not be read'))
                reader.readAsDataURL(blob)
            })
        }).catch(error => { logoPromise = undefined; throw error })
    }
    return logoPromise
}

function download(svg: string, filename: string) {
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function StickerQrGenerator() {
    const [draft, setDraft] = useState<StickerDraft>(initialDraft)
    const [preview, setPreview] = useState<StickerAsset | null>(null)
    const [created, setCreated] = useState(false)
    const [error, setError] = useState('')
    const [retry, setRetry] = useState(0)

    const plan = useMemo(() => {
        try { return { link: buildStickerLink(draft), error: '' } }
        catch (err) { return { link: null, error: err instanceof Error ? err.message : 'Check the destination and campaign details.' } }
    }, [draft])

    useEffect(() => {
        let cancelled = false
        setPreview(null)
        setError('')
        if (plan.link) {
            const link = plan.link
            loadLogo().then(logo => generateSticker(link, draft.cta, logo)).then(asset => {
                if (!cancelled) setPreview(asset)
            }).catch(() => {
                if (!cancelled) setError('The QR code or logo could not be loaded. Check your connection and retry.')
            })
        }
        return () => { cancelled = true }
    }, [plan, draft.cta, retry])

    function update(key: keyof StickerDraft, value: string) {
        setDraft(current => ({ ...current, [key]: value }))
        setPreview(null)
        setCreated(false)
        setError('')
    }

    const svgUrl = preview ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(preview.stickerSvg)}` : undefined

    return (
        <section className="space-y-6 text-black" aria-labelledby="sticker-heading">
            <div className="border-2 border-black bg-white p-6">
                <div className="flex items-center gap-3"><QrCode className="h-7 w-7" /><h2 id="sticker-heading" className="font-candu text-3xl font-extrabold uppercase">QR stickers</h2></div>
                <p className="mt-2 max-w-3xl text-sm text-neutral-600">Create one QR code with the IdleForest logo and your chosen destination. Print the same code on as many stickers as you need.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <form onSubmit={event => { event.preventDefault(); if (preview) setCreated(true) }} className="min-w-0 space-y-5 border-2 border-black bg-white p-6">
                    <h3 className="text-lg font-extrabold">Your QR code</h3>
                    <label className="block text-sm font-bold" htmlFor="qr-destination-input">Destination URL
                        <input id="qr-destination-input" type="url" className={inputClass} value={draft.destination} onChange={event => update('destination', event.target.value)} maxLength={500} placeholder="https://idleforest.com/" required aria-describedby="qr-url-help" />
                    </label>
                    <p id="qr-url-help" className="text-xs leading-5 text-neutral-600">Choose the page people should open. Editing this URL creates a new QR code; previously printed codes keep their original destination.</p>
                    <label className="block text-sm font-bold" htmlFor="qr-campaign">Campaign name
                        <input id="qr-campaign" className={inputClass} value={draft.campaign} onChange={event => update('campaign', event.target.value)} maxLength={80} required aria-describedby="qr-tracking-help" />
                    </label>
                    <label className="block text-sm font-bold" htmlFor="qr-content">Distribution label <span className="font-normal text-neutral-500">(optional)</span>
                        <input id="qr-content" className={inputClass} value={draft.content} onChange={event => update('content', event.target.value)} maxLength={80} placeholder="e.g. cafe_drop" aria-describedby="qr-tracking-help" />
                    </label>
                    <p id="qr-tracking-help" className="text-xs leading-5 text-neutral-600">Use letters, numbers, underscores or hyphens for tracking names. Source is <strong>sticker</strong> and medium is <strong>offline</strong>. All copies of this code share the same tracking.</p>
                    <label className="block text-sm font-bold" htmlFor="qr-cta">Sticker call to action<input id="qr-cta" className={inputClass} value={draft.cta} onChange={event => update('cta', event.target.value)} maxLength={48} required /></label>
                    {plan.error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">{plan.error}</p>}
                    {error && <div role="alert" className="space-y-2 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800"><p>{error}</p><button type="button" className="font-bold underline" onClick={() => setRetry(value => value + 1)}>Retry preview</button></div>}
                    <button type="submit" disabled={!preview} className={`${buttonClass} w-full bg-brand-yellow py-3`}>
                        {!preview && !plan.error && !error ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing preview…</> : <><QrCode className="h-4 w-4" /> Create QR code</>}
                    </button>
                </form>

                <div className="min-w-0 border-2 border-black bg-neutral-100 p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-extrabold">Sticker preview</h3><span className="font-mono text-xs text-neutral-600">50 × 70 mm · SVG</span></div>
                    <div className="my-6 flex min-h-[350px] items-center justify-center">
                        {svgUrl ? <img src={svgUrl} alt={`Sticker with the IdleForest logo: ${draft.cta}`} width={250} height={350} className="h-auto w-[250px] max-w-full border border-neutral-300 bg-white shadow-[6px_6px_0_0_#D9D9D9]" /> : <p className="max-w-xs text-center text-sm text-neutral-500">{plan.error || error ? 'Complete the details or retry to preview your code.' : 'Generating preview…'}</p>}
                    </div>
                    {plan.link && <div className="space-y-2"><p className="text-xs font-bold uppercase">Encoded destination</p><p className="break-all border border-neutral-300 bg-white p-3 font-mono text-xs leading-5" data-testid="qr-destination">{plan.link.url}</p></div>}
                    <p className="mt-4 text-xs leading-5 text-neutral-600">The logo is embedded in both downloads. The QR is 40 × 40 mm with Q error correction and a clear white border. Scan a printed sample before printing more copies.</p>
                </div>
            </div>

            <div aria-live="polite" role="status" className="text-sm">{created && preview ? 'Your QR code is ready. Use the same artwork for every sticker.' : ''}</div>
            {created && preview && <div className="space-y-4 border-2 border-black bg-white p-6">
                <h3 className="text-xl font-extrabold">Download your QR code</h3>
                <div className="flex flex-wrap gap-3">
                    <button type="button" className={`${buttonClass} bg-brand-yellow`} onClick={() => download(preview.qrSvg, `${preview.filename}_qr.svg`)}><Download className="h-4 w-4" /> Download QR SVG</button>
                    <button type="button" className={`${buttonClass} bg-white`} onClick={() => download(preview.stickerSvg, `${preview.filename}_sticker.svg`)}><Download className="h-4 w-4" /> Download sticker SVG</button>
                </div>
                <p className="text-xs leading-5 text-neutral-600">Both files contain the same code. The sticker includes your call to action. Download the artwork before leaving this tab.</p>
            </div>}
        </section>
    )
}
