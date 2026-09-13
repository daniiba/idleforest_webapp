'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Mail } from 'lucide-react'

export default function DesktopSetupEmail({ companySlug, locale }: { companySlug: string; locale: string }) {
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
    const [message, setMessage] = useState('')

    async function sendLink() {
        setState('sending')
        setMessage('')
        try {
            const response = await fetch('/api/desktop-setup-link', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ companySlug, locale }),
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.error || 'Could not send the link. Please try again.')
            setState('sent')
            setMessage('Setup link sent to your account email. Open it on your computer and log in with this same account.')
        } catch (error) {
            setState('error')
            setMessage(error instanceof Error ? error.message : 'Could not send the link. Please try again.')
        }
    }

    return (
        <div className="space-y-3">
            <button type="button" onClick={sendLink} disabled={state === 'sending' || state === 'sent'}
                className="flex w-full items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-4 font-bold text-black hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 disabled:opacity-70">
                {state === 'sending' ? <Loader2 className="h-5 w-5 animate-spin" /> : state === 'sent' ? <CheckCircle2 className="h-5 w-5" /> : <Mail className="h-5 w-5" />}
                {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Setup link sent' : 'Email me a computer setup link'}
            </button>
            {message && <p role={state === 'error' ? 'alert' : 'status'} className={`text-sm ${state === 'error' ? 'text-red-700' : 'text-neutral-700'}`}>{message}</p>}
            <p className="text-xs text-neutral-600">One requested setup email. Your community stays linked when you log in.</p>
        </div>
    )
}
