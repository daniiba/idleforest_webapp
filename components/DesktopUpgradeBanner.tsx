'use client'

import { ArrowRight, Monitor, X } from 'lucide-react'
import { Link } from '@/navigation'

const DISMISS_KEY = 'idleforest:desktop-upgrade-dismissed-at'
const DISMISS_FOR_MS = 14 * 24 * 60 * 60 * 1000

export function desktopUpgradeDismissed() {
    try {
        const at = Number(window.localStorage.getItem(DISMISS_KEY))
        return Boolean(at) && Date.now() - at < DISMISS_FOR_MS
    } catch {
        return false
    }
}

// One-line nudge for extension-only members to add the desktop app.
export default function DesktopUpgradeBanner({ onDismiss }: { onDismiss: () => void }) {
    const dismiss = () => {
        try {
            window.localStorage.setItem(DISMISS_KEY, String(Date.now()))
        } catch {
            // Storage unavailable: it just shows again next visit.
        }
        onDismiss()
    }

    return (
        <div className="border-b-2 border-black bg-brand-yellow text-black">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2">
                <Monitor className="hidden h-4 w-4 shrink-0 sm:block" aria-hidden="true" />
                <p className="min-w-0 flex-1 truncate text-sm font-bold">
                    Get the desktop app <span className="hidden font-semibold sm:inline">and plant even with your browser closed</span> · +5 trees
                </p>
                <Link
                    href="/welcome"
                    className="inline-flex shrink-0 items-center gap-1.5 border-2 border-black bg-brand-navy px-3 py-1 text-xs font-black uppercase text-white"
                >
                    Get app
                    <ArrowRight className="h-3.5 w-3.5 text-brand-yellow" aria-hidden="true" />
                </Link>
                <button
                    type="button"
                    onClick={dismiss}
                    className="shrink-0 p-1 text-black/60 hover:text-black"
                    aria-label="Hide for now"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
