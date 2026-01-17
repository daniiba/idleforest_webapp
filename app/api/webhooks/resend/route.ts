import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

const RESEND_WEBHOOK_SECRET = process.env.RESEND_WEBHOOK_SECRET

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

// Verify Resend webhook signature
function verifySignature(payload: string, signature: string | null): boolean {
    if (!RESEND_WEBHOOK_SECRET || !signature) {
        console.warn('Missing webhook secret or signature')
        return false
    }

    try {
        // Resend uses svix for webhooks - signature format: v1,timestamp signature
        const [timestamp, sig] = signature.split(',').map(s => s.trim())

        if (!timestamp || !sig) {
            // Try simple HMAC verification as fallback
            const expectedSignature = crypto
                .createHmac('sha256', RESEND_WEBHOOK_SECRET)
                .update(payload)
                .digest('hex')

            return signature === expectedSignature || signature === `sha256=${expectedSignature}`
        }

        // Svix-style verification
        const signedPayload = `${timestamp}.${payload}`
        const expectedSignature = crypto
            .createHmac('sha256', RESEND_WEBHOOK_SECRET)
            .update(signedPayload)
            .digest('base64')

        return sig === expectedSignature
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text()
        const signature = request.headers.get('svix-signature') || request.headers.get('webhook-signature')

        // In development, skip signature verification if no secret is set
        if (process.env.NODE_ENV === 'production' && !verifySignature(payload, signature)) {
            console.error('Invalid webhook signature')
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
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
