import crypto from 'crypto'

const REFERRAL_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const REFERRAL_CODE_LENGTH = 8

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

export function generateReferralCode() {
    const bytes = crypto.randomBytes(REFERRAL_CODE_LENGTH)
    let code = ''

    for (let index = 0; index < bytes.length; index += 1) {
        code += REFERRAL_CODE_ALPHABET[bytes[index] % REFERRAL_CODE_ALPHABET.length]
    }

    return code
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

    if (!legacyClaim?.user_id) return null

    const { data: legacyProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', legacyClaim.user_id)
        .maybeSingle()

    return {
        userId: legacyClaim.user_id,
        code,
        displayName: legacyProfile?.display_name || null,
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
