'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, Linkedin, MessageCircle, Share2, Twitter } from 'lucide-react'

type Props = {
    // The public page being shared, without any personal parameters.
    url: string
    text: string
    signedIn: boolean
    // Set when the viewer belongs to this team: the link they share is their
    // own team invite, so people who join are credited to them.
    teamId?: string
    inviteCode?: string | null
    labels: {
        share: string
        copyLink: string
        copied: string
        shareOnWhatsapp: string
        shareOnX: string
        shareOnLinkedin: string
    }
}

type Channel = 'copy' | 'whatsapp' | 'native_share' | 'x' | 'linkedin'

const iconLink =
    'flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-black hover:text-black'

// Tells which button a signup came from, so channels can be compared.
function withChannel(url: string, channel: Channel) {
    const parsed = new URL(url)
    parsed.searchParams.set('channel', channel)
    return parsed.toString()
}

export default function ShareActions({ url, text, signedIn, teamId, inviteCode, labels }: Props) {
    const [copied, setCopied] = useState(false)
    const [canNativeShare, setCanNativeShare] = useState(false)
    const [shareUrl, setShareUrl] = useState(url)
    const referralCode = useRef<string | null>(null)

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    }, [])

    // Signed-in members share their own link so the people they bring are credited
    // to them (and earn the welcome tree). Anyone else shares the plain page.
    useEffect(() => {
        if (!signedIn) return
        let cancelled = false

        async function personalise() {
            try {
                if (teamId) {
                    let code = inviteCode || null
                    if (!code) {
                        const response = await fetch('/api/teams/invite', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ teamId }),
                        })
                        if (response.ok) code = (await response.json()).invite?.invite_code || null
                    }
                    if (code && !cancelled) setShareUrl(`${new URL(url).origin}/invite/${code}`)
                    return
                }

                let summary = await fetch('/api/referrals/me').then(response => (response.ok ? response.json() : null))
                if (summary && !summary.code) {
                    summary = await fetch('/api/referrals/me', { method: 'POST' }).then(response => (response.ok ? response.json() : null))
                }
                if (summary?.code && !cancelled) {
                    referralCode.current = summary.code
                    const personal = new URL(url)
                    personal.searchParams.set('ref', summary.code)
                    setShareUrl(personal.toString())
                }
            } catch {
                // Sharing the plain page still works.
            }
        }

        personalise()
        return () => {
            cancelled = true
        }
    }, [signedIn, teamId, inviteCode, url])

    const track = (eventName: 'link_copied' | 'native_share_opened' | 'share_opened', channel: Channel) => {
        if (!referralCode.current) return
        fetch('/api/referrals/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventName, referralCode: referralCode.current, channel }),
            keepalive: true,
        }).catch(() => {
            // Sharing should not depend on analytics.
        })
    }

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(withChannel(shareUrl, 'copy'))
            track('link_copied', 'copy')
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be blocked (insecure origin, permissions); the other options still work.
        }
    }

    const nativeShare = async () => {
        track('native_share_opened', 'native_share')
        try {
            await navigator.share({ url: withChannel(shareUrl, 'native_share'), text })
        } catch {
            // Dismissing the share sheet rejects; nothing to do.
        }
    }

    const encodedText = encodeURIComponent(text)
    const link = (channel: Channel) => encodeURIComponent(withChannel(shareUrl, channel))

    return (
        <div className="flex flex-wrap items-center justify-center gap-2">
            <button
                type="button"
                onClick={copy}
                className="inline-flex h-11 items-center gap-2 rounded-full border border-neutral-200 bg-white px-5 text-sm font-bold text-neutral-900 transition-colors hover:border-black"
            >
                {copied ? <Check className="h-4 w-4 text-green-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                <span aria-live="polite">{copied ? labels.copied : labels.copyLink}</span>
            </button>

            <a
                href={`https://wa.me/?text=${encodeURIComponent(`${text} ${withChannel(shareUrl, 'whatsapp')}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('share_opened', 'whatsapp')}
                aria-label={labels.shareOnWhatsapp}
                title={labels.shareOnWhatsapp}
                className={iconLink}
            >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
            </a>

            {canNativeShare ? (
                <button type="button" onClick={nativeShare} aria-label={labels.share} title={labels.share} className={iconLink}>
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
            ) : null}

            <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${link('x')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('share_opened', 'x')}
                aria-label={labels.shareOnX}
                title={labels.shareOnX}
                className={iconLink}
            >
                <Twitter className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${link('linkedin')}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => track('share_opened', 'linkedin')}
                aria-label={labels.shareOnLinkedin}
                title={labels.shareOnLinkedin}
                className={iconLink}
            >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
            </a>
        </div>
    )
}
