'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StatsCard3D, { TeamCardData } from '@/components/StatsCard3D'
import { Copy, Check, Twitter, Facebook, Linkedin, Users, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { TeamMilestoneBadges } from '@/components/TeamMilestoneBadges'
import { getFeaturedTeamMilestone, TeamMilestoneMetrics } from '@/lib/team-milestones'
import { useTranslations } from 'next-intl'

const supabase = createClient()

export default function TeamShareClient() {
    const params = useParams()
    const t = useTranslations('Teams')
    const [team, setTeam] = useState<TeamCardData | null>(null)
    const [metrics, setMetrics] = useState<TeamMilestoneMetrics | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchTeam()
    }, [params.slug])

    const fetchTeam = async () => {
        try {
            const { data: teamData } = await supabase
                .from('teams')
                .select('id, name, image_url, total_points, slug')
                .eq('slug', params.slug)
                .single()

            if (teamData) {
                const { count: memberCount } = await supabase
                    .from('team_members')
                    .select('*', { count: 'exact', head: true })
                    .eq('team_id', teamData.id)

                let treesPlanted = Math.floor((teamData.total_points || 0) / 1000)
                let desktopMemberCount = 0

                try {
                    const statsResponse = await fetch(`/api/teams/stats?teamId=${teamData.id}`)
                    if (statsResponse.ok) {
                        const stats = await statsResponse.json()
                        treesPlanted = stats.actualTreesPlanted || treesPlanted
                        desktopMemberCount = stats.desktopMemberCount || 0
                    }
                } catch (error) {
                    console.error('Error fetching share stats:', error)
                }

                setTeam({
                    id: teamData.id,
                    name: teamData.name,
                    imageUrl: teamData.image_url,
                    totalPoints: teamData.total_points || 0,
                    memberCount: memberCount || 0,
                    treesPlanted,
                    slug: teamData.slug
                })
                setMetrics({
                    trees: treesPlanted,
                    members: memberCount || 0,
                    desktopMembers: desktopMemberCount,
                })

                /* We are using the teamData.slug for the button link directly, 
                   since TeamCardData doesn't store slug (except in UserCardData variant)
                   But we can pass it down if needed or just use state 
                */
            }
        } catch (error) {
            console.error('Error fetching team:', error)
        } finally {
            setLoading(false)
        }
    }

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/share/team/${params.slug}`
        : ''

    const featuredMilestone = team
        ? getFeaturedTeamMilestone(metrics || {
            trees: team.treesPlanted || 0,
            members: team.memberCount,
            desktopMembers: 0,
        })
        : null

    const shareText = team
        ? `Check out ${team.name} on IdleForest: ${featuredMilestone
            ? t(`milestones.${featuredMilestone.id}.shareText`)
            : t('share_points_earned', { points: team.totalPoints.toLocaleString() })
        }.`
        : ''

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(team?.name || 'Team Stats')}&summary=${encodeURIComponent(shareText)}`,
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-yellow mx-auto" />
                    <p className="text-white/60 mt-4">Loading team stats...</p>
                </div>
            </main>
        )
    }

    if (!team) {
        return (
            <main className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
                    <Link
                        href="/teams"
                        className="text-brand-yellow hover:underline"
                    >
                        Browse Teams →
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-navy flex flex-col items-center justify-center p-4 py-16">
            {/* Background glow effect */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at 50% 40%, rgba(224, 241, 70, 0.08) 0%, transparent 60%)',
                }}
            />

            <div className="relative z-10 w-full max-w-md mx-auto space-y-8">
                {/* 3D Card */}
                <StatsCard3D variant="team" teamData={team} />

                {metrics && <TeamMilestoneBadges metrics={metrics} />}

                {/* Share buttons */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-center uppercase tracking-wider text-sm">
                        Share This Team
                    </h3>

                    <div className="flex justify-center gap-3">
                        <a
                            href={shareLinks.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-[#1DA1F2] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a
                            href={shareLinks.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-[#4267B2] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Facebook className="w-5 h-5" />
                        </a>
                        <a
                            href={shareLinks.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center w-12 h-12 bg-[#0A66C2] text-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <button
                            onClick={handleCopy}
                            className="flex items-center justify-center w-12 h-12 bg-brand-yellow text-black rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                </div>

                {/* CTA to join */}
                <div className="text-center space-y-4">
                    <Link
                        href={`/teams/${team.slug || team.id}`}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <Users className="w-5 h-5" />
                        View Team & Join
                    </Link>

                    <p className="text-white/40 text-sm">
                        Plant trees for free by sharing your unused bandwidth
                    </p>
                </div>
            </div>
        </main>
    )
}
