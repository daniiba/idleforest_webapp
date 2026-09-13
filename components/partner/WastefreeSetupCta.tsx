'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { detectDesktopPlatform } from '@/lib/desktop-setup'

export default function WastefreeSetupCta({ href }: { href: string }) {
    const [mobile, setMobile] = useState(false)
    useEffect(() => { setMobile(detectDesktopPlatform(navigator) === 'mobile') }, [])
    return (
        <div>
            <Link href={href} className="wfp-button">
                {mobile ? 'Start on my phone, finish on computer' : 'Join & set up the desktop app'}
                <span aria-hidden="true">→</span>
            </Link>
            <p className="wfp-microcopy">
                {mobile ? 'Create your free account, then email yourself a computer setup link.' : 'Create your account, install IdleForest, then log in to connect.'}
            </p>
        </div>
    )
}
