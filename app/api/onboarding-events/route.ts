import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_EVENTS = new Set([
    'signup_created',
    'desktop_download_clicked',
    'desktop_node_connected',
    'desktop_reward_awarded',
    'desktop_followup_sent'
])

export async function POST(request: Request) {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        const body = await request.json()
        const eventName = typeof body.eventName === 'string' ? body.eventName : ''

        if (!ALLOWED_EVENTS.has(eventName)) {
            return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
        }

        const metadata = body.metadata && typeof body.metadata === 'object' ? body.metadata : {}
        const source = typeof body.source === 'string' ? body.source : null

        const admin = createAdminClient()
        const { error } = await admin.from('onboarding_events').insert({
            user_id: user?.id || null,
            event_name: eventName,
            source,
            metadata
        })

        if (error) {
            console.error('Failed to track onboarding event', error)
            return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Onboarding event error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
