import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Info, Leaf } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'
import { ForestArt, TechArt, VillageArt } from '@/components/partner/SilveiraArt'
import { InstallArt, JoinArt, RunArt } from '@/components/partner/MossyEarthArt'

const silveiraImages = {
    idleForestLogo: '/logo.png',
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

const pillars = [
    { art: VillageArt, title: 'Village regeneration', body: 'Rebuilding abandoned schist villages in the mountains of central Portugal.' },
    { art: ForestArt, title: 'Ecological restoration', body: 'Growing native forests and restoring biodiversity, designing with water and terrain.' },
    { art: TechArt, title: 'Tech for good', body: 'Using data, AI and smart tools to speed up regeneration, not replace nature.' },
]

const journey = [
    { title: 'The dream begins', body: 'Old stone paths and room for a different future.', image: silveiraImages.journeyOne },
    { title: 'Regenerative masterplan', body: 'Ecology, architecture, water and community, designed as one.', image: silveiraImages.journeyThree },
    { title: 'Village in progress', body: 'Hands-on restoration turns the plan into shared infrastructure.', image: silveiraImages.journeyFive },
]

const fundedProjects = [
    { label: 'Reforestation', title: 'Native forest recovery', body: 'Native planting, land restoration and long-term ecological care.', image: silveiraImages.future },
    { label: 'Built heritage', title: 'Village regeneration', body: 'Turning abandoned infrastructure into a living base for community and learning.', image: silveiraImages.journeyFive },
    { label: 'Landscape systems', title: 'Water and biodiversity', body: 'Practical land systems that improve resilience and bring native life back.', image: silveiraImages.grid },
]

const steps = [
    { art: JoinArt, title: 'Join', body: 'Connect your account to the Silveira forest. No invite or donation needed.' },
    { art: InstallArt, title: 'Install', body: 'Get the desktop app, log in, and leave it running.' },
    { art: RunArt, title: 'Let it run', body: 'Eligible background tasks fund the work. It backs off when you need your connection.' },
]

type CompanyWebsite = { url: string; hostname?: string } | null

type SilveiraPartnerPageProps = {
    company: any
    params: { slug: string; locale: string }
    invite?: string
    isMember: boolean
    isValidInvite: boolean
    isOwner: boolean
    memberCount: number
    totalPoints: number
    fundingRaised: string
    companyWebsite: CompanyWebsite
}

const primaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3 text-sm font-bold text-brand-navy transition hover:brightness-95'
const secondaryButton =
    'inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-brand-navy transition hover:bg-neutral-100'

export default function SilveiraPartnerPage({
    company,
    params,
    invite,
    isMember,
    isValidInvite,
    isOwner,
    memberCount,
    totalPoints,
    fundingRaised,
    companyWebsite,
}: SilveiraPartnerPageProps) {
    const joinHref = isMember ? `/${params.locale}/portal/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const primaryCta = isMember ? 'Go to your forest' : 'Join the forest'
    const canJoin = isValidInvite || isMember
    const members = new Intl.NumberFormat(params.locale).format(Math.max(0, memberCount))
    const stats = [
        { value: '230', label: 'hectares in regeneration' },
        { value: fundingRaised, label: 'raised so far' },
        { value: members, label: 'people in this forest' },
        { value: '100%', label: 'goes to Silveira Tech' },
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

            <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/85 backdrop-blur-md" aria-label="Silveira Tech support page">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    <a href="#top" className="flex items-center gap-2.5" aria-label={`${company.name} page top`}>
                        <span className="relative h-8 w-8 shrink-0" aria-hidden>
                            <Image src={silveiraImages.logo} alt="" fill sizes="32px" className="object-contain" />
                        </span>
                        <span className="text-base font-extrabold tracking-tight">{company.name}</span>
                    </a>
                    {canJoin ? (
                        <Link href={joinHref} className={`${primaryButton} !px-5 !py-2.5`}>
                            {primaryCta}
                            <Leaf className="h-4 w-4" aria-hidden />
                        </Link>
                    ) : (
                        <span className="text-sm text-neutral-500">Public forest open by invite</span>
                    )}
                </div>
            </header>

            <main id="top" className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
                {/* Hero */}
                <section className="relative pb-2">
                    <div className="relative h-[380px] overflow-hidden rounded-3xl bg-brand-navy sm:h-[500px]">
                        <Image src={silveiraImages.hero} alt="" fill priority sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover" />
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
                        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" aria-hidden />

                        <div className="absolute left-4 top-4 flex items-center gap-3 rounded-full bg-white/95 py-2 pl-4 pr-3 shadow-sm backdrop-blur sm:left-6 sm:top-6">
                            <Image src={silveiraImages.idleForestLogo} alt="IdleForest" width={121} height={33} className="h-auto w-[88px]" />
                            <span className="text-sm font-bold text-neutral-400" aria-hidden>&times;</span>
                            <span className="relative h-7 w-7">
                                <Image src={silveiraImages.logo} alt="Silveira Tech" fill sizes="28px" className="object-contain" />
                            </span>
                        </div>

                        <span className="absolute left-4 top-[72px] inline-flex items-center gap-2 rounded-full bg-white/95 px-3.5 py-1.5 text-sm font-bold shadow-sm backdrop-blur sm:left-auto sm:right-6 sm:top-6">
                            <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
                            Serra da Lousa, Portugal
                        </span>
                    </div>

                    <div className="relative z-10 -mt-16 grid gap-6 rounded-3xl border border-neutral-200 bg-white p-6 shadow-xl sm:mx-8 sm:p-8 lg:-mt-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:gap-10">
                        <div>
                            <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
                                Support Silveira Tech{' '}
                                <span className="bg-[linear-gradient(transparent_62%,#E0F146_62%)]">for free.</span>
                            </h1>
                            <p className="mt-3 max-w-lg text-lg leading-7 text-neutral-600">
                                Help rebuild mountain villages and regenerate 230 hectares. Install IdleForest and let it run.
                            </p>
                        </div>
                        <div>
                            <div className="flex flex-wrap gap-3">
                                {canJoin ? (
                                    <Link href={joinHref} className={primaryButton}>
                                        {isMember ? 'Go to your Silveira forest' : 'Join Silveira forest'}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                ) : null}
                                {companyWebsite ? (
                                    <a href={companyWebsite.url} target="_blank" rel="noreferrer" className={secondaryButton}>
                                        Visit Silveira Tech
                                        <ExternalLink className="h-4 w-4" aria-hidden />
                                    </a>
                                ) : null}
                            </div>
                            {!canJoin && (
                                <p className="mt-4 flex items-start gap-2 text-xs text-neutral-500">
                                    <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                                    Join link opens when an invite is active.
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Stats */}
                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Silveira project facts">
                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <dd className="text-3xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                            <dt className="mt-1 text-sm text-neutral-500">{stat.label}</dt>
                        </div>
                    ))}
                </dl>

                {/* Story */}
                <section id="story" className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                    <article className="relative min-h-[320px] overflow-hidden rounded-3xl bg-brand-navy">
                        <Image src={silveiraImages.future} alt="Silveira Tech forest and village terrain" fill sizes="(min-width: 1024px) 480px, 100vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" aria-hidden />
                        <p className="absolute inset-x-6 bottom-6 text-xl font-extrabold leading-tight tracking-tight text-white sm:text-2xl">
                            A working village for people, land and practical technology.
                        </p>
                    </article>
                    <article className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                        <h2 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
                            Not a retreat from the modern world. A{' '}
                            <span className="bg-[linear-gradient(transparent_62%,#E0F146_62%)]">reworking</span> of it.
                        </h2>
                        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                            {pillars.map(({ art: Art, title, body }) => (
                                <li key={title}>
                                    <Art className="h-20 w-20" />
                                    <p className="mt-3 font-extrabold leading-tight">{title}</p>
                                    <p className="mt-1 text-sm text-neutral-600">{body}</p>
                                </li>
                            ))}
                        </ul>
                    </article>
                </section>

                {/* Journey */}
                <section aria-labelledby="journey-heading">
                    <h2 id="journey-heading" className="text-xl font-extrabold tracking-tight">Building the village, step by step</h2>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                        {journey.map((item) => (
                            <article key={item.title} className="group relative aspect-[4/3] overflow-hidden rounded-3xl bg-brand-navy md:aspect-[4/5]">
                                <Image src={item.image} alt={item.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" aria-hidden />
                                <div className="absolute inset-x-5 bottom-5 text-white">
                                    <h3 className="text-lg font-extrabold leading-tight">{item.title}</h3>
                                    <p className="mt-1 text-sm text-white/80">{item.body}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Where the support goes */}
                <section aria-labelledby="funded-heading" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                    <h2 id="funded-heading" className="text-xl font-extrabold tracking-tight">Your activity supports Silveira directly</h2>
                    <p className="mt-1 text-sm text-neutral-600">Funds from this forest go to Silveira Tech&apos;s own regeneration work, not IdleForest&apos;s general planting.</p>
                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                        {fundedProjects.map((project) => (
                            <article key={project.title} className="overflow-hidden rounded-2xl border border-neutral-200">
                                <div className="relative aspect-[16/10] bg-neutral-100">
                                    <Image src={project.image} alt={project.title} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
                                </div>
                                <div className="p-4">
                                    <p className="inline-flex rounded-full bg-[#ECE4D6] px-2.5 py-0.5 text-xs font-semibold text-[#675233]">{project.label}</p>
                                    <h3 className="mt-2 font-extrabold leading-tight">{project.title}</h3>
                                    <p className="mt-1 text-sm text-neutral-600">{project.body}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* How it works */}
                <section className="overflow-hidden rounded-3xl bg-[#1E3A2B] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="how-heading">
                    <div className="grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-white/10">
                            <Image src={silveiraImages.installOnce} alt="IdleForest app dashboard showing forest impact and activity" fill sizes="(min-width: 1024px) 460px, 100vw" className="object-contain p-3" />
                        </div>
                        <div>
                            <h2 id="how-heading" className="text-3xl font-extrabold tracking-tight sm:text-4xl">Install once. Let it run quietly.</h2>
                            <ol className="mt-6 grid gap-3">
                                {steps.map((step) => (
                                    <li key={step.title} className="flex items-center gap-4 rounded-2xl bg-white/10 p-4">
                                        <step.art className="h-16 w-16 shrink-0" />
                                        <div>
                                            <p className="font-extrabold">{step.title}</p>
                                            <p className="mt-0.5 text-sm text-white/75">{step.body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="relative overflow-hidden rounded-3xl bg-brand-navy">
                    <Image src={silveiraImages.footer} alt="" fill sizes="(min-width: 1152px) 1120px, 100vw" className="object-cover" />
                    <div className="absolute inset-0 bg-black/55" aria-hidden />
                    <div className="relative px-6 py-14 text-center text-white sm:py-20">
                        <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                            Recharging humanity can start on your desktop.
                        </h2>
                        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                            {canJoin ? (
                                <Link href={joinHref} className={primaryButton}>
                                    {isMember ? 'Go to your Silveira forest' : 'Support Silveira'}
                                    <ArrowRight className="h-4 w-4" aria-hidden />
                                </Link>
                            ) : null}
                            {companyWebsite ? (
                                <a href={companyWebsite.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10">
                                    SilveiraTech.pt
                                    <ExternalLink className="h-4 w-4" aria-hidden />
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
