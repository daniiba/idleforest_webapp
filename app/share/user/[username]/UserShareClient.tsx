'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import StatsCard3D, { UserCardData } from '@/components/StatsCard3D'
import { Copy, Check, Twitter, Facebook, Linkedin, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

interface BadgeTier {
    id: string
}

export default function UserShareClient() {
    const params = useParams()
    const [user, setUser] = useState<UserCardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchUser()
    }, [params.username])

    const fetchUser = async () => {
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, display_name, total_points')
                .ilike('display_name', params.username as string)
                .single()

            if (profile) {
                // Get trees planted from badge progress
                let treesPlanted = 0
                const { data: treeBadgeType } = await supabase
                    .from('badge_types')
                    .select('id, badge_tiers (*)')
                    .eq('name', 'Tree')
                    .single()

                if (treeBadgeType) {
                    const tierIds = (treeBadgeType.badge_tiers as BadgeTier[]).map((tier) => tier.id)
                    const { data: treeProgress } = await supabase
                        .from('badge_progress')
                        .select('current_value')
                        .eq('user_id', profile.user_id)
                        .in('badge_tier_id', tierIds)

                    if (treeProgress && treeProgress.length > 0) {
                        treesPlanted = treeProgress[0].current_value || 0
                    }
                }

                // Get badge count
                const { count: badgeCount } = await supabase
                    .from('badge_progress')
                    .select('*', { count: 'exact', head: true })
                    .eq('user_id', profile.user_id)
                    .gte('current_value', 1) // Only count earned badges

                // Get team
                const { data: teamMembership } = await supabase
                    .from('team_members')
                    .select('team_id')
                    .eq('user_id', profile.user_id)
                    .single()

                let team = null
                if (teamMembership) {
                    const { data: teamData } = await supabase
                        .from('teams')
                        .select('id, name, slug')
                        .eq('id', teamMembership.team_id)
                        .single()
                    team = teamData
                }

                setUser({
                    username: profile.display_name.toLowerCase(),
                    displayName: profile.display_name,
                    totalPoints: profile.total_points || 0,
                    treesPlanted,
                    badgeCount: badgeCount || 0,
                    team,
                })
            }
        } catch (error) {
            console.error('Error fetching user:', error)
        } finally {
            setLoading(false)
        }
    }

    const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/share/user/${params.username}`
        : ''

    const shareText = user
        ? `Check out ${user.displayName}'s stats on IdleForest! 🌲 ${user.totalPoints.toLocaleString()} points earned planting trees.`
        : ''

    const handleCopy = async () => {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const shareLinks = {
        twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(user?.displayName || 'User Stats')}&summary=${encodeURIComponent(shareText)}`,
    }

    if (loading) {
        return (
            <main className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-yellow mx-auto" />
                    <p className="text-white/60 mt-4">Loading stats...</p>
                </div>
            </main>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen bg-brand-navy flex items-center justify-center p-4">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-white mb-4">User Not Found</h1>
                    <Link
                        href="/"
                        className="text-brand-yellow hover:underline"
                    >
                        Go Home →
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
                <StatsCard3D variant="user" userData={user} />

                {/* Share buttons */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                    <h3 className="text-white font-bold text-center uppercase tracking-wider text-sm">
                        Share These Stats
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
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-brand-yellow text-black font-bold uppercase border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        <ArrowRight className="w-5 h-5" />
                        Join IdleForest
                    </Link>

                    <p className="text-white/40 text-sm">
                        Plant trees for free by sharing your unused bandwidth
                    </p>
                </div>
            </div>
        </main>
    )
}
