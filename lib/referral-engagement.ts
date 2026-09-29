import { createAdminClient } from '@/lib/supabase/admin'
import { generateUnsubscribeUrl, sendEmailBatch } from '@/lib/resend'
import { getForestData } from '@/lib/forest'
import { getReferralRewardSettings, type ReferralRewardSettings } from '@/lib/referral-reward-settings'
import { emailShareUrl, giftWords, inviteMessage, reminderMessage, whatsappUrl } from '@/lib/referral-messages'
import {
    formatFriendNames,
    inviteUrlForCode,
    referralsPageUrl,
    renderReferralTemplate,
    sendTemplatedEmail,
} from '@/lib/referral-notifications'

// A one-off launch email that shows each active member their own forest and
// the empty spot waiting for a friend, with one-tap invites. Sent in batches
// from the hourly referral cron while the campaign is switched on.

type Admin = ReturnType<typeof createAdminClient>

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'
const DEFAULT_FROM = 'Daniel from IdleForest <daniel@idleforest.com>'

export const FOREST_LAUNCH_CAMPAIGN = 'forest_launch'
export const FOREST_LAUNCH_TEMPLATE = 'Referral launch: your forest'
export const FOREST_LAUNCH_SEGMENT = 'referral_forest_launch'

function rewardSentence(reward: ReferralRewardSettings) {
    return reward.enabled
        ? `Send your link to someone you know. When their computer has helped for ${reward.minActiveDays} days, we plant ${giftWords(reward)} for you and ${reward.treesPerPerson === 1 ? 'one' : giftWords(reward)} for them.`
        : 'Send your link to someone you know. Every tree they plant also grows your forest.'
}

// ---------------------------------------------------------------------------
// Forest launch email
// ---------------------------------------------------------------------------

type LaunchRecipient = {
    user_id: string
    email: string
    display_name: string | null
    referral_code: string | null
}

type Template = { id: string; subject: string; content: string; from_email: string | null }

async function loadTemplate(admin: Admin, name: string): Promise<Template | null> {
    const { data } = await admin
        .from('email_templates')
        .select('id, subject, content, from_email')
        .eq('name', name)
        .maybeSingle()
    return (data as Template | null) || null
}

function treesSentence(total: number) {
    if (total <= 0) return 'Your first trees are on the way. Your computer plants them with internet it is not using.'
    if (total === 1) return 'It has 1 tree so far, planted with internet your computer was not using.'
    return `It has ${total.toLocaleString('en')} trees so far, all planted with internet your computer was not using.`
}

async function launchValues(admin: Admin, recipient: LaunchRecipient, reward: ReferralRewardSettings) {
    let code = recipient.referral_code
    if (!code) {
        const { data } = await admin.rpc('ensure_referral_code', { p_user_id: recipient.user_id, p_channel: 'forest_launch_email' })
        code = typeof data === 'string' ? data : null
    }
    if (!code) return null

    const forest = await getForestData(admin, recipient.user_id, { includeNames: false })
    const inviteUrl = inviteUrlForCode(code, 'launch_email') as string
    const message = inviteMessage(inviteUrlForCode(code, 'launch_email_share') as string, reward)

    return {
        DISPLAY_NAME: recipient.display_name || 'there',
        TREES_SENTENCE: treesSentence(forest.totalTrees),
        FOREST_IMAGE_URL: `${APP_URL}/api/og/forest?code=${encodeURIComponent(code)}&view=owner`,
        FOREST_URL: referralsPageUrl(FOREST_LAUNCH_SEGMENT),
        INVITE_URL: inviteUrl,
        INVITE_LABEL: `idleforest.com/r/${code}`,
        WHATSAPP_URL: whatsappUrl(message),
        EMAIL_SHARE_URL: emailShareUrl('Want to plant a tree with me?', message),
        REWARD_SENTENCE: rewardSentence(reward),
    }
}

async function renderLaunch(admin: Admin, template: Template, recipient: LaunchRecipient, reward: ReferralRewardSettings) {
    const values = await launchValues(admin, recipient, reward)
    if (!values) return null
    const all = { ...values, UNSUBSCRIBE_URL: await generateUnsubscribeUrl(recipient.email) }
    return {
        to: recipient.email,
        subject: renderReferralTemplate(template.subject, all, false).replace(/[\r\n]+/g, ' '),
        html: renderReferralTemplate(template.content, all, true),
        from: template.from_email || DEFAULT_FROM,
    }
}

export async function getForestLaunchStatus() {
    const admin = createAdminClient()
    const [{ data: campaign }, { data: progress }, template] = await Promise.all([
        admin.from('email_campaigns').select('status, started_at').eq('key', FOREST_LAUNCH_CAMPAIGN).maybeSingle(),
        admin.rpc('get_forest_launch_progress'),
        loadTemplate(admin, FOREST_LAUNCH_TEMPLATE),
    ])
    const row = Array.isArray(progress) ? progress[0] : progress
    return {
        status: (campaign?.status as string | undefined) || 'draft',
        startedAt: (campaign?.started_at as string | null | undefined) || null,
        remaining: Number(row?.remaining || 0),
        sent: Number(row?.sent || 0),
        templateReady: Boolean(template),
    }
}

export async function setForestLaunchStatus(status: 'sending' | 'paused') {
    const admin = createAdminClient()
    const patch: Record<string, string> = { status, updated_at: new Date().toISOString() }
    if (status === 'sending') patch.started_at = new Date().toISOString()
    const { error } = await admin
        .from('email_campaigns')
        .upsert({ key: FOREST_LAUNCH_CAMPAIGN, ...patch }, { onConflict: 'key' })
    if (error) throw error
}

/** Sends the launch email to one address, using a member's forest (by display name) or a sample. */
export async function sendForestLaunchTest(to: string, displayName?: string | null) {
    const admin = createAdminClient()
    const [template, reward] = await Promise.all([loadTemplate(admin, FOREST_LAUNCH_TEMPLATE), getReferralRewardSettings(admin)])
    if (!template) throw new Error(`Template "${FOREST_LAUNCH_TEMPLATE}" is missing. Run the latest migration.`)

    let recipient: LaunchRecipient | null = null
    if (displayName?.trim()) {
        const { data: profile } = await admin
            .from('profiles')
            .select('user_id, display_name, referral_code')
            .ilike('display_name', displayName.trim().replace(/[\\%_]/g, character => `\\${character}`))
            .maybeSingle()
        if (profile) recipient = { user_id: profile.user_id, email: to, display_name: profile.display_name, referral_code: profile.referral_code }
    }

    let message: { to: string; subject: string; html: string; from: string } | null
    if (recipient) {
        message = await renderLaunch(admin, template, recipient, reward)
    } else {
        const sample = 'https://www.idleforest.com/r/SAMPLE'
        const text = inviteMessage(sample, reward)
        const all = {
            DISPLAY_NAME: 'there',
            TREES_SENTENCE: treesSentence(137),
            FOREST_IMAGE_URL: `${APP_URL}/api/og/forest?demo=1`,
            FOREST_URL: referralsPageUrl(FOREST_LAUNCH_SEGMENT),
            INVITE_URL: sample,
            INVITE_LABEL: 'idleforest.com/r/SAMPLE',
            WHATSAPP_URL: whatsappUrl(text),
            EMAIL_SHARE_URL: emailShareUrl('Want to plant a tree with me?', text),
            REWARD_SENTENCE: rewardSentence(reward),
            UNSUBSCRIBE_URL: await generateUnsubscribeUrl(to),
        }
        message = {
            to,
            subject: renderReferralTemplate(template.subject, all, false),
            html: renderReferralTemplate(template.content, all, true),
            from: template.from_email || DEFAULT_FROM,
        }
    }
    if (!message) throw new Error('Could not build the email for that member (no invite code).')

    const result = await sendEmailBatch([{ ...message, subject: `[Test] ${message.subject}` }])
    if (!result.success) throw new Error(result.error || 'Resend rejected the test email')
    return { to, usedMember: Boolean(recipient) }
}

/**
 * Sends the next batches of the launch email while the campaign is switched
 * on. Each recipient is logged in email_logs, which is what keeps anyone
 * from getting it twice.
 */
export async function sendForestLaunchBatches(options: { deadline: number; batchSize?: number }) {
    const admin = createAdminClient()
    const result = { sent: 0, failed: 0, remaining: 0, status: 'draft' as string }

    const { data: campaign } = await admin.from('email_campaigns').select('status').eq('key', FOREST_LAUNCH_CAMPAIGN).maybeSingle()
    result.status = (campaign?.status as string | undefined) || 'draft'
    if (result.status !== 'sending') return result

    const [template, reward] = await Promise.all([loadTemplate(admin, FOREST_LAUNCH_TEMPLATE), getReferralRewardSettings(admin)])
    if (!template) throw new Error(`Template "${FOREST_LAUNCH_TEMPLATE}" is missing`)

    while (Date.now() < options.deadline) {
        const { data, error } = await admin.rpc('get_forest_launch_recipients', { p_limit: options.batchSize ?? 100 })
        if (error) throw error
        const recipients = (data || []) as LaunchRecipient[]
        if (recipients.length === 0) {
            await admin.from('email_campaigns').update({ status: 'done', updated_at: new Date().toISOString() }).eq('key', FOREST_LAUNCH_CAMPAIGN)
            result.status = 'done'
            break
        }

        const messages: Array<{ recipient: LaunchRecipient; message: NonNullable<Awaited<ReturnType<typeof renderLaunch>>> }> = []
        const unusable: LaunchRecipient[] = []
        for (const recipient of recipients) {
            const message = await renderLaunch(admin, template, recipient, reward).catch(() => null)
            if (message) messages.push({ recipient, message })
            else unusable.push(recipient)
        }

        const sendResult = await sendEmailBatch(messages.map(entry => entry.message))
        const rows = [
            ...messages.map((entry, index) => ({
                user_id: entry.recipient.user_id,
                email: entry.recipient.email,
                subject: entry.message.subject,
                template_id: template.id,
                email_type: 'broadcast',
                segment: FOREST_LAUNCH_SEGMENT,
                resend_id: sendResult.ids[index],
                status: sendResult.success ? 'sent' : 'failed',
            })),
            // Members we cannot build an email for are marked so the queue keeps moving.
            ...unusable.map(recipient => ({
                user_id: recipient.user_id,
                email: recipient.email,
                subject: template.subject,
                template_id: template.id,
                email_type: 'broadcast',
                segment: FOREST_LAUNCH_SEGMENT,
                resend_id: null,
                status: 'skipped',
            })),
        ]
        if (rows.length > 0) await admin.from('email_logs').insert(rows)

        if (!sendResult.success) {
            console.error('Forest launch batch failed:', sendResult.error)
            result.failed += messages.length
            break
        }
        result.sent += messages.length
    }

    const { data: progress } = await admin.rpc('get_forest_launch_progress')
    const row = Array.isArray(progress) ? progress[0] : progress
    result.remaining = Number(row?.remaining || 0)
    return result
}
