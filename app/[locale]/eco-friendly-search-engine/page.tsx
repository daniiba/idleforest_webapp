import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Leaf, Search, ShieldCheck, Trees, Zap } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { SmartCTA } from "@/components/smart-cta";
import { Link } from "@/navigation";

const title = "Eco-Friendly Search Engines: Tree-Planting Search & Ecosia Alternatives";
const description = "Compare eco-friendly search engines, tree-planting search tools, and Ecosia alternatives including IdleForest, OceanHero, Tab for a Cause, TreeClicks, and Ekoru.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "eco friendly search engine",
    "search engine that plants trees",
    "tree planting search engine",
    "green search engine",
    "Ecosia alternative",
    "OceanHero",
    "Tab for a Cause",
    "TreeClicks",
    "Ekoru",
    "plant trees while browsing",
  ],
  alternates: {
    canonical: "https://www.idleforest.com/eco-friendly-search-engine",
  },
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://www.idleforest.com/eco-friendly-search-engine",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const tools = [
  {
    name: "Ecosia",
    category: "Search engine",
    bestFor: "People willing to make Ecosia their default search engine.",
    searchSwitch: "Yes",
    action: "Searches fund climate projects through ad revenue.",
    proof: "Monthly financial reports, public tree counter, project updates, B Corp certification.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "IdleForest",
    category: "Passive browser and desktop layer",
    bestFor: "People who want tree funding without changing search engines.",
    searchSwitch: "No",
    action: "Opt-in idle bandwidth helps fund verified tree planting.",
    proof: "Public planting records, transparency page, open-source code, bandwidth controls.",
    worksWithIdleForest: "Native tool",
  },
  {
    name: "OceanHero",
    category: "Cause-based search engine",
    bestFor: "People searching for ocean-plastic cleanup tools.",
    searchSwitch: "Usually",
    action: "Search activity supports plastic recovery efforts.",
    proof: "Plastic recovery certificates and partner explanations.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "Tab for a Cause",
    category: "New-tab extension",
    bestFor: "People who want each new tab to support charities.",
    searchSwitch: "No, but it changes the new-tab page",
    action: "New-tab ad revenue supports selected nonprofit causes.",
    proof: "Charity donation reporting and user-selected causes.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "TreeClicks",
    category: "Shopping donation tool",
    bestFor: "People who want purchases to trigger donations.",
    searchSwitch: "No",
    action: "Affiliate commissions from partner stores support tree planting.",
    proof: "Affiliate donation model and project reporting.",
    worksWithIdleForest: "Yes",
  },
  {
    name: "Ekoru",
    category: "Eco search engine",
    bestFor: "People comparing environmentally focused search options.",
    searchSwitch: "Yes",
    action: "Search revenue supports environmental causes.",
    proof: "Ocean-focused claims, hydro-powered hosting, privacy statements.",
    worksWithIdleForest: "Yes",
  },
];

const hubLinks = [
  {
    href: "/use-idleforest-with-ecosia",
    title: "Use IdleForest with Ecosia",
    body: "Keep Ecosia for searches and add IdleForest as a passive tree-funding layer.",
  },
  {
    href: "/compare/idleforest-vs-ecosia-vs-treeclicks",
    title: "IdleForest vs Ecosia vs TreeClicks",
    body: "Compare passive browsing, search-based planting, and shopping-triggered donations.",
  },
  {
    href: "/ecosia",
    title: "Ecosia financial and tree planting data",
    body: "Explore Ecosia income, expenses, and historical tree-planting metrics.",
  },
  {
    href: "/is-ecosia-legit-safe",
    title: "Is Ecosia legit and safe?",
    body: "Review Ecosia privacy, search partners, financial reports, and tree-planting proof.",
  },
  {
    href: "/blog/does-ecosia-actually-plant-trees",
    title: "Does Ecosia actually plant trees?",
    body: "Look at the reports, partners, and monitoring behind Ecosia's tree-planting claims.",
  },
  {
    href: "/blog/what-is-ecosia-chat-and-how-to-use-it",
    title: "What is Ecosia Chat?",
    body: "Understand Ecosia's AI assistant and where it fits in eco-conscious browsing.",
  },
];

const faqs = [
  {
    question: "What search engine plants trees?",
    answer: "Ecosia is the best-known search engine that funds tree planting from search advertising revenue. IdleForest is different: it can work alongside Ecosia and helps fund trees passively while your browser or desktop app is running.",
  },
  {
    question: "What is the best Ecosia alternative?",
    answer: "If you want another search engine, compare OceanHero, Ekoru, and other eco-search tools. If you want tree impact without switching search engines, IdleForest is a complementary alternative because it works with Ecosia, Google, Brave, DuckDuckGo, and other browser setups.",
  },
  {
    question: "Can I use more than one eco browsing tool?",
    answer: "Yes. The strongest setup is often layered: Ecosia for searches, IdleForest for passive browsing, and tools like TreeClicks for shopping-triggered donations.",
  },
  {
    question: "Is an eco-friendly search engine enough?",
    answer: "It helps, but search is only one browsing behavior. A passive layer like IdleForest can cover the time between searches, while shopping and new-tab tools cover other moments.",
  },
  {
    question: "Do I have to stop using Google, DuckDuckGo, Brave, or Ecosia to use IdleForest?",
    answer: "No. IdleForest does not require changing your default search engine, homepage, or new-tab page. It can be used alongside your existing browser setup.",
  },
];

export default function EcoFriendlySearchEnginePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: title,
        description,
        url: "https://www.idleforest.com/eco-friendly-search-engine",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: "https://www.idleforest.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Eco-Friendly Search Engines",
            item: "https://www.idleforest.com/eco-friendly-search-engine",
          },
        ],
      },
      {
        "@type": "ItemList",
        name: "Eco-friendly search engines and browser tools",
        itemListElement: tools.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.name,
          description: `${tool.category}. ${tool.bestFor} ${tool.action}`,
        })),
      },
      {
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
    ],
  };

  return (
    <main className="min-h-screen bg-brand-gray text-black">
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section className="border-b-2 border-black bg-brand-yellow">
        <div className="container mx-auto grid gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-sm font-bold uppercase tracking-wide">
              <Search className="h-4 w-4" />
              Eco search guide
            </p>
            <h1 className="font-rethink-sans text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Best eco-friendly search engines, tree-planting search tools, and Ecosia alternatives
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-800">
              Ecosia is the best-known search engine that plants trees. IdleForest is different: it funds verified tree planting passively and works alongside Ecosia, Google, DuckDuckGo, Brave, and other browser setups without forcing a search-engine switch.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SmartCTA showLearnMore={false} desktopOnly showExtensionDownload={false} />
              <Button asChild variant="outline" className="border-2 border-black bg-white px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/use-idleforest-with-ecosia">
                  Use IdleForest with Ecosia <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-rethink-sans text-2xl font-extrabold">The practical answer</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-4">
                <Leaf className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Use Ecosia</strong> if you want a search engine that funds trees when you search.</p>
              </div>
              <div className="flex gap-4">
                <Zap className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Add IdleForest</strong> if you want passive tree funding without replacing your search engine.</p>
              </div>
              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Layer tools</strong> for searches, browsing, tabs, and shopping instead of expecting one tool to cover everything.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-rethink-sans text-3xl font-extrabold">Best eco-friendly search engines and browser tools</h2>
          <p className="mt-3 text-neutral-700">
            These tools are often compared, but they do not all work the same way. The important differences are whether you must change search engines, how impact is funded, and what proof each tool gives users.
          </p>
        </div>

        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="bg-brand-navy text-brand-yellow">
              <tr>
                <th className="p-4">Tool</th>
                <th className="p-4">Type</th>
                <th className="p-4">Best for</th>
                <th className="p-4">Search switch required?</th>
                <th className="p-4">How impact happens</th>
                <th className="p-4">Proof or transparency</th>
                <th className="p-4">Use with IdleForest?</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.name} className="border-t-2 border-black align-top">
                  <td className="p-4 font-bold">{tool.name}</td>
                  <td className="p-4 text-neutral-700">{tool.category}</td>
                  <td className="p-4 text-neutral-700">{tool.bestFor}</td>
                  <td className="p-4 text-neutral-700">{tool.searchSwitch}</td>
                  <td className="p-4 text-neutral-700">{tool.action}</td>
                  <td className="p-4 text-neutral-700">{tool.proof}</td>
                  <td className="p-4 text-neutral-700">{tool.worksWithIdleForest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y-2 border-black bg-white py-14">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">What search engine plants trees?</h2>
            <p className="mt-3 text-neutral-700">
              Ecosia is the best-known answer: it turns everyday searches into funding for climate action and tree-planting projects.
            </p>
          </div>
          <div className="space-y-4 text-neutral-700">
            <p>
              That difference matters: Ecosia creates impact when you search with Ecosia. IdleForest creates a separate passive layer from opt-in idle bandwidth, so it can run alongside Ecosia or alongside a search engine you already use.
            </p>
            <p>
              For many users, the best eco-friendly setup is layered: Ecosia for tree-funded searches, IdleForest for passive browsing time, and optional tools like Tab for a Cause or TreeClicks for new tabs and shopping.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container mx-auto px-6">
          <div className="mb-8 max-w-3xl">
            <h2 className="font-rethink-sans text-3xl font-extrabold">Choose by what you are trying to improve</h2>
            <p className="mt-3 text-neutral-700">
              Most people should not think of this as one winner. Think of it as a stack for different online habits.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Searches",
                body: "Use Ecosia or another eco search engine if you are happy to change the default search experience.",
              },
              {
                icon: Trees,
                title: "Normal browsing",
                body: "Use IdleForest if you want extra tree funding while browsing, streaming, studying, or working.",
              },
              {
                icon: ShieldCheck,
                title: "Trust checks",
                body: "Read comparison and transparency pages before installing anything that changes search, tabs, shopping, or bandwidth behavior.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <section key={item.title} className="border-2 border-black bg-brand-gray p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Icon className="mb-4 h-7 w-7" />
                  <h3 className="mb-2 font-rethink-sans text-xl font-extrabold">{item.title}</h3>
                  <p className="text-neutral-700">{item.body}</p>
                </section>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Ecosia alternatives if you do not want to change search engines</h2>
            <p className="mt-3 text-neutral-700">
              If switching away from Google, DuckDuckGo, Brave, or your current default search is the deal-breaker, IdleForest is the easier fit because it does not replace search at all.
            </p>
            <div className="mt-6">
              <Button asChild className="border-2 border-black bg-brand-yellow px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/use-idleforest-with-ecosia">
                  Use IdleForest with Ecosia <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-rethink-sans text-2xl font-extrabold">When IdleForest is the better fit</h3>
            <ul className="mt-4 space-y-3 text-neutral-700">
              <li><strong>You want to keep your search engine.</strong> IdleForest does not change your default search, homepage, or new-tab page.</li>
              <li><strong>You already use Ecosia.</strong> IdleForest can add passive tree funding between searches.</li>
              <li><strong>You want proof.</strong> IdleForest publishes planting records, transparency details, and bandwidth controls.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-rethink-sans text-3xl font-extrabold">Explore the hub</h2>
          <p className="mt-3 text-neutral-700">
            Go deeper on Ecosia data, safety questions, and side-by-side comparisons when you want the details behind a tool.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {hubLinks.map((item) => (
            <Link key={item.href} href={item.href} className="group border-2 border-black bg-white p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
              <h3 className="font-rethink-sans text-xl font-extrabold group-hover:underline">{item.title}</h3>
              <p className="mt-2 text-neutral-700">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-brand-navy py-14 text-white">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Common questions</h2>
            <p className="mt-3 text-white/80">
              Quick answers for people comparing Ecosia, OceanHero, Tab for a Cause, TreeClicks, Ekoru, and IdleForest.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <section key={faq.question} className="border-2 border-brand-yellow bg-black p-5">
                <h3 className="font-bold text-brand-yellow">{faq.question}</h3>
                <p className="mt-2 text-white/80">{faq.answer}</p>
              </section>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
