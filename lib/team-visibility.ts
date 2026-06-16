const HIDDEN_TOP_TEAM_SLUGS = [
    'please-give-me-your-name-and-face-and-voice-and-id-and-address-and-i-will-kirk-u-',
]

export function isHiddenTopTeamSlug(slug?: string | null) {
    return Boolean(slug && HIDDEN_TOP_TEAM_SLUGS.includes(slug))
}

export { HIDDEN_TOP_TEAM_SLUGS }
