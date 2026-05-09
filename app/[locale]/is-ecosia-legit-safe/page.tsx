import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, ExternalLink, Leaf, Search, ShieldCheck, Trees } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const title = "Is Ecosia Legit and Safe? Privacy, Tree Planting, and Proof";
const description = "A practical review of whether Ecosia is legit and safe, including privacy tradeoffs, financial reports, tree-planting proof, search partners, and how to use IdleForest with Ecosia.";

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "is ecosia legit",
    "is ecosia safe",
    "does ecosia actually plant trees",
    "ecosia privacy",
    "ecosia financial reports",
    "ecosia tree planting proof",
  ],
  alternates: {
    canonical: "https://www.idleforest.com/is-ecosia-legit-safe",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "https://www.idleforest.com/is-ecosia-legit-safe",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const proofRows = [
  {
    question: "Is Ecosia a real company?",
    answer: "Yes. Ecosia is a long-running search company with public company details, a public product, and a Certified B Corp history.",
    source: "Ecosia company and B Corp pages",
  },
  {
    question: "Does Ecosia publish financial reports?",
    answer: "Yes. Ecosia publishes monthly financial reports and explains how revenue is allocated to tree planting, climate projects, operations, taxes, and other costs.",
    source: "Ecosia financial reports",
  },
  {
    question: "Does Ecosia actually plant trees?",
    answer: "Ecosia funds tree-planting and restoration projects with local partners, and publishes project updates, reports, and tree-monitoring explanations.",
    source: "Ecosia reports and project monitoring",
  },
  {
    question: "Is Ecosia private?",
    answer: "Ecosia is privacy-conscious compared with many ad-funded search products, but it is still a search engine that processes search terms, IP addresses, and partner data needed to provide search results and ads.",
    source: "Ecosia privacy policy and help center",
  },
];

const faqs = [
  {
    question: "Is Ecosia legit?",
    answer: "Yes, Ecosia appears legitimate based on its public financial reports, long operating history, published tree-planting projects, B Corp certification history, and third-party coverage. The useful next step is to check the evidence yourself: financial reports, partner updates, and privacy terms.",
  },
  {
    question: "Is Ecosia safe to use?",
    answer: "For normal web search, Ecosia is generally safe to use. Like other search engines, it processes search terms, IP addresses, browser details, and partner data needed for results and ads. Users with strict privacy needs should read Ecosia's privacy policy and compare it with privacy-first search engines.",
  },
  {
    question: "Does Ecosia sell personal data?",
    answer: "Ecosia says it does not sell personal data. It does share certain data with search partners and service providers when needed to provide results, ads, security, and operations.",
  },
  {
    question: "Can I use IdleForest with Ecosia?",
    answer: "Yes. Ecosia can fund trees when you search, while IdleForest can add passive verified tree funding through opt-in idle bandwidth without changing your search engine.",
  },
];

const sourceLinks = [
  {
    href: "https://support.ecosia.org/article/377-ip-addresses",
    label: "Ecosia privacy help center",
  },
  {
    href: "https://support.ecosia.org/article/402-reports-transparency",
    label: "Ecosia transparency reports",
  },
  {
    href: "https://support.ecosia.org/article/362-monitoring",
    label: "Ecosia tree-monitoring process",
  },
  {
    href: "https://www.ecosia.org/",
    label: "Ecosia official site",
  },
  {
    href: "https://www.snopes.com/fact-check/ecosia-use-profits-to-plant-trees/",
    label: "Snopes fact check",
  },
];

export default function IsEcosiaLegitSafePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        name: title,
        description,
        url: "https://www.idleforest.com/is-ecosia-legit-safe",
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
            name: "Is Ecosia Legit and Safe?",
            item: "https://www.idleforest.com/is-ecosia-legit-safe",
          },
        ],
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
              <ShieldCheck className="h-4 w-4" />
              Ecosia trust check
            </p>
            <h1 className="font-rethink-sans text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
              Is Ecosia legit and safe?
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-neutral-800">
              Short answer: Ecosia appears legitimate, and it is generally safe for normal search use. The real question is whether its privacy tradeoffs, search partners, and tree-planting evidence fit what you expect from an eco-friendly search engine.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="border-2 border-black bg-black px-6 py-6 font-bold text-brand-yellow hover:bg-white hover:text-black">
                <Link href="/use-idleforest-with-ecosia">
                  Use IdleForest with Ecosia <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-black bg-white px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/ecosia">
                  View Ecosia data <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="border-2 border-black bg-white p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="font-rethink-sans text-2xl font-extrabold">Quick verdict</h2>
            <div className="mt-5 space-y-5">
              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Legit:</strong> Ecosia publishes financial reports, project updates, and tree-planting information.</p>
              </div>
              <div className="flex gap-4">
                <Search className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Safe for search:</strong> It works like a search engine, so it still processes search data and relies on search partners.</p>
              </div>
              <div className="flex gap-4">
                <Trees className="mt-1 h-6 w-6 flex-shrink-0" />
                <p><strong>Best stack:</strong> Ecosia for searches, IdleForest for passive tree funding between searches.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="mb-8 max-w-3xl">
          <h2 className="font-rethink-sans text-3xl font-extrabold">Evidence checklist</h2>
          <p className="mt-3 text-neutral-700">
            A legitimate eco-search product should make its company, funding model, privacy tradeoffs, and environmental proof inspectable.
          </p>
        </div>

        <div className="overflow-x-auto border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <table className="w-full min-w-[860px] text-left">
            <thead className="bg-brand-navy text-brand-yellow">
              <tr>
                <th className="p-4">Question</th>
                <th className="p-4">Answer</th>
                <th className="p-4">What to inspect</th>
              </tr>
            </thead>
            <tbody>
              {proofRows.map((row) => (
                <tr key={row.question} className="border-t-2 border-black align-top">
                  <td className="p-4 font-bold">{row.question}</td>
                  <td className="p-4 text-neutral-700">{row.answer}</td>
                  <td className="p-4 text-neutral-700">{row.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="border-y-2 border-black bg-white py-14">
        <div className="container mx-auto grid gap-8 px-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Is Ecosia safe?</h2>
            <p className="mt-3 text-neutral-700">
              Safe does not mean anonymous. Ecosia is a real search engine with privacy commitments, but search still requires data processing.
            </p>
          </div>
          <div className="space-y-4 text-neutral-700">
            <p>
              Ecosia says it collects the data needed to run search, keep the service secure, and improve the product. That can include search terms, IP address, browser details, language, and approximate region.
            </p>
            <p>
              Ecosia also relies on search partners such as Microsoft Bing, and in some cases Google, to provide results and ads. Those partners may receive the data needed to deliver results, ads, and fraud protection.
            </p>
            <p>
              In practice, Ecosia is a reasonable choice if you want greener search with public transparency. If maximum privacy is the priority, compare Ecosia's privacy policy with privacy-first search engines before switching.
            </p>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Does Ecosia actually plant trees?</h2>
            <p className="mt-3 text-neutral-700">
              Ecosia funds tree planting and climate projects through search revenue. The strongest proof signals are its monthly financial reports, project updates, partner reporting, and tree-monitoring process.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="border-2 border-black bg-brand-yellow px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                <Link href="/blog/does-ecosia-actually-plant-trees">
                  Read the tree proof guide <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-rethink-sans text-2xl font-extrabold">Use Ecosia plus IdleForest</h3>
            <ul className="mt-4 space-y-3 text-neutral-700">
              <li><strong>Ecosia:</strong> tree funding when you search.</li>
              <li><strong>IdleForest:</strong> verified tree funding from opt-in idle bandwidth.</li>
              <li><strong>Together:</strong> one setup for searches and the browsing time between searches.</li>
            </ul>
            <Link href="/use-idleforest-with-ecosia" className="mt-5 inline-flex items-center gap-2 font-bold underline">
              Learn how they work together <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container mx-auto px-6">
          <div className="mb-8 max-w-3xl">
            <h2 className="font-rethink-sans text-3xl font-extrabold">Primary sources to check</h2>
            <p className="mt-3 text-neutral-700">
              These are the sources worth checking before deciding whether Ecosia matches your privacy and impact standards.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sourceLinks.map((item) => (
              <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="group border-2 border-black bg-brand-gray p-5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
                <span className="inline-flex items-center gap-2 font-bold group-hover:underline">
                  {item.label} <ExternalLink className="h-4 w-4" />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-6 py-14">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Common questions</h2>
            <p className="mt-3 text-neutral-700">
              Short answers for the trust questions people usually ask before switching search engines.
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
            <p className="mb-3 inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-brand-yellow">
              <Leaf className="h-4 w-4" />
              Want more eco-search options?
            </p>
            <h2 className="font-rethink-sans text-3xl font-extrabold">Compare Ecosia with other eco-friendly search tools</h2>
            <p className="mt-3 max-w-2xl text-white/80">
              If Ecosia is legitimate but not exactly what you need, compare search engines, new-tab tools, shopping tools, and passive browsing tools.
            </p>
          </div>
          <Button asChild className="border-2 border-brand-yellow bg-brand-yellow px-6 py-6 font-bold text-navy hover:bg-black hover:text-brand-yellow">
            <Link href="/eco-friendly-search-engine">
              Open eco search hub <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
