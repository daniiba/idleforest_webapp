'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function ReferralAttributionSync() {
    const { user, loading } = useAuth()
    const userId = user?.id
    const referralCode = user?.user_metadata?.referral_code

    useEffect(() => {
        if (loading || !userId || typeof referralCode !== 'string' || !referralCode.trim()) {
            return
        }

        fetch('/api/referrals/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode }),
            keepalive: true,
        }).catch(() => {
            // This is a recovery path for signups that required email confirmation.
            // It will retry the next time an authenticated dashboard loads.
        })
    }, [loading, referralCode, userId])

    return null
}
