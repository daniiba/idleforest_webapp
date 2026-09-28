import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    normalizeReferralCode,
    recordReferralEvent,
    resolveReferralOwner,
} from '@/lib/referrals'

const REFERRAL_COOKIE = 'idleforest_referral'
const REFERRAL_COOKIE_MAX_AGE = 60 * 60 * 24 * 30
const LOCALES = ['en', 'es', 'de', 'pt', 'fr'] as const

// Link-preview crawlers (WhatsApp, Slack, iMessage, ...) fetch every shared
// link. They should get the preview card but not count as a visit.
const PREVIEW_BOT_PATTERN = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|discord|slack|linkedin|embedly|preview|skype|vkshare|pinterest|redditbot|applebot|googleother|headless/i

function pickLocale(request: NextRequest) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
    if (cookieLocale && (LOCALES as readonly string[]).includes(cookieLocale)) return cookieLocale

    const accepted = (request.headers.get('accept-language') || '')
        .split(',')
        .map(part => part.split(';')[0].trim().slice(0, 2).toLowerCase())

    return accepted.find(language => (LOCALES as readonly string[]).includes(language)) || 'en'
}

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

        // Send people to an invite landing page in their language instead of a
        // bare signup form: they learn what IdleForest is and who invited them
        // before being asked for an email and password.
        const locale = pickLocale(request)
        const landingPath = locale === 'en'
            ? `/join/${encodeURIComponent(owner.code)}`
            : `/${locale}/join/${encodeURIComponent(owner.code)}`
        const response = NextResponse.redirect(new URL(landingPath, request.url))

        response.cookies.set({
            name: REFERRAL_COOKIE,
            value: owner.code,
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:',
            sameSite: 'lax',
            path: '/',
            maxAge: REFERRAL_COOKIE_MAX_AGE,
        })

        if (!PREVIEW_BOT_PATTERN.test(request.headers.get('user-agent') || '')) {
            await recordReferralEvent(admin, {
                eventName: 'landing_viewed',
                referralCode: owner.code,
                referrerId: owner.userId,
                channel: (request.nextUrl.searchParams.get('channel') || 'shared_link').slice(0, 50),
            })
        }

        return response
    } catch (error) {
        console.error('Referral redirect failed:', error)
        signupUrl.searchParams.set('referral_error', 'unavailable')
        return NextResponse.redirect(signupUrl)
    }
}
