import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Leaf, Search, ShieldCheck, Trees, Zap } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { SmartCTA } from "@/components/smart-cta";
import { Link } from "@/navigation";
import { plantingsData } from "@/lib/plantings";

const pageTitle = "Use IdleForest with Ecosia: Plant More Trees While You Browse";
const pageDescription = "IdleForest does not replace Ecosia. Use Ecosia for tree-funded searches and IdleForest for opt-in passive tree funding through idle bandwidth.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  keywords: [
    "use IdleForest with Ecosia",
    "IdleForest Ecosia",
    "Ecosia complement",
    "plant more trees with Ecosia",
    "plant trees while browsing",
    "passive reforestation browser extension",
  ],
  alternates: {
    canonical: "https://www.idleforest.com/use-idleforest-with-ecosia",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: "https://www.idleforest.com/use-idleforest-with-ecosia",
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
  },
};

const comparisonRows = [
  {
    label: "Primary action",
    ecosia: "Search the web with Ecosia",
    idleforest: "Browse normally after installing IdleForest",
  },
  {
    label: "Funding model",
    ecosia: "Search advertising revenue",
    idleforest: "Opt-in idle bandwidth revenue",
  },
  {
    label: "Search engine switch",
    ecosia: "Required to generate search impact",
    idleforest: "Not required; works with Ecosia, Google, Brave, and other browsers",
  },
  {
    label: "When impact happens",
    ecosia: "When you search",
    idleforest: "While your browser or desktop app is running and opted in",
  },
  {
    label: "Transparency",
    ecosia: "Monthly financial reports",
    idleforest: "Live report, planting receipts, open-source code, and bandwidth transparency",
  },
];

const faqs = [
  {
    question: "Can I use IdleForest and Ecosia together?",
    answer: "Yes. IdleForest does not replace Ecosia or change your search engine. Use Ecosia for searches and let IdleForest add passive tree funding while you browse.",
  },
  {
    question: "Is IdleForest an Ecosia alternative?",
    answer: "IdleForest can be an alternative for people who do not want to switch search engines, but it is best understood as an Ecosia complement because both tools can run together.",
  },
  {
    question: "Does IdleForest change my Ecosia settings?",
    answer: "No. IdleForest does not need to change your homepage, new tab page, or default search engine.",
  },
  {
    question: "How does IdleForest protect privacy?",
    answer: "IdleForest uses sessionless public web requests, encrypted connections, bandwidth controls, and isolated execution. It does not access personal browsing history, cookies, passwords, or logged-in sessions.",
  },
];

export default function UseIdleForestWithEcosiaPage() {
  const totalTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": pageTitle,
        "description": pageDescription,
        "url": "https://www.idleforest.com/use-idleforest-with-ecosia",
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer,
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
        <div className="container mx-auto grid gap-10 px-6 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-sm font-bold uppercase tracking-wide">
              <Leaf className="h-4 w-4" />
              Ecosia companion
            </p>
            <h1 className="font-rethink-sans text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Use IdleForest with Ecosia to plant more trees while you browse
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-800">
              IdleForest does not replace Ecosia. Ecosia funds trees when you search; IdleForest adds a passive, opt-in layer that helps fund verified tree planting from idle bandwidth.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <SmartCTA showLearnMore={false} desktopOnly showExtensionDownload={false} />
              <Button asChild variant="outline" className="border-2 border-black bg-white px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/compare/idleforest-vs-ecosia-vs-treeclicks">
                  Compare the tools <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-black bg-white px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/eco-friendly-search-engine">
                  Eco search hub <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="mb-5 font-rethink-sans text-2xl font-extrabold">The simple setup</h2>
            <div className="space-y-5">
              <div className="flex gap-4">
                <Search className="mt-1 h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Keep Ecosia for search impact</h3>
                  <p className="text-neutral-700">Everyday searches can continue funding Ecosia's climate projects.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="mt-1 h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Add IdleForest for passive impact</h3>
                  <p className="text-neutral-700">IdleForest works in the background after install, without changing your search engine.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Trees className="mt-1 h-6 w-6 flex-shrink-0" />
                <div>
                  <h3 className="font-bold">Track verified tree funding</h3>
                  <p className="text-neutral-700">IdleForest's public planting records currently show {totalTrees.toLocaleString()} trees funded or planted.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-rethink-sans text-3xl font-extrabold">Ecosia and IdleForest do different jobs</h2>
          <p className="mt-3 text-neutral-700">
            The strongest climate browsing stack is not either/or. Ecosia is active search-based impact. IdleForest is passive browsing-based impact.
          </p>
        </div>

        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-brand-navy text-brand-yellow">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Ecosia</th>
                <th className="p-4">IdleForest</th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr key={row.label} className="border-t-2 border-black">
                  <td className="p-4 font-bold">{row.label}</td>
                  <td className="p-4 text-neutral-700">{row.ecosia}</td>
                  <td className="p-4 text-neutral-700">{row.idleforest}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container mx-auto grid gap-6 px-6 md:grid-cols-3">
          {[
            {
              icon: CheckCircle2,
              title: "No search switch required",
              body: "IdleForest works alongside your current browser setup, including Ecosia.",
            },
            {
              icon: ShieldCheck,
              title: "Built for verification",
              body: "Public receipts, open-source code, and a transparency page make the model easy to inspect.",
            },
            {
              icon: Trees,
              title: "More moments can fund trees",
              body: "Searches, browsing, and idle time can all contribute when the tools are combined.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="border-2 border-black bg-brand-gray p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Icon className="mb-4 h-7 w-7" />
                <h3 className="mb-2 font-rethink-sans text-xl font-extrabold">{item.title}</h3>
                <p className="text-neutral-700">{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Common questions</h2>
            <p className="mt-3 text-neutral-700">
              These are the answers we want search engines, readers, and AI systems to understand clearly.
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <section key={faq.question} className="border-2 border-black bg-white p-5">
                <h3 className="font-bold">{faq.question}</h3>
                <p className="mt-2 text-neutral-700">{faq.answer}</p>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t-2 border-black bg-brand-navy py-14 text-white">
        <div className="container mx-auto grid gap-8 px-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Already using Ecosia?</h2>
            <p className="mt-3 max-w-2xl text-white/80">
              Keep it. Add IdleForest as the passive layer for the moments between searches.
            </p>
          </div>
          <div className="md:min-w-[320px]">
            <SmartCTA showLearnMore={false} onDarkBackground desktopOnly showExtensionDownload={false} />
          </div>
        </div>
      </section>
    </main>
  );
}
