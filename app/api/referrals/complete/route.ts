import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
    normalizeReferralCode,
    recordReferralEvent,
    resolveReferralOwner,
} from '@/lib/referrals'
import { notifyReferrerSafely } from '@/lib/referral-notifications'

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json().catch(() => ({}))
        const code = normalizeReferralCode(
            body.referralCode || user.user_metadata?.referral_code
        )

        if (!code) {
            return NextResponse.json({ success: true, attributed: false })
        }

        const admin = createAdminClient()
        const owner = await resolveReferralOwner(admin, code)

        if (!owner || owner.userId === user.id) {
            return NextResponse.json({ success: true, attributed: false })
        }

        const { data: existing, error: existingError } = await admin
            .from('referral_attributions')
            .select('id, referrer_id')
            .eq('referred_user_id', user.id)
            .maybeSingle()

        if (existingError) throw existingError

        let attribution = existing
        let insertedNow = false

        if (!existing) {
            const { data: createdAttribution, error: attributionError } = await admin
                .from('referral_attributions')
                .insert({
                    referrer_id: owner.userId,
                    referred_user_id: user.id,
                    referral_code: owner.code,
                    source: 'personal_link',
                })
                .select('id, referrer_id')
                .maybeSingle()

            if (attributionError && attributionError.code !== '23505') {
                throw attributionError
            }

            attribution = createdAttribution
            insertedNow = Boolean(createdAttribution)

            if (!attribution) {
                const { data: racedAttribution, error: refetchError } = await admin
                    .from('referral_attributions')
                    .select('id, referrer_id')
                    .eq('referred_user_id', user.id)
                    .maybeSingle()

                if (refetchError) throw refetchError
                attribution = racedAttribution
            }
        }

        if (insertedNow) {
            await recordReferralEvent(admin, {
                eventName: 'signup_completed',
                referralCode: owner.code,
                referrerId: owner.userId,
                actorUserId: user.id,
                channel: 'personal_link',
            })
        }

        const attributed = attribution?.referrer_id === owner.userId

        if (attributed) {
            // The signup trigger usually creates the attribution before this
            // runs, so keep the legacy profile column in sync either way.
            await admin
                .from('profiles')
                .update({ referred_by: owner.userId })
                .eq('user_id', user.id)
                .is('referred_by', null)

            // First authenticated request after signup or email confirmation:
            // tell the referrer while they can still nudge their friend.
            await notifyReferrerSafely(owner.userId)
        }

        return NextResponse.json({
            success: true,
            attributed,
        })
    } catch (error) {
        console.error('Failed to complete referral attribution:', error)
        return NextResponse.json({ error: 'Failed to complete referral attribution' }, { status: 500 })
    }
}
