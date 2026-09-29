'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import Forest3D from '@/components/forest/Forest3D'
import { forestSceneSummary } from '@/lib/forest-scene'
import type { ForestResponse } from '@/components/forest/ForestImpactPanel'

type TeamForestResponse = ForestResponse & { memberCount: number }

type TeamForestPanelProps = {
    teamSlug: string
    teamName: string
    /** What the empty plots do: invite a teammate, or join the team. */
    plotLabel?: string
    onPlotClick?: () => void
}

// The team's forest: every tree the team planted in the middle, and a named
// grove for each member around it. Empty plots invite the next teammate.
export default function TeamForestPanel({ teamSlug, teamName, plotLabel, onPlotClick }: TeamForestPanelProps) {
    const [data, setData] = useState<TeamForestResponse | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false
        fetch(`/api/forest?team=${encodeURIComponent(teamSlug)}`)
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
    }, [teamSlug])

    if (loading) {
        return (
            <div className="mb-8 flex min-h-64 items-center justify-center border-2 border-black bg-forest-ground">
                <Loader2 className="h-7 w-7 animate-spin text-brand-navy" aria-label="Loading the team forest" />
            </div>
        )
    }
    if (!data) return null

    const summary = forestSceneSummary(data)
    const planting = data.friends.filter(friend => friend.contributing).length
    const empty = data.totalTrees === 0

    return (
        <section className="mb-8 overflow-hidden border-2 border-black bg-forest-ground text-brand-navy" aria-labelledby="team-forest-heading">
            <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3 px-5 py-4 sm:px-6">
                <div>
                    <h2 id="team-forest-heading" className="text-[11px] font-black uppercase tracking-wider text-black/55">
                        {teamName} forest
                    </h2>
                    <p className="mt-1 font-candu text-3xl font-extrabold uppercase leading-none sm:text-4xl">
                        {empty ? 'Just starting' : <><span className="bg-brand-yellow px-1.5">{data.totalTrees.toLocaleString('en')}</span> {data.totalTrees === 1 ? 'tree' : 'trees'}</>}
                    </p>
                </div>
                <dl className="flex gap-6 text-sm font-bold">
                    <div>
                        <dt className="text-[11px] font-black uppercase tracking-wider text-black/55">Members</dt>
                        <dd className="text-xl font-black tabular-nums">{data.memberCount.toLocaleString('en')}</dd>
                    </div>
                    <div>
                        <dt className="text-[11px] font-black uppercase tracking-wider text-black/55">Planting now</dt>
                        <dd className="text-xl font-black tabular-nums">{planting.toLocaleString('en')}</dd>
                    </div>
                </dl>
            </div>

            <Forest3D
                className={empty && data.friends.length === 0 ? '!aspect-[2/1] sm:!aspect-[3/1]' : 'sm:!aspect-[2/1]'}
                seed={data.seed}
                ownTrees={data.ownTrees}
                inviteTrees={0}
                friends={data.friends}
                title={`${teamName} forest`}
                mainTitle="Team forest"
                plotLabel={plotLabel}
                onPlotClick={onPlotClick}
            />

            <p className="border-t-2 border-black/10 px-5 py-3 text-xs font-semibold text-black/60 sm:px-6">
                The middle grove is the whole team. Each small grove is one member and grows as their computer plants trees.
                {summary.hiddenFriends > 0 ? ` Showing the 12 biggest groves, plus ${summary.hiddenFriends} more members.` : ''}
            </p>
        </section>
    )
}
