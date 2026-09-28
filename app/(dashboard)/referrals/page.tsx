import ReferralsDashboard from '@/components/referrals/ReferralsDashboard'
import { createClient } from '@/lib/supabase/server'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'
import { redirect } from 'next/navigation'

export default async function ReferralsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/auth/user/login?redirect=${encodeURIComponent('/referrals')}`)
    }

    const reward = await getReferralRewardSettings(supabase)

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-16">
            <ReferralsDashboard
                reward={reward.enabled ? { treesPerPerson: reward.treesPerPerson, minActiveDays: reward.minActiveDays } : null}
            />
        </div>
    )
}
