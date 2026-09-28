'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Linkedin, Mail, MessageCircle, Twitter } from 'lucide-react'

export type ReferredUser = {
    displayName: string
    trees?: number
    requests: number
    activated: boolean
    rewarded?: boolean
    joinedAt: string
}

export type ReferralSummary = {
    code: string | null
    url: string | null
    referrals: number
    activatedReferrals: number
    rewardedReferrals: number
    treesFromInvites?: number
    reward?: { treesPerPerson: number; minActiveDays: number } | null
    referredUsers: ReferredUser[]
}

export type ShareChannel = 'whatsapp' | 'email' | 'x' | 'linkedin'

// Personal, concrete copy converts better than a slogan: say what it is, that
// it is free, and how little effort it takes.
export const SHARE_TEXT = "I've been using IdleForest: it runs quietly on my computer and turns internet bandwidth I'm not using into real trees. It's free and takes two minutes to set up. Join my forest:"
const EMAIL_SUBJECT = 'Want to grow a forest with me?'

// Marks the double-sided reward as new during the launch weeks.
export const LAUNCH_BADGE_UNTIL = Date.parse('2026-11-15T00:00:00Z')

function withChannel(url: string, channel: string) {
    const parsed = new URL(url)
    parsed.searchParams.set('channel', channel)
    return parsed.toString()
}

function emailBody(url: string) {
    return [
        'Hi,',
        '',
        "I've been using IdleForest. It runs quietly on my computer and turns internet bandwidth I'm not using into funding for real tree planting. It's free and takes about two minutes to set up.",
        '',
        `Here's my personal invite: ${url}`,
        '',
        "I'd love to have you in my forest!",
    ].join('\n')
}

const SHARE_CHANNELS: Array<{
    channel: ShareChannel
    label: string
    icon: typeof Mail
    href: (url: string) => string
}> = [
    {
        channel: 'whatsapp',
        label: 'WhatsApp',
        icon: MessageCircle,
        href: url => `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} ${url}`)}`,
    },
    {
        channel: 'email',
        label: 'Email',
        icon: Mail,
        href: url => `mailto:?subject=${encodeURIComponent(EMAIL_SUBJECT)}&body=${encodeURIComponent(emailBody(url))}`,
    },
    {
        channel: 'x',
        label: 'X',
        icon: Twitter,
        href: url => `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`,
    },
    {
        channel: 'linkedin',
        label: 'LinkedIn',
        icon: Linkedin,
        href: url => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
]

/**
 * Loads the member's invite link and referral summary, creates the link on
 * first use, and provides the copy / share actions (with funnel tracking).
 *
 * `autoCreate`: 'always' on the referrals page (anyone can invite);
 * 'contributors' for the dashboard banner, which is only shown to people
 * whose node already contributes.
 */
export function useReferralInvite({ autoCreate }: { autoCreate: 'always' | 'contributors' }) {
    const [eligible, setEligible] = useState(false)
    const [summary, setSummary] = useState<ReferralSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [copied, setCopied] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [canNativeShare, setCanNativeShare] = useState(false)
    const autoCreateAttempted = useRef(false)

    useEffect(() => {
        setCanNativeShare(typeof navigator !== 'undefined' && typeof navigator.share === 'function')
    }, [])

    useEffect(() => {
        let cancelled = false

        Promise.all([
            fetch('/api/user/node-status').then(response => response.ok ? response.json() : null),
            fetch('/api/referrals/me').then(response => response.ok ? response.json() : null),
        ])
            .then(([nodeStatus, referralSummary]) => {
                if (cancelled) return
                setEligible(Boolean(nodeStatus?.hasProductiveNode))
                setSummary(referralSummary)
            })
            .catch(() => {
                if (!cancelled) setEligible(false)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [])

    const createLink = useCallback(async () => {
        setCreating(true)
        setError(null)

        try {
            const response = await fetch('/api/referrals/me', { method: 'POST' })
            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Could not create your invite link')
            }

            setSummary(data)
        } catch (createError) {
            setError(createError instanceof Error ? createError.message : 'Could not create your invite link')
        } finally {
            setCreating(false)
        }
    }, [])

    // Every extra click before sharing loses people, so the link is created
    // as soon as it is needed instead of via a "create" button.
    useEffect(() => {
        if (loading || !summary || summary.url || autoCreateAttempted.current) return
        if (autoCreate === 'contributors' && !eligible) return

        autoCreateAttempted.current = true
        createLink()
    }, [autoCreate, createLink, eligible, loading, summary])

    const recordInteraction = useCallback((eventName: 'link_copied' | 'native_share_opened' | 'share_opened', channel: string) => {
        if (!summary?.code) return

        fetch('/api/referrals/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventName, referralCode: summary.code, channel }),
            keepalive: true,
        }).catch(() => {
            // Sharing should still work if analytics is temporarily unavailable.
        })
    }, [summary?.code])

    const flashCopied = () => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 2200)
    }

    const copyLink = useCallback(async () => {
        if (!summary?.url) return

        try {
            await navigator.clipboard.writeText(`${SHARE_TEXT} ${withChannel(summary.url, 'copy')}`)
            recordInteraction('link_copied', 'copy')
            flashCopied()
        } catch {
            setError('Could not copy the invite. Please try again.')
        }
    }, [recordInteraction, summary?.url])

    const shareLink = useCallback(async () => {
        if (!summary?.url) return

        const url = withChannel(summary.url, 'native_share')
        recordInteraction('native_share_opened', 'native_share')

        try {
            if (navigator.share) {
                await navigator.share({ title: 'Grow an IdleForest with me', text: SHARE_TEXT, url })
                return
            }
            await navigator.clipboard.writeText(`${SHARE_TEXT} ${url}`)
            flashCopied()
        } catch (shareError) {
            if (shareError instanceof DOMException && shareError.name === 'AbortError') return
            setError('Could not open sharing. Please copy the invite instead.')
        }
    }, [recordInteraction, summary?.url])

    const channelLinks = summary?.url
        ? SHARE_CHANNELS.map(option => ({
            ...option,
            url: option.href(withChannel(summary.url as string, option.channel)),
        }))
        : []

    return {
        loading,
        eligible,
        summary,
        creating,
        copied,
        error,
        canNativeShare,
        channelLinks,
        createLink,
        copyLink,
        shareLink,
        recordInteraction,
    }
}
