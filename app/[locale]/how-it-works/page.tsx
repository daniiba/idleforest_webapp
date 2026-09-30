import FreeTreeResources from "@/components/free-tree-resources";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, Check, ChevronDown, Leaf } from "lucide-react";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import { getDeviceInfo, type DeviceDetection } from "@/lib/device-detection";
import { SmartCTA } from "@/components/smart-cta";
import IdleBandwidthArt from "@/components/landing/IdleBandwidthArt";
import { FundingArt } from "@/components/partner/WastefreeArt";
import { HabitatArt, InstallArt, RunArt } from "@/components/partner/MossyEarthArt";

const pageTitle = "How IdleForest Works: Plant Trees With Idle Bandwidth";
const pageDescription =
  "See how IdleForest works. Your idle internet bandwidth runs small data tasks in the background, and the revenue funds verified tree planting. No cost to you.";
const canonicalUrl = "https://www.idleforest.com/how-it-works";

const chain = [
  { art: InstallArt, title: "You install the app", body: "One click for Chrome, or a small app for Mac, Windows or Linux. No account, no payment." },
  { art: RunArt, title: "It runs small tasks", body: "Sessionless data tasks, like uptime checks, run on your spare bandwidth in the background." },
  { art: FundingArt, title: "Companies pay for them", body: "Businesses pay to run tasks across many connections. Your share is small; together it adds up." },
  { art: HabitatArt, title: "Verified trees get planted", body: "The money goes to Trees for the Future, Tree-Nation and 1ClickImpact, who plant and verify on the ground." },
];

const faqItems = [
  { question: "Is IdleForest really free?", answer: "Yes. No cost, subscription or donation. Idle bandwidth tasks fund the trees, not you." },
  { question: "Will it slow my computer or internet?", answer: "No. It only uses bandwidth you are not using and steps aside when you need it, like on a video call." },
  { question: "Is it safe to install?", answer: "Yes. IdleForest is featured on the Chrome Web Store with 4.8 stars from 33 reviews, and it never touches your personal data." },
  { question: "Can I use it with Ecosia or another search engine?", answer: "Yes. It changes no setting and works alongside Ecosia, Brave, Chrome and Edge, so the impact stacks." },
  { question: "How do I know the trees are real?", answer: "Named partners plant and verify them, and the transparency page shows running totals and partner reports." },
  { question: "Does it work on mobile?", answer: "Not yet. It runs as a Chrome extension and a desktop app for Mac, Windows and Linux. Mobile is on the roadmap." },
  { question: "How do I pause or uninstall it?", answer: "Pause from the extension menu, or remove it like any program. Trees you already funded stay funded." },
];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    siteName: "IdleForest",
    type: "website",
    images: [
      {
        url: "/preview.png",
        width: 1280,
        height: 800,
        alt: "IdleForest - plant trees with idle bandwidth",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/preview.png"],
  },
};

export default function HowItWorksPage() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const deviceInfo = getDeviceInfo(userAgent);

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#F7F7F2] text-brand-navy">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
          {/* Hero */}
          <section className="grid items-center gap-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3.5 py-1.5 text-sm font-bold">
                <Leaf className="h-4 w-4" aria-hidden="true" />
                How does IdleForest work?
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">How IdleForest works</h1>
              <p className="mt-4 max-w-lg text-lg leading-7 text-neutral-600">
                Your spare bandwidth runs small paid data tasks. The money plants verified trees. You pay nothing and change nothing.
              </p>
              <CtaGroup deviceInfo={deviceInfo} />
            </div>
            <div className="rounded-2xl bg-[#F7F7F2] p-3 sm:p-5">
              <IdleBandwidthArt className="h-auto w-full" />
            </div>
          </section>

          {/* The chain */}
          <section aria-labelledby="chain-heading" className="overflow-hidden rounded-3xl bg-brand-navy px-5 py-10 text-white sm:px-10 sm:py-14">
            <h2 id="chain-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">From idle bandwidth to trees</h2>
            <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {chain.map((step, index) => (
                <li key={step.title} id={`step-${index + 1}`} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                  <step.art className="h-24 w-24" />
                  <h3 className="mt-4 text-lg font-extrabold">{step.title}</h3>
                  <p className="mt-1 text-sm text-white/75">{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-center">
              <Link href="/impact" className="inline-flex items-center gap-2 text-sm font-bold text-brand-yellow underline decoration-2 underline-offset-4">
                See the live tree count <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </p>
          </section>

          {/* Idle bandwidth + data */}
          <section className="grid gap-4 md:grid-cols-2">
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">What is idle bandwidth?</h2>
              <p className="mt-3 leading-7 text-neutral-600">
                Even with your browser open, you use only a small slice of your connection. IdleForest borrows only the rest, and steps back the moment you need it.
              </p>
              <p className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm font-semibold text-neutral-700">
                Your browsing, streaming and downloads always come first.
              </p>
            </article>
            <article className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">What moves through your connection?</h2>
              <p className="mt-3 leading-7 text-neutral-600">Automated requests from paying clients, like &ldquo;is this website up?&rdquo;. Nothing of yours.</p>
              <ul className="mt-4 space-y-2">
                {["Sessionless: no cookies or identifiers", "No logins, files or browsing history", "Spare capacity only"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm font-medium">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 text-green-700">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-neutral-600">
                Details in the{" "}
                <Link href="/transparency" className="font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">transparency report</Link> and{" "}
                <Link href="/privacy" className="font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">privacy policy</Link>.
              </p>
            </article>
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Quick answers</h2>
            <div className="mt-4 divide-y divide-neutral-200">
              {faqItems.map((item) => (
                <details key={item.question} className="group py-4 first:pt-2 last:pb-2">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold [&::-webkit-details-marker]:hidden">
                    {item.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" aria-hidden="true" />
                  </summary>
                  <p className="mt-2 max-w-3xl leading-7 text-neutral-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="rounded-3xl bg-brand-yellow px-6 py-12 text-center sm:py-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">Start planting trees in 10 seconds</h2>
            <p className="mx-auto mt-3 max-w-md text-neutral-800">Install it once, change nothing, and let it run.</p>
            <div className="mt-7 flex justify-center">
              <CtaGroup deviceInfo={deviceInfo} centered />
            </div>
          </section>

          <FreeTreeResources currentPath="/how-it-works" />
        </div>
      </main>
    </>
  );
}

function CtaGroup({
  deviceInfo,
  centered = false,
}: {
  deviceInfo: DeviceDetection;
  centered?: boolean;
}) {
  return (
    <div className={`mt-7 flex ${centered ? "justify-center" : ""}`}>
      <SmartCTA
        deviceInfo={deviceInfo}
        buttonVariant="inverse"
        className={centered ? "items-center" : undefined}
      />
    </div>
  );
}
