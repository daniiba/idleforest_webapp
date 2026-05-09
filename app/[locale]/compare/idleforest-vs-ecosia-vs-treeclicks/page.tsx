import { Link } from "@/navigation";
import type { Metadata } from "next";
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

const title = "IdleForest vs Ecosia vs TreeClicks: Passive vs Search vs Shopping"
const description = "Compare IdleForest, Ecosia, and TreeClicks by funding model, user action, search-engine switch, privacy, and when tree impact happens."

export const metadata: Metadata = {
  title,
  description,
  keywords: [
    "IdleForest vs Ecosia",
    "IdleForest vs TreeClicks",
    "Ecosia vs TreeClicks",
    "TreeClicks alternative",
    "passive tree planting app",
    "search based tree planting",
    "tree planting shopping donation",
  ],
  alternates: {
    canonical: "https://www.idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks",
  },
  openGraph: {
    title,
    description,
    type: "article",
    url: "https://www.idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

const attributes = [
  { key: "How it funds trees", IdleForest: "Unused bandwidth monetization", Ecosia: "Search ad revenue", TreeClicks: "Affiliate commissions" },
  { key: "User action required", IdleForest: "None after install (passive)", Ecosia: "Use Ecosia for searches", TreeClicks: "Shop via partner links" },
  { key: "Works with your current search", IdleForest: "Yes", Ecosia: "No (requires switching)", TreeClicks: "Yes" },
  { key: "Runs while browsing", IdleForest: "Yes (idle only, capped)", Ecosia: "No (only searches)", TreeClicks: "Only when shopping" },
  { key: "Security and privacy", IdleForest: "Sessionless, encrypted, domain-verified, rate-limited", Ecosia: "Search engine privacy commitments", TreeClicks: "Standard affiliate tracking" },
  { key: "Real-time impact dashboard", IdleForest: "Yes", Ecosia: "Monthly reports", TreeClicks: "Partner updates" },
  { key: "Can be used together", IdleForest: "Yes, complements both", Ecosia: "Yes with IdleForest", TreeClicks: "Yes with IdleForest" },
]

const qaAnchors = [
  { id: "is-idleforest-secure", q: "Is IdleForest secure?", a: "Yes. Traffic is sessionless, encrypted, domain-verified, and rate-limited; no personal data is transmitted." },
  { id: "does-it-work-with-ecosia", q: "Does IdleForest work with Ecosia?", a: "Yes. Use Ecosia for searches and IdleForest for passive browsing. They complement each other for more tree funding moments." },
  { id: "idleforest-vs-treeclicks", q: "IdleForest vs TreeClicks: what's the difference?", a: "IdleForest plants trees while you browse passively. TreeClicks donates when you shop through partner stores. You can use both." },
  { id: "bandwidth-usage", q: "How much bandwidth does IdleForest use?", a: "Minimal and capped, only when your device is idle. It pauses automatically to avoid impacting your experience." },
]

const relatedLinks = [
  {
    href: "/use-idleforest-with-ecosia",
    title: "Use IdleForest with Ecosia",
    body: "For people who already use Ecosia and want to add passive tree funding without changing search settings.",
  },
  {
    href: "/ecosia",
    title: "Ecosia financial and tree planting data",
    body: "For people checking Ecosia's published financial reports, tree data, and transparency record.",
  },
  {
    href: "/eco-friendly-search-engine",
    title: "Eco-friendly search engines",
    body: "For broader comparisons of Ecosia, OceanHero, Tab for a Cause, TreeClicks, Ekoru, and IdleForest.",
  },
]

export default function ComparisonPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "name": title,
        "description": description,
        "url": "https://www.idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks",
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.idleforest.com",
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "IdleForest vs Ecosia vs TreeClicks",
            "item": "https://www.idleforest.com/compare/idleforest-vs-ecosia-vs-treeclicks",
          },
        ],
      },
      {
        "@type": "FAQPage",
        "mainEntity": qaAnchors.map((item) => ({
          "@type": "Question",
          "name": item.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.a,
          },
        })),
      },
    ],
  }

  return (
    <div className="min-h-screen bg-brand-navy text-white">
      <Navigation variant="default" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <header className="container mx-auto px-4 pt-8 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">IdleForest vs Ecosia vs TreeClicks</h1>
        <p className="text-gray-300 max-w-3xl">
          A side-by-side comparison of three different tree-funding models: IdleForest for passive browsing, Ecosia for search, and TreeClicks for shopping.
        </p>
      </header>

      <main className="container mx-auto px-4 pb-24">
        {/* Uniform attribute-value tables */}
        <section className="mb-16">
          <Card className="bg-black border-2 border-brand-yellow">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-gray-200">
                <thead className="bg-brand-yellow/40">
                  <tr>
                    <th className="p-4 w-1/3">Attribute</th>
                    <th className="p-4">IdleForest</th>
                    <th className="p-4">Ecosia</th>
                    <th className="p-4">TreeClicks</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((row) => (
                    <tr key={row.key} className="border-t border-brand-yellow/40">
                      <td className="p-4 font-semibold text-white">{row.key}</td>
                      <td className="p-4">{row.IdleForest}</td>
                      <td className="p-4">{row.Ecosia}</td>
                      <td className="p-4">{row.TreeClicks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </section>

        {/* Explicit contrast statements */}
        <section className="grid md:grid-cols-2 gap-6 mb-16">
          <Card className="bg-black border-2 border-brand-yellow">
            <CardContent className="p-6 text-gray-200">
              <h2 className="text-2xl font-bold text-white mb-3">IdleForest complements Ecosia</h2>
              <p>
                IdleForest provides passive tree funding while you browse, unlike Ecosia which funds trees only when you search. Use both: set Ecosia as your search engine and let IdleForest run in the background.
              </p>
              <Link href="/use-idleforest-with-ecosia" className="mt-4 inline-block underline text-brand-yellow">
                Use IdleForest with Ecosia
              </Link>
            </CardContent>
          </Card>
          <Card className="bg-black border-2 border-brand-yellow">
            <CardContent className="p-6 text-gray-200">
              <h2 className="text-2xl font-bold text-white mb-3">IdleForest vs TreeClicks</h2>
              <p>
                IdleForest provides impact with zero purchase requirements, unlike TreeClicks which donates when you shop via partner links. Together they cover everyday browsing and shopping.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-4">Where to go next</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedLinks.map((item) => (
              <Link key={item.href} href={item.href} className="group block border-2 border-brand-yellow bg-black p-5 text-gray-200 hover:bg-brand-yellow hover:text-navy">
                <h3 className="font-bold text-white group-hover:text-navy">{item.title}</h3>
                <p className="mt-2 text-sm">{item.body}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Internal anchors for common queries */}
        <section className="space-y-6 mb-16">
          {qaAnchors.map((item) => (
            <Card key={item.id} className="bg-black border-2 border-brand-yellow">
              <CardContent className="p-6">
                <h2 id={item.id} className="scroll-mt-32 text-2xl font-bold text-white mb-2">{item.q}</h2>
                <p className="text-gray-300">{item.a}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Concluding recap */}
        <section className="mb-12">
          <Card className="bg-black border-2 border-brand-yellow">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold text-white mb-3">Quick recap</h2>
              <ul className="list-disc pl-6 text-gray-200 space-y-1">
                <li><strong>IdleForest</strong>: passive, sessionless, encrypted; plants trees while you browse.</li>
                <li><strong>Ecosia</strong>: search-based planting; set it as your search engine.</li>
                <li><strong>TreeClicks</strong>: shopping-based donations; use when purchasing online.</li>
                <li>Best results: <strong>use all three</strong> for searches, browsing, and shopping.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Button asChild className="bg-brand-yellow text-navy">
                  <Link href="/use-idleforest-with-ecosia">Use IdleForest with Ecosia</Link>
                </Button>
                <a href="#is-idleforest-secure" className="underline text-brand-yellow">Is IdleForest secure?</a>
              </div>
            </CardContent>
          </Card>
        </section>

        <nav aria-label="Quick links" className="text-sm text-gray-400">
          <span className="mr-2">Anchors:</span>
          {qaAnchors.map((a, i) => (
            <span key={a.id}>
              <a href={`#${a.id}`} className="underline text-brand-yellow">{a.q}</a>
              {i < qaAnchors.length - 1 ? <span className="mx-2">/</span> : null}
            </span>
          ))}
        </nav>
      </main>
    </div>
  )
}
