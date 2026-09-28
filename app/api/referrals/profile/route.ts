import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPublicReferralImpact, normalizeReferralCode } from '@/lib/referrals'

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
            .select('user_id, display_name, referral_code')
            .ilike('display_name', escapeIlike(displayName))
            .maybeSingle()

        if (profileError) throw profileError
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const impact = await getPublicReferralImpact(admin, profile.user_id)
        const inviteCode = normalizeReferralCode(profile.referral_code)

        return NextResponse.json({
            displayName: profile.display_name,
            // Invite links are meant to be shared; exposing the code lets
            // visitors of a public profile join through that member.
            invitePath: inviteCode ? `/r/${inviteCode}?channel=profile` : null,
            ...impact,
        })
    } catch (error) {
        console.error('Failed to load public referral impact:', error)
        return NextResponse.json({ error: 'Failed to load referral impact' }, { status: 500 })
    }
}
