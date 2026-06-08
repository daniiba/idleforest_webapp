import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Leaf } from 'lucide-react'
import CompanySettingsPanel from '@/app/[locale]/c/[slug]/CompanySettingsPanel'

const mossyEarthAssets = {
    logoMark: '/partner/mossy-earth/logo-mark.svg',
    heroVideo: '/partner/mossy-earth/hero-video.mp4',
    wetland: '/partner/mossy-earth/wetland-field.png',
    portrait: '/partner/mossy-earth/planting-portrait.png',
}

const mossyEarthWebsite = {
    url: 'https://www.mossy.earth/',
    hostname: 'mossy.earth',
}

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
    const joinHref = isMember ? `/${params.locale}/welcome/c/${company.slug}` : `/${params.locale}/join/company/${company.slug}`
    const primaryCta = isMember ? 'Open your forest' : 'Install IdleForest'
    const website = companyWebsite ?? mossyEarthWebsite
    const impactStats = [
        { label: 'Community Members', value: formatNumber(memberCount, params.locale) },
        { label: 'Tasks Handled', value: formatNumber(totalPoints, params.locale) },
        { label: 'Raised for Mossy Earth', value: formatFunding(company, totalPoints, params.locale) },
    ]
    const steps = [
        {
            number: '1.',
            title: 'Join through this page',
            body: 'Supporters connect their IdleForest account to the Mossy Earth forest. No invite or donation is required.',
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

            <header className="mossy-earth-nav" aria-label="Mossy Earth navigation">
                <a href="#mossy-earth-top" className="mossy-earth-brand" aria-label="Mossy Earth page top">
                    <span className="mossy-earth-wordmark">Mossy</span>
                    <span className="mossy-earth-mark" aria-hidden>
                        <Image src={mossyEarthAssets.logoMark} alt="" width={58} height={58} priority />
                    </span>
                    <span className="mossy-earth-wordmark">Earth</span>
                </a>
                <nav className="mossy-earth-nav-links" aria-label="Page sections">
                    <a href="#mossy-earth-story">Story</a>
                    <a href="#mossy-earth-impact">Impact</a>
                </nav>
                {isValidInvite || isMember ? (
                    <Link href={joinHref} className="mossy-earth-pill mossy-earth-pill-solid">
                        Join the forest
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
                        <p className="mossy-earth-kicker">IdleForest x Mossy Earth</p>
                        <h1>
                            Support Mossy Earth <span>for free.</span>
                        </h1>
                        <p>
                            Install IdleForest in under 30 seconds, then it runs automatically in the background to generate funding for Mossy Earth&apos;s rewilding projects. Your browsing, calls,
                            streaming, and downloads always stay first.
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

                <section className="mossy-earth-stat-band" id="mossy-earth-impact" aria-label="Mossy Earth impact metrics">
                    <div>
                        {impactStats.map((stat) => (
                            <article key={stat.label}>
                                <p>{stat.label}</p>
                                <strong>{stat.value}</strong>
                            </article>
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
                                <span>The cause</span>
                            </h3>
                            <p>
                                Mossy Earth is a team of outdoor enthusiasts and conservation biologists running nature restoration projects in Scotland, Portugal, Ecuador, and Indonesia. They
                                reintroduce lost species, control invasive species, restore degraded habitats, and work on ecosystems that most conservation funding ignores. They are bootstrapped, take
                                no outside investment, and publish every expense publicly.
                            </p>
                            <p>
                                Their core funding comes from paid memberships. Installing IdleForest is a great additional way to support Mossy Earth, and a helpful option for people who want to
                                contribute but cannot become paid members right now.
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
                                while it runs. Most active desktop installs contribute around $2-$5 per month, depending on where you are located, how often the app is online, and how much spare
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

                <section className="mossy-earth-field-image" aria-label="Mossy Earth field work">
                    <Image src={mossyEarthAssets.wetland} alt="A conservation worker walking through flooded woodland" fill sizes="100vw" className="mossy-earth-image-cover" />
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
