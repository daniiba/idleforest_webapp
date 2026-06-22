import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ExternalLink, Leaf, MonitorDown, ShieldCheck, Sprout, Waves } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'

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
        answer: 'IdleForest runs this free support page and app. Planet Wild runs its own website, membership, mission reports, and community.',
    },
    {
        question: 'Does joining here replace a Planet Wild membership?',
        answer: 'No. Planet Wild memberships are paid direct support. IdleForest is a separate free way to route background app revenue toward the Planet Wild fund.',
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
    {
        title: 'Join the fund',
        body: 'Connect your IdleForest account to the public Planet Wild company forest.',
        Icon: Sprout,
    },
    {
        title: 'Install once',
        body: 'Run the free desktop app or browser extension quietly in the background.',
        Icon: MonitorDown,
    },
    {
        title: 'Stay in control',
        body: 'The app backs off when your device or connection needs priority.',
        Icon: ShieldCheck,
    },
    {
        title: 'Route support',
        body: 'Generated funds are reserved for documented Planet Wild rewilding support.',
        Icon: Waves,
    },
]

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
    const joinHref = isMember ? `/${params.locale}/welcome/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
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
            description: 'Join Planet Wild on IdleForest, install once, and let the app generate passive funding for documented rewilding missions in the background.',
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

    return (
        <div className="pw-page">
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <header className="pw-nav" aria-label="IdleForest and Planet Wild page navigation">
                <a href="#planetwild-top" className="pw-wordmark" aria-label="IdleForest and Planet Wild">
                    <span className="pw-wordmark__idle" aria-hidden>
                        <Image src={planetWildAssets.idleForestLogo} alt="" fill sizes="132px" priority />
                    </span>
                    <span className="pw-wordmark__joiner">for</span>
                    <span className="pw-wordmark__planet" aria-hidden>
                        <Image src={planetWildAssets.logo} alt="" fill sizes="42px" priority />
                    </span>
                </a>
                {isValidInvite || isMember ? (
                    <Link href={joinHref} className="pw-chip pw-chip--solid">
                        {isMember ? 'Portal' : 'Join'}
                        <Leaf aria-hidden />
                    </Link>
                ) : null}
            </header>

            <main id="planetwild-top">
                <section className="pw-hero">
                    <div className="pw-hero__bg" aria-hidden>
                        <Image src={planetWildAssets.heroBackground} alt="" fill priority sizes="100vw" />
                    </div>
                    <div className="pw-hero__copy">
                        <div className="pw-partner-label" aria-label="Planet Wild rewilding partner">
                            <Image src={planetWildAssets.partnerLabel} alt="Planet Wild rewilding partner" width={1116} height={444} priority sizes="(min-width: 960px) 27rem, 18rem" />
                        </div>
                        <h1>Fund Planet Wild for free.</h1>
                        <p>Join the Planet Wild forest, install IdleForest once, and the app can generate passive funding for rewilding missions while your computer is already online.</p>
                        <div className="pw-hero__actions">
                            {isValidInvite || isMember ? (
                                <Link href={joinHref} className="pw-chip pw-chip--solid">
                                    {primaryCta}
                                    <ArrowRight aria-hidden />
                                </Link>
                            ) : null}
                            <a href="#planetwild-missions" className="pw-chip pw-chip--text">
                                View missions
                                <ArrowUpRight aria-hidden />
                            </a>
                        </div>
                    </div>
                    <figure className="pw-hero__proof">
                        <div className="pw-video">
                            <iframe
                                src={planetWildMissionVideoEmbedUrl}
                                title="Planet Wild mission videos"
                                loading="eager"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            />
                        </div>
                        <figcaption>
                            <span>Mission reports</span>
                            Filmed and published by Planet Wild.
                        </figcaption>
                    </figure>
                </section>

                <section className="pw-metrics" aria-label="IdleForest support metrics">
                    {impactStats.map((stat) => (
                        <article key={stat.label}>
                            <p>{stat.label}</p>
                            <strong>{stat.value}</strong>
                        </article>
                    ))}
                </section>

                <section className="pw-split" id="planetwild-missions">
                    <div className="pw-split__copy">
                        <h2>Monthly missions, visible work.</h2>
                        <p>
                            Planet Wild publishes mission reports for its rewilding work. IdleForest adds a separate funding layer for supporters who want a free way to help alongside direct
                            membership.
                        </p>
                        <a href={planetWildMissionsUrl} target="_blank" rel="noreferrer" className="pw-inline-link">
                            View all Planet Wild missions
                            <ExternalLink aria-hidden />
                        </a>
                    </div>
                    <div className="pw-mission-grid">
                        {featuredMissions.map((mission, index) => (
                            <a key={mission.number} href={mission.href} target="_blank" rel="noreferrer" className="pw-mission">
                                <Image src={mission.image} alt="" fill sizes={index === 1 ? '(min-width: 960px) 34vw, (min-width: 640px) 36vw, 100vw' : '(min-width: 960px) 24vw, (min-width: 640px) 28vw, 100vw'} />
                                <span>Mission {mission.number}</span>
                                <div>
                                    <p>{mission.date}</p>
                                    <h3>{mission.title}</h3>
                                    <p>{mission.detail}</p>
                                </div>
                            </a>
                        ))}
                    </div>
                </section>

                <section className="pw-split pw-split--reverse" id="planetwild-how">
                    <div className="pw-split__copy">
                        <h2>Turn idle bandwidth into rewilding support.</h2>
                        <p>
                            Companies and researchers pay for sessionless public data tasks. IdleForest can direct this company forest’s revenue toward Planet Wild support, while your normal browsing
                            and device use stay first.
                        </p>
                        <Link href={`/${params.locale}/how-it-works`} className="pw-inline-link">
                            Learn how IdleForest works
                            <ArrowRight aria-hidden />
                        </Link>
                    </div>
                    <ol className="pw-steps">
                        {howItWorks.map((item, index) => {
                            const Icon = item.Icon

                            return (
                                <li key={item.title}>
                                    <span>{String(index + 1).padStart(2, '0')}</span>
                                    <Icon aria-hidden />
                                    <div>
                                        <h3>{item.title}</h3>
                                        <p>{item.body}</p>
                                    </div>
                                </li>
                            )
                        })}
                    </ol>
                </section>

                <section className="pw-faq" aria-labelledby="planetwild-faq-heading">
                    <h2 id="planetwild-faq-heading">Plain answers before you join.</h2>
                    <div className="pw-faq__list">
                        {planetWildFaqs.map((faq) => (
                            <article key={faq.question}>
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="pw-final" id="planetwild-join">
                    <h2>Add free rewilding support to your computer.</h2>
                    <div className="pw-final__actions">
                        {isValidInvite || isMember ? (
                            <Link href={joinHref} className="pw-chip pw-chip--solid">
                                {primaryCta}
                                <ArrowRight aria-hidden />
                            </Link>
                        ) : null}
                        <a href={website.url} target="_blank" rel="noreferrer" className="pw-chip pw-chip--outline">
                            Planet Wild
                            <ExternalLink aria-hidden />
                        </a>
                    </div>
                </section>
            </main>

            <footer className="pw-footer">
                <p>IdleForest runs this page and the free app. Planet Wild runs its own website, membership, missions, transparency reports, and community. © 2026 IdleForest x Planet Wild.</p>
                <a href={planetWildMissionsUrl} target="_blank" rel="noreferrer">
                    Mission reports
                    <ArrowUpRight aria-hidden />
                </a>
            </footer>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
