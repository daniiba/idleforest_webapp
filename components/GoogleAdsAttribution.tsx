'use client'

import { useEffect } from 'react'

const ATTRIBUTION_KEYS = [
    'gclid',
    'gbraid',
    'wbraid',
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'campaignid',
    'adgroupid',
    'creative',
    'device',
    'network',
    'matchtype',
]

export default function GoogleAdsAttribution() {
    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search)
        if (!ATTRIBUTION_KEYS.some((key) => searchParams.has(key))) return

        const attribution = Object.fromEntries(
            ATTRIBUTION_KEYS
                .map((key) => [key, searchParams.get(key)])
                .filter((entry): entry is [string, string] => Boolean(entry[1]))
        )

        fetch('/api/acquisition/track', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...attribution,
                landing_path: `${window.location.pathname}${window.location.search}`,
                referrer: document.referrer || null,
            }),
            keepalive: true,
        }).catch(() => {
            // Acquisition measurement must never block the landing page.
        })
    }, [])

    return null
}
