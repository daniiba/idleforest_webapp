import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, AlertTriangle, LinkIcon, UserPlus, Users, TreePine, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { forestSeed, getPublicTeamForest } from '@/lib/forest'
import ForestIsland from '@/components/forest/ForestIsland'
import { Link } from '@/navigation'
import JoinHint from '@/components/share/JoinHint'
import InviteJoinButton from './InviteJoinButton'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

type PageProps = {
    params: { locale: string; code: string }
}

type InviteResult =
    | { status: 'invalid' }
    | { status: 'expired' }
    | {
        status: 'ok'
        memberCount: number
        team: {
            id: string
            name: string
            slug: string | null
            description: string | null
            image_url: string | null
            total_points: number
        }
    }

// Shared by generateMetadata and the page within one request.
const loadInvite = cache(async (code: string): Promise<InviteResult> => {
    const supabase = await createClient()

    const { data: invite } = await supabase
        .from('team_invites')
        .select('team_id, expires_at')
        .eq('invite_code', code)
        .maybeSingle()

    if (!invite) return { status: 'invalid' }

    const [{ data: team }, { count }] = await Promise.all([
        supabase
            .from('teams')
            .select('id, name, slug, description, image_url, total_points')
            .eq('id', invite.team_id)
            .maybeSingle(),
        supabase.from('team_members').select('*', { count: 'exact', head: true }).eq('team_id', invite.team_id),
    ])

    if (!team) return { status: 'invalid' }
    if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
        return { status: 'expired' }
    }

    return {
        status: 'ok',
        memberCount: count || 0,
        team: { ...team, total_points: team.total_points || 0 },
    }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'TeamInvite' })
    const invite = await loadInvite(params.code).catch(() => ({ status: 'invalid' }) as InviteResult)

    if (invite.status !== 'ok') {
        return {
            title: t('meta_fallback_title'),
            description: t('lead'),
            robots: { index: false, follow: false },
        }
    }

    const title = t('meta_title', { team: invite.team.name })
    const description = t('meta_description', { team: invite.team.name })
    // The team preview shows the team's own art; teams without a slug get the plain invite card.
    const image = invite.team.slug
        ? `${APP_URL}/api/og/team?${new URLSearchParams({ slug: invite.team.slug, locale: params.locale }).toString()}`
        : `${APP_URL}/api/og/invite?${new URLSearchParams({ team: invite.team.name, locale: params.locale }).toString()}`

    return {
        title,
        description,
        robots: { index: false, follow: false },
        openGraph: {
            title,
            description,
            type: 'website',
            siteName: 'IdleForest',
            images: [{ url: image, width: 1200, height: 630, alt: title }],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
        },
    }
}

type CurrentTeam = { id: string; name: string; slug: string | null; createdBy: string | null }

async function getCurrentTeam(userId: string): Promise<CurrentTeam | null> {
    const supabase = await createClient()
    const { data: membership } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name, created_by, slug)')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle()

    const team = membership?.teams as unknown as { id: string; name: string; created_by: string | null; slug: string | null } | null
    if (!team) return null
    return { id: team.id, name: team.name, slug: team.slug, createdBy: team.created_by }
}

export default async function InvitePage({ params }: PageProps) {
    const t = await getTranslations({ locale: params.locale, namespace: 'TeamInvite' })
    const invite = await loadInvite(params.code)

    if (invite.status !== 'ok') {
        const expired = invite.status === 'expired'
        const body = expired ? t('expired_body_generic') : t('invalid_body')

        return (
            <main className="flex min-h-screen items-center justify-center bg-[#F7F7F2] p-4 text-black">
                <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-neutral-200 bg-brand-yellow">
                        <LinkIcon className="h-7 w-7" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-extrabold">{expired ? t('expired_title') : t('invalid_title')}</h1>
                    <p className="mt-3 text-neutral-600">{body}</p>
                    <div className="mt-6 space-y-3">
                        <NextLink
                            href="/auth/user/signup"
                            className="block w-full rounded-full bg-brand-yellow py-3 text-center text-base font-bold"
                        >
                            {t('error_signup')}
                        </NextLink>
                        <Link
                            href="/"
                            className="block w-full rounded-full border border-neutral-300 py-3 text-center text-sm font-bold text-neutral-700 hover:bg-neutral-100"
                        >
                            {t('error_home')}
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    const { team, memberCount } = invite
    const teamHref = `/teams/${team.slug || team.id}`

    const supabase = await createClient()
    const [{ data: { user } }, forest] = await Promise.all([supabase.auth.getUser(), getPublicTeamForest(createAdminClient(), team.id)])
    const currentTeam = user ? await getCurrentTeam(user.id) : null
    const isMember = currentTeam?.id === team.id
    const otherTeam = currentTeam && !isMember ? currentTeam : null
    const ownsOtherTeam = Boolean(user && otherTeam && otherTeam.createdBy === user.id)

    const signupHref = `/auth/user/signup?invite=${encodeURIComponent(params.code)}`
    const loginHref = `/auth/user/login?redirect=${encodeURIComponent(`/invite/${params.code}`)}`
    const treeCount = forest?.totalTrees ?? 0
    // An empty island says nothing, so the forest only shows once there are trees.
    const showForest = Boolean(forest) && treeCount > 0
    const perks = [t('perk_free'), t('perk_background'), t('perk_pause')].join(' · ')

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
                        <p className="text-sm font-bold text-neutral-500">{t('invited_by')}</p>
                        <h1 className="mt-1 text-4xl font-extrabold leading-tight tracking-tight text-brand-navy">{team.name}</h1>

                        <p className="mt-3 flex items-center justify-center gap-3 text-sm font-bold text-neutral-600">
                            <span className="inline-flex items-center gap-1.5">
                                <Users className="h-4 w-4" aria-hidden="true" />
                                {memberCount.toLocaleString(params.locale)} {t('members', { count: memberCount })}
                            </span>
                            {treeCount > 0 ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <TreePine className="h-4 w-4 text-green-600" aria-hidden="true" />
                                    {treeCount.toLocaleString(params.locale)} {t('trees', { count: treeCount })}
                                </span>
                            ) : null}
                        </p>

                        <p className="mx-auto mt-5 max-w-sm text-base leading-relaxed text-neutral-600">{t('lead')}</p>

                        <div className="mt-7">
                            {isMember ? (
                                <div>
                                    <p className="font-extrabold">{t('member_title', { team: team.name })}</p>
                                    <p className="mt-1 text-sm text-neutral-600">{t('member_body')}</p>
                                    <Link
                                        href={teamHref}
                                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 text-lg font-extrabold"
                                    >
                                        {t('member_cta')}
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </Link>
                                </div>
                            ) : ownsOtherTeam && otherTeam ? (
                                <div className="flex items-start gap-3 rounded-2xl border border-red-300 bg-red-50 p-4 text-left">
                                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
                                    <div>
                                        <p className="font-extrabold text-red-800">{t('owner_title', { current: otherTeam.name })}</p>
                                        <p className="mt-1 text-sm text-red-700">{t('owner_body', { team: team.name })}</p>
                                        <Link
                                            href={`/teams/${otherTeam.slug || otherTeam.id}`}
                                            className="mt-3 inline-block rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white"
                                        >
                                            {t('owner_cta')}
                                        </Link>
                                    </div>
                                </div>
                            ) : user ? (
                                <div className="space-y-4">
                                    {otherTeam ? (
                                        <div className="flex items-start gap-3 rounded-2xl border border-orange-300 bg-orange-50 p-4 text-left">
                                            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" aria-hidden="true" />
                                            <div>
                                                <p className="font-extrabold text-orange-800">{t('switch_title')}</p>
                                                <p className="mt-1 text-sm text-orange-700">
                                                    {t('switch_body', { current: otherTeam.name, team: team.name })}
                                                </p>
                                            </div>
                                        </div>
                                    ) : null}
                                    <InviteJoinButton
                                        code={params.code}
                                        teamId={team.id}
                                        teamName={team.name}
                                        teamHref={teamHref}
                                        switching={Boolean(otherTeam)}
                                    />
                                </div>
                            ) : (
                                <>
                                    <NextLink
                                        href={signupHref}
                                        className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 text-lg font-extrabold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                                    >
                                        {t('cta_signup')}
                                        <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                    </NextLink>
                                    <JoinHint />
                                    <p className="mt-4 text-sm text-neutral-600">
                                        {t('login_prompt')}{' '}
                                        <NextLink href={loginHref} className="font-bold text-black underline underline-offset-4">
                                            {t('login')}
                                        </NextLink>
                                    </p>
                                </>
                            )}
                        </div>

                        <p className="mt-6 text-xs font-bold text-neutral-400">{perks}</p>
                    </div>
                </section>

                <p className="mt-5 px-2 text-center text-xs text-neutral-500">
                    {t('terms_prefix')}{' '}
                    <Link href="/terms" className="underline hover:text-black">{t('terms')}</Link>{' '}
                    {t('and')}{' '}
                    <Link href="/privacy" className="underline hover:text-black">{t('privacy')}</Link>.
                </p>
            </div>
        </main>
    )
}
