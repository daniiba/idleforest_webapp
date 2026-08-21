import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type TreeBadgeType = {
    badge_tiers?: Array<{ id: string }> | null
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const teamId = searchParams.get('teamId')

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        const admin = createAdminClient()

        const { data: members, error: membersError } = await admin
            .from('team_members')
            .select('user_id')
            .eq('team_id', teamId)

        if (membersError) {
            console.error('Team stats member lookup failed', membersError)
            return NextResponse.json({ error: 'Failed to load team members' }, { status: 500 })
        }

        const userIds = members?.map((member) => member.user_id).filter(Boolean) ?? []

        if (userIds.length === 0) {
            return NextResponse.json({
                actualTreesPlanted: 0,
                desktopMemberCount: 0,
                activeDesktopMemberCount: 0,
            })
        }

        const [claimsResult, rewardsResult, treeBadgeResult, desktopNodesResult] = await Promise.all([
            admin
                .from('pending_tree_claims')
                .select('trees_earned')
                .in('user_id', userIds)
                .not('claimed_at', 'is', null),
            admin
                .from('user_rewards')
                .select('trees_awarded')
                .in('user_id', userIds)
                .eq('status', 'awarded'),
            admin
                .from('badge_types')
                .select('badge_tiers (id)')
                .eq('name', 'Tree')
                .maybeSingle(),
            admin
                .from('nodes')
                .select('user_id, platform, total_requests, opt_in')
                .in('user_id', userIds)
                .in('platform', ['win32', 'darwin', 'linux']),
        ])

        if (claimsResult.error) {
            console.error('Team stats claim lookup failed', claimsResult.error)
        }

        if (rewardsResult.error) {
            console.error('Team stats reward lookup failed', rewardsResult.error)
        }

        if (desktopNodesResult.error) {
            console.error('Team stats desktop node lookup failed', desktopNodesResult.error)
        }

        const desktopMemberCount = new Set(
            desktopNodesResult.data?.map((node) => node.user_id).filter(Boolean) ?? []
        ).size
        const activeDesktopMemberCount = new Set(
            desktopNodesResult.data
                ?.filter((node) => node.opt_in !== false && (node.total_requests || 0) > 0)
                .map((node) => node.user_id)
                .filter(Boolean) ?? []
        ).size

        const claimedTrees = claimsResult.data?.reduce(
            (sum, claim) => sum + (claim.trees_earned || 0),
            0
        ) ?? 0

        const rewardTrees = rewardsResult.data?.reduce(
            (sum, reward) => sum + (reward.trees_awarded || 0),
            0
        ) ?? 0

        let legacyBadgeTrees = 0
        const treeBadgeType = treeBadgeResult.data as TreeBadgeType | null
        const treeTierIds = treeBadgeType?.badge_tiers?.map((tier) => tier.id).filter(Boolean) ?? []

        if (treeTierIds.length > 0) {
            const { data: treeProgress, error: treeProgressError } = await admin
                .from('badge_progress')
                .select('user_id, current_value')
                .in('user_id', userIds)
                .in('badge_tier_id', treeTierIds)

            if (treeProgressError) {
                console.error('Team stats badge progress lookup failed', treeProgressError)
            } else if (treeProgress) {
                const perUserTreeProgress = new Map<string, number>()

                for (const progress of treeProgress) {
                    const currentValue = progress.current_value || 0
                    const previousValue = perUserTreeProgress.get(progress.user_id) || 0
                    perUserTreeProgress.set(progress.user_id, Math.max(previousValue, currentValue))
                }

                legacyBadgeTrees = Array.from(perUserTreeProgress.values()).reduce(
                    (sum, trees) => sum + trees,
                    0
                )
            }
        }

        return NextResponse.json({
            actualTreesPlanted: claimedTrees + rewardTrees + legacyBadgeTrees,
            desktopMemberCount,
            activeDesktopMemberCount,
            sources: {
                claimedTrees,
                rewardTrees,
                legacyBadgeTrees,
            },
        })
    } catch (error) {
        console.error('Team stats error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
