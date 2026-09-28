'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, Linkedin, Loader2, Mail, MessageCircle, Share2, Sprout, TreePine, Twitter, Users } from 'lucide-react'
import ReferralDailyBars, { type DailyReferralImpact } from '@/components/referrals/ReferralDailyBars'

type ReferredUser = {
    displayName: string
    requests: number
    activated: boolean
    rewarded?: boolean
    joinedAt: string
}

type ReferralSummary = {
    code: string | null
    url: string | null
    referrals: number
    activatedReferrals: number
    rewardedReferrals: number
    treesFromInvites?: number
    reward?: { treesPerPerson: number; minActiveDays: number } | null
    ownRequests: number
    referredRequests: number
    combinedRequests: number
    referredUsers: ReferredUser[]
    dailyImpact: DailyReferralImpact[]
}

type ReferralPromptProps = {
    variant?: 'banner' | 'page'
}

function withChannel(url: string, channel: string) {
    const parsed = new URL(url)
    parsed.searchParams.set('channel', channel)
    return parsed.toString()
}

// Personal, concrete copy converts better than a slogan: say what it is, that
// it is free, and how little effort it takes.
const SHARE_TEXT = "I've been using IdleForest: it runs quietly on my computer and turns internet bandwidth I'm not using into real trees. It's free and takes two minutes to set up. Join my forest:"
const EMAIL_SUBJECT = 'Want to grow a forest with me?'

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

type ShareChannel = 'whatsapp' | 'email' | 'x' | 'linkedin'

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

export default function ReferralPrompt({ variant = 'banner' }: ReferralPromptProps) {
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

    const shareText = SHARE_TEXT

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

    // Every extra click before sharing loses people, so eligible members get
    // their link as soon as the prompt loads instead of via a "create" button.
    useEffect(() => {
        if (loading || !eligible || !summary || summary.url || autoCreateAttempted.current) return

        autoCreateAttempted.current = true
        createLink()
    }, [createLink, eligible, loading, summary])

    const recordInteraction = useCallback((eventName: 'link_copied' | 'native_share_opened' | 'share_opened', channel: string) => {
        if (!summary?.code) return

        fetch('/api/referrals/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName,
                referralCode: summary.code,
                channel,
            }),
            keepalive: true,
        }).catch(() => {
            // Sharing should still work if analytics is temporarily unavailable.
        })
    }, [summary?.code])

    const copyLink = useCallback(async () => {
        if (!summary?.url) return

        try {
            const url = withChannel(summary.url, 'copy')
            await navigator.clipboard.writeText(`${shareText} ${url}`)
            recordInteraction('link_copied', 'copy')
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2200)
        } catch {
            setError('Could not copy the invite. Please try again.')
        }
    }, [recordInteraction, shareText, summary?.url])

    const shareLink = useCallback(async () => {
        if (!summary?.url) return

        const url = withChannel(summary.url, 'native_share')
        recordInteraction('native_share_opened', 'native_share')

        try {
            if (navigator.share) {
                await navigator.share({
                    title: 'Grow an IdleForest with me',
                    text: shareText,
                    url,
                })
                return
            }

            await navigator.clipboard.writeText(`${shareText} ${url}`)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2200)
        } catch (shareError) {
            if (shareError instanceof DOMException && shareError.name === 'AbortError') return
            setError('Could not open sharing. Please copy the invite instead.')
        }
    }, [recordInteraction, shareText, summary?.url])

    const channelLinks = summary?.url
        ? SHARE_CHANNELS.map(option => ({
            ...option,
            url: option.href(withChannel(summary.url as string, option.channel)),
        }))
        : []

    const isPage = variant === 'page'
    const impactMultiplier = summary && summary.ownRequests > 0
        ? summary.combinedRequests / summary.ownRequests
        : null

    if (loading) {
        return isPage ? (
            <div className="flex min-h-64 items-center justify-center border-2 border-black bg-white">
                <Loader2 className="h-7 w-7 animate-spin" aria-label="Loading referral status" />
            </div>
        ) : null
    }

    if (!eligible) {
        return isPage ? (
            <section className="border-2 border-black bg-white p-8 text-center sm:p-12">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-brand-yellow">
                    <Sprout className="h-8 w-8" />
                </div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">One step before sharing</p>
                <h1 className="mt-2 font-candu text-4xl font-extrabold uppercase text-brand-navy">Let your node contribute first</h1>
                <p className="mx-auto mt-4 max-w-xl font-semibold text-neutral-700">Personal invites unlock after IdleForest records real activity from one of your nodes. This keeps referrals tied to people who know the product and can recommend it honestly.</p>
                <a href="/welcome" className="mt-7 inline-flex border-2 border-black bg-brand-yellow px-5 py-3 text-sm font-black uppercase text-black">Connect IdleForest</a>
            </section>
        ) : null
    }

    return (
        <section
            aria-labelledby={`referral-heading-${variant}`}
            className={isPage
                ? 'overflow-hidden border-2 border-black bg-white'
                : 'border-b-2 border-black bg-white'
            }
        >
            <div className={isPage
                ? 'grid lg:grid-cols-[1.15fr_0.85fr]'
                : 'mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between'
            }>
                <div className={isPage ? 'p-6 sm:p-10' : 'flex items-center gap-4'}>
                    <div className="relative hidden h-14 w-24 shrink-0 items-center justify-between sm:flex" aria-hidden="true">
                        <div className="absolute left-7 right-7 top-1/2 border-t-2 border-dashed border-black" />
                        <div className="relative z-10 border-2 border-black bg-brand-yellow p-2">
                            <TreePine className="h-6 w-6" />
                        </div>
                        <div className="relative z-10 border-2 border-black bg-white p-2">
                            <Sprout className="h-6 w-6" />
                        </div>
                    </div>

                    <div>
                        <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            Your next tree starts with a person
                        </p>
                        <h2
                            id={`referral-heading-${variant}`}
                            className={`${isPage ? 'text-4xl sm:text-5xl' : 'text-xl'} font-candu font-extrabold uppercase leading-none text-brand-navy`}
                        >
                            Grow the forest together
                        </h2>
                        <p className={`${isPage ? 'mt-5 max-w-xl text-lg' : 'mt-1 max-w-2xl text-sm'} font-semibold text-neutral-700`}>
                            {summary?.reward
                                ? <>Invite someone who would genuinely use IdleForest. Once their computer has contributed on {summary.reward.minActiveDays} different days, <strong className="text-black">you both get {summary.reward.treesPerPerson} trees planted</strong>.</>
                                : 'Invite one person who would genuinely use IdleForest. We count the referral when their node starts contributing, not when an empty account is created.'}
                        </p>
                    </div>
                </div>

                <div className={isPage
                    ? 'border-t-2 border-black bg-brand-yellow p-6 sm:p-10 lg:border-l-2 lg:border-t-0'
                    : 'flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center'
                }>
                    {summary?.url ? (
                        <>
                            {isPage ? (
                                <div className="mb-5 grid grid-cols-3 gap-3">
                                    <div className="border-2 border-black bg-white p-4">
                                        <p className="text-3xl font-black">{summary.referrals}</p>
                                        <p className="text-xs font-black uppercase tracking-wider">Joined</p>
                                    </div>
                                    <div className="border-2 border-black bg-brand-navy p-4 text-white">
                                        <p className="text-3xl font-black text-brand-yellow">{summary.activatedReferrals}</p>
                                        <p className="text-xs font-black uppercase tracking-wider">Contributing</p>
                                    </div>
                                    <div className="border-2 border-black bg-white p-4">
                                        <p className="text-3xl font-black">{summary.treesFromInvites || 0}</p>
                                        <p className="text-xs font-black uppercase tracking-wider">Trees earned</p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="flex min-w-0 items-center border-2 border-black bg-white px-3 py-2 font-mono text-xs font-bold sm:max-w-xs">
                                <span className="truncate">{summary.url}</span>
                            </div>
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center justify-center gap-2 border-2 border-black bg-brand-navy px-4 py-2 text-sm font-black uppercase text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                {copied ? <Check className="h-4 w-4 text-brand-yellow" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy invite'}
                            </button>
                            {canNativeShare ? (
                                <button
                                    type="button"
                                    onClick={shareLink}
                                    className="inline-flex items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-2 text-sm font-black uppercase text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                >
                                    <Share2 className="h-4 w-4" />
                                    Share
                                </button>
                            ) : null}
                            <div
                                className={isPage ? 'mt-3 grid grid-cols-2 gap-2' : 'flex gap-2'}
                                aria-label="Share your invite"
                            >
                                {channelLinks
                                    .filter(option => isPage || option.channel === 'whatsapp' || option.channel === 'email')
                                    .map(option => {
                                        const Icon = option.icon
                                        return (
                                            <a
                                                key={option.channel}
                                                href={option.url}
                                                target={option.channel === 'email' ? undefined : '_blank'}
                                                rel="noopener noreferrer"
                                                onClick={() => recordInteraction('share_opened', option.channel)}
                                                className="inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-2 text-sm font-black uppercase text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                                aria-label={`Share your invite via ${option.label}`}
                                            >
                                                <Icon className="h-4 w-4" aria-hidden="true" />
                                                <span className={isPage ? '' : 'sr-only sm:not-sr-only'}>{option.label}</span>
                                            </a>
                                        )
                                    })}
                            </div>
                        </>
                    ) : (
                        <button
                            type="button"
                            onClick={createLink}
                            disabled={creating}
                            className="inline-flex items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-5 py-3 text-sm font-black uppercase text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60"
                        >
                            {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Users className="h-4 w-4" />}
                            {creating ? 'Growing link…' : 'Create my invite'}
                        </button>
                    )}

                    {error ? (
                        <p className="max-w-xs text-sm font-bold text-red-700" role="alert">{error}</p>
                    ) : null}
                </div>
            </div>

            {isPage && summary?.url ? (
                <div className="border-t-2 border-black bg-brand-navy p-6 text-white sm:p-10">
                    <div className="grid gap-8 xl:grid-cols-[1.25fr_0.75fr] xl:items-start">
                        <div>
                            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">
                                The forest you started
                            </p>
                            <h3 className="mt-2 max-w-2xl font-candu text-3xl font-extrabold uppercase leading-none sm:text-4xl">
                                Your impact keeps moving through people.
                            </h3>
                            <p className="mt-4 max-w-2xl text-sm font-semibold leading-6 text-neutral-300 sm:text-base">
                                Your invites keep their own achievements. This view shows the additional activity that began with your introduction.
                            </p>

                            <div className="mt-7 grid items-stretch gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto_minmax(0,1.15fr)] sm:gap-0">
                                <div className="border-2 border-white/40 bg-white/5 p-4">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-400">Your node</p>
                                    <p className="mt-2 font-mono text-2xl font-black tabular-nums sm:text-3xl">{summary.ownRequests.toLocaleString()}</p>
                                    <p className="mt-1 text-xs font-bold text-neutral-400">requests powered</p>
                                </div>
                                <div className="hidden items-center px-3 font-mono text-2xl font-black text-brand-yellow sm:flex" aria-hidden="true">+</div>
                                <div className="border-2 border-brand-yellow bg-brand-yellow p-4 text-black">
                                    <p className="text-[11px] font-black uppercase tracking-wider">People you invited</p>
                                    <p className="mt-2 font-mono text-2xl font-black tabular-nums sm:text-3xl">{summary.referredRequests.toLocaleString()}</p>
                                    <p className="mt-1 text-xs font-bold text-neutral-700">requests powered</p>
                                </div>
                                <div className="hidden items-center px-3 font-mono text-2xl font-black text-brand-yellow sm:flex" aria-hidden="true">=</div>
                                <div className="border-2 border-white bg-white p-4 text-black">
                                    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Forest set in motion</p>
                                    <p className="mt-2 font-mono text-2xl font-black tabular-nums sm:text-3xl">{summary.combinedRequests.toLocaleString()}</p>
                                    <p className="mt-1 text-xs font-bold text-neutral-600">combined requests</p>
                                </div>
                            </div>

                            <p className="mt-4 border-l-4 border-brand-yellow pl-4 text-sm font-bold leading-6 text-white">
                                {summary.referredRequests > 0
                                    ? impactMultiplier && impactMultiplier >= 1.05
                                        ? `Your introductions have extended your visible impact to ${impactMultiplier.toFixed(1)} times what your node has powered alone.`
                                        : 'Your invitations are already creating impact beyond your own node.'
                                    : 'When someone you invite starts contributing, the impact they create will appear here.'
                                }
                            </p>
                        </div>

                        <div className="border-2 border-white bg-white text-black">
                            <div className="flex items-end justify-between border-b-2 border-black p-4">
                                <div>
                                    <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500">Invited contributors</p>
                                    <p className="mt-1 text-3xl font-black">{summary.activatedReferrals}</p>
                                </div>
                                <TreePine className="h-9 w-9 text-brand-navy" aria-hidden="true" />
                            </div>

                            {summary.referredUsers.length > 0 ? (
                                <div>
                                    {summary.referredUsers.slice(0, 6).map((referredUser, index) => (
                                        <div
                                            key={`${referredUser.displayName}-${referredUser.joinedAt}`}
                                            className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/20 px-4 py-3 last:border-b-0"
                                        >
                                            <span className="font-mono text-xs font-black text-neutral-400">{String(index + 1).padStart(2, '0')}</span>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-black">{referredUser.displayName}</p>
                                                <p className={`text-[10px] font-black uppercase tracking-wider ${referredUser.activated ? 'text-green-700' : 'text-neutral-400'}`}>
                                                    {referredUser.rewarded
                                                        ? 'Reward trees planted'
                                                        : referredUser.activated
                                                            ? 'Contributing'
                                                            : 'Joined'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-mono text-sm font-black tabular-nums">{referredUser.requests.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold uppercase text-neutral-500">requests</p>
                                            </div>
                                        </div>
                                    ))}
                                    {summary.referredUsers.length > 6 ? (
                                        <p className="border-t border-black/20 bg-neutral-100 px-4 py-3 text-xs font-black uppercase tracking-wider text-neutral-600">
                                            + {summary.referredUsers.length - 6} more branches
                                        </p>
                                    ) : null}
                                </div>
                            ) : (
                                <div className="p-5 text-sm font-semibold leading-6 text-neutral-600">
                                    Invite one person you trust. Their contribution will form the first branch of this record.
                                </div>
                            )}
                        </div>
                    </div>

                    <ReferralDailyBars dailyImpact={summary.dailyImpact || []} />
                </div>
            ) : null}
        </section>
    )
}
