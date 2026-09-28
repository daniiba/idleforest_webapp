'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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
    | { mode: 'public'; displayName: string; onLoad?: (data: ForestResponse | null) => void; joinable?: boolean }

function formatCount(value: number) {
    return value.toLocaleString('en')
}

export default function ForestImpactPanel(props: ForestImpactPanelProps) {
    const [data, setData] = useState<ForestResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [shared, setShared] = useState(false)
    const publicName = props.mode === 'public' ? props.displayName : null
    const onLoadRef = useRef(props.mode === 'public' ? props.onLoad : undefined)
    onLoadRef.current = props.mode === 'public' ? props.onLoad : undefined

    useEffect(() => {
        let cancelled = false
        const url = publicName ? `/api/forest?displayName=${encodeURIComponent(publicName)}` : '/api/forest'

        fetch(url)
            .then(response => (response.ok ? response.json() : null))
            .then(body => {
                if (cancelled) return
                setData(body)
                onLoadRef.current?.(body)
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
            <div className="flex min-h-72 items-center justify-center border-2 border-black bg-forest-ground">
                <Loader2 className="h-7 w-7 animate-spin text-brand-navy" aria-label="Loading your forest" />
            </div>
        ) : null
    }

    if (!data) return null

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
        },
    ]
    const barTotal = Math.max(1, data.totalTrees)

    if (!isSelf) {
        return (
            <section className="overflow-hidden border-2 border-black bg-forest-ground text-brand-navy" aria-labelledby="forest-heading">
                <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-4 sm:px-6">
                    <h2 id="forest-heading" className="text-[11px] font-black uppercase tracking-wider text-black/55">
                        {name}&apos;s forest
                    </h2>
                    {data.totalTrees > 0 ? (
                        <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-bold text-black/60">
                            {segments.filter(segment => segment.value > 0).map(segment => (
                                <div key={segment.key} className="flex items-center gap-1.5">
                                    <span className="h-2.5 w-2.5" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                                    <dt>{segment.label}</dt>
                                    <dd className="font-black tabular-nums text-brand-navy">{formatCount(segment.value)}</dd>
                                </div>
                            ))}
                        </dl>
                    ) : (
                        <p className="text-xs font-bold text-black/55">First trees on the way</p>
                    )}
                </div>
                <Forest3D
                    className={data.totalTrees === 0 && data.friends.length === 0 ? '!aspect-[2/1] sm:!aspect-[3/1]' : 'sm:!aspect-[2/1]'}
                    seed={data.seed}
                    ownTrees={data.ownTrees}
                    inviteTrees={data.inviteTrees}
                    friends={data.friends}
                    title={`${name}'s forest`}
                    plotLabel={props.joinable && data.invitePath ? `Join ${name}` : undefined}
                    onPlotClick={props.joinable && data.invitePath ? () => window.location.assign(data.invitePath as string) : undefined}
                />
            </section>
        )
    }

    return (
        <section className="overflow-hidden border-2 border-black bg-forest-ground text-brand-navy" aria-labelledby="forest-heading">
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
                        title={isSelf ? 'Your forest' : `${name}'s forest`}
                        plotLabel={isSelf && data.invitePath ? 'Invite a friend' : undefined}
                        onPlotClick={isSelf && data.invitePath ? shareForest : undefined}
                    />

                    {summary.treesPerMark > 1 || summary.hiddenFriends > 0 ? (
                        <p className="mt-2 text-center text-xs font-semibold text-black/50">
                            {summary.treesPerMark > 1 ? `1 tree mark = ${summary.treesPerMark} trees. ` : ''}
                            {summary.hiddenFriends > 0 ? `+${summary.hiddenFriends} more friends.` : ''}
                        </p>
                    ) : null}
                </div>

                <div className="flex flex-col border-t-2 border-black/15 p-5 sm:p-8 lg:border-l-2 lg:border-t-0">
                    <div className="flex h-4 w-full overflow-hidden border border-black/40 bg-black/5" role="img"
                        aria-label={segments.map(segment => `${segment.label}: ${formatCount(segment.value)}`).join(', ')}>
                        {segments.map(segment => segment.value > 0 ? (
                            <div
                                key={segment.key}
                                style={{
                                    width: `${(segment.value / barTotal) * 100}%`,
                                    backgroundColor: segment.color,
                                }}
                            />
                        ) : null)}
                    </div>

                    <dl className="mt-5 space-y-3">
                        {segments.map(segment => (
                            <div key={segment.key} className="flex items-center justify-between gap-4">
                                <dt className="flex items-center gap-2 text-sm font-semibold text-black/70">
                                    <span className="h-3 w-3 shrink-0" style={{ backgroundColor: segment.color }} aria-hidden="true" />
                                    {segment.label}
                                </dt>
                                <dd className="text-lg font-black tabular-nums">{formatCount(segment.value)}</dd>
                            </div>
                        ))}
                        <div className="flex items-center justify-between gap-4 border-t-2 border-black/20 pt-3">
                            <dt className="text-sm font-black uppercase tracking-wider">Total</dt>
                            <dd className="text-2xl font-black tabular-nums"><span className="bg-brand-yellow px-1">{formatCount(data.totalTrees)}</span></dd>
                        </div>
                    </dl>

                    <div className="pt-6">
                        {isSelf ? (
                            data.invitePath ? (
                                <button
                                    type="button"
                                    onClick={shareForest}
                                    className="inline-flex w-full items-center justify-center gap-2 border-2 border-black bg-brand-yellow px-4 py-3 text-sm font-black uppercase text-black hover:bg-black hover:text-brand-yellow"
                                >
                                    {shared ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
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
