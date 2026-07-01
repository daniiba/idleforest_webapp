import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink, FileText, Info, Leaf } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'

const mossyEarthAssets = {
    idleForestLogo: '/logo.png',
    heroVideo: '/partner/mossy-earth/hero-video.mp4',
    portrait: '/partner/mossy-earth/planting-portrait.png',
}

const mossyEarthWebsite = {
    url: 'https://www.mossy.earth/',
    hostname: 'mossy.earth',
}

const mossyEarthFaqs = [
    {
        question: 'Who runs this page?',
        answer:
            "IdleForest runs this page and the free app. Mossy Earth runs its own website and membership.",
    },
    {
        question: 'Does this replace a Mossy Earth membership?',
        answer:
            'No. A Mossy Earth membership is their own paid supporter offering. IdleForest is a separate free app for people who want to add passive support alongside that.',
    },
    {
        question: 'How does IdleForest generate conservation funding?',
        answer:
            'IdleForest runs small sessionless public data tasks through spare bandwidth. Companies and researchers pay for those tasks, and IdleForest can direct revenue from this support page toward conservation and rewilding work.',
    },
]

const mossyEarthReceipts = [
    {
        id: 'mossy-earth-2026-07-01',
        title: 'Mossy Earth receipt #1914-4600',
        amount: 'EUR 24.36',
        date: 'Jul 1, 2026',
        description: 'Mossy Earth Extra support payment.',
        href: '/receits/mossy-earth-2026-07-01-receipt-1914-4600.pdf',
    },
    {
        id: 'mossy-earth-2026-06-05',
        title: 'Mossy Earth receipt #2075-3645',
        amount: 'EUR 12.00',
        date: 'Jun 5, 2026',
        description: 'Mossy Earth membership support payment.',
        href: '/receits/mossy-earth-2026-06-05-receipt-2075-3645.pdf',
    },
]

function formatNumber(value: number, locale: string) {
    return new Intl.NumberFormat(locale).format(Math.max(0, value))
}

function formatFunding(company: any, totalPoints: number, locale: string) {
    const payoutRate = company?.payout_rate_cents_per_1000_points ?? 55
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

type MossyEarthPartnerPageProps = {
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

export default function MossyEarthPartnerPage({
    company,
    params,
    invite,
    isMember,
    isValidInvite,
    isOwner,
    memberCount,
    totalPoints,
    companyWebsite,
}: MossyEarthPartnerPageProps) {
    const joinHref = isMember ? `/${params.locale}/portal/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const primaryCta = isMember ? 'Open your forest' : 'Install IdleForest'
    const website = companyWebsite ?? mossyEarthWebsite
    const canonicalUrl = `https://www.idleforest.com${params.locale === 'en' ? '' : `/${params.locale}`}/c/mossy-earth`
    const jsonLd = [
        {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: 'Support Mossy Earth for Free with IdleForest',
            url: canonicalUrl,
            description:
                "Support Mossy Earth for free with IdleForest background activity. This IdleForest-run support page and free app are separate from Mossy Earth's own website and membership.",
            about: {
                '@type': 'Organization',
                name: 'IdleForest',
                url: 'https://www.idleforest.com/',
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
            mainEntity: mossyEarthFaqs.map((faq) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: faq.answer,
                },
            })),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://www.idleforest.com/',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Support Mossy Earth for Free with IdleForest',
                    item: canonicalUrl,
                },
            ],
        },
    ]
    const impactStats = [
        { label: 'Community Members', value: formatNumber(memberCount, params.locale) },
        { label: 'Tasks Handled', value: formatNumber(totalPoints, params.locale) },
        { label: 'Estimated Mossy Earth Support', value: formatFunding(company, totalPoints, params.locale) },
    ]
    const steps = [
        {
            number: '1.',
            title: 'Join through IdleForest',
            body: 'Supporters connect their IdleForest account to this support page. No invite or donation is required.',
        },
        {
            number: '2.',
            title: 'Install the desktop app',
            body: 'IdleForest works through the desktop app. Install it, log in, and leave it running quietly in the background.',
        },
        {
            number: '3.',
            title: 'Share idle bandwidth',
            body: 'When your computer and connection are idle, the app can use a small share of spare bandwidth to generate funding. It backs off when your connection or device needs priority.',
        },
    ]

    return (
        <div className="mossy-earth-page">
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

            <header className="mossy-earth-nav" aria-label="IdleForest support page navigation">
                <a href="#mossy-earth-top" className="mossy-earth-brand" aria-label="IdleForest support page top">
                    <span className="mossy-earth-mark" aria-hidden>
                        <Image src={mossyEarthAssets.idleForestLogo} alt="" width={132} height={36} priority />
                    </span>
                    <span className="mossy-earth-wordmark">Support Forest</span>
                </a>
                <nav className="mossy-earth-nav-links" aria-label="Page sections">
                    <a href="#mossy-earth-story">Story</a>
                    <a href="#mossy-earth-impact">Impact</a>
                    <a href="#mossy-earth-receipts">Receipts</a>
                </nav>
                {isValidInvite || isMember ? (
                    <Link href={joinHref} className="mossy-earth-pill mossy-earth-pill-solid">
                        Join IdleForest
                        <Leaf aria-hidden />
                    </Link>
                ) : null}
            </header>

            <main id="mossy-earth-top">
                <section className="mossy-earth-hero">
                    <video className="mossy-earth-hero-video" autoPlay muted loop playsInline preload="metadata" aria-label="Underwater habitat video">
                        <source src={mossyEarthAssets.heroVideo} type="video/mp4" />
                    </video>
                    <div className="mossy-earth-hero-shade" />
                    <div className="mossy-earth-hero-content">
                        <p className="mossy-earth-kicker">IdleForest support page</p>
                        <h1>
                            Support Mossy Earth <span>for free.</span>
                        </h1>
                        <p>
                            Install IdleForest in under 30 seconds, then it runs automatically in the background to generate passive conservation funding. This page and app are run by IdleForest,
                            separate from Mossy Earth&apos;s own website and membership.
                        </p>
                        <p className="mossy-earth-disclaimer">
                            <Info aria-hidden />
                            IdleForest runs this free app and support page. Mossy Earth runs its own website and membership.
                        </p>
                        <div className="mossy-earth-actions">
                            {isValidInvite || isMember ? (
                                <Link href={joinHref} className="mossy-earth-pill mossy-earth-pill-solid">
                                    {primaryCta}
                                    <ArrowRight aria-hidden />
                                </Link>
                            ) : null}
                            <a href={website.url} target="_blank" rel="noreferrer" className="mossy-earth-pill mossy-earth-pill-ghost">
                                Visit Mossy Earth
                                <ExternalLink aria-hidden />
                            </a>
                        </div>
                    </div>
                </section>

                <section className="mossy-earth-stat-band" id="mossy-earth-impact" aria-label="IdleForest support impact metrics">
                    <div>
                        {impactStats.map((stat) => (
                            <article key={stat.label}>
                                <p>{stat.label}</p>
                                <strong>{stat.value}</strong>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mossy-earth-receipts" id="mossy-earth-receipts" aria-labelledby="mossy-earth-receipts-heading">
                    <div className="mossy-earth-receipts-heading">
                        <p className="mossy-earth-kicker">Public proof</p>
                        <h2 id="mossy-earth-receipts-heading">Mossy Earth receipts you can open.</h2>
                        <p>
                            These receipts show IdleForest support payments made to Mossy Earth. They are separate from Mossy Earth&apos;s own membership platform and are published here so the funding trail is visible.
                        </p>
                    </div>
                    <div className="mossy-earth-receipt-list">
                        {mossyEarthReceipts.map((receipt) => (
                            <a key={receipt.id} href={receipt.href} target="_blank" rel="noreferrer" className="mossy-earth-receipt-row">
                                <span className="mossy-earth-receipt-icon" aria-hidden>
                                    <FileText />
                                </span>
                                <span className="mossy-earth-receipt-main">
                                    <strong>{receipt.title}</strong>
                                    <span>{receipt.description}</span>
                                </span>
                                <span className="mossy-earth-receipt-meta">
                                    <strong>{receipt.amount}</strong>
                                    <span>{receipt.date}</span>
                                </span>
                                <ExternalLink aria-hidden />
                            </a>
                        ))}
                    </div>
                </section>

                <section className="mossy-earth-explainer" id="mossy-earth-story">
                    <div className="mossy-earth-section-heading">
                        <h2>Idle Internet. Real conservation work.</h2>
                    </div>
                    <div className="mossy-earth-two-col">
                        <article>
                            <h3>
                                <span>The conservation work</span>
                            </h3>
                            <p>
                                Mossy Earth is a team of outdoor enthusiasts and conservation biologists running nature restoration projects in Scotland, Portugal, Ecuador, and Indonesia. Their teams
                                reintroduce lost species, control invasive species, restore degraded habitats, and work on ecosystems that most conservation funding ignores. They are bootstrapped, take
                                no outside investment, and publish every expense publicly.
                            </p>
                            <p>
                                Their core funding comes from paid memberships. This page simply lets IdleForest users direct background app revenue toward conservation work through IdleForest.
                            </p>
                            <a href={website.url} target="_blank" rel="noreferrer">
                                Become a Mossy Earth member
                                <ExternalLink aria-hidden />
                            </a>
                            <a href={`${website.url}projects`} target="_blank" rel="noreferrer">
                                See all Mossy Earth projects
                                <ArrowRight aria-hidden />
                            </a>
                        </article>
                        <article>
                            <h3>
                                <span>The tool</span>
                            </h3>
                            <p>
                                IdleForest puts your unused internet bandwidth to work. The app routes small public data tasks, like checking whether websites are online or comparing public
                                information across regions. These tasks are sessionless: they do not carry personal data, cookies, accounts, browser tabs, files, messages, or browsing
                                history.
                            </p>
                            <p>
                                Companies and researchers pay for access to this public data. IdleForest directs the revenue from this forest to Mossy Earth, so your computer can help fund rewilding
                                while it runs. This support routing is managed by IdleForest. Most active desktop installs contribute around $2-$5 per month, depending on where you are located, how often the app is online, and how much spare
                                internet is available.
                            </p>
                            <p>Your browsing always takes priority. The app backs off the moment your connection is busy. You will not notice it running.</p>
                            <Link href={`/${params.locale}/how-it-works`}>
                                Learn more about IdleForest
                                <ArrowRight aria-hidden />
                            </Link>
                        </article>
                    </div>
                </section>

                <section className="mossy-earth-steps">
                    <h2>Your idle internet connection becomes funding.</h2>
                    <div className="mossy-earth-steps-grid">
                        <div className="mossy-earth-step-list">
                            {steps.map((step) => (
                                <article key={step.number}>
                                    <span>{step.number}</span>
                                    <div>
                                        <h3>{step.title}</h3>
                                        <p>{step.body}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                        <div className="mossy-earth-portrait">
                            <Image src={mossyEarthAssets.portrait} alt="A smiling restoration worker planting a young seedling" fill sizes="(min-width: 900px) 520px, 100vw" className="mossy-earth-image-cover" />
                        </div>
                    </div>
                </section>

                <section className="mossy-earth-faq" aria-labelledby="mossy-earth-faq-heading">
                    <div>
                        <p className="mossy-earth-kicker">IdleForest support page</p>
                        <h2 id="mossy-earth-faq-heading">Support the work, through IdleForest.</h2>
                    </div>
                    <div className="mossy-earth-faq-list">
                        {mossyEarthFaqs.map((faq) => (
                            <article key={faq.question}>
                                <h3>{faq.question}</h3>
                                <p>{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="mossy-earth-final">
                    <h2>Your laptop can help while it rests.</h2>
                    {isValidInvite || isMember ? (
                        <Link href={joinHref} className="mossy-earth-pill mossy-earth-pill-solid">
                            Install IdleForest for free
                            <ArrowRight aria-hidden />
                        </Link>
                    ) : null}
                </section>
            </main>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
