'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { detectDesktopPlatform } from '@/lib/desktop-setup'

export default function WastefreeSetupCta({ href }: { href: string }) {
    const [mobile, setMobile] = useState(false)
    useEffect(() => { setMobile(detectDesktopPlatform(navigator) === 'mobile') }, [])
    return (
        <div>
            <Link href={href} className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95">
                {mobile ? 'Start on my phone, finish on computer' : 'Join & set up the desktop app'}
                <span aria-hidden="true">→</span>
            </Link>
            <p className="mt-3 max-w-xs text-xs text-white/60">
                {mobile ? 'Create your free account, then email yourself a computer setup link.' : 'Create your account, install IdleForest, then log in to connect.'}
            </p>
        </div>
    )
}
