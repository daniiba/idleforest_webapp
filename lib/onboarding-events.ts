export function trackOnboardingEvent(
    eventName: 'signup_created' | 'desktop_download_clicked' | 'desktop_node_connected' | 'desktop_reward_awarded',
    options: { source?: string; metadata?: Record<string, unknown> } = {}
) {
    if (typeof window === 'undefined') return

    fetch('/api/onboarding-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            eventName,
            source: options.source,
            metadata: options.metadata || {}
        }),
        keepalive: true
    }).catch(() => {
        // Analytics should never block onboarding.
    })
}
