type SupabaseLike = {
    from: (table: string) => any
}

type SignupMetadata = {
    referral_code?: unknown
    invite_code?: unknown
}

function normalizeCode(value: unknown) {
    return typeof value === 'string' ? value.trim() : ''
}

export async function resolveSignupReferrer(
    supabase: SupabaseLike,
    userId: string,
    metadata: SignupMetadata = {}
) {
    const referralCode = normalizeCode(metadata.referral_code).toUpperCase()

    if (referralCode) {
        const { data: referralClaim, error } = await supabase
            .from('pending_tree_claims')
            .select('user_id')
            .eq('referral_code', referralCode)
            .maybeSingle()

        if (error) {
            console.error('Failed to resolve signup referral code:', error)
        }

        if (referralClaim?.user_id && referralClaim.user_id !== userId) {
            return referralClaim.user_id as string
        }
    }

    const inviteCode = normalizeCode(metadata.invite_code)

    if (inviteCode) {
        const { data: companyInvite, error: companyInviteError } = await supabase
            .from('companies')
            .select('id')
            .eq('invite_code', inviteCode)
            .maybeSingle()

        if (companyInviteError) {
            console.error('Failed to check company invite before referral attribution:', companyInviteError)
        }

        if (companyInvite) {
            return null
        }

        const { data: invite, error } = await supabase
            .from('team_invites')
            .select('created_by')
            .eq('invite_code', inviteCode)
            .maybeSingle()

        if (error) {
            console.error('Failed to resolve team invite referrer:', error)
        }

        if (invite?.created_by && invite.created_by !== userId) {
            return invite.created_by as string
        }
    }

    return null
}

export async function attributePendingTreeClaim(
    supabase: SupabaseLike,
    userId: string,
    referredBy: string | null
) {
    if (!referredBy || referredBy === userId) {
        return
    }

    const { error } = await supabase
        .from('pending_tree_claims')
        .update({ referred_by: referredBy })
        .eq('user_id', userId)
        .is('referred_by', null)

    if (error) {
        console.error('Failed to attribute pending tree claim referral:', error)
    }
}
