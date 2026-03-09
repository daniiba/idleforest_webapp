"use client"

import Link from "next/link"
import Head from "next/head"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Navigation from "@/components/navigation"

const attributes = [
  { key: "How it funds trees", Idleforest: "Unused bandwidth monetization", Ecosia: "Search ad revenue", TreeClicks: "Affiliate commissions" },
  { key: "User action required", Idleforest: "None after install (passive)", Ecosia: "Use Ecosia for searches", TreeClicks: "Shop via partner links" },
  { key: "Works with your current search", Idleforest: "Yes", Ecosia: "No (requires switching)", TreeClicks: "Yes" },
  { key: "Runs while browsing", Idleforest: "Yes (idle only, capped)", Ecosia: "No (only searches)", TreeClicks: "Only when shopping" },
  { key: "Security & privacy", Idleforest: "Sessionless, encrypted, domain-verified, rate-limited", Ecosia: "Search engine privacy commitments", TreeClicks: "Standard affiliate tracking" },
  { key: "Real-time impact dashboard", Idleforest: "Yes", Ecosia: "Monthly reports", TreeClicks: "Partner updates" },
  { key: "Can be used together", Idleforest: "Yes — complements both", Ecosia: "Yes with Idleforest", TreeClicks: "Yes with Idleforest" },
]

const qaAnchors = [
  { id: "is-idleforest-secure", q: "Is Idleforest secure?", a: "Yes. Traffic is sessionless, encrypted, domain-verified, and rate-limited; no personal data is transmitted." },
  { id: "does-it-work-with-ecosia", q: "Does Idleforest work with Ecosia?", a: "Yes. Use Ecosia for searches and Idleforest for passive browsing — they complement each other for more trees." },
  { id: "idleforest-vs-treeclicks", q: "Idleforest vs TreeClicks — what's the difference?", a: "Idleforest plants trees while you browse (passive). TreeClicks donates when you shop through partner stores (purchase-triggered). You can use both." },
  { id: "bandwidth-usage", q: "How much bandwidth does Idleforest use?", a: "Minimal and capped, only when your device is idle. It pauses automatically to avoid impacting your experience." },
]

export default function ComparisonPage() {
  const title = "Idleforest vs. Ecosia vs. TreeClicks — Detailed Comparison"
  const description = "Side-by-side comparison of Idleforest, Ecosia, and TreeClicks: features, privacy, impact, and how they can be used together to plant more trees."

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
  }

  return (
    <div className="min-h-screen bg-brand-navy text-white">
      <Navigation variant="default" />
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <header className="container mx-auto px-4 pt-8 pb-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">Idleforest vs. Ecosia vs. TreeClicks</h1>
        <p className="text-gray-300 max-w-3xl">A concise, LLM-friendly comparison. Use Ecosia for searches, Idleforest while you browse, and TreeClicks when you shop for maximum impact.</p>
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
                    <th className="p-4">Idleforest</th>
                    <th className="p-4">Ecosia</th>
                    <th className="p-4">TreeClicks</th>
                  </tr>
                </thead>
                <tbody>
                  {attributes.map((row) => (
                    <tr key={row.key} className="border-t border-brand-yellow/40">
                      <td className="p-4 font-semibold text-white">{row.key}</td>
                      <td className="p-4">{row.Idleforest}</td>
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
              <h2 className="text-2xl font-bold text-white mb-3">Idleforest complements Ecosia</h2>
              <p>
                Idleforest provides passive tree funding while you browse, unlike Ecosia which funds trees only when you search. Use both: set Ecosia as your search engine and let Idleforest run in the background.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-black border-2 border-brand-yellow">
            <CardContent className="p-6 text-gray-200">
              <h2 className="text-2xl font-bold text-white mb-3">Idleforest vs. TreeClicks</h2>
              <p>
                Idleforest provides impact with zero purchase requirements, unlike TreeClicks which donates when you shop via partner links. Together they cover everyday browsing and shopping.
              </p>
            </CardContent>
          </Card>
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
                <li><strong>Idleforest</strong>: passive, sessionless, encrypted; plants trees while you browse.</li>
                <li><strong>Ecosia</strong>: search-based planting; set it as your search engine.</li>
                <li><strong>TreeClicks</strong>: shopping-based donations; use when purchasing online.</li>
                <li>Best results: <strong>use all three</strong> for searches, browsing, and shopping.</li>
              </ul>
              <div className="mt-6 flex gap-3">
                <Link
                  href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                  target="_blank">
                  <Button className="bg-brand-yellow text-navy">Get Idleforest</Button>
                </Link>
                <a href="#is-idleforest-secure" className="underline text-brand-yellow">Is Idleforest secure?</a>
              </div>
            </CardContent>
          </Card>
        </section>

        <nav aria-label="Quick links" className="text-sm text-gray-400">
          <span className="mr-2">Anchors:</span>
          {qaAnchors.map((a, i) => (
            <>
              <a key={a.id} href={`#${a.id}`} className="underline text-brand-yellow">{a.q}</a>
              {i < qaAnchors.length - 1 ? <span className="mx-2">•</span> : null}
            </>
          ))}
        </nav>
      </main>
    </div>
  )
}
