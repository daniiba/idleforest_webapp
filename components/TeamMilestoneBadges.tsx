'use client'

import { Award, CheckCircle2, Circle, Monitor, PawPrint, TreePine, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
    getEarnedTeamMilestones,
    getTeamMilestoneProgress,
    getNextTeamMilestone,
    TeamMilestoneMetric,
    TeamMilestoneMetrics,
    TeamMilestoneProgress,
} from '@/lib/team-milestones'

const iconMap: Record<TeamMilestoneMetric, typeof TreePine> = {
    trees: TreePine,
    members: Users,
    desktopMembers: Monitor,
}

function MilestoneBadge({ milestone }: { milestone: TeamMilestoneProgress }) {
    const t = useTranslations('Teams')
    const Icon = milestone.hasPrize ? PawPrint : iconMap[milestone.metric]

    return (
        <div className="flex items-start gap-3 border border-neutral-200 bg-white p-4 rounded-2xl">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-200 bg-brand-yellow rounded-2xl">
                <Icon className="h-5 w-5 text-black" />
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold leading-tight text-black">{t(`milestones.${milestone.id}.title`)}</h3>
                    {milestone.hasPrize && (
                        <span className="border border-neutral-200 bg-green-100 px-2 py-0.5 text-[10px] font-extrabold text-green-800">
                            {t('milestone_prize')}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-600">{t(`milestones.${milestone.id}.description`)}</p>
                <p className="mt-2 text-xs font-extrabold tracking-wide text-brand-navy">
                    {t(`milestones.${milestone.id}.reward`)}
                </p>
            </div>
        </div>
    )
}

function NextMilestone({ milestone }: { milestone: TeamMilestoneProgress }) {
    const t = useTranslations('Teams')
    const Icon = milestone.hasPrize ? PawPrint : iconMap[milestone.metric]

    return (
        <div className="border border-dashed border-neutral-200 bg-brand-yellow/20 p-4 rounded-2xl">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-200 bg-white rounded-2xl">
                        <Icon className="h-5 w-5 text-black" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-extrabold tracking-wide text-neutral-500">{t('next_milestone')}</p>
                        <h3 className="truncate font-extrabold text-black">{t(`milestones.${milestone.id}.title`)}</h3>
                    </div>
                </div>
                <p className="shrink-0 text-sm font-extrabold text-black">{milestone.progressPercent}%</p>
            </div>
            <div className="h-3 border border-neutral-200 bg-white rounded-2xl">
                <div className="h-full bg-brand-yellow" style={{ width: `${milestone.progressPercent}%` }} />
            </div>
            <p className="mt-3 text-sm font-bold text-neutral-700">
                {t('milestone_remaining', {
                    count: milestone.remaining.toLocaleString(),
                    reward: t(`milestones.${milestone.id}.reward`),
                })}
            </p>
        </div>
    )
}

export function TeamMilestoneBadges({ metrics }: { metrics: TeamMilestoneMetrics }) {
    const t = useTranslations('Teams')
    const earned = getEarnedTeamMilestones(metrics)
    const next = getNextTeamMilestone(metrics)
    const visibleEarned = earned.slice(0, 4)

    if (visibleEarned.length === 0 && !next) return null

    return (
        <section className="mb-8 bg-white border border-neutral-200 p-6 rounded-2xl">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 bg-brand-yellow px-3 py-1 text-xs font-extrabold tracking-wide text-black rounded-full">
                        <Award className="h-4 w-4" />
                        {t('team_milestones')}
                    </div>
                    <h2 className="text-2xl font-extrabold text-black">{t('badges_earned_together')}</h2>
                </div>
                <p className="max-w-sm text-sm font-medium text-neutral-600">
                    {t('milestones_intro')}
                </p>
            </div>

            {visibleEarned.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                    {visibleEarned.map((milestone) => (
                        <MilestoneBadge key={milestone.id} milestone={milestone} />
                    ))}
                </div>
            )}

            {next && (
                <div className={visibleEarned.length > 0 ? 'mt-4' : undefined}>
                    <NextMilestone milestone={next} />
                </div>
            )}
        </section>
    )
}

export function TeamMilestoneList({ metrics }: { metrics: TeamMilestoneMetrics }) {
    const t = useTranslations('Teams')
    const metricPriority: Record<TeamMilestoneMetric, number> = {
        desktopMembers: 0,
        trees: 1,
        members: 2,
    }
    const metricLabel: Record<TeamMilestoneMetric, string> = {
        desktopMembers: 'active desktop users',
        trees: 'trees planted',
        members: 'members',
    }
    const milestones = getTeamMilestoneProgress(metrics)
        .filter((milestone) => !milestone.hasPrize)
        .sort((a, b) => metricPriority[a.metric] - metricPriority[b.metric] || a.threshold - b.threshold)

    return (
        <section className="bg-white border border-neutral-200 p-6 rounded-2xl">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 bg-brand-yellow px-3 py-1 text-xs font-extrabold tracking-wide text-black rounded-full">
                        <Award className="h-4 w-4" />
                        {t('team_milestones')}
                    </div>
                    <h2 className="text-2xl font-extrabold text-black">Team badges</h2>
                </div>
                <p className="max-w-sm text-sm font-medium text-neutral-600">
                    Track the team milestones earned through points, trees, members, and desktop activity.
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {milestones.map((milestone) => {
                    const Icon = milestone.hasPrize ? PawPrint : iconMap[milestone.metric]
                    const StatusIcon = milestone.earned ? CheckCircle2 : Circle

                    return (
                        <div
                            key={milestone.id}
                            className={`flex items-start gap-3 border border-neutral-200 p-4 rounded-2xl ${
                                milestone.earned ? 'bg-green-50' : 'bg-white'
                            }`}
                        >
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center border border-neutral-200 rounded-2xl ${
                                milestone.earned ? 'bg-green-500 text-white' : 'bg-brand-yellow text-black'
                            }`}>
                                <Icon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <h3 className="font-extrabold leading-tight text-black">
                                            {t(`milestones.${milestone.id}.title`)}
                                        </h3>
                                    </div>
                                    <span className={`inline-flex shrink-0 items-center gap-1 border border-neutral-200 px-2 py-0.5 text-[10px] font-extrabold rounded-full ${
                                        milestone.earned ? 'bg-green-500 text-white' : 'bg-white text-neutral-700'
                                    }`}>
                                        <StatusIcon className="h-3 w-3" />
                                        {milestone.earned ? 'Reached' : `${milestone.remaining.toLocaleString()} left`}
                                    </span>
                                </div>
                                <p className="text-sm font-medium text-neutral-600">{t(`milestones.${milestone.id}.description`)}</p>
                                <div className="mt-3 h-3 border border-neutral-200 bg-white rounded-2xl">
                                    <div className={milestone.earned ? 'h-full bg-green-500' : 'h-full bg-brand-yellow'} style={{ width: `${milestone.progressPercent}%` }} />
                                </div>
                                <p className="mt-2 text-xs font-extrabold tracking-wide text-brand-navy">
                                    {milestone.value.toLocaleString()} / {milestone.threshold.toLocaleString()} {metricLabel[milestone.metric]} · {t(`milestones.${milestone.id}.reward`)}
                                </p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
