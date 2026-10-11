import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Award, TreePine, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { forestSeed, getPublicTeamForest } from '@/lib/forest'
import { getTeamStats, type TeamStats } from '@/lib/team-stats'
import { getFeaturedTeamMilestone } from '@/lib/team-milestones'
import ForestIsland from '@/components/forest/ForestIsland'
import { Link } from '@/navigation'
import ShareActions from '../../ShareActions'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

type PageProps = {
    params: { locale: string; slug: string }
}

// Shared by generateMetadata and the page within one request.
const loadTeam = cache(async (slug: string) => {
    const supabase = await createClient()
    const { data: team } = await supabase
        .from('teams')
        .select('id, name, slug, image_url, total_points')
        .eq('slug', slug)
        .maybeSingle()

    if (!team) return null

    const admin = createAdminClient()
    const [{ count }, stats, forest] = await Promise.all([
        supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', team.id),
        getTeamStats(admin, team.id).catch((): TeamStats => ({
            actualTreesPlanted: Math.floor((team.total_points || 0) / 1000),
            desktopMemberCount: 0,
            activeDesktopMemberCount: 0,
        })),
        getPublicTeamForest(admin, team.id),
    ])

    return { team, memberCount: count || 0, stats, forest }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'Share' })
    const data = await loadTeam(params.slug).catch(() => null)

    if (!data) {
        return { title: 'IdleForest', robots: { index: false, follow: false } }
    }

    const title = t('meta_team_title', { team: data.team.name })
    const description = t('meta_team_description', { count: data.memberCount, team: data.team.name })
    const image = `${APP_URL}/api/og/invite?${new URLSearchParams({ team: data.team.name, locale: params.locale }).toString()}`

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'IdleForest',
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: { card: 'summary_large_image', title, description, images: [image] },
    }
}

export default async function TeamSharePage({ params }: PageProps) {
    const data = await loadTeam(params.slug)
    if (!data) notFound()

    const t = await getTranslations({ locale: params.locale, namespace: 'Share' })
    const tTeams = await getTranslations({ locale: params.locale, namespace: 'Teams' })

    const { team, memberCount, stats, forest } = data
    const trees = stats.actualTreesPlanted
    const showForest = Boolean(forest) && (forest?.totalTrees ?? 0) > 0

    const milestone = getFeaturedTeamMilestone({
        trees,
        members: memberCount,
        desktopMembers: stats.activeDesktopMemberCount ?? stats.desktopMemberCount,
    })
    const reward = milestone ? tTeams(`milestones.${milestone.id}.reward`) : ''

    const prefix = params.locale === 'en' ? '' : `/${params.locale}`
    const shareUrl = `${APP_URL}${prefix}/share/team/${params.slug}`
    const shareText = milestone?.earned
        ? t('share_text_team_detail', { team: team.name, detail: tTeams(`milestones.${milestone.id}.shareText`) })
        : t('share_text_team', { team: team.name })

    return (
        <main className="min-h-screen bg-[#F7F7F2] px-4 py-6 text-black sm:py-10">
            <div className="mx-auto w-full max-w-lg">
                <Link href="/" className="mb-5 inline-flex" aria-label="IdleForest">
                    <Image src="/logo.png" alt="IdleForest" width={140} height={32} className="h-7 w-auto" priority />
                </Link>

                <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    <div className="flex h-52 items-center justify-center bg-forest-ground sm:h-60">
                        {showForest && forest ? (
                            <ForestIsland
                                className="h-full w-full [&>svg]:h-full [&>svg]:w-full"
                                seed={forestSeed(`team:${team.id}`)}
                                ownTrees={0}
                                inviteTrees={0}
                                friends={forest.friends}
                                title={team.name}
                                hub
                            />
                        ) : team.image_url ? (
                            <Image
                                src={team.image_url}
                                alt={team.name}
                                width={144}
                                height={144}
                                unoptimized
                                priority
                                className="h-36 w-36 rounded-3xl bg-white object-cover shadow-sm"
                            />
                        ) : (
                            <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-brand-yellow shadow-sm">
                                <Users className="h-14 w-14" aria-hidden="true" />
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-8 pt-7 text-center sm:px-10">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{team.name}</h1>

                        <p className="mt-3 flex items-center justify-center gap-4 text-sm font-bold text-neutral-600">
                            <span className="inline-flex items-center gap-1.5">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {memberCount.toLocaleString(params.locale)} {t('members', { count: memberCount })}
                            </span>
                            {trees > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <TreePine className="h-4 w-4 text-green-600" aria-hidden="true" />
                                    {trees.toLocaleString(params.locale)} {t('trees', { count: trees })}
                                </span>
                            ) : null}
                        </p>

                        {milestone ? (
                            <div className="mt-6 rounded-2xl bg-neutral-50 p-4 text-left">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                                        {milestone.earned ? t('milestone_unlocked') : tTeams('next_milestone')}
                                    </p>
                                    {milestone.earned ? (
                                        <Award className="h-4 w-4 text-brand-navy" aria-hidden="true" />
                                    ) : (
                                        <p className="text-xs font-bold text-neutral-500">{milestone.progressPercent}%</p>
                                    )}
                                </div>
                                <p className="mt-1 font-extrabold">{tTeams(`milestones.${milestone.id}.title`)}</p>
                                {milestone.earned ? (
                                    <p className="mt-1 text-sm text-neutral-600">{tTeams(`milestones.${milestone.id}.description`)}</p>
                                ) : (
                                    <>
                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-neutral-200">
                                            <div
                                                className="h-full rounded-full bg-brand-yellow"
                                                style={{ width: `${Math.max(4, milestone.progressPercent)}%` }}
                                            />
                                        </div>
                                        <p className="mt-2 text-sm text-neutral-600">
                                            {tTeams('milestone_remaining', { count: milestone.remaining, reward })}
                                        </p>
                                    </>
                                )}
                            </div>
                        ) : null}

                        <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-neutral-600">
                            {t('lead_team', { team: team.name })}
                        </p>

                        <Link
                            href={`/teams/${team.slug || team.id}`}
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 text-lg font-extrabold text-black"
                        >
                            {t('cta_join_team', { team: team.name })}
                            <ArrowRight className="h-5 w-5" aria-hidden="true" />
                        </Link>

                        <div className="mt-6">
                            <ShareActions
                                url={shareUrl}
                                text={shareText}
                                labels={{
                                    share: t('share_title'),
                                    copyLink: t('copy_link'),
                                    copied: t('copied'),
                                    shareOnX: t('share_on_x'),
                                    shareOnFacebook: t('share_on_facebook'),
                                    shareOnLinkedin: t('share_on_linkedin'),
                                }}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    )
}
