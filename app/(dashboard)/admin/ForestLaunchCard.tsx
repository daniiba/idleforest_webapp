'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, Mail, Pause, Play, Send } from 'lucide-react'
import { getForestLaunchStatusAdmin, sendForestLaunchTestAdmin, setForestLaunchStatusAdmin } from './actions'

type Status = Awaited<ReturnType<typeof getForestLaunchStatusAdmin>>

const STATUS_LABEL: Record<string, string> = {
    draft: 'Not started',
    sending: 'Sending',
    paused: 'Paused',
    done: 'Done',
}

// Launch email: each active member gets their own forest and a one-tap invite.
// Sending runs in batches from the hourly referral job, so it can be paused.
export default function ForestLaunchCard() {
    const [status, setStatus] = useState<Status | null>(null)
    const [busy, setBusy] = useState(false)
    const [testTo, setTestTo] = useState('')
    const [testName, setTestName] = useState('')
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

    const refresh = useCallback(() => {
        getForestLaunchStatusAdmin().then(setStatus).catch(error => setMessage({ ok: false, text: error.message }))
    }, [])

    useEffect(() => { refresh() }, [refresh])

    const run = async (action: () => Promise<unknown>, success: string) => {
        setBusy(true)
        setMessage(null)
        try {
            const result = await action()
            if (result && typeof result === 'object' && 'status' in (result as Status)) setStatus(result as Status)
            setMessage({ ok: true, text: success })
        } catch (error) {
            setMessage({ ok: false, text: error instanceof Error ? error.message : 'Something went wrong' })
        } finally {
            setBusy(false)
        }
    }

    const sending = status?.status === 'sending'

    return (
        <section className="border-2 border-black bg-brand-gray p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="flex items-center gap-2 font-candu text-xl font-extrabold uppercase text-black">
                        <Mail className="h-5 w-5" /> Forest launch email
                    </h2>
                    <p className="mt-1 max-w-xl text-sm font-semibold text-neutral-700">
                        Every member with an active node gets their own forest and a one-tap invite. It goes out in batches every hour, and nobody gets it twice.
                    </p>
                </div>
                <span className={`border-2 border-black px-2 py-1 text-xs font-black uppercase ${sending ? 'bg-brand-yellow' : 'bg-transparent'}`}>
                    {status ? STATUS_LABEL[status.status] || status.status : '…'}
                </span>
            </div>

            <dl className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
                <div className="border-2 border-black p-3">
                    <dt className="text-[11px] font-black uppercase tracking-wider text-neutral-600">Sent</dt>
                    <dd className="font-candu text-3xl font-extrabold">{status ? status.sent.toLocaleString('en') : '…'}</dd>
                </div>
                <div className="border-2 border-black p-3">
                    <dt className="text-[11px] font-black uppercase tracking-wider text-neutral-600">Still to send</dt>
                    <dd className="font-candu text-3xl font-extrabold">{status ? status.remaining.toLocaleString('en') : '…'}</dd>
                </div>
            </dl>

            {status && !status.templateReady ? (
                <p className="mt-4 text-sm font-bold text-red-700">The template is missing. Run the migration 20261003_referral_engagement.sql first.</p>
            ) : null}

            <div className="mt-6 border-t-2 border-black/15 pt-5">
                <p className="text-sm font-black">1. Send yourself a test</p>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                        type="email"
                        value={testTo}
                        onChange={event => setTestTo(event.target.value)}
                        placeholder="Your email"
                        className="min-w-0 flex-1 border-2 border-black bg-white/70 px-3 py-2 text-sm font-semibold"
                    />
                    <input
                        value={testName}
                        onChange={event => setTestName(event.target.value)}
                        placeholder="Show the forest of (display name, optional)"
                        className="min-w-0 flex-1 border-2 border-black bg-white/70 px-3 py-2 text-sm font-semibold"
                    />
                    <button
                        type="button"
                        disabled={busy || !testTo}
                        onClick={() => run(() => sendForestLaunchTestAdmin(testTo, testName), `Test sent to ${testTo}.`)}
                        className="inline-flex items-center justify-center gap-2 border-2 border-black bg-brand-navy px-4 py-2 text-sm font-black uppercase text-white disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" /> Send test
                    </button>
                </div>
            </div>

            <div className="mt-5">
                <p className="text-sm font-black">2. Send it to everyone</p>
                <div className="mt-2 flex flex-wrap gap-2">
                    {sending ? (
                        <button
                            type="button"
                            disabled={busy}
                            onClick={() => run(() => setForestLaunchStatusAdmin('paused'), 'Paused. No more batches will go out.')}
                            className="inline-flex items-center gap-2 border-2 border-black px-4 py-2 text-sm font-black uppercase disabled:opacity-50"
                        >
                            <Pause className="h-4 w-4" /> Pause
                        </button>
                    ) : (
                        <button
                            type="button"
                            disabled={busy || !status?.templateReady || status?.status === 'done' || status?.remaining === 0}
                            onClick={() => {
                                if (!window.confirm(`Send the forest email to ${status?.remaining.toLocaleString('en')} members? It starts with the next hourly run.`)) return
                                run(() => setForestLaunchStatusAdmin('sending'), 'Started. The first batch goes out with the next hourly run.')
                            }}
                            className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-sm font-black uppercase disabled:opacity-50"
                        >
                            <Play className="h-4 w-4" /> {status?.status === 'paused' ? 'Resume sending' : 'Start sending'}
                        </button>
                    )}
                    <button type="button" onClick={refresh} className="border-2 border-black px-4 py-2 text-sm font-black uppercase">
                        Refresh
                    </button>
                </div>
            </div>

            {busy ? <Loader2 className="mt-4 h-5 w-5 animate-spin" /> : null}
            {message ? (
                <p className={`mt-4 text-sm font-bold ${message.ok ? 'text-green-800' : 'text-red-700'}`} role="status">{message.text}</p>
            ) : null}
        </section>
    )
}
