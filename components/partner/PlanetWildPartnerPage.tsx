import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ExternalLink, Leaf } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'
import { HabitatArt, InstallArt, JoinArt, RunArt } from '@/components/partner/MossyEarthArt'

const planetWildAssets = {
    idleForestLogo: '/logo.png',
    logo: '/partner/planetwild/pw-logo-black.png',
    partnerLabel: '/partner/planetwild/rewilding-partner-light.png',
    heroBackground: 'https://cdn.prod.website-files.com/665f17d0fb4bfc1e811460d3/6a2fd54e90263b0be39668bf_website_mission_report_header.webp',
}

const planetWildWebsite = {
    url: 'https://planetwild.com/',
    hostname: 'planetwild.com',
}

const planetWildMissionsUrl = 'https://planetwild.com/missions'
const planetWildMissionVideoEmbedUrl = 'https://www.youtube-nocookie.com/embed/videoseries?list=UU6QFT2c2MJxID-vxHDeX9XQ&rel=0'

const planetWildFaqs = [
    {
        question: 'Who runs this page?',
        answer: 'IdleForest runs this free support page and app. Planet Wild runs its own website, membership, mission reports, and community. This is a separate IdleForest product.',
    },
    {
        question: 'Does joining here replace a Planet Wild membership?',
        answer: 'No. Planet Wild memberships are their own paid supporter offering. IdleForest is a separate free app for people who want to add passive support alongside that.',
    },
    {
        question: 'What does IdleForest share?',
        answer: 'IdleForest handles small sessionless public data tasks through spare bandwidth. It does not carry personal data, cookies, accounts, browser tabs, files, messages, or browsing history.',
    },
]

const recentMissions = [
    {
        number: '40',
        date: 'June 15, 2026',
        title: 'Australia’s lost ecosystem',
        detail: 'Restoring degraded farmland with the Forktree Project in South Australia.',
        href: 'https://planetwild.com/missions/40-bringing-back-australias-lost-ecosystem',
        image: 'https://cdn.prod.website-files.com/665f17d0fb4bfc1e811460d3/6a2fd54e90263b0be39668bf_website_mission_report_header.webp',
    },
    {
        number: '39',
        date: 'May 15, 2026',
        title: 'A forest that lasts',
        detail: 'Native trees and monitoring in Kenya.',
        href: 'https://planetwild.com/missions/39-building-a-lasting-forest',
        image: 'https://cdn.prod.website-files.com/665f17d0fb4bfc1e811460d3/6a04e07f85533ea7c3e1d344_card_image.webp',
    },
    {
        number: '38',
        date: 'April 15, 2026',
        title: 'Cloud forest',
        detail: 'Protecting cloud forest habitat in Colombia.',
        href: 'https://planetwild.com/missions/38-cloud-forests-of-colombia',
        image: 'https://cdn.prod.website-files.com/665f17d0fb4bfc1e811460d3/69df7bd9815297fa0577a70e_card_image.webp',
    },
    {
        number: '37',
        date: 'March 15, 2026',
        title: 'Biodiversity corridor',
        detail: 'Connecting Cerrado habitat in South America.',
        href: 'https://planetwild.com/missions/37-building-longest-biodiversity-corridor',
        image: 'https://cdn.prod.website-files.com/665f17d0fb4bfc1e811460d3/69df9cf82c211992256234ef_card_image-m37.webp',
    },
]

const featuredMissions = [recentMissions[1], recentMissions[0], recentMissions[2]]

const howItWorks = [
    { art: JoinArt, title: 'Join the fund', body: 'Connect your IdleForest account to the public Planet Wild forest.' },
    { art: InstallArt, title: 'Install once', body: 'Run the free desktop app or browser extension in the background.' },
    { art: RunArt, title: 'Stay in control', body: 'The app backs off when your device or connection needs priority.' },
    { art: HabitatArt, title: 'Route support', body: 'Funds are reserved for documented Planet Wild rewilding support.' },
]

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95'

function formatNumber(value: number, locale: string) {
    return new Intl.NumberFormat(locale).format(Math.max(0, value))
}

function formatFunding(company: any, totalPoints: number, locale: string) {
    const payoutRate = company?.payout_rate_cents_per_1000_points ?? 27
    const fundingCents = Math.floor((Math.max(0, totalPoints) / 1000) * payoutRate)

    return new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(fundingCents / 100)
}

type CompanyWebsite = {
    url: string
    hostname: string
} | null

type PlanetWildPartnerPageProps = {
    company: any
    params: { slug: string; locale: string }
    invite?: string
    isMember: boolean
    isValidInvite: boolean
    isOwner: boolean
    memberCount: number
    totalPoints: number
    companyWebsite: CompanyWebsite
}

export default function PlanetWildPartnerPage({ company, params, invite, isMember, isValidInvite, isOwner, memberCount, totalPoints, companyWebsite }: PlanetWildPartnerPageProps) {
    const joinHref = isMember ? `/${params.locale}/portal/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const website = companyWebsite ?? planetWildWebsite
    const primaryCta = isMember ? 'Open portal' : 'Install IdleForest'
    const canonicalUrl = `https://www.idleforest.com${params.locale === 'en' ? '' : `/${params.locale}`}/c/planetwild`
    const impactStats = [
        { label: 'Supporters', value: formatNumber(memberCount, params.locale) },
        { label: 'Tasks handled', value: formatNumber(totalPoints, params.locale) },
        {
            label: 'Reserved support',
            value: formatFunding(company, totalPoints, params.locale),
        },
    ]
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Fund Planet Wild for Free with IdleForest',
            url: canonicalUrl,
            description:
                'Support Planet Wild for free with IdleForest background activity. This IdleForest-run support page and free app are separate from Planet Wild’s own website and membership.',
            about: {
                '@type': 'Organization',
                name: 'Planet Wild',
                url: website.url,
            },
            provider: {
                '@type': 'Organization',
                name: 'IdleForest',
                url: 'https://www.idleforest.com/',
            },
        },
        {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: planetWildFaqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        },
    ]

    const canJoin = isValidInvite || isMember

    return (
        <div className="min-h-screen bg-[#F7F7F2] text-brand-navy">
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur-md" aria-label="IdleForest and Planet Wild page navigation">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="#planetwild-top" className="flex items-center gap-3" aria-label="IdleForest and Planet Wild">
                        <Image src={planetWildAssets.idleForestLogo} alt="" width={121} height={33} priority className="h-auto w-[96px]" />
                        <span className="text-sm font-bold text-neutral-400" aria-hidden>&times;</span>
                        <Image src={planetWildAssets.logo} alt="" width={84} height={84} priority className="h-8 w-8 object-contain" />
                    </a>
                    {canJoin ? (
                        <Link href={joinHref} className={`${primaryButton} !px-5 !py-2.5`}>
                            {isMember ? 'Portal' : 'Join'}
                            <Leaf className="h-4 w-4" aria-hidden />
                        </Link>
                    ) : null}
                </div>
            </header>

            <main id="planetwild-top" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
                {/* Hero */}
                <section className="relative overflow-hidden rounded-3xl bg-[#0F241C] text-white">
                    <Image src={planetWildAssets.heroBackground} alt="" fill priority sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover opacity-55" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F241C] via-[#0F241C]/75 to-[#0F241C]/25" aria-hidden />
                    <div className="relative grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12 lg:p-14">
                        <div>
                            <Image src={planetWildAssets.partnerLabel} alt="Planet Wild rewilding partner" width={1116} height={444} priority sizes="(min-width: 960px) 14rem, 12rem" className="h-auto w-48 sm:w-56" />
                            <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                                Fund Planet Wild <span className="text-brand-yellow">for free.</span>
                            </h1>
                            <p className="mt-5 max-w-lg text-lg leading-7 text-white/80">
                                Join the Planet Wild forest and install IdleForest once. The app can fund rewilding missions while your computer is already online.
                            </p>
                            <div className="mt-7 flex flex-wrap gap-3">
                                {canJoin ? (
                                    <Link href={joinHref} className={primaryButton}>
                                        {primaryCta}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                ) : null}
                                <a href="#planetwild-missions" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                    View missions
                                    <ArrowUpRight className="h-4 w-4" aria-hidden />
                                </a>
                            </div>
                            <p className="mt-5 max-w-md text-xs leading-5 text-white/60">
                                IdleForest is the free background app. Planet Wild runs its own website, membership, mission reports and community, separate from this page.
                            </p>
                        </div>
                        <figure>
                            <div className="relative aspect-video overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15">
                                <iframe
                                    src={planetWildMissionVideoEmbedUrl}
                                    title="Planet Wild mission videos"
                                    loading="eager"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
                                    allowFullScreen
                                    className="absolute inset-0 h-full w-full"
                                />
                            </div>
                            <figcaption className="mt-3 text-xs text-white/70">
                                <span className="mr-2 font-bold text-brand-yellow">Mission reports</span>
                                Filmed and published by Planet Wild.
                            </figcaption>
                        </figure>
                    </div>
                </section>

                {/* Stats */}
                <dl className="grid gap-3 sm:grid-cols-3" aria-label="IdleForest support metrics">
                    {impactStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <dd className="text-3xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                            <dt className="mt-1 text-sm text-neutral-500">{stat.label}</dt>
                        </div>
                    ))}
                </dl>

                {/* Missions */}
                <section id="planetwild-missions" aria-labelledby="missions-heading">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 id="missions-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Monthly missions, visible work</h2>
                            <p className="mt-1 max-w-xl text-neutral-600">Planet Wild publishes a report for each rewilding mission. IdleForest adds a free way to help alongside their own membership.</p>
                        </div>
                        <a href={planetWildMissionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                            All missions
                            <ExternalLink className="h-4 w-4" aria-hidden />
                        </a>
                    </div>
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                        {featuredMissions.map((mission) => (
                            <a key={mission.number} href={mission.href} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                                <div className="relative aspect-[16/10] bg-neutral-100">
                                    <Image src={mission.image} alt="" fill sizes="(min-width: 768px) 360px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                    <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold shadow-sm">Mission {mission.number}</span>
                                </div>
                                <div className="p-5">
                                    <p className="text-xs font-medium text-neutral-500">{mission.date}</p>
                                    <h3 className="mt-1 text-lg font-extrabold leading-tight">{mission.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{mission.detail}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section id="planetwild-how" className="overflow-hidden rounded-3xl bg-[#16382D] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="how-heading">
                    <h2 id="how-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Idle bandwidth becomes rewilding support</h2>
                    <p className="mx-auto mt-3 max-w-xl text-center text-white/75">
                        Companies and researchers pay for sessionless public data tasks. Revenue from this forest goes toward Planet Wild support, and your normal browsing always comes first.
                    </p>
                    <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {howItWorks.map((item) => (
                            <li key={item.title} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                                <item.art className="h-24 w-24" />
                                <p className="mt-4 text-lg font-extrabold">{item.title}</p>
                                <p className="mt-1 text-sm text-white/75">{item.body}</p>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-6 text-center">
                        <Link href={`/${params.locale}/how-it-works`} className="inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                            How IdleForest works
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </p>
                </section>

                {/* FAQ */}
                <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="planetwild-faq-heading">
                    <h2 id="planetwild-faq-heading" className="text-xl font-extrabold tracking-tight">Plain answers before you join</h2>
                    <div className="mt-4 divide-y divide-neutral-200">
                        {planetWildFaqs.map((faq) => (
                            <article key={faq.question} className="py-4 first:pt-0 last:pb-0">
                                <h3 className="font-bold">{faq.question}</h3>
                                <p className="mt-1 text-neutral-600">{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section id="planetwild-join" className="relative overflow-hidden rounded-3xl bg-[#0F241C]">
                    <Image src={planetWildAssets.heroBackground} alt="" fill sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover opacity-35" />
                    <div className="relative px-6 py-14 text-center text-white sm:py-20">
                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                            Add free rewilding support to your computer.
                        </h2>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            {canJoin ? (
                                <Link href={joinHref} className={primaryButton}>
                                    {primaryCta}
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            ) : null}
                            <a href={website.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                Planet Wild
                                <ExternalLink className="h-4 w-4" aria-hidden />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pb-10 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="max-w-3xl">
                    IdleForest runs this page and the free app as a separate product. Planet Wild runs its own website, membership, missions, transparency reports and community. © 2026 IdleForest x Planet Wild.
                </p>
                <a href={planetWildMissionsUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-bold text-neutral-700 underline underline-offset-4">
                    Mission reports
                    <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                </a>
            </footer>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
