import { NextRequest, NextResponse } from 'next/server'
import { sendReferralNotifications } from '@/lib/referral-notifications'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_BATCHES = 5

function isAuthorized(request: NextRequest) {
    const secret = process.env.REFERRAL_CRON_SECRET || process.env.CRON_SECRET
    return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

// Sweep for referrer emails that were not sent from a request path, mainly
// activations recorded by the node-sync trigger for users who never reopen
// the website. Groups everything pending into one email per referrer.
export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const totals = { sent: 0, skipped: 0, failed: 0 }

    try {
        for (let batch = 0; batch < MAX_BATCHES; batch += 1) {
            const result = await sendReferralNotifications({ limit: 200 })
            totals.sent += result.sent
            totals.skipped += result.skipped
            totals.failed += result.failed

            // Stop once a batch sends nothing new; remaining rows are either
            // waiting on a template or failed and will be retried next run.
            if (result.sent === 0) break
        }

        return NextResponse.json({ success: true, ...totals })
    } catch (error) {
        console.error('Referral notification sweep failed:', error)
        return NextResponse.json({ success: false, ...totals }, { status: 500 })
    }
}
