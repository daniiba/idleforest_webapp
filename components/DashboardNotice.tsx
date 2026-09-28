'use client'

import { useEffect, useState } from 'react'
import DesktopUpgradeBanner, { desktopUpgradeDismissed } from '@/components/DesktopUpgradeBanner'
import ReferralPrompt from '@/components/referrals/ReferralPrompt'

type NodeStatus = { hasNode: boolean; hasDesktopNode: boolean }

// A single strip under the dashboard navigation: the desktop-app nudge for
// extension-only members, otherwise the invite line.
export default function DashboardNotice() {
    const [notice, setNotice] = useState<'loading' | 'desktop' | 'invite'>('loading')

    useEffect(() => {
        let cancelled = false
        fetch('/api/user/node-status')
            .then(response => (response.ok ? response.json() : null))
            .then((status: NodeStatus | null) => {
                if (cancelled) return
                const needsDesktop = Boolean(status?.hasNode && !status.hasDesktopNode)
                setNotice(needsDesktop && !desktopUpgradeDismissed() ? 'desktop' : 'invite')
            })
            .catch(() => {
                if (!cancelled) setNotice('invite')
            })
        return () => {
            cancelled = true
        }
    }, [])

    if (notice === 'loading') return null
    if (notice === 'desktop') return <DesktopUpgradeBanner onDismiss={() => setNotice('invite')} />
    return <ReferralPrompt />
}
