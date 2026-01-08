'use client'

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Trophy, Medal, Trees, User } from 'lucide-react'
import Link from "next/link"

interface Ranking {
    user_id: string
    display_name: string
    lifetime_trees: number
    updated_at: string
    rank?: number
}

export default function RankingsPage() {
    const [rankings, setRankings] = useState<Ranking[]>([])
    const [loading, setLoading] = useState(true)
    const [currentUser, setCurrentUser] = useState<string | null>(null)

    useEffect(() => {
        const fetchRankings = async () => {
            const supabase = createClient()

            // Get current user
            const { data: { user } } = await supabase.auth.getUser()
            setCurrentUser(user?.id || null)

            // Get rankings
            const { data, error } = await supabase
                .from('game_rankings')
                .select('*')
                .order('lifetime_trees', { ascending: false })
                .limit(50)

            if (!error && data) {
                setRankings(data.map((r, index) => ({ ...r, rank: index + 1 })))
            }
            setLoading(false)
        }

        fetchRankings()
    }, [])

    return (
        <div className="container mx-auto p-4 pt-12 max-w-4xl">
            <div className="flex items-center gap-4 mb-8">
                <div className="bg-brand-yellow p-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Trophy className="w-8 h-8 text-black" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold font-candu uppercase leading-none">
                        Global <span className="bg-black text-brand-yellow px-2">Leaderboard</span>
                    </h1>
                    <p className="text-neutral-600 font-bold font-mono text-sm tracking-widest mt-1">
                        Top Foresters
                    </p>
                </div>
            </div>

            <Card className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 bg-brand-navy text-white font-bold uppercase tracking-wider text-xs border-b-2 border-black">
                    <div className="col-span-2 md:col-span-1 text-center">Rank</div>
                    <div className="col-span-7 md:col-span-8">Planter</div>
                    <div className="col-span-3 text-right">Trees</div>
                </div>

                <div className="divide-y-2 divide-neutral-100">
                    {loading ? (
                        <div className="p-8 text-center text-neutral-400 animate-pulse">
                            Loading rankings...
                        </div>
                    ) : rankings.length === 0 ? (
                        <div className="p-8 text-center text-neutral-400">
                            No rankings yet. Be the first to plant a tree!
                        </div>
                    ) : (
                        rankings.map((player) => (
                            <div
                                key={player.user_id}
                                className={`grid grid-cols-12 gap-4 p-4 items-center font-rethink-sans
                                    ${player.user_id === currentUser ? 'bg-brand-yellow/10' : 'hover:bg-neutral-50'}
                                `}
                            >
                                <div className="col-span-2 md:col-span-1 flex justify-center">
                                    {player.rank === 1 && <Medal className="w-6 h-6 text-yellow-500 drop-shadow-sm" />}
                                    {player.rank === 2 && <Medal className="w-6 h-6 text-gray-400 drop-shadow-sm" />}
                                    {player.rank === 3 && <Medal className="w-6 h-6 text-amber-700 drop-shadow-sm" />}
                                    {player.rank && player.rank > 3 && (
                                        <span className="font-mono font-bold text-neutral-500">#{player.rank}</span>
                                    )}
                                </div>

                                <div className="col-span-7 md:col-span-8 flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full border-2 border-black flex items-center justify-center
                                        ${player.user_id === currentUser ? 'bg-brand-yellow' : 'bg-neutral-200'}
                                    `}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold truncate">
                                            {player.display_name || 'Anonymous Planter'}
                                        </div>
                                        {player.user_id === currentUser && (
                                            <div className="text-[10px] uppercase font-bold text-brand-yellow bg-black px-1.5 rounded w-fit">
                                                You
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="col-span-3 text-right">
                                    <div className="font-mono font-bold text-lg leading-none">
                                        {Math.floor(player.lifetime_trees).toLocaleString()}
                                    </div>
                                    <div className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Trees</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>

            <div className="mt-8 text-center">
                <Link href="/game">
                    <button className="bg-black text-white px-8 py-3 font-bold font-candu uppercase text-lg border-2 border-transparent hover:bg-brand-yellow hover:text-black hover:border-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        Plant More Trees
                    </button>
                </Link>
            </div>
        </div>
    )
}
