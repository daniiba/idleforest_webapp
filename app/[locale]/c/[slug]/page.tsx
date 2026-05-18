import { createClient } from '@/lib/supabase/server'
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
    ShieldCheck,
    Star,
    TreePine,
    Users,
    ZapOff,
} from 'lucide-react'
import Navigation from '@/components/navigation'
import CompanySettingsPanel from './CompanySettingsPanel'
import PhoneRepairGrowingTrees from '@/components/partner/PhoneRepairGrowingTree'

export const dynamic = 'force-dynamic'

const numberFormatter = new Intl.NumberFormat('en-US')

const phoneRepairPledgeItems = [
    {
        number: '01',
        title: 'Join the repair forest',
        body: 'After choosing the green option, your IdleForest install is linked to the PhoneRepair.pt planting effort.',
    },
    {
        number: '02',
        title: 'Let it run quietly',
        body: 'IdleForest works in the background using idle internet capacity, so you can keep using your device as usual.',
    },
    {
        number: '03',
        title: 'Help plant trees',
        body: 'That background activity helps fund verified planting projects and adds to the public PhoneRepair.pt x IdleForest record.',
    },
]

function formatNumber(value: number) {
    return numberFormatter.format(value)
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
    const values = [company.name, company.slug, website?.hostname, company.website]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase().replace(/[^a-z0-9]/g, ''))

    return values.some((value) => value.includes('phonerepair'))
}

function PhoneRepairDisplayHeading({
    children,
    as = 'h2',
    className = '',
}: {
    children: React.ReactNode
    as?: 'h1' | 'h2'
    className?: string
}) {
    const Tag = as

    return (
        <Tag
            className={`font-candu text-[2.85rem] font-black uppercase leading-[0.94] tracking-normal text-[#050505] sm:text-[4.4rem] lg:text-[5.6rem] ${className}`}
        >
            {children}
        </Tag>
    )
}

function PhoneRepairEyebrow({
    children,
    className = '',
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <p className={`font-mono text-[0.64rem] font-black uppercase tracking-[0.28em] text-[#050505] ${className}`}>
            {children}
        </p>
    )
}

function PhoneRepairMark({
    company,
    compact = false,
}: {
    company: any
    compact?: boolean
}) {
    return (
        <div className="flex items-center gap-2">
            {company.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={company.logo_url}
                    alt={company.name}
                    className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} border-2 border-black bg-white object-cover`}
                />
            ) : (
                <span className={`${compact ? 'h-6 w-6' : 'h-8 w-8'} grid place-items-center border-2 border-black bg-[#dfff2f] text-black`}>
                    <MapPin aria-hidden className="h-3.5 w-3.5 fill-current" strokeWidth={2.75} />
                </span>
            )}
            <span className="text-[0.72rem] font-black uppercase tracking-normal text-[#050505]">{company.name}</span>
        </div>
    )
}

function PhoneRepairButton({
    children,
    href,
    variant = 'primary',
}: {
    children: React.ReactNode
    href: string
    variant?: 'primary' | 'secondary'
}) {
    const isPrimary = variant === 'primary'

    return (
        <Link
            href={href}
            className={`inline-flex min-h-12 items-center justify-center gap-3 border-2 px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] transition-colors focus:outline-none focus:ring-2 focus:ring-[#050505] focus:ring-offset-2 focus:ring-offset-white ${
                isPrimary
                    ? 'border-[#050505] bg-[#dfff2f] text-[#050505] shadow-[4px_4px_0_#050505] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#050505]'
                    : 'border-[#050505] bg-white text-[#050505] hover:bg-[#19bde2]'
            }`}
        >
            <span>{children}</span>
            {isPrimary ? <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} /> : null}
        </Link>
    )
}

function PhoneRepairRatingBadge() {
    return (
        <div className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2">
            <span className="text-sm font-black text-[#005ee8]">4.9</span>
            <span className="flex text-[#ffb800]" aria-label="Google rating 4.9 out of 5">
                {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-3 w-3 fill-current" strokeWidth={0} />
                ))}
            </span>
            <span className="text-[0.55rem] font-black uppercase text-[#050505]">Google</span>
        </div>
    )
}

function PhoneRepairTicketHero({
    company,
    invite,
    companyTrees,
    companyTreesLabel,
}: {
    company: any
    invite?: string
    companyTrees: number
    companyTreesLabel: string
}) {
    const ticketRows = [
        ['Partner', 'PhoneRepair.pt x IdleForest'],
        ['Customer', 'Selects when buying'],
        ['Invite', invite || company.invite_code || 'required'],
        ['Impact', companyTrees > 0 ? `${formatNumber(companyTrees)} trees` : 'One install, one tree'],
    ]

    return (
        <figure className="self-center lg:justify-self-end">
            <div className="relative w-full max-w-[450px] overflow-hidden border-2 border-black bg-white shadow-[10px_10px_0_#050505]">
                <div className="flex items-center justify-between border-b-2 border-black bg-[#050505] px-5 py-4 text-white">
                    <div>
                        <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.28em] text-white/45">
                            Partnership
                        </p>
                        <p className="mt-1 font-candu text-2xl font-black uppercase leading-none tracking-normal">
                            PhoneRepair.pt
                        </p>
                    </div>
                    <span className="border border-white bg-[#dfff2f] px-3 py-1.5 font-mono text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#050505]">
                        Active
                    </span>
                </div>

                <div className="relative bg-[#f8faf5] px-5 py-6">
                    <div className="absolute inset-0 opacity-80 [background-image:linear-gradient(#050505_1px,transparent_1px),linear-gradient(90deg,#050505_1px,transparent_1px)] [background-size:38px_38px]" />
                    <div className="relative">
                        <div className="grid grid-cols-[1fr_auto] gap-4 border-b-2 border-black bg-white/90 pb-5">
                            <div>
                                <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.24em] text-[#636363]">
                                    Page
                                </p>
                                <h3 className="mt-2 font-candu text-4xl font-black uppercase leading-none tracking-normal text-[#050505]">
                                    {company.name}
                                </h3>
                            </div>
                            <div className="text-right">
                                <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#636363]">
                                    Ticket
                                </p>
                                <p className="mt-2 font-mono text-sm font-black text-[#050505]">#IF-2026</p>
                            </div>
                        </div>

                        <dl className="divide-y-2 divide-black border-x-2 border-black bg-white">
                            {ticketRows.map(([label, value]) => (
                                <div key={label} className="grid grid-cols-[112px_1fr] gap-4 py-4">
                                    <dt className="pl-4 font-mono text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#666]">
                                        {label}
                                    </dt>
                                    <dd className="pr-4 text-sm font-extrabold uppercase tracking-normal text-[#050505]">
                                        {value}
                                    </dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-5 grid grid-cols-[1fr_auto] items-end gap-4 border-2 border-black bg-[#19bde2] p-4">
                            <div>
                                <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#050505]">
                                    {companyTreesLabel}
                                </p>
                                <p className="mt-2 font-candu text-5xl font-black leading-none tracking-normal text-[#050505]">
                                    {formatNumber(companyTrees)}
                                </p>
                            </div>
                            <div className="border-2 border-black bg-white px-3 py-2 font-mono text-[0.58rem] font-black uppercase tracking-[0.16em] text-[#050505]">
                                1 install = 1 tree
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between border-t-2 border-black px-5 py-4">
                    <span className="font-mono text-[0.58rem] font-black uppercase tracking-[0.2em] text-[#666]">
                        Invite accepted
                    </span>
                    <span className="h-9 w-28 border-2 border-[#050505] bg-[repeating-linear-gradient(90deg,#050505_0,#050505_3px,transparent_3px,transparent_7px)] opacity-80" />
                </div>
            </div>
            <figcaption className="mt-6 font-mono text-[0.62rem] font-black uppercase tracking-[0.28em] text-[#050505]">
                Partner install flow
            </figcaption>
        </figure>
    )
}

function PhoneRepairAsciiMotionPanel() {
    return (
        <div className="relative min-h-[520px] overflow-hidden rounded-[42px] bg-brand-navy p-7 text-white sm:p-10 lg:min-h-[650px]">
            <div className="flex h-full min-h-[440px] flex-col justify-between gap-10">
                <div className="max-w-[560px]">
                    <PhoneRepairEyebrow className="text-brand-yellow">PhoneRepair.pt x IdleForest</PhoneRepairEyebrow>
                    <h2 className="mt-7 font-candu text-[2.55rem] font-black uppercase leading-[0.96] tracking-normal text-white sm:text-[3.35rem] lg:text-[3.85rem]">
                        Greener phone repairs.
                    </h2>
                    <p className="mt-7 max-w-[480px] text-base font-semibold leading-7 text-white/76">
                        PhoneRepair.pt customers can choose IdleForest at checkout. After they install the app, that qualifying install helps fund tree planting.
                    </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                    {[
                        ['01', 'Choose green option'],
                        ['02', 'Install IdleForest'],
                        ['03', 'Planting recorded'],
                    ].map(([number, label]) => (
                        <div key={number} className="border border-white/15 bg-white/8 p-4">
                            <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.18em] text-brand-yellow">{number}</p>
                            <p className="mt-3 text-sm font-black uppercase tracking-normal text-white">{label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function PhoneRepairWireframePanel({
    joinHref,
    companyWebsite,
    isMember,
    isValidInvite,
    verifiedTrees,
}: {
    joinHref: string
    companyWebsite: ReturnType<typeof getCompanyWebsiteLink>
    isMember: boolean
    isValidInvite: boolean
    verifiedTrees: number
}) {
    return (
        <div className="phone-line-panel phone-line-hero-panel relative z-20 min-h-[500px] overflow-hidden rounded-[42px] border border-[#e5e5dc] bg-[#fafaf6] p-6 sm:min-h-[620px] sm:p-10 lg:h-[min(720px,calc(100vh-150px))] lg:min-h-0">
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
                            <div className="phone-line-step-label phone-line-step-label-checkout">
                                <span>01</span>
                                <strong>Green option selected</strong>
                                <small>PhoneRepair.pt checkout</small>
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
                            <div className="phone-line-step-label phone-line-step-label-install">
                                <span>02</span>
                                <strong>IdleForest installed</strong>
                                <small>Invite connects the app</small>
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
                            <div className="phone-line-step-label phone-line-step-label-proof">
                                <span>03</span>
                                <strong>Planting recorded</strong>
                                <small>{formatNumber(verifiedTrees)} trees in proof record</small>
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
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(250,250,246,0)_62%,rgba(250,250,246,0.9)_100%)]" />
            </div>
            <div className="phone-line-stage phone-line-plant-stage" aria-hidden>
                <PhoneRepairGrowingTrees />
            </div>
            <div className="relative z-10 flex h-full min-h-[440px] flex-col justify-between gap-8 pr-0 lg:max-w-[430px] lg:pr-4">
                <div className="pt-12 sm:pt-10 lg:pt-10">
                    <PhoneRepairEyebrow className="text-[#6d7416]">PhoneRepair.pt x IdleForest</PhoneRepairEyebrow>
                    <h1 className="mt-5 max-w-[410px] font-candu text-[3rem] font-black uppercase leading-[0.9] tracking-normal text-[#050505] sm:text-[4.25rem] lg:text-[4.15rem]">
                        Greener phone repairs.
                    </h1>
                    <p className="mt-5 max-w-[370px] text-base font-semibold leading-7 text-[#31332b] sm:text-lg sm:leading-8">
                        Choose IdleForest with your PhoneRepair.pt repair, install after checkout, and help fund verified tree planting.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        {isMember ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                Go to portal
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : isValidInvite ? (
                            <Link
                                href={joinHref}
                                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-navy px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                            >
                                Install from invite
                                <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                            </Link>
                        ) : (
                            <span className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/10 bg-white/90 px-5 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.14em] text-brand-navy shadow-[0_18px_34px_rgba(11,16,31,0.08)]">
                                Invite required
                            </span>
                        )}
                        {companyWebsite ? (
                            <a
                                href={companyWebsite.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-brand-navy/15 bg-white/90 px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-brand-navy transition-colors hover:border-brand-navy/35"
                            >
                                Book repair
                            </a>
                        ) : null}
                    </div>
                </div>

                <div className="phone-line-hero-steps">
                    {[
                        ['01', 'Choose green option'],
                        ['02', 'Install IdleForest'],
                        ['03', 'Planting recorded'],
                    ].map(([number, label]) => (
                        <div key={number}>
                            <span>{number}</span>
                            <strong>{label}</strong>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default async function CompanyPortalPage({
    params,
    searchParams
}: {
    params: { slug: string; locale: string }
    searchParams: { invite?: string; design?: string; variant?: string }
}) {
    const supabase = await createClient()

    const { data: company, error } = await supabase
        .from('companies')
        .select('*')
        .eq('slug', params.slug)
        .single()

    if (error || !company) {
        return notFound()
    }

    const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('total_points')
        .eq('company_id', company.id)

    let memberCount = 0
    let totalPoints = 0

    if (!profilesError && profiles) {
        memberCount = profiles.length
        totalPoints = profiles.reduce((acc, p) => acc + (p.total_points || 0), 0)
    }

    const { data: donations } = await supabase
        .from('donations')
        .select('trees_planted')
        .eq('company_id', company.id)

    const donatedTrees = donations?.reduce((sum, donation) => sum + (donation.trees_planted || 0), 0) ?? 0
    const earnedTrees = Math.floor(totalPoints / 1000)
    const companyTrees = donatedTrees > 0 ? donatedTrees : earnedTrees
    const companyTreesLabel = donatedTrees > 0 ? 'Recorded company trees' : 'Estimated company trees'

    const verifiedTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0)
    const plantingProjects = aggregateProjects(plantingsData)
        .filter((project) => project.totalTrees > 0)
        .sort((a, b) => b.totalTrees - a.totalTrees)

    const featuredProjects = plantingProjects
        .filter((project) => project.project.images && project.project.images.length > 0)
        .concat(plantingProjects.filter((project) => !project.project.images || project.project.images.length === 0))
        .slice(0, 3)

    const plantingCountries = Array.from(
        new Set(plantingProjects.map((project) => project.country?.name ?? project.project.countryCode))
    )

    const latestPlantingDate = plantingProjects
        .map((project) => project.lastDate)
        .filter(Boolean)
        .sort()
        .slice(-1)[0]

    const { data: { user } } = await supabase.auth.getUser()
    let isMember = false
    if (user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', user.id)
            .single()

        if (profile && profile.company_id === company.id) {
            isMember = true
        }
    }

    const { invite } = searchParams
    const isOwner = user ? company.user_id === user.id : false
    const isValidInvite = !company.is_invite_only || (invite && invite === company.invite_code) || isMember
    const themeColor = company.theme_color || '#10B981'
    const companyWebsite = getCompanyWebsiteLink(company.website)
    const usePhoneRepairPage = isPhoneRepairCompany(company, companyWebsite)

    if (usePhoneRepairPage) {
        const joinHref = isMember
            ? `/${params.locale}/welcome/c/${company.slug}`
            : `/${params.locale}/auth/user/signup${invite ? `?invite=${invite}` : ''}`
        const projectRows = featuredProjects.map((planting) => {
            const countryName = planting.country?.name ?? planting.project.countryCode
            const partnerName = planting.partner?.name ?? planting.project.partnerId
            const date = planting.lastDate
                ? new Date(planting.lastDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                : 'Current'

            return {
                id: planting.project.id,
                trees: planting.totalTrees,
                name: planting.project.name,
                meta: `${countryName} - ${partnerName}`,
                date,
                href: planting.project.externalRef || '/report',
                image: planting.project.images?.[0],
            }
        })

        const useAsciiDesign = searchParams.design === 'ascii' || searchParams.variant === 'ascii'

        if (useAsciiDesign) {
            return (
                <div className="min-h-screen bg-[#f8f8f5] text-brand-navy selection:bg-brand-yellow selection:text-black">
                    {isValidInvite && invite && (
                        <script
                            dangerouslySetInnerHTML={{
                                __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`
                            }}
                        />
                    )}

                    <header className="px-4 py-4 sm:px-7">
                        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 rounded-[26px] border border-[#deded8] bg-white/80 px-4 py-3 backdrop-blur sm:px-6">
                            <PhoneRepairMark company={company} compact />
                            <nav className="hidden items-center gap-6 font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#6f6f69] md:flex">
                                <a href="#ascii-flow" className="hover:text-brand-navy">How it works</a>
                                <a href="#ascii-proof" className="hover:text-brand-navy">Proof</a>
                                <a href="#ascii-install" className="hover:text-brand-navy">Install</a>
                                <Link href={`/${params.locale}/c/${company.slug}${invite ? `?invite=${invite}` : ''}`} className="hover:text-brand-navy">
                                    Editorial version
                                </Link>
                            </nav>
                            {isMember ? (
                                <Link
                                    href={joinHref}
                                    className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                                >
                                    Portal
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={joinHref}
                                    className="rounded-full bg-brand-navy px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:bg-brand-yellow hover:text-brand-navy"
                                >
                                    Join
                                </Link>
                            ) : null}
                        </div>
                    </header>

                    <main className="px-4 pb-4 sm:px-7 sm:pb-7">
                        <section className="relative isolate mx-auto max-w-[1540px]">
                            <PhoneRepairWireframePanel
                                joinHref={joinHref}
                                companyWebsite={companyWebsite}
                                isMember={isMember}
                                isValidInvite={isValidInvite}
                                verifiedTrees={verifiedTrees}
                            />
                        </section>

                        <section id="ascii-flow" className="mx-auto mt-4 grid max-w-[1540px] gap-5 rounded-[34px] bg-[#efefeb] p-5 sm:mt-5 sm:p-7 lg:grid-cols-[0.82fr_1.18fr]">
                            <div className="rounded-[26px] bg-brand-navy p-6 text-white sm:p-8">
                                <PhoneRepairEyebrow className="text-brand-yellow">How IdleForest works</PhoneRepairEyebrow>
                                <h2 className="mt-6 max-w-[520px] font-candu text-[3rem] font-black uppercase leading-none tracking-normal text-white sm:text-[4.2rem]">
                                    Choose the green option.
                                </h2>
                                <p className="mt-6 max-w-[520px] text-base font-medium leading-7 text-white/76">
                                    PhoneRepair.pt customers can make their repair go further. Choose IdleForest, install after checkout, and help grow PhoneRepair.pt&apos;s verified planting impact.
                                </p>
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

                        <section id="ascii-proof" className="mx-auto mt-8 grid max-w-[1540px] gap-8 rounded-[34px] bg-white p-5 shadow-[0_28px_80px_rgba(20,20,16,0.08)] sm:p-7 lg:grid-cols-[0.92fr_1.08fr]">
                            <div className="rounded-[26px] bg-brand-yellow p-6 text-brand-navy">
                                <p className="font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-brand-navy/70">Proof of planting</p>
                                <p className="mt-4 font-candu text-6xl font-black uppercase leading-none tracking-normal text-brand-navy">{formatNumber(verifiedTrees)}</p>
                                <p className="mt-4 max-w-[580px] text-base font-medium leading-7 text-brand-navy/80">
                                    IdleForest publishes planting records across {plantingCountries.length} countries. PhoneRepair.pt installs add to this public record as the partnership grows.
                                </p>
                            </div>
                            <div className="grid gap-4">
                                <div className="grid gap-4 md:grid-cols-3">
                                    {[
                                        [companyTreesLabel, formatNumber(companyTrees)],
                                        ['Members', formatNumber(memberCount)],
                                        ['Points', formatNumber(totalPoints)],
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
                                            className="grid items-center gap-4 py-5 transition-colors hover:text-emerald-700 sm:grid-cols-[82px_80px_1fr_170px_24px]"
                                        >
                                            <span className="relative block h-16 w-20 overflow-hidden rounded-[18px] bg-[#f2f2ef]">
                                                {record.image ? (
                                                    <Image
                                                        src={record.image}
                                                        alt={record.name}
                                                        fill
                                                        sizes="80px"
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </span>
                                            <span className="font-mono text-[0.68rem] font-black uppercase text-[#777]">{formatNumber(record.trees)}</span>
                                            <span className="font-candu text-2xl font-black uppercase leading-none tracking-normal">{record.name}</span>
                                            <span className="font-mono text-[0.58rem] font-black uppercase tracking-[0.16em] text-[#777]">{record.date}</span>
                                            <ArrowUpRight aria-hidden className="h-4 w-4" strokeWidth={3} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </section>

                        <section id="ascii-install" className="mx-auto mt-8 grid max-w-[1540px] gap-6 rounded-[34px] bg-brand-navy p-7 text-white sm:p-10 lg:grid-cols-[1fr_auto] lg:p-12">
                            <div>
                                <PhoneRepairEyebrow className="text-brand-yellow">How to install</PhoneRepairEyebrow>
                                <h2 className="mt-6 max-w-[720px] font-candu text-[2.7rem] font-black uppercase leading-none tracking-normal text-white sm:text-[4rem]">
                                    Follow the PhoneRepair.pt invite.
                                </h2>
                                <p className="mt-6 max-w-[620px] text-base font-medium leading-7 text-white/75">
                                    After choosing the green option, use the invite link to create an account and install IdleForest. The invite connects the app install to this partnership.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 self-center">
                                {isMember ? (
                                    <Link
                                        href={joinHref}
                                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-brand-navy transition-colors hover:bg-white hover:text-black"
                                    >
                                        Go to portal
                                        <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                                    </Link>
                                ) : isValidInvite ? (
                                    <Link
                                        href={joinHref}
                                        className="inline-flex min-h-12 items-center justify-center gap-3 rounded-full bg-brand-yellow px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-brand-navy transition-colors hover:bg-white hover:text-black"
                                    >
                                        Start install
                                        <ArrowRight aria-hidden className="h-3.5 w-3.5" strokeWidth={3} />
                                    </Link>
                                ) : null}
                                {companyWebsite ? (
                                    <a
                                        href={companyWebsite.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/25 px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-white transition-colors hover:border-white"
                                    >
                                        Book repair
                                    </a>
                                ) : null}
                            </div>
                        </section>
                    </main>

                    {isOwner && (
                        <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />
                    )}
                </div>
            )
        }

        return (
            <div className="min-h-screen bg-[#f7f2e8] text-[#050505] selection:bg-[#dfff2f] selection:text-black">
                {isValidInvite && invite && (
                    <script
                        dangerouslySetInnerHTML={{
                            __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`
                        }}
                    />
                )}

                <header className="border-b-2 border-black bg-white">
                    <div className="grid min-h-[82px] grid-cols-[112px_1fr_auto] items-stretch md:grid-cols-[150px_1fr_auto]">
                        <Link href={`/${params.locale}`} className="grid place-items-center border-r-2 border-black bg-[#dfff2f] px-4">
                            <div className="text-center font-candu text-xl font-black uppercase leading-[0.85] tracking-normal text-black md:text-2xl">
                                Idle<br />Forest
                            </div>
                        </Link>
                        <nav className="hidden items-center gap-9 px-8 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-black lg:flex">
                            <a href="#features" className="transition-colors hover:text-[#005ee8]">How it works</a>
                            <a href="#proof" className="transition-colors hover:text-[#005ee8]">Planting proof</a>
                            <a href="#install" className="transition-colors hover:text-[#005ee8]">Install</a>
                        </nav>
                        <div className="flex items-center border-l-2 border-black px-5 md:px-8 lg:border-l-0">
                            <PhoneRepairMark company={company} compact />
                        </div>
                        <div className="flex items-center gap-5 border-l-2 border-black px-4 md:px-6">
                            <Link
                                href={`/${params.locale}/auth/user/login`}
                                className="hidden font-mono text-[0.64rem] font-black uppercase tracking-[0.16em] text-black underline-offset-4 hover:underline sm:inline"
                            >
                                Log in
                            </Link>
                            {isMember ? (
                                <Link
                                    href={joinHref}
                                    className="border-2 border-black bg-[#19bde2] px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#dfff2f] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    Portal
                                </Link>
                            ) : isValidInvite ? (
                                <Link
                                    href={joinHref}
                                    className="border-2 border-black bg-[#dfff2f] px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#19bde2] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    Join
                                </Link>
                            ) : companyWebsite ? (
                                <a
                                    href={companyWebsite.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border-2 border-black bg-[#dfff2f] px-5 py-3 font-mono text-[0.6rem] font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#19bde2] focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-white"
                                >
                                    Visit
                                </a>
                            ) : null}
                        </div>
                    </div>
                </header>

                <main>
                    <section className="grid border-b-2 border-black lg:min-h-[640px] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                        <div className="flex flex-col justify-between bg-[#19bde2] px-5 py-12 sm:px-10 lg:px-16 lg:py-16">
                            <div>
                                <PhoneRepairEyebrow>{company.name} - green repair option</PhoneRepairEyebrow>
                                <PhoneRepairDisplayHeading
                                    as="h1"
                                    className="mt-8 max-w-[680px] text-[clamp(2.65rem,8vw,4.75rem)] lg:text-[clamp(3.6rem,4.2vw,4.7rem)]"
                                >
                                    Greener phone repairs.
                                </PhoneRepairDisplayHeading>
                                <p className="mt-8 max-w-[640px] text-base font-medium leading-7 text-black sm:text-lg sm:leading-8">
                                    PhoneRepair.pt is giving customers a simple green option: choose IdleForest when buying, install the app after checkout, and help fund verified tree planting.
                                </p>
                                <div className="mt-9 flex flex-wrap items-center gap-4">
                                    {isMember ? (
                                        <PhoneRepairButton href={joinHref}>Go to portal</PhoneRepairButton>
                                    ) : isValidInvite ? (
                                        <PhoneRepairButton href={joinHref}>Install IdleForest</PhoneRepairButton>
                                    ) : (
                                        <div className="max-w-md border-2 border-black bg-[#ffe368] px-4 py-3 text-sm font-black text-black">
                                            This partnership flow is invite-only. Open it from your {company.name} link to continue.
                                        </div>
                                    )}

                                    {companyWebsite ? (
                                        <a
                                            href={companyWebsite.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex min-h-12 items-center justify-center border-2 border-black bg-white px-6 py-3 font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#ffe368]"
                                        >
                                            Book repair
                                        </a>
                                    ) : null}
                                </div>
                            </div>
                            <div className="mt-14 grid border-2 border-black bg-white sm:grid-cols-3">
                                {[
                                    [companyTreesLabel, formatNumber(companyTrees)],
                                    ['Members', formatNumber(memberCount)],
                                    ['Points', formatNumber(totalPoints)],
                                ].map(([label, value]) => (
                                    <div key={label} className="border-b-2 border-black p-5 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:last:border-r-0">
                                        <p className="font-mono text-[0.58rem] font-black uppercase tracking-[0.18em] text-[#5f5f5f]">{label}</p>
                                        <p className="mt-3 font-candu text-4xl font-black uppercase leading-none tracking-normal text-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative min-h-[390px] overflow-hidden border-t-2 border-black bg-[#f7f2e8] lg:border-l-2 lg:border-t-0">
                            <Image
                                src="/partner/repair-bench.png"
                                alt="Phone repair workbench with a phone being repaired."
                                fill
                                priority
                                sizes="(min-width: 1024px) 52vw, 100vw"
                                className="object-cover object-center"
                            />
                            <div className="absolute bottom-0 left-0 right-0 grid border-t-2 border-black bg-white/95 sm:grid-cols-3">
                                {[
                                    ['Green option', 'At checkout'],
                                    ['Install', 'IdleForest app'],
                                    ['Proof', `${formatNumber(verifiedTrees)} recorded`],
                                ].map(([label, value]) => (
                                    <div key={label} className="border-b-2 border-black p-4 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:last:border-r-0">
                                        <p className="font-mono text-[0.54rem] font-black uppercase tracking-[0.18em] text-[#666]">{label}</p>
                                        <p className="mt-2 font-candu text-2xl font-black uppercase leading-none tracking-normal text-black">{value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="features" className="grid border-b-2 border-black bg-white lg:grid-cols-[0.86fr_1.14fr]">
                        <div className="border-b-2 border-black bg-[#ffe368] px-5 py-12 sm:px-10 lg:border-b-0 lg:border-r-2 lg:px-16 lg:py-16">
                            <PhoneRepairEyebrow>How it works</PhoneRepairEyebrow>
                            <PhoneRepairDisplayHeading className="mt-8 max-w-[480px] text-[3.1rem] sm:text-[4.2rem]">
                                Choose the green option at checkout.
                            </PhoneRepairDisplayHeading>
                            <p className="mt-8 max-w-[420px] text-base font-medium leading-7 text-black">
                                PhoneRepair.pt keeps the repair flow simple. Customers opt in while buying, then IdleForest handles the app install and planting record.
                            </p>
                            <div className="mt-8">
                                <PhoneRepairRatingBadge />
                            </div>
                        </div>
                        <div className="relative grid gap-8 px-5 py-12 sm:px-10 lg:grid-cols-[minmax(260px,450px)_1fr] lg:px-16 lg:py-16">
                            <PhoneRepairTicketHero
                                company={company}
                                invite={invite}
                                companyTrees={companyTrees}
                                companyTreesLabel={companyTreesLabel}
                            />
                            <div className="flex flex-col justify-between gap-8">
                                <div className="border-2 border-black bg-[#dfff2f] p-6 shadow-[8px_8px_0_#050505]">
                                    <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-black">Step 1</p>
                                    <p className="mt-4 font-candu text-4xl font-black uppercase leading-none tracking-normal text-black">Choose IdleForest.</p>
                                    <p className="mt-4 text-base font-medium leading-7 text-black">The customer selects the green option while buying a PhoneRepair.pt repair or service.</p>
                                </div>
                                <div className="border-2 border-black bg-[#ff5a36] p-6 text-white shadow-[8px_8px_0_#050505]">
                                    <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-white">Step 2</p>
                                    <p className="mt-4 font-candu text-4xl font-black uppercase leading-none tracking-normal text-white">Install the app.</p>
                                    <p className="mt-4 text-base font-medium leading-7 text-white">The invite flow connects the install to PhoneRepair.pt so the planting can be recorded.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="proof" className="border-b-2 border-black bg-white">
                        <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                            <div className="border-b-2 border-black px-5 py-14 sm:px-10 lg:border-b-0 lg:border-r-2 lg:px-16 lg:py-20">
                                <PhoneRepairEyebrow>Proof of planting</PhoneRepairEyebrow>
                                <PhoneRepairDisplayHeading className="mt-8 max-w-[660px] text-[3rem] sm:text-[4.1rem] lg:text-[4.7rem]">
                                    Real planting records, not just a promise.
                                </PhoneRepairDisplayHeading>
                                <p className="mt-8 max-w-[480px] text-base font-medium leading-7 text-black">
                                    IdleForest publishes planting activity across verified projects and partners. PhoneRepair.pt installs add to this public record as the partnership grows.
                                </p>
                            </div>

                            <div className="bg-[#f7f2e8]">
                                <div className="grid border-b-2 border-black bg-white sm:grid-cols-3">
                                    {[
                                        ['Verified trees', formatNumber(verifiedTrees)],
                                        ['Projects', formatNumber(plantingProjects.length)],
                                        ['Countries', formatNumber(plantingCountries.length)],
                                    ].map(([label, value]) => (
                                        <div key={label} className="border-b-2 border-black p-5 last:border-b-0 sm:border-b-0 sm:border-r-2 sm:last:border-r-0">
                                            <p className="font-mono text-[0.56rem] font-black uppercase tracking-[0.18em] text-[#666]">{label}</p>
                                            <p className="mt-3 font-candu text-4xl font-black uppercase leading-none tracking-normal text-black">{value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="divide-y-2 divide-black">
                                    {projectRows.map((record) => (
                                        <a
                                            key={record.id}
                                            href={record.href}
                                            target={record.href.startsWith('http') ? '_blank' : undefined}
                                            rel={record.href.startsWith('http') ? 'noreferrer' : undefined}
                                            className="grid items-center gap-4 px-5 py-7 transition-colors hover:bg-[#dfff2f] sm:grid-cols-[112px_86px_1fr_220px_100px_24px] sm:px-8"
                                        >
                                            <span className="relative block h-20 w-28 overflow-hidden border-2 border-black bg-white">
                                                {record.image ? (
                                                    <Image
                                                        src={record.image}
                                                        alt={record.name}
                                                        fill
                                                        sizes="112px"
                                                        className="object-cover"
                                                    />
                                                ) : null}
                                            </span>
                                            <span className="w-fit border-2 border-black bg-[#19bde2] px-2 py-1 font-mono text-[0.68rem] font-black text-black">
                                                {formatNumber(record.trees)}
                                            </span>
                                            <span className="font-candu text-2xl font-black uppercase leading-none tracking-normal text-black sm:text-3xl">
                                                {record.name}
                                            </span>
                                            <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-black">
                                                {record.meta}
                                            </span>
                                            <span className="font-mono text-[0.6rem] font-black uppercase tracking-[0.16em] text-black">
                                                {record.date}
                                            </span>
                                            <ArrowUpRight aria-hidden className="h-4 w-4 text-black" strokeWidth={3} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="install" className="grid border-b-2 border-black bg-[#005ee8] text-white lg:grid-cols-[1fr_480px]">
                        <div className="flex flex-col justify-center px-5 py-16 sm:px-10 lg:px-16 lg:py-24">
                            <PhoneRepairEyebrow className="text-white">How to install</PhoneRepairEyebrow>
                            <PhoneRepairDisplayHeading className="mt-8 max-w-[760px] text-[3.3rem] !text-white sm:text-[4.7rem] lg:text-[5.25rem]">
                                Follow the PhoneRepair.pt invite.
                            </PhoneRepairDisplayHeading>
                            <p className="mt-8 max-w-[620px] text-base font-medium leading-7 text-white">
                                After choosing the green option, use the PhoneRepair.pt invite link to create an account and install IdleForest. The invite connects the app install to this partnership.
                            </p>
                            <div className="mt-10 flex flex-wrap gap-4">
                                {isMember ? (
                                    <PhoneRepairButton href={joinHref}>Go to welcome flow</PhoneRepairButton>
                                ) : isValidInvite ? (
                                    <PhoneRepairButton href={joinHref}>Start install</PhoneRepairButton>
                                ) : null}
                                <PhoneRepairButton href="/report" variant="secondary">
                                    View planting report
                                </PhoneRepairButton>
                            </div>
                        </div>

                        <div className="grid min-h-[360px] border-t-2 border-black bg-[#dfff2f] p-5 lg:border-l-2 lg:border-t-0 lg:p-8">
                            <div className="self-center border-2 border-black bg-white p-6 text-black shadow-[10px_10px_0_#050505]">
                                <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-black">Invite code</p>
                                <p className="mt-5 break-words font-candu text-5xl font-black uppercase leading-none tracking-normal text-black">
                                    {invite || company.invite_code || 'Required'}
                                </p>
                                <p className="mt-6 text-base font-medium leading-7 text-black">
                                    Use this code through the PhoneRepair.pt invite link so the install can be tied to the green repair option.
                                </p>
                            </div>
                        </div>
                    </section>
                </main>

                <footer className="bg-white">
                    <div className="flex flex-col gap-6 px-5 py-10 sm:px-10 md:flex-row md:items-center md:justify-between lg:px-16">
                        <div className="flex items-center gap-8">
                            <PhoneRepairMark company={company} compact />
                            <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.28em] text-black">x</span>
                            <span className="font-candu text-sm font-black uppercase tracking-normal text-black">IdleForest</span>
                        </div>
                        <span className="font-mono text-[0.62rem] font-black uppercase tracking-[0.24em] text-black">
                            Partnership page
                        </span>
                    </div>
                </footer>

                {isOwner && (
                    <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F7F8F2] font-sans text-brand-navy selection:bg-brand-yellow selection:text-black">
            <Navigation hideBanner />

            {isValidInvite && invite && (
                <script
                    dangerouslySetInnerHTML={{
                        __html: `document.cookie = "company_invite=${invite}; path=/; max-age=604800; samesite=lax";`
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
                                    <img
                                        src={company.logo_url}
                                        alt={company.name}
                                        className="h-16 w-16 rounded-lg border border-black/10 bg-white object-cover shadow-sm"
                                    />
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

                            <h1 className="max-w-3xl font-candu text-5xl font-extrabold leading-[0.95] tracking-normal text-brand-navy sm:text-6xl lg:text-7xl">
                                Turn everyday work into real trees.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-neutral-700">
                                {company.description || `${company.name} is using IdleForest to convert idle bandwidth into verified reforestation impact. Join the company forest and help grow the number together.`}
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
                                            {donatedTrees > 0
                                                ? 'Pulled from this company donation history.'
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
                                            IdleForest has {formatNumber(verifiedTrees)} recorded trees across {plantingCountries.length} countries. Latest recorded planting: {latestPlantingDate ? new Date(latestPlantingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'coming soon'}.
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
                                <h2 className="mt-3 font-candu text-4xl font-extrabold leading-tight text-brand-navy sm:text-5xl">
                                    Where trees are planted
                                </h2>
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
                                                <Image
                                                    src={image}
                                                    alt={planting.project.name}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(min-width: 1024px) 33vw, 100vw"
                                                />
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
                                <p className="mt-3 text-sm leading-6 text-neutral-700">
                                    Members do not donate or change their workflow. Idle bandwidth funds the planting.
                                </p>
                            </div>
                            <div className="rounded-lg border border-black/10 bg-[#F7F8F2] p-6">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-white text-sky-700 shadow-sm">
                                    <ShieldCheck className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-brand-navy">Privacy first</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-700">
                                    IdleForest does not read browsing history, personal files, messages, or private data.
                                </p>
                            </div>
                            <div className="rounded-lg border border-black/10 bg-[#F7F8F2] p-6">
                                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-white text-amber-700 shadow-sm">
                                    <ZapOff className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-extrabold text-brand-navy">Runs quietly</h3>
                                <p className="mt-3 text-sm leading-6 text-neutral-700">
                                    The app pauses when the connection is needed and stays out of the way during work.
                                </p>
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
                                    <video
                                        src={company.video_url}
                                        controls
                                        className="h-full w-full object-cover"
                                    />
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
                                        <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-md bg-brand-yellow font-candu text-xl font-extrabold text-brand-navy">
                                            {step}
                                        </div>
                                        <h3 className="text-2xl font-extrabold">{title}</h3>
                                        <p className="mt-3 text-sm leading-6 text-white/70">{description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {isOwner && (
                <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />
            )}
        </div>
    )
}
