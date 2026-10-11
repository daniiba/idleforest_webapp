import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, Award, TreePine, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { forestSeed, getForestData, type ForestData } from '@/lib/forest'
import ForestIsland from '@/components/forest/ForestIsland'
import { Link } from '@/navigation'
import ShareActions from '../../ShareActions'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

type PageProps = {
    params: { locale: string; username: string }
}

// Shared by generateMetadata and the page within one request.
const loadMember = cache(async (username: string) => {
    const supabase = await createClient()
    const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .ilike('display_name', decodeURIComponent(username))
        .maybeSingle()

    if (!profile) return null

    let forest: (ForestData & { seed: string }) | null = null
    try {
        forest = { seed: forestSeed(profile.user_id), ...(await getForestData(createAdminClient(), profile.user_id, { includeNames: false })) }
    } catch (error) {
        // The page still works without the island.
        console.error('Failed to load member forest:', error)
    }

    const [{ count: badgeCount }, { data: membership }] = await Promise.all([
        supabase
            .from('badge_progress')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.user_id)
            .gte('current_value', 1),
        supabase.from('team_members').select('teams(name, slug)').eq('user_id', profile.user_id).limit(1).maybeSingle(),
    ])

    const team = membership?.teams as unknown as { name: string; slug: string | null } | null
    // The island counts friends' trees too; the headline number is the member's own.
    const trees = forest ? forest.ownTrees + forest.inviteTrees : 0

    return { name: profile.display_name as string, forest, trees, badgeCount: badgeCount || 0, team }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'Share' })
    const member = await loadMember(params.username).catch(() => null)

    if (!member) {
        return { title: 'IdleForest', robots: { index: false, follow: false } }
    }

    const title = t('meta_user_title', { name: member.name })
    const description = t('meta_user_description', { name: member.name, count: member.trees })
    // The preview shows the member's forest island.
    const image = `${APP_URL}/api/og/forest?${new URLSearchParams({ displayName: member.name }).toString()}`

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

export default async function UserSharePage({ params }: PageProps) {
    const member = await loadMember(params.username)
    if (!member) notFound()

    const t = await getTranslations({ locale: params.locale, namespace: 'Share' })
    const { name, forest, trees, badgeCount, team } = member
    const showForest = Boolean(forest) && (forest!.totalTrees > 0 || forest!.friends.length > 0)

    const prefix = params.locale === 'en' ? '' : `/${params.locale}`
    const shareUrl = `${APP_URL}${prefix}/share/user/${params.username}`
    const shareText = t('share_text_user', { name, count: trees })

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
                                seed={forest.seed}
                                ownTrees={forest.ownTrees}
                                inviteTrees={forest.inviteTrees}
                                friends={forest.friends}
                                title={name}
                            />
                        ) : (
                            <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-brand-yellow text-6xl font-extrabold shadow-sm">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>

                    <div className="px-6 pb-8 pt-7 text-center sm:px-10">
                        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{name}</h1>

                        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-bold text-neutral-600">
                            {trees > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <TreePine className="h-4 w-4 text-green-600" aria-hidden="true" />
                                    {trees.toLocaleString(params.locale)} {t('trees', { count: trees })}
                                </span>
                            ) : null}
                            {badgeCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <Award className="h-4 w-4" aria-hidden="true" />
                                    {badgeCount.toLocaleString(params.locale)} {t('badges', { count: badgeCount })}
                                </span>
                            ) : null}
                            {team?.slug ? (
                                <Link href={`/teams/${team.slug}`} className="inline-flex items-center gap-1.5 hover:text-black hover:underline">
                                    <Users className="h-4 w-4" aria-hidden="true" />
                                    {t('in_team', { team: team.name })}
                                </Link>
                            ) : null}
                        </p>

                        <p className="mx-auto mt-6 max-w-sm text-base leading-relaxed text-neutral-600">{t('lead_user')}</p>

                        <Link
                            href="/"
                            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 text-lg font-extrabold text-black"
                        >
                            {t('cta_join')}
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
