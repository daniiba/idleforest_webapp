import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Check, ExternalLink, FileText, Info, Leaf } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'
import IdleBandwidthArt from '@/components/landing/IdleBandwidthArt'
import { EcosystemArt, HabitatArt, InstallArt, InvasiveArt, JoinArt, RunArt, SpeciesArt } from '@/components/partner/MossyEarthArt'

const mossyEarthAssets = {
    idleForestLogo: '/logo.png',
    heroVideo: '/partner/mossy-earth/hero-video.mp4',
    portrait: '/partner/mossy-earth/planting-portrait.png',
    logo: '/partner/mossy-earth/logo-official.png',
}

const mossyEarthWebsite = {
    url: 'https://www.mossy.earth/',
    hostname: 'mossy.earth',
}

const mossyEarthFaqs = [
    {
        question: 'Who runs this page?',
        answer: 'IdleForest runs this page and the free app. Mossy Earth runs its own website and membership.',
    },
    {
        question: 'Does this replace a Mossy Earth membership?',
        answer: 'No. Membership is their own paid offering. IdleForest is a free app that adds passive support alongside it.',
    },
    {
        question: 'How does IdleForest generate conservation funding?',
        answer: 'Spare bandwidth runs small public data tasks. Companies pay for them, and revenue from this page goes toward conservation work.',
    },
]

const mossyEarthFocus = [
    { art: SpeciesArt, title: 'Bringing back lost species' },
    { art: InvasiveArt, title: 'Controlling invasive species' },
    { art: HabitatArt, title: 'Restoring degraded habitats' },
    { art: EcosystemArt, title: 'Ecosystems funding overlooks' },
]

const mossyEarthReceipts = [
    {
        id: 'mossy-earth-2026-07-01',
        title: 'Receipt #1914-4600',
        amount: 'EUR 24.36',
        date: 'Jul 1, 2026',
        description: 'Extra support payment',
        href: '/receits/mossy-earth-2026-07-01-receipt-1914-4600.pdf',
    },
    {
        id: 'mossy-earth-2026-06-05',
        title: 'Receipt #2075-3645',
        amount: 'EUR 12.00',
        date: 'Jun 5, 2026',
        description: 'Membership support payment',
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

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95'
const secondaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-neutral-100'

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
    const canJoin = isValidInvite || isMember
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
        { label: 'Supporters', value: formatNumber(memberCount, params.locale) },
        { label: 'Tasks completed', value: formatNumber(totalPoints, params.locale) },
        { label: 'Estimated support', value: formatFunding(company, totalPoints, params.locale) },
    ]
    const steps = [
        { art: JoinArt, title: 'Join', body: 'Connect your account. No invite or donation needed.' },
        { art: InstallArt, title: 'Install', body: 'Get the desktop app, log in, and leave it running.' },
        { art: RunArt, title: 'Let it run', body: 'Spare bandwidth funds the work. It backs off when you need it.' },
    ]

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

            <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur-md" aria-label="IdleForest support page">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="#top" aria-label="IdleForest support page top">
                        <Image src={mossyEarthAssets.idleForestLogo} alt="IdleForest" width={121} height={33} priority className="h-auto w-[110px]" />
                    </a>
                    {canJoin ? (
                        <Link href={joinHref} className={`${primaryButton} !px-5 !py-2.5`}>
                            {primaryCta}
                            <Leaf className="h-4 w-4" aria-hidden />
                        </Link>
                    ) : null}
                </div>
            </header>

            <main id="top" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
                {/* Hero */}
                <section className="relative pb-2" id="hero">
                    <div className="relative h-[380px] overflow-hidden rounded-3xl bg-brand-navy sm:h-[480px]">
                        <video className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline preload="metadata" aria-label="Underwater habitat video">
                            <source src={mossyEarthAssets.heroVideo} type="video/mp4" />
                        </video>
                        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" aria-hidden />

                        <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/95 py-2 pl-4 pr-3 shadow-sm backdrop-blur sm:left-6 sm:top-6">
                            <Image src={mossyEarthAssets.idleForestLogo} alt="IdleForest" width={121} height={33} className="h-auto w-[88px]" />
                            <span className="text-sm font-bold text-neutral-400" aria-hidden>&times;</span>
                            <Image src={mossyEarthAssets.logo} alt="Mossy Earth" width={28} height={28} className="h-7 w-7 rounded-full" />
                        </div>

                        <div className="absolute right-4 top-4 flex flex-col items-end gap-2 sm:right-6 sm:top-6">
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold shadow-sm backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                                {impactStats[0].value} supporters
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3.5 py-1.5 text-sm font-bold shadow-sm">
                                {impactStats[2].value} funded
                            </span>
                        </div>
                    </div>

                    <div className="relative z-10 -mt-16 grid gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:mx-8 sm:p-8 lg:-mt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10">
                        <div>
                            <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                                Support Mossy Earth{' '}
                                <span className="bg-[linear-gradient(transparent_62%,#E0F146_62%)]">for free.</span>
                            </h1>
                            <p className="mt-3 max-w-lg text-lg leading-7 text-neutral-600">
                                Install IdleForest once. Your spare bandwidth funds rewilding while you work.
                            </p>
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-3">
                                {canJoin ? (
                                    <Link href={joinHref} className={primaryButton}>
                                        {primaryCta}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                ) : null}
                                <a href={website.url} target="_blank" rel="noreferrer" className={secondaryButton}>
                                    Visit Mossy Earth
                                    <ExternalLink className="h-4 w-4" aria-hidden />
                                </a>
                            </div>
                            <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
                                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                Run by IdleForest, separate from Mossy Earth&apos;s own membership.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <dl className="grid gap-3 sm:grid-cols-3" aria-label="IdleForest support impact">
                    {impactStats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <dd className="text-3xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                            <dt className="mt-1 text-sm text-neutral-500">{stat.label}</dt>
                        </div>
                    ))}
                </dl>

                {/* Story */}
                <section className="grid gap-4 md:grid-cols-2" id="story">
                    <article className="overflow-hidden rounded-3xl border border-neutral-200 bg-white">
                        <div className="relative aspect-[16/10] bg-neutral-100">
                            <Image
                                src={mossyEarthAssets.portrait}
                                alt="A smiling restoration worker planting a young seedling"
                                fill
                                sizes="(min-width: 768px) 560px, 100vw"
                                className="object-cover object-[center_30%]"
                            />
                        </div>
                        <div className="p-6">
                            <h2 className="text-xl font-extrabold tracking-tight">The work</h2>
                            <p className="mt-2 text-neutral-600">
                                Mossy Earth restores nature in Scotland, Portugal, Ecuador and Indonesia, funded mainly by paid memberships and published openly.
                            </p>
                            <a href={`${website.url}projects`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                                See their projects
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </a>
                        </div>
                    </article>

                    <article className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6">
                        <h2 className="text-xl font-extrabold tracking-tight">The tool</h2>
                        <p className="mt-2 text-neutral-600">Your spare bandwidth runs small public data tasks.</p>
                        <ul className="mt-5 space-y-3">
                            {[
                                'No personal data or browsing history',
                                'Companies pay for the public data',
                                'This forest’s revenue goes to Mossy Earth',
                                'About $2-$5 a month per active desktop',
                            ].map((fact) => (
                                <li key={fact} className="flex items-start gap-3">
                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E4F0EA] text-[#347D67]">
                                        <Check className="h-3.5 w-3.5" aria-hidden />
                                    </span>
                                    <span className="font-medium">{fact}</span>
                                </li>
                            ))}
                        </ul>
                        <Link href={`/${params.locale}/how-it-works`} className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                            How IdleForest works
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    </article>
                </section>

                {/* Where the support goes */}
                <section aria-labelledby="focus-heading">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <h2 id="focus-heading" className="text-xl font-extrabold tracking-tight">Where the support goes</h2>
                        <p className="text-sm text-neutral-500">Scotland &middot; Portugal &middot; Ecuador &middot; Indonesia</p>
                    </div>
                    <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {mossyEarthFocus.map(({ art: Art, title }) => (
                            <li key={title} className="flex flex-col items-start gap-4 rounded-3xl border border-neutral-200 bg-white p-5">
                                <Art className="h-20 w-20 sm:h-24 sm:w-24" />
                                <span className="text-base font-extrabold leading-tight tracking-tight">{title}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* How it works */}
                <section className="overflow-hidden rounded-3xl bg-[#16382D] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="how-heading">
                    <h2 id="how-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Three steps. Then it runs itself.</h2>
                    <div className="mx-auto mt-8 max-w-4xl rounded-2xl bg-white p-3 sm:p-5">
                        <IdleBandwidthArt className="h-auto w-full" />
                    </div>
                    <ol className="mx-auto mt-8 grid max-w-4xl gap-3 sm:grid-cols-3">
                        {steps.map((step) => (
                            <li key={step.title} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                                <step.art className="h-24 w-24" />
                                <p className="mt-4 text-lg font-extrabold">{step.title}</p>
                                <p className="mt-1 text-sm text-white/75">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Receipts */}
                <section id="receipts" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="receipts-heading">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <h2 id="receipts-heading" className="text-xl font-extrabold tracking-tight">Every payment, on the record</h2>
                            <p className="mt-1 text-sm text-neutral-600">Receipts for IdleForest support paid to Mossy Earth.</p>
                        </div>
                    </div>
                    <div className="mt-5 divide-y divide-neutral-200 overflow-hidden rounded-2xl border border-neutral-200">
                        {mossyEarthReceipts.map((receipt) => (
                            <a key={receipt.id} href={receipt.href} target="_blank" rel="noreferrer" className="flex items-center gap-4 px-4 py-3.5 transition-colors hover:bg-neutral-50">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-yellow">
                                    <FileText className="h-5 w-5" aria-hidden />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="block font-bold leading-tight">{receipt.title}</span>
                                    <span className="block text-sm text-neutral-500">{receipt.description}</span>
                                </span>
                                <span className="text-right">
                                    <span className="block font-bold tabular-nums">{receipt.amount}</span>
                                    <span className="block text-sm text-neutral-500">{receipt.date}</span>
                                </span>
                                <ExternalLink className="hidden h-4 w-4 shrink-0 text-neutral-400 sm:block" aria-hidden />
                            </a>
                        ))}
                    </div>
                </section>

                {/* FAQ */}
                <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="faq-heading">
                    <h2 id="faq-heading" className="text-xl font-extrabold tracking-tight">Good to know</h2>
                    <div className="mt-4 divide-y divide-neutral-200">
                        {mossyEarthFaqs.map((faq) => (
                            <article key={faq.question} className="py-4 first:pt-0 last:pb-0">
                                <h3 className="font-bold">{faq.question}</h3>
                                <p className="mt-1 text-neutral-600">{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="rounded-3xl bg-brand-navy px-6 py-12 text-center text-white sm:py-16">
                    <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Your laptop can help while it rests.</h2>
                    {canJoin ? (
                        <Link href={joinHref} className={`${primaryButton} mt-7`}>
                            Install IdleForest for free
                            <ArrowRight className="h-4 w-4" aria-hidden />
                        </Link>
                    ) : null}
                </section>
            </main>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
