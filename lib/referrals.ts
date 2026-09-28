type SupabaseLike = {
    from: (table: string) => any
}

export type ReferralOwner = {
    userId: string
    code: string
    displayName: string | null
}

export function normalizeReferralCode(value: unknown) {
    if (typeof value !== 'string') return ''

    const code = value.trim().toUpperCase().replace(/[^A-Z0-9]/g, '')
    return code.length > 64 ? '' : code
}

export async function resolveReferralOwner(
    supabase: SupabaseLike,
    rawCode: unknown
): Promise<ReferralOwner | null> {
    const code = normalizeReferralCode(rawCode)
    if (!code) return null

    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name, referral_code')
        .ilike('referral_code', code)
        .maybeSingle()

    if (profile?.user_id) {
        return {
            userId: profile.user_id,
            code,
            displayName: profile.display_name || null,
        }
    }

    // Compatibility with the 623 codes generated before profiles had a
    // canonical referral_code column.
    const { data: legacyClaim } = await supabase
        .from('pending_tree_claims')
        .select('user_id, referral_code')
        .ilike('referral_code', code)
        .maybeSingle()

    let legacyUserId: string | null = legacyClaim?.user_id || null

    if (!legacyUserId) {
        // Codes created by the desktop app and browser extension, which
        // shared https://www.idleforest.com/?ref=CODE links.
        const { data: legacyAppCode, error: legacyAppCodeError } = await supabase
            .from('referral_codes')
            .select('user_id')
            .ilike('code', code)
            .limit(1)
            .maybeSingle()

        if (!legacyAppCodeError) legacyUserId = legacyAppCode?.user_id || null
    }

    if (!legacyUserId) return null

    const { data: legacyProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', legacyUserId)
        .maybeSingle()

    return {
        userId: legacyUserId,
        code,
        displayName: legacyProfile?.display_name || null,
    }
}

type DailyImpactRow = {
    date: string
    own_requests: number | string | null
    referred_requests: number | string | null
}

export type PublicReferralImpact = {
    referrals: number
    activatedReferrals: number
    ownRequests: number
    referredRequests: number
    combinedRequests: number
    dailyImpact: Array<{
        date: string
        ownRequests: number
        referredRequests: number
        combinedRequests: number
    }>
}

// Aggregate-only view of a member's referral impact. It never exposes who was
// invited, so it is safe for public profiles and invite landing pages.
export async function getPublicReferralImpact(
    supabase: SupabaseLike & { rpc: (fn: string, args: Record<string, unknown>) => any },
    userId: string,
    options: { includeDaily?: boolean } = {}
): Promise<PublicReferralImpact> {
    const { data: attributions, error: attributionsError } = await supabase
        .from('referral_attributions')
        .select('referred_user_id')
        .eq('referrer_id', userId)

    if (attributionsError) throw attributionsError

    const referredUserIds: string[] = Array.from(new Set(
        (attributions || [])
            .map((attribution: { referred_user_id: string | null }) => attribution.referred_user_id)
            .filter(Boolean)
    ))

    const [
        { data: nodes, error: nodesError },
        { data: dailyImpactRows, error: dailyImpactError },
    ] = await Promise.all([
        supabase
            .from('nodes')
            .select('user_id, total_requests')
            .in('user_id', [userId, ...referredUserIds]),
        options.includeDaily === false
            ? Promise.resolve({ data: [], error: null })
            : supabase.rpc('get_referral_daily_impact', {
                p_referrer_id: userId,
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

    const ownRequests = requestsByUserId.get(userId) || 0
    const referredRequests = referredUserIds.reduce(
        (sum, referredUserId) => sum + (requestsByUserId.get(referredUserId) || 0),
        0
    )

    return {
        referrals: attributions?.length || 0,
        activatedReferrals: referredUserIds.filter(
            referredUserId => (requestsByUserId.get(referredUserId) || 0) > 0
        ).length,
        ownRequests,
        referredRequests,
        combinedRequests: ownRequests + referredRequests,
        dailyImpact: (dailyImpactRows || []).map((row: DailyImpactRow) => {
            const ownDailyRequests = Math.max(0, Number(row.own_requests) || 0)
            const referredDailyRequests = Math.max(0, Number(row.referred_requests) || 0)

            return {
                date: row.date,
                ownRequests: ownDailyRequests,
                referredRequests: referredDailyRequests,
                combinedRequests: ownDailyRequests + referredDailyRequests,
            }
        }),
    }
}

export async function recordReferralEvent(
    supabase: SupabaseLike,
    input: {
        eventName:
            | 'landing_viewed'
            | 'link_created'
            | 'link_copied'
            | 'native_share_opened'
            | 'share_opened'
            | 'signup_completed'
            | 'activated'
            | 'rewarded'
        referralCode?: string | null
        referrerId?: string | null
        actorUserId?: string | null
        channel?: string | null
    }
) {
    const { error } = await supabase.from('referral_events').insert({
        event_name: input.eventName,
        referral_code: input.referralCode
            ? normalizeReferralCode(input.referralCode)
            : null,
        referrer_id: input.referrerId || null,
        actor_user_id: input.actorUserId || null,
        channel: input.channel || null,
    })

    if (error) {
        console.error('Failed to record referral event:', error)
    }
}
