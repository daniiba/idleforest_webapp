/* Hallmark · pre-emit critique: P5 H4 E4 S5 R4 V4 */
import type { Metadata } from "next";
import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Chrome,
  CircleDollarSign,
  ExternalLink,
  Leaf,
  MonitorDown,
  ShieldCheck,
  Sprout,
  Star,
  TreePine,
  Wifi,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "@/navigation";
import { groupByProject, plantingsData } from "@/lib/plantings";

const title = "Plant a Tree Chrome Extension: Free & Verified | IdleForest";
const description =
  "Install IdleForest, the free Chrome extension that plants verified trees with your idle bandwidth. No signup, no search switch, rated 4.8 on Chrome.";
const canonical = "https://www.idleforest.com/tree-planting-extension/";

const projectStats = groupByProject(plantingsData.events);
const totalTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0);

const comparisonRows = [
  ["Cost", "Free, no signup", "Free add-on tied to a paid mobile app", "Free"],
  ["What you must change", "Nothing, install and forget", "Run timed focus sessions, avoid your phone", "Shop online, activate a popup per store"],
  ["How trees are funded", "Revenue from your idle bandwidth", "In-app coins you earn, then spend", "Affiliate fees from your purchases"],
  ["When trees get planted", "Continuously, in the background", "Only when you finish sessions and spend coins", "Only when you buy at a partner shop"],
  ["Real-tree proof", "Named partners, receipts, live counter", "Over 2 million trees via Trees for the Future", "Trees planted, mainly in India"],
];

const proofProjects = [
  {
    id: "tn-syzygium",
    name: "Native forest recovery in Lushoto District, Tanzania",
    image: "/report-images/mkussu-forest.jpg",
    partner: "Tree-Nation",
    href: "https://tree-nation.com/projects/replanting-the-burnt-mkussu-forest",
  },
  {
    id: "tftf-kisumu7-awach",
    name: "Agroforestry with smallholder farmers in Kisumu, Kenya",
    image: "https://images.1clickimpact.com/projects/trees-kenya-fgp/thumb.jpg",
    partner: "Trees for the Future",
    href: "https://1clickimpact.com/climate-projects/trees-kenya-fgp",
  },
];

const faqs = [
  {
    question: "Is the tree-planting extension really free?",
    answer:
      "Yes. There is no subscription, no donation, no signup, and no paid tier. It is funded by revenue from idle-bandwidth tasks, not by you.",
  },
  {
    question: "Does it slow down my computer or internet?",
    answer:
      "No. It uses only bandwidth you are not using and steps back the moment you start a video call, a download, or a heavy site. You can pause it from the extension menu at any time.",
  },
  {
    question: "How does the extension actually plant trees?",
    answer:
      "Your unused bandwidth powers small backend tasks for paying clients. That revenue is sent to reforestation partners, who plant and record the trees. You can see the running total on the transparency page.",
  },
  {
    question: "Which browsers does it work on?",
    answer:
      "Chrome and Edge as an extension, plus desktop apps for Windows and Mac. Mobile is on the roadmap.",
  },
  {
    question: "Can I use it with Ecosia or another search engine?",
    answer:
      "Yes. It does not change your search engine or your browsing, so it stacks on top of Ecosia, Brave, Chrome, and Edge. You keep your habits and add a passive layer.",
  },
  {
    question: "How is this different from the Forest extension?",
    answer:
      "Forest is a focus timer that plants trees when you complete sessions and spend in-app coins, and its Chrome add-on is a companion to a paid mobile app. IdleForest plants continuously in the background with no game and no paid tier.",
  },
  {
    question: "What data does the extension collect?",
    answer:
      "None of your personal browsing data. The traffic that runs through it is sessionless, so it carries no cookies, identifiers, or history.",
  },
  {
    question: "Are the trees real and verified?",
    answer:
      "Yes. Trees are funded through Trees for the Future, Tree-Nation, and 1ClickImpact, all with published planting records, and the community total is shown live on the transparency page.",
  },
  {
    question: "How many trees has IdleForest funded?",
    answer:
      `IdleForest has funded ${totalTrees.toLocaleString()} trees in the current public planting records. The transparency page shows the running community total and links to the partner records behind it.`,
  },
  {
    question: "Can I uninstall it whenever I want?",
    answer:
      "Yes. Remove the extension from your browser menu or uninstall the desktop app like any other program. Trees you already helped fund stay funded.",
  },
  {
    question: "Does it work for teams or companies?",
    answer:
      "Yes. Companies can run it across a network for verified impact and certificates. See the business page.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "IdleForest",
    applicationCategory: "BrowserApplication",
    operatingSystem: "Chrome, Edge, Windows, macOS",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    description:
      "Free Chrome extension that funds verified tree planting with your idle internet bandwidth. No signup, no donations, no search-engine switch.",
    url: canonical,
    downloadUrl: "https://www.idleforest.com/download/chrome",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      reviewCount: "33",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to plant trees with the IdleForest Chrome extension",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Add to Chrome",
        text: "Install IdleForest from the Chrome Web Store. No account, payment, or setting change is needed.",
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Browse normally",
        text: "The extension uses only your unused bandwidth for sessionless background tasks and pauses when you need the connection.",
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "Fund verified trees",
        text: "Revenue from those tasks funds reforestation through verified partners, tracked on the transparency page.",
      },
    ],
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.idleforest.com/" },
      { "@type": "ListItem", position: 2, name: "Tree-Planting Chrome Extension", item: canonical },
    ],
  },
];

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical,
  },
  openGraph: {
    title,
    description,
    url: canonical,
    siteName: "IdleForest",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 800,
        alt: "Plant a tree Chrome extension with IdleForest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/preview.png"],
  },
};

export default function TreePlantingExtensionPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        {schemas.map((schema) => (
          <script
            key={schema["@type"]}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}

        <section className="border-b-2 border-black bg-brand-yellow">
          <div className="container mx-auto grid gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.75fr)] lg:items-center lg:py-20">
            <div className="min-w-0">
              <p className="mb-5 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                <Chrome className="h-4 w-4" />
                plant a tree chrome extension
              </p>
              <h1 className="font-rethink-sans text-[42px] font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                Plant a Tree Chrome Extension That Works in the Background
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                IdleForest is a free Chrome extension that funds verified tree planting with the internet bandwidth you
                are not using. No signup, no donations, and no change to how you browse or which search engine you use.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-auto rounded-full bg-brand-navy px-7 py-4 text-base font-bold text-brand-yellow hover:bg-black">
                  <Link href="/download/chrome" className="inline-flex items-center gap-2">
                    Add to Chrome, It's Free <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto rounded-full border-2 border-black bg-transparent px-7 py-4 text-base font-bold hover:bg-white">
                  <Link href="/how-it-works" className="inline-flex items-center gap-2">
                    See how it works <Wifi className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-5 max-w-3xl text-sm font-bold uppercase tracking-wide text-brand-navy">
                Featured on the Chrome Web Store. Rated 4.8 across 33 reviews. Used by 1,000+ people planting trees just
                by leaving their browser on.
              </p>
            </div>

            <Card className="border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
              <div className="flex items-center gap-4 border-b-2 border-black pb-5">
                <div className="grid h-16 w-16 place-items-center rounded-md bg-brand-yellow">
                  <Image src="/chrome.png" alt="Plant a tree Chrome extension with IdleForest" width={44} height={44} />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase text-neutral-600">Free install</p>
                  <p className="font-rethink-sans text-2xl font-extrabold">Chrome extension</p>
                </div>
              </div>
              <div className="grid gap-4 pt-5">
                <Signal icon={<Star className="h-5 w-5" />} label="4.8 stars from 33 reviews" />
                <Signal icon={<BadgeCheck className="h-5 w-5" />} label="Featured Chrome Web Store listing" />
                <Signal icon={<TreePine className="h-5 w-5" />} label={`${totalTrees.toLocaleString()} trees funded in public records`} />
                <Signal icon={<ShieldCheck className="h-5 w-5" />} label="Open-source code and public receipts" />
              </div>
            </Card>
          </div>
        </section>

        <section className="bg-brand-gray">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-3xl">
              <h2 className="font-rethink-sans text-4xl font-extrabold sm:text-5xl">
                How the tree-planting Chrome extension works
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-800">
                One install, then nothing to remember. IdleForest runs quietly and turns wasted bandwidth into funded
                trees while you do what you already do.
              </p>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <StepCard number="1" title="Add it to Chrome in one click.">
                Install from the Chrome Web Store. There is no account to create, no payment method, and no browser
                setting to change. The desktop apps for Windows and Mac plant trees even when your browser is closed.
              </StepCard>
              <StepCard number="2" title="Browse the way you always do.">
                IdleForest stays in the background and uses only the bandwidth you are not using, for small sessionless
                tasks like uptime checks and market research. It pauses on its own when you need the connection.
              </StepCard>
              <StepCard number="3" title="Watch verified trees get funded.">
                The revenue from those tasks goes to reforestation partners. You can follow every funded tree on the
                transparency page.
              </StepCard>
            </div>
            <Link href="/how-it-works" className="mt-8 inline-flex items-center gap-2 font-bold text-brand-navy underline underline-offset-4 hover:text-black">
              Read the full technical explanation on how idle bandwidth funds trees <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="bg-brand-navy text-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
              <div>
                <p className="mb-4 inline-flex items-center gap-2 border-2 border-brand-yellow px-3 py-1 text-sm font-bold uppercase">
                  <Leaf className="h-4 w-4" />
                  category choice
                </p>
                <h2 className="font-rethink-sans text-4xl font-extrabold sm:text-5xl">
                  The best browser extension for digital sustainability, compared
                </h2>
                <p className="mt-5 text-lg leading-8 text-brand-yellow/85">
                  Most plant a tree extensions ask for something back. IdleForest asks for nothing you would notice.
                  Forest is an excellent focus tool and TreeClicks is a real charity-shopping tool, but neither is built
                  for passive, verifiable reforestation as its main job.
                </p>
              </div>
              <div className="overflow-x-auto border-2 border-brand-yellow bg-brand-gray text-black">
                <table className="w-full min-w-[780px] border-collapse text-left">
                  <thead>
                    <tr className="bg-brand-yellow">
                      <th className="border-b-2 border-black p-4">Decision point</th>
                      <th className="border-b-2 border-l-2 border-black p-4">IdleForest</th>
                      <th className="border-b-2 border-l-2 border-black p-4">Forest</th>
                      <th className="border-b-2 border-l-2 border-black p-4">TreeClicks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonRows.map(([label, idleforest, forest, treeclicks]) => (
                      <tr key={label}>
                        <th className="border-t-2 border-black p-4 align-top font-bold">{label}</th>
                        <td className="border-l-2 border-t-2 border-black p-4 align-top">{idleforest}</td>
                        <td className="border-l-2 border-t-2 border-black p-4 align-top">{forest}</td>
                        <td className="border-l-2 border-t-2 border-black p-4 align-top">{treeclicks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-base font-bold">
              <span>Comparing the search-engine route?</span>
              <Link href="/ecosia-alternatives" className="underline underline-offset-4 hover:text-white">
                alternatives to Ecosia
              </Link>
              <span>·</span>
              <Link href="/eco-friendly-search-engine" className="underline underline-offset-4 hover:text-white">
                eco-friendly search engine
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
              <div>
                <h2 className="font-rethink-sans text-4xl font-extrabold sm:text-5xl">
                  Verified trees, named partners, public receipts
                </h2>
                <p className="mt-5 text-lg leading-8 text-neutral-800">
                  IdleForest funds reforestation through Trees for the Future, Tree-Nation, and 1ClickImpact. These are
                  established organizations with published planting records, so the trees are traceable rather than a
                  marketing figure.
                </p>
                <p className="mt-4 text-lg leading-8 text-neutral-800">
                  Native-species and food-forest projects survive better and help local income, which is why they were
                  chosen over cheap monoculture planting.
                </p>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {proofProjects.map((project) => (
                  <a key={project.id} href={project.href} target="_blank" rel="noopener noreferrer" className="group block h-full">
                    <article className="flex h-full flex-col overflow-hidden border-2 border-black bg-brand-yellow transition-transform group-hover:-translate-y-1">
                      <div className="relative h-48 border-b-2 border-black">
                        <Image src={project.image} alt={project.name} fill className="object-cover" />
                      </div>
                      <div className="flex flex-1 flex-col p-5">
                        <p className="text-sm font-bold uppercase text-neutral-700">{project.partner}</p>
                        <h3 className="mt-2 font-rethink-sans text-2xl font-extrabold">{project.name}</h3>
                        <div className="mt-5 flex items-end justify-between gap-4 border-t-2 border-black pt-4">
                          <div>
                            <p className="font-candu text-4xl">{(projectStats[project.id]?.trees ?? 0).toLocaleString()}</p>
                            <p className="text-xs font-bold uppercase tracking-wide text-neutral-700">trees in records</p>
                          </div>
                          <span className="inline-flex items-center gap-1 font-bold underline underline-offset-4">
                            Open record <ExternalLink className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </article>
                  </a>
                ))}
              </div>
            </div>
            <div className="mt-10 grid gap-5 md:grid-cols-[0.8fr_1.2fr]">
              <Card className="border-2 border-black bg-brand-navy p-6 text-brand-yellow">
                <p className="text-sm font-bold uppercase tracking-wide text-brand-yellow/80">Community total</p>
                <p className="mt-2 font-candu text-6xl">{totalTrees.toLocaleString()}</p>
                <p className="mt-3 text-brand-yellow/85">Trees funded in the current public planting records.</p>
              </Card>
              <Card className="border-2 border-black bg-brand-gray p-6">
                <p className="text-lg leading-8 text-neutral-800">
                  A running total of trees funded by the community sits on the transparency page, updated from real
                  partner records. You can also check the partner sites directly.
                </p>
                <div className="mt-5 flex flex-wrap gap-4 font-bold">
                  <Link href="/transparency" className="underline underline-offset-4 hover:text-brand-navy">
                    verified tree-planting records
                  </Link>
                  <a href="https://trees.org" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-brand-navy">
                    Trees for the Future
                  </a>
                  <a href="https://tree-nation.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-brand-navy">
                    Tree-Nation
                  </a>
                  <a href="https://1clickimpact.com" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-brand-navy">
                    1ClickImpact
                  </a>
                </div>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-brand-gray">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-2 md:py-20">
            <Card className="border-2 border-black bg-brand-yellow p-7">
              <CircleDollarSign className="h-10 w-10 text-brand-navy" />
              <h2 className="mt-4 font-rethink-sans text-3xl font-extrabold">How much impact does idle bandwidth really make?</h2>
              <p className="mt-4 text-lg leading-8 text-neutral-800">
                The revenue per person is small, often a few cents per month for an average connection. The model works
                at scale, not by pretending one person can reforest a hillside alone.
              </p>
              <p className="mt-4 text-lg leading-8 text-neutral-800">
                At 1,000+ active users, pooled bandwidth funds verified trees every month. That is the trade: zero effort
                from you, real trees at scale.
              </p>
            </Card>
            <Card className="border-2 border-black bg-white p-7">
              <ShieldCheck className="h-10 w-10 text-brand-navy" />
              <h2 className="mt-4 font-rethink-sans text-3xl font-extrabold">Is the extension safe to install?</h2>
              <p className="mt-4 text-lg leading-8 text-neutral-800">
                The tasks routed through your connection are sessionless. They carry no cookies, no personal identifiers,
                and no browsing history. The extension does not read your tabs, bookmarks, or searches.
              </p>
              <p className="mt-4 text-lg leading-8 text-neutral-800">
                Tasks are limited to passive work on public sites, such as uptime monitoring and market research. No
                crypto mining, no ad fraud, no scraping of private data.
              </p>
              <Link href="/privacy" className="mt-5 inline-flex items-center gap-2 font-bold underline underline-offset-4 hover:text-brand-navy">
                privacy policy <ArrowRight className="h-4 w-4" />
              </Link>
            </Card>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <h2 className="font-rethink-sans text-4xl font-extrabold sm:text-5xl">
              Plant a tree Chrome extension: frequently asked questions
            </h2>
            <div className="mt-10 divide-y-2 divide-black border-y-2 border-black">
              {faqs.map((faq) => (
                <article key={faq.question} className="grid gap-3 py-6 md:grid-cols-[320px_minmax(0,1fr)] md:gap-8">
                  <h3 className="font-rethink-sans text-2xl font-extrabold">{faq.question}</h3>
                  <p className="text-lg leading-8 text-neutral-800">{faq.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-navy text-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div>
              <div className="max-w-4xl">
                <p className="mb-4 inline-flex items-center gap-2 border-2 border-brand-yellow px-3 py-1 text-sm font-bold uppercase">
                  <Star className="h-4 w-4" />
                  community proof
                </p>
                <h2 className="font-rethink-sans text-4xl font-extrabold sm:text-5xl">
                  Trusted by a growing community of passive tree planters
                </h2>
                <p className="mt-5 text-lg leading-8 text-brand-yellow/85">
                  IdleForest is rated 4.8 stars across 33 Chrome Web Store reviews, marked Featured, used by 1,000+
                  people, based in Lisbon, Portugal, and open source on GitHub.
                </p>
                <a
                  href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 font-bold underline underline-offset-4 hover:text-white"
                >
                  read all 33 reviews <ExternalLink className="h-4 w-4" />
                </a>
              </div>

              <div className="mx-auto mt-10 flex max-w-5xl flex-col gap-8">
                {["/reviews/image.png", "/reviews/image1.png", "/reviews/image2.png"].map((src, index) => (
                  <Image
                    key={src}
                    src={src}
                    alt={`IdleForest Chrome Web Store review screenshot ${index + 1}`}
                    width={1400}
                    height={920}
                    className="h-auto w-full border-2 border-brand-yellow bg-white object-contain"
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 text-center md:py-20">
            <Sprout className="mx-auto h-12 w-12 text-brand-navy" />
            <h2 className="mx-auto mt-5 max-w-4xl font-rethink-sans text-4xl font-extrabold sm:text-6xl">
              Start planting trees in ten seconds
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-neutral-800">
              Install IdleForest, browse the way you always do, and let unused bandwidth fund verified reforestation. It
              is free, runs in the background, and you can forget it is there.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild className="h-auto rounded-full bg-brand-navy px-7 py-4 text-base font-bold text-brand-yellow hover:bg-black">
                <Link href="/download/chrome" className="inline-flex items-center gap-2">
                  Add to Chrome, It's Free <Chrome className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto rounded-full border-2 border-black bg-transparent px-7 py-4 text-base font-bold hover:bg-white">
                <Link href="/download/windows" className="inline-flex items-center gap-2">
                  Get the desktop app <MonitorDown className="h-5 w-5" />
                </Link>
              </Button>
              <Link href="/download/mac" className="font-bold underline underline-offset-4 hover:text-brand-navy">
                Download for Mac
              </Link>
            </div>
            <p className="mt-6">
              <Link href="/business" className="font-bold underline underline-offset-4 hover:text-brand-navy">
                tree planting for teams
              </Link>
            </p>
          </div>
        </section>
      </main>
    </>
  );
}

function Signal({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-black pb-4 last:border-b-0 last:pb-0">
      <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-md bg-brand-yellow text-black">{icon}</div>
      <span className="font-bold">{label}</span>
    </div>
  );
}

function StepCard({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full border-2 border-black bg-brand-yellow p-6">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-brand-navy font-candu text-3xl text-brand-yellow">
        {number}
      </div>
      <h3 className="font-rethink-sans text-2xl font-extrabold">{title}</h3>
      <p className="mt-4 text-neutral-800 leading-7">{children}</p>
    </Card>
  );
}
