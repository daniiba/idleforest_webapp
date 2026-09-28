'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Check, Copy, Share2 } from 'lucide-react'
import { formatTrees } from '@/lib/referral-reward-settings'
import { LAUNCH_BADGE_UNTIL, useReferralInvite } from '@/components/referrals/useReferralInvite'

// One-line invite strip shown on dashboard pages. Only for members whose node
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
    const whatsapp = channelLinks.find(option => option.channel === 'whatsapp')

    return (
        <section aria-label="Invite a friend" className="border-b-2 border-black bg-brand-navy text-white">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2.5">
                {reward && Date.now() < LAUNCH_BADGE_UNTIL ? (
                    <span className="hidden border border-brand-yellow px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-brand-yellow sm:inline">New</span>
                ) : null}
                <p className="min-w-0 flex-1 truncate text-sm font-bold">
                    {reward
                        ? <>Invite a friend, <span className="text-brand-yellow">you each get {reward.treesPerPerson === 1 ? 'a tree' : formatTrees(reward.treesPerPerson)}</span></>
                        : 'Invite a friend to grow your forest'}
                </p>
                <button
                    type="button"
                    onClick={canNativeShare ? shareLink : copyLink}
                    className="inline-flex shrink-0 items-center gap-1.5 border-2 border-brand-yellow bg-brand-yellow px-3 py-1 text-xs font-black uppercase text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-yellow"
                >
                    {copied ? <Check className="h-3.5 w-3.5" /> : canNativeShare ? <Share2 className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    {copied ? 'Copied' : canNativeShare ? 'Share' : 'Copy link'}
                </button>
                {whatsapp ? (
                    <a
                        href={whatsapp.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => recordInteraction('share_opened', whatsapp.channel)}
                        className="hidden shrink-0 items-center border-2 border-white/40 p-1 text-white hover:border-brand-yellow hover:text-brand-yellow sm:inline-flex"
                        aria-label={`Share your invite via ${whatsapp.label}`}
                    >
                        <whatsapp.icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                ) : null}
                <Link href="/referrals" className="hidden shrink-0 items-center gap-1 text-xs font-black uppercase text-white/70 hover:text-brand-yellow sm:inline-flex">
                    Your forest <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </Link>
                {error ? <span className="sr-only" role="alert">{error}</span> : null}
            </div>
        </section>
    )
}
