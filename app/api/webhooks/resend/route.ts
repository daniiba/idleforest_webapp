import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

// Resend webhook event types
type ResendEventType =
    | 'email.sent'
    | 'email.delivered'
    | 'email.opened'
    | 'email.clicked'
    | 'email.bounced'
    | 'email.complained'

interface ResendWebhookPayload {
    type: ResendEventType
    created_at: string
    data: {
        email_id: string
        from: string
        to: string[]
        subject: string
        created_at: string
        // Additional fields for specific events
        click?: { link: string }
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text()

        // Get Svix headers
        const svixId = request.headers.get('svix-id') || ''
        const svixTimestamp = request.headers.get('svix-timestamp') || ''
        const svixSignature = request.headers.get('svix-signature') || ''

        // Verify webhook signature in production
        if (process.env.NODE_ENV === 'production') {
            if (!process.env.RESEND_WEBHOOK_SECRET) {
                console.error('Missing RESEND_WEBHOOK_SECRET')
                return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
            }

            try {
                resend.webhooks.verify({
                    payload,
                    headers: {
                        id: svixId,
                        timestamp: svixTimestamp,
                        signature: svixSignature,
                    },
                    webhookSecret: process.env.RESEND_WEBHOOK_SECRET,
                })
            } catch (err) {
                console.error('Webhook verification failed:', err)
                return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
            }
        }

        const event: ResendWebhookPayload = JSON.parse(payload)
        const { type, data } = event

        console.log(`Received Resend webhook: ${type} for email ${data.email_id}`)

        const supabase = await createClient()

        // Map event type to column update
        const columnUpdates: Record<ResendEventType, string> = {
            'email.sent': 'sent_at',
            'email.delivered': 'delivered_at',
            'email.opened': 'opened_at',
            'email.clicked': 'clicked_at',
            'email.bounced': 'bounced_at',
            'email.complained': 'complained_at'
        }

        const column = columnUpdates[type]

        if (column) {
            const updateData: Record<string, string> = {
                [column]: new Date().toISOString()
            }

            // Update status for bounce/complaint
            if (type === 'email.bounced') {
                updateData.status = 'bounced'
            } else if (type === 'email.complained') {
                updateData.status = 'complained'
            } else if (type === 'email.delivered') {
                updateData.status = 'delivered'
            }

            const { error } = await supabase
                .from('email_logs')
                .update(updateData)
                .eq('resend_id', data.email_id)

            if (error) {
                console.error('Error updating email log:', error)
                // Still return 200 to prevent Resend from retrying
            }
        }

        return NextResponse.json({ received: true })
    } catch (error) {
        console.error('Webhook processing error:', error)
        // Return 200 to prevent retries for parsing errors
        return NextResponse.json({ received: true, error: 'Processing error' })
    }
}

// Resend may send GET requests to verify the endpoint
export async function GET() {
    return NextResponse.json({ status: 'Resend webhook endpoint active' })
}
