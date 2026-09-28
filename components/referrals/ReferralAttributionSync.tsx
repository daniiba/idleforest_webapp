'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

function syncKey(userId: string) {
    return `idleforest:referral-synced:${userId}`
}

export default function ReferralAttributionSync() {
    const { user, loading } = useAuth()
    const userId = user?.id
    const referralCode = user?.user_metadata?.referral_code

    useEffect(() => {
        if (loading || !userId || typeof referralCode !== 'string' || !referralCode.trim()) {
            return
        }

        // Once per browser session is enough: attribution is idempotent and
        // the signup trigger already records it server-side.
        try {
            if (window.sessionStorage.getItem(syncKey(userId))) return
        } catch {
            // Storage can be unavailable (private mode); fall through and sync.
        }

        fetch('/api/referrals/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ referralCode }),
            keepalive: true,
        })
            .then(response => {
                if (!response.ok) return
                try {
                    window.sessionStorage.setItem(syncKey(userId), '1')
                } catch {
                    // Ignore storage failures; we'll just sync again next load.
                }
            })
            .catch(() => {
                // This is a recovery path for signups that required email confirmation.
                // It will retry the next time an authenticated page loads.
            })
    }, [loading, referralCode, userId])

    return null
}
