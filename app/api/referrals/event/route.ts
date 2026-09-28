import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import {
    normalizeReferralCode,
    recordReferralEvent,
    resolveReferralOwner,
} from '@/lib/referrals'

const TRACKABLE_EVENTS = new Set([
    'link_copied',
    'native_share_opened',
    'share_opened',
])

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const eventName = typeof body.eventName === 'string' ? body.eventName : ''
        const code = normalizeReferralCode(body.referralCode)

        if (!TRACKABLE_EVENTS.has(eventName) || !code) {
            return NextResponse.json({ error: 'Invalid referral event' }, { status: 400 })
        }

        const admin = createAdminClient()
        const owner = await resolveReferralOwner(admin, code)

        if (!owner || owner.userId !== user.id) {
            return NextResponse.json({ error: 'Referral code not found' }, { status: 404 })
        }

        await recordReferralEvent(admin, {
            eventName: eventName as 'link_copied' | 'native_share_opened' | 'share_opened',
            referralCode: owner.code,
            referrerId: owner.userId,
            actorUserId: user.id,
            channel: typeof body.channel === 'string' ? body.channel.slice(0, 50) : 'dashboard',
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to record referral interaction:', error)
        return NextResponse.json({ error: 'Failed to record referral interaction' }, { status: 500 })
    }
}
