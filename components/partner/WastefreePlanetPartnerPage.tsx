import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, ExternalLink } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'
import FishScrollReveal from '@/app/[locale]/c/[slug]/FishScrollReveal'
import WastefreeSetupCta from '@/components/partner/WastefreeSetupCta'
import { CleanupArt, CommunityArt, FundingArt } from '@/components/partner/WastefreeArt'
import { InstallArt, JoinArt, RunArt } from '@/components/partner/MossyEarthArt'

const images = {
    idleForestLogo: '/logo.png',
    logo: '/partner/wastefree/wfp-logo-white.webp',
    heroCoast: '/partner/wastefree/hero-coast.jpg',
    heroVideo: '/partner/wastefree/hero-ocean.mp4',
    oceanTexture: '/partner/wastefree/ocean-texture.jpg',
    certificate: '/partner/wastefree/certificates/plastic-bank-2026-09-13.jpg',
}

const roles = [
    { art: CommunityArt, label: 'Community', title: 'Waste Free Planet', verb: 'gathers.', meta: 'Global community', body: 'People who care about everyday waste, in one shared cleanup effort.' },
    { art: FundingArt, label: 'Funding', title: 'IdleForest', verb: 'funds.', meta: 'Mac · Windows · Linux', body: 'The free desktop app turns background tasks into funding for the clean-ocean fund.' },
    { art: CleanupArt, label: 'Cleanup', title: 'Plastic Bank', verb: 'collects.', meta: 'Indonesia · Philippines · Brazil · Egypt', body: 'Funds flow through 1ClickImpact to collectors who intercept plastic before it reaches the sea.' },
]

const steps = [
    { art: JoinArt, title: 'Join', body: 'Connect your IdleForest account to the clean-ocean fund.' },
    { art: InstallArt, title: 'Install once', body: 'Get the free desktop app for Windows, Mac or Linux and log in. On your phone? Email yourself a setup link.' },
    { art: RunArt, title: 'Let it run', body: 'It works quietly in the background. Pause anytime.' },
    { art: CleanupArt, title: 'Fund cleanup', body: 'Handled tasks become funding for Plastic Bank collectors, via 1ClickImpact.' },
]

const proofStats = [
    { value: '91%', label: "of plastic isn't recycled", body: 'Most ends up in landfills, incinerators or nature.' },
    { value: '11M', label: 'tons reach the ocean a year', body: 'About one garbage truck of plastic every minute.' },
    { value: '0¢', label: 'cost to take part', body: 'Install once, then idle bandwidth does the work.' },
]

const collectors = [
    { src: '/partner/wastefree/plastic-bank-bali-haris.webp', place: 'Indonesia', alt: 'A Plastic Bank collection member in Bali, Indonesia.' },
    { src: '/partner/wastefree/plastic-bank-manila-elizabeth.webp', place: 'Philippines', alt: 'A Plastic Bank collection member in Manila, Philippines.' },
    { src: '/partner/wastefree/plastic-bank-rio-vanessa-marcio.webp', place: 'Brazil', alt: 'Plastic Bank collection members in Rio, Brazil.' },
    { src: '/partner/wastefree/plastic-bank-egypt-mabrooka.webp', place: 'Egypt', alt: 'A Plastic Bank collection member in Egypt.' },
]

const groundBullets = ['Verified ethical recovery network', 'Traceable Social Plastic receipts', 'Income paid above local market rates']

type CompanyWebsite = { url: string; hostname?: string } | null

type WastefreePlanetPartnerPageProps = {
    company: any
    params: { slug: string; locale: string }
    invite?: string
    isMember: boolean
    isValidInvite: boolean
    isOwner: boolean
    memberCount: number
    totalPoints: number
    fundingRaised: string
    plasticPounds: string
    bottleEquivalents: string
    members: string
    companyWebsite: CompanyWebsite
}

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95'

export default function WastefreePlanetPartnerPage({
    company,
    params,
    invite,
    isMember,
    isValidInvite,
    isOwner,
    memberCount,
    totalPoints,
    fundingRaised,
    plasticPounds,
    bottleEquivalents,
    members,
    companyWebsite,
}: WastefreePlanetPartnerPageProps) {
    const joinHref = isMember ? `/${params.locale}/portal/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const canJoin = isValidInvite || isMember
    const stats = [
        { value: fundingRaised, label: 'clean-ocean fund' },
        { value: plasticPounds, label: 'cleanup capacity' },
        { value: members, label: 'members supporting cleanup' },
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

            <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur-md" aria-label={`${company.name} clean-ocean page`}>
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="#top" className="flex items-center gap-3" aria-label={`${company.name} page top`}>
                        <Image src={images.idleForestLogo} alt="IdleForest" width={121} height={33} priority className="h-auto w-[96px]" />
                        <span className="text-sm font-bold text-neutral-400" aria-hidden>&times;</span>
                        <Image src={images.logo} alt="Waste Free Planet" width={120} height={72} className="h-8 w-auto brightness-0" />
                    </a>
                    {canJoin ? (
                        <Link href={joinHref} className={`${primaryButton} !px-5 !py-2.5`}>
                            {isMember ? 'Open portal' : 'Join for free'}
                        </Link>
                    ) : null}
                </div>
            </header>

            <main id="top" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
                {/* Hero with the scroll-driven fish morph */}
                <section className="relative overflow-hidden rounded-3xl bg-[#0B2733] text-white">
                    <video className="absolute inset-0 h-full w-full object-cover opacity-60" autoPlay muted loop playsInline preload="auto" poster={images.heroCoast} aria-hidden="true">
                        <source src={images.heroVideo} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0B2733] via-[#0B2733]/70 to-[#0B2733]/20" aria-hidden />
                    <div className="relative grid items-center gap-6 p-6 sm:p-10 lg:grid-cols-[1fr_1fr] lg:gap-8 lg:p-14">
                        <div>
                            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/90 ring-1 ring-white/20 backdrop-blur">
                                <span className="h-2 w-2 rounded-full bg-brand-yellow" aria-hidden />
                                The partnership
                            </p>
                            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                                <span className="text-brand-yellow">{bottleEquivalents}</span> bottle equivalents funded, and counting.
                            </h1>
                            <p className="mt-5 max-w-lg text-lg leading-7 text-white/80">
                                Install IdleForest for free and join Waste Free Planet. Your idle bandwidth funds Plastic Bank ocean-bound plastic removal. <strong className="text-white">100% of profits go to plastic removal.</strong>
                            </p>
                            <div className="mt-7 flex flex-wrap items-start gap-4">
                                {isMember ? (
                                    <Link href={joinHref} className={primaryButton}>
                                        Open portal
                                    </Link>
                                ) : isValidInvite ? (
                                    <WastefreeSetupCta href={joinHref} />
                                ) : null}
                                {companyWebsite ? (
                                    <a href={companyWebsite.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                        Visit Waste Free Planet
                                        <ExternalLink className="h-4 w-4" aria-hidden />
                                    </a>
                                ) : null}
                            </div>
                            <p className="mt-4 text-xs text-white/60">No payment. Install once, pause anytime.</p>
                        </div>
                        <FishScrollReveal />
                    </div>
                </section>

                {/* Stats */}
                <dl className="grid gap-3 sm:grid-cols-3" aria-label="Waste Free Planet cleanup progress">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <dd className="text-3xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                            <dt className="mt-1 text-sm text-neutral-500">{stat.label}</dt>
                        </div>
                    ))}
                </dl>

                {/* Certificate */}
                <section id="cleanup-certificate" className="grid items-center gap-6 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10" aria-labelledby="cleanup-certificate-title">
                    <div>
                        <p className="text-sm font-semibold text-neutral-500">Cleanup certificate &middot; September 13, 2026</p>
                        <h2 id="cleanup-certificate-title" className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                            5,750 bottle equivalents.{' '}
                            <span className="bg-[linear-gradient(transparent_62%,#E0F146_62%)]">Funding certified.</span>
                        </h2>
                        <p className="mt-4 text-neutral-600">
                            IdleForest donated <strong className="text-brand-navy">€115</strong> to fund plastic recovery. Plastic Bank&apos;s certificate confirms that Idleforest Unipessoal Lda funded the gathering of <strong className="text-brand-navy">115 kg of plastic</strong>, equal to <strong className="text-brand-navy">5,750 bottles</strong>.
                        </p>
                        <a href={images.certificate} target="_blank" rel="noopener noreferrer" className={`${primaryButton} mt-6`}>
                            View full-size certificate
                            <ArrowUpRight className="h-4 w-4" aria-hidden />
                        </a>
                        <p className="mt-3 text-xs text-neutral-500">Issued by Plastic Bank &middot; Certificate IR-2026-09-U7PHTE</p>
                    </div>
                    <a href={images.certificate} target="_blank" rel="noopener noreferrer" aria-label="Open Plastic Bank certificate for 5,750 bottle equivalents in full size">
                        <Image
                            src={images.certificate}
                            alt="Plastic Bank certificate issued September 13, 2026 to Idleforest Unipessoal Lda for funding the gathering of 115 kg of plastic, equivalent to 5,750 bottles. Certificate IR-2026-09-U7PHTE."
                            width={2400}
                            height={1612}
                            sizes="(min-width: 1024px) 560px, 100vw"
                            className="h-auto w-full rounded-2xl border border-neutral-200 shadow-sm"
                        />
                    </a>
                </section>

                {/* Three roles */}
                <section id="wastefree-partnership" aria-labelledby="roles-heading">
                    <h2 id="roles-heading" className="text-xl font-extrabold tracking-tight">One cleanup fund, three clear roles</h2>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                        {roles.map(({ art: Art, label, title, verb, meta, body }) => (
                            <article key={title} className="flex flex-col rounded-3xl border border-neutral-200 bg-white p-6">
                                <Art className="h-24 w-24" />
                                <p className="mt-4 text-sm font-semibold text-neutral-500">{label}</p>
                                <h3 className="mt-1 text-2xl font-extrabold tracking-tight">
                                    {title} <span className="text-[#347D67]">{verb}</span>
                                </h3>
                                <p className="mt-2 text-neutral-600">{body}</p>
                                <p className="mt-auto inline-flex w-fit rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 [margin-top:1.25rem]">{meta}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section id="wastefree-how" className="overflow-hidden rounded-3xl bg-[#0E3B4C] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="how-heading">
                    <h2 id="how-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Four steps. No payment.</h2>
                    <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step) => (
                            <li key={step.title} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                                <step.art className="h-24 w-24" />
                                <p className="mt-4 text-lg font-extrabold">{step.title}</p>
                                <p className="mt-1 text-sm text-white/75">{step.body}</p>
                            </li>
                        ))}
                    </ol>
                    <div id="wastefree-impact" className="mt-6 grid gap-3 sm:grid-cols-3" aria-label="Plastic impact context">
                        {proofStats.map((stat) => (
                            <article key={stat.label} className="rounded-3xl border border-white/15 p-6">
                                <p className="text-4xl font-extrabold tabular-nums tracking-tight text-brand-yellow">{stat.value}</p>
                                <p className="mt-1 font-bold">{stat.label}</p>
                                <p className="mt-1 text-sm text-white/70">{stat.body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* On the ground */}
                <section aria-labelledby="ground-heading" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <h2 id="ground-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                                Real collectors. <span className="bg-[linear-gradient(transparent_62%,#E0F146_62%)]">Real coastlines.</span>
                            </h2>
                            <p className="mt-2 max-w-xl text-neutral-600">
                                The fund flows to Plastic Bank collection members, turning ocean-bound plastic into income, healthcare and school tuition for their families.
                            </p>
                        </div>
                        <ul className="flex flex-wrap gap-2">
                            {groundBullets.map((bullet) => (
                                <li key={bullet} className="rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-700">{bullet}</li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                        {collectors.map((item) => (
                            <figure key={item.place} className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-100">
                                <Image src={item.src} alt={item.alt} fill sizes="(min-width: 1024px) 260px, 50vw" className="object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" aria-hidden />
                                <figcaption className="absolute bottom-3 left-3 text-sm font-bold text-white">Plastic Bank &middot; {item.place}</figcaption>
                            </figure>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section id="wastefree-join" className="relative overflow-hidden rounded-3xl bg-[#0B2733]">
                    <Image src={images.oceanTexture} alt="" fill sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover opacity-50" />
                    <div className="relative px-6 py-14 text-center text-white sm:py-20">
                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                            Less waste at home. <span className="text-brand-yellow">Less plastic at sea.</span>
                        </h2>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            {isMember ? (
                                <Link href={joinHref} className={primaryButton}>
                                    Open portal
                                </Link>
                            ) : isValidInvite ? (
                                <Link href={joinHref} className={primaryButton}>
                                    Start removing plastic
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            ) : null}
                            {companyWebsite ? (
                                <a href={companyWebsite.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                    Visit Waste Free Planet
                                    <ExternalLink className="h-4 w-4" aria-hidden />
                                </a>
                            ) : null}
                        </div>
                        <p className="mt-4 text-xs text-white/60">Free install. 100% of profits go to plastic removal.</p>
                    </div>
                </section>
            </main>

            <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-neutral-500 sm:px-6">
                <p>© 2026 IdleForest · Waste Free Planet partnership · Powered by 1ClickImpact &amp; Plastic Bank</p>
            </footer>

            {isOwner && <CompanySettingsPanel company={company} memberCount={memberCount} totalPoints={totalPoints} />}
        </div>
    )
}
