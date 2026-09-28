import ReferralPrompt from '@/components/referrals/ReferralPrompt'
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
            <ReferralPrompt variant="page" />

            <div className="grid border-x-2 border-b-2 border-black bg-brand-navy text-white md:grid-cols-3">
                <div className="border-b-2 border-white/20 p-6 md:border-b-0 md:border-r-2">
                    <p className="font-mono text-xs font-bold text-brand-yellow">01 / SHARE</p>
                    <h2 className="mt-2 text-xl font-black uppercase">Send it personally</h2>
                    <p className="mt-2 text-sm text-neutral-300">Choose one person who cares about climate action or passive impact. A personal note beats a public blast.</p>
                </div>
                <div className="border-b-2 border-white/20 p-6 md:border-b-0 md:border-r-2">
                    <p className="font-mono text-xs font-bold text-brand-yellow">02 / JOIN</p>
                    <h2 className="mt-2 text-xl font-black uppercase">They create an account</h2>
                    <p className="mt-2 text-sm text-neutral-300">Your code is carried automatically. Nobody has to copy, remember, or type it during signup.</p>
                </div>
                <div className="p-6">
                    <p className="font-mono text-xs font-bold text-brand-yellow">03 / GROW</p>
                    {reward.enabled ? (
                        <>
                            <h2 className="mt-2 text-xl font-black uppercase">You both get {reward.treesPerPerson} trees</h2>
                            <p className="mt-2 text-sm text-neutral-300">Once their computer has contributed on {reward.minActiveDays} different days, we plant {reward.treesPerPerson} trees for you and {reward.treesPerPerson} for them.</p>
                        </>
                    ) : (
                        <>
                            <h2 className="mt-2 text-xl font-black uppercase">We verify real impact</h2>
                            <p className="mt-2 text-sm text-neutral-300">The referral becomes active after their node contributes, keeping the forest focused on real participation.</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
