import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  Apple,
  ArrowRight,
  ExternalLink,
  Leaf,
  MonitorDown,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trees,
  Wifi,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { plantingsData } from "@/lib/plantings";
import { routeAlternates } from "@/lib/i18n-routes";

const title = "Best Ecosia Alternatives: No Search Switch | IdleForest";
const description =
  "Looking for Ecosia alternatives? Compare the best green search engines, or skip the switch: IdleForest plants verified trees on any browser, for free.";
const canonical = "https://www.idleforest.com/ecosia-alternatives/";

const totalTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0);

const alternatives = [
  {
    name: "IdleForest",
    type: "Extension and desktop app",
    impact: "Idle bandwidth funds verified trees",
    switchSearch: "No, stacks on any browser",
    bestFor: "Effortless extra impact",
    href: "/download/chrome",
  },
  {
    name: "Ecosia",
    type: "Search engine",
    impact: "Search ad revenue funds tree planting",
    switchSearch: "Yes",
    bestFor: "Everyday eco searching",
    href: "https://www.ecosia.org/",
  },
  {
    name: "OceanHero",
    type: "Search engine",
    impact: "Search revenue recovers ocean plastic",
    switchSearch: "Yes",
    bestFor: "Ocean-focused impact",
    href: "https://oceanhero.today/",
  },
  {
    name: "Search for Trees",
    type: "Search engine",
    impact: "Google-powered, funds trees",
    switchSearch: "Yes",
    bestFor: "Google-style results plus trees",
    href: "https://www.searchfortrees.com/",
  },
  {
    name: "Lilo",
    type: "Search engine",
    impact: "You pick the cause",
    switchSearch: "Yes",
    bestFor: "Custom causes",
    href: "https://lilo.org/",
  },
  {
    name: "TreeClicks",
    type: "Extension and app",
    impact: "Shopping affiliate fees fund trees",
    switchSearch: "No, stacks on top",
    bestFor: "Online shoppers",
    href: "https://www.treeclicks.com/",
  },
  {
    name: "DuckDuckGo",
    type: "Search engine",
    impact: "Privacy plus carbon offset",
    switchSearch: "Yes",
    bestFor: "Privacy first",
    href: "https://duckduckgo.com/",
  },
];

const groupedAlternatives = [
  {
    eyebrow: "Search engines that fund the planet",
    icon: <Search className="h-6 w-6" />,
    items: [
      {
        name: "OceanHero",
        body: "A search engine that funds ocean-plastic recovery, about one bottle for every five searches, with partners like Plastic Bank. Best for ocean-focused impact.",
        href: "https://oceanhero.today/",
      },
      {
        name: "Search for Trees",
        body: "A tree-planting search engine powered by Google rather than Bing, directing about 60% of revenue to planting. Best for people who want Google-style results plus reforestation.",
        href: "https://www.searchfortrees.com/",
      },
      {
        name: "Lilo",
        body: "A search engine that lets you direct ad revenue to a cause you choose, from reforestation to clean water. Best for choosing your own cause.",
        href: "https://lilo.org/",
      },
      {
        name: "Ekoru",
        body: "A search engine focused on ocean and marine conservation. Best for ocean and water causes.",
      },
    ],
  },
  {
    eyebrow: "The privacy-first option",
    icon: <ShieldCheck className="h-6 w-6" />,
    items: [
      {
        name: "DuckDuckGo",
        body: "Not an eco search engine as such, but it does not track you and offsets its carbon footprint. Best for privacy with a lighter footprint.",
        href: "https://duckduckgo.com/",
      },
    ],
  },
  {
    eyebrow: "No-switch tools that stack on top (like IdleForest)",
    icon: <ShoppingBag className="h-6 w-6" />,
    items: [
      {
        name: "TreeClicks",
        body: "A browser extension and app that funds tree planting from affiliate fees when you shop at 50,000+ partner stores, at no extra cost. Best for frequent online shoppers.",
        href: "https://www.treeclicks.com/",
      },
      {
        name: "Tab for a Cause",
        body: "A new-tab extension that sends ad revenue to causes including tree planting. Best for people who open a lot of tabs.",
        href: "https://tabforacause.org/",
      },
    ],
  },
];

const productIcons: Record<string, string> = {
  IdleForest: "/android-chrome-512x512.png",
  Ecosia: "https://www.google.com/s2/favicons?domain=ecosia.org&sz=128",
  OceanHero: "https://www.google.com/s2/favicons?domain=oceanhero.today&sz=128",
  "Search for Trees": "https://www.searchfortrees.com/favicon.ico",
  Lilo: "https://www.google.com/s2/favicons?domain=lilo.org&sz=128",
  Ekoru: "https://www.google.com/s2/favicons?domain=ekoru.org&sz=128",
  TreeClicks: "https://www.google.com/s2/favicons?domain=treeclicks.com&sz=128",
  DuckDuckGo: "https://www.google.com/s2/favicons?domain=duckduckgo.com&sz=128",
  "Tab for a Cause": "https://www.google.com/s2/favicons?domain=tabforacause.org&sz=128",
};

const faqs = [
  {
    question: "What is the best alternative to Ecosia?",
    answer:
      "It depends on what you want. For a search engine, OceanHero and Search for Trees are strong eco options and DuckDuckGo is the privacy pick. If you would rather not switch search engines, IdleForest adds verified tree planting on top of the browser you already use.",
  },
  {
    question: "Are there search engines like Ecosia?",
    answer:
      "Yes. OceanHero, Search for Trees, Lilo, and Ekoru all fund environmental causes from search revenue, much like Ecosia. Each works only when you set it as your default.",
  },
  {
    question: "Are there apps or browser extensions like Ecosia?",
    answer:
      "Yes. IdleForest, TreeClicks, and Tab for a Cause are extensions that fund tree planting without replacing your search engine, so they work alongside Ecosia or any browser.",
  },
  {
    question: "Is there an Ecosia alternative without AI?",
    answer:
      "If you want to avoid the AI chat experience, you can keep a classic search engine like DuckDuckGo and add IdleForest for impact, which keeps your setup simple and AI-free.",
  },
  {
    question: "Is there a free Ecosia alternative?",
    answer:
      "Yes. Every option here is free to use. IdleForest is funded by idle-bandwidth revenue, the eco search engines by ad revenue, and TreeClicks by shopping affiliate fees.",
  },
  {
    question: "Do Ecosia alternatives really plant trees?",
    answer:
      "The credible ones publish records. IdleForest names its partners (Trees for the Future, Tree-Nation, 1ClickImpact) and shows a live counter on its transparency page, so the trees are traceable rather than a marketing claim.",
  },
  {
    question: "Can I use an Ecosia alternative and Ecosia together?",
    answer:
      "Yes. Because IdleForest, TreeClicks, and Tab for a Cause are not search engines, you can run them on top of Ecosia and stack the impact rather than choosing one.",
  },
  {
    question: "Which Ecosia alternative needs the least effort?",
    answer:
      "IdleForest. After a one-click install it runs in the background with no habit to change, while search-engine alternatives need you to switch your default and shopping tools need you to shop.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best Ecosia alternatives",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "IdleForest", url: "https://www.idleforest.com/" },
      { "@type": "ListItem", position: 2, name: "OceanHero", url: "https://oceanhero.today/" },
      { "@type": "ListItem", position: 3, name: "Search for Trees" },
      { "@type": "ListItem", position: 4, name: "Lilo", url: "https://lilo.org/" },
      { "@type": "ListItem", position: 5, name: "TreeClicks", url: "https://www.treeclicks.com/" },
      { "@type": "ListItem", position: 6, name: "DuckDuckGo", url: "https://duckduckgo.com/" },
      { "@type": "ListItem", position: 7, name: "Tab for a Cause", url: "https://tabforacause.org/" },
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
      { "@type": "ListItem", position: 2, name: "Ecosia Alternatives", item: canonical },
    ],
  },
];

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title,
    description,
    keywords: [
      "ecosia alternatives",
      "ecosia alternative",
      "browsers like ecosia",
      "apps like ecosia",
      "sites like ecosia",
      "search engines like ecosia",
    ],
    alternates: routeAlternates("/ecosia-alternatives", params.locale),
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
          alt: "Best Ecosia alternatives",
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
}

function ExternalAlternativeLink({ href, children }: { href?: string; children: ReactNode }) {
  if (!href) {
    return <span className="font-bold text-neutral-600">{children}</span>;
  }

  if (href.startsWith("http")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
        {children} <ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link href={href} className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
      {children}
    </Link>
  );
}

function StarRating() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <span className="font-candu text-2xl leading-none">4.8</span>
      <div className="flex gap-0.5 text-brand-navy" aria-label="4.8 star rating">
        {[0, 1, 2, 3, 4].map((item) => (
          <Star key={item} className="h-4 w-4 fill-current text-brand-yellow stroke-black" />
        ))}
      </div>
      <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">33 reviews</span>
    </div>
  );
}

function ChromeStorePanel() {
  return (
    <aside className="overflow-hidden rounded-[32px] border-2 border-black bg-white text-black shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-brand-navy p-6 text-brand-yellow">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Image src="/logo.png" alt="IdleForest logo" width={42} height={42} />
            </div>
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow/65">
                IdleForest
              </p>
              <h2 className="font-rethink-sans text-3xl font-extrabold leading-tight">
                Desktop app + extension
              </h2>
            </div>
          </div>
          <span className="rounded-full bg-brand-yellow px-3 py-1 text-xs font-extrabold uppercase text-black">
            No switch
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {[
            { label: "Windows", icon: <MonitorDown className="h-5 w-5" /> },
            { label: "Mac", icon: <Apple className="h-5 w-5" /> },
            { label: "Chrome", icon: <Image src="/chrome.png" alt="" width={20} height={20} /> },
            { label: "Edge", icon: <Image src="/edge.png" alt="" width={20} height={20} /> },
          ].map((platform) => (
            <span key={platform.label} className="inline-flex items-center gap-2 rounded-full border-2 border-brand-yellow bg-white px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.12em] text-black">
              {platform.icon}
              {platform.label}
            </span>
          ))}
        </div>
        <div className="mt-5 rounded-2xl border-2 border-brand-yellow bg-white/5 p-4">
          <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow/65">
            Chrome Web Store proof
          </p>
          <StarRating />
        </div>
      </div>

      <div className="grid gap-3 p-5 sm:grid-cols-3">
        {[
          ["Browser closed?", "Yes"],
          ["Desktop", "Mac + Win"],
          ["Trees", totalTrees.toLocaleString()],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border-2 border-black bg-brand-gray p-4 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
            <p className="mt-1 font-candu text-3xl leading-none text-brand-navy">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 border-t-2 border-black bg-brand-yellow p-5 sm:grid-cols-2">
        <Link href="/download/windows" className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-brand-navy px-5 py-3 text-center font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none">
          <MonitorDown className="h-5 w-5" />
          Windows
        </Link>
        <Link href="/download/mac" className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 text-center font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-brand-yellow hover:shadow-none">
          <Apple className="h-5 w-5" />
          Mac
        </Link>
      </div>
    </aside>
  );
}

function MiniMark({ children, featured = false }: { children: ReactNode; featured?: boolean }) {
  return (
    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 border-black font-candu text-2xl font-extrabold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${featured ? "bg-brand-navy text-brand-yellow" : "bg-brand-yellow text-black"}`}>
      {children}
    </div>
  );
}

function ProductIcon({ name, featured = false }: { name: string; featured?: boolean }) {
  const src = productIcons[name];

  if (!src) {
    return <MiniMark featured={featured}>{initials(name)}</MiniMark>;
  }

  const iconClassName = "max-h-9 max-w-9 object-contain";
  const iconAlt = `${name} logo`;

  return (
    <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${featured ? "bg-brand-navy" : "bg-white"}`}>
      {src.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={iconAlt} width={34} height={34} className={iconClassName} />
      ) : (
        <Image src={src} alt={iconAlt} width={34} height={34} className={iconClassName} />
      )}
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const idleForestFeatures = [
  {
    icon: <MonitorDown className="h-6 w-6" />,
    title: "Keeps running on desktop",
    body: "The desktop app can keep working while your computer is on.",
  },
  {
    icon: <Apple className="h-6 w-6" />,
    title: "Mac + Windows",
    body: "Useful if you spend a lot of time on your laptop or desktop.",
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    title: "No search switch",
    body: "Keep the search engine and browser you already use.",
  },
  {
    icon: <Trees className="h-6 w-6" />,
    title: "Verified trees",
    body: `${totalTrees.toLocaleString()} trees in public planting records.`,
  },
];

export default function EcosiaAlternativesPage() {
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
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Leaf className="h-4 w-4" />
                ecosia alternatives
              </p>
              <h1 className="font-rethink-sans text-[42px] font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                The Best Ecosia Alternatives, Starting With the One You Don&apos;t Have to Switch To
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                Most Ecosia alternatives ask you to change your default search engine. This guide ranks the
                genuine options, including{" "}
                <Link href="/eco-friendly-search-engine" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                  eco-friendly search engines
                </Link>
                , and starts with the simplest: keep the browser you already use and add
                IdleForest, a free extension that funds verified tree planting in the background, or{" "}
                <Link href="/compare" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                  compare all alternatives side by side
                </Link>{" "}
                for a full breakdown.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-auto rounded-full border-2 border-black bg-brand-navy px-7 py-4 text-base font-bold text-brand-yellow shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none">
                  <Link href="/download/chrome" className="inline-flex items-center gap-2">
                    <Image src="/chrome.png" alt="" width={22} height={22} />
                    Add IdleForest to Chrome, It&apos;s Free
                  </Link>
                </Button>
                <Button asChild variant="outline" className="h-auto rounded-full border-2 border-black bg-white px-7 py-4 text-base font-bold hover:bg-black hover:text-brand-yellow">
                  <a href="#comparison" className="inline-flex items-center gap-2">
                    Compare all alternatives <ArrowRight className="h-5 w-5" />
                  </a>
                </Button>
              </div>
              <p className="mt-5 max-w-2xl rounded-2xl border-2 border-black bg-white px-4 py-3 text-sm font-bold leading-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                Rated 4.8 across 33 Chrome Web Store reviews. Used by 1,000+ people. Verified planting
                partners with a live tree counter.
              </p>
            </div>

            <ChromeStorePanel />
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Fair context
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Why look beyond Ecosia?
              </h2>
            </div>
            <div className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-5 text-lg leading-8 text-neutral-700">
                <p>
                  <a href="https://www.ecosia.org/" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">Ecosia</a>
                  {" "}is a genuine pioneer: it has funded over 160 million trees since 2009 and publishes its
                  finances. The friction is that it only works when you make Ecosia your default search engine
                  and change a daily habit.
                </p>
                <p>
                  Its results are powered by Bing, so people who prefer Google-style results often look
                  elsewhere.
                </p>
                <p>
                  More recently, Ecosia&apos;s move into an AI chat experience pushed some users to search for an
                  Ecosia alternative without AI. Different people leave for different reasons: results quality,
                  privacy, a different cause, or simply not wanting to switch search engines at all.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/ecosia" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-5 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-white">
                  use IdleForest with Ecosia <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-brand-yellow">
                  blog comparison
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y-4 border-black bg-brand-navy text-brand-yellow">
          <div className="container mx-auto grid gap-10 px-6 py-16 md:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-yellow/65">
                No-switch alternative
              </p>
              <h2 className="mt-3 font-rethink-sans text-[38px] font-extrabold leading-tight sm:text-5xl">
                The no-switch alternative: IdleForest
              </h2>
              <div className="mt-5 space-y-5 text-lg leading-8 text-brand-yellow/85">
                <p>
                  IdleForest is not another search engine, so there is nothing to switch. It is a free{" "}
                  <Link href="/tree-planting-extension" className="font-bold underline decoration-2 underline-offset-4 hover:text-white">
                    tree-planting Chrome extension
                  </Link>
                  , Firefox, and Edge extension (plus a desktop app) that you add on top of whatever you already
                  use, including Ecosia, Google, Brave, or DuckDuckGo.
                </p>
                <p>
                  It funds verified tree planting with the internet bandwidth you are not using, through small
                  sessionless background tasks. No signup, no donation, no change to how you browse.
                </p>
                <p>
                  The trees are traceable: named partners (Trees for the Future, Tree-Nation, 1ClickImpact),
                  published records, and a live counter on the transparency page.
                </p>
                <p>
                  If you want a single tool that replaces Ecosia, IdleForest is not it. If you want more impact
                  without giving anything up, it is the easiest choice on this page.
                </p>
              </div>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="h-auto rounded-full border-2 border-brand-yellow bg-brand-yellow px-7 py-4 text-base font-bold text-black shadow-[5px_5px_0px_0px_rgba(224,241,70,0.28)] hover:bg-white">
                  <Link href="/download/chrome" className="inline-flex items-center gap-2">
                    <Image src="/chrome.png" alt="" width={22} height={22} />
                    Add IdleForest to Chrome <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {idleForestFeatures.map((item) => (
                <article key={item.title} className="rounded-[28px] border-2 border-brand-yellow bg-white p-5 text-black shadow-[7px_7px_0px_0px_rgba(224,241,70,0.28)]">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 font-rethink-sans text-2xl font-extrabold leading-tight">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">{item.body}</p>
                </article>
              ))}
              <div className="flex flex-wrap gap-3 text-sm font-bold sm:col-span-2">
                <Link href="/how-it-works" className="underline decoration-2 underline-offset-4 hover:text-white">
                  how idle bandwidth funds trees
                </Link>
                <Link href="/transparency" className="underline decoration-2 underline-offset-4 hover:text-white">
                  verified planting records
                </Link>
                <Link href="/tree-planting-extension" className="underline decoration-2 underline-offset-4 hover:text-white">
                  tree-planting Chrome extension
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
              Browsers, apps, sites, and search engines like Ecosia
            </p>
            <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
              Other Ecosia alternatives, by what you care about
            </h2>
          </div>

          <div className="mt-12 grid gap-8">
            {groupedAlternatives.map((group, groupIndex) => (
              <section key={group.eyebrow} className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
                <div className={`rounded-[28px] border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${groupIndex === 1 ? "bg-brand-yellow" : "bg-white"}`}>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-navy text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {group.icon}
                  </div>
                  <h3 className="font-rethink-sans text-3xl font-extrabold leading-tight">{group.eyebrow}</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {group.items.map((item) => (
                    <article key={item.name} className="rounded-[28px] border-2 border-black bg-brand-gray p-5 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1">
                      <div className="flex gap-4">
                        <ProductIcon name={item.name} />
                        <div>
                          <h4 className="font-rethink-sans text-2xl font-extrabold leading-tight">{item.name}</h4>
                          <p className="mt-2 text-sm leading-6 text-neutral-700">{item.body}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <span className="rounded-full border-2 border-black bg-white px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em]">
                          {groupIndex === 2 ? "keeps search" : "changes search"}
                        </span>
                        <ExternalAlternativeLink href={item.href}>Visit</ExternalAlternativeLink>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section id="comparison" className="border-y-4 border-black bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <h2 className="font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Ecosia alternatives compared
              </h2>
              <p className="mt-4 text-lg leading-8 text-neutral-700">
                The search engines do real good, but each asks you to switch. IdleForest and TreeClicks are the
                two that add impact without a switch, and IdleForest is the one that runs with zero effort.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-[28px] border-2 border-black bg-brand-gray shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <table className="w-full min-w-[920px] text-left">
                <thead className="bg-brand-navy text-brand-yellow">
                  <tr>
                    {["Alternative", "What it is", "How it helps the planet", "Switch search engine?", "Best for"].map((heading) => (
                      <th key={heading} className="px-5 py-4 text-sm font-extrabold uppercase tracking-[0.14em]">
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {alternatives.map((alternative, index) => {
                    const isRecommended = index === 0;
                    const noSwitch = alternative.switchSearch.startsWith("No");

                    return (
                    <tr key={alternative.name} className={isRecommended ? "bg-brand-yellow" : "border-t-2 border-black bg-white"}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {isRecommended ? (
                            <ProductIcon name={alternative.name} featured />
                          ) : (
                            <ProductIcon name={alternative.name} />
                          )}
                          <div>
                            <p className="font-rethink-sans text-xl font-extrabold leading-tight">
                              <ExternalAlternativeLink href={alternative.href}>{alternative.name}</ExternalAlternativeLink>
                            </p>
                            {isRecommended && (
                              <span className="mt-1 inline-flex rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                                Recommended
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-700">{alternative.type}</td>
                      <td className="px-5 py-4 text-neutral-700">{alternative.impact}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border-2 border-black px-3 py-1 text-xs font-extrabold ${noSwitch ? "bg-brand-yellow" : "bg-white"}`}>
                          {alternative.switchSearch}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-700">{alternative.bestFor}</td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Trust signals
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Why people trust IdleForest
              </h2>
              <p className="mt-4 text-lg leading-8 text-neutral-700">
                4.8 stars across 33 Chrome Web Store reviews, Featured status, 1,000+ users, named planting
                partners with a live counter, a public team in Lisbon, and open-source code on GitHub.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-[28px] border-2 border-black bg-brand-yellow p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-black bg-white">
                    <MonitorDown className="h-7 w-7 text-brand-navy" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/55">Desktop app</p>
                    <p className="font-rethink-sans text-2xl font-extrabold">Mac + Windows</p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-black/75">
                  Runs in the background while your computer is on, even when the browser is closed.
                </p>
              </article>
              <article className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-black bg-brand-gray">
                    <Image src="/chrome.png" alt="Chrome logo" width={34} height={34} />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-neutral-500">Chrome Web Store</p>
                    <p className="font-rethink-sans text-2xl font-extrabold">Featured</p>
                  </div>
                </div>
                <StarRating />
              </article>
              {[
                ["1,000+", "users", "People using IdleForest."],
                ["Partners", "named", "Trees for the Future, Tree-Nation, and 1ClickImpact."],
                ["Open", "code", "Public team in Lisbon and code on GitHub."],
              ].map(([metric, label, body]) => (
                <article key={metric} className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
                  <p className="font-candu text-5xl leading-none text-brand-navy">{metric}</p>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
                  <p className="mt-3 text-sm leading-6 text-neutral-700">{body}</p>
                </article>
              ))}
              <article className="rounded-[28px] border-2 border-black bg-brand-yellow p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] md:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-candu text-5xl leading-none">{totalTrees.toLocaleString()}</p>
                    <p className="mt-2 font-bold text-black/75">trees in current public planting records</p>
                  </div>
                  <Link href="/transparency" className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-black bg-brand-navy px-5 py-3 font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none">
                    See records <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y-4 border-black bg-white">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:py-20 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                FAQ
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Ecosia alternatives: frequently asked questions
              </h2>
            </div>
            <div className="grid gap-4">
              {faqs.map((faq, index) => (
                <section key={faq.question} className="rounded-2xl border-2 border-black bg-brand-gray p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-yellow font-candu text-lg font-extrabold text-black">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-rethink-sans text-xl font-extrabold leading-tight">{faq.question}</h3>
                      <p className="mt-2 leading-7 text-neutral-700">{faq.answer}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-navy py-16 text-brand-yellow md:py-20">
          <div className="container mx-auto grid gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="mt-3 font-rethink-sans text-[38px] font-extrabold leading-tight sm:text-5xl">
                The easiest Ecosia alternative takes one click
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-yellow/80">
                Keep the search engine you like. Add IdleForest and fund verified trees with bandwidth you were
                not using anyway. Free, background, and yours to remove any time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-auto rounded-full border-2 border-brand-yellow bg-brand-yellow px-7 py-4 text-base font-bold text-black hover:bg-white">
                <Link href="/download/chrome" className="inline-flex items-center gap-2">
                  <Image src="/chrome.png" alt="" width={22} height={22} />
                  Add IdleForest to Chrome <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-auto rounded-full border-2 border-brand-yellow bg-transparent px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-yellow hover:text-black">
                <Link href="/how-it-works" className="inline-flex items-center gap-2">
                  See how it works
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
