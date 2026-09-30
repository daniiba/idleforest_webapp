import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { aggregateProjects, plantingsData } from '@/lib/plantings'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    ArrowUpRight,
    BadgeCheck,
    ExternalLink,
    Heart,
    Leaf,
    MapPin,
    Play,
    ShieldCheck,
    TreePine,
    Users,
    ZapOff,
} from 'lucide-react'
import Navigation from '@/components/navigation'
import CompanySettingsPanel from './CompanySettingsPanel'
import PhoneRepairGrowingTrees from '@/components/partner/PhoneRepairGrowingTree'
import MossyEarthPartnerPage from '@/components/partner/MossyEarthPartnerPage'
import SilveiraPartnerPage from '@/components/partner/SilveiraPartnerPage'
import { FreeArt, HabitatArt, InstallArt, JoinArt, PrivacyArt, RunArt } from '@/components/partner/MossyEarthArt'
import WastefreePlanetPartnerPage from '@/components/partner/WastefreePlanetPartnerPage'
import PlanetWildPartnerPage from '@/components/partner/PlanetWildPartnerPage'
import { getTranslations } from 'next-intl/server'
import { canonicalUrl, routeAlternates } from '@/lib/i18n-routes'
import {
    MOSSY_EARTH_COMPANY_SLUG,
    SILVEIRA_COMPANY_SLUG,
    WASTEFREE_COMPANY_SLUG,
    PLANETWILD_COMPANY_SLUG,
    getCanonicalCompanySlug,
    getCompanySlugLookupCandidates,
    isMossyEarthCompanyIdentity,
    isMossyEarthCompanySlug,
    isPlanetwildCompanyIdentity,
    isPlanetwildCompanySlug,
    isSilveiraCompanyIdentity,
    isSilveiraCompanySlug,
    isWastefreeCompanyIdentity,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'
import { getCompanyGeneratedPointStats } from '@/lib/company-node-points'

export const dynamic = 'force-dynamic'

const numberFormatter = new Intl.NumberFormat('en-US')
const emptyCompanyId = '00000000-0000-0000-0000-000000000000'
const plasticRemovalCentsPerPound = 56
const plasticBankBottleEquivalentsPerKg = 50
const poundsPerKg = 2.2046226218
const wastefreePlanetMetaTitle = 'Remove Plastic for Free | Waste Free Planet x IdleForest'
const wastefreePlanetMetaDescription =
    'Join Waste Free Planet on IdleForest to fund ocean-bound plastic removal for free. Install the desktop app; Plastic Bank handles cleanup through 1ClickImpact.'
const planetwildMetaTitle = 'Fund Rewilding for Free | Planet Wild x IdleForest'
const planetwildMetaDescription =
    "Support Planet Wild for free with IdleForest background activity. This IdleForest-run support page and free app are separate from Planet Wild's own website and membership."
const mossyEarthMetaTitle = 'Support Mossy Earth for Free | IdleForest'
const mossyEarthMetaDescription =
    "Support Mossy Earth for free with IdleForest background activity. This IdleForest-run support page and free app are separate from Mossy Earth's own website and membership."

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
    installOnce: '/partner/silveira/install-once.png',
    grid: '/partner/silveira/grid-1.jpg',
    footer: '/partner/silveira/footer-bg.jpg',
}

const wastefreeImages = {
    logo: '/partner/wastefree/wfp-logo-white.webp',
    heroCoast: '/partner/wastefree/hero-coast.jpg',
    heroVideo: '/partner/wastefree/hero-ocean.mp4',
    oceanTexture: '/partner/wastefree/ocean-texture.jpg',
    collectorBali: '/partner/wastefree/collector-family.png',
    plasticBankCollection: '/partner/wastefree/plastic-bank-collection.webp',
    plasticBankWeighing: '/partner/wastefree/plastic-bank-weighing.jpg',
    plasticBankBaliHaris: '/partner/wastefree/plastic-bank-bali-haris.webp',
    plasticBankManilaElizabeth: '/partner/wastefree/plastic-bank-manila-elizabeth.webp',
    plasticBankRayongSutha: '/partner/wastefree/plastic-bank-rayong-sutha.webp',
    plasticBankCairoBashay: '/partner/wastefree/plastic-bank-cairo-bashay.jpg',
    plasticBankEgyptMabrooka: '/partner/wastefree/plastic-bank-egypt-mabrooka.webp',
    plasticBankRioVanessaMarcio: '/partner/wastefree/plastic-bank-rio-vanessa-marcio.webp',
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

function formatRoundedNumber(value: number, locale?: string, maximumFractionDigits = 0) {
    return new Intl.NumberFormat(locale || 'en-US', {
        maximumFractionDigits,
    }).format(value)
}

function getEstimatedCompanyFundingCents(company: any, totalPoints: number) {
    const payoutRate = company?.payout_rate_cents_per_1000_points ?? 27

    return Math.floor((Math.max(0, totalPoints) / 1000) * payoutRate)
}

function getEstimatedPlasticCleanup(fundingCents: number) {
    const pounds = Math.max(0, fundingCents) / plasticRemovalCentsPerPound
    const bottleEquivalents = (pounds / poundsPerKg) * plasticBankBottleEquivalentsPerKg

    return {
        pounds,
        bottleEquivalents,
    }
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
            "Waste Free Planet brings a community of people who care about reducing waste. IdleForest support from this cleanup page funds plastic removal for that community through 1ClickImpact and Plastic Bank.",
        theme_color: '#67d7d1',
        logo_url: null,
        video_url: null,
        is_invite_only: false,
        invite_code: null,
        user_id: null,
        impact_mode: 'company_named_donation',
        payout_recipient_name: 'Waste Free Planet',
        payout_recipient_url: 'https://www.wastefreeplanet.org/',
        payout_notes: "Donate generated cleanup funds through 1ClickImpact clean-ocean projects with Plastic Bank for the Waste Free Planet community.",
    }
}

function getPlanetwildFallbackCompany() {
    return {
        id: emptyCompanyId,
        name: 'Planet Wild',
        slug: PLANETWILD_COMPANY_SLUG,
        website: 'https://planetwild.com/',
        description:
            'Planet Wild is a Berlin-based nature protection organisation funding monthly rewilding missions for endangered animals, oceans, forests, and wild landscapes.',
        theme_color: '#E0F146',
        logo_url: '/partner/planetwild/pw-logo-black.png',
        video_url: null,
        is_invite_only: false,
        invite_code: null,
        user_id: null,
        impact_mode: 'partner_payout',
        payout_recipient_name: 'Planet Wild',
        payout_recipient_url: 'https://planetwild.com/',
        payout_notes: 'Send generated company forest funds to Planet Wild for documented rewilding missions.',
    }
}

function getMossyEarthFallbackCompany() {
    return {
        id: emptyCompanyId,
        name: 'IdleForest Rewilding Support',
        slug: MOSSY_EARTH_COMPANY_SLUG,
        website: 'https://www.mossy.earth/',
        description:
            'An IdleForest support page for people who want background app activity to help fund conservation and rewilding work.',
        theme_color: '#E0F146',
        logo_url: '/logo.png',
        video_url: null,
        is_invite_only: false,
        invite_code: null,
        user_id: null,
        impact_mode: 'partner_payout',
        payout_recipient_name: 'Mossy Earth',
        payout_recipient_url: 'https://www.mossy.earth/',
        payout_notes: 'Send generated company forest funds to Mossy Earth for conservation and rewilding projects.',
    }
}

function PhoneRepairEyebrow({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <p className={`font-mono text-[0.64rem] font-extrabold tracking-[0.28em] text-[#050505] ${className}`}>{children}</p>
}

function PhoneRepairMark({ company, compact = false }: { company: any; compact?: boolean }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} phone-repair-mark-logo`} role="img" aria-label={company.name} />
            <span className="text-[0.72rem] font-extrabold tracking-normal text-[#050505]">{company.name}</span>
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
                    <h1 className="mt-5 max-w-[410px] text-[3rem] font-extrabold leading-[0.9] tracking-normal text-[#050505] sm:text-[4.25rem] lg:text-[4.15rem]">{copy.title}</h1>
                    <p className="mt-5 max-w-[370px] text-base font-semibold leading-7 text-[#31332b] sm:text-lg sm:leading-8">{copy.description}</p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {isMember ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-extrabold text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {copy.portalCta}
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : isValidInvite ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-extrabold text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {copy.installCta}
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : (
                            <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/10 bg-white/90 px-5 py-3 font-mono text-[0.62rem] font-extrabold tracking-[0.14em] text-brand-navy shadow-[0_18px_34px_rgba(11,16,31,0.08)]">
                                {copy.inviteRequired}
                            </span>
                        )}
                        {companyWebsite ? (
                            <a
                                href={companyWebsite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/15 bg-white/90 px-6 py-3 font-mono text-[0.62rem] font-extrabold text-brand-navy transition-colors hover:border-brand-navy/35"
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

/* Hallmark · genre: editorial · macrostructure: Stat-Led Reference · theme: Ivory Ocean · enrichment: supplied imagery · nav: N9 · footer: Ft6 · pre-emit critique: P4 H4 E4 S4 R5 V4 */
export function generateMetadata({ params }: { params: { slug: string; locale: string } }): Metadata {
    if (isMossyEarthCompanySlug(params.slug)) {
        const path = `/c/${MOSSY_EARTH_COMPANY_SLUG}`
        const url = canonicalUrl(path, params.locale)

        return {
            title: mossyEarthMetaTitle,
            description: mossyEarthMetaDescription,
            keywords: [
                'Mossy Earth',
                'support Mossy Earth for free',
                'IdleForest support page',
                'free conservation support',
                'fund conservation for free',
                'free rewilding support',
                'IdleForest',
                'passive environmental impact',
            ],
            alternates: routeAlternates(path, params.locale),
            openGraph: {
                title: mossyEarthMetaTitle,
                description: mossyEarthMetaDescription,
                url,
                siteName: 'IdleForest',
                type: 'website',
                images: [
                    {
                        url: '/partner/mossy-earth/planting-portrait.png',
                        width: 1600,
                        height: 900,
                        alt: 'Conservation work in a flooded woodland.',
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: mossyEarthMetaTitle,
                description: mossyEarthMetaDescription,
                images: ['/partner/mossy-earth/planting-portrait.png'],
            },
        }
    }

    if (isPlanetwildCompanySlug(params.slug)) {
        const path = `/c/${PLANETWILD_COMPANY_SLUG}`
        const url = canonicalUrl(path, params.locale)

        return {
            title: planetwildMetaTitle,
            description: planetwildMetaDescription,
            keywords: [
                'Planet Wild',
                'Planet Wild missions',
                'rewilding missions',
                'fund rewilding for free',
                'IdleForest',
                'passive environmental impact',
            ],
            alternates: routeAlternates(path, params.locale),
            openGraph: {
                title: planetwildMetaTitle,
                description: planetwildMetaDescription,
                url,
                siteName: 'IdleForest',
                type: 'website',
                images: [
                    {
                        url: '/preview.png',
                        width: 1280,
                        height: 800,
                        alt: 'IdleForest and Planet Wild rewilding partner page.',
                    },
                ],
            },
            twitter: {
                card: 'summary_large_image',
                title: planetwildMetaTitle,
                description: planetwildMetaDescription,
                images: ['/preview.png'],
            },
        }
    }

    if (!isWastefreeCompanySlug(params.slug)) return {}

    const path = `/c/${WASTEFREE_COMPANY_SLUG}`
    const url = canonicalUrl(path, params.locale)

    return {
        title: wastefreePlanetMetaTitle,
        description: wastefreePlanetMetaDescription,
        keywords: [
            'remove plastic for free',
            'free plastic removal',
            'ocean-bound plastic removal',
            'Waste Free Planet',
            'Plastic Bank cleanup',
            'IdleForest',
        ],
        alternates: routeAlternates(path, params.locale),
        openGraph: {
            title: wastefreePlanetMetaTitle,
            description: wastefreePlanetMetaDescription,
            url,
            siteName: 'IdleForest',
            type: 'website',
            images: [
                {
                    url: wastefreeImages.plasticBankCollection,
                    width: 655,
                    height: 820,
                    alt: 'Plastic Bank collection member with family by the coastline.',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: wastefreePlanetMetaTitle,
            description: wastefreePlanetMetaDescription,
            images: [wastefreeImages.plasticBankCollection],
        },
    }
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
        (isSilveiraCompanySlug(params.slug)
            ? getSilveiraTechFallbackCompany()
            : isWastefreeCompanySlug(params.slug)
              ? getWastefreePlanetFallbackCompany()
              : isPlanetwildCompanySlug(params.slug)
                ? getPlanetwildFallbackCompany()
                : isMossyEarthCompanySlug(params.slug)
                  ? getMossyEarthFallbackCompany()
                : null)

    if ((error && !isSilveiraCompanySlug(params.slug) && !isWastefreeCompanySlug(params.slug) && !isPlanetwildCompanySlug(params.slug) && !isMossyEarthCompanySlug(params.slug)) || !company) {
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
    const usePlanetwildPage = isPlanetwildCompanyIdentity(company, companyWebsite?.hostname)
    const useMossyEarthPage = isMossyEarthCompanyIdentity(company, companyWebsite?.hostname)
    const isValidInvite = useSilveiraTechPage || useWastefreePlanetPage || usePlanetwildPage || useMossyEarthPage || !company.is_invite_only || Boolean(invite && invite === company.invite_code) || isMember

    if (usePhoneRepairPage) {
        const joinHref = isMember ? `/${params.locale}/portal/c/${company.slug}` : `/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`
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
                        <nav className="hidden items-center gap-6 font-mono text-[0.62rem] font-extrabold text-[#6f6f69] md:flex">
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
                                className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-extrabold text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                {phoneRepairT('cta.portal')}
                            </Link>
                        ) : isValidInvite ? (
                            <Link
                                href={joinHref}
                                className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-extrabold text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
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
                            <h2 className="mt-6 max-w-[520px] text-[3rem] font-extrabold leading-none tracking-normal text-white sm:text-[4.2rem]">{phoneRepairT('how.title')}</h2>
                            <p className="mt-6 max-w-[520px] text-base font-medium leading-7 text-white/76">{phoneRepairT('how.body')}</p>
                        </div>
                        <div className="grid gap-4 md:grid-cols-3">
                            {phoneRepairPledgeItems.map((item) => (
                                <div key={item.number} className="rounded-[26px] bg-white p-6">
                                    <p className="font-mono text-[0.6rem] font-extrabold text-emerald-700">{item.number}</p>
                                    <h3 className="mt-5 text-3xl font-extrabold leading-none tracking-normal text-black">{item.title}</h3>
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
                            <p className="font-mono text-[0.6rem] font-extrabold text-brand-navy/70">{phoneRepairT('proof.eyebrow')}</p>
                            <p className="mt-4 text-6xl font-extrabold leading-none tracking-normal text-brand-navy">{formatNumber(verifiedTrees, params.locale)}</p>
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
                                        <p className="font-mono text-[0.58rem] font-extrabold text-[#777]">{label}</p>
                                        <p className="mt-4 text-4xl font-extrabold leading-none tracking-normal text-black">{value}</p>
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
                                        <span className="col-start-2 col-span-2 font-mono text-[0.68rem] font-extrabold text-[#777] sm:col-auto">{record.trees}</span>
                                        <span className="col-start-2 col-span-2 min-w-0 break-words text-[1.6rem] font-extrabold leading-[0.94] tracking-normal sm:col-auto sm:text-2xl sm:leading-none">
                                            {record.name}
                                        </span>
                                        <span className="col-start-2 font-mono text-[0.58rem] font-extrabold text-[#777] sm:col-auto">{record.date}</span>
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
                            <h2 className="mt-6 max-w-full break-words text-[2.08rem] font-extrabold leading-[0.96] tracking-normal text-white sm:max-w-[720px] sm:text-[4rem] sm:leading-none">
                                {phoneRepairT('install.title')}
                            </h2>
                            <p className="mt-6 max-w-full text-[0.98rem] font-medium leading-7 text-white/75 sm:max-w-[620px] sm:text-base">{phoneRepairT('install.body')}</p>
                        </div>
                        <div className="flex min-w-0 flex-col items-stretch gap-3 self-center sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                            {isMember ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-extrabold text-brand-navy transition-colors hover:bg-white hover:text-black sm:w-auto"
                                >
                                    {phoneRepairT('cta.portal')}
                                    <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={joinHref}
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-extrabold text-brand-navy transition-colors hover:bg-white hover:text-black sm:w-auto"
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
                                    className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-white/25 px-6 py-3 font-mono text-[0.62rem] font-extrabold text-white transition-colors hover:border-white sm:w-auto"
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
                fundingRaised={formatCurrencyCents(getEstimatedCompanyFundingCents(company, totalPoints), params.locale)}
                companyWebsite={companyWebsite}
            />
        )
    }

    if (useWastefreePlanetPage) {
        const wastefreeFundingCents = getEstimatedCompanyFundingCents(company, totalPoints)
        const wastefreeCleanup = getEstimatedPlasticCleanup(wastefreeFundingCents)

        return (
            <WastefreePlanetPartnerPage
                company={company}
                params={params}
                invite={invite}
                isMember={isMember}
                isValidInvite={Boolean(isValidInvite)}
                isOwner={isOwner}
                memberCount={memberCount}
                totalPoints={totalPoints}
                fundingRaised={formatCurrencyCents(wastefreeFundingCents, params.locale)}
                plasticPounds={`${formatRoundedNumber(wastefreeCleanup.pounds, params.locale, wastefreeCleanup.pounds >= 10 ? 0 : 1)} lb`}
                bottleEquivalents={formatRoundedNumber(wastefreeCleanup.bottleEquivalents, params.locale)}
                members={formatNumber(memberCount, params.locale)}
                companyWebsite={companyWebsite}
            />
        )
    }

    if (usePlanetwildPage) {
        return (
            <PlanetWildPartnerPage
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

    if (useMossyEarthPage) {
        return (
            <MossyEarthPartnerPage
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

            <main className="mx-auto max-w-6xl space-y-6 px-4 pb-12 pt-24 sm:space-y-8 sm:px-6 sm:pb-16 sm:pt-28">
                {/* Hero */}
                <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch lg:gap-10">
                    <div className="flex flex-col justify-center py-2">
                        <div className="inline-flex w-fit items-center gap-3 rounded-full bg-white py-2 pl-4 pr-3 shadow-sm ring-1 ring-neutral-200">
                            <Image src="/logo.png" alt="IdleForest" width={121} height={33} className="h-auto w-[84px]" />
                            <span className="text-sm font-bold text-neutral-400" aria-hidden>&times;</span>
                            {company.logo_url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={company.logo_url} alt={company.name} className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                                <span className="flex h-7 w-7 items-center justify-center rounded-full" style={{ backgroundColor: themeColor }}>
                                    <TreePine className="h-4 w-4 text-brand-navy" aria-hidden />
                                </span>
                            )}
                            <span className="pr-1 text-sm font-bold">{company.name}</span>
                        </div>

                        <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-brand-navy sm:text-5xl lg:text-6xl">
                            Turn everyday work into <span className="bg-[linear-gradient(transparent_62%,var(--theme))]" style={{ ['--theme' as string]: themeColor }}>real trees.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-lg leading-7 text-neutral-600">
                            {company.description ||
                                `${company.name} is using IdleForest to convert idle bandwidth into verified reforestation impact. Join the company forest and help grow the number together.`}
                        </p>

                        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                            {isMember ? (
                                <Link
                                    href={`/${params.locale}/portal/c/${company.slug}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    Go to portal
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={`/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`}
                                    className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95"
                                    style={{ backgroundColor: themeColor }}
                                >
                                    Join {company.name}
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            ) : (
                                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
                                    This company forest is invite-only. Open it from your company invite link to join.
                                </div>
                            )}
                            {companyWebsite && (
                                <a
                                    href={companyWebsite.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-neutral-100"
                                >
                                    {companyWebsite.hostname}
                                    <ExternalLink className="h-4 w-4" aria-hidden />
                                </a>
                            )}
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-brand-navy p-6 text-white sm:p-8">
                        <Image src="/report-images/plant-to-stop-poverty.jpg" alt="" fill sizes="(min-width: 1024px) 520px, 100vw" className="object-cover opacity-40" />
                        <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/70 to-brand-navy/30" aria-hidden />
                        <div className="relative flex h-full min-h-[380px] flex-col justify-end">
                            <p className="text-sm font-semibold text-white/70">{companyTreesLabel}</p>
                            <p className="mt-1 text-6xl font-extrabold leading-none tracking-tight text-brand-yellow sm:text-7xl">{formatNumber(companyTrees)}</p>
                            <p className="mt-3 max-w-sm text-sm leading-6 text-white/70">
                                {recordedCompanyTrees > 0
                                    ? 'From company donation history and awarded install bonuses.'
                                    : 'Estimated from company activity until donation records are available.'}
                            </p>
                            <dl className="mt-6 grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                                    <dt className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                        <Users className="h-4 w-4" aria-hidden /> Members
                                    </dt>
                                    <dd className="mt-1 text-2xl font-extrabold tabular-nums">{formatNumber(memberCount)}</dd>
                                </div>
                                <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                                    <dt className="flex items-center gap-2 text-xs font-semibold text-white/70">
                                        <Leaf className="h-4 w-4" aria-hidden /> Tasks handled
                                    </dt>
                                    <dd className="mt-1 text-2xl font-extrabold tabular-nums">{formatNumber(totalPoints)}</dd>
                                </div>
                            </dl>
                            <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-white/65">
                                <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-brand-yellow" aria-hidden />
                                <span>
                                    IdleForest has {formatNumber(verifiedTrees)} recorded trees across {plantingCountries.length} countries. Latest planting:{' '}
                                    {latestPlantingDate
                                        ? new Date(latestPlantingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : 'coming soon'}
                                    .
                                </span>
                            </p>
                        </div>
                    </div>
                </section>

                {/* Planting proof */}
                <section aria-labelledby="planting-heading">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 id="planting-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Where trees are planted</h2>
                            <p className="mt-1 max-w-xl text-neutral-600">
                                Company contributions support IdleForest&apos;s verified planting pipeline. These are real examples from current project records.
                            </p>
                        </div>
                        <dl className="grid grid-cols-3 gap-3 lg:w-[26rem]">
                            {[
                                ['Verified trees', formatNumber(verifiedTrees)],
                                ['Projects', formatNumber(plantingProjects.length)],
                                ['Countries', formatNumber(plantingCountries.length)],
                            ].map(([label, value]) => (
                                <div key={label} className="rounded-2xl border border-neutral-200 bg-white p-4">
                                    <dd className="text-2xl font-extrabold tabular-nums tracking-tight">{value}</dd>
                                    <dt className="mt-0.5 text-xs text-neutral-500">{label}</dt>
                                </div>
                            ))}
                        </dl>
                    </div>

                    <div className="mt-5 grid gap-4 lg:grid-cols-3">
                        {featuredProjects.map((planting) => {
                            const image = planting.project.images?.[0]
                            const countryName = planting.country?.name ?? planting.project.countryCode

                            return (
                                <article key={planting.project.id} className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md">
                                    <div className="relative aspect-[4/3] bg-brand-navy">
                                        {image ? (
                                            <Image src={image} alt={planting.project.name} fill className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" sizes="(min-width: 1024px) 33vw, 100vw" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center bg-brand-navy text-brand-yellow">
                                                <TreePine className="h-16 w-16" />
                                            </div>
                                        )}
                                        <div className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-brand-navy shadow-sm">
                                            {formatNumber(planting.totalTrees)} trees
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
                                            <MapPin className="h-4 w-4" aria-hidden />
                                            {countryName}
                                        </p>
                                        <h3 className="mt-2 text-lg font-extrabold leading-snug text-brand-navy">{planting.project.name}</h3>
                                        <p className="mt-2 text-sm leading-6 text-neutral-600">
                                            Planted with {planting.partner?.name ?? planting.project.partnerId}
                                            {planting.lastDate ? `, last updated ${new Date(planting.lastDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}.` : '.'}
                                        </p>
                                        {planting.project.externalRef && (
                                            <a
                                                href={planting.project.externalRef}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4"
                                            >
                                                View project
                                                <ArrowRight className="h-4 w-4" aria-hidden />
                                            </a>
                                        )}
                                    </div>
                                </article>
                            )
                        })}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        {plantingCountries.map((country) => (
                            <span key={country} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700">
                                <MapPin className="h-3.5 w-3.5 text-emerald-700" aria-hidden />
                                {country}
                            </span>
                        ))}
                    </div>
                </section>

                {/* Benefits */}
                <section className="grid gap-4 md:grid-cols-3" aria-label="Why it is easy to join">
                    {[
                        { art: FreeArt, title: 'Free for members', body: 'Members do not donate or change their workflow. Idle bandwidth funds the planting.' },
                        { art: PrivacyArt, title: 'Privacy first', body: 'IdleForest does not read browsing history, personal files, messages or private data.' },
                        { art: RunArt, title: 'Runs quietly', body: 'The app pauses when the connection is needed and stays out of the way during work.' },
                    ].map(({ art: Art, title, body }) => (
                        <article key={title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                            <Art className="h-20 w-20" />
                            <h3 className="mt-4 text-xl font-extrabold tracking-tight">{title}</h3>
                            <p className="mt-1 text-sm leading-6 text-neutral-600">{body}</p>
                        </article>
                    ))}
                </section>

                {company.video_url ? (
                    <section className="overflow-hidden rounded-3xl bg-brand-navy p-5 text-white sm:p-10" aria-labelledby="walkthrough-heading">
                        <h2 id="walkthrough-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">A quick walkthrough for {company.name}</h2>
                        <div className="mt-6 aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-2xl ring-1 ring-white/15">
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
                    </section>
                ) : (
                    <section className="overflow-hidden rounded-3xl bg-[#16382D] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="steps-heading">
                        <h2 id="steps-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Three simple steps</h2>
                        <ol className="mt-8 grid gap-3 md:grid-cols-3">
                            {[
                                { art: JoinArt, title: 'Join', body: `Create an account from this page and join ${company.name}'s company forest.` },
                                { art: InstallArt, title: 'Install', body: 'Run the desktop app or browser extension while you work as usual.' },
                                { art: HabitatArt, title: 'Plant', body: 'IdleForest turns eligible idle activity into funded planting through verified partners.' },
                            ].map(({ art: Art, title, body }) => (
                                <li key={title} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                                    <Art className="h-24 w-24" />
                                    <p className="mt-4 text-lg font-extrabold">{title}</p>
                                    <p className="mt-1 text-sm text-white/75">{body}</p>
                                </li>
                            ))}
                        </ol>
                    </section>
                )}
            </main>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
