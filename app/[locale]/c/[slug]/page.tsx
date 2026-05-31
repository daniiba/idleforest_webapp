import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { aggregateProjects, plantingsData } from '@/lib/plantings'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    CheckCircle,
    ExternalLink,
    Heart,
    Leaf,
    MapPin,
    Play,
    Recycle,
    ReceiptText,
    ShieldCheck,
    TreePine,
    Users,
    Waves,
    ZapOff,
} from 'lucide-react'
import Navigation from '@/components/navigation'
import CompanySettingsPanel from './CompanySettingsPanel'
import PhoneRepairGrowingTrees from '@/components/partner/PhoneRepairGrowingTree'
import { getTranslations } from 'next-intl/server'
import {
    SILVEIRA_COMPANY_SLUG,
    WASTEFREE_COMPANY_SLUG,
    getCanonicalCompanySlug,
    getCompanySlugLookupCandidates,
    isSilveiraCompanyIdentity,
    isSilveiraCompanySlug,
    isWastefreeCompanyIdentity,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'
import { getCompanyGeneratedPointStats } from '@/lib/company-node-points'

export const dynamic = 'force-dynamic'

const numberFormatter = new Intl.NumberFormat('en-US')
const emptyCompanyId = '00000000-0000-0000-0000-000000000000'

const phoneRepairProjectNameKeys: Record<string, string> = {
    'tn-plant-to-stop-poverty': 'plantToStopPoverty',
    'tftf-kisumu7-awach': 'kisumu',
    'tn-syzygium': 'mkussu',
}

const silveiraImages = {
    logo: '/partner/silveira/logo.svg',
    hero: '/partner/silveira/intro.webp',
    heroVideo: '/partner/silveira/hero-video.mp4',
    future: '/partner/silveira/meet-the-future.jpg',
    journeyOne: '/partner/silveira/journey-1.jpg',
    journeyThree: '/partner/silveira/journey-3.jpg',
    journeyFive: '/partner/silveira/journey-5.jpg',
    grid: '/partner/silveira/grid-1.jpg',
    footer: '/partner/silveira/footer-bg.jpg',
}

const wastefreeImages = {
    logo: '/partner/wastefree/wfp-logo-white.webp',
    plasticBankCollection: '/partner/wastefree/plastic-bank-collection.webp',
    plasticBankWeighing: '/partner/wastefree/plastic-bank-weighing.jpg',
}

function formatNumber(value: number, locale?: string) {
    return locale ? new Intl.NumberFormat(locale).format(value) : numberFormatter.format(value)
}

function formatCurrencyCents(value: number, locale?: string) {
    return new Intl.NumberFormat(locale || 'en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value / 100)
}

function getEstimatedCompanyFundingCents(company: any, totalPoints: number) {
    const payoutRate = company?.payout_rate_cents_per_1000_points ?? 55

    return Math.floor((Math.max(0, totalPoints) / 1000) * payoutRate)
}

function getYouTubeEmbedUrl(url: string) {
    if (url.includes('youtu.be/')) {
        return url.replace('youtu.be/', 'youtube.com/embed/')
    }

    return url.replace('watch?v=', 'embed/')
}

function getCompanyWebsiteLink(website: string | null | undefined) {
    if (!website) return null

    try {
        const url = new URL(website.match(/^https?:\/\//i) ? website : `https://${website}`)
        if (url.protocol !== 'https:' && url.protocol !== 'http:') return null
        url.hash = ''

        return {
            url: url.toString(),
            hostname: url.hostname.replace(/^www\./, ''),
        }
    } catch {
        return null
    }
}

function isPhoneRepairCompany(company: any, website: ReturnType<typeof getCompanyWebsiteLink>) {
    const values = [company.name, company.slug, website?.hostname, company.website].filter(Boolean).map((value) =>
        String(value)
            .toLowerCase()
            .replace(/[^a-z0-9]/g, ''),
    )

    return values.some((value) => value.includes('phonerepair'))
}

function getSilveiraTechFallbackCompany() {
    return {
        id: emptyCompanyId,
        name: 'Silveira Tech',
        slug: SILVEIRA_COMPANY_SLUG,
        website: 'https://silveiratech.pt/',
        description: 'Silveira Tech is rebuilding mountain villages in central Portugal and regenerating 230 hectares through community, technology, and ecological restoration.',
        theme_color: '#52734d',
        logo_url: silveiraImages.logo,
        video_url: null,
        is_invite_only: false,
        invite_code: null,
        user_id: null,
    }
}

function getWastefreePlanetFallbackCompany() {
    return {
        id: emptyCompanyId,
        name: 'Waste Free Planet',
        slug: WASTEFREE_COMPANY_SLUG,
        website: 'https://www.wastefreeplanet.org/',
        description:
            "Waste Free Planet makes sustainability practical with waste-reduction education, a workbook, and everyday guides. IdleForest support from this company forest funds plastic removal in Waste Free Planet's name through 1ClickImpact and Plastic Bank.",
        theme_color: '#67d7d1',
        logo_url: null,
        video_url: null,
        is_invite_only: false,
        invite_code: null,
        user_id: null,
        impact_mode: 'company_named_donation',
        payout_recipient_name: 'Waste Free Planet',
        payout_recipient_url: 'https://www.wastefreeplanet.org/',
        payout_notes: "Donate generated company forest funds through 1ClickImpact clean-ocean projects with Plastic Bank in Waste Free Planet's name.",
    }
}

function PhoneRepairEyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`font-mono text-[0.64rem] font-black uppercase tracking-[0.28em] text-[#050505] ${className}`}>{children}</p>
}

function PhoneRepairMark({ company, compact = false }: { company: any; compact?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} phone-repair-mark-logo`} role="img" aria-label={company.name} />
            <span className="text-[0.72rem] font-black uppercase tracking-normal text-[#050505]">{company.name}</span>
        </div>
    )
}

function PhoneRepairWireframePanel({
    joinHref,
    companyWebsite,
    isMember,
    isValidInvite,
    copy,
}: {
    joinHref: string
    companyWebsite: ReturnType<typeof getCompanyWebsiteLink>
    isMember: boolean
    isValidInvite: boolean
    copy: {
        eyebrow: string
        title: string
        description: string
        portalCta: string
        installCta: string
        inviteRequired: string
        bookRepair: string
    }
}) {
    return (
        <div className="phone-line-panel phone-line-hero-panel relative z-20 min-h-[500px] overflow-hidden rounded-[42px] border border-[#e5e5dc] bg-[#fafaf6] p-4 sm:min-h-[620px] sm:p-10 lg:h-[min(720px,calc(100vh-150px))] lg:min-h-0">
            <div className="absolute inset-0 overflow-hidden rounded-[42px]">
                <div className="phone-line-stage" aria-hidden>
                    <div className="phone-line-macbook">
                        <div className="phone-line-macbook-screen">
                            <div className="phone-line-macbook-toolbar">
                                <span />
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                            <span className="phone-line-macbook-notch" />
                            <div className="phone-line-device-brand-row">
                                <span className="phone-line-device-logo phone-line-device-logo-idle" />
                                <span className="phone-line-device-connector">x</span>
                                <span className="phone-line-device-logo phone-line-device-logo-repair" />
                            </div>
                            <div className="phone-line-macbook-dock">
                                {Array.from({ length: 11 }).map((_, index) => (
                                    <span key={index} />
                                ))}
                            </div>
                            <div className="phone-line-macbook-apps">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                        <span className="phone-line-macbook-base" />
                    </div>
                    <div className="phone-line-device">
                        <span className="phone-line-side phone-line-side-left" />
                        <span className="phone-line-side phone-line-side-bottom" />
                        <span className="phone-line-button phone-line-button-top" />
                        <span className="phone-line-button phone-line-button-mid" />
                        <span className="phone-line-button phone-line-button-low" />
                        <div className="phone-line-screen">
                            <div className="phone-line-statusbar">
                                <span>9:41</span>
                                <span className="phone-line-status-icons" aria-hidden="true">
                                    <span />
                                    <span />
                                    <span />
                                </span>
                            </div>
                            <div className="phone-line-notch" aria-hidden="true">
                                <span className="phone-line-speaker" />
                                <span className="phone-line-camera" />
                            </div>
                            <div className="phone-line-app-grid">
                                <div className="phone-line-app phone-line-app-primary">
                                    <span className="phone-line-logo-mark" />
                                </div>
                                <div className="phone-line-repair-logo" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-one" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-two" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-three" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-four" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-five" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-six" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-seven" />
                                <div className="phone-line-app phone-line-app-ghost phone-line-app-eight" />
                            </div>
                            <div className="phone-line-dock" aria-hidden="true">
                                <span className="phone-line-dock-icon phone-line-dock-phone" />
                                <span className="phone-line-dock-icon phone-line-dock-browser" />
                                <span className="phone-line-dock-icon phone-line-dock-message" />
                            </div>
                        </div>
                    </div>
                    <div className="phone-line-ipad">
                        <span className="phone-line-ipad-camera" />
                        <div className="phone-line-ipad-screen">
                            <div className="phone-line-ipad-statusbar" aria-hidden="true">
                                <span />
                                <span />
                                <span />
                            </div>
                            <div className="phone-line-device-brand-row phone-line-ipad-brand-row">
                                <span className="phone-line-device-logo phone-line-device-logo-idle" />
                                <span className="phone-line-device-connector">x</span>
                                <span className="phone-line-device-logo phone-line-device-logo-repair" />
                            </div>
                            <div className="phone-line-ipad-dock" aria-hidden="true">
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <span key={index} />
                                ))}
                            </div>
                            <div className="phone-line-ipad-apps">
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,246,0)_62%,rgba(250,250,246,0.9)_100%)]" />
            </div>
            <PhoneRepairGrowingTrees />
            <div className="phone-line-hero-copy relative z-10 flex h-full min-h-[440px] flex-col justify-between gap-8 pr-0 lg:max-w-[430px] lg:pr-4">
                <div className="pt-12 sm:pt-10 lg:pt-10">
                    <PhoneRepairEyebrow className="text-[#6d7416]">{copy.eyebrow}</PhoneRepairEyebrow>
                    <h1 className="mt-5 max-w-[410px] font-candu text-[3rem] font-black uppercase leading-[0.9] tracking-normal text-[#050505] sm:text-[4.25rem] lg:text-[4.15rem]">{copy.title}</h1>
                    <p className="mt-5 max-w-[370px] text-base font-semibold leading-7 text-[#31332b] sm:text-lg sm:leading-8">{copy.description}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {isMember ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {copy.portalCta}
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : isValidInvite ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {copy.installCta}
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : (
                            <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/10 bg-white/90 px-5 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-brand-navy shadow-[0_18px_34px_rgba(11,16,31,0.08)]">
                                {copy.inviteRequired}
                            </span>
                        )}
                        {companyWebsite ? (
                            <a
                                href={companyWebsite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/15 bg-white/90 px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-brand-navy transition-colors hover:border-brand-navy/35"
                            >
                                {copy.bookRepair}
                            </a>
                        ) : null}
                    </div>
                </div>

                <div />
            </div>
        </div>
    )
}

/* Hallmark · genre: editorial · macrostructure: Narrative Workflow · theme: Garden · enrichment: none · nav: N9 · footer: Ft6 · pre-emit critique: P4 H4 E4 S4 R4 V5 */
function WastefreePlanetPage({
    company,
    params,
    invite,
    isMember,
    isValidInvite,
    isOwner,
    memberCount,
    totalPoints,
    companyWebsite,
}: {
    company: any
    params: { slug: string; locale: string }
    invite?: string
    isMember: boolean
    isValidInvite: boolean
    isOwner: boolean
    memberCount: number
    totalPoints: number
    companyWebsite: ReturnType<typeof getCompanyWebsiteLink>
}) {
    const joinHref = isMember ? `/${params.locale}/welcome/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const fundingRaised = formatCurrencyCents(getEstimatedCompanyFundingCents(company, totalPoints), params.locale)
    const proofRows = [
        { label: 'Members', value: formatNumber(memberCount, params.locale), detail: 'Supporters in this company forest' },
        { label: 'Points generated', value: formatNumber(totalPoints, params.locale), detail: 'Building company forest funding' },
        { label: 'Estimated funding', value: fundingRaised, detail: 'Available for clean-ocean support' },
    ]
    const wastefreeFacts = [
        ['91%', "of plastic isn't recycled", 'Reducing and reusing matter before anything reaches the bin.'],
        ['11M', 'metric tons enter oceans yearly', 'Clean-ocean projects help intercept plastic before it reaches the water.'],
        ['40%', 'of U.S. food is wasted', 'Waste Free Planet covers wider household waste habits, from food waste to composting.'],
    ]
    const routeStages = [
        {
            number: '1.0',
            title: 'Reduce first.',
            body:
                'Waste Free Planet helps people cut waste at the source with practical home guides, a workbook, and everyday sustainability education.',
            proofTitle: 'Waste Free Planet',
            proof: 'Start with habits: reduce, reuse, compost, and choose better swaps before relying on recycling.',
        },
        {
            number: '2.0',
            title: 'Let idle time help.',
            body:
                'Supporters join this company forest and install IdleForest. Eligible idle desktop activity earns points in the background.',
            proofTitle: 'IdleForest',
            proof: 'Member activity, generated points, and estimated funding stay visible on this page.',
        },
        {
            number: '3.0',
            title: 'Support clean-ocean work.',
            body:
                'Company-forest funds can be directed through 1ClickImpact toward Plastic Bank clean-ocean projects in Waste Free Planet’s name.',
            proofTitle: '1ClickImpact',
            proof: '1ClickImpact connects business donations with environmental projects and keeps the giving record clear.',
        },
        {
            number: '4.0',
            title: 'Share updates.',
            body:
                'As donations are made, this page can add receipts and impact updates so supporters can see what their activity helped fund.',
            proofTitle: 'Plastic Bank',
            proof: 'Plastic Bank works with collection communities that recover plastic and receive local benefits.',
        },
    ]
    const cleanupProjects = [
        ['Bali, Indonesia', 'Plastic Bank Indonesia', '806 collection communities with health, life insurance, and grocery support.'],
        ['Manila, Philippines', 'Plastic Bank Philippines', '692 communities with grocery vouchers, Red Cross insurance, and consistent plastic collection.'],
        ['Rayong, Thailand', 'Plastic Bank Thailand', 'Coastal collection networks intercept ocean-bound plastics and create local income.'],
        ['Cairo, Egypt', 'Plastic Bank Egypt', '314 collection members and more than 20M kg of plastic gathered.'],
        ['Rio de Janeiro, Brazil', 'Plastic Bank Brazil', 'Coastal plastic interception with collector income, health benefits, and insurance.'],
    ]

    return (
        <div className="wfp-shell">
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <header className="wfp-nav">
                <div className="wfp-nav__inner">
                    <a href="#top" className="wfp-wordmark" aria-label={`${company.name} company forest`}>
                        <span>{company.name}</span>
                    </a>
                    {isValidInvite || isMember ? (
                        <Link href={joinHref} className="wfp-button">
                            {isMember ? 'Open portal' : 'Join WFP'}
                            <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                        </Link>
                    ) : null}
                </div>
            </header>

            <main id="top">
                <section className="wfp-section wfp-hero">
                    <div className="wfp-hero__grid">
                        <div>
                            <p className="wfp-kicker">IdleForest x Waste Free Planet</p>
                            <h1 className="wfp-display">Less waste at home. Less plastic at sea.</h1>
                            <p className="wfp-lede">
                                Join the Waste Free Planet company forest. Eligible idle desktop activity helps build funding for clean-ocean support through 1ClickImpact and Plastic Bank.
                            </p>
                            <div className="wfp-actions">
                                {isMember ? (
                                    <Link href={joinHref} className="wfp-button">
                                        Open portal
                                        <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </Link>
                                ) : isValidInvite ? (
                                    <Link href={joinHref} className="wfp-button">
                                        Join WFP
                                        <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </Link>
                                ) : null}
                                {companyWebsite ? (
                                    <a href={companyWebsite.url} target="_blank" rel="noreferrer" className="wfp-link">
                                        Visit WFP
                                        <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        <div className="wfp-media-stack">
                            <figure className="wfp-photo wfp-photo--portrait">
                                <Image
                                    src={wastefreeImages.plasticBankCollection}
                                    alt="Plastic Bank Indonesia collection members holding recovered plastic on a beach."
                                    width={496}
                                    height={715}
                                    priority
                                    sizes="(min-width: 960px) 34rem, 100vw"
                                />
                                <figcaption>Plastic Bank Indonesia collection members on a coastal cleanup route.</figcaption>
                            </figure>

                            <div className="wfp-logo-card" aria-label="Waste Free Planet logo">
                                <Image src={wastefreeImages.logo} alt="Waste Free Planet logo" width={2500} height={1500} sizes="(min-width: 960px) 18rem, 14rem" />
                            </div>

                            <aside className="wfp-route-card" aria-label="Waste Free Planet funding route">
                                {proofRows.map((row) => (
                                    <div key={row.label} className="wfp-route-card__row">
                                        <b>{row.value}</b>
                                        <span>
                                            {row.label}: {row.detail}
                                        </span>
                                    </div>
                                ))}
                            </aside>
                        </div>
                    </div>
                </section>

                <section className="wfp-section" aria-label="Waste Free Planet impact context">
                    <div className="wfp-stat-strip">
                        {wastefreeFacts.map(([value, label, detail]) => (
                            <article key={label} className="wfp-stat">
                                <strong>{value}</strong>
                                <span>{label}</span>
                                <p>{detail}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section id="wastefree-route" className="wfp-section">
                    <ol className="wfp-stage-list">
                        {routeStages.map((stage) => (
                            <li key={stage.number} className="wfp-stage">
                                <span className="wfp-stage__number">{stage.number}</span>
                                <div>
                                    <h2>{stage.title}</h2>
                                    <p>{stage.body}</p>
                                </div>
                                <aside className="wfp-proof-panel">
                                    <h3>{stage.proofTitle}</h3>
                                    <p>{stage.proof}</p>
                                </aside>
                            </li>
                        ))}
                    </ol>
                </section>

                <section id="wastefree-proof" className="wfp-dark-band">
                    <div className="wfp-section wfp-dark-layout">
                        <div>
                            <h2 className="wfp-section-title">Where clean-ocean support can go.</h2>
                            <p className="wfp-section-copy">
                                Waste Free Planet support can be directed through 1ClickImpact to Plastic Bank projects that collect ocean-bound plastic and support local collection communities.
                            </p>
                            <div className="wfp-cleanup-grid">
                                {cleanupProjects.map(([location, label, detail]) => (
                                    <article key={location} className="wfp-cleanup-card">
                                        <h3>{location}</h3>
                                        <p>
                                            <strong>{label}</strong>
                                        </p>
                                        <p>{detail}</p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <figure className="wfp-photo wfp-photo--landscape">
                            <Image
                                src={wastefreeImages.plasticBankWeighing}
                                alt="A Plastic Bank Indonesia collection member weighing recovered plastic beside stacked collection bags."
                                width={1200}
                                height={630}
                                sizes="(min-width: 960px) 29rem, 100vw"
                            />
                            <figcaption>Recovered plastic is weighed and recorded before moving through Plastic Bank collection systems.</figcaption>
                        </figure>
                    </div>
                </section>

                <section className="wfp-section wfp-join">
                    <div className="wfp-join__panel">
                        <div>
                            <h2 className="wfp-section-title">Clear updates, no guesswork.</h2>
                            <p className="wfp-section-copy">
                                When donations are recorded, this page can add receipts and impact updates. Until then, the live numbers show members, points, and estimated funding.
                            </p>
                        </div>
                        <div className="wfp-proof-cluster">
                            <div className="wfp-proof-panel">
                                <ReceiptText className="h-6 w-6" strokeWidth={2.5} aria-hidden />
                                <h3>Separate funding</h3>
                                <p>Company forest funding for this page is tracked separately from IdleForest&apos;s tree-planting lane.</p>
                            </div>
                            <div className="wfp-proof-panel">
                                <ShieldCheck className="h-6 w-6" strokeWidth={2.5} aria-hidden />
                                <h3>Donation records</h3>
                                <p>Receipts and impact totals can be added after clean-ocean donations are made.</p>
                            </div>
                            <div className="wfp-proof-panel">
                                <ZapOff className="h-6 w-6" strokeWidth={2.5} aria-hidden />
                                <h3>Easy support</h3>
                                <p>Supporters install IdleForest once; eligible idle activity can help grow the fund.</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="wastefree-join" className="wfp-section wfp-join">
                    <div className="wfp-join__panel">
                        <div>
                            <h2 className="wfp-section-title">Join the Waste Free Planet forest.</h2>
                            <p className="wfp-section-copy">
                                Connect your account, install the desktop app, and support Waste Free Planet&apos;s clean-ocean fund through eligible idle activity.
                            </p>
                        </div>
                        <div className="wfp-actions">
                            {isMember ? (
                                <Link href={joinHref} className="wfp-button">
                                    Open portal
                                    <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                </Link>
                            ) : isValidInvite ? (
                                <Link href={joinHref} className="wfp-button">
                                    Join WFP
                                    <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                </Link>
                            ) : null}
                            <a href="https://1clickimpact.com/business/clean-ocean" target="_blank" rel="noreferrer" className="wfp-link">
                                1ClickImpact oceans
                                <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={3} />
                            </a>
                        </div>
                    </div>
                </section>
            </main>

            <footer className="wfp-footer">
                <p className="wfp-footer__close">
                    Yours in fewer throwaway habits,
                    <br />
                    Waste Free Planet and IdleForest.
                </p>
                <div className="wfp-footer__meta">
                    <span>Clean-ocean support</span>
                    <span>Company forest funding</span>
                    {companyWebsite ? (
                        <a href={companyWebsite.url} target="_blank" rel="noreferrer" className="wfp-link">
                            Waste Free Planet
                        </a>
                    ) : null}
                </div>
            </footer>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}

function SilveiraPartnerPage({
    company,
    params,
    invite,
    isMember,
    isValidInvite,
    isOwner,
    memberCount,
    totalPoints,
    companyWebsite,
}: {
    company: any
    params: { slug: string; locale: string }
    invite?: string
    isMember: boolean
    isValidInvite: boolean
    isOwner: boolean
    memberCount: number
    totalPoints: number
    companyWebsite: ReturnType<typeof getCompanyWebsiteLink>
}) {
    const joinHref = isMember ? `/${params.locale}/welcome/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const primaryCta = isMember ? 'Open portal' : 'Join the forest'
    const fundingRaised = formatCurrencyCents(getEstimatedCompanyFundingCents(company, totalPoints), params.locale)
    const stats = [
        { value: '230', label: 'hectares in regeneration', detail: 'Mountain land in central Portugal' },
        { value: fundingRaised, label: 'raised so far', detail: 'Partner funding tracked for Silveira projects' },
        { value: '100%', label: 'directed to Silveira Tech', detail: 'Reserved for this company forest' },
    ]
    const pillars = [
        {
            number: '01',
            label: 'Village regeneration',
            body: 'Rebuilding abandoned schist villages in the mountains of central Portugal.',
        },
        {
            number: '02',
            label: 'Ecological restoration',
            body: 'Growing native forests, restoring biodiversity, and designing with water and terrain.',
        },
        {
            number: '03',
            label: 'Tech for good',
            body: 'Using data, AI, and smart tools to accelerate regeneration instead of replacing nature.',
        },
    ]
    const proofMetrics = [
        { label: 'Members', value: formatNumber(memberCount, params.locale), kicker: 'Company forest' },
        { label: 'Points generated', value: formatNumber(totalPoints, params.locale), kicker: 'Since joining' },
        { label: 'Project funding', value: fundingRaised, kicker: 'Reserved lane' },
    ]
    const fundedProjects = [
        {
            title: 'Native forest recovery',
            label: 'Reforestation',
            image: silveiraImages.future,
            body: 'Funds support Silveira Tech work on native planting, land restoration, and long-term ecological care across the mountain property.',
        },
        {
            title: 'Village regeneration',
            label: 'Built heritage',
            image: silveiraImages.journeyFive,
            body: 'Contributions help the project turn abandoned village infrastructure into a living base for community, learning, and regeneration.',
        },
        {
            title: 'Water and biodiversity',
            label: 'Landscape systems',
            image: silveiraImages.grid,
            body: 'Support is directed toward practical land systems that improve resilience, habitat, and the conditions for native life to return.',
        },
    ]
    const journey = [
        ['The dream begins', 'A mountain site with old stone paths, abandoned structures, and room for a different future.', silveiraImages.journeyOne],
        ['Regenerative masterplan', 'Ecology, architecture, water, and community are designed as one operating system.', silveiraImages.journeyThree],
        ['Village in progress', 'Hands-on restoration turns the plan into shared infrastructure for people and land.', silveiraImages.journeyFive],
    ]
    const workdaySteps = [
        {
            step: '01',
            title: 'Join through this page',
            body: 'Supporters connect their IdleForest account to the Silveira company forest. No invite or donation is required.',
        },
        {
            step: '02',
            title: 'Install the desktop app',
            body: 'IdleForest works through the desktop app. Install it, log in, and leave it running quietly in the background.',
        },
        {
            step: '03',
            title: 'Share idle bandwidth',
            body: 'When your computer is idle, the app can use unused internet bandwidth to generate funding. It backs off when your connection or device needs priority.',
        },
    ]

    return (
        <div className="min-h-screen overflow-x-hidden bg-[#f7f4ec] text-[#172116] selection:bg-[#f0c75a] selection:text-[#172116]">
            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <header className="fixed inset-x-0 top-0 z-40 px-3 py-3 sm:px-6">
                <div className="silveira-reveal mx-auto flex max-w-[1180px] items-center justify-between gap-3 rounded-lg border border-white/55 bg-[#172116]/72 px-3 py-3 text-white shadow-[0_22px_80px_rgba(23,33,22,0.22)] backdrop-blur-xl sm:px-4">
                    <a href="#top" className="flex min-w-0 items-center gap-3">
                        <span className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white">
                            <Image src={silveiraImages.logo} alt="" fill sizes="40px" className="object-contain p-1.5" />
                        </span>
                        <span className="truncate text-sm font-black">{company.name}</span>
                    </a>
                    <nav className="hidden items-center gap-5 text-sm font-bold text-white/72 md:flex">
                        <a href="#silveira-story" className="transition hover:text-white">
                            Story
                        </a>
                        <a href="#silveira-impact" className="transition hover:text-white">
                            Impact
                        </a>
                        <a href="#silveira-join" className="transition hover:text-white">
                            Join
                        </a>
                    </nav>
                    {isValidInvite || isMember ? (
                        <Link
                            href={joinHref}
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full bg-[#f0c75a] px-4 py-2 text-sm font-black text-[#172116] transition hover:bg-white"
                        >
                            {primaryCta}
                            <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                        </Link>
                    ) : null}
                </div>
            </header>

            <main id="top">
                <section className="relative overflow-hidden bg-[#172116] text-white">
                    <video
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={silveiraImages.hero}
                        aria-label="Silveira Tech village landscape"
                    >
                        <source src={silveiraImages.heroVideo} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(23,33,22,0.93)_0%,rgba(23,33,22,0.78)_42%,rgba(23,33,22,0.32)_100%)]" />
                    <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,rgba(247,244,236,0)_0%,#f7f4ec_100%)]" />

                    <div className="relative z-10 mx-auto grid min-h-[86vh] max-w-[1180px] items-end gap-8 px-4 pb-12 pt-24 sm:px-6 sm:pt-28 lg:grid-cols-[1.18fr_0.72fr] lg:pb-12 lg:pt-28">
                        <div className="max-w-[760px]">
                            <div className="silveira-reveal silveira-delay-1 inline-flex rounded-full border border-white/22 bg-white/12 px-3 py-2 text-xs font-black text-white/82 backdrop-blur">
                                IdleForest x Silveira Tech
                            </div>
                            <h1 className="silveira-reveal silveira-delay-2 mt-6 text-[3.2rem] font-black leading-[0.92] text-white sm:text-[4.8rem] lg:text-[4.85rem]">
                                Support Silveira Tech for free.
                            </h1>
                            <p className="silveira-reveal silveira-delay-3 mt-6 max-w-[650px] text-lg font-medium leading-8 text-white/80 sm:text-xl sm:leading-9">
                                Silveira Tech is rebuilding mountain villages in Serra da Lousa and regenerating 230 hectares of land. Join their company forest, install the IdleForest desktop app,
                                and your unused bandwidth can help fund their regeneration projects.
                            </p>
                            <div className="silveira-reveal silveira-delay-4 mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                {isMember ? (
                                    <Link
                                        href={joinHref}
                                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f0c75a] px-6 py-3 text-sm font-black text-[#172116] shadow-[0_18px_50px_rgba(240,199,90,0.24)] transition hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        Open your portal
                                        <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </Link>
                                ) : isValidInvite ? (
                                    <Link
                                        href={joinHref}
                                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-[#f0c75a] px-6 py-3 text-sm font-black text-[#172116] shadow-[0_18px_50px_rgba(240,199,90,0.24)] transition hover:-translate-y-0.5 hover:bg-white"
                                    >
                                        Join Silveira forest
                                        <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </Link>
                                ) : (
                                    <span className="inline-flex min-h-12 items-center justify-center rounded-lg border border-white/25 bg-white/12 px-5 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-white backdrop-blur">
                                        Join the forest
                                    </span>
                                )}
                                {companyWebsite ? (
                                    <a
                                        href={companyWebsite.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/28 px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
                                    >
                                        Visit Silveira Tech
                                        <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={3} />
                                    </a>
                                ) : null}
                            </div>
                        </div>

                        <div className="silveira-card silveira-delay-3 rounded-lg border border-white/20 bg-white/12 p-3 shadow-[0_30px_100px_rgba(0,0,0,0.25)] backdrop-blur-xl">
                            <div className="silveira-media relative aspect-[4/5] min-h-[420px] overflow-hidden rounded-lg bg-[#4d6f45]">
                                <Image src={silveiraImages.hero} alt="Silveira Tech mountain village" fill priority sizes="(min-width: 1024px) 420px, 100vw" className="object-cover" />
                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,33,22,0)_35%,rgba(23,33,22,0.82)_100%)]" />
                                <div className="absolute left-4 right-4 top-4 flex items-center justify-between gap-3 rounded-lg border border-white/20 bg-[#172116]/58 px-4 py-3 backdrop-blur">
                                    <span className="text-sm font-black">Live company forest</span>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#d7e7df] px-3 py-1 text-xs font-black text-[#172116]">
                                        <span className="h-2 w-2 rounded-full bg-[#4d6f45]" />
                                        Active
                                    </span>
                                </div>
                                <div className="absolute inset-x-4 bottom-4 grid gap-2">
                                    {stats.map((stat, index) => (
                                        <div key={stat.label} className={`silveira-card silveira-delay-${index + 3} rounded-lg border border-white/16 bg-white/14 p-4 backdrop-blur`}>
                                            <p className="text-4xl font-black leading-none text-[#f0c75a]">{stat.value}</p>
                                            <p className="mt-1 text-sm font-black text-white">{stat.label}</p>
                                            <p className="mt-1 text-xs font-medium leading-5 text-white/68">{stat.detail}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="silveira-story" className="bg-[#f7f4ec] py-14 sm:py-20">
                    <div className="mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
                        <div className="silveira-media silveira-scroll-card relative min-h-[560px] overflow-hidden rounded-lg bg-[#4d6f45] shadow-[0_28px_80px_rgba(23,33,22,0.16)]">
                            <Image src={silveiraImages.future} alt="Silveira Tech forest and village terrain" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
                            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(23,33,22,0)_42%,rgba(23,33,22,0.74)_100%)]" />
                            <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/18 bg-[#172116]/74 p-5 text-white backdrop-blur">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c75a]">From Silveira to the world</p>
                                <p className="mt-3 text-base font-semibold leading-7 text-white/84">
                                    A living blueprint where regeneration, community, and practical technology grow in the same place.
                                </p>
                            </div>
                        </div>

                        <div className="silveira-scroll grid gap-5">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b86f3e]">The bridge between innovation and regeneration</p>
                                <h2 className="mt-4 max-w-[820px] text-[2.8rem] font-black leading-[0.96] text-[#172116] sm:text-[4.4rem]">
                                    Not a retreat from the modern world. A reimagining of it.
                                </h2>
                                <p className="mt-5 max-w-[720px] text-base font-medium leading-8 text-[#4f5848] sm:text-lg">
                                    Their work brings together scientists, artists, coders, farmers, builders, and dreamers around one practical question: what if technology helped communities and
                                    nature thrive together?
                                </p>
                            </div>
                            <div className="grid gap-4 md:grid-cols-3">
                                {pillars.map((pillar, index) => (
                                    <article key={pillar.label} className={`silveira-scroll-card silveira-hover-lift silveira-delay-${index + 1} rounded-lg border border-[#e5ddcd] bg-white p-5 shadow-sm`}>
                                        <div className="mb-5 flex items-center justify-between border-b border-[#ece4d4] pb-4">
                                            <span className="text-xs font-black uppercase tracking-[0.16em] text-[#4d6f45]">{pillar.number}</span>
                                            <span className="silveira-scroll-line h-2 w-12 rounded-full bg-[#d7e7df]" />
                                        </div>
                                        <h3 className="text-lg font-black leading-tight text-[#172116]">{pillar.label}</h3>
                                        <p className="mt-3 text-sm font-medium leading-6 text-[#606858]">{pillar.body}</p>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14 sm:py-16">
                    <div className="mx-auto grid max-w-[1180px] gap-4 px-4 sm:px-6 lg:grid-cols-4">
                        <div className="silveira-scroll-card rounded-lg bg-[#172116] p-6 text-white lg:col-span-1">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c75a]">Company forest</p>
                            <h2 className="mt-4 text-3xl font-black leading-tight">Real support, visible as a team.</h2>
                            <p className="mt-4 text-sm font-medium leading-6 text-white/70">
                                This page routes Silveira support through one shared company forest, so the collective contribution is easy to understand.
                            </p>
                        </div>
                        {proofMetrics.map((metric, index) => (
                            <article key={metric.label} className={`silveira-scroll-card silveira-hover-lift silveira-delay-${index + 1} rounded-lg border border-[#e7e0d2] bg-[#f7f4ec] p-6`}>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b86f3e]">{metric.kicker}</p>
                                <p className="mt-8 text-sm font-black text-[#606858]">{metric.label}</p>
                                <p className="mt-2 text-4xl font-black leading-none text-[#172116]">{metric.value}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="bg-[#eef3eb] py-14 sm:py-20">
                    <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
                        <div className="silveira-scroll mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                            <div>
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#b86f3e]">Past to present</p>
                                <h2 className="mt-4 max-w-[760px] text-[2.7rem] font-black leading-[0.98] text-[#172116] sm:text-[4.2rem]">
                                    Building the village, step by step.
                                </h2>
                            </div>
                            <p className="max-w-[520px] text-base font-medium leading-7 text-[#4f5848]">
                                The Silveira story moves from land and ruins to masterplanning, basecamp, and a regenerative village in progress.
                            </p>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-3">
                            {journey.map(([label, body, image], index) => (
                                <article key={label} className={`silveira-scroll-card silveira-hover-lift silveira-delay-${index + 1} overflow-hidden rounded-lg border border-[#dce5d8] bg-white shadow-sm`}>
                                    <div className="silveira-media relative aspect-[16/11] overflow-hidden bg-[#4d6f45]">
                                        <Image src={image} alt={label} fill sizes="(min-width: 768px) 25vw, 100vw" className="object-cover" />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b86f3e]">{label}</p>
                                        <p className="mt-3 text-sm font-medium leading-6 text-[#606858]">{body}</p>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section id="silveira-impact" className="bg-[#172116] py-14 text-white sm:py-20">
                    <div className="mx-auto max-w-[1180px] px-4 sm:px-6">
                        <div className="grid gap-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-end">
                            <div className="silveira-scroll">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c75a]">Where support goes</p>
                                <h2 className="mt-4 text-[2.75rem] font-black leading-[0.98] text-white sm:text-[4.4rem]">
                                    Your shared idle bandwidth supports Silveira directly.
                                </h2>
                                <p className="mt-5 text-base font-medium leading-8 text-white/72">
                                    Funds raised through this company forest come from eligible desktop app activity and go to Silveira Tech's own regeneration work, not IdleForest's general planting portfolio.
                                </p>
                            </div>
                            <div className="silveira-scroll-card rounded-lg border border-white/12 bg-white/[0.06] p-5">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c75a]">Dedicated lane</p>
                                <h3 className="mt-4 text-xl font-black leading-tight text-white">Reserved for Silveira Tech projects</h3>
                                <p className="mt-2 text-sm font-medium leading-6 text-white/68">
                                    Impact from this page is reserved for Silveira Tech projects. The total above tracks members and points earned after supporters join; project updates can be followed through Silveira Tech's
                                    transparency and project channels.
                                </p>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-4 lg:grid-cols-3">
                            {fundedProjects.map((project, index) => (
                                <article key={project.title} className={`silveira-scroll-card silveira-hover-lift silveira-delay-${index + 1} overflow-hidden rounded-lg bg-white text-[#172116]`}>
                                    <div className="silveira-media relative aspect-[4/3] overflow-hidden bg-[#4d6f45]">
                                        <Image src={project.image} alt={project.title} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" />
                                    </div>
                                    <div className="p-5">
                                        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#b86f3e]">{project.label}</p>
                                        <h3 className="mt-3 text-xl font-black leading-tight">{project.title}</h3>
                                        <p className="mt-3 text-sm font-medium leading-6 text-[#606858]">{project.body}</p>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {companyWebsite ? (
                            <a
                                href={companyWebsite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="silveira-scroll mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-black text-[#172116] transition hover:-translate-y-0.5 hover:bg-[#f0c75a]"
                            >
                                Visit Silveira Tech
                                <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={3} />
                            </a>
                        ) : null}
                    </div>
                </section>

                <section className="bg-[#f7f4ec] py-14 sm:py-20">
                    <div className="mx-auto grid max-w-[1180px] gap-4 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr]">
                        <div className="silveira-media silveira-scroll-card relative min-h-[520px] overflow-hidden rounded-lg bg-[#172116] text-white">
                            <Image src={silveiraImages.journeyThree} alt="" fill sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover opacity-82" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#172116] via-[#172116]/46 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f0c75a]">Quiet by design</p>
                                <h2 className="mt-5 max-w-[760px] text-[2.75rem] font-black leading-[0.98] sm:text-[4.2rem]">
                                    Install once. Let it run quietly.
                                </h2>
                                <p className="mt-5 max-w-[620px] text-base font-medium leading-8 text-white/78">
                                    The desktop app can share unused bandwidth while your computer is idle, pauses when your connection is needed, and turns eligible activity into funding for Silveira
                                    Tech's local regeneration work.
                                </p>
                            </div>
                        </div>

                        <div className="silveira-scroll-card rounded-lg border border-[#e4dccc] bg-white p-5 shadow-sm sm:p-7 lg:p-8">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4d6f45]">The workday loop</p>
                            <h3 className="mt-3 max-w-[640px] text-3xl font-black leading-tight text-[#172116] sm:text-4xl">
                                Unused bandwidth becomes visible local impact, without asking supporters to change rhythm.
                            </h3>
                            <div className="mt-7 grid gap-3">
                                {workdaySteps.map((item, index) => (
                                    <article key={item.step} className={`silveira-scroll-card silveira-hover-lift silveira-delay-${index + 1} grid gap-4 rounded-lg border border-[#ece4d4] bg-[#f7f4ec] p-5 sm:grid-cols-[3rem_1fr] sm:items-start`}>
                                        <div className="text-sm font-black text-[#4d6f45]">{item.step}</div>
                                        <div>
                                            <h4 className="text-xl font-black text-[#172116]">{item.title}</h4>
                                            <p className="mt-2 max-w-[650px] text-sm font-medium leading-6 text-[#606858]">{item.body}</p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="silveira-join" className="relative overflow-hidden bg-[#e7efe2] py-16 text-[#172116] sm:py-24">
                    <Image src={silveiraImages.footer} alt="" fill sizes="100vw" className="object-cover opacity-18 mix-blend-multiply" />
                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(231,239,226,0.96)_0%,rgba(231,239,226,0.88)_54%,rgba(231,239,226,0.72)_100%)]" />
                    <div className="relative z-10 mx-auto grid max-w-[1180px] gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div className="silveira-scroll">
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4d6f45]">Let's build the company forest</p>
                            <h2 className="mt-4 max-w-[900px] text-[2.85rem] font-black leading-[0.98] text-[#172116] sm:text-[5rem]">
                                Recharging humanity can start on your desktop.
                            </h2>
                            <p className="mt-5 max-w-[680px] text-base font-medium leading-8 text-[#4f5848]">
                                Join {company.name} on IdleForest, install the desktop app, and let eligible idle bandwidth contribute to Silveira Tech's regeneration impact.
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                            {isMember ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172116] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#4d6f45]"
                                >
                                    Open portal
                                    <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172116] px-6 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#4d6f45]"
                                >
                                    Support Silveira
                                    <ArrowRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                </Link>
                            ) : null}
                            {companyWebsite ? (
                                <a
                                    href={companyWebsite.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#172116]/18 bg-white/50 px-6 py-3 text-sm font-black text-[#172116] transition hover:-translate-y-0.5 hover:border-[#172116]/34 hover:bg-white"
                                >
                                    SilveiraTech.pt
                                    <ExternalLink aria-hidden className="h-4 w-4" strokeWidth={3} />
                                </a>
                            ) : null}
                        </div>
                    </div>
                </section>
            </main>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}

export default async function CompanyPortalPage({ params, searchParams }: { params: { slug: string; locale: string }; searchParams: { invite?: string; design?: string; variant?: string } }) {
    const supabase = await createClient()
    const phoneRepairT = await getTranslations({
        locale: params.locale,
        namespace: 'PhoneRepairCompany',
    })

    const canonicalCompanySlug = getCanonicalCompanySlug(params.slug)
    const companySlugCandidates = getCompanySlugLookupCandidates(params.slug)
    const { data: companyRecords, error } = await supabase.from('companies').select('*').in('slug', companySlugCandidates)
    const companyRecord = companyRecords?.find((record) => record.slug === canonicalCompanySlug) ?? companyRecords?.[0] ?? null

    const company =
        companyRecord ??
        (isSilveiraCompanySlug(params.slug) ? getSilveiraTechFallbackCompany() : isWastefreeCompanySlug(params.slug) ? getWastefreePlanetFallbackCompany() : null)

    if ((error && !isSilveiraCompanySlug(params.slug) && !isWastefreeCompanySlug(params.slug)) || !company) {
        return notFound()
    }

    let memberCount = 0
    let totalPoints = 0
    let companyRewardTrees = 0
    let memberUserIds: string[] = []

    try {
        const admin = createAdminClient()
        const companyPointStats = await getCompanyGeneratedPointStats(admin, company.id)
        memberCount = companyPointStats.memberCount
        totalPoints = companyPointStats.generatedPoints
        memberUserIds = companyPointStats.memberUserIds
        const rewardRows = new Map<string, number>()
        const { data: companyDesktopRewards, error: companyDesktopRewardsError } = await admin
            .from('user_rewards')
            .select('id, trees_awarded')
            .eq('reward_type', 'desktop_first_connect')
            .eq('status', 'awarded')
            .eq('company_id', company.id)

        if (!companyDesktopRewardsError && companyDesktopRewards) {
            companyDesktopRewards.forEach((reward) => {
                rewardRows.set(reward.id, reward.trees_awarded || 0)
            })
        }

        if (memberUserIds.length > 0) {
            const { data: memberDesktopRewards, error: memberDesktopRewardsError } = await admin
                .from('user_rewards')
                .select('id, trees_awarded')
                .eq('reward_type', 'desktop_first_connect')
                .eq('status', 'awarded')
                .is('company_id', null)
                .in('user_id', memberUserIds)

            if (!memberDesktopRewardsError && memberDesktopRewards) {
                memberDesktopRewards.forEach((reward) => {
                    rewardRows.set(reward.id, reward.trees_awarded || 0)
                })
            }
        }

        companyRewardTrees = Array.from(rewardRows.values()).reduce((sum, trees) => sum + trees, 0)
    } catch (error) {
        console.error('Unable to load company reward trees', error)
    }

    const { data: donations } = await supabase.from('donations').select('trees_planted').eq('company_id', company.id)

    const donatedTrees = donations?.reduce((sum, donation) => sum + (donation.trees_planted || 0), 0) ?? 0
    const recordedCompanyTrees = donatedTrees + companyRewardTrees
    const earnedTrees = Math.floor(totalPoints / 1000)
    const companyTrees = recordedCompanyTrees > 0 ? recordedCompanyTrees : earnedTrees
    const companyTreesLabel = recordedCompanyTrees > 0 ? phoneRepairT('labels.recordedCompanyTrees') : phoneRepairT('labels.estimatedCompanyTrees')

    const verifiedTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0)
    const plantingProjects = aggregateProjects(plantingsData)
        .filter((project) => project.totalTrees > 0)
        .sort((a, b) => b.totalTrees - a.totalTrees)

    const featuredProjects = plantingProjects
        .filter((project) => project.project.images && project.project.images.length > 0)
        .concat(plantingProjects.filter((project) => !project.project.images || project.project.images.length === 0))
        .slice(0, 3)

    const plantingCountries = Array.from(new Set(plantingProjects.map((project) => project.country?.name ?? project.project.countryCode)))

    const latestPlantingDate = plantingProjects
        .map((project) => project.lastDate)
        .filter(Boolean)
        .sort()
        .slice(-1)[0]

    const {
        data: { user },
    } = await supabase.auth.getUser()
    let isMember = false
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('company_id').eq('user_id', user.id).single()

        if (profile && profile.company_id === company.id) {
            isMember = true
        }
    }

    const { invite } = searchParams
    const isOwner = user ? company.user_id === user.id : false
    const themeColor = company.theme_color || '#10B981'
    const companyWebsite = getCompanyWebsiteLink(company.website)
    const usePhoneRepairPage = isPhoneRepairCompany(company, companyWebsite)
    const useSilveiraTechPage = isSilveiraCompanyIdentity(company, companyWebsite?.hostname)
    const useWastefreePlanetPage = isWastefreeCompanyIdentity(company, companyWebsite?.hostname)
    const isValidInvite = useSilveiraTechPage || useWastefreePlanetPage || !company.is_invite_only || Boolean(invite && invite === company.invite_code) || isMember

    if (usePhoneRepairPage) {
        const joinHref = isMember ? `/${params.locale}/welcome/c/${company.slug}` : `/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`
        const projectRows = featuredProjects.map((planting) => {
            const countryName = planting.country?.name ?? planting.project.countryCode
            const partnerName = planting.partner?.name ?? planting.project.partnerId
            const date = planting.lastDate
                ? new Date(planting.lastDate).toLocaleDateString(params.locale, {
                      month: 'short',
                      year: 'numeric',
                  })
                : phoneRepairT('labels.current')
            const projectNameKey = phoneRepairProjectNameKeys[planting.project.id]

            return {
                id: planting.project.id,
                trees: formatNumber(planting.totalTrees, params.locale),
                name: projectNameKey ? phoneRepairT(`projects.${projectNameKey}`) : planting.project.name,
                meta: `${countryName} - ${partnerName}`,
                date,
                href: planting.project.externalRef || '/report',
                image: planting.project.images?.[0],
            }
        })
        const phoneRepairPledgeItems = [
            {
                number: '01',
                title: phoneRepairT('steps.join.title'),
                body: phoneRepairT('steps.join.body'),
            },
            {
                number: '02',
                title: phoneRepairT('steps.run.title'),
                body: phoneRepairT('steps.run.body'),
            },
            {
                number: '03',
                title: phoneRepairT('steps.plant.title'),
                body: phoneRepairT('steps.plant.body'),
            },
        ]

        return (
            <div className="min-h-screen overflow-x-hidden bg-[#f8f8f5] text-brand-navy selection:bg-brand-yellow selection:text-black">
                {isValidInvite && invite && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                        }}
                    />
                )}

                <header className="px-3 py-3 sm:px-7 sm:py-4">
                    <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-3 rounded-[22px] border border-[#deded8] bg-white/80 px-3 py-3 backdrop-blur sm:gap-4 sm:rounded-[26px] sm:px-6">
                        <PhoneRepairMark company={company} compact />
                        <nav className="hidden items-center gap-6 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#6f6f69] md:flex">
                            <a href="#ascii-flow" className="hover:text-brand-navy">
                                {phoneRepairT('nav.howItWorks')}
                            </a>
                            <a href="#ascii-proof" className="hover:text-brand-navy">
                                {phoneRepairT('nav.proof')}
                            </a>
                            <a href="#ascii-install" className="hover:text-brand-navy">
                                {phoneRepairT('nav.install')}
                            </a>
                        </nav>
                        {isMember ? (
                            <Link
                                href={joinHref}
                                className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {phoneRepairT('cta.portal')}
                            </Link>
                        ) : isValidInvite ? (
                            <Link
                                href={joinHref}
                                className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {phoneRepairT('cta.join')}
                            </Link>
                        ) : null}
                    </div>
                </header>

                <main className="px-3 pb-3 sm:px-7 sm:pb-7">
                    <section className="relative isolate mx-auto max-w-[1540px]">
                        <PhoneRepairWireframePanel
                            joinHref={joinHref}
                            companyWebsite={companyWebsite}
                            isMember={isMember}
                            isValidInvite={isValidInvite}
                            copy={{
                                eyebrow: phoneRepairT('hero.eyebrow'),
                                title: phoneRepairT('hero.title'),
                                description: phoneRepairT('hero.description'),
                                portalCta: phoneRepairT('cta.portal'),
                                installCta: phoneRepairT('cta.installFromInvite'),
                                inviteRequired: phoneRepairT('cta.inviteRequired'),
                                bookRepair: phoneRepairT('cta.bookRepair'),
                            }}
                        />
                    </section>

                    <section id="ascii-flow" className="mx-auto mt-4 grid max-w-[1540px] gap-5 rounded-[34px] bg-[#efefeb] p-5 sm:mt-5 sm:p-7 lg:grid-cols-[0.82fr_1.18fr]">
                        <div className="rounded-[26px] bg-brand-navy p-6 text-white sm:p-8">
                            <PhoneRepairEyebrow className="text-brand-yellow">{phoneRepairT('how.eyebrow')}</PhoneRepairEyebrow>
                            <h2 className="mt-6 max-w-[520px] font-candu text-[3rem] font-black uppercase leading-none tracking-normal text-white sm:text-[4.2rem]">{phoneRepairT('how.title')}</h2>
                            <p className="mt-6 max-w-[520px] text-base font-medium leading-7 text-white/76">{phoneRepairT('how.body')}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {phoneRepairPledgeItems.map((item) => (
                                <div key={item.number} className="rounded-[26px] bg-white p-6">
                                    <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-emerald-700">{item.number}</p>
                                    <h3 className="mt-5 font-candu text-3xl font-black uppercase leading-none tracking-normal text-black">{item.title}</h3>
                                    <p className="mt-5 text-base font-medium leading-7 text-[#62625f]">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section
                        id="ascii-proof"
                        className="mx-auto mt-8 grid max-w-[1540px] gap-8 rounded-[34px] bg-white p-5 shadow-[0_28px_80px_rgba(20,20,16,0.08)] sm:p-7 lg:grid-cols-[0.92fr_1.08fr]"
                    >
                        <div className="rounded-[26px] bg-brand-yellow p-6 text-brand-navy">
                            <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-brand-navy/70">{phoneRepairT('proof.eyebrow')}</p>
                            <p className="mt-4 font-candu text-6xl font-black uppercase leading-none tracking-normal text-brand-navy">{formatNumber(verifiedTrees, params.locale)}</p>
                            <p className="mt-4 max-w-[580px] text-base font-medium leading-7 text-brand-navy/80">
                                {phoneRepairT('proof.body', {
                                    count: plantingCountries.length,
                                })}
                            </p>
                        </div>
                        <div className="grid gap-4">
                            <div className="grid gap-4 md:grid-cols-3">
                                {[
                                    [companyTreesLabel, formatNumber(companyTrees, params.locale)],
                                    [phoneRepairT('labels.members'), formatNumber(memberCount, params.locale)],
                                    [phoneRepairT('labels.points'), formatNumber(totalPoints, params.locale)],
                                ].map(([label, value]) => (
                                    <div key={label} className="rounded-[24px] bg-[#f2f2ef] p-5">
                                        <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#777]">{label}</p>
                                        <p className="mt-4 font-candu text-4xl font-black uppercase leading-none tracking-normal text-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="divide-y divide-[#deded8]">
                                {projectRows.map((record) => (
                                    <a
                                        key={record.id}
                                        href={record.href}
                                        target={record.href.startsWith('http') ? '_blank' : undefined}
                                        rel={record.href.startsWith('http') ? 'noreferrer' : undefined}
                                        className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-start gap-x-4 gap-y-2 py-5 transition-colors hover:text-emerald-700 sm:grid-cols-[82px_80px_1fr_170px_24px] sm:items-center sm:gap-4"
                                    >
                                        <span className="relative col-start-1 row-span-4 block h-24 w-full overflow-hidden rounded-[18px] bg-[#f2f2ef] sm:col-auto sm:row-auto sm:h-16 sm:w-20">
                                            {record.image ? <Image src={record.image} alt={record.name} fill sizes="(max-width: 639px) 96px, 80px" className="object-cover" /> : null}
                                        </span>
                                        <span className="col-start-2 col-span-2 font-mono text-[0.68rem] font-black uppercase text-[#777] sm:col-auto">{record.trees}</span>
                                        <span className="col-start-2 col-span-2 min-w-0 break-words font-candu text-[1.6rem] font-black uppercase leading-[0.94] tracking-normal sm:col-auto sm:text-2xl sm:leading-none">
                                            {record.name}
                                        </span>
                                        <span className="col-start-2 font-mono text-[0.58rem] font-black uppercase tracking-[0.16em] text-[#777] sm:col-auto">{record.date}</span>
                                        <ArrowUpRight aria-hidden className="col-start-3 row-start-1 h-4 w-4 justify-self-end sm:col-auto sm:row-auto sm:justify-self-auto" strokeWidth={3} />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section
                        id="ascii-install"
                        className="mx-auto mt-8 grid max-w-[1540px] gap-6 overflow-hidden rounded-[28px] bg-brand-navy p-5 text-white sm:rounded-[34px] sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12"
                    >
                        <div className="min-w-0">
                            <PhoneRepairEyebrow className="text-brand-yellow">{phoneRepairT('install.eyebrow')}</PhoneRepairEyebrow>
                            <h2 className="mt-6 max-w-full break-words font-candu text-[2.08rem] font-black uppercase leading-[0.96] tracking-normal text-white sm:max-w-[720px] sm:text-[4rem] sm:leading-none">
                                {phoneRepairT('install.title')}
                            </h2>
                            <p className="mt-6 max-w-full text-[0.98rem] font-medium leading-7 text-white/75 sm:max-w-[620px] sm:text-base">{phoneRepairT('install.body')}</p>
                        </div>
                        <div className="flex min-w-0 flex-col items-stretch gap-3 self-center sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                            {isMember ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-brand-navy transition-colors hover:bg-white hover:text-black sm:w-auto"
                                >
                                    {phoneRepairT('cta.portal')}
                                    <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-brand-navy transition-colors hover:bg-white hover:text-black sm:w-auto"
                                >
                                    {phoneRepairT('cta.startInstall')}
                                    <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                                </Link>
                            ) : null}
                            {companyWebsite ? (
                                <a
                                    href={companyWebsite.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-white sm:w-auto"
                                >
                                    {phoneRepairT('cta.bookRepair')}
                                </a>
                            ) : null}
                        </div>
                    </section>
                </main>

                {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
            </div>
        )
    }

    if (useSilveiraTechPage) {
        return (
            <SilveiraPartnerPage
                company={company}
                params={params}
                invite={invite}
                isMember={isMember}
                isValidInvite={Boolean(isValidInvite)}
                isOwner={isOwner}
                memberCount={memberCount}
                totalPoints={totalPoints}
                companyWebsite={companyWebsite}
            />
        )
    }

    if (useWastefreePlanetPage) {
        return (
            <WastefreePlanetPage
                company={company}
                params={params}
                invite={invite}
                isMember={isMember}
                isValidInvite={Boolean(isValidInvite)}
                isOwner={isOwner}
                memberCount={memberCount}
                totalPoints={totalPoints}
                companyWebsite={companyWebsite}
            />
        )
    }

    return (
        <div className="min-h-screen bg-[#F7F8F2] font-sans text-brand-navy selection:bg-brand-yellow selection:text-black">
            <Navigation hideBanner />

            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`,
                    }}
                />
            )}

            <main>
                <section className="relative overflow-hidden border-b border-black/10 bg-white">
                    <div className="absolute inset-x-0 top-0 h-2" style={{ backgroundColor: themeColor }} />
                    <div className="mx-auto grid min-h-[calc(100vh-88px)] max-w-7xl gap-10 px-4 pb-12 pt-24 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-16 lg:pt-28">
                        <div className="flex flex-col justify-center">
                            <div className="mb-8 flex items-center gap-4">
                                {company.logo_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={company.logo_url} alt={company.name} className="h-16 w-16 rounded-lg border border-black/10 bg-white object-cover shadow-sm" />
                                ) : (
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-black/10 bg-brand-yellow">
                                        <TreePine className="h-8 w-8 text-brand-navy" />
                                    </div>
                                )}
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500">Company forest</p>
                                    <p className="text-lg font-extrabold text-brand-navy">{company.name}</p>
                                    {companyWebsite && (
                                        <a
                                            href={companyWebsite.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-1 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-brand-navy"
                                        >
                                            {companyWebsite.hostname}
                                            <ExternalLink className="h-3.5 w-3.5" />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <h1 className="max-w-3xl font-candu text-5xl font-extrabold leading-[0.95] tracking-normal text-brand-navy sm:text-6xl lg:text-7xl">Turn everyday work into real trees.</h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
                                {company.description ||
                                    `${company.name} is using IdleForest to convert idle bandwidth into verified reforestation impact. Join the company forest and help grow the number together.`}
                            </p>

                            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                                {isMember ? (
                                    <Link
                                        href={`/${params.locale}/welcome/c/${company.slug}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-black shadow-sm transition hover:-translate-y-0.5"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Go to portal
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : isValidInvite ? (
                                    <Link
                                        href={`/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`}
                                        className="inline-flex items-center justify-center gap-2 rounded-md px-6 py-3 text-sm font-extrabold uppercase tracking-wide text-black shadow-sm transition hover:-translate-y-0.5"
                                        style={{ backgroundColor: themeColor }}
                                    >
                                        Join {company.name}
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                ) : (
                                    <div className="rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                                        This company forest is invite-only. Open it from your company invite link to join.
                                    </div>
                                )}

                                {isMember && (
                                    <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                        <CheckCircle className="h-4 w-4" />
                                        You are already a member
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-end">
                            <div className="w-full overflow-hidden rounded-lg border border-black/10 bg-brand-navy text-white shadow-xl">
                                <div className="grid gap-px bg-white/10 sm:grid-cols-2">
                                    <div className="bg-brand-navy p-6">
                                        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-brand-yellow text-brand-navy">
                                            <TreePine className="h-6 w-6" />
                                        </div>
                                        <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/55">{companyTreesLabel}</p>
                                        <p className="mt-3 font-candu text-6xl font-extrabold leading-none text-brand-yellow">{formatNumber(companyTrees)}</p>
                                        <p className="mt-3 text-sm leading-6 text-white/70">
                                            {recordedCompanyTrees > 0
                                                ? 'Pulled from company donation history and awarded install bonuses.'
                                                : 'Estimated from team points until company donation records are available.'}
                                        </p>
                                    </div>
                                    <div className="grid bg-brand-navy">
                                        <div className="border-b border-white/10 p-6">
                                            <div className="flex items-center gap-3">
                                                <Users className="h-5 w-5 text-brand-yellow" />
                                                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/55">Members</p>
                                            </div>
                                            <p className="mt-2 text-3xl font-extrabold">{formatNumber(memberCount)}</p>
                                        </div>
                                        <div className="p-6">
                                            <div className="flex items-center gap-3">
                                                <Leaf className="h-5 w-5 text-brand-yellow" />
                                                <p className="text-sm font-bold uppercase tracking-[0.16em] text-white/55">Points generated</p>
                                            </div>
                                            <p className="mt-2 text-3xl font-extrabold">{formatNumber(totalPoints)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="border-t border-white/10 bg-white/[0.03] p-6">
                                    <div className="flex items-start gap-3">
                                        <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-brand-yellow" />
                                        <p className="text-sm leading-6 text-white/75">
                                            IdleForest has {formatNumber(verifiedTrees)} recorded trees across {plantingCountries.length} countries. Latest recorded planting:{' '}
                                            {latestPlantingDate
                                                ? new Date(latestPlantingDate).toLocaleDateString('en-US', {
                                                      month: 'short',
                                                      day: 'numeric',
                                                      year: 'numeric',
                                                  })
                                                : 'coming soon'}
                                            .
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-[#F7F8F2] py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                            <div>
                                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-emerald-700">Planting proof</p>
                                <h2 className="mt-3 font-candu text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">Where trees are planted</h2>
                                <p className="mt-4 text-base leading-7 text-neutral-700">
                                    Company contributions support IdleForest&apos;s verified planting pipeline. These are real examples from current project records.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Verified trees</p>
                                    <p className="mt-2 text-3xl font-extrabold text-brand-navy">{formatNumber(verifiedTrees)}</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Projects</p>
                                    <p className="mt-2 text-3xl font-extrabold text-brand-navy">{formatNumber(plantingProjects.length)}</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
                                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">Countries</p>
                                    <p className="mt-2 text-3xl font-extrabold text-brand-navy">{formatNumber(plantingCountries.length)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 grid gap-5 lg:grid-cols-3">
                            {featuredProjects.map((planting) => {
                                const image = planting.project.images?.[0]
                                const countryName = planting.country?.name ?? planting.project.countryCode

                                return (
                                    <article key={planting.project.id} className="overflow-hidden rounded-lg border border-black/10 bg-white shadow-sm">
                                        <div className="relative aspect-[4/3] bg-brand-navy">
                                            {image ? (
                                                <Image src={image} alt={planting.project.name} fill className="object-cover" sizes="(min-width: 1024px) 33vw, 100vw" />
                                            ) : (
                                                <div className="flex h-full items-center justify-center bg-brand-navy text-brand-yellow">
                                                    <TreePine className="h-16 w-16" />
                                                </div>
                                            )}
                                            <div className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-2 text-xs font-extrabold uppercase tracking-[0.14em] text-brand-navy shadow-sm">
                                                {formatNumber(planting.totalTrees)} trees
                                            </div>
                                        </div>
                                        <div className="p-5">
                                            <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700">
                                                <MapPin className="h-4 w-4" />
                                                {countryName}
                                            </div>
                                            <h3 className="text-xl font-extrabold leading-snug text-brand-navy">{planting.project.name}</h3>
                                            <p className="mt-3 text-sm leading-6 text-neutral-600">
                                                Planted with {planting.partner?.name ?? planting.project.partnerId}
                                                {planting.lastDate ? `, last updated ${new Date(planting.lastDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.` : '.'}
                                            </p>
                                            {planting.project.externalRef && (
                                                <a
                                                    href={planting.project.externalRef}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-brand-navy hover:text-emerald-700"
                                                >
                                                    View project
                                                    <ArrowRight className="h-4 w-4" />
                                                </a>
                                            )}
                                        </div>
                                    </article>
                                )
                            })}
                        </div>

                        <div className="mt-6 flex flex-wrap gap-2">
                            {plantingCountries.map((country) => (
                                <span key={country} className="inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-semibold text-neutral-700">
                                    <MapPin className="h-4 w-4 text-emerald-700" />
                                    {country}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-white py-14 sm:py-20">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="grid gap-5 md:grid-cols-3">
                            <div className="rounded-lg border border-black/10 bg-[#F7F8F2] p-6">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-white text-emerald-700 shadow-sm">
                                    <Heart className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-brand-navy">Free for members</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-700">Members do not donate or change their workflow. Idle bandwidth funds the planting.</p>
                            </div>
                            <div className="rounded-lg border border-black/10 bg-[#F7F8F2] p-6">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-white text-sky-700 shadow-sm">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-brand-navy">Privacy first</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-700">IdleForest does not read browsing history, personal files, messages, or private data.</p>
                            </div>
                            <div className="rounded-lg border border-black/10 bg-[#F7F8F2] p-6">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-white text-amber-700 shadow-sm">
                                    <ZapOff className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-brand-navy">Runs quietly</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-700">The app pauses when the connection is needed and stays out of the way during work.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {company.video_url ? (
                    <section className="bg-brand-navy py-14 text-white sm:py-20">
                        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-8 flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-yellow text-brand-navy">
                                    <Play className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-yellow">How it works</p>
                                    <h2 className="text-3xl font-extrabold">A quick walkthrough for {company.name}</h2>
                                </div>
                            </div>
                            <div className="aspect-video w-full overflow-hidden rounded-lg border border-white/15 bg-black shadow-2xl">
                                {company.video_url.includes('youtube.com') || company.video_url.includes('youtu.be') ? (
                                    <iframe
                                        src={getYouTubeEmbedUrl(company.video_url)}
                                        className="h-full w-full border-none"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                        title={`${company.name} explainer video`}
                                    />
                                ) : (
                                    <video src={company.video_url} controls className="h-full w-full object-cover" />
                                )}
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="bg-brand-navy py-14 text-white sm:py-20">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="mb-10 max-w-2xl">
                                <p className="text-sm font-extrabold uppercase tracking-[0.2em] text-brand-yellow">How it works</p>
                                <h2 className="mt-3 font-candu text-4xl font-extrabold leading-tight sm:text-5xl">Three simple steps</h2>
                            </div>
                            <div className="grid gap-5 md:grid-cols-3">
                                {[
                                    ['01', 'Join', `Create an account from this page and join ${company.name}'s company forest.`],
                                    ['02', 'Install', 'Run the desktop app or browser extension while you work as usual.'],
                                    ['03', 'Plant', 'IdleForest turns eligible idle activity into funded planting through verified partners.'],
                                ].map(([step, title, description]) => (
                                    <div key={step} className="rounded-lg border border-white/15 bg-white/[0.04] p-6">
                                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-brand-yellow font-candu text-xl font-extrabold text-brand-navy">{step}</div>
                                        <h3 className="text-2xl font-extrabold">{title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-white/70">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
