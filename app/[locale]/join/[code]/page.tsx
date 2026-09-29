import { cache } from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { ArrowRight, BadgeCheck, Download, Gift, Lock, ShieldCheck, Star, TreePine, UserPlus } from 'lucide-react'
import { getReferralRewardSettings } from '@/lib/referral-reward-settings'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { normalizeReferralCode, resolveReferralOwner } from '@/lib/referrals'
import { forestSeed, getForestData, type ForestData } from '@/lib/forest'
import ForestIsland from '@/components/forest/ForestIsland'

export const dynamic = 'force-dynamic'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'

const FALLBACK_NAME: Record<string, string> = {
    en: 'Someone',
    de: 'Jemand',
    es: 'Alguien',
    fr: "Quelqu'un",
    pt: 'Alguém',
}

type PageProps = {
    params: { locale: string; code: string }
}

// Shared by generateMetadata and the page within one request.
const loadInvite = cache(async (rawCode: string) => {
    const code = normalizeReferralCode(rawCode)
    if (!code) return null

    const admin = createAdminClient()
    const owner = await resolveReferralOwner(admin, code)
    if (!owner) return null

    let forest: (ForestData & { seed: string }) | null = null
    try {
        forest = { seed: forestSeed(owner.userId), ...(await getForestData(admin, owner.userId, { includeNames: false })) }
    } catch (error) {
        // The invite still works without the inviter's forest.
        console.error('Failed to load inviter forest:', error)
    }

    const reward = await getReferralRewardSettings(admin)

    return { owner, forest, reward }
})

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: 'ReferralInvite' })
    const invite = await loadInvite(params.code).catch(() => null)
    const name = invite?.owner.displayName || FALLBACK_NAME[params.locale] || FALLBACK_NAME.en
    const title = t('meta_title', { name })
    const description = t('meta_description')
    // Link previews show the inviter's forest island.
    const image = invite
        ? `${APP_URL}/api/og/forest?${new URLSearchParams({ code: invite.owner.code, locale: params.locale }).toString()}`
        : `${APP_URL}/api/og/invite?${new URLSearchParams({ name, locale: params.locale }).toString()}`

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

export default async function ReferralInvitePage({ params }: PageProps) {
    const invite = await loadInvite(params.code)

    if (!invite) {
        redirect('/auth/user/signup?referral_error=invalid')
    }

    const t = await getTranslations({ locale: params.locale, namespace: 'ReferralInvite' })
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { owner, forest, reward } = invite
    const name = owner.displayName || FALLBACK_NAME[params.locale] || FALLBACK_NAME.en
    const isOwner = user?.id === owner.userId
    const isMember = Boolean(user) && !isOwner
    const signupHref = `/auth/user/signup?referral=${encodeURIComponent(owner.code)}`
    const loginHref = `/auth/user/login?redirect=${encodeURIComponent('/referrals')}`

    const steps = [
        { icon: UserPlus, title: t('step1_title'), body: t('step1_body', { name }) },
        { icon: Download, title: t('step2_title'), body: t('step2_body') },
        { icon: TreePine, title: t('step3_title'), body: t('step3_body', { name }) },
    ]
    const trustNotes = [
        { icon: Lock, label: t('trust_free') },
        { icon: ShieldCheck, label: t('trust_privacy') },
        { icon: BadgeCheck, label: t('trust_control') },
        { icon: Star, label: t('trust_rating') },
    ]

    return (
        <main className="min-h-screen bg-brand-gray px-4 py-6 font-rethink-sans text-black sm:py-10">
            <div className="mx-auto w-full max-w-6xl">
                <Link href="/" className="mb-6 inline-flex items-center" aria-label="IdleForest">
                    <Image src="/logo.png" alt="IdleForest" width={140} height={32} className="h-8 w-auto" priority />
                </Link>

                <section className="grid overflow-hidden border-2 border-black bg-brand-gray lg:grid-cols-[1.15fr_0.85fr]" aria-labelledby="invite-heading">
                    <div className="p-6 sm:p-10">
                        <p className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-3 py-1 text-xs font-black uppercase tracking-[0.2em]">
                            <UserPlus className="h-4 w-4" aria-hidden="true" />
                            {t('eyebrow')}
                        </p>

                        <h1 id="invite-heading" className="mt-5 font-candu text-4xl font-extrabold uppercase leading-none text-brand-navy sm:text-6xl">
                            {t('title', { name })}
                        </h1>

                        <p className="mt-5 max-w-xl text-lg font-semibold leading-8 text-neutral-700">
                            {t('lead')}
                        </p>

                        {isOwner ? (
                            <div className="mt-8 border-2 border-black bg-brand-navy p-5 text-white">
                                <p className="text-lg font-black uppercase">{t('own_title')}</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-neutral-300">{t('own_body')}</p>
                                <Link href="/referrals" className="mt-4 inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-5 py-3 text-sm font-black uppercase text-black">
                                    {t('own_cta')}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>
                        ) : isMember ? (
                            <div className="mt-8 border-2 border-black bg-neutral-100 p-5">
                                <p className="text-lg font-black uppercase">{t('member_title')}</p>
                                <p className="mt-2 text-sm font-semibold leading-6 text-neutral-700">{t('member_body', { name })}</p>
                                <Link href="/referrals" className="mt-4 inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-5 py-3 text-sm font-black uppercase text-black">
                                    {t('member_cta')}
                                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                                </Link>
                            </div>
                        ) : (
                            <div className="mt-8">
                                {reward.enabled ? (
                                    <div className="mb-5 flex items-start gap-3 border-2 border-black bg-brand-navy p-4 text-white">
                                        <Gift className="mt-0.5 h-6 w-6 shrink-0 text-brand-yellow" aria-hidden="true" />
                                        <div>
                                            <p className="font-black uppercase text-brand-yellow">
                                                {t('reward_title', { trees: reward.treesPerPerson })}
                                            </p>
                                            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-200">
                                                {t('reward_body', { trees: reward.treesPerPerson, days: reward.minActiveDays, name })}
                                            </p>
                                        </div>
                                    </div>
                                ) : null}
                                <Link
                                    href={signupHref}
                                    className="inline-flex w-full items-center justify-center gap-3 border-2 border-black bg-brand-yellow px-8 py-4 text-lg font-black uppercase tracking-wider text-black transition-transform hover:translate-x-[2px] hover:translate-y-[2px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 sm:w-auto"
                                >
                                    {t('cta')}
                                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                                </Link>
                                <p className="mt-3 text-sm font-bold text-neutral-600">{t('cta_note')}</p>
                                <p className="mt-2 text-xs font-semibold text-neutral-500">{t('privacy_note', { name })}</p>
                                <p className="mt-4 text-sm font-semibold text-neutral-600">
                                    {t('login_prompt')}{' '}
                                    <Link href={loginHref} className="font-black text-black underline underline-offset-4">
                                        {t('login')}
                                    </Link>
                                </p>
                            </div>
                        )}

                        <ul className="mt-8 grid gap-2 sm:grid-cols-2">
                            {trustNotes.map(note => {
                                const Icon = note.icon
                                return (
                                    <li key={note.label} className="flex items-center gap-2 text-sm font-bold text-neutral-700">
                                        <Icon className="h-4 w-4 shrink-0 text-brand-navy" aria-hidden="true" />
                                        {note.label}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>

                    <div className="border-t-2 border-black bg-brand-navy p-6 text-white sm:p-10 lg:border-l-2 lg:border-t-0">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-brand-yellow">{t('steps_title')}</p>

                        <ol className="mt-5 space-y-3">
                            {steps.map((step, index) => {
                                const Icon = step.icon
                                return (
                                    <li key={step.title} className="flex gap-4 border-2 border-white/30 bg-white/5 p-4">
                                        <span className="flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-brand-yellow text-black">
                                            <Icon className="h-5 w-5" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <p className="font-mono text-[11px] font-bold text-brand-yellow">0{index + 1}</p>
                                            <p className="font-black uppercase">{step.title}</p>
                                            <p className="mt-1 text-sm font-semibold leading-6 text-neutral-300">{step.body}</p>
                                        </div>
                                    </li>
                                )
                            })}
                        </ol>

                        {forest && (forest.totalTrees > 0 || forest.friends.length > 0) ? (
                            <div className="mt-6 border-2 border-black bg-forest-ground p-5 text-brand-navy">
                                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-black/60">{t('forest_title', { name })}</p>
                                <ForestIsland
                                    className="mt-2"
                                    seed={forest.seed}
                                    ownTrees={forest.ownTrees}
                                    inviteTrees={forest.inviteTrees}
                                    friends={forest.friends}
                                    title={t('forest_title', { name })}
                                />
                                <div className="mt-3 grid grid-cols-2 gap-3">
                                    {forest.totalTrees > 0 ? (
                                        <div>
                                            <p className="font-candu text-4xl font-extrabold">{forest.totalTrees.toLocaleString(params.locale)}</p>
                                            <p className="text-xs font-black uppercase tracking-wider text-black/60">{t('forest_trees', { count: forest.totalTrees })}</p>
                                        </div>
                                    ) : null}
                                    {forest.friends.length > 0 ? (
                                        <div>
                                            <p className="font-candu text-4xl font-extrabold">{forest.friends.length.toLocaleString(params.locale)}</p>
                                            <p className="text-xs font-black uppercase tracking-wider text-black/60">{t('forest_people', { count: forest.friends.length })}</p>
                                        </div>
                                    ) : null}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>
        </main>
    )
}
