'use client'

import { useState } from 'react'
import { Check, Copy, Loader2, Share2 } from 'lucide-react'
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import { formatTrees } from '@/lib/referral-reward-settings'
import { LAUNCH_BADGE_UNTIL, useReferralInvite, type ReferredUser } from '@/components/referrals/useReferralInvite'

type Reward = { treesPerPerson: number; minActiveDays: number } | null

// The /referrals page, in the order people need it:
// 1. invite someone (the reason they came), 2. see the forest it grows,
// 3. follow the people they invited. Everything is counted in trees.
export default function ReferralsDashboard({ reward }: { reward: Reward }) {
    const invite = useReferralInvite({ autoCreate: 'always' })

    return (
        <div className="space-y-6">
            <InviteSection reward={reward} invite={invite} />
            <ForestImpactPanel mode="self" />
            <InvitedPeople
                loading={invite.loading}
                people={invite.summary?.referredUsers || []}
                treesEarned={invite.summary?.treesFromInvites || 0}
                reward={reward}
            />
        </div>
    )
}

function InviteSection({ reward, invite }: { reward: Reward; invite: ReturnType<typeof useReferralInvite> }) {
    const { summary, loading, creating, copied, error, canNativeShare, channelLinks, copyLink, shareLink, recordInteraction, createLink } = invite
    const steps = [
        { title: 'Send your link', body: 'to one person who would genuinely use IdleForest.' },
        { title: 'They join and install the app', body: 'Your invite is applied automatically.' },
        reward
            ? { title: `You each get ${reward.treesPerPerson === 1 ? 'a tree' : formatTrees(reward.treesPerPerson)}`, body: `once their computer has contributed on ${reward.minActiveDays} different days.` }
            : { title: 'Their trees grow your forest', body: 'as soon as they start contributing.' },
    ]

    return (
        <section aria-labelledby="invite-heading" className="grid overflow-hidden border-2 border-black bg-white lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-10">
                <p className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500">
                    {reward && Date.now() < LAUNCH_BADGE_UNTIL ? (
                        <span className="border-2 border-black bg-brand-yellow px-1.5 py-0.5 text-[10px] tracking-wider text-black">New</span>
                    ) : null}
                    Invite friends
                </p>
                <h1 id="invite-heading" className="mt-2 font-candu text-4xl font-extrabold uppercase leading-none text-brand-navy sm:text-5xl">
                    Plant a tree with a friend
                </h1>

                <ol className="mt-7 space-y-4">
                    {steps.map((step, index) => (
                        <li key={step.title} className="flex gap-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center border-2 border-black bg-brand-yellow font-mono text-sm font-black">
                                {index + 1}
                            </span>
                            <p className="pt-0.5 text-base leading-7 text-neutral-700">
                                <strong className="font-black text-black">{step.title}</strong> {step.body}
                            </p>
                        </li>
                    ))}
                </ol>
            </div>

            <div className="flex flex-col justify-center border-t-2 border-black bg-brand-yellow p-6 sm:p-10 lg:border-l-2 lg:border-t-0">
                <p className="text-[11px] font-black uppercase tracking-[0.2em]">Your invite link</p>

                {summary?.url ? (
                    <>
                        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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

                        <p className="mt-5 text-[11px] font-black uppercase tracking-[0.2em]">Or send it with</p>
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
                                        className="inline-flex min-w-0 items-center justify-center gap-1.5 border-2 border-black bg-white px-2 py-2.5 text-sm font-black text-black hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
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
                                More options
                            </button>
                        ) : null}
                    </>
                ) : loading || creating ? (
                    <div className="mt-4 flex items-center gap-2 text-sm font-bold">
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Preparing your link…
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={createLink}
                        className="mt-4 inline-flex w-fit items-center justify-center gap-2 border-2 border-black bg-brand-navy px-5 py-3 text-sm font-black uppercase text-white"
                    >
                        Try again
                    </button>
                )}

                {error ? <p className="mt-3 text-sm font-bold text-red-700" role="alert">{error}</p> : null}
            </div>
        </section>
    )
}

const STAGES = ['Joined', 'Contributing', 'Tree planted'] as const

function stageOf(person: ReferredUser) {
    if (person.rewarded) return 3
    if (person.activated) return 2
    return 1
}

function InvitedPeople({ loading, people, treesEarned, reward }: {
    loading: boolean
    people: ReferredUser[]
    treesEarned: number
    reward: Reward
}) {
    const [showAll, setShowAll] = useState(false)
    if (loading) return null

    const sorted = [...people].sort((a, b) => stageOf(b) - stageOf(a) || (b.trees || 0) - (a.trees || 0))
    const shown = showAll ? sorted : sorted.slice(0, 8)
    const contributing = people.filter(person => person.activated).length
    const stages = reward ? STAGES : STAGES.slice(0, 2)

    return (
        <section aria-labelledby="people-heading" className="border-2 border-black bg-white">
            <div className="flex flex-col gap-2 border-b-2 border-black p-6 sm:flex-row sm:items-end sm:justify-between">
                <h2 id="people-heading" className="font-candu text-2xl font-extrabold uppercase leading-none text-brand-navy">
                    People you invited
                </h2>
                {people.length > 0 ? (
                    <p className="text-sm font-bold text-neutral-600">
                        {people.length} joined · {contributing} contributing{reward ? ` · ${formatTrees(treesEarned)} earned` : ''}
                    </p>
                ) : null}
            </div>

            {people.length === 0 ? (
                <p className="p-6 text-sm font-semibold leading-6 text-neutral-600">
                    No one yet. The first person you invite grows a new island next to your forest.
                </p>
            ) : (
                <ul>
                    {shown.map((person, index) => {
                        const stage = stageOf(person)
                        return (
                            <li key={`${person.displayName}-${person.joinedAt}-${index}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-black/10 px-6 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]">
                                <p className="col-start-1 row-start-1 truncate font-black">{person.displayName}</p>

                                <ol className="col-span-2 row-start-2 flex items-center gap-1.5 sm:col-span-1 sm:col-start-2 sm:row-start-1" aria-label={`Status: ${stages[Math.min(stage, stages.length) - 1]}`}>
                                    {stages.map((label, stageIndex) => {
                                        const done = stageIndex < stage
                                        return (
                                            <li key={label} className="flex min-w-0 flex-1 flex-col gap-1">
                                                <span className={`h-1.5 w-full ${done ? 'bg-brand-navy' : 'bg-neutral-200'}`} />
                                                <span className={`truncate text-[10px] font-black uppercase tracking-wider ${done ? 'text-black' : 'text-neutral-400'}`}>
                                                    {label}
                                                </span>
                                            </li>
                                        )
                                    })}
                                </ol>

                                <p className="col-start-2 row-start-1 text-right font-mono text-sm font-black tabular-nums sm:col-start-3">
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
                    className="w-full border-t-2 border-black bg-neutral-50 px-6 py-3 text-xs font-black uppercase tracking-wider"
                >
                    {showAll ? 'Show fewer' : `Show all ${sorted.length}`}
                </button>
            ) : null}
        </section>
    )
}
