'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Check, Copy, Share2, Sprout, TreePine } from 'lucide-react'
import { formatTrees } from '@/lib/referral-reward-settings'
import { LAUNCH_BADGE_UNTIL, useReferralInvite } from '@/components/referrals/useReferralInvite'

// Slim invite banner shown on dashboard pages. Only for members whose node
// already contributes, so brand-new members stay focused on finishing setup;
// everyone can invite from /referrals.
export default function ReferralPrompt() {
    const pathname = usePathname()
    const {
        loading,
        eligible,
        summary,
        copied,
        error,
        canNativeShare,
        channelLinks,
        copyLink,
        shareLink,
        recordInteraction,
    } = useReferralInvite({ autoCreate: 'contributors' })

    // The referrals page has its own, fuller invite section.
    if (pathname?.startsWith('/referrals')) return null
    if (loading || !eligible || !summary?.url) return null

    const reward = summary.reward

    return (
        <section aria-labelledby="referral-banner-heading" className="border-b-2 border-black bg-white">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
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
                        <p className="mb-1 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                            {reward && Date.now() < LAUNCH_BADGE_UNTIL ? (
                                <span className="border-2 border-black bg-brand-yellow px-1.5 py-0.5 text-[10px] tracking-wider text-black">New</span>
                            ) : null}
                            {reward ? 'Plant a tree with a friend' : 'Invite a friend'}
                        </p>
                        <h2 id="referral-banner-heading" className="font-candu text-xl font-extrabold uppercase leading-none text-brand-navy">
                            Grow the forest together
                        </h2>
                        <p className="mt-1 max-w-2xl text-sm font-semibold text-neutral-700">
                            {reward
                                ? <>Once someone you invite has contributed on {reward.minActiveDays} days, <strong className="text-black">you each get {formatTrees(reward.treesPerPerson)} planted</strong>.</>
                                : 'Invite someone who would genuinely use IdleForest.'}{' '}
                            <Link href="/referrals" className="inline-flex items-center gap-1 font-black text-black underline underline-offset-4">
                                See your forest <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
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
                    <div className="flex gap-2" aria-label="Share your invite">
                        {channelLinks
                            .filter(option => option.channel === 'whatsapp' || option.channel === 'email')
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
                                        <span className="sr-only sm:not-sr-only">{option.label}</span>
                                    </a>
                                )
                            })}
                    </div>
                    {error ? <p className="max-w-xs text-sm font-bold text-red-700" role="alert">{error}</p> : null}
                </div>
            </div>
        </section>
    )
}
