import { createAdminClient } from '@/lib/supabase/admin'
import { plantTreesWithOneClickImpact } from '@/lib/one-click-impact'
import { recordReferralEvent } from '@/lib/referrals'
import {
    inviteUrlForCode,
    referralsPageUrl,
    sendTemplatedEmail,
} from '@/lib/referral-notifications'

// Double-sided referral reward. When an invited member has contributed on
// referral_reward_settings.min_active_days distinct days, both they and the
// person who invited them get trees planted. Waiting for sustained activity
// (rather than a signup or a first sync) keeps the reward tied to real use.
//
// Each side is a user_rewards row, which (a) counts toward the member's
// "trees planted" everywhere awarded rewards are summed and (b) acts as the
// lock that prevents planting twice for the same person.

export const INVITER_REWARD_TYPE = 'referral_inviter'
export const INVITEE_REWARD_TYPE = 'referral_invitee'

type AdminClient = ReturnType<typeof createAdminClient>

type RewardDue = {
    attribution_id: string
    referrer_id: string
    referrer_email: string | null
    referrer_name: string | null
    referrer_code: string | null
    referred_user_id: string
    referred_email: string | null
    referred_name: string | null
    active_days: number | string
    inviter_rewards_last_30_days: number | string
    trees_per_person: number
    min_active_days: number
    inviter_monthly_cap: number
}

type AwardOutcome = 'awarded' | 'already_awarded' | 'in_progress' | 'failed'

export type ReferralRewardRunResult = {
    rewarded: number
    inviterCapped: number
    pending: number
    failed: number
}

async function awardReferralTrees(
    admin: AdminClient,
    input: {
        userId: string
        rewardType: typeof INVITER_REWARD_TYPE | typeof INVITEE_REWARD_TYPE
        attributionId: string
        trees: number
        email: string | null
        name: string | null
    }
): Promise<AwardOutcome> {
    const selectExisting = () => admin
        .from('user_rewards')
        .select('id, status')
        .eq('referral_attribution_id', input.attributionId)
        .eq('reward_type', input.rewardType)
        .maybeSingle()

    let { data: reward } = await selectExisting()

    if (!reward) {
        const { data: inserted, error } = await admin
            .from('user_rewards')
            .insert({
                user_id: input.userId,
                reward_type: input.rewardType,
                trees_awarded: input.trees,
                referral_attribution_id: input.attributionId,
                status: 'pending',
            })
            .select('id, status')
            .single()

        // A concurrent run inserted the row first; use theirs.
        reward = error ? (await selectExisting()).data : inserted
    }

    if (!reward) return 'failed'
    if (reward.status === 'awarded') return 'already_awarded'

    // Claim the row. 'processing' rows belong to another run (or a crashed
    // one, which needs a manual look since the planting may have happened).
    const { data: claimed } = await admin
        .from('user_rewards')
        .update({
            status: 'processing',
            trees_awarded: input.trees,
            error_message: null,
            updated_at: new Date().toISOString(),
        })
        .eq('id', reward.id)
        .in('status', ['pending', 'failed'])
        .select('id')
        .maybeSingle()

    if (!claimed) return 'in_progress'

    try {
        if (!input.email) throw new Error('Member has no email address for the planting certificate')

        const providerResponse = await plantTreesWithOneClickImpact({
            amount: input.trees,
            customerEmail: input.email,
            customerName: input.name || 'IdleForest User',
        })

        await admin
            .from('user_rewards')
            .update({
                status: 'awarded',
                provider: '1ClickImpact',
                provider_response: providerResponse,
                awarded_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq('id', claimed.id)

        return 'awarded'
    } catch (error) {
        console.error(`Referral reward (${input.rewardType}) failed`, error)

        await admin
            .from('user_rewards')
            .update({
                status: 'failed',
                error_message: error instanceof Error ? error.message.slice(0, 500) : 'Unknown reward error',
                updated_at: new Date().toISOString(),
            })
            .eq('id', claimed.id)

        return 'failed'
    }
}

function isDone(outcome: AwardOutcome) {
    return outcome === 'awarded' || outcome === 'already_awarded'
}

async function inviteeInviteUrl(admin: AdminClient, userId: string) {
    try {
        const { data: code } = await admin.rpc('ensure_referral_code', {
            p_user_id: userId,
            p_channel: 'reward_email',
        })
        return inviteUrlForCode(typeof code === 'string' ? code : null, 'email_reward')
    } catch (error) {
        console.error('Could not create invite code for rewarded invitee:', error)
        return null
    }
}

/**
 * Plants the trees for every referral whose invitee has become a sustained
 * contributor, then emails both people. Safe to run repeatedly and
 * concurrently: failures are retried on the next run and nothing is planted
 * twice. Stops early when `deadline` (epoch ms) is reached.
 */
export async function processReferralRewards(options: {
    limit?: number
    deadline?: number
} = {}): Promise<ReferralRewardRunResult> {
    const result: ReferralRewardRunResult = { rewarded: 0, inviterCapped: 0, pending: 0, failed: 0 }
    const admin = createAdminClient()

    const { data, error } = await admin.rpc('get_referral_rewards_due', { p_limit: options.limit || 100 })
    if (error) throw error

    const due = (data || []) as RewardDue[]
    // The RPC counts rewards before this run; track this run's too so one
    // batch can't push an inviter past the monthly cap.
    const inviterRewardsThisRun = new Map<string, number>()

    for (const row of due) {
        if (options.deadline && Date.now() > options.deadline) {
            result.pending += 1
            continue
        }

        const trees = Number(row.trees_per_person)
        const inviteeOutcome = await awardReferralTrees(admin, {
            userId: row.referred_user_id,
            rewardType: INVITEE_REWARD_TYPE,
            attributionId: row.attribution_id,
            trees,
            email: row.referred_email,
            name: row.referred_name,
        })

        if (!isDone(inviteeOutcome)) {
            if (inviteeOutcome === 'failed') result.failed += 1
            else result.pending += 1
            continue
        }

        const inviterRewardsSoFar = Number(row.inviter_rewards_last_30_days || 0)
            + (inviterRewardsThisRun.get(row.referrer_id) || 0)
        const inviterCapped = inviterRewardsSoFar >= Number(row.inviter_monthly_cap)

        if (!inviterCapped) {
            const inviterOutcome = await awardReferralTrees(admin, {
                userId: row.referrer_id,
                rewardType: INVITER_REWARD_TYPE,
                attributionId: row.attribution_id,
                trees,
                email: row.referrer_email,
                name: row.referrer_name,
            })

            if (!isDone(inviterOutcome)) {
                // The invitee keeps their trees; the inviter's side is retried
                // next run before the referral is marked rewarded.
                if (inviterOutcome === 'failed') result.failed += 1
                else result.pending += 1
                continue
            }

            if (inviterOutcome === 'awarded') {
                inviterRewardsThisRun.set(row.referrer_id, (inviterRewardsThisRun.get(row.referrer_id) || 0) + 1)
            }
        }

        const { data: finalized } = await admin
            .from('referral_attributions')
            .update({
                rewarded_at: new Date().toISOString(),
                inviter_reward_skipped: inviterCapped ? 'monthly_cap' : null,
            })
            .eq('id', row.attribution_id)
            .is('rewarded_at', null)
            .select('id')
            .maybeSingle()

        if (!finalized) continue

        result.rewarded += 1
        if (inviterCapped) result.inviterCapped += 1

        await recordReferralEvent(admin, {
            eventName: 'rewarded',
            referralCode: row.referrer_code,
            referrerId: row.referrer_id,
            actorUserId: row.referred_user_id,
            channel: inviterCapped ? 'invitee_only' : 'both',
        })

        const inviterName = row.referrer_name || 'your friend'
        const inviteeName = row.referred_name || 'there'
        const sharedValues = {
            REWARD_TREES: String(trees),
            TOTAL_TREES: String(inviterCapped ? trees : trees * 2),
            MIN_DAYS: String(row.min_active_days),
        }

        if (row.referred_email) {
            await sendTemplatedEmail(admin, {
                templateName: 'Referral: trees planted (invitee)',
                to: row.referred_email,
                userId: row.referred_user_id,
                segment: 'referral_reward_invitee',
                values: {
                    ...sharedValues,
                    FRIEND_NAMES: inviteeName,
                    REFERRER_NAME: inviterName,
                    INVITE_URL: (await inviteeInviteUrl(admin, row.referred_user_id)) || referralsPageUrl('referral_reward_invitee'),
                    REFERRALS_URL: referralsPageUrl('referral_reward_invitee'),
                },
            })
        }

        if (!inviterCapped && row.referrer_email) {
            await sendTemplatedEmail(admin, {
                templateName: 'Referral: trees planted (inviter)',
                to: row.referrer_email,
                userId: row.referrer_id,
                segment: 'referral_reward_inviter',
                values: {
                    ...sharedValues,
                    FRIEND_NAMES: row.referred_name || 'Someone you invited',
                    REFERRER_NAME: row.referrer_name || 'there',
                    INVITE_URL: inviteUrlForCode(row.referrer_code, 'email_reward') || referralsPageUrl('referral_reward_inviter'),
                    REFERRALS_URL: referralsPageUrl('referral_reward_inviter'),
                },
            })
        }
    }

    return result
}
