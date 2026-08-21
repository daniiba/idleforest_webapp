import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { ArrowRight, BadgeCheck, Chrome, Download, Globe, Search, Sprout, TreePine, Wifi } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getDeviceInfo } from "@/lib/device-detection";

const chromeWebStoreUrl =
  "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk";
const ecosiaAlternativesUrl =
  "/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025";

const pageTitle = "Tree Planting Chrome Extension, Free | IdleForest";
const pageDescription =
  "IdleForest is a free Chrome extension that plants verified trees with your idle bandwidth. Add it in one click, no signup, no cost, and browse like always.";
const canonicalUrl = "https://www.idleforest.com/download/chrome";

const comparisonRows = [
  ["Effort", "Install once, forget", "Switch your search engine", "Open tabs, click to plant"],
  ["How trees are funded", "Idle bandwidth", "Search ads", "Display ads per tab"],
  ["Changes your browsing", "No", "Yes", "Yes"],
  ["Cost", "Free, no signup", "Free", "Free"],
];

const faqs = [
  {
    question: "Is the Chrome extension free?",
    answer:
      "Yes. There is no cost, no subscription, and no donation. The extension is funded by the revenue from idle bandwidth tasks, not by you.",
  },
  {
    question: "Will the extension slow down Chrome or my internet?",
    answer:
      "No. It uses only the bandwidth you are not using, and it steps back the moment you need it. When you start a video call, open a heavy site, or download a file, the extension backs off. Your browsing keeps its full speed.",
  },
  {
    question: "Is the extension safe?",
    answer:
      "Yes. IdleForest is featured on the Chrome Web Store and rated 4.8 stars from 33 reviews. It runs in the background and touches only spare bandwidth, not your personal data.",
  },
  {
    question: "What permissions does it need?",
    richAnswer: (
      <>
        The extension needs the permissions Chrome requires to run background network tasks. It does not read your tabs,
        your bookmarks, or your browsing history. You can{" "}
        <a
          href={chromeWebStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline underline-offset-4 hover:text-brand-navy"
        >
          review the permissions on the store listing
        </a>
        {" "}before you install.
      </>
    ),
  },
  {
    question: "Does it work with Ecosia or other extensions?",
    answer:
      "Yes. IdleForest does not change your search engine or your other extensions. It runs alongside Ecosia, ad blockers, and anything else you already use. You can stack the impact.",
  },
  {
    question: "How do the trees get planted?",
    richAnswer: (
      <>
        The extension uses your idle bandwidth to run small data tasks for paying clients. That revenue funds planting
        with Trees for the Future, Tree-Nation, and 1ClickImpact. You can see the live count on the{" "}
        <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          transparency page
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I remove the extension?",
    answer:
      "Right-click the IdleForest icon in Chrome and choose remove, or manage it from the extensions menu. Once removed, no bandwidth is used. The trees you have already funded stay funded.",
  },
  {
    question: "Is there a version for Mac, Windows, or Linux?",
    richAnswer: (
      <>
        Yes. If you would rather run it outside the browser, IdleForest has a{" "}
        <Link href="/download/mac" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          desktop app for Mac
        </Link>
        {", "}
        <Link href="/download/windows" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          Windows
        </Link>
        {", and "}
        <Link href="/downloads#desktop-apps" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          Linux
        </Link>
        . The desktop app can fund more trees because it runs even when Chrome is closed.
      </>
    ),
  },
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
        alt: "IdleForest Chrome extension",
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

export default function ChromeDownloadPage() {
  const headersList = headers();
  const userAgent = headersList.get("user-agent") || "";
  const deviceInfo = getDeviceInfo(userAgent);
  const desktopDownloadHref = deviceInfo.isWindows ? "/download/windows" : deviceInfo.isLinux ? "/download/linux/installer" : "/download/mac";
  const desktopDownloadLabel = deviceInfo.isWindows ? "Download for Windows" : deviceInfo.isMac ? "Download for Mac" : deviceInfo.isLinux ? "Download for Linux" : "Download for Mac / Windows / Linux";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        <section className="relative overflow-hidden bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                  <Chrome className="h-4 w-4" />
                  tree planting chrome extension
                </div>
                <h1 className="font-rethink-sans text-[42px] font-extrabold leading-[1.02] tracking-normal sm:text-6xl md:text-7xl">
                  The Free Tree Planting Chrome Extension
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                  IdleForest is a free Chrome extension that plants verified trees while you browse. It runs in the
                  background and uses the internet bandwidth you are not using to fund tree-planting projects. You add it
                  in one click. There is no account, no payment, and nothing to change about how you browse.
                </p>
                <ChromeCtas desktopDownloadHref={desktopDownloadHref} desktopDownloadLabel={desktopDownloadLabel} />
              </div>

              <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
                <div className="mb-5 flex items-center gap-4">
                  <div className="grid h-16 w-16 place-items-center rounded-lg bg-brand-yellow">
                    <Image src="/chrome.png" alt="Chrome logo" width={44} height={44} />
                  </div>
                  <div>
                    <p className="text-sm font-bold uppercase text-neutral-600">Official store install</p>
                    <p className="font-rethink-sans text-2xl font-extrabold">Chrome Web Store</p>
                  </div>
                </div>
                <div className="grid gap-4">
                  <Signal icon={<Chrome className="h-5 w-5" />} label="Installs in one click" />
                  <Signal icon={<Wifi className="h-5 w-5" />} label="Uses spare bandwidth" />
                  <Signal icon={<BadgeCheck className="h-5 w-5" />} label="No search-engine switch" />
                  <Signal icon={<TreePine className="h-5 w-5" />} label="Funds verified trees" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContentBand title="What the IdleForest Extension Does">
          <p>
            Once installed, the extension sits quietly in your browser. It uses your idle bandwidth, the part of your
            connection you are not using, to run small data tasks for paying clients. The revenue from those tasks funds
            tree planting with verified partners.
          </p>
          <p>
            You do not have to do anything after you install it. You do not switch your search engine, change a setting,
            or visit a special site. You browse the way you always have, and trees get funded in the background.
          </p>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
            See exactly how it works <ArrowRight className="h-5 w-5" />
          </Link>
        </ContentBand>

        <section className="bg-brand-navy text-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="max-w-4xl">
              <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal text-brand-yellow md:text-5xl">
                How to Add IdleForest to Chrome
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/85">
                Installing takes about ten seconds. There are three steps.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <StepCard id="step-1" number="1." title="Open the Chrome Web Store Listing">
                Click “Add to Chrome — It’s Free” on this page. It opens the official IdleForest listing on the Chrome
                Web Store.
              </StepCard>
              <StepCard id="step-2" number="2." title="Click “Add to Chrome”">
                On the store listing, click the blue “Add to Chrome” button, then confirm. Chrome installs the extension
                in a few seconds.
              </StepCard>
              <StepCard id="step-3" number="3." title="You’re Done">
                That is it. The extension starts running on its own. You do not need to create an account, sign in, or
                change any setting. Trees begin to get funded as you browse.
              </StepCard>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="max-w-4xl">
              <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
                Why IdleForest Beats Other Tree-Planting Extensions
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-800">
                Most tree-planting extensions ask you to change a habit: switch your search engine, click an ad, or open
                a new tab to plant. IdleForest asks for none of that. You install it once, then forget it.
              </p>
            </div>
            <div className="mt-10 overflow-x-auto rounded-lg border-2 border-black bg-brand-gray">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="bg-brand-yellow">
                    <th className="border-b-2 border-black p-4 font-rethink-sans text-lg font-extrabold"></th>
                    <th className="border-b-2 border-l-2 border-black p-4 font-rethink-sans text-lg font-extrabold">IdleForest</th>
                    <th className="border-b-2 border-l-2 border-black p-4 font-rethink-sans text-lg font-extrabold">Search-engine extensions</th>
                    <th className="border-b-2 border-l-2 border-black p-4 font-rethink-sans text-lg font-extrabold">New-tab / click extensions</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.map(([label, idleforest, searchExtensions, clickExtensions]) => (
                    <tr key={label}>
                      <th className="border-t-2 border-black p-4 font-bold">{label}</th>
                      <td className="border-l-2 border-t-2 border-black p-4">{idleforest}</td>
                      <td className="border-l-2 border-t-2 border-black p-4">{searchExtensions}</td>
                      <td className="border-l-2 border-t-2 border-black p-4">{clickExtensions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-6 flex flex-wrap gap-x-3 gap-y-2 text-lg font-bold">
              <span>Compare in detail:</span>
              <Link href={ecosiaAlternativesUrl} className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
                IdleForest vs Ecosia
              </Link>
              <span>·</span>
              <Link href={ecosiaAlternativesUrl} className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
                9 alternatives to Ecosia
              </Link>
            </p>
          </div>
        </section>

        <section className="bg-brand-gray">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-[360px_1fr] md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
              Trees You Can Verify
            </h2>
            <div className="max-w-3xl space-y-6 text-lg leading-8 text-neutral-800">
              <p>
                The extension funds planting with three reforestation partners: Trees for the Future, Tree-Nation, and
                1ClickImpact. Each one publishes its planting records, and each works in regions where reforestation has
                measurable carbon and biodiversity impact. You can see the full breakdown on the{" "}
                <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
                  transparency page
                </Link>
                .
              </p>
              <Link href="/transparency" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
                Read our full transparency report <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 divide-y-2 divide-black border-y-2 border-black">
              {faqs.map((item) => (
                <article key={item.question} className="grid gap-3 py-6 md:grid-cols-[320px_1fr] md:gap-8">
                  <h3 className="font-rethink-sans text-2xl font-extrabold">{item.question}</h3>
                  <p className="text-lg leading-8 text-neutral-800">{item.richAnswer ?? item.answer}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 text-center md:py-24">
            <div className="mx-auto max-w-3xl">
              <Sprout className="mx-auto h-12 w-12 text-brand-navy" />
              <h2 className="mt-5 font-rethink-sans text-4xl font-extrabold tracking-normal md:text-6xl">
                Add IdleForest to Chrome in 10 Seconds
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-800 md:text-xl">
                One click to install. Browse like you always do. Watch trees get planted.
              </p>
              <div className="mt-8 flex justify-center">
                <ChromeCtas
                  desktopDownloadHref={desktopDownloadHref}
                  desktopDownloadLabel={desktopDownloadLabel}
                  centered
                  compact
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ChromeCtas({
  desktopDownloadHref,
  desktopDownloadLabel,
  centered = false,
  compact = false,
}: {
  desktopDownloadHref: string;
  desktopDownloadLabel: string;
  centered?: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`mt-8 flex flex-col gap-4 ${centered ? "items-center" : ""}`}>
      <Button asChild className="h-auto rounded-full bg-black px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-navy">
        <a href={chromeWebStoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
          <Chrome className="h-5 w-5" />
          Add to Chrome — It’s Free
        </a>
      </Button>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold md:text-base">
        {compact ? null : <span>Prefer a desktop app?</span>}
        <Link href={desktopDownloadHref} className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
          <Download className="h-4 w-4" />
          {compact ? "Download for Mac / Windows / Linux" : desktopDownloadLabel}
        </Link>
      </div>
    </div>
  );
}

function Signal({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 border-b-2 border-black pb-4 last:border-b-0 last:pb-0">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-brand-yellow text-black">{icon}</div>
      <span className="font-bold">{label}</span>
    </div>
  );
}

function ContentBand({
  title,
  children,
  tinted = false,
}: {
  title: string;
  children: React.ReactNode;
  tinted?: boolean;
}) {
  return (
    <section className={tinted ? "bg-white" : "bg-brand-gray"}>
      <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-[360px_1fr] md:py-24">
        <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">{title}</h2>
        <div className="max-w-3xl space-y-6 text-lg leading-8 text-neutral-800">{children}</div>
      </div>
    </section>
  );
}

function StepCard({
  id,
  number,
  title,
  children,
}: {
  id: string;
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <article id={id} className="rounded-lg border-2 border-brand-yellow bg-white p-6 text-black">
      <div className="text-5xl font-extrabold text-brand-navy">{number}</div>
      <h3 className="mt-4 font-rethink-sans text-2xl font-extrabold md:text-3xl">{title}</h3>
      <p className="mt-4 text-base leading-7 text-neutral-800 md:text-lg">{children}</p>
    </article>
  );
}
