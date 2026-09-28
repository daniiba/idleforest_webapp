import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeReferralCode, resolveReferralOwner } from '@/lib/referrals'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'

export async function GET(request: NextRequest) {
    const explicitCode = request.nextUrl.searchParams.get('code')
    const code = normalizeReferralCode(
        explicitCode || request.cookies.get('idleforest_referral')?.value
    )

    if (!code) {
        return NextResponse.json({ valid: false })
    }

    try {
        const admin = createAdminClient()
        const owner = await resolveReferralOwner(admin, code)

        if (!owner) {
            return NextResponse.json({ valid: false }, { status: 404 })
        }

        const reward = await getReferralRewardSettings(admin)

        return NextResponse.json({
            valid: true,
            code: owner.code,
            inviterName: owner.displayName || 'An IdleForest member',
            reward: reward.enabled
                ? { treesPerPerson: reward.treesPerPerson, minActiveDays: reward.minActiveDays }
                : null,
        })
    } catch (error) {
        console.error('Failed to resolve referral code:', error)
        return NextResponse.json({ valid: false }, { status: 500 })
    }
}
