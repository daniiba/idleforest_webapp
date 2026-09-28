import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { normalizeReferralCode } from '@/lib/referrals'
import { getTreeTotals } from '@/lib/forest'
import { INVITER_REWARD_TYPE, getReferralRewardSettings } from '@/lib/referral-reward-settings'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

type DailyImpactRow = {
    date: string
    own_requests: number | string | null
    referred_requests: number | string | null
}

async function getAuthenticatedUser() {
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null
    return user
}

async function getReferralSummary(userId: string) {
    const admin = createAdminClient()
    const [
        { data: profile, error: profileError },
        { data: attributions, error: attributionsError },
    ] = await Promise.all([
        admin
            .from('profiles')
            .select('referral_code')
            .eq('user_id', userId)
            .maybeSingle(),
        admin
            .from('referral_attributions')
            .select('referred_user_id, signed_up_at, activated_at, rewarded_at')
            .eq('referrer_id', userId),
    ])
    const [rewardSettings, { data: inviterRewards }] = await Promise.all([
        getReferralRewardSettings(admin),
        admin
            .from('user_rewards')
            .select('trees_awarded')
            .eq('user_id', userId)
            .eq('reward_type', INVITER_REWARD_TYPE)
            .eq('status', 'awarded'),
    ])

    if (profileError) throw profileError
    if (attributionsError) throw attributionsError

    const code = normalizeReferralCode(profile?.referral_code)
    const referredUserIds = Array.from(new Set(
        attributions?.map(row => row.referred_user_id).filter(Boolean) || []
    ))
    const impactUserIds = [userId, ...referredUserIds]
    const [
        { data: referredProfiles, error: referredProfilesError },
        { data: impactNodes, error: impactNodesError },
        { data: dailyImpactRows, error: dailyImpactError },
        treeTotals,
    ] = await Promise.all([
        referredUserIds.length > 0
            ? admin
                .from('profiles')
                .select('user_id, display_name')
                .in('user_id', referredUserIds)
            : Promise.resolve({ data: [], error: null }),
        admin
            .from('nodes')
            .select('user_id, total_requests')
            .in('user_id', impactUserIds),
        admin.rpc('get_referral_daily_impact', {
            p_referrer_id: userId,
            p_days: 90,
        }),
        getTreeTotals(admin, referredUserIds),
    ])

    if (referredProfilesError) throw referredProfilesError
    if (impactNodesError) throw impactNodesError
    if (dailyImpactError) throw dailyImpactError

    const profilesByUserId = new Map(
        referredProfiles?.map(referredProfile => [referredProfile.user_id, referredProfile]) || []
    )
    const requestsByUserId = new Map<string, number>()

    for (const node of impactNodes || []) {
        requestsByUserId.set(
            node.user_id,
            (requestsByUserId.get(node.user_id) || 0) + Math.max(0, Number(node.total_requests) || 0)
        )
    }

    const referredUsers = (attributions || [])
        .map(attribution => {
            const referredProfile = profilesByUserId.get(attribution.referred_user_id)

            const totals = treeTotals.get(attribution.referred_user_id)

            return {
                displayName: referredProfile?.display_name || 'IdleForest member',
                trees: totals ? totals.badgeTrees + totals.rewardTrees + totals.referralRewardTrees : 0,
                requests: requestsByUserId.get(attribution.referred_user_id) || 0,
                activated: Boolean(attribution.activated_at),
                rewarded: Boolean(attribution.rewarded_at),
                joinedAt: attribution.signed_up_at,
            }
        })
        .sort((left, right) => right.requests - left.requests)

    const ownRequests = requestsByUserId.get(userId) || 0
    const referredRequests = referredUsers.reduce((sum, referredUser) => sum + referredUser.requests, 0)
    const dailyImpact = (dailyImpactRows || []).map((row: DailyImpactRow) => {
        const ownDailyRequests = Math.max(0, Number(row.own_requests) || 0)
        const referredDailyRequests = Math.max(0, Number(row.referred_requests) || 0)

        return {
            date: row.date,
            ownRequests: ownDailyRequests,
            referredRequests: referredDailyRequests,
            combinedRequests: ownDailyRequests + referredDailyRequests,
        }
    })

    return {
        code: code || null,
        url: code ? `${APP_URL}/r/${code}` : null,
        referrals: attributions?.length || 0,
        activatedReferrals: attributions?.filter(row => row.activated_at).length || 0,
        rewardedReferrals: attributions?.filter(row => row.rewarded_at).length || 0,
        treesFromInvites: (inviterRewards || []).reduce(
            (sum, reward) => sum + (Number(reward.trees_awarded) || 0),
            0
        ),
        reward: rewardSettings.enabled
            ? { treesPerPerson: rewardSettings.treesPerPerson, minActiveDays: rewardSettings.minActiveDays }
            : null,
        ownRequests,
        referredRequests,
        combinedRequests: ownRequests + referredRequests,
        referredUsers,
        dailyImpact,
    }
}

export async function GET() {
    try {
        const user = await getAuthenticatedUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        return NextResponse.json(await getReferralSummary(user.id))
    } catch (error) {
        console.error('Failed to load referral summary:', error)
        return NextResponse.json({ error: 'Failed to load referral summary' }, { status: 500 })
    }
}

export async function POST() {
    try {
        const user = await getAuthenticatedUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Shared with the desktop app: keeps an existing (profile, tree-claim
        // or legacy app) code so links already shared keep working, otherwise
        // generates one, and records link_created.
        const admin = createAdminClient()
        const { data: code, error } = await admin.rpc('ensure_referral_code', {
            p_user_id: user.id,
            p_channel: 'dashboard',
        })

        if (error) {
            if (error.message?.includes('profile not found')) {
                return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
            }
            throw error
        }

        if (!normalizeReferralCode(code)) {
            return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 })
        }

        return NextResponse.json(await getReferralSummary(user.id))
    } catch (error) {
        console.error('Failed to create referral link:', error)
        return NextResponse.json({ error: 'Failed to create referral link' }, { status: 500 })
    }
}
