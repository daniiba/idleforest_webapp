'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import Link from "next/link"
import { Flame, Users } from "lucide-react"

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
                .limit(3)

            if (dailyTeams && dailyTeams.length > 0) {
                const teamIds = dailyTeams.map(t => t.team_id)
                const { data: teamInfo } = await supabase
                    .from('teams')
                    .select('id, name, image_url, slug')
                    .in('id', teamIds)

                const teamMap = new Map(teamInfo?.map(t => [t.id, { name: t.name, image: t.image_url, slug: t.slug }]) || [])

                const enriched = dailyTeams.map(t => ({
                    team_id: t.team_id,
                    team_slug: teamMap.get(t.team_id)?.slug || '',
                    points_gained: t.points_gained_that_day,
                    member_count: t.member_count,
                    team_name: teamMap.get(t.team_id)?.name || 'Unknown',
                    team_image: teamMap.get(t.team_id)?.image || null,
                }))
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
        <div className="hidden md:block bg-brand-gray p-0.5 font-rethink-sans mx-auto w-full">
            <div className="bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-1.5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 opacity-10">
                    <Flame size={40} className="text-black" />
                </div>

                <div className="mb-1 flex items-center gap-1.5 relative z-10">
                    <div className="bg-black p-0.5">
                        <Flame className="h-3 w-3 text-brand-yellow" />
                    </div>
                    <h2 className="text-sm font-extrabold font-candu uppercase tracking-tight text-black">
                        Top Teams Today
                    </h2>
                </div>

                <div className="grid gap-1.5 md:grid-cols-3 relative z-10">
                    {topDailyTeams.map((team, idx) => (
                        <div key={team.team_id} className="bg-white border text-black border-black p-1 flex items-center gap-1.5 hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            <div className={`
                                w-5 h-5 flex items-center justify-center font-bold border border-black text-[10px] shrink-0
                                ${idx === 0 ? 'bg-[#FFD700] text-black' :
                                    idx === 1 ? 'bg-[#C0C0C0] text-black' :
                                        'bg-[#CD7F32] text-black'}
                            `}>
                                {idx + 1}
                            </div>

                            <Link href={`/teams/${team.team_slug}`} className="flex items-center gap-1.5 flex-1 min-w-0">
                                {team.team_image ? (
                                    <img src={team.team_image} alt={team.team_name} className="w-6 h-6 object-cover border border-black shrink-0" />
                                ) : (
                                    <div className="w-6 h-6 bg-brand-yellow border border-black flex items-center justify-center shrink-0">
                                        <Users className="w-3 h-3 text-black" />
                                    </div>
                                )}

                                <div className="min-w-0 flex-1 flex items-center gap-2">
                                    <h3 className="font-bold text-xs text-black truncate leading-none">{team.team_name}</h3>
                                    <p className="text-[9px] font-bold text-neutral-500 leading-none whitespace-nowrap">
                                        <span className="text-green-600">+{formatPoints(team.points_gained)}</span> pts
                                    </p>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
