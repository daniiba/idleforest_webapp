'use client'

import { Award, Monitor, PawPrint, TreePine, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
    getEarnedTeamMilestones,
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
        <div className="flex items-start gap-3 border-2 border-black bg-white p-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-brand-yellow">
                <Icon className="h-5 w-5 text-black" />
            </div>
            <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold uppercase leading-tight text-black">{t(`milestones.${milestone.id}.title`)}</h3>
                    {milestone.hasPrize && (
                        <span className="border border-black bg-green-100 px-2 py-0.5 text-[10px] font-extrabold uppercase text-green-800">
                            {t('milestone_prize')}
                        </span>
                    )}
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-600">{t(`milestones.${milestone.id}.description`)}</p>
                <p className="mt-2 text-xs font-extrabold uppercase tracking-wide text-brand-navy">
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
        <div className="border-2 border-dashed border-black bg-brand-yellow/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-white">
                        <Icon className="h-5 w-5 text-black" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs font-extrabold uppercase tracking-wide text-neutral-500">{t('next_milestone')}</p>
                        <h3 className="truncate font-extrabold uppercase text-black">{t(`milestones.${milestone.id}.title`)}</h3>
                    </div>
                </div>
                <p className="shrink-0 text-sm font-black text-black">{milestone.progressPercent}%</p>
            </div>
            <div className="h-3 border-2 border-black bg-white">
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
        <section className="mb-8 bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <div className="mb-2 inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-black">
                        <Award className="h-4 w-4" />
                        {t('team_milestones')}
                    </div>
                    <h2 className="text-2xl font-black uppercase text-black">{t('badges_earned_together')}</h2>
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
