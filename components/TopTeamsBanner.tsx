'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { Link } from "@/navigation"
import { Flame, Users } from "lucide-react"
import { isHiddenTopTeamSlug } from "@/lib/team-visibility"

interface PeriodTeamStat {
    team_id: string
    team_slug: string
    points_gained: number
    member_count: number
    team_name?: string
    team_image?: string | null
    member_growth?: number
}

const supabase = createClient()

export default function TopTeamsBanner() {
    const [topDailyTeams, setTopDailyTeams] = useState<PeriodTeamStat[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchTopDailyTeams()
    }, [])

    const fetchTopDailyTeams = async () => {
        try {
            const today = new Date().toISOString().split('T')[0]
            const { data: dailyTeams } = await supabase
                .from('team_daily_stats')
                .select('team_id, points_gained_that_day, member_count')
                .eq('date', today)
                .order('points_gained_that_day', { ascending: false })
                .limit(10)

            if (dailyTeams && dailyTeams.length > 0) {
                const teamIds = dailyTeams.map(t => t.team_id)
                const { data: teamInfo } = await supabase
                    .from('teams')
                    .select('id, name, image_url, slug')
                    .in('id', teamIds)

                const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url, slug: t.slug }]) || [])

                const enriched = dailyTeams
                    .map(t => ({
                        team_id: t.team_id,
                        team_slug: teamMap.get(t.team_id)?.slug || '',
                        points_gained: t.points_gained_that_day,
                        member_count: t.member_count,
                        team_name: teamMap.get(t.team_id)?.name || 'Unknown',
                        team_image: teamMap.get(t.team_id)?.image || null,
                    }))
                    .filter(team => team.team_slug && !isHiddenTopTeamSlug(team.team_slug))
                    .slice(0, 3)
                setTopDailyTeams(enriched)
            } else {
                setTopDailyTeams([])
            }
        } catch (error) {
            console.error('Error fetching top daily teams:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatPoints = (n: number) => Math.round(n).toLocaleString()

    if (topDailyTeams.length === 0) return null

    return (
        <div className="hidden w-full bg-brand-navy text-white md:block">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-2">
                <h2 className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-brand-yellow">
                    <Flame className="h-3.5 w-3.5" aria-hidden="true" />
                    Top teams today
                </h2>

                <div className="grid flex-1 gap-2 md:grid-cols-3">
                    {topDailyTeams.map((team, idx) => (
                        <Link
                            key={team.team_id}
                            href={`/teams/${team.team_slug}`}
                            className="flex min-w-0 items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 transition-colors hover:bg-white/20"
                        >
                            <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-brand-navy ${idx === 0 ? 'bg-brand-yellow' : 'bg-white/80'}`}>
                                {idx + 1}
                            </span>
                            {team.team_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={team.team_image} alt="" className="h-5 w-5 shrink-0 rounded-full object-cover" />
                            ) : (
                                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-yellow text-brand-navy">
                                    <Users className="h-3 w-3" aria-hidden="true" />
                                </span>
                            )}
                            <span className="min-w-0 flex-1 truncate text-xs font-semibold">{team.team_name}</span>
                            <span className="shrink-0 text-[11px] font-medium text-green-300">+{formatPoints(team.points_gained)} pts</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
