'use client'

import { useEffect, useState } from 'react'
import { Users } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type InviterNudgeProps = {
    connected?: boolean
}

// Reminds invited users who brought them here while they set up the desktop
// app. A familiar name is a stronger reason to finish setup than any bonus,
// and an invite only counts once the new user's node is contributing.
export default function InviterNudge({ connected = false }: InviterNudgeProps) {
    const { user, loading } = useAuth()
    const referralCode = user?.user_metadata?.referral_code
    const [inviterName, setInviterName] = useState<string | null>(null)

    useEffect(() => {
        if (loading || typeof referralCode !== 'string' || !referralCode.trim()) return

        let cancelled = false
        fetch(`/api/referrals/resolve?code=${encodeURIComponent(referralCode)}`)
            .then(response => response.ok ? response.json() : null)
            .then(data => {
                if (!cancelled && data?.valid && data.inviterName) setInviterName(data.inviterName)
            })
            .catch(() => {})

        return () => {
            cancelled = true
        }
    }, [loading, referralCode])

    if (!inviterName) return null

    return (
        <section className="flex items-start gap-4 border-2 border-black bg-brand-yellow p-5" aria-live="polite">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-white" aria-hidden="true">
                <Users className="h-5 w-5" />
            </span>
            <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-neutral-700">Invited by {inviterName}</p>
                <p className="mt-1 font-bold leading-6">
                    {connected
                        ? `You're connected. Your activity now grows the forest you and ${inviterName} share.`
                        : `Connect the desktop app below to start growing the forest with ${inviterName}. We'll let them know once you're contributing.`}
                </p>
            </div>
        </section>
    )
}
