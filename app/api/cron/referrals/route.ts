import { NextRequest, NextResponse } from 'next/server'
import { sendReferralNotifications } from '@/lib/referral-notifications'
import { processReferralRewards } from '@/lib/referral-rewards'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Leave headroom under maxDuration for the notification sweep and response.
const REWARD_BUDGET_MS = 35_000
const MAX_NOTIFICATION_BATCHES = 5

function isAuthorized(request: NextRequest) {
    const secret = process.env.REFERRAL_CRON_SECRET || process.env.CRON_SECRET
    return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

// Daily referral housekeeping:
// 1. plant the double-sided reward for invitees who became sustained
//    contributors (and email both people), then
// 2. send any "joined" / "started contributing" emails that were not sent
//    from a request path, mainly activations recorded by the node-sync
//    trigger for people who never reopen the website.
export async function GET(request: NextRequest) {
    if (!isAuthorized(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const startedAt = Date.now()
    const response: Record<string, unknown> = { success: true }

    try {
        response.rewards = await processReferralRewards({
            limit: 200,
            deadline: startedAt + REWARD_BUDGET_MS,
        })
    } catch (error) {
        console.error('Referral reward run failed:', error)
        response.success = false
        response.rewardsError = error instanceof Error ? error.message : 'Unknown error'
    }

    const notifications = { sent: 0, skipped: 0, failed: 0 }
    try {
        for (let batch = 0; batch < MAX_NOTIFICATION_BATCHES; batch += 1) {
            const result = await sendReferralNotifications({ limit: 200 })
            notifications.sent += result.sent
            notifications.skipped += result.skipped
            notifications.failed += result.failed

            // Stop once a batch sends nothing new; remaining rows are either
            // waiting on a template or failed and will be retried next run.
            if (result.sent === 0) break
        }
    } catch (error) {
        console.error('Referral notification sweep failed:', error)
        response.success = false
        response.notificationsError = error instanceof Error ? error.message : 'Unknown error'
    }

    response.notifications = notifications
    return NextResponse.json(response, { status: response.success ? 200 : 500 })
}
