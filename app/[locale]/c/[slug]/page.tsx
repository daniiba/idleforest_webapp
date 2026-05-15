import { createClient } from '@/lib/supabase/server'
import { aggregateProjects, plantingsData } from '@/lib/plantings'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
    ArrowRight,
    BadgeCheck,
    CheckCircle,
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

export const dynamic = 'force-dynamic'

const numberFormatter = new Intl.NumberFormat('en-US')

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

export default async function CompanyPortalPage({
    params,
    searchParams
}: {
    params: { slug: string; locale: string }
    searchParams: { invite?: string }
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
