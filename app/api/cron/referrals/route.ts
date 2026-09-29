import { NextRequest, NextResponse } from 'next/server'
import { sendReferralNotifications } from '@/lib/referral-notifications'
import { processReferralRewards } from '@/lib/referral-rewards'
import { sendForestLaunchBatches, sendStalledFriendNudges } from '@/lib/referral-engagement'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Leave headroom under maxDuration for the notification sweep and response.
const REWARD_BUDGET_MS = 35_000
const MAX_NOTIFICATION_BATCHES = 5
// The forest launch email uses whatever time is left in the run.
const RUN_DEADLINE_MS = 52_000

function isAuthorized(request: NextRequest) {
    const secret = process.env.REFERRAL_CRON_SECRET || process.env.CRON_SECRET
    return Boolean(secret && request.headers.get('authorization') === `Bearer ${secret}`)
}

// Hourly referral housekeeping, triggered by Supabase pg_cron through
// public.run_referral_cron() (see 20261001_referral_one_tree_and_supabase_cron.sql):
// 1. plant the double-sided reward for invitees who became sustained
//    contributors (and email both people), then
// 2. send any "joined" / "started contributing" emails that were not sent
//    from a request path, mainly activations recorded by the node-sync
//    trigger for people who never reopen the website, then
// 3. nudge inviters whose friends joined but never started, and
// 4. send the next batches of the forest launch email while it is switched on.
export async function POST(request: NextRequest) {
    return GET(request)
}

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
            const result = await sendReferralNotifications({ limit: 200, throttle: true })
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

    try {
        response.stalledNudges = await sendStalledFriendNudges({ limit: 200 })
    } catch (error) {
        console.error('Stalled friend nudges failed:', error)
        response.success = false
        response.stalledNudgesError = error instanceof Error ? error.message : 'Unknown error'
    }

    try {
        response.forestLaunch = await sendForestLaunchBatches({ deadline: startedAt + RUN_DEADLINE_MS })
    } catch (error) {
        console.error('Forest launch batch failed:', error)
        response.success = false
        response.forestLaunchError = error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: response.success ? 200 : 500 })
}
