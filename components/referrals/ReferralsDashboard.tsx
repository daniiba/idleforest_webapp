'use client'

import { useState } from 'react'
import { Check, Copy, Loader2, Share2 } from 'lucide-react'
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import { formatTrees } from '@/lib/referral-reward-settings'
import { LAUNCH_BADGE_UNTIL, useReferralInvite, type ReferredUser } from '@/components/referrals/useReferralInvite'

type Reward = { treesPerPerson: number; minActiveDays: number } | null

// The /referrals page, in the order people need it: invite someone, see the
// forest it grows, follow the people invited. Counted in trees only, with
// as little text as possible.
export default function ReferralsDashboard({ reward }: { reward: Reward }) {
    const invite = useReferralInvite({ autoCreate: 'always' })

    return (
        <div className="space-y-6">
            <InviteSection reward={reward} invite={invite} />
            <ForestImpactPanel mode="self" />
            <InvitedPeople
                loading={invite.loading}
                people={invite.summary?.referredUsers || []}
                rewardEnabled={Boolean(reward)}
            />
        </div>
    )
}

function InviteSection({ reward, invite }: { reward: Reward; invite: ReturnType<typeof useReferralInvite> }) {
    const { summary, loading, creating, copied, error, canNativeShare, channelLinks, copyLink, shareLink, recordInteraction, createLink } = invite
    const gift = reward ? (reward.treesPerPerson === 1 ? 'a tree' : formatTrees(reward.treesPerPerson)) : null
    const steps = ['Send your link', 'They join and install IdleForest', gift ? `You each get ${gift}` : 'Their trees grow your forest']

    return (
        <section aria-labelledby="invite-heading" className="grid overflow-hidden border-2 border-black lg:grid-cols-[1.1fr_0.9fr]">
            <div className="bg-brand-gray p-6 sm:p-10">
                {reward && Date.now() < LAUNCH_BADGE_UNTIL ? (
                    <span className="mb-3 inline-block border-2 border-black bg-brand-yellow px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider">New</span>
                ) : null}
                <h1 id="invite-heading" className="font-candu text-4xl font-extrabold uppercase leading-none text-brand-navy sm:text-5xl">
                    Plant a tree with a friend
                </h1>

                <ol className="mt-6 space-y-3">
                    {steps.map((step, index) => (
                        <li key={step} className="flex items-center gap-3 font-black">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center border-2 border-black bg-brand-yellow font-mono text-xs">
                                {index + 1}
                            </span>
                            {step}
                        </li>
                    ))}
                </ol>
                {reward ? (
                    <p className="mt-4 text-xs font-semibold text-neutral-600">
                        Trees are planted once their computer has contributed on {reward.minActiveDays} days.
                    </p>
                ) : null}
            </div>

            <div className="flex flex-col justify-center border-t-2 border-black bg-brand-yellow p-6 sm:p-10 lg:border-l-2 lg:border-t-0">
                {summary?.url ? (
                    <>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                readOnly
                                value={summary.url}
                                onFocus={event => event.currentTarget.select()}
                                aria-label="Your invite link"
                                className="min-w-0 flex-1 border-2 border-black bg-white px-3 py-3 font-mono text-sm font-bold"
                            />
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center justify-center gap-2 border-2 border-black bg-brand-navy px-5 py-3 text-sm font-black uppercase text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                            >
                                {copied ? <Check className="h-4 w-4 text-brand-yellow" /> : <Copy className="h-4 w-4" />}
                                {copied ? 'Copied' : 'Copy'}
                            </button>
                        </div>

                        <div className="mt-2 grid grid-cols-2 gap-2">
                            {channelLinks.map(option => {
                                const Icon = option.icon
                                return (
                                    <a
                                        key={option.channel}
                                        href={option.url}
                                        target={option.channel === 'email' ? undefined : '_blank'}
                                        rel="noopener noreferrer"
                                        onClick={() => recordInteraction('share_opened', option.channel)}
                                        className="inline-flex min-w-0 items-center justify-center gap-1.5 border-2 border-black bg-white px-2 py-2.5 text-sm font-black text-black hover:bg-brand-gray focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                                        {option.label}
                                    </a>
                                )
                            })}
                        </div>
                        {canNativeShare ? (
                            <button
                                type="button"
                                onClick={shareLink}
                                className="mt-2 inline-flex items-center justify-center gap-2 border-2 border-black bg-white px-3 py-2.5 text-sm font-black text-black"
                            >
                                <Share2 className="h-4 w-4" aria-hidden="true" />
                                More
                            </button>
                        ) : null}
                    </>
                ) : loading || creating ? (
                    <div className="flex items-center gap-2 text-sm font-bold">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Preparing your link…
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={createLink}
                        className="inline-flex w-fit items-center justify-center gap-2 border-2 border-black bg-brand-navy px-5 py-3 text-sm font-black uppercase text-white"
                    >
                        Try again
                    </button>
                )}

                {error ? <p className="mt-3 text-sm font-bold text-red-700" role="alert">{error}</p> : null}
            </div>
        </section>
    )
}

function statusOf(person: ReferredUser, rewardEnabled: boolean) {
    if (rewardEnabled && person.rewarded) return { rank: 3, label: 'Tree planted', className: 'bg-brand-yellow text-black' }
    if (person.activated) return { rank: 2, label: 'Contributing', className: 'bg-brand-navy text-white' }
    return { rank: 1, label: 'Joined', className: 'bg-white/60 text-neutral-600' }
}

function InvitedPeople({ loading, people, rewardEnabled }: {
    loading: boolean
    people: ReferredUser[]
    rewardEnabled: boolean
}) {
    const [showAll, setShowAll] = useState(false)
    if (loading) return null

    const sorted = [...people].sort((a, b) =>
        statusOf(b, rewardEnabled).rank - statusOf(a, rewardEnabled).rank || (b.trees || 0) - (a.trees || 0)
    )
    const shown = showAll ? sorted : sorted.slice(0, 8)

    return (
        <section aria-labelledby="people-heading" className="border-2 border-black bg-brand-gray">
            <h2 id="people-heading" className="border-b-2 border-black px-6 py-4 font-candu text-2xl font-extrabold uppercase leading-none text-brand-navy">
                People you invited{people.length > 0 ? ` (${people.length})` : ''}
            </h2>

            {people.length === 0 ? (
                <p className="px-6 py-5 text-sm font-semibold text-neutral-600">No one yet.</p>
            ) : (
                <ul>
                    {shown.map((person, index) => {
                        const status = statusOf(person, rewardEnabled)
                        return (
                            <li key={`${person.displayName}-${person.joinedAt}-${index}`} className="flex items-center gap-3 border-b border-black/15 px-6 py-3 last:border-b-0">
                                <p className="min-w-0 flex-1 truncate font-black">{person.displayName}</p>
                                <span className={`shrink-0 border-2 border-black px-2 py-0.5 text-[11px] font-black uppercase tracking-wider ${status.className}`}>
                                    {status.label}
                                </span>
                                <p className="w-20 shrink-0 text-right font-mono text-sm font-black tabular-nums">
                                    {formatTrees(person.trees || 0)}
                                </p>
                            </li>
                        )
                    })}
                </ul>
            )}

            {sorted.length > 8 ? (
                <button
                    type="button"
                    onClick={() => setShowAll(value => !value)}
                    className="w-full border-t-2 border-black px-6 py-3 text-xs font-black uppercase tracking-wider hover:bg-black/5"
                >
                    {showAll ? 'Show fewer' : `Show all ${sorted.length}`}
                </button>
            ) : null}
        </section>
    )
}
