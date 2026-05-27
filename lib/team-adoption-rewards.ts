export interface TeamAdoptionReward {
    milestoneId: string
    threshold: number
    animal: string
    art: string
    provider: string
    partner: string
    partnerUrl: string
    url: string
    trackingUrl: string
    trackingLabel: string
    trackingSummary: string
    certificate: string
    colorClass: string
}

export const TEAM_ADOPTION_REWARDS: TeamAdoptionReward[] = [
    {
        milestoneId: 'desktop-25',
        threshold: 25,
        animal: 'Albatross 1163',
        art: '🪽',
        provider: 'IdleForest Tracking',
        partner: 'Movebank + Galapagos Conservancy',
        partnerUrl: 'https://www.galapagos.org/give/',
        url: '/animals',
        trackingUrl: '/animals',
        trackingLabel: 'Real Movebank GPS route',
        trackingSummary: 'Unlock a real waved albatross route from the public Movebank Galapagos Albatrosses study.',
        certificate: 'Tracking profile + team certificate',
        colorClass: 'bg-cyan-50',
    },
    {
        milestoneId: 'desktop-50',
        threshold: 50,
        animal: 'Albatross 2131',
        art: '🪽',
        provider: 'IdleForest Tracking',
        partner: 'Movebank + Galapagos Conservancy',
        partnerUrl: 'https://www.galapagos.org/give/',
        url: '/animals',
        trackingUrl: '/animals',
        trackingLabel: 'Real Movebank GPS route',
        trackingSummary: 'Unlock another public Movebank albatross route with source citation, field images, and campaign products.',
        certificate: 'Tracking profile + team certificate',
        colorClass: 'bg-blue-50',
    },
    {
        milestoneId: 'desktop-100',
        threshold: 100,
        animal: 'Albatross 4262',
        art: '🪽',
        provider: 'IdleForest Tracking',
        partner: 'Movebank + Galapagos Conservancy',
        partnerUrl: 'https://www.galapagos.org/give/',
        url: '/animals',
        trackingUrl: '/animals',
        trackingLabel: 'Real Movebank GPS route',
        trackingSummary: 'Unlock a third public Movebank albatross profile and a premium route certificate for the team.',
        certificate: 'Tracking profile + premium team certificate',
        colorClass: 'bg-green-50',
    },
]

export function getTeamAdoptionRewardByMilestone(milestoneId: string) {
    return TEAM_ADOPTION_REWARDS.find((reward) => reward.milestoneId === milestoneId) || null
}

export function getNextTeamAdoptionReward(activeDesktopMembers: number) {
    return TEAM_ADOPTION_REWARDS.find((reward) => activeDesktopMembers < reward.threshold)
        || TEAM_ADOPTION_REWARDS[TEAM_ADOPTION_REWARDS.length - 1]
}
