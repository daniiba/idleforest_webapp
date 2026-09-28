import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeReferralCode, resolveReferralOwner } from '@/lib/referrals'

export async function GET(request: NextRequest) {
    const explicitCode = request.nextUrl.searchParams.get('code')
    const code = normalizeReferralCode(
        explicitCode || request.cookies.get('idleforest_referral')?.value
    )

    if (!code) {
        return NextResponse.json({ valid: false })
    }

    try {
        const owner = await resolveReferralOwner(createAdminClient(), code)

        if (!owner) {
            return NextResponse.json({ valid: false }, { status: 404 })
        }

        return NextResponse.json({
            valid: true,
            code: owner.code,
            inviterName: owner.displayName || 'An IdleForest member',
        })
    } catch (error) {
        console.error('Failed to resolve referral code:', error)
        return NextResponse.json({ valid: false }, { status: 500 })
    }
}
