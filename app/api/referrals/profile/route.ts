import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type DailyImpactRow = {
    date: string
    own_requests: number | string | null
    referred_requests: number | string | null
}

function escapeIlike(value: string) {
    return value.replace(/[\\%_]/g, character => `\\${character}`)
}

export async function GET(request: NextRequest) {
    const displayName = request.nextUrl.searchParams.get('displayName')?.trim()

    if (!displayName || displayName.length > 100) {
        return NextResponse.json({ error: 'Profile name is required' }, { status: 400 })
    }

    try {
        const admin = createAdminClient()
        const { data: profile, error: profileError } = await admin
            .from('profiles')
            .select('user_id, display_name')
            .ilike('display_name', escapeIlike(displayName))
            .maybeSingle()

        if (profileError) throw profileError
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const { data: attributions, error: attributionsError } = await admin
            .from('referral_attributions')
            .select('referred_user_id, activated_at')
            .eq('referrer_id', profile.user_id)

        if (attributionsError) throw attributionsError

        const referredUserIds = Array.from(new Set(
            attributions?.map(attribution => attribution.referred_user_id).filter(Boolean) || []
        ))
        const impactUserIds = [profile.user_id, ...referredUserIds]

        const [
            { data: nodes, error: nodesError },
            { data: dailyImpactRows, error: dailyImpactError },
        ] = await Promise.all([
            admin
                .from('nodes')
                .select('user_id, total_requests')
                .in('user_id', impactUserIds),
            admin.rpc('get_referral_daily_impact', {
                p_referrer_id: profile.user_id,
                p_days: 90,
            }),
        ])

        if (nodesError) throw nodesError
        if (dailyImpactError) throw dailyImpactError

        const requestsByUserId = new Map<string, number>()
        for (const node of nodes || []) {
            requestsByUserId.set(
                node.user_id,
                (requestsByUserId.get(node.user_id) || 0) + Math.max(0, Number(node.total_requests) || 0)
            )
        }

        const ownRequests = requestsByUserId.get(profile.user_id) || 0
        const referredRequests = referredUserIds.reduce(
            (sum, userId) => sum + (requestsByUserId.get(userId) || 0),
            0
        )
        const contributingReferrals = referredUserIds.filter(
            userId => (requestsByUserId.get(userId) || 0) > 0
        ).length
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

        return NextResponse.json({
            displayName: profile.display_name,
            referrals: attributions?.length || 0,
            activatedReferrals: contributingReferrals,
            ownRequests,
            referredRequests,
            combinedRequests: ownRequests + referredRequests,
            dailyImpact,
        })
    } catch (error) {
        console.error('Failed to load public referral impact:', error)
        return NextResponse.json({ error: 'Failed to load referral impact' }, { status: 500 })
    }
}
