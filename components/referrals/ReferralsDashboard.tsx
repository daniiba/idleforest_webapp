'use client'

import { useState } from 'react'
import { Bell, Check, Copy, Loader2, Mail, MessageCircle, Share2 } from 'lucide-react'
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import { formatTrees } from '@/lib/referral-reward-settings'
import { emailShareUrl, reminderMessage, whatsappUrl } from '@/lib/referral-messages'
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
                reward={reward}
            />
        </div>
    )
}

function InviteSection({ reward, invite }: { reward: Reward; invite: ReturnType<typeof useReferralInvite> }) {
    const { summary, loading, creating, copied, error, canNativeShare, channelLinks, copyLink, shareLink, recordInteraction, createLink } = invite
    const gift = reward ? (reward.treesPerPerson === 1 ? 'a tree' : formatTrees(reward.treesPerPerson)) : null
    const steps = ['Send your link', 'They join and install IdleForest', gift ? `You each get ${gift}` : 'Their trees grow your forest']

    return (
        <section aria-labelledby="invite-heading" className="grid overflow-hidden border border-neutral-200 lg:grid-cols-[1.1fr_0.9fr] rounded-2xl">
            <div className="bg-neutral-100 p-6 sm:p-10">
                {reward && Date.now() < LAUNCH_BADGE_UNTIL ? (
                    <span className="mb-3 inline-block bg-brand-yellow px-1.5 py-0.5 text-[10px] font-extrabold rounded-full">New</span>
                ) : null}
                <h1 id="invite-heading" className="text-4xl font-extrabold leading-none text-brand-navy sm:text-5xl">
                    Plant a tree with a friend
                </h1>

                <ol className="mt-6 space-y-3">
                    {steps.map((step, index) => (
                        <li key={step} className="flex items-center gap-3 font-extrabold">
                            <span className="flex h-7 w-7 shrink-0 items-center justify-center border border-neutral-200 bg-brand-yellow font-mono text-xs rounded-2xl">
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

            <div className="flex flex-col justify-center border-t border-neutral-200 bg-brand-yellow p-6 sm:p-10 lg:border-l lg:border-t-0">
                {summary?.url ? (
                    <>
                        <div className="flex flex-col gap-2 sm:flex-row">
                            <input
                                readOnly
                                value={summary.url}
                                onFocus={event => event.currentTarget.select()}
                                aria-label="Your invite link"
                                className="min-w-0 flex-1 border border-neutral-200 bg-white px-3 py-3 font-mono text-sm font-bold rounded-full"
                            />
                            <button
                                type="button"
                                onClick={copyLink}
                                className="inline-flex items-center justify-center gap-2 bg-brand-navy px-5 py-3 text-sm font-extrabold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-full"
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
                                        className="inline-flex min-w-0 items-center justify-center gap-1.5 border border-neutral-200 bg-white px-2 py-2.5 text-sm font-extrabold text-black hover:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 rounded-full"
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
                                className="mt-2 inline-flex items-center justify-center gap-2 border border-neutral-200 bg-white px-3 py-2.5 text-sm font-extrabold text-black rounded-full"
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
                        className="inline-flex w-fit items-center justify-center gap-2 bg-brand-navy px-5 py-3 text-sm font-extrabold text-white rounded-full"
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
    return { rank: 1, label: 'Setting up', className: 'bg-white/60 text-neutral-600' }
}

function InvitedPeople({ loading, people, reward }: {
    loading: boolean
    people: ReferredUser[]
    reward: Reward
}) {
    const [showAll, setShowAll] = useState(false)
    const [open, setOpen] = useState<string | null>(null)
    if (loading) return null

    const rewardEnabled = Boolean(reward)
    const sorted = [...people].sort((a, b) =>
        statusOf(b, rewardEnabled).rank - statusOf(a, rewardEnabled).rank || (b.trees || 0) - (a.trees || 0)
    )
    const shown = showAll ? sorted : sorted.slice(0, 8)
    const waiting = people.filter(person => !person.activated).length

    return (
        <section aria-labelledby="people-heading" className="border border-neutral-200 bg-neutral-100 rounded-2xl">
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-neutral-200 px-6 py-4">
                <h2 id="people-heading" className="text-2xl font-extrabold leading-none text-brand-navy">
                    People you invited{people.length > 0 ? ` (${people.length})` : ''}
                </h2>
                {waiting > 0 ? (
                    <p className="text-sm font-bold text-neutral-700">
                        {waiting === 1 ? '1 friend is' : `${waiting} friends are`} still setting up.
                    </p>
                ) : null}
            </div>

            {people.length === 0 ? (
                <p className="px-6 py-5 text-sm font-semibold text-neutral-600">No one yet.</p>
            ) : (
                <ul>
                    {shown.map((person, index) => {
                        const status = statusOf(person, rewardEnabled)
                        const key = `${person.displayName}-${person.joinedAt}-${index}`
                        const canRemind = !person.activated
                        const isOpen = open === key
                        return (
                            <li key={key} className="border-b border-black/15 last:border-b-0">
                                <div className="flex items-center gap-3 px-6 py-3">
                                    <p className="min-w-0 flex-1 truncate font-extrabold">{person.displayName}</p>
                                    {canRemind ? (
                                        <button
                                            type="button"
                                            onClick={() => setOpen(isOpen ? null : key)}
                                            aria-expanded={isOpen}
                                            className={`inline-flex shrink-0 items-center gap-1.5 border border-neutral-200 px-2.5 py-1 text-xs font-extrabold rounded-full ${isOpen ? 'bg-brand-navy text-brand-yellow' : 'bg-brand-yellow text-black hover:bg-black hover:text-brand-yellow'}`}
                                        >
                                            <Bell className="h-3.5 w-3.5" aria-hidden="true" />
                                            Remind
                                        </button>
                                    ) : null}
                                    <span className={`shrink-0 border border-neutral-200 px-2 py-0.5 text-[11px] font-extrabold rounded-full ${status.className}`}>
                                        {status.label}
                                    </span>
                                    <p className="hidden w-20 shrink-0 text-right text-sm font-extrabold tabular-nums sm:block">
                                        {formatTrees(person.trees || 0)}
                                    </p>
                                </div>
                                {isOpen ? <Reminder name={person.displayName} reward={reward} /> : null}
                            </li>
                        )
                    })}
                </ul>
            )}

            {sorted.length > 8 ? (
                <button
                    type="button"
                    onClick={() => setShowAll(value => !value)}
                    className="w-full border-t border-neutral-200 px-6 py-3 text-xs font-extrabold hover:bg-black/5"
                >
                    {showAll ? 'Show fewer' : `Show all ${sorted.length}`}
                </button>
            ) : null}
        </section>
    )
}

// A ready-made reminder for someone who joined but has not set up the app.
function Reminder({ name, reward }: { name: string; reward: Reward }) {
    const [copied, setCopied] = useState(false)
    const text = reminderMessage(name, reward ? { ...reward, enabled: true } : null)

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 2000)
        } catch {
            // Clipboard blocked: the text is visible to copy by hand.
        }
    }

    const linkClass = 'inline-flex items-center justify-center gap-1.5 border-2 border-black px-3 py-2 text-xs font-black uppercase'

    return (
        <div className="mx-6 mb-4 border border-neutral-200 bg-forest-ground p-4 rounded-2xl">
            <p className="text-[11px] font-extrabold text-black/60">A friendly check-in for {name}</p>
            <p className="mt-2 text-sm font-semibold leading-6">{text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
                <a href={whatsappUrl(text)} target="_blank" rel="noopener noreferrer" className={`${linkClass} bg-brand-navy text-brand-yellow`}>
                    <MessageCircle className="h-4 w-4" aria-hidden="true" /> WhatsApp
                </a>
                <a href={emailShareUrl('Your IdleForest app', text)} className={`${linkClass} bg-brand-yellow text-black`}>
                    <Mail className="h-4 w-4" aria-hidden="true" /> Email
                </a>
                <button type="button" onClick={copy} className={`${linkClass} bg-transparent`}>
                    {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
        </div>
    )
}
