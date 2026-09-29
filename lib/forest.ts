import crypto from 'crypto'
import { INVITEE_REWARD_TYPE, INVITER_REWARD_TYPE } from '@/lib/referral-reward-settings'

// Data behind the forest island: the trees a member planted, the trees their
// invites earned, and the trees planted by each person they invited.
//
// "Trees planted" matches the profile page: Tree badge progress plus awarded
// user_rewards. Referral rewards are split out so they can be shown in their
// own colour.

type SupabaseLike = {
    from: (table: string) => any
}

export type ForestData = {
    ownTrees: number
    inviteTrees: number
    friendTrees: number
    totalTrees: number
    friends: Array<{
        label: string | null
        trees: number
        contributing: boolean
    }>
}

type TreeTotals = {
    badgeTrees: number
    rewardTrees: number
    referralRewardTrees: number
}

const REFERRAL_REWARD_TYPES = new Set([INVITER_REWARD_TYPE, INVITEE_REWARD_TYPE])
const BATCH_SIZE = 200

function chunk<T>(items: T[], size: number) {
    const chunks: T[][] = []
    for (let index = 0; index < items.length; index += size) chunks.push(items.slice(index, index + size))
    return chunks
}

// Stable island layout per member that doesn't reveal their id.
export function forestSeed(userId: string) {
    return crypto.createHash('sha256').update(`forest:${userId}`).digest('hex').slice(0, 16)
}

export async function getTreeTotals(supabase: SupabaseLike, userIds: string[]) {
    const totals = new Map<string, TreeTotals>(
        userIds.map(userId => [userId, { badgeTrees: 0, rewardTrees: 0, referralRewardTrees: 0 }])
    )
    if (userIds.length === 0) return totals

    const { data: treeBadge } = await supabase
        .from('badge_types')
        .select('id, badge_tiers (id)')
        .eq('name', 'Tree')
        .maybeSingle()
    const tierIds: string[] = (treeBadge?.badge_tiers || []).map((tier: { id: string }) => tier.id)

    for (const ids of chunk(userIds, BATCH_SIZE)) {
        const [progressResult, rewardsResult] = await Promise.all([
            tierIds.length > 0
                ? supabase
                    .from('badge_progress')
                    .select('user_id, current_value')
                    .in('user_id', ids)
                    .in('badge_tier_id', tierIds)
                : Promise.resolve({ data: [] }),
            supabase
                .from('user_rewards')
                .select('user_id, reward_type, trees_awarded')
                .in('user_id', ids)
                .eq('status', 'awarded'),
        ])

        for (const row of progressResult.data || []) {
            const entry = totals.get(row.user_id)
            if (entry) entry.badgeTrees = Math.max(entry.badgeTrees, Math.max(0, Number(row.current_value) || 0))
        }

        for (const row of rewardsResult.data || []) {
            const entry = totals.get(row.user_id)
            if (!entry) continue
            const trees = Math.max(0, Number(row.trees_awarded) || 0)
            if (REFERRAL_REWARD_TYPES.has(row.reward_type)) entry.referralRewardTrees += trees
            else entry.rewardTrees += trees
        }
    }

    return totals
}

export async function getForestData(
    supabase: SupabaseLike,
    userId: string,
    options: { includeNames: boolean }
): Promise<ForestData> {
    const { data: attributions, error } = await supabase
        .from('referral_attributions')
        .select('referred_user_id, activated_at, signed_up_at')
        .eq('referrer_id', userId)
        .order('signed_up_at', { ascending: true })

    if (error) throw error

    const friendIds: string[] = Array.from(new Set(
        (attributions || []).map((row: { referred_user_id: string }) => row.referred_user_id).filter(Boolean)
    ))
    const totals = await getTreeTotals(supabase, [userId, ...friendIds])

    const names = new Map<string, string>()
    if (options.includeNames && friendIds.length > 0) {
        for (const ids of chunk(friendIds, BATCH_SIZE)) {
            const { data: profiles } = await supabase
                .from('profiles')
                .select('user_id, display_name')
                .in('user_id', ids)
            for (const profile of profiles || []) {
                if (profile.display_name) names.set(profile.user_id, profile.display_name)
            }
        }
    }

    const own = totals.get(userId) || { badgeTrees: 0, rewardTrees: 0, referralRewardTrees: 0 }
    const friends = (attributions || []).map((row: { referred_user_id: string; activated_at: string | null }) => {
        const friendTotals = totals.get(row.referred_user_id)
        const trees = friendTotals
            ? friendTotals.badgeTrees + friendTotals.rewardTrees + friendTotals.referralRewardTrees
            : 0

        return {
            label: options.includeNames ? names.get(row.referred_user_id) || null : null,
            trees,
            contributing: Boolean(row.activated_at),
        }
    })

    const ownTrees = own.badgeTrees + own.rewardTrees
    const inviteTrees = own.referralRewardTrees
    const friendTrees = friends.reduce((sum: number, friend: { trees: number }) => sum + friend.trees, 0)

    return {
        ownTrees,
        inviteTrees,
        friendTrees,
        totalTrees: ownTrees + inviteTrees + friendTrees,
        friends,
    }
}

export type TeamForestData = ForestData & { memberCount: number }

/**
 * A team's forest: the centre grove holds every tree the team has planted,
 * and each member gets their own named grove around it.
 */
export async function getTeamForestData(supabase: SupabaseLike, teamId: string): Promise<TeamForestData> {
    const { data: members, error } = await supabase
        .from('team_members')
        .select('user_id, joined_at')
        .eq('team_id', teamId)
        .order('joined_at', { ascending: true })

    if (error) throw error

    const memberIds: string[] = Array.from(new Set(
        (members || []).map((row: { user_id: string }) => row.user_id).filter(Boolean)
    ))
    const totals = await getTreeTotals(supabase, memberIds)

    const names = new Map<string, string>()
    const planting = new Set<string>()
    for (const ids of chunk(memberIds, BATCH_SIZE)) {
        const [{ data: profiles }, { data: nodes }] = await Promise.all([
            supabase.from('profiles').select('user_id, display_name').in('user_id', ids),
            supabase.from('nodes').select('user_id, opt_in, total_requests').in('user_id', ids).gt('total_requests', 0),
        ])
        for (const profile of profiles || []) {
            if (profile.display_name) names.set(profile.user_id, profile.display_name)
        }
        for (const node of nodes || []) {
            if (node.opt_in !== false) planting.add(node.user_id)
        }
    }

    const friends = memberIds.map(userId => {
        const memberTotals = totals.get(userId)
        const trees = memberTotals
            ? memberTotals.badgeTrees + memberTotals.rewardTrees + memberTotals.referralRewardTrees
            : 0
        return { label: names.get(userId) || null, trees, contributing: planting.has(userId) || trees > 0 }
    })
    const totalTrees = friends.reduce((sum, friend) => sum + friend.trees, 0)

    return {
        ownTrees: totalTrees,
        inviteTrees: 0,
        friendTrees: 0,
        totalTrees,
        friends,
        memberCount: memberIds.length,
    }
}
