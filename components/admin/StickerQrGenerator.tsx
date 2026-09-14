'use client'

/* eslint-disable @next/next/no-img-element -- Preview a locally generated SVG data URL without an image optimization request. */

import { useEffect, useMemo, useState } from 'react'
import { Download, Loader2, QrCode } from 'lucide-react'
import { strToU8, zipSync } from 'fflate'
import { buildStickerLinks, DEFAULT_STICKER_CTA, generateSticker, MAX_STICKERS, stickerManifest, stickerPrintSheet, type StickerAsset, type StickerDraft } from '@/lib/sticker-qr'

const initialDraft: StickerDraft = {
    campaign: 'campus_launch', mode: 'numbered', prefix: 'pack', start: 1, count: 10,
    customIds: 'batch_a\nbatch_b', cta: DEFAULT_STICKER_CTA, correction: 'Q',
}
const inputClass = 'mt-2 w-full border-2 border-black bg-white px-3 py-2 text-sm font-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'
const buttonClass = 'inline-flex items-center justify-center gap-2 border-2 border-black px-4 py-2 text-sm font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-50'

function download(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
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
    const [assets, setAssets] = useState<StickerAsset[]>([])
    const [busy, setBusy] = useState(false)
    const [progress, setProgress] = useState(0)
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)

    const plan = useMemo(() => {
        try { return { links: buildStickerLinks(draft), error: '' } }
        catch (err) { return { links: [], error: err instanceof Error ? err.message : 'Check your campaign and IDs.' } }
    }, [draft])

    useEffect(() => {
        let cancelled = false
        setPreview(null)
        if (plan.links.length) {
            generateSticker(plan.links[0], draft.cta, draft.correction).then(asset => {
                if (!cancelled) setPreview(asset)
            }).catch(() => {
                if (!cancelled) setError('The preview could not be generated. Shorten the campaign or ID and try again.')
            })
        }
        return () => { cancelled = true }
    }, [plan, draft.cta, draft.correction])

    function update<K extends keyof StickerDraft>(key: K, value: StickerDraft[K]) {
        setDraft(current => ({ ...current, [key]: value }))
        setAssets([])
        setSelectedIndex(0)
        setError('')
        setNotice('')
    }

    async function generateBatch() {
        if (plan.error || busy) return
        setBusy(true)
        setError('')
        setNotice('')
        setProgress(0)
        setAssets([])
        try {
            const generated: StickerAsset[] = []
            for (const link of plan.links) {
                generated.push(await generateSticker(link, draft.cta, draft.correction))
                setProgress(generated.length)
                // Yield between codes so batch progress remains responsive.
                await new Promise(resolve => window.setTimeout(resolve, 0))
            }
            setAssets(generated)
            setSelectedIndex(0)
            setNotice(`${generated.length} ${generated.length === 1 ? 'code is' : 'codes are'} ready to download.`)
        } catch {
            setError('The batch could not be generated. Shorten the campaign or IDs and try again.')
        } finally { setBusy(false) }
    }

    async function downloadZip() {
        setBusy(true)
        setError('')
        setNotice('Preparing ZIP…')
        try {
            await new Promise(resolve => window.setTimeout(resolve, 0))
            const files: Record<string, Uint8Array> = {}
            for (const asset of assets) {
                files[`qr/${asset.filename}.svg`] = strToU8(asset.qrSvg)
                files[`stickers/${asset.filename}.svg`] = strToU8(asset.stickerSvg)
            }
            files['tracking.csv'] = strToU8(stickerManifest(assets, draft.cta, draft.correction))
            files['print-stickers.html'] = strToU8(stickerPrintSheet(assets))
            const zipped = zipSync(files, { level: 6 })
            download(new Blob([new Uint8Array(zipped)], { type: 'application/zip' }), `${assets[0].campaign}_stickers.zip`)
            setNotice('ZIP downloaded. It includes QR SVGs, sticker SVGs, tracking.csv and an A4 print sheet.')
        } catch { setError('The ZIP could not be created. Try a smaller batch or download individual SVGs.') }
        finally { setBusy(false) }
    }

    const selected = assets[selectedIndex] ?? preview
    const svgUrl = selected ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(selected.stickerSvg)}` : undefined

    return (
        <section className="space-y-6 text-black" aria-labelledby="sticker-heading">
            <div className="border-2 border-black bg-white p-6">
                <div className="flex items-center gap-3"><QrCode className="h-7 w-7" /><h2 id="sticker-heading" className="font-candu text-3xl font-extrabold uppercase">QR stickers</h2></div>
                <p className="mt-2 max-w-3xl text-sm text-neutral-600">Create tracked stickers for campus packs, café drops and every place your forest grows. Each code opens idleforest.com with its campaign and batch ID.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
                <form onSubmit={event => { event.preventDefault(); void generateBatch() }} className="min-w-0 border-2 border-black bg-white p-6">
                    <fieldset disabled={busy} className="space-y-5 disabled:opacity-60">
                        <legend className="mb-4 text-lg font-extrabold">Campaign & distribution</legend>
                        <label className="block text-sm font-bold" htmlFor="qr-campaign">Campaign name
                            <input id="qr-campaign" className={inputClass} value={draft.campaign} onChange={event => update('campaign', event.target.value)} maxLength={80} required aria-describedby="qr-tracking-help" />
                        </label>
                        <p id="qr-tracking-help" className="text-xs text-neutral-600">Use letters, numbers, underscores or hyphens. Source is always <strong>sticker</strong>; medium is <strong>offline</strong>.</p>
                        <label className="block text-sm font-bold" htmlFor="qr-mode">Batch / sticker IDs
                            <select id="qr-mode" className={inputClass} value={draft.mode} onChange={event => update('mode', event.target.value as StickerDraft['mode'])}>
                                <option value="numbered">Numbered sequence</option><option value="custom">Custom IDs, one per line</option>
                            </select>
                        </label>
                        {draft.mode === 'numbered' ? <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <label className="col-span-2 text-sm font-bold sm:col-span-1" htmlFor="qr-prefix">ID prefix<input id="qr-prefix" className={inputClass} value={draft.prefix} onChange={event => update('prefix', event.target.value)} maxLength={73} required /></label>
                            <label className="text-sm font-bold" htmlFor="qr-start">Start number<input id="qr-start" type="number" min={1} max={999999} step={1} className={inputClass} value={Number.isNaN(draft.start) ? '' : draft.start} onChange={event => update('start', event.target.valueAsNumber)} required /></label>
                            <label className="text-sm font-bold" htmlFor="qr-count">Number of codes<input id="qr-count" type="number" min={1} max={MAX_STICKERS} step={1} className={inputClass} value={Number.isNaN(draft.count) ? '' : draft.count} onChange={event => update('count', event.target.valueAsNumber)} required /></label>
                        </div> : <label className="block text-sm font-bold" htmlFor="qr-ids">Custom IDs<textarea id="qr-ids" rows={5} maxLength={8100} className={`${inputClass} font-mono`} value={draft.customIds} onChange={event => update('customIds', event.target.value)} required /><span className="mt-1 block text-xs font-normal text-neutral-600">Paste up to {MAX_STICKERS} IDs from a spreadsheet column. Each ID must be unique.</span></label>}
                        <label className="block text-sm font-bold" htmlFor="qr-cta">Sticker call to action<input id="qr-cta" className={inputClass} value={draft.cta} onChange={event => update('cta', event.target.value)} maxLength={48} required /></label>
                        <label className="block text-sm font-bold" htmlFor="qr-correction">Error correction<select id="qr-correction" className={inputClass} value={draft.correction} onChange={event => update('correction', event.target.value as StickerDraft['correction'])}><option value="Q">Q · 25% recovery</option><option value="M">M · 15% recovery</option></select></label>
                        <p className="text-xs text-neutral-600">Reuse an ID for a distribution batch, or give each sticker its own ID. Choose a new campaign or start number for later runs to keep tracking distinct.</p>
                        {plan.error && <p role="alert" className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800">{plan.error}</p>}
                        <button type="submit" disabled={Boolean(plan.error) || busy} className={`${buttonClass} w-full bg-brand-yellow py-3`}>
                            {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Working…</> : <><QrCode className="h-4 w-4" /> Generate {plan.links.length || ''} {plan.links.length === 1 ? 'code' : 'codes'}</>}
                        </button>
                    </fieldset>
                </form>

                <div className="min-w-0 border-2 border-black bg-neutral-100 p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2"><h3 className="text-lg font-extrabold">Sticker preview</h3><span className="font-mono text-xs text-neutral-600">50 × 70 mm · SVG</span></div>
                    <div className="my-6 flex min-h-[350px] items-center justify-center">
                        {svgUrl ? <img src={svgUrl} alt={`Sticker for ${selected?.content}: ${draft.cta}`} width={250} height={350} className="h-auto w-[250px] max-w-full border border-neutral-300 bg-white shadow-[6px_6px_0_0_#D9D9D9]" /> : <p className="max-w-xs text-center text-sm text-neutral-500">{plan.error ? 'Complete the campaign and sticker details to preview your code.' : 'Generating preview…'}</p>}
                    </div>
                    {selected && <div className="space-y-2"><p className="text-xs font-bold uppercase">Encoded destination</p><p className="break-all border border-neutral-300 bg-white p-3 font-mono text-xs leading-5" data-testid="qr-destination">{selected.url}</p></div>}
                    <p className="mt-4 text-xs leading-5 text-neutral-600">Vector artwork stays sharp at any resolution. QR codes are 40 × 40 mm with a white quiet zone. Keep that border clear and scan a printed sample before a full run.</p>
                </div>
            </div>

            <div aria-live="polite" role="status" className="text-sm">{busy && progress > 0 && !assets.length ? `${progress} / ${plan.links.length} codes generated…` : notice}</div>
            {error && <p role="alert" className="border-2 border-red-600 bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {assets.length > 0 && <div className="space-y-5 border-2 border-black bg-white p-6">
                <div className="flex flex-wrap items-center justify-between gap-4"><div><h3 className="text-xl font-extrabold">Your batch is ready</h3><p className="mt-1 text-sm text-neutral-600">{assets.length} unique codes · {assets[0].campaign}</p></div><button type="button" disabled={busy} onClick={() => void downloadZip()} className={`${buttonClass} bg-brand-yellow`}><Download className="h-4 w-4" /> Download all (ZIP)</button></div>
                <div className="flex flex-wrap items-end gap-3">
                    <label htmlFor="qr-selected" className="min-w-0 flex-1 text-sm font-bold">Preview / download a code<select id="qr-selected" className={inputClass} value={selectedIndex} onChange={event => setSelectedIndex(Number(event.target.value))}>{assets.map((asset, index) => <option key={asset.content} value={index}>{asset.content}</option>)}</select></label>
                    <button type="button" disabled={busy} className={`${buttonClass} bg-white`} onClick={() => download(new Blob([assets[selectedIndex].qrSvg], { type: 'image/svg+xml' }), `${assets[selectedIndex].filename}_qr.svg`)}>QR SVG</button>
                    <button type="button" disabled={busy} className={`${buttonClass} bg-white`} onClick={() => download(new Blob([assets[selectedIndex].stickerSvg], { type: 'image/svg+xml' }), `${assets[selectedIndex].filename}_sticker.svg`)}>Sticker SVG</button>
                </div>
                <p className="text-xs leading-5 text-neutral-600">The ZIP includes all SVGs, a tracking CSV and an A4 print sheet. Open print-stickers.html and print at actual size. Codes are generated in your browser; download this batch before leaving the tab. In analytics, filter source = sticker and medium = offline, then group by campaign and content. Scans count when someone opens the link and the visit is recorded.</p>
            </div>}
        </section>
    )
}
