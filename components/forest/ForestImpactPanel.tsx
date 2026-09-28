'use client'

import { useCallback, useEffect, useState } from 'react'
import { Check, Loader2, Share2 } from 'lucide-react'
import Forest3D from '@/components/forest/Forest3D'
import { FOREST_COLORS, forestSceneSummary } from '@/lib/forest-scene'
import { formatTrees } from '@/lib/referral-reward-settings'

export type ForestResponse = {
    seed: string
    displayName: string | null
    invitePath: string | null
    reward: { treesPerPerson: number; minActiveDays: number } | null
    ownTrees: number
    inviteTrees: number
    friendTrees: number
    totalTrees: number
    friends: Array<{ label: string | null; trees: number; contributing: boolean }>
}

type ForestImpactPanelProps =
    | { mode: 'self' }
    | { mode: 'public'; displayName: string }

function formatCount(value: number) {
    return value.toLocaleString('en')
}

export default function ForestImpactPanel(props: ForestImpactPanelProps) {
    const [data, setData] = useState<ForestResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [shared, setShared] = useState(false)
    const publicName = props.mode === 'public' ? props.displayName : null

    useEffect(() => {
        let cancelled = false
        const url = publicName ? `/api/forest?displayName=${encodeURIComponent(publicName)}` : '/api/forest'

        fetch(url)
            .then(response => (response.ok ? response.json() : null))
            .then(body => {
                if (!cancelled) setData(body)
            })
            .catch(() => {
                if (!cancelled) setData(null)
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })

        return () => {
            cancelled = true
        }
    }, [publicName])

    const shareForest = useCallback(async () => {
        if (!data?.invitePath) return

        const url = new URL(data.invitePath, window.location.origin)
        url.searchParams.set('channel', 'forest_share')
        const text = data.reward
            ? `My forest on IdleForest has grown to ${formatTrees(data.totalTrees)}. It runs quietly on my computer and turns unused bandwidth into real trees. Join me and we'll each get ${formatTrees(data.reward.treesPerPerson)} planted:`
            : `My forest on IdleForest has grown to ${formatTrees(data.totalTrees)}. It runs quietly on my computer and turns unused bandwidth into real trees. Join my forest:`

        fetch('/api/referrals/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventName: 'share_opened',
                referralCode: data.invitePath.split('/r/')[1]?.split('?')[0],
                channel: 'forest_share',
            }),
            keepalive: true,
        }).catch(() => {})

        try {
            if (typeof navigator.share === 'function') {
                await navigator.share({ title: 'My IdleForest forest', text, url: url.toString() })
                return
            }
            await navigator.clipboard.writeText(`${text} ${url.toString()}`)
            setShared(true)
            window.setTimeout(() => setShared(false), 2200)
        } catch {
            // Share sheet dismissed or clipboard unavailable: nothing to do.
        }
    }, [data])

    if (loading) {
        return props.mode === 'self' ? (
            <div className="flex min-h-72 items-center justify-center border-2 border-black bg-[#0B101F]">
                <Loader2 className="h-7 w-7 animate-spin text-brand-yellow" aria-label="Loading your forest" />
            </div>
        ) : null
    }

    if (!data) return null
    if (props.mode === 'public' && data.totalTrees === 0 && data.friends.length === 0) return null

    const isSelf = props.mode === 'self'
    const name = data.displayName || 'This member'
    const summary = forestSceneSummary(data)
    const segments = [
        { key: 'own', label: isSelf ? 'By you' : `By ${name}`, value: data.ownTrees, color: FOREST_COLORS.own },
        { key: 'invite', label: 'Invite rewards', value: data.inviteTrees, color: FOREST_COLORS.invite },
        {
            key: 'friends',
            label: data.friends.length > 0 ? `By friends (${data.friends.length})` : 'By friends',
            value: data.friendTrees,
            color: FOREST_COLORS.friend,
            dim: true,
        },
    ]
    const barTotal = Math.max(1, data.totalTrees)

    return (
        <section className="overflow-hidden border-2 border-black bg-[#0B101F] text-white" aria-labelledby="forest-heading">
            <div className="grid lg:grid-cols-[1.35fr_0.65fr]">
                <div className="p-5 sm:p-8">
                    <h2 id="forest-heading" className="font-candu text-3xl font-extrabold uppercase leading-none sm:text-5xl">
                        {data.totalTrees > 0
                            ? `${formatTrees(data.totalTrees)} in ${isSelf ? 'your' : `${name}'s`} forest`
                            : isSelf ? 'Your forest starts here' : `${name}'s forest is just starting`}
                    </h2>

                    <Forest3D
                        className="mt-4"
                        seed={data.seed}
                        ownTrees={data.ownTrees}
                        inviteTrees={data.inviteTrees}
                        friends={data.friends}
                        title={isSelf ? 'Your forest island' : `${name}'s forest island`}
                    />

                    {summary.treesPerMark > 1 || summary.hiddenFriends > 0 ? (
                        <p className="mt-2 text-center text-xs font-semibold text-white/50">
                            {summary.treesPerMark > 1 ? `1 tree mark = ${summary.treesPerMark} trees. ` : ''}
                            {summary.hiddenFriends > 0 ? `+${summary.hiddenFriends} more friends.` : ''}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col border-t-2 border-white/15 p-5 sm:p-8 lg:border-l-2 lg:border-t-0">
                    <div className="flex h-4 w-full overflow-hidden border border-white/30 bg-white/5" role="img"
                        aria-label={segments.map(segment => `${segment.label}: ${formatCount(segment.value)}`).join(', ')}>
                        {segments.map(segment => segment.value > 0 ? (
                            <div
                                key={segment.key}
                                style={{
                                    width: `${(segment.value / barTotal) * 100}%`,
                                    backgroundColor: segment.color,
                                    opacity: segment.dim ? 0.6 : 1,
                                }}
                            />
                        ) : null)}
                    </div>

                    <dl className="mt-5 space-y-3">
                        {segments.map(segment => (
                            <div key={segment.key} className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-white/80">
                                    <span className="h-3 w-3 shrink-0" style={{ backgroundColor: segment.color, opacity: segment.dim ? 0.6 : 1 }} aria-hidden="true" />
                                    {segment.label}
                                </dt>
                                <dd className="font-mono text-lg font-black tabular-nums">{formatCount(segment.value)}</dd>
                            </div>
                        ))}
                        <div className="flex items-center justify-between gap-4 border-t-2 border-white/20 pt-3">
                            <dt className="text-sm font-black uppercase tracking-wider">Total</dt>
                            <dd className="font-mono text-2xl font-black tabular-nums text-brand-yellow">{formatCount(data.totalTrees)}</dd>
                        </div>
                    </dl>

                    <div className="pt-6">
                        {isSelf ? (
                            data.invitePath ? (
                                <button
                                    type="button"
                                    onClick={shareForest}
                                    className="inline-flex w-full items-center justify-center gap-2 border-2 border-white bg-transparent px-4 py-3 text-sm font-black uppercase text-white hover:border-brand-yellow hover:text-brand-yellow"
                                >
                                    {shared ? <Check className="h-4 w-4 text-brand-yellow" /> : <Share2 className="h-4 w-4" />}
                                    {shared ? 'Link copied' : 'Share my forest'}
                                </button>
                            ) : null
                        ) : null}
                    </div>
                </div>
            </div>
        </section>
    )
}
