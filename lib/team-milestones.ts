export type TeamMilestoneMetric = 'trees' | 'members' | 'desktopMembers'

export interface TeamMilestoneDefinition {
    id: string
    metric: TeamMilestoneMetric
    threshold: number
    hasPrize?: boolean
}

export interface TeamMilestoneProgress extends TeamMilestoneDefinition {
    value: number
    earned: boolean
    progressPercent: number
    remaining: number
}

export interface TeamMilestoneMetrics {
    trees: number
    members: number
    desktopMembers: number
}

export const TEAM_MILESTONES: TeamMilestoneDefinition[] = [
    {
        id: 'trees-10',
        metric: 'trees',
        threshold: 10,
    },
    {
        id: 'trees-100',
        metric: 'trees',
        threshold: 100,
    },
    {
        id: 'trees-500',
        metric: 'trees',
        threshold: 500,
    },
    {
        id: 'trees-1000',
        metric: 'trees',
        threshold: 1000,
    },
    {
        id: 'members-10',
        metric: 'members',
        threshold: 10,
    },
    {
        id: 'members-50',
        metric: 'members',
        threshold: 50,
    },
    {
        id: 'members-100',
        metric: 'members',
        threshold: 100,
    },
    {
        id: 'desktop-10',
        metric: 'desktopMembers',
        threshold: 10,
    },
    {
        id: 'desktop-25',
        metric: 'desktopMembers',
        threshold: 25,
    },
    {
        id: 'desktop-100',
        metric: 'desktopMembers',
        threshold: 100,
        hasPrize: true,
    },
]

const metricValue = (metrics: TeamMilestoneMetrics, metric: TeamMilestoneMetric) => {
    return Math.max(0, Math.floor(metrics[metric] || 0))
}

export function getTeamMilestoneProgress(metrics: TeamMilestoneMetrics): TeamMilestoneProgress[] {
    return TEAM_MILESTONES.map((milestone) => {
        const value = metricValue(metrics, milestone.metric)
        const progressPercent = Math.min(100, Math.round((value / milestone.threshold) * 100))

        return {
            ...milestone,
            value,
            earned: value >= milestone.threshold,
            progressPercent,
            remaining: Math.max(0, milestone.threshold - value),
        }
    })
}

export function getEarnedTeamMilestones(metrics: TeamMilestoneMetrics): TeamMilestoneProgress[] {
    return getTeamMilestoneProgress(metrics)
        .filter((milestone) => milestone.earned)
        .sort((a, b) => b.threshold - a.threshold)
}

export function getNextTeamMilestone(metrics: TeamMilestoneMetrics): TeamMilestoneProgress | null {
    return getTeamMilestoneProgress(metrics)
        .filter((milestone) => !milestone.earned)
        .sort((a, b) => {
            const progressDiff = b.progressPercent - a.progressPercent
            return progressDiff !== 0 ? progressDiff : a.threshold - b.threshold
        })[0] || null
}

export function getFeaturedTeamMilestone(metrics: TeamMilestoneMetrics): TeamMilestoneProgress | null {
    const earned = getEarnedTeamMilestones(metrics)

    return earned.find((milestone) => milestone.hasPrize)
        || earned[0]
        || getNextTeamMilestone(metrics)
}
