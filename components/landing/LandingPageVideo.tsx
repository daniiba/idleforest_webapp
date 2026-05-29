"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/navigation";
import { ReviewsSection } from "@/components/reviews-section";
import ProjectsSection from "@/components/landing/ProjectsSection";
import TeamSection from "@/components/landing/TeamSection";
import { DeviceDetection } from "@/lib/device-detection";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { trackPinterestEvent } from "@/lib/pinterest/client";
import { ArrowRight, Chrome, Download, ExternalLink, Leaf, ShieldCheck, Sprout, TreePine } from "lucide-react";

const CHROME_URL = "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk";
const MAC_URL = "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip";
const WINDOWS_URL = "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe";

const comparisonRows = [
    ["Cost", "Free, no signup", "Free search", "$10-25/month", "Recurring donation"],
    ["Effort", "Install once, forget", "Switch your search engine", "Active subscription", "Manual payments"],
    ["How trees are funded", "Idle bandwidth", "Search ads", "Subscription fees", "Your money"],
    ["Works with your browser", "Yes, all browsers", "Browser-specific", "N/A", "N/A"],
];

const impactStats = [
    ["5,364", "verified trees planted"],
    ["$2,796", "contributed"],
    ["10.1M", "requests powered"],
    ["1,000+", "users"],
];

const faqItems = [
    {
        question: "Is the tree planting app really free?",
        answer: "Yes. There is no subscription, no donation, no signup, and no paid tier. The app is funded by the revenue from idle bandwidth tasks, not by you.",
    },
    {
        question: "Does the app slow down my computer or internet?",
        answer: "No. The app uses only the bandwidth you're not using. When you start a video call, open a heavy site, or download a file, IdleForest steps back. You can also pause it at any time from the extension menu.",
    },
    {
        question: "How does IdleForest plant trees?",
        answer: "The app uses your unused internet bandwidth to power small backend tasks for paying clients. The revenue from those tasks funds tree-planting with Trees for the Future, Tree-Nation, and 1ClickImpact. You can see the live count of trees funded on the transparency page.",
    },
    {
        question: 'What is "idle bandwidth"?',
        answer: "Idle bandwidth is the part of your internet connection that isn't being used. Most home connections sit unused most of the time. IdleForest uses that unused capacity to generate revenue, and routes the revenue to reforestation.",
    },
    {
        question: "Can I use IdleForest with Ecosia or another browser?",
        answer: "Yes. IdleForest doesn't change how you browse or what search engine you use. It works alongside Ecosia, Brave, Firefox, and any other browser. You can stack the impact.",
    },
    {
        question: "What data does the app collect?",
        answer: "None. The traffic that runs through the app is sessionless, meaning it doesn't carry cookies, personal identifiers, or browsing history. The app doesn't read your tabs, your bookmarks, or your search history.",
    },
    {
        question: "Is the bandwidth used for anything harmful?",
        answer: "No. The tasks routed through your connection are limited to uptime monitoring, market research, and similar passive data collection from public sites. The app doesn't participate in ad fraud, crypto mining, scraping of private data, or any malicious activity.",
    },
    {
        question: "How many trees has IdleForest planted?",
        answer: "As of May 2026, IdleForest has funded 5,364 verified trees through our partners. The count updates monthly based on confirmed planting reports from each partner.",
    },
    {
        question: "How much money does IdleForest make from my bandwidth?",
        answer: "The revenue per user is small, a few cents per month for an average user. That's why the model works at scale, not per individual. With 1,000 active users, the total reaches a level where we can fund verified trees every month.",
    },
    {
        question: "Is IdleForest available on mobile?",
        answer: "Not yet. The app runs as a Chrome extension and as a desktop app for Mac and Windows. Mobile is on the roadmap, but mobile networks have less idle bandwidth than home connections, so the impact per user would be lower.",
    },
    {
        question: "Can I uninstall the app at any time?",
        answer: "Yes. Uninstall the Chrome extension from the extensions menu, or remove the desktop app like any other application. Once uninstalled, no bandwidth is used and no data is collected. The trees you've already funded stay funded.",
    },
];

export default function LandingPageVideo({ deviceInfo }: { deviceInfo?: DeviceDetection }) {
    const { isMac } = useDeviceDetection(deviceInfo);
    const desktopUrl = isMac ? MAC_URL : WINDOWS_URL;
    const desktopLabel = isMac ? "Download for Mac" : "Download for Windows";

    const trackLead = (eventSourceUrl: string, leadType: string) => {
        trackPinterestEvent({
            eventName: "lead",
            eventSourceUrl,
            customData: { lead_type: leadType },
        });
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: "How to plant trees by browsing with IdleForest",
        totalTime: "PT10S",
        step: [
            {
                "@type": "HowToStep",
                position: 1,
                name: "Install the app",
                text: "Add IdleForest to Chrome or download the desktop app for Mac or Windows. Takes 10 seconds.",
                url: "https://www.idleforest.com/#step-1",
            },
            {
                "@type": "HowToStep",
                position: 2,
                name: "Browse normally",
                text: "The app runs quietly in the background, using only your unused internet bandwidth.",
                url: "https://www.idleforest.com/#step-2",
            },
            {
                "@type": "HowToStep",
                position: 3,
                name: "Trees get planted",
                text: "Every gigabyte of idle bandwidth funds verified tree-planting projects.",
                url: "https://www.idleforest.com/#step-3",
            },
        ],
    };

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-brand-gray text-black">
                <section className="relative overflow-hidden border-b-4 border-black">
                    <Image src="/Vector (Stroke).svg" alt="" fill priority sizes="150vw" className="absolute top-[100px] right-[100px] object-cover pointer-events-none select-none" />
                    <div className="container relative mx-auto grid min-h-[calc(100vh-120px)] grid-cols-1 items-center gap-10 px-6 py-16 lg:grid-cols-[0.92fr_1.08fr]">
                        <div className="max-w-3xl">
                            <div className="mb-6 flex items-center gap-3">
                                <Image src="/europelogo.svg" alt="European Union flag" width={74} height={62} />
                                <span className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-700">Free tree planting app</span>
                            </div>
                            <h1 className="font-candu text-[44px] uppercase leading-[0.98] text-black sm:text-6xl lg:text-7xl">The Free Tree Planting App You Install Once and Forget</h1>
                            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-800">
                                IdleForest is a free Chrome extension and desktop app that funds verified tree-planting projects with your idle internet bandwidth. Install it once and let it run while
                                you browse.
                            </p>
                            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                                <Button asChild className="rounded-full bg-brand-yellow px-7 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                                    <Link
                                        href={CHROME_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackLead(CHROME_URL, "Extension Download - Chrome")}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Chrome className="h-5 w-5" />
                                        Add to Chrome - It's Free
                                    </Link>
                                </Button>
                                <Button asChild className="rounded-full bg-black px-7 py-6 font-bold text-brand-yellow hover:bg-neutral-900">
                                    <Link
                                        href={desktopUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackLead(desktopUrl, isMac ? "Desktop Download - Mac" : "Desktop Download - Windows")}
                                        className="flex items-center justify-center gap-2"
                                    >
                                        <Download className="h-5 w-5" />
                                        {desktopLabel}
                                    </Link>
                                </Button>
                                <Button asChild variant="link" className="px-0 font-bold text-black">
                                    <Link href="#how-it-works" className="flex items-center justify-center gap-2">
                                        See how it works <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                            <div className="mt-6 flex flex-wrap gap-2 text-sm font-bold text-neutral-700">
                                <span className="rounded-full border border-black/10 bg-white px-3 py-2">Featured on Chrome Web Store</span>
                                <span className="rounded-full border border-black/10 bg-white px-3 py-2">4.8 ★ from 33 reviews</span>
                                <span className="rounded-full border border-black/10 bg-white px-3 py-2">5,364 verified trees planted</span>
                            </div>
                        </div>
                        <div className="relative mx-auto w-full max-w-2xl">
                            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border-2 border-black bg-white shadow-[10px_10px_0_0_#000]">
                                <Image src="/landing/screenshot-1.png" alt="IdleForest app dashboard showing tree planting progress" fill priority className="object-contain" />
                            </div>
                            <div className="absolute -bottom-6 left-4 right-4 grid grid-cols-2 gap-3 sm:left-auto sm:right-[-18px] sm:w-[310px]">
                                <div className="border-2 border-black bg-brand-yellow p-4 shadow-[5px_5px_0_0_#000]">
                                    <p className="font-candu text-3xl leading-none">10 sec</p>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-black/70">install time</p>
                                </div>
                                <div className="border-2 border-black bg-black p-4 text-brand-yellow shadow-[5px_5px_0_0_#000]">
                                    <p className="font-candu text-3xl leading-none">$0</p>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-yellow/70">cost to use</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="how-it-works" className="bg-brand-yellow px-6 py-20 text-black md:py-24">
                    <div className="container mx-auto">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="font-rethink-sans text-4xl font-extrabold md:text-6xl">How the Tree Planting App Works</h2>
                        </div>
                        <div className="mt-14 grid gap-8 lg:grid-cols-3">
                            <StepCard
                                id="step-1"
                                number="1"
                                title="Install the App in One Click"
                                text="Add IdleForest to Chrome from the Web Store, or download the desktop app for Mac or Windows. The install takes ten seconds. You don't need to create an account, enter a payment method, or change any browser settings."
                            />
                            <StepCard
                                id="step-2"
                                number="2"
                                title="Browse Normally"
                                text="The app stays in the background. It uses only the bandwidth you're not using, what we call idle bandwidth, to power small backend tasks. Your browser stays fast. Your data stays on your machine."
                            />
                            <StepCard
                                id="step-3"
                                number="3"
                                title="Watch Your Forest Grow"
                                text="Every gigabyte of idle bandwidth generates revenue. That revenue funds tree-planting with our partners: Trees for the Future, Tree-Nation, and 1ClickImpact."
                            />
                        </div>
                        <div className="mt-10 text-center">
                            <Link href="#idle-bandwidth" className="inline-flex items-center gap-2 font-bold underline">
                                See how it works in detail <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <ProjectsSection />

                <section className="relative overflow-hidden bg-brand-navy px-6 py-20 text-white md:py-24">
                    <div className="container mx-auto">
                        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
                            <div className="max-w-3xl">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-yellow">Comparison</p>
                                <h2 className="mt-3 font-rethink-sans text-4xl font-extrabold leading-tight md:text-6xl">Why IdleForest Is Different From Other Tree Planting Apps</h2>
                                <p className="mt-5 text-lg leading-relaxed text-white/75">
                                    Most tree planting apps ask you to change a habit, switch your search engine, pay a monthly fee, or remember to donate. IdleForest doesn't. You install it, then
                                    forget it.
                                </p>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <ComparisonCallout title="No behavior change" text="Keep your browser, search engine, and routine." />
                                <ComparisonCallout title="No payment loop" text="Idle bandwidth funds the planting, not donations." />
                            </div>
                        </div>

                        <div className="mt-12 overflow-hidden rounded-lg border-2 border-black bg-brand-gray shadow-[10px_10px_0_0_#000]">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[760px] border-collapse text-left text-black">
                                    <thead className="bg-black text-brand-yellow">
                                        <tr>
                                            <th className="p-4"> </th>
                                            <th className="p-4">IdleForest</th>
                                            <th className="p-4">Ecosia</th>
                                            <th className="p-4">Mossy Earth</th>
                                            <th className="p-4">Donation apps</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {comparisonRows.map((row) => (
                                            <tr key={row[0]} className="border-t-2 border-black">
                                                {row.map((cell, index) => (
                                                    <td key={`${row[0]}-${index}`} className={`p-4 ${index === 0 ? "font-bold" : ""}`}>
                                                        {index === 1 ? <span className="font-bold">{cell}</span> : cell}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
                            <Link
                                href="/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025"
                                className="rounded-full border border-brand-yellow/40 px-4 py-2 text-brand-yellow hover:bg-brand-yellow hover:text-black"
                            >
                                IdleForest vs Ecosia
                            </Link>
                            <Link
                                href="/blog/planet-wild-vs-mossy-earth-which-conservation-membership-offers-the-best-rewilding-impact-in-2025"
                                className="rounded-full border border-brand-yellow/40 px-4 py-2 text-brand-yellow hover:bg-brand-yellow hover:text-black"
                            >
                                Planet Wild vs Mossy Earth
                            </Link>
                            <Link
                                href="/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025"
                                className="rounded-full border border-brand-yellow/40 px-4 py-2 text-brand-yellow hover:bg-brand-yellow hover:text-black"
                            >
                                9 alternatives to Ecosia
                            </Link>
                        </div>
                    </div>
                </section>

                <section id="idle-bandwidth" className="bg-black px-6 py-20 text-brand-yellow md:py-24">
                    <div className="container mx-auto grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
                        <div>
                            <h2 className="font-rethink-sans text-4xl font-extrabold md:text-6xl">How Idle Bandwidth Funds Trees</h2>
                            <Link href="/transparency" className="mt-8 inline-flex items-center gap-2 font-bold underline">
                                Read the full technical explanation <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                        <div className="space-y-5 text-lg leading-relaxed text-brand-yellow/90">
                            <p>
                                Idle bandwidth is the part of your internet connection you're not using. Most of the time, your connection sits at a small fraction of its capacity. The rest is wasted.
                            </p>
                            <p>
                                IdleForest puts that unused capacity to work. The app routes small data tasks through your connection, like checking website uptime or running market research queries.
                                These tasks are sessionless: they don't carry personal data, cookies, or browsing history.
                            </p>
                            <p>
                                Clients pay for those tasks. We take that revenue and send it to our reforestation partners. The result: you plant trees with bandwidth you weren't using anyway. The
                                cost to you is zero.
                            </p>
                            <p>This model is why IdleForest is free. We don't need your money, your search history, or your email. We just need the gigabytes you would have wasted.</p>
                        </div>
                    </div>
                </section>

                <section className="px-6 py-20 md:py-24">
                    <div className="container mx-auto">
                        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-3xl">
                                <p className="text-xs font-bold uppercase tracking-[0.22em] text-neutral-600">Verified impact</p>
                                <h2 className="font-rethink-sans text-4xl font-extrabold md:text-6xl">Verified Tree-Planting Partners</h2>
                                <p className="mt-5 text-lg leading-relaxed text-neutral-800">
                                    We work with three reforestation organizations. Each one publishes its planting records. Each one operates in regions where reforestation has measurable carbon and
                                    biodiversity impact.
                                </p>
                            </div>
                            <div className="grid min-w-0 gap-3 sm:grid-cols-2 lg:w-[430px]">
                                {impactStats.map(([value, label]) => (
                                    <div key={label} className="border-2 border-black bg-brand-yellow p-4 shadow-[4px_4px_0_0_#000]">
                                        <p className="font-candu text-3xl leading-none">{value}</p>
                                        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-black/70">{label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-10 grid gap-6 lg:grid-cols-3">
                            <PartnerCard
                                icon={<TreePine className="h-8 w-8" />}
                                title="Trees for the Future"
                                text="Trees for the Future plants food forests with smallholder farmers across Sub-Saharan Africa. Their Forest Garden model restores soil, captures carbon, and gives farmers a living income for decades."
                                href="https://trees.org"
                            />
                            <PartnerCard
                                icon={<Leaf className="h-8 w-8" />}
                                title="Tree-Nation"
                                text="Tree-Nation restores native forests in 35+ countries, including Madagascar, Senegal, and Tanzania. They focus on native species for stronger survival rates and long-term ecological value."
                                href="https://tree-nation.com"
                            />
                            <PartnerCard
                                icon={<ShieldCheck className="h-8 w-8" />}
                                title="1ClickImpact"
                                text="1ClickImpact funds planting projects with traceability. Every tree they fund is geo-tagged and verified by an independent third party, with quarterly impact reports."
                                href="https://1clickimpact.com"
                            />
                        </div>
                        <Link href="/transparency" className="mt-8 inline-flex items-center gap-2 font-bold underline">
                            Read our full transparency report <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <TeamSection />

                <section id="faq" className="bg-brand-yellow px-6 py-20 text-black md:py-24">
                    <div className="container mx-auto">
                        <h2 className="text-center font-rethink-sans text-4xl font-extrabold md:text-6xl">Frequently Asked Questions</h2>
                        <div className="mx-auto mt-12 grid max-w-5xl gap-4">
                            {faqItems.map((item) => (
                                <details key={item.question} className="border-2 border-black bg-brand-navy p-5 text-brand-yellow">
                                    <summary className="cursor-pointer font-rethink-sans text-lg font-bold">{item.question}</summary>
                                    <p className="mt-4 leading-relaxed">{item.answer}</p>
                                    {item.question === "What data does the app collect?" ? (
                                        <Link href="/privacy" className="mt-3 inline-flex font-bold underline">
                                            See our privacy policy
                                        </Link>
                                    ) : null}
                                    {item.question === "Is the bandwidth used for anything harmful?" ? (
                                        <Link href="/transparency" className="mt-3 inline-flex font-bold underline">
                                            See our transparency report
                                        </Link>
                                    ) : null}
                                </details>
                            ))}
                        </div>
                    </div>
                </section>

                <ReviewsSection />

                <section className="bg-black px-6 py-20 text-center text-brand-yellow md:py-24">
                    <div className="mx-auto max-w-3xl">
                        <Sprout className="mx-auto h-12 w-12" />
                        <h2 className="mt-6 font-rethink-sans text-4xl font-extrabold md:text-6xl">Start Planting Trees in 10 Seconds</h2>
                        <p className="mt-5 text-lg text-brand-yellow/90">Install IdleForest. Browse like you always do. Watch trees get planted.</p>
                        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                            <Button asChild className="rounded-full bg-brand-yellow px-7 py-6 font-bold text-black hover:bg-white">
                                <Link href={CHROME_URL} target="_blank" rel="noopener noreferrer" onClick={() => trackLead(CHROME_URL, "Extension Download - Chrome")}>
                                    <Chrome className="mr-2 h-5 w-5" />
                                    Add to Chrome
                                </Link>
                            </Button>
                            <Button asChild className="rounded-full bg-white px-7 py-6 font-bold text-black hover:bg-brand-yellow">
                                <Link
                                    href={desktopUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => trackLead(desktopUrl, isMac ? "Desktop Download - Mac" : "Desktop Download - Windows")}
                                >
                                    <Download className="mr-2 h-5 w-5" />
                                    {desktopLabel}
                                </Link>
                            </Button>
                        </div>
                        <a href={CHROME_URL} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex items-center justify-center gap-2 font-bold underline">
                            Read all 33 reviews on Chrome Web Store <ExternalLink className="h-4 w-4" />
                        </a>
                    </div>
                </section>
            </main>

            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
        </>
    );
}

function StepCard({ id, number, title, text }: { id: string; number: string; title: string; text: string }) {
    return (
        <article id={id} className="border-2 border-black bg-white p-6 shadow-[6px_6px_0_0_#000]">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black font-bold text-brand-yellow">{number}</div>
            <h3 className="mt-6 font-rethink-sans text-2xl font-extrabold">{title}</h3>
            <p className="mt-4 leading-relaxed text-neutral-800">{text}</p>
        </article>
    );
}

function ComparisonCallout({ title, text }: { title: string; text: string }) {
    return (
        <div className="border-2 border-black bg-brand-yellow p-5 text-black shadow-[5px_5px_0_0_#000]">
            <p className="font-rethink-sans text-xl font-extrabold">{title}</p>
            <p className="mt-2 text-sm leading-6 text-black/75">{text}</p>
        </div>
    );
}

function PartnerCard({ icon, title, text, href }: { icon: ReactNode; title: string; text: string; href: string }) {
    return (
        <article className="flex h-full flex-col border-2 border-black bg-white p-6">
            <div className="text-brand-yellow">{icon}</div>
            <h3 className="mt-5 font-rethink-sans text-2xl font-extrabold">{title}</h3>
            <p className="mt-4 flex-1 leading-relaxed text-neutral-800">{text}</p>
            <a href={href} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold underline">
                Visit their site <ExternalLink className="h-4 w-4" />
            </a>
        </article>
    );
}
