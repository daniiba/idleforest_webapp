'use client'

import { useEffect, useState } from 'react'
import { Monitor, TreePine } from 'lucide-react'
import { Link } from '@/navigation'

interface NodeStatus {
    hasNode: boolean
    hasDesktopNode: boolean
    platforms: string[]
}

export default function DesktopUpgradeBanner() {
    const [status, setStatus] = useState<NodeStatus | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/user/node-status')
            .then((response) => response.ok ? response.json() : null)
            .then((data) => setStatus(data))
            .catch(() => setStatus(null))
            .finally(() => setLoading(false))
    }, [])

    if (loading || !status?.hasNode || status.hasDesktopNode) {
        return null
    }

    return (
        <div className="border-b-2 border-black bg-brand-yellow text-black">
            <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 text-sm font-bold sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="border-2 border-black bg-brand-navy p-2 text-brand-yellow">
                        <Monitor className="h-5 w-5" />
                    </div>
                    <p>
                        You&apos;re using the browser extension. Connect the desktop app to keep planting when your browser is closed and unlock 5 bonus trees.
                    </p>
                </div>
                <Link
                    href="/welcome"
                    className="inline-flex items-center justify-center gap-2 border-2 border-black bg-black px-4 py-2 text-xs uppercase text-white shadow-[3px_3px_0px_0px_rgba(11,16,31,0.25)]"
                >
                    <TreePine className="h-4 w-4" />
                    Unlock Bonus
                </Link>
            </div>
        </div>
    )
}
