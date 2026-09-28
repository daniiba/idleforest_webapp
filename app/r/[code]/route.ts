import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    normalizeReferralCode,
    recordReferralEvent,
    resolveReferralOwner,
} from '@/lib/referrals'

const REFERRAL_COOKIE = 'idleforest_referral'
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30

export async function GET(
    request: NextRequest,
    { params }: { params: { code: string } }
) {
    const code = normalizeReferralCode(params.code)
    const signupUrl = new URL('/auth/user/signup', request.url)

    if (!code) {
        signupUrl.searchParams.set('referral_error', 'invalid')
        return NextResponse.redirect(signupUrl)
    }

    try {
        const admin = createAdminClient()
        const owner = await resolveReferralOwner(admin, code)

        if (!owner) {
            // Preserve compatibility for team invite links accidentally shared
            // through the personal referral route.
            const { data: teamInvite } = await admin
                .from('team_invites')
                .select('invite_code')
                .eq('invite_code', code)
                .maybeSingle()

            if (teamInvite) {
                return NextResponse.redirect(new URL(`/invite/${code}`, request.url))
            }

            signupUrl.searchParams.set('referral_error', 'invalid')
            return NextResponse.redirect(signupUrl)
        }

        signupUrl.searchParams.set('referral', owner.code)
        const response = NextResponse.redirect(signupUrl)

        response.cookies.set({
            name: REFERRAL_COOKIE,
            value: owner.code,
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'lax',
            path: '/',
            maxAge: REFERRAL_COOKIE_MAX_AGE,
        })

        await recordReferralEvent(admin, {
            eventName: 'landing_viewed',
            referralCode: owner.code,
            referrerId: owner.userId,
            channel: (request.nextUrl.searchParams.get('channel') || 'shared_link').slice(0, 50),
        })

        return response
    } catch (error) {
        console.error('Referral redirect failed:', error)
        signupUrl.searchParams.set('referral_error', 'unavailable')
        return NextResponse.redirect(signupUrl)
    }
}
