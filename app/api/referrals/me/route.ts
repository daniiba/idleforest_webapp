import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
    generateReferralCode,
    normalizeReferralCode,
    recordReferralEvent,
} from '@/lib/referrals'

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

            return {
                displayName: referredProfile?.display_name || 'IdleForest member',
                requests: requestsByUserId.get(attribution.referred_user_id) || 0,
                activated: Boolean(attribution.activated_at),
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

        const admin = createAdminClient()
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('referral_code')
            .eq('user_id', user.id)
            .maybeSingle()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        let code = normalizeReferralCode(profile.referral_code)
        let createdNow = false

        if (!code) {
            const { data: legacyClaim } = await admin
                .from('pending_tree_claims')
                .select('referral_code')
                .eq('user_id', user.id)
                .maybeSingle()

            const legacyCode = normalizeReferralCode(legacyClaim?.referral_code)

            if (legacyCode) {
                const { data: updatedProfile, error: updateError } = await admin
                    .from('profiles')
                    .update({ referral_code: legacyCode })
                    .eq('user_id', user.id)
                    .is('referral_code', null)
                    .select('referral_code')
                    .maybeSingle()

                if (updateError) throw updateError

                code = normalizeReferralCode(updatedProfile?.referral_code)
                createdNow = Boolean(code)
            }
        }

        for (let attempt = 0; !code && attempt < 6; attempt += 1) {
            const candidate = generateReferralCode()
            const { data: updatedProfile, error } = await admin
                .from('profiles')
                .update({ referral_code: candidate })
                .eq('user_id', user.id)
                .is('referral_code', null)
                .select('referral_code')
                .maybeSingle()

            if (error?.code === '23505') continue
            if (error) throw error

            code = normalizeReferralCode(updatedProfile?.referral_code)
            if (code) {
                createdNow = true
                break
            }

            // Another request may have won the race to assign this user's code.
            const { data: currentProfile, error: refetchError } = await admin
                .from('profiles')
                .select('referral_code')
                .eq('user_id', user.id)
                .maybeSingle()

            if (refetchError) throw refetchError
            code = normalizeReferralCode(currentProfile?.referral_code)
        }

        if (!code) {
            return NextResponse.json({ error: 'Failed to create invite link' }, { status: 500 })
        }

        if (createdNow) {
            await recordReferralEvent(admin, {
                eventName: 'link_created',
                referralCode: code,
                referrerId: user.id,
                actorUserId: user.id,
                channel: 'dashboard',
            })
        }

        return NextResponse.json(await getReferralSummary(user.id))
    } catch (error) {
        console.error('Failed to create referral link:', error)
        return NextResponse.json({ error: 'Failed to create referral link' }, { status: 500 })
    }
}
