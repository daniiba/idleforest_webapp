export type DesktopPlatform = 'windows' | 'mac' | 'linux' | 'mobile' | 'other'

export function detectDesktopPlatform(device: { userAgent: string; platform: string; maxTouchPoints: number }): DesktopPlatform {
    // iPadOS can report itself as a Mac; Android often reports Linux.
    if (/Android|iPhone|iPad|iPod/i.test(device.userAgent) ||
        (/Mac/i.test(device.platform) && device.maxTouchPoints > 1)) return 'mobile'
    if (/Win/i.test(device.platform)) return 'windows'
    if (/Mac/i.test(device.platform)) return 'mac'
    if (/Linux/i.test(device.platform)) return 'linux'
    return 'other'
}

export function companySetupPath(slug: string, locale = 'en') {
    const safeLocale = ['en', 'es', 'de', 'pt', 'fr'].includes(locale) ? locale : 'en'
    return `/${safeLocale}/welcome/c/${encodeURIComponent(slug)}`
}
