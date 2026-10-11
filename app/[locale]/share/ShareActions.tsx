'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Facebook, Linkedin, Share2, Twitter } from 'lucide-react'

type Props = {
    url: string
    text: string
    labels: {
        share: string
        copyLink: string
        copied: string
        shareOnX: string
        shareOnFacebook: string
        shareOnLinkedin: string
    }
}

const iconLink =
    'flex h-11 w-11 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-700 transition-colors hover:border-black hover:text-black'

export default function ShareActions({ url, text, labels }: Props) {
    const [copied, setCopied] = useState(false)
    const [canNativeShare, setCanNativeShare] = useState(false)

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    }, [])

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(url)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard can be blocked (insecure origin, permissions); the other options still work.
        }
    }

    const nativeShare = async () => {
        try {
            await navigator.share({ url, text })
        } catch {
            // Dismissing the share sheet rejects; nothing to do.
        }
    }

    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)

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

            {canNativeShare ? (
                <button
                    type="button"
                    onClick={nativeShare}
                    aria-label={labels.share}
                    title={labels.share}
                    className={iconLink}
                >
                    <Share2 className="h-4 w-4" aria-hidden="true" />
                </button>
            ) : null}

            <a
                href={`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={labels.shareOnX}
                title={labels.shareOnX}
                className={iconLink}
            >
                <Twitter className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={labels.shareOnFacebook}
                title={labels.shareOnFacebook}
                className={iconLink}
            >
                <Facebook className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
                href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&summary=${encodedText}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={labels.shareOnLinkedin}
                title={labels.shareOnLinkedin}
                className={iconLink}
            >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
            </a>
        </div>
    )
}
