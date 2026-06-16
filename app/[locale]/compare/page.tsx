import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Chrome,
  ExternalLink,
  Sparkles,
  Trees,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

/* Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V4 */
const title = "Compare Tree-Planting Apps & Eco-Impact Tools | IdleForest";
const description =
  "Compare the main ways to plant trees online: search engines, extensions, and apps. See how each funds trees, and where IdleForest's no-switch model fits.";
const canonical = "https://www.idleforest.com/compare/";

const companyLogos = {
  idleforest: {
    src: "/android-chrome-512x512.png",
    alt: "IdleForest logo",
  },
  ecosia: {
    src: "/compare/logos/ecosia.svg",
    alt: "Ecosia logo",
  },
  oceanhero: {
    src: "/compare/logos/oceanhero.png",
    alt: "OceanHero logo",
  },
  treeclicks: {
    src: "/compare/logos/treeclicks.png",
    alt: "TreeClicks logo",
  },
  forest: {
    src: "/compare/logos/forest.png",
    alt: "Forest app logo",
  },
};

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "tree planting app comparison",
    "compare tree-planting tools",
    "best tree-planting extension",
    "tree planting extension comparison",
    "best tree planting app",
    "oceanhero vs ecosia",
  ],
  alternates: {
    canonical,
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: canonical,
    siteName: "IdleForest",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 800,
        alt: "Tree-planting app comparison hub",
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

const tools = [
  {
    name: "IdleForest",
    type: "Extension and desktop app",
    funding: "Idle bandwidth funds verified trees",
    switch: "No",
    href: "/how-it-works",
    deeper: "How it works",
    logo: companyLogos.idleforest,
    featured: true,
  },
  {
    name: "Ecosia",
    type: "Search engine",
    funding: "Search ad revenue",
    switch: "Yes",
    href: "/compare/idleforest-vs-ecosia",
    deeper: "IdleForest vs Ecosia",
    logo: companyLogos.ecosia,
  },
  {
    name: "OceanHero",
    type: "Search engine",
    funding: "Search revenue, ocean plastic",
    switch: "Yes",
    href: "/compare/idleforest-vs-oceanhero",
    deeper: "IdleForest vs OceanHero",
    logo: companyLogos.oceanhero,
  },
  {
    name: "TreeClicks",
    type: "Shopping extension",
    funding: "Affiliate fees when you shop",
    switch: "No",
    href: "/compare/idleforest-vs-ecosia-vs-treeclicks",
    deeper: "3-way comparison",
    logo: companyLogos.treeclicks,
  },
  {
    name: "Forest",
    type: "Focus app",
    funding: "Earned coins fund real trees",
    switch: "No (mobile-first)",
    href: "#comparisons",
    deeper: "See comparisons",
    logo: companyLogos.forest,
  },
];

const heroModels = [
  {
    label: "Search",
    tool: "Ecosia / OceanHero",
    detail: "Trees or cleanup funded by search revenue",
    logos: [companyLogos.ecosia, companyLogos.oceanhero],
  },
  {
    label: "Shopping",
    tool: "TreeClicks",
    detail: "Planting funded when affiliate purchases happen",
    logos: [companyLogos.treeclicks],
  },
  {
    label: "Focus",
    tool: "Forest",
    detail: "Real-tree rewards tied to focus sessions",
    logos: [companyLogos.forest],
  },
  {
    label: "Passive",
    tool: "IdleForest",
    detail: "Verified planting funded from idle bandwidth",
    logos: [companyLogos.idleforest],
    featured: true,
  },
];

const comparisonCards = [
  {
    title: "IdleForest vs Ecosia",
    body: "Search-funded planting that needs a search switch, versus passive planting that does not. See which fits, and why many people run both.",
    href: "/compare/idleforest-vs-ecosia",
    cta: "Read the full comparison",
  },
  {
    title: "IdleForest vs OceanHero",
    body: "Both are easy to add, but OceanHero funds ocean-plastic recovery through search and IdleForest funds tree planting through idle bandwidth.",
    href: "/compare/idleforest-vs-oceanhero",
    cta: "Full comparison",
  },
  {
    title: "IdleForest vs Ecosia vs TreeClicks",
    body: "Three different funding models side by side: search, shopping, and idle bandwidth. The detailed three-way breakdown lives here.",
    href: "/compare/idleforest-vs-ecosia-vs-treeclicks",
    cta: "Open the three-way comparison",
  },
  {
    title: "Focus apps and other tools",
    body: "Tools like Forest plant trees as a reward for focus sessions, a different job from passive planting.",
    href: "#tools",
    cta: "See the tool table",
  },
  {
    title: "Paid conservation memberships",
    body: "Planet Wild and Mossy Earth use paid monthly memberships for active rewilding, not a free browser tool.",
    href: "/blog/planet-wild-vs-mossy-earth-which-conservation-membership-offers-the-best-rewilding-impact-in-2025",
    cta: "Planet Wild vs Mossy Earth",
  },
];

const faqs = [
  {
    question: "What is the best tree-planting app or extension?",
    answer:
      "It depends on how you want to contribute. Search engines suit people happy to switch their default, shopping and new-tab tools suit specific habits, and IdleForest suits people who want passive impact with no change at all.",
  },
  {
    question: "Do these tree-planting tools really plant trees?",
    answer:
      "The credible ones publish records. IdleForest names its partners and shows a live counter on its transparency page, so its planting is verifiable.",
  },
  {
    question: "Can I use more than one at once?",
    answer:
      "Yes. Because they fund trees in different ways, you can stack them, for example a tree-funding search engine plus IdleForest for the time between searches.",
  },
  {
    question: "Which tree-planting tool needs no search switch?",
    answer:
      "IdleForest and shopping or new-tab tools like TreeClicks do not change your search engine. Search-based options like Ecosia and OceanHero do.",
  },
  {
    question: "Are these tools free?",
    answer:
      "The tools compared here are free to use. IdleForest is funded by idle-bandwidth revenue, search tools by ad revenue, and shopping tools by affiliate fees. Paid conservation memberships are a separate subscription model.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tree-planting and eco-impact tool comparisons",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "IdleForest vs Ecosia",
        url: "https://www.idleforest.com/compare/idleforest-vs-ecosia/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "IdleForest vs OceanHero",
        url: "https://www.idleforest.com/compare/idleforest-vs-oceanhero/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "IdleForest vs Ecosia vs TreeClicks",
        url: "https://www.idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks",
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
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://www.idleforest.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Compare",
        item: canonical,
      },
    ],
  },
];

function ProofPill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <CheckCircle2 className="h-4 w-4 text-brand-navy" />
      {children}
    </span>
  );
}

function LogoStack({
  logos,
  featured = false,
}: {
  logos: Array<{ src: string; alt: string }>;
  featured?: boolean;
}) {
  return (
    <span
      className={`flex h-11 w-11 items-center justify-center overflow-hidden border-2 border-black ${featured ? "bg-black" : "bg-white"}`}
    >
      {logos.length === 1 ? (
        <Image
          src={logos[0].src}
          alt={logos[0].alt}
          width={34}
          height={34}
          className="h-8 w-8 object-contain"
        />
      ) : (
        <span className="grid grid-cols-2 gap-0.5 p-1">
          {logos.map((logo) => (
            <Image
              key={logo.alt}
              src={logo.src}
              alt={logo.alt}
              width={22}
              height={22}
              className="h-5 w-5 object-contain"
            />
          ))}
        </span>
      )}
    </span>
  );
}

export default function CompareHubPage() {
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

        <section className="relative overflow-hidden border-b-4 border-black bg-brand-yellow">
          <div className="absolute inset-x-0 top-0 h-6 border-b-2 border-black bg-white/40" />
          <div className="container relative mx-auto grid gap-10 px-6 pb-16 pt-20 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,0.86fr)] lg:items-center lg:pb-20 lg:pt-24">
            <div className="min-w-0">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="h-4 w-4" />
                tree planting app comparison
              </p>
              <h1 className="font-rethink-sans text-[42px] font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                Compare Tree-Planting and Eco-Impact Tools
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                There are several ways to turn everyday browsing into real
                trees, including{" "}
                <Link href="/eco-friendly-search-engine" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                  eco-friendly search engines
                </Link>
                , and they work very differently. This page groups the main
                options by how they actually fund planting, so you can find the
                right fit and go deeper on any head-to-head.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  asChild
                  className="h-auto rounded-full border-2 border-black bg-brand-navy px-7 py-4 text-base font-bold text-brand-yellow shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none"
                >
                  <Link
                    href="/download/chrome"
                    className="inline-flex items-center gap-2"
                  >
                    <Chrome className="h-5 w-5" />
                    Add IdleForest to Chrome, It's Free
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-full border-2 border-black bg-white px-7 py-4 text-base font-bold hover:bg-black hover:text-brand-yellow"
                >
                  <a
                    href="#comparisons"
                    className="inline-flex items-center gap-2"
                  >
                    Jump to the comparisons <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <div className="mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
                {["Search switch", "Habit change", "Passive option"].map(
                  (item, index) => (
                    <div
                      key={item}
                      className={`border-2 border-black px-4 py-3 text-sm font-extrabold ${index === 2 ? "bg-brand-navy text-brand-yellow" : "bg-white text-black"}`}
                    >
                      {item}
                    </div>
                  ),
                )}
              </div>
            </div>

            <aside
              aria-label="Tree-planting tool model preview"
              className="relative border-2 border-black bg-white p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] sm:p-5"
            >
              <div className="grid grid-cols-[1fr_auto] items-start gap-4 border-b-2 border-black pb-4">
                <div>
                  <p className="font-rethink-sans text-2xl font-extrabold leading-tight">
                    Pick by model,
                    <span className="block text-brand-navy">
                      not marketing.
                    </span>
                  </p>
                  <p className="mt-2 max-w-sm text-sm font-semibold leading-6 text-neutral-700">
                    The same outcome can come from very different online habits.
                  </p>
                </div>
                <div className="grid h-14 w-14 place-items-center border-2 border-black bg-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Trees className="h-7 w-7" />
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {heroModels.map((model) => (
                  <div
                    key={model.label}
                    className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-2 border-black p-3 ${model.featured ? "bg-brand-navy text-brand-yellow" : "bg-brand-gray text-black"}`}
                  >
                    <LogoStack logos={model.logos} featured={model.featured} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <p className="text-xs font-extrabold uppercase tracking-[0.16em]">
                          {model.label}
                        </p>
                        <p
                          className={`text-sm font-bold ${model.featured ? "text-brand-yellow/80" : "text-neutral-500"}`}
                        >
                          {model.tool}
                        </p>
                      </div>
                      <p
                        className={`mt-1 text-sm font-semibold leading-6 ${model.featured ? "text-white" : "text-neutral-700"}`}
                      >
                        {model.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-2 border-2 border-black">
                <div className="border-r-2 border-black bg-brand-yellow p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em]">
                    Deep dives
                  </p>
                  <p className="mt-1 font-rethink-sans text-3xl font-extrabold">
                    3
                  </p>
                </div>
                <div className="bg-white p-3">
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em]">
                    Search switch
                  </p>
                  <p className="mt-1 font-rethink-sans text-3xl font-extrabold">
                    Optional
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="tools" className="container mx-auto px-6 py-16 md:py-20">
          <div className="mb-10 max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
              At a glance
            </p>
            <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
              The main tree-planting tools at a glance
            </h2>
            <p className="mt-4 text-lg leading-8 text-neutral-700">
              This table stays shallow on purpose. It orients; the linked pages
              go deep.
            </p>
          </div>

          <div className="overflow-x-auto rounded-[28px] border-2 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full min-w-[940px] text-left">
              <thead className="bg-brand-navy text-brand-yellow">
                <tr>
                  {[
                    "Tool",
                    "Type",
                    "How it funds trees",
                    "Search switch?",
                    "Go deeper",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-4 text-sm font-extrabold uppercase tracking-[0.14em]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tools.map((tool) => (
                  <tr
                    key={tool.name}
                    className={
                      tool.featured
                        ? "bg-brand-yellow align-top"
                        : "border-t-2 border-black bg-white align-top"
                    }
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className={`grid h-11 w-11 place-items-center overflow-hidden rounded-xl border-2 border-black ${tool.featured ? "bg-black" : "bg-brand-gray"}`}
                        >
                          <Image
                            src={tool.logo.src}
                            alt={tool.logo.alt}
                            width={34}
                            height={34}
                            className="h-8 w-8 object-contain"
                          />
                        </span>
                        <span className="font-rethink-sans text-xl font-extrabold leading-tight">
                          {tool.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {tool.name === "IdleForest" ? (
                        <>
                          <Link href="/tree-planting-extension" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                            tree-planting extension
                          </Link>
                          {" "}and desktop app
                        </>
                      ) : (
                        tool.type
                      )}
                    </td>
                    <td className="px-5 py-4 text-neutral-700">
                      {tool.funding}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border-2 border-black px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ${tool.switch.startsWith("No") ? "bg-brand-yellow" : "bg-white"}`}
                      >
                        {tool.switch}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {tool.href.startsWith("#") ? (
                        <a
                          href={tool.href}
                          className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
                        >
                          {tool.deeper}
                        </a>
                      ) : (
                        <Link
                          href={tool.href}
                          className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
                        >
                          {tool.deeper}
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="comparisons" className="border-y-4 border-black bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="mb-10 max-w-4xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Comparison directory
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Compare IdleForest with each tool
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {comparisonCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="group flex h-full flex-col rounded-[24px] border-2 border-black bg-brand-gray p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
                >
                  <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight group-hover:underline">
                    {card.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-7 text-neutral-700">
                    {card.body}
                  </p>
                  <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-navy">
                    {card.cta} <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.78fr_1.22fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Where IdleForest fits
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                A passive layer, not another habit
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-neutral-700">
              <p>
                Most tools ask you to change something, switch your search
                engine, shop a certain way, or run a focus timer. IdleForest
                funds verified planting from bandwidth you are not using, so it
                adds impact without changing how you browse, and it stacks on
                top of any of the tools above.
              </p>
              <p>
                The trees are traceable through named partners and a live
                counter. Read{" "}
                <Link
                  href="/how-it-works"
                  className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
                >
                  how it works
                </Link>{" "}
                or check the{" "}
                <Link
                  href="/transparency"
                  className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
                >
                  verified planting records
                </Link>
                .
              </p>
              <div className="rounded-[24px] border-2 border-black bg-brand-yellow p-5 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold">
                  Looking for alternatives, not comparisons? If you want a list
                  of options to replace Ecosia rather than a head-to-head, see
                  our{" "}
                  <Link
                    href="/ecosia-alternatives"
                    className="underline decoration-2 underline-offset-4 hover:text-brand-navy"
                  >
                    Ecosia alternatives
                  </Link>{" "}
                  guide.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y-4 border-black bg-brand-navy text-brand-yellow">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:py-20 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-yellow/65">
                Trust signals
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Why people choose IdleForest
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <ProofPill>
                4.8 stars across 33 Chrome Web Store reviews
              </ProofPill>
              <ProofPill>1,000+ users</ProofPill>
              <ProofPill>Named planting partners with a live counter</ProofPill>
              <ProofPill>Open-source code</ProofPill>
              <ProofPill>Made in Lisbon</ProofPill>
              <Link
                href="/transparency"
                className="inline-flex items-center gap-2 rounded-full border-2 border-brand-yellow bg-brand-yellow px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(224,241,70,0.35)] hover:bg-white"
              >
                Verified planting records <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                FAQ
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Tree-planting tool comparisons: common questions
              </h2>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <section
                  key={faq.question}
                  className="rounded-2xl border-2 border-black bg-white p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-yellow font-candu text-lg font-extrabold text-black">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-rethink-sans text-xl font-extrabold leading-tight">
                        {faq.question}
                      </h3>
                      <p className="mt-2 leading-7 text-neutral-700">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto grid gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-black/55">
                Start passive
              </p>
              <h2 className="mt-3 font-rethink-sans text-[38px] font-extrabold leading-tight sm:text-5xl">
                Not sure which to pick? Start passive.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-black/75">
                Whatever else you use, IdleForest adds verified planting in the
                background with no switch and no effort. Add it, then explore
                the detailed comparisons above.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-auto rounded-full border-2 border-black bg-brand-navy px-7 py-4 text-base font-bold text-brand-yellow shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none"
              >
                <Link
                  href="/download/chrome"
                  className="inline-flex items-center gap-2"
                >
                  <Image src="/chrome.png" alt="" width={22} height={22} />
                  Add IdleForest to Chrome <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-full border-2 border-black bg-white px-7 py-4 text-base font-bold hover:bg-black hover:text-brand-yellow"
              >
                <Link href="/how-it-works">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
