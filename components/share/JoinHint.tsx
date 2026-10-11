'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { detectDesktopPlatform } from '@/lib/desktop-setup'

// One line under the join button that sets expectations for the next step:
// the product is a desktop app, and most social clicks arrive on a phone.
export default function JoinHint() {
    const t = useTranslations('JoinHint')
    const [mobile, setMobile] = useState(false)

    useEffect(() => {
        setMobile(
            detectDesktopPlatform({
                userAgent: navigator.userAgent,
                platform: navigator.platform,
                maxTouchPoints: navigator.maxTouchPoints,
            }) === 'mobile'
        )
    }, [])

    return <p className="mt-3 text-center text-sm text-neutral-500">{mobile ? t('mobile') : t('desktop')}</p>
}
