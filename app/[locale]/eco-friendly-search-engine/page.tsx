import type { Metadata } from "next";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  Apple,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Leaf,
  MonitorDown,
  Search,
  ShieldCheck,
  ShoppingBag,
  Star,
  Trees,
  Waves,
  Wifi,
  Zap,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { plantingsData } from "@/lib/plantings";

/* Hallmark · pre-emit critique: P4 H4 E4 S5 R4 V4 */
const title = "Sustainable Search Engine? Keep Yours, Add IdleForest";
const description =
  "Compare sustainable search engines like Ecosia, OceanHero, and Ekoru, or skip the switch: IdleForest funds verified trees on top of any search engine.";
const canonical = "https://www.idleforest.com/eco-friendly-search-engine";
const chromeWebStoreUrl =
  "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk";
const totalTrees = plantingsData.events.reduce(
  (sum, event) => sum + event.trees,
  0,
);

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "sustainable search engine",
    "eco search engines",
    "environmental search engine",
    "eco friendly search engines",
    "eco search engines besides ecosia",
    "search engine that plants trees",
    "tree planting search engine",
    "green search engine",
    "Ecosia alternative",
    "OceanHero",
    "TreeClicks",
    "Ekoru",
    "plant trees while browsing",
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
        alt: "Sustainable search engine guide",
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

const productIcons: Record<string, string> = {
  IdleForest: "/android-chrome-512x512.png",
  Ecosia: "https://www.google.com/s2/favicons?domain=ecosia.org&sz=128",
  OceanHero: "https://www.google.com/s2/favicons?domain=oceanhero.today&sz=128",
  Ekoru: "https://www.google.com/s2/favicons?domain=ekoru.org&sz=128",
  "Tab for a Cause":
    "https://www.google.com/s2/favicons?domain=tabforacause.org&sz=128",
  TreeClicks: "https://www.google.com/s2/favicons?domain=treeclicks.com&sz=128",
  Lilo: "https://www.google.com/s2/favicons?domain=lilo.org&sz=128",
};

const tools = [
  {
    name: "Ecosia",
    category: "Search engine",
    href: "https://www.ecosia.org/",
    bestFor: "People who are happy to make Ecosia their default.",
    searchSwitch: "Yes",
    action: "Search ad revenue funds tree planting and climate projects.",
    proof: "Financial reports, tree counter, project updates, B Corp status.",
    energy: "Renewable energy and carbon-negative reporting.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "IdleForest",
    category: "Desktop app + extension",
    href: "/download/chrome",
    bestFor: "People who want tree funding without changing search engines.",
    searchSwitch: "No",
    action: "Idle bandwidth funds verified tree planting in the background.",
    proof: "Public planting records, named partners, open-source code.",
    energy: "Works with the search engine you already use.",
    worksWithIdleForest: "Native tool",
  },
  {
    name: "OceanHero",
    category: "Cause-based search engine",
    href: "https://oceanhero.today/",
    bestFor: "People who care most about ocean-plastic cleanup.",
    searchSwitch: "Usually",
    action: "Search activity helps fund plastic recovery.",
    proof: "Plastic recovery certificates and partner explanations.",
    energy: "Ocean impact focus.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "Tab for a Cause",
    category: "New-tab extension",
    href: "https://tabforacause.org/",
    bestFor: "People who open a lot of tabs.",
    searchSwitch: "No, but it changes the new-tab page",
    action: "New-tab ad revenue supports selected nonprofit causes.",
    proof: "Charity donation reporting and user-selected causes.",
    energy: "Not a search engine; it changes the new-tab page.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "TreeClicks",
    category: "Shopping donation tool",
    href: "https://www.treeclicks.com/",
    bestFor: "People who shop online often.",
    searchSwitch: "No",
    action: "Affiliate commissions from partner stores support tree planting.",
    proof: "Affiliate donation model and project reporting.",
    energy: "Not a search engine; it works when you shop.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "Ekoru",
    category: "Eco search engine",
    href: "https://www.ekoru.org/",
    bestFor: "People comparing ocean-focused search engines.",
    searchSwitch: "Yes",
    action: "Search revenue supports ocean and environmental causes.",
    proof: "Ocean-focused claims, hydro-powered hosting, privacy statements.",
    energy: "Hydro-powered servers.",
    worksWithIdleForest: "Yes",
  },
];

const criteria = [
  {
    title: "What it funds",
    icon: <Trees className="h-6 w-6" />,
    body: "The clearest signal is where the money goes. Ecosia funds tree planting from search ad revenue, OceanHero funds ocean-plastic recovery, and others back mixed causes. Look for a named use of profits, not a vague pledge.",
  },
  {
    title: "How servers are powered",
    icon: <Zap className="h-6 w-6" />,
    body: "Search runs on data centres, so energy matters. The strongest options run on renewable energy and aim for carbon neutral or carbon negative operations. Ecosia runs on renewable energy and reports being carbon-negative; Ekoru hosts on hydro power.",
  },
  {
    title: "How it treats your data",
    icon: <ShieldCheck className="h-6 w-6" />,
    body: "A sustainable search engine should also respect you: no tracking, no profiling, no selling search history. Privacy and sustainability tend to travel together among the credible options.",
  },
  {
    title: "How transparent it is",
    icon: <CheckCircle2 className="h-6 w-6" />,
    body: "Published financial or impact reports, a public counter, and third-party marks like B Corp turn claims into evidence. Ecosia publishes reports and is a certified B Corp.",
  },
];

const setupCards = [
  {
    icon: <Search className="h-6 w-6" />,
    title: "Searches",
    body: "Use Ecosia, OceanHero, or Ekoru if you want the search engine itself to fund a cause.",
  },
  {
    icon: <MonitorDown className="h-6 w-6" />,
    title: "Desktop time",
    body: "Use IdleForest on Mac or Windows if you want tree funding to keep going while your computer is on.",
  },
  {
    icon: <ShoppingBag className="h-6 w-6" />,
    title: "Tabs and shopping",
    body: "Use tools like Tab for a Cause or TreeClicks for browsing moments that are not searches.",
  },
];

const hubLinks = [
  {
    href: "/ecosia-alternatives",
    title: "Full Ecosia alternatives guide",
    body: "Compare green search engines and tools that do not replace search.",
  },
  {
    href: "/tree-planting-extension",
    title: "tree-planting Chrome extension",
    body: "See how the Chrome extension helps fund verified tree planting.",
  },
  {
    href: "/ecosia",
    title: "Use IdleForest with Ecosia",
    body: "Keep Ecosia for searches and add IdleForest beside it.",
  },
  {
    href: "/compare/idleforest-vs-ecosia-vs-treeclicks",
    title: "IdleForest vs Ecosia vs TreeClicks",
    body: "Compare search-based planting, background tree funding, and shopping donations.",
  },
  {
    href: "/ecosia",
    title: "Ecosia financial and tree data",
    body: "Explore Ecosia income, expenses, and historical tree-planting metrics.",
  },
  {
    href: "/is-ecosia-legit-safe",
    title: "Is Ecosia legit and safe?",
    body: "Review Ecosia privacy, search partners, financial reports, and tree proof.",
  },
  {
    href: "/blog/does-ecosia-actually-plant-trees",
    title: "Does Ecosia actually plant trees?",
    body: "Look at the reports, partners, and monitoring behind Ecosia's claims.",
  },
  {
    href: "/blog/what-is-ecosia-chat-and-how-to-use-it",
    title: "What is Ecosia Chat?",
    body: "Understand Ecosia's AI assistant and where it fits in eco-conscious browsing.",
  },
];

const faqs = [
  {
    question: "What is the most sustainable search engine?",
    answer:
      "Ecosia is the best-known, with tree funding, renewable-powered servers, B Corp status, and published reports. Ekoru and OceanHero are strong for ocean causes. The most sustainable setup for many people is to keep a good search engine and add a passive layer like IdleForest on top.",
  },
  {
    question: "What makes a search engine sustainable?",
    answer:
      "Four things: what it funds, whether its servers run on renewable energy, whether it respects your privacy, and how transparent it is about results and impact.",
  },
  {
    question: "Are there eco search engines besides Ecosia?",
    answer:
      "Yes. OceanHero, Ekoru, and Lilo all fund environmental or social causes from search revenue. IdleForest is not a search engine but adds verified tree funding alongside any of them.",
  },
  {
    question: "Is an environmental search engine actually effective?",
    answer:
      "It helps, but search is one slice of your online time. Pairing an eco search engine with a passive layer like IdleForest covers the hours between searches, where most browsing time goes.",
  },
  {
    question: "What search engine plants trees?",
    answer:
      "Ecosia is the best-known search engine that funds tree planting from search ad revenue. IdleForest works alongside Ecosia and helps fund trees passively while your browser or desktop app is running.",
  },
  {
    question: "What is the best Ecosia alternative?",
    answer:
      "If you want another search engine, compare OceanHero and Ekoru. If you want tree impact without switching search engines, IdleForest works with Ecosia, Google, Brave, and DuckDuckGo.",
  },
  {
    question: "Can I use more than one eco browsing tool?",
    answer:
      "Yes. The strongest setup is layered: an eco search engine for searches, IdleForest for passive browsing, and tools like TreeClicks for shopping-triggered donations.",
  },
  {
    question: "Is an eco-friendly search engine enough?",
    answer:
      "It helps, but search is only one browsing behavior. A passive layer like IdleForest covers the time between searches, while shopping and new-tab tools cover other moments.",
  },
  {
    question:
      "Do I have to stop using Google, DuckDuckGo, Brave, or Ecosia to use IdleForest?",
    answer:
      "No. IdleForest does not change your default search engine, homepage, or new-tab page. It runs alongside your existing setup.",
  },
];

const schemas = [
  {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Sustainable and eco-friendly search engines and tools",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ecosia",
        url: "https://www.ecosia.org/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "IdleForest",
        url: "https://www.idleforest.com/",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "OceanHero",
        url: "https://oceanhero.today/",
      },
      { "@type": "ListItem", position: 4, name: "Ekoru" },
      {
        "@type": "ListItem",
        position: 5,
        name: "Tab for a Cause",
        url: "https://tabforacause.org/",
      },
      {
        "@type": "ListItem",
        position: 6,
        name: "TreeClicks",
        url: "https://www.treeclicks.com/",
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
        name: "Sustainable Search Engines",
        item: canonical,
      },
    ],
  },
];

function ProductIcon({
  name,
  featured = false,
}: {
  name: string;
  featured?: boolean;
}) {
  const src = productIcons[name];

  if (!src) {
    return (
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-black bg-brand-yellow font-candu text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {name.slice(0, 2).toUpperCase()}
      </div>
    );
  }

  const className = "max-h-9 max-w-9 object-contain";
  const alt = `${name} logo`;

  return (
    <div
      className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${featured ? "bg-brand-navy" : "bg-white"}`}
    >
      {src.startsWith("http") ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} width={34} height={34} className={className} />
      ) : (
        <Image
          src={src}
          alt={alt}
          width={34}
          height={34}
          className={className}
        />
      )}
    </div>
  );
}

function ExternalToolLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
      >
        {children}
        <ExternalLink className="h-4 w-4" />
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy"
    >
      {children}
    </Link>
  );
}

function StarRating() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-3 py-2 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
      <span className="font-candu text-2xl leading-none">4.8</span>
      <div className="flex gap-0.5" aria-label="4.8 star rating">
        {[0, 1, 2, 3, 4].map((item) => (
          <Star
            key={item}
            className="h-4 w-4 fill-current text-brand-yellow stroke-black"
          />
        ))}
      </div>
      <span className="text-xs font-extrabold uppercase tracking-[0.14em] text-neutral-500">
        33 reviews
      </span>
    </div>
  );
}

function DesktopPanel() {
  return (
    <aside className="overflow-hidden rounded-[32px] border-2 border-black bg-white text-black shadow-[14px_14px_0px_0px_rgba(0,0,0,1)]">
      <div className="bg-brand-navy p-6 text-brand-yellow">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <ProductIcon name="IdleForest" featured />
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow/65">
                No search switch
              </p>
              <h2 className="font-rethink-sans text-3xl font-extrabold leading-tight">
                Desktop app + extension
              </h2>
            </div>
          </div>
          <span className="w-fit rounded-full bg-brand-yellow px-3 py-1 text-xs font-extrabold uppercase text-black">
            No default change
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {[
            { label: "Windows", icon: <MonitorDown className="h-5 w-5" /> },
            { label: "Mac", icon: <Apple className="h-5 w-5" /> },
            {
              label: "Chrome",
              icon: <Image src="/chrome.png" alt="" width={20} height={20} />,
            },
            {
              label: "Edge",
              icon: <Image src="/edge.png" alt="" width={20} height={20} />,
            },
          ].map((platform) => (
            <span
              key={platform.label}
              className="inline-flex items-center gap-2 rounded-full border-2 border-brand-yellow bg-white px-3 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-black"
            >
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
          ["Search switch?", "No"],
          ["Desktop", "Mac + Win"],
          ["Trees", totalTrees.toLocaleString()],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border-2 border-black bg-brand-gray p-4 text-center"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              {label}
            </p>
            <p className="mt-1 font-candu text-3xl leading-none text-brand-navy">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 border-t-2 border-black bg-brand-yellow p-5 sm:grid-cols-2">
        <Link
          href="/downloads"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-brand-navy px-5 py-3 text-center font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none"
        >
          <MonitorDown className="h-5 w-5" />
          Desktop app
        </Link>
        <Link
          href="/download/chrome"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 text-center font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-brand-yellow hover:shadow-none"
        >
          <Image src="/chrome.png" alt="" width={22} height={22} />
          Chrome
        </Link>
      </div>
    </aside>
  );
}

export default function EcoFriendlySearchEnginePage() {
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
          <div className="container mx-auto grid gap-10 px-6 py-16 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.78fr)] lg:items-center lg:py-20">
            <div className="min-w-0">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase tracking-wide text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Search className="h-4 w-4" />
                sustainable search engine guide
              </p>
              <h1 className="font-rethink-sans text-[42px] font-extrabold leading-tight sm:text-6xl lg:text-7xl">
                The Most Sustainable Search Engine Setup Is the One You Don't
                Switch To
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                A sustainable search engine funds the planet from your searches,
                but every one of them asks you to switch your default.
                IdleForest takes the other route: a free layer that funds
                verified tree planting on top of Ecosia, Google, Brave, or
                DuckDuckGo, with no switch and no change to how you browse.
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
                    <Image src="/chrome.png" alt="" width={22} height={22} />
                    Add IdleForest to Chrome, It's Free
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-auto rounded-full border-2 border-black bg-white px-7 py-4 text-base font-bold hover:bg-black hover:text-brand-yellow"
                >
                  <Link
                    href="/ecosia"
                    className="inline-flex items-center gap-2"
                  >
                    Use IdleForest with Ecosia{" "}
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </Button>
              </div>
              <p className="mt-5 max-w-2xl text-sm font-bold leading-6 text-neutral-800">
                Rated 4.8 across 33 Chrome Web Store reviews. Verified planting
                partners with a live tree counter.
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <StarRating />
                <span className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                  1,000+ users
                </span>
                <Link
                  href="/transparency"
                  className="rounded-full border-2 border-black bg-white px-4 py-2 text-xs font-extrabold uppercase tracking-[0.14em] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-brand-navy hover:text-brand-yellow"
                >
                  {totalTrees.toLocaleString()} trees verified
                </Link>
              </div>
            </div>

            <DesktopPanel />
          </div>
        </section>

        <section className="container mx-auto px-6 py-14 md:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Practical answer
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                A sustainable search engine helps, but it is not the whole
                story.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  icon: <Leaf className="h-6 w-6" />,
                  title: "Search green",
                  body: "Use Ecosia or another eco search engine if you want searches to fund a cause.",
                },
                {
                  icon: <Wifi className="h-6 w-6" />,
                  title: "Browse normally",
                  body: "Add IdleForest if you want tree funding without changing your default engine.",
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  title: "Cover the gaps",
                  body: "Search engines only help when you search. Other tools can cover desktop time, tabs, or shopping.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border-2 border-black bg-white p-5 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow">
                    {item.icon}
                  </div>
                  <h3 className="mt-5 font-rethink-sans text-2xl font-extrabold leading-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    {item.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y-4 border-black bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="mx-auto max-w-4xl text-center">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Environmental search engine criteria
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                What makes a search engine sustainable?
              </h2>
              <p className="mt-4 text-lg leading-8 text-neutral-700">
                Not every green search engine is sustainable in the same way.
                Four things separate a genuinely sustainable search engine from
                a marketing label.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {criteria.map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border-2 border-black bg-brand-gray p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]"
                >
                  <div className="flex gap-4">
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 leading-7 text-neutral-700">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-10 rounded-[32px] border-2 border-black bg-brand-navy p-6 text-brand-yellow shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
                <div className="flex items-center gap-4">
                  <ProductIcon name="IdleForest" featured />
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-yellow/65">
                      Another route
                    </p>
                    <h3 className="font-rethink-sans text-3xl font-extrabold leading-tight">
                      Keep your search engine. Add IdleForest beside it.
                    </h3>
                  </div>
                </div>
                <p className="text-lg leading-8 text-brand-yellow/80">
                  Every sustainable search engine scores on these by asking you
                  to switch your default. There is a second route none of the
                  guides mention: keep the search engine you already use and add
                  a passive layer. That is what IdleForest does, funding
                  verified trees from idle bandwidth while you browse, with
                  named partners and a live counter on its transparency page.
                  See the{" "}
                  <Link
                    href="/transparency"
                    className="font-bold underline decoration-2 underline-offset-4 hover:text-white"
                  >
                    verified planting records
                  </Link>{" "}
                  and read{" "}
                  <Link
                    href="/how-it-works"
                    className="font-bold underline decoration-2 underline-offset-4 hover:text-white"
                  >
                    how idle bandwidth funds trees
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mb-10 max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
              Eco search engines and tools
            </p>
            <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
              Best sustainable search engines compared
            </h2>
            <p className="mt-4 text-lg leading-8 text-neutral-700">
              These tools often get grouped together, but they work in different
              ways. The main questions are simple: do you have to change search
              engines, what funds the work, and what proof is available?
            </p>
          </div>

          <div className="overflow-x-auto rounded-[28px] border-2 border-black bg-white shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]">
            <table className="w-full min-w-[1280px] text-left">
              <thead className="bg-brand-navy text-brand-yellow">
                <tr>
                  {[
                    "Tool",
                    "Type",
                    "Best for",
                    "Switch?",
                    "Impact",
                    "Proof",
                    "Energy",
                    "Use with IdleForest?",
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
                {tools.map((tool, index) => {
                  const noSwitch = tool.searchSwitch.startsWith("No");
                  const isIdleForest = tool.name === "IdleForest";

                  return (
                    <tr
                      key={tool.name}
                      className={
                        isIdleForest
                          ? "bg-brand-yellow align-top"
                          : "border-t-2 border-black bg-white align-top"
                      }
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <ProductIcon
                            name={tool.name}
                            featured={isIdleForest}
                          />
                          <div>
                            <p className="font-rethink-sans text-xl font-extrabold leading-tight">
                              <ExternalToolLink href={tool.href}>
                                {tool.name}
                              </ExternalToolLink>
                            </p>
                            {isIdleForest ? (
                              <span className="mt-1 inline-flex rounded-full border-2 border-black bg-white px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em]">
                                No search switch
                              </span>
                            ) : (
                              <span className="mt-1 inline-flex font-bold text-neutral-500">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.category}
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.bestFor}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border-2 border-black px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] ${noSwitch ? "bg-brand-yellow" : "bg-white"}`}
                        >
                          {noSwitch ? "No" : "Yes"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.action}
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.proof}
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.energy}
                      </td>
                      <td className="px-5 py-4 text-neutral-700">
                        {tool.worksWithIdleForest}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border-y-4 border-black bg-brand-navy text-brand-yellow">
          <div className="container mx-auto grid gap-10 px-6 py-16 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-yellow/65">
                Search engine that plants trees
              </p>
              <h2 className="mt-3 font-rethink-sans text-[38px] font-extrabold leading-tight sm:text-5xl">
                What search engine plants trees?
              </h2>
              <p className="mt-5 text-lg leading-8 text-brand-yellow/80">
                Ecosia is the best-known answer. It uses search ad revenue to
                fund climate work and tree-planting projects.
              </p>
            </div>
            <div className="grid gap-5">
              {[
                {
                  icon: <ProductIcon name="Ecosia" />,
                  title: "Ecosia helps when you search with Ecosia.",
                  body: "That makes it a real sustainable search engine, but it depends on changing your default search habit.",
                },
                {
                  icon: <ProductIcon name="IdleForest" featured />,
                  title: "IdleForest works beside your search engine.",
                  body: "It can run alongside Ecosia or the search engine you already use, with verified tree funding from spare bandwidth.",
                },
                {
                  icon: <Waves className="h-6 w-6" />,
                  title: "Different tools cover different moments.",
                  body: "Use an eco search engine for searches, IdleForest while your computer is on, and optional tools for tabs or shopping.",
                },
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[28px] border-2 border-brand-yellow bg-white p-5 text-black shadow-[7px_7px_0px_0px_rgba(224,241,70,0.28)]"
                >
                  <div className="flex gap-4">
                    {item.icon}
                    <div>
                      <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-neutral-700">
                        {item.body}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 md:py-20">
          <div className="mb-10 max-w-4xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
              Choose your setup
            </p>
            <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
              Choose by what you are trying to improve
            </h2>
            <p className="mt-4 text-lg leading-8 text-neutral-700">
              You do not have to pick one tool for everything. Choose based on
              the habit you actually want to change, or the habit you would
              rather keep.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {setupCards.map((item) => (
              <article
                key={item.title}
                className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow">
                  {item.icon}
                </div>
                <h3 className="mt-5 font-rethink-sans text-2xl font-extrabold leading-tight">
                  {item.title}
                </h3>
                <p className="mt-3 leading-7 text-neutral-700">{item.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y-4 border-black bg-white">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:py-20 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Ecosia alternatives
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                Prefer a different search engine to Ecosia?
              </h2>
              <p className="mt-4 text-lg leading-8 text-neutral-700">
                If you are specifically weighing Ecosia alternatives, we keep a
                dedicated, up-to-date comparison on a separate page. For
                everyone else, the simplest move is not to switch at all: add
                IdleForest on top of whatever you use today.
              </p>
              <Link
                href="/ecosia-alternatives"
                className="mt-6 inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-5 py-3 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-brand-yellow hover:shadow-none"
              >
                see our full Ecosia alternatives guide{" "}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid gap-4">
              {[
                "You want to keep Google, DuckDuckGo, Brave, or Ecosia.",
                "You already use Ecosia and want tree funding outside searches.",
                "You want proof: partner names, planting records, bandwidth controls, and code you can inspect.",
              ].map((item, index) => (
                <div
                  key={item}
                  className="flex gap-4 rounded-2xl border-2 border-black bg-brand-gray p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]"
                >
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-yellow font-candu text-lg font-extrabold text-black">
                    {index + 1}
                  </span>
                  <p className="font-bold leading-7 text-neutral-800">{item}</p>
                </div>
              ))}
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
                If a tool says it funds trees, it should be easy to check where
                that claim comes from.
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <article className="rounded-[28px] border-2 border-black bg-brand-yellow p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-black bg-white">
                    <MonitorDown className="h-7 w-7 text-brand-navy" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-black/55">
                      Desktop app
                    </p>
                    <p className="font-rethink-sans text-2xl font-extrabold">
                      Mac + Windows
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-black/75">
                  Runs in the background while your computer is on, even after
                  the browser is closed.
                </p>
              </article>
              <article className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]">
                <div className="mb-5 flex items-center gap-3">
                  <span className="grid h-14 w-14 place-items-center rounded-2xl border-2 border-black bg-brand-gray">
                    <Image
                      src="/chrome.png"
                      alt="Chrome logo"
                      width={34}
                      height={34}
                    />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-neutral-500">
                      Chrome Web Store
                    </p>
                    <a
                      href={chromeWebStoreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-rethink-sans text-2xl font-extrabold underline decoration-2 underline-offset-4 hover:text-brand-navy"
                    >
                      Featured <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <StarRating />
              </article>
              {[
                ["1,000+", "users", "People using IdleForest."],
                [
                  "Partners",
                  "named",
                  "Trees for the Future, Tree-Nation, and 1ClickImpact.",
                ],
                ["Open", "code", "Public team in Lisbon and code on GitHub."],
              ].map(([metric, label, body]) => (
                <article
                  key={metric}
                  className="rounded-[28px] border-2 border-black bg-white p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]"
                >
                  <p className="font-candu text-5xl leading-none text-brand-navy">
                    {metric}
                  </p>
                  <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.16em] text-neutral-500">
                    {label}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-neutral-700">
                    {body}
                  </p>
                </article>
              ))}
              <article className="rounded-[28px] border-2 border-black bg-brand-yellow p-6 shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] md:col-span-2">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-candu text-5xl leading-none">
                      {totalTrees.toLocaleString()}
                    </p>
                    <p className="mt-2 font-bold text-black/75">
                      trees in current public planting records
                    </p>
                  </div>
                  <Link
                    href="/transparency"
                    className="inline-flex w-fit items-center gap-2 rounded-full border-2 border-black bg-brand-navy px-5 py-3 font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:shadow-none"
                  >
                    Verified planting records <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="border-y-4 border-black bg-white">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="mb-10 max-w-4xl">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-500">
                Explore the hub
              </p>
              <h2 className="mt-3 font-rethink-sans text-[36px] font-extrabold leading-tight sm:text-5xl">
                More on eco search, proof, and setup choices
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {hubLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group rounded-[24px] border-2 border-black bg-brand-gray p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1"
                >
                  <h3 className="font-rethink-sans text-xl font-extrabold leading-tight group-hover:underline">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-neutral-700">
                    {item.body}
                  </p>
                </Link>
              ))}
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
                Sustainable search engines: common questions
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

        <section className="bg-brand-navy py-16 text-brand-yellow md:py-20">
          <div className="container mx-auto grid gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-brand-yellow/65">
                Simple setup
              </p>
              <h2 className="mt-3 font-rethink-sans text-[38px] font-extrabold leading-tight sm:text-5xl">
                Greener searching, without the switch
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-brand-yellow/80">
                Keep the sustainable search engine you like, or the one you
                already use, and add a verified tree-funding layer on top. Free,
                passive, and yours to remove any time.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-auto rounded-full border-2 border-brand-yellow bg-brand-yellow px-7 py-4 text-base font-bold text-black hover:bg-white"
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
                className="h-auto rounded-full border-2 border-brand-yellow bg-transparent px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-yellow hover:text-black"
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
