import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/resend'

type FollowupStage = '15m' | '24h' | '3d'

const STAGE_CONFIG: Record<FollowupStage, { minAgeHours: number; segment: string; subject: string; intro: string }> = {
    '15m': {
        minAgeHours: 0.25,
        segment: 'desktop_followup_15m',
        subject: 'Your desktop bonus trees are waiting 🌲',
        intro: 'You created your IdleForest account. The next step is connecting the desktop app so we can award your 5 bonus trees.'
    },
    '24h': {
        minAgeHours: 24,
        segment: 'desktop_followup_24h',
        subject: 'Still want your 5 desktop bonus trees?',
        intro: 'Your desktop bonus is still waiting. Install IdleForest on your computer, log in, and we will detect the desktop sync automatically.'
    },
    '3d': {
        minAgeHours: 72,
        segment: 'desktop_followup_3d',
        subject: 'Last call for your desktop bonus trees',
        intro: 'IdleForest plants the most when the desktop app is running. Connect it now to unlock your 5 bonus trees and keep planting in the background.'
    }
}

export async function POST(request: Request) {
    const secret = process.env.DESKTOP_FOLLOWUP_SECRET || process.env.CRON_SECRET
    const authHeader = request.headers.get('authorization')

    if (!secret || authHeader !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = (searchParams.get('stage') || '24h') as FollowupStage
    const send = searchParams.get('send') === 'true'
    const limit = Math.min(Number(searchParams.get('limit') || 100), 500)
    const config = STAGE_CONFIG[stage]

    if (!config) {
        return NextResponse.json({ error: 'Invalid follow-up stage' }, { status: 400 })
    }

    const admin = createAdminClient()
    const cutoff = new Date(Date.now() - config.minAgeHours * 60 * 60 * 1000)

    const { data: nodes, error: nodesError } = await admin
        .from('nodes')
        .select('user_id, platform')
        .not('user_id', 'is', null)

    if (nodesError) {
        return NextResponse.json({ error: 'Failed to load node data' }, { status: 500 })
    }

    const desktopUserIds = new Set(
        nodes
            ?.filter(node => ['win32', 'darwin', 'linux'].includes(node.platform || ''))
            .map(node => node.user_id)
            .filter(Boolean) || []
    )

    const { data: priorLogs } = await admin
        .from('email_logs')
        .select('email')
        .eq('segment', config.segment)

    const emailed = new Set(priorLogs?.map(log => log.email) || [])

    const candidates: Array<{ id: string; email: string; name: string }> = []
    let page = 1
    const perPage = 1000

    while (candidates.length < limit) {
        const { data, error } = await admin.auth.admin.listUsers({ page, perPage })

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        const users = data.users || []
        for (const user of users) {
            if (candidates.length >= limit) break
            if (!user.email || emailed.has(user.email) || desktopUserIds.has(user.id)) continue
            if (new Date(user.created_at) > cutoff) continue

            candidates.push({
                id: user.id,
                email: user.email,
                name: user.user_metadata?.display_name || 'there'
            })
        }

        if (users.length < perPage) break
        page++
    }

    if (!send) {
        return NextResponse.json({
            dryRun: true,
            stage,
            segment: config.segment,
            count: candidates.length,
            preview: candidates.slice(0, 10)
        })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://idleforest.com'
    const results: Array<{ email: string; success: boolean; error?: string }> = []

    for (const candidate of candidates) {
        const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; line-height: 1.6; color: #0B101F; margin: 0; padding: 32px 20px; background-color: #D9D9D9;">
  <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border: 2px solid #000000;">
    <div style="background-color: #E0F146; padding: 20px 24px; border-bottom: 2px solid #000000;">
      <img src="https://idleforest.com/logo.png" alt="IdleForest" style="height: 28px;">
    </div>
    <div style="padding: 32px;">
      <p style="margin: 0 0 20px 0; font-size: 16px;">Hi ${candidate.name},</p>
      <p style="margin: 0 0 20px 0; font-size: 16px;">${config.intro}</p>
      <p style="margin: 0 0 20px 0; font-size: 16px;">The desktop app keeps planting even when your browser is closed, so it is the fastest way to grow your impact.</p>
      <div style="text-align: center; margin: 28px 0;">
        <a href="${appUrl}/welcome" style="display: inline-block; padding: 14px 28px; background-color: #E0F146; color: #0B101F; text-decoration: none; font-weight: 800; text-transform: uppercase; border: 2px solid #000000;">Connect Desktop App</a>
      </div>
      <p style="margin: 0; font-size: 14px; color: #666;">Open the page, download the app, and log in with the same account. We will detect the desktop sync automatically.</p>
    </div>
  </div>
</body>
</html>`

        const result = await sendEmail(candidate.email, config.subject, html)
        results.push({ email: candidate.email, success: result.success, error: result.error })

        await admin.from('email_logs').insert({
            user_id: candidate.id,
            email: candidate.email,
            subject: config.subject,
            email_type: 'transactional',
            segment: config.segment,
            resend_id: result.emailId || null,
            status: result.success ? 'sent' : 'failed'
        })

        if (result.success) {
            await admin.from('onboarding_events').insert({
                user_id: candidate.id,
                event_name: 'desktop_followup_sent',
                source: 'desktop_followup_cron',
                metadata: { stage, segment: config.segment }
            })
        }
    }

    return NextResponse.json({
        dryRun: false,
        stage,
        segment: config.segment,
        sent: results.filter(result => result.success).length,
        failed: results.filter(result => !result.success).length,
        results
    })
}
