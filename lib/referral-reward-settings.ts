type SupabaseLike = {
    from: (table: string) => any
}

export type ReferralRewardSettings = {
    enabled: boolean
    treesPerPerson: number
    minActiveDays: number
    inviterMonthlyCap: number
}

// Used when the settings row cannot be read (e.g. before the migration runs):
// copy stays sensible, but no reward is promised.
export const DEFAULT_REFERRAL_REWARD_SETTINGS: ReferralRewardSettings = {
    enabled: false,
    treesPerPerson: 3,
    minActiveDays: 3,
    inviterMonthlyCap: 10,
}

export async function getReferralRewardSettings(supabase: SupabaseLike): Promise<ReferralRewardSettings> {
    try {
        const { data, error } = await supabase
            .from('referral_reward_settings')
            .select('enabled, trees_per_person, min_active_days, inviter_monthly_cap')
            .eq('id', true)
            .maybeSingle()

        if (error || !data) return DEFAULT_REFERRAL_REWARD_SETTINGS

        return {
            enabled: Boolean(data.enabled),
            treesPerPerson: Number(data.trees_per_person) || DEFAULT_REFERRAL_REWARD_SETTINGS.treesPerPerson,
            minActiveDays: Number(data.min_active_days) || DEFAULT_REFERRAL_REWARD_SETTINGS.minActiveDays,
            inviterMonthlyCap: Math.max(0, Number(data.inviter_monthly_cap) || 0),
        }
    } catch {
        return DEFAULT_REFERRAL_REWARD_SETTINGS
    }
}
