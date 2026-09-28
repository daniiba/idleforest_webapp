import { createAdminClient } from '@/lib/supabase/admin'
import { generateUnsubscribeUrl, sendEmail } from '@/lib/resend'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'

// Referrers hear back at the two moments that make them invite again: when a
// friend joins (so they can nudge them through setup) and when that friend's
// node starts contributing. Templates live in email_templates so copy can be
// edited from the admin dashboard without a deploy.

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'
const DEFAULT_FROM = 'Daniel from IdleForest <daniel@idleforest.com>'

// Immediate sends are skipped while a referrer has had a referral email this
// recently. The daily sweep then batches everything that piled up into one
// email per referrer, so a popular link never floods an inbox.
const IMMEDIATE_THROTTLE_MS = 3 * 60 * 60 * 1000

type NotificationKind = 'joined' | 'activated'

const NOTIFICATIONS: Record<NotificationKind, {
    templateName: string
    segment: string
    column: 'joined_notified_at' | 'activated_notified_at'
}> = {
    joined: {
        templateName: 'Referral: friend joined',
        segment: 'referral_friend_joined',
        column: 'joined_notified_at',
    },
    activated: {
        templateName: 'Referral: friend contributing',
        segment: 'referral_friend_contributing',
        column: 'activated_notified_at',
    },
}

const REFERRAL_SEGMENTS = Object.values(NOTIFICATIONS).map(notification => notification.segment)

type PendingNotification = {
    attribution_id: string
    kind: NotificationKind
    referrer_id: string
    referrer_email: string
    referrer_name: string | null
    referrer_code: string | null
    friend_name: string | null
    contributing_count: number | string
}

type EmailTemplate = {
    id: string
    name: string
    subject: string
    content: string
    from_email: string | null
}

export type ReferralNotificationResult = {
    sent: number
    skipped: number
    failed: number
}

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
}

export function formatFriendNames(names: string[]) {
    const unique = Array.from(new Set(names))

    if (unique.length === 0) return 'Someone you invited'
    if (unique.length === 1) return unique[0]
    if (unique.length === 2) return `${unique[0]} and ${unique[1]}`

    const others = unique.length - 1
    return `${unique[0]} and ${others} others`
}

export function renderReferralTemplate(template: string, values: Record<string, string>, escape: boolean) {
    return template.replace(/\{\{\{?([A-Z_]+)\}?\}\}/g, (match, key: string) => {
        if (!(key in values)) return match
        return escape ? escapeHtml(values[key]) : values[key]
    })
}

export function referralsPageUrl(campaign: string) {
    return `${APP_URL}/referrals?utm_source=resend&utm_medium=email&utm_campaign=${encodeURIComponent(campaign)}`
}

export function inviteUrlForCode(code: string | null | undefined, channel: string) {
    return code ? `${APP_URL}/r/${encodeURIComponent(code)}?channel=${encodeURIComponent(channel)}` : null
}

/**
 * Sends one email from a stored template to one member, honouring
 * unsubscribes and logging to email_logs. Never throws.
 */
export async function sendTemplatedEmail(
    admin: ReturnType<typeof createAdminClient>,
    input: {
        templateName: string
        to: string
        userId: string
        segment: string
        values: Record<string, string>
    }
): Promise<{ sent: boolean; reason?: 'unsubscribed' | 'missing_template' | 'failed' }> {
    try {
        const { data: unsubscribed } = await admin
            .from('email_logs')
            .select('id')
            .eq('email', input.to)
            .eq('status', 'unsubscribed')
            .limit(1)

        if (unsubscribed && unsubscribed.length > 0) return { sent: false, reason: 'unsubscribed' }

        const { data: template } = await admin
            .from('email_templates')
            .select('id, name, subject, content, from_email')
            .eq('name', input.templateName)
            .maybeSingle()

        if (!template) {
            console.warn(`Referral email template missing: ${input.templateName}`)
            return { sent: false, reason: 'missing_template' }
        }

        const values = { ...input.values, UNSUBSCRIBE_URL: await generateUnsubscribeUrl(input.to) }
        const subject = renderReferralTemplate(template.subject, values, false).replace(/[\r\n]+/g, ' ')
        const html = renderReferralTemplate(template.content, values, true)
        const result = await sendEmail(input.to, subject, html, template.from_email || DEFAULT_FROM)

        await admin.from('email_logs').insert({
            user_id: input.userId,
            email: input.to,
            subject,
            template_id: template.id,
            email_type: 'transactional',
            segment: input.segment,
            resend_id: result.emailId || null,
            status: result.success ? 'sent' : 'failed',
        })

        if (!result.success) console.error('Failed to send referral email:', result.error)
        return result.success ? { sent: true } : { sent: false, reason: 'failed' }
    } catch (error) {
        console.error('Failed to send referral email:', error)
        return { sent: false, reason: 'failed' }
    }
}

async function loadTemplates(admin: ReturnType<typeof createAdminClient>) {
    const { data, error } = await admin
        .from('email_templates')
        .select('id, name, subject, content, from_email')
        .in('name', Object.values(NOTIFICATIONS).map(notification => notification.templateName))

    if (error) throw error

    return new Map((data as EmailTemplate[] | null || []).map(template => [template.name, template]))
}

async function setNotified(
    admin: ReturnType<typeof createAdminClient>,
    ids: string[],
    kind: NotificationKind
): Promise<string[]> {
    const { column } = NOTIFICATIONS[kind]
    const now = new Date().toISOString()
    const { data, error } = await admin
        .from('referral_attributions')
        .update({ [column]: now })
        .in('id', ids)
        .is(column, null)
        .select('id')

    if (error) throw error

    if (kind === 'activated') {
        // An activation email supersedes the pending "joined" email.
        await admin
            .from('referral_attributions')
            .update({ joined_notified_at: now })
            .in('id', ids)
            .is('joined_notified_at', null)
    }

    return (data || []).map(row => row.id as string)
}

async function releaseClaim(
    admin: ReturnType<typeof createAdminClient>,
    ids: string[],
    kind: NotificationKind
) {
    const { column } = NOTIFICATIONS[kind]
    await admin
        .from('referral_attributions')
        .update({ [column]: null })
        .in('id', ids)
}

/**
 * Emails referrers about friends who joined or started contributing.
 *
 * Safe to call from request handlers (pass `referrerId` and `throttle: true`)
 * and from the scheduled sweep. Rows are claimed before sending, so
 * concurrent callers never email the same event twice.
 */
export async function sendReferralNotifications(options: {
    referrerId?: string
    throttle?: boolean
    limit?: number
} = {}): Promise<ReferralNotificationResult> {
    const result: ReferralNotificationResult = { sent: 0, skipped: 0, failed: 0 }
    const admin = createAdminClient()

    const { data: pendingRows, error: pendingError } = await admin.rpc('get_pending_referral_notifications', {
        p_referrer_id: options.referrerId || null,
        p_limit: options.limit || 200,
    })

    if (pendingError) throw pendingError

    const pending = (pendingRows || []) as PendingNotification[]
    if (pending.length === 0) return result

    if (options.throttle && options.referrerId) {
        const { data: recent } = await admin
            .from('email_logs')
            .select('id')
            .eq('user_id', options.referrerId)
            .in('segment', REFERRAL_SEGMENTS)
            .gte('created_at', new Date(Date.now() - IMMEDIATE_THROTTLE_MS).toISOString())
            .limit(1)

        if (recent && recent.length > 0) {
            result.skipped += pending.length
            return result
        }
    }

    const templates = await loadTemplates(admin)
    const rewardSettings = await getReferralRewardSettings(admin)
    const referrerEmails = Array.from(new Set(pending.map(row => row.referrer_email)))
    const { data: unsubscribedRows } = await admin
        .from('email_logs')
        .select('email')
        .eq('status', 'unsubscribed')
        .in('email', referrerEmails)
    const unsubscribed = new Set((unsubscribedRows || []).map(row => String(row.email).toLowerCase()))

    const groups = new Map<string, PendingNotification[]>()
    for (const row of pending) {
        const key = `${row.referrer_id}:${row.kind}`
        groups.set(key, [...(groups.get(key) || []), row])
    }

    for (const rows of Array.from(groups.values())) {
        const { kind, referrer_id: referrerId, referrer_email: email } = rows[0]
        const notification = NOTIFICATIONS[kind]
        const template = templates.get(notification.templateName)

        if (!template) {
            // Leave rows pending so they go out once the template is seeded.
            console.warn(`Referral email template missing: ${notification.templateName}`)
            result.skipped += rows.length
            continue
        }

        const claimedIds = await setNotified(admin, rows.map(row => row.attribution_id), kind)
        if (claimedIds.length === 0) {
            result.skipped += rows.length
            continue
        }

        if (unsubscribed.has(email.toLowerCase())) {
            // Keep them marked as handled; unsubscribed referrers are never retried.
            result.skipped += claimedIds.length
            continue
        }

        const claimedRows = rows.filter(row => claimedIds.includes(row.attribution_id))
        const referrerCode = claimedRows.find(row => row.referrer_code)?.referrer_code
        const referralsUrl = referralsPageUrl(notification.segment)
        const inviteUrl = inviteUrlForCode(referrerCode, `email_${kind}`) || referralsUrl
        const values = {
            REFERRER_NAME: rows[0].referrer_name || 'there',
            FRIEND_NAMES: formatFriendNames(
                claimedRows.map(row => row.friend_name?.trim() || '').filter(Boolean)
            ),
            CONTRIBUTING_COUNT: String(Math.max(Number(rows[0].contributing_count) || 0, claimedRows.length)),
            INVITE_URL: inviteUrl,
            REFERRALS_URL: referralsUrl,
            REWARD_TREES: String(rewardSettings.treesPerPerson),
            MIN_DAYS: String(rewardSettings.minActiveDays),
            UNSUBSCRIBE_URL: await generateUnsubscribeUrl(email),
        }

        const subject = renderReferralTemplate(template.subject, values, false).replace(/[\r\n]+/g, ' ')
        const html = renderReferralTemplate(template.content, values, true)
        const sendResult = await sendEmail(email, subject, html, template.from_email || DEFAULT_FROM)

        await admin.from('email_logs').insert({
            user_id: referrerId,
            email,
            subject,
            template_id: template.id,
            email_type: 'transactional',
            segment: notification.segment,
            resend_id: sendResult.emailId || null,
            status: sendResult.success ? 'sent' : 'failed',
        })

        if (sendResult.success) {
            result.sent += 1
        } else {
            console.error('Failed to send referral notification:', sendResult.error)
            await releaseClaim(admin, claimedIds, kind)
            result.failed += 1
        }
    }

    return result
}

/** Request-path helper: never throws, never blocks the caller on failure. */
export async function notifyReferrerSafely(referrerId: string | null | undefined) {
    if (!referrerId) return

    try {
        await sendReferralNotifications({ referrerId, throttle: true, limit: 50 })
    } catch (error) {
        console.error('Referral notification failed:', error)
    }
}
