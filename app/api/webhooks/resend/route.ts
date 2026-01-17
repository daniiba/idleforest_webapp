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

// Verify Resend webhook signature using Svix format
function verifySignature(
    payload: string,
    signatureHeader: string | null,
    timestampHeader: string | null,
    idHeader: string | null
): boolean {
    if (!RESEND_WEBHOOK_SECRET) {
        console.warn('Missing webhook secret')
        return false
    }

    if (!signatureHeader || !timestampHeader) {
        console.warn('Missing signature or timestamp header')
        return false
    }

    try {
        // Get the secret - Resend secrets start with "whsec_" and are base64 encoded
        let secret = RESEND_WEBHOOK_SECRET
        if (secret.startsWith('whsec_')) {
            secret = secret.slice(6) // Remove "whsec_" prefix
        }
        const secretBytes = Buffer.from(secret, 'base64')

        // Create the signed payload (timestamp.payload)
        const signedPayload = `${timestampHeader}.${payload}`

        // Calculate expected signature
        const expectedSignature = crypto
            .createHmac('sha256', secretBytes)
            .update(signedPayload)
            .digest('base64')

        // The signature header contains space-separated list of versioned signatures
        // Format: "v1,signature1 v1,signature2 ..."
        const signatures = signatureHeader.split(' ')

        for (const versionedSig of signatures) {
            const [version, sig] = versionedSig.split(',')
            if (version === 'v1' && sig === expectedSignature) {
                return true
            }
        }

        console.warn('No matching signature found')
        return false
    } catch (error) {
        console.error('Signature verification error:', error)
        return false
    }
}

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text()

        // Get all Svix headers
        const svixSignature = request.headers.get('svix-signature')
        const svixTimestamp = request.headers.get('svix-timestamp')
        const svixId = request.headers.get('svix-id')

        // In development, skip signature verification if no secret is set
        if (process.env.NODE_ENV === 'production' && !verifySignature(payload, svixSignature, svixTimestamp, svixId)) {
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
