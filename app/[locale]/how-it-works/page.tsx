import type { Metadata } from "next";
import { headers } from "next/headers";
import { ArrowRight, BadgeCheck, Chrome, Download, Leaf, ShieldCheck, Sprout, Trees, Wifi } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";
import { getDeviceInfo } from "@/lib/device-detection";

const chromeWebStoreUrl =
  "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk";

const pageTitle = "How IdleForest Works: Plant Trees With Idle Bandwidth";
const pageDescription =
  "See how IdleForest works. Your idle internet bandwidth runs small data tasks in the background, and the revenue funds verified tree planting. No cost to you.";
const canonicalUrl = "https://www.idleforest.com/how-it-works";

const faqItems = [
  {
    question: "Is IdleForest really free?",
    answer:
      "Yes. There is no cost, no subscription, and no donation. You do not pay, and you are not asked to. The trees are funded by the revenue from idle bandwidth tasks, not by you.",
  },
  {
    question: "Will it slow down my computer or internet?",
    answer:
      "No. The app uses only the bandwidth you are not using, and it steps aside the moment you need it. When you start a video call, open a heavy site, or download a file, IdleForest backs off. Your browsing keeps its full speed.",
  },
  {
    question: "What data passes through my connection?",
    answer:
      "Automated data requests from paying clients, such as uptime checks and price lookups. None of it is yours. Your logins, files, and browsing history never enter the process, and the tasks carry no cookies or identifiers.",
  },
  {
    question: "Is it safe to install?",
    answer:
      "Yes. IdleForest is featured on the Chrome Web Store and rated 4.8 stars from 33 reviews. The app runs in the background and touches only spare bandwidth, not your personal data.",
  },
  {
    question: "Can I use it with Ecosia or another search engine?",
    answer:
      "Yes. IdleForest does not change your search engine, your browser, or any setting. It runs alongside whatever you already use, including Ecosia, Brave, Chrome, and Edge. You can stack the impact.",
    link: {
      href: "/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025",
      text: "Can I use it with Ecosia",
    },
  },
  {
    question: "How much bandwidth does it use?",
    answer:
      "Only what is spare. The app reads how much capacity is free and uses a small part of it. When your connection gets busy, it backs off on its own, so you do not notice it running.",
  },
  {
    question: "How do I know the trees are real?",
    answer:
      "The money goes to named reforestation partners who plant and verify the trees on the ground. You can see the running totals and the partners on the transparency page, with reports from each partner.",
    richAnswer: (
      <>
        The money goes to named reforestation partners who plant and verify the trees on the ground. You can see the running
        totals and the partners on the{" "}
        <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          transparency page
        </Link>
        , with{" "}
        <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
          reports from each partner
        </Link>
        .
      </>
    ),
  },
  {
    question: "Does it work on mobile?",
    answer:
      "Not yet. IdleForest runs as a Chrome extension and as a desktop app for Mac and Windows. Mobile networks carry far less idle bandwidth than home connections, so a mobile version is on the roadmap but not live.",
  },
  {
    question: "How do I pause or uninstall it?",
    answer:
      "You can pause it at any time from the extension menu, or remove it like any other extension or program. Once removed, no bandwidth is used and no data is collected. The trees you have already funded stay funded.",
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
  const desktopDownloadHref = deviceInfo.isMac ? "/download/mac" : deviceInfo.isWindows ? "/download/windows" : "/downloads#desktop-apps";
  const desktopDownloadLabel = deviceInfo.isMac
    ? "Download for Mac"
    : deviceInfo.isWindows
      ? "Download for Windows"
      : "Download for Mac / Windows";

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        <section className="relative overflow-hidden bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                  <Leaf className="h-4 w-4" />
                  how does idleforest work
                </div>
                <h1 className="font-rethink-sans text-[44px] font-extrabold leading-[1.02] tracking-normal sm:text-6xl md:text-7xl">
                  How IdleForest Works
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                  IdleForest runs in the background and uses the internet bandwidth you are not using. It routes small,
                  paid data tasks through your spare connection, and it sends the money from those tasks to verified
                  tree-planting partners. You pay nothing, and you never change how you browse. Install it once, and it
                  plants trees while you go about your day.
                </p>
                <CtaGroup desktopDownloadHref={desktopDownloadHref} desktopDownloadLabel={desktopDownloadLabel} />
              </div>

              <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
                <div className="grid gap-4">
                  <Signal icon={<Wifi className="h-5 w-5" />} label="Spare bandwidth" />
                  <Signal icon={<ShieldCheck className="h-5 w-5" />} label="Sessionless data tasks" />
                  <Signal icon={<BadgeCheck className="h-5 w-5" />} label="Paid by companies" />
                  <Signal icon={<Trees className="h-5 w-5" />} label="Funds verified trees" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContentBand title="What Idle Bandwidth Is">
          <p>
            Most of the time, your internet connection sits idle. Even with your browser open, you use only a small slice
            of what your connection can carry. The rest goes to waste.
          </p>
          <p>
            Idle bandwidth is that unused capacity. IdleForest borrows it, and only it. Your browsing, streaming, and
            downloads always come first, so you keep the full speed you pay for. The moment you need the connection, the
            app steps back.
          </p>
        </ContentBand>

        <section className="bg-brand-navy text-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="max-w-4xl">
              <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal text-brand-yellow md:text-5xl">
                How the App Turns Bandwidth Into Trees
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/85">
                Four things happen between the moment you install the app and the moment a tree goes in the ground. Here
                is the full chain.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              <StepCard id="step-1" number="1." title="You Install the App">
                Add the Chrome extension in one click, or install the small desktop app for Mac or Windows. There is no
                account to make, no form to fill, and no payment. The install takes about ten seconds.
              </StepCard>
              <StepCard id="step-2" number="2." title="It Runs Small Data Tasks in the Background">
                The app sends small data tasks through your spare bandwidth, such as uptime checks and market-research
                queries. These tasks are sessionless. They carry no cookies, no personal details, and no part of your
                browsing history.
              </StepCard>
              <StepCard id="step-3" number="3." title="Companies Pay for Those Tasks">
                Businesses pay to run these tasks across many connections at once. Your share is small on its own. Across
                every user running the app, it adds up to real money each month.
              </StepCard>
              <StepCard id="step-4" number="4." title="The Money Funds Verified Tree Planting">
                IdleForest passes that money to its reforestation partners, Trees for the Future, Tree-Nation, and
                1ClickImpact, who plant the trees and verify them on the ground. You can watch the totals climb on the
                impact page.
              </StepCard>
            </div>

            <Link
              href="/impact"
              className="mt-10 inline-flex items-center gap-2 text-lg font-bold text-brand-yellow underline underline-offset-4 hover:text-white"
            >
              See the live tree count <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>

        <ContentBand title="What Data Moves Through Your Connection">
          <p>
            The tasks that run through your connection are automated data requests from paying clients. Think of them as
            small lookups: is this website up, what does this product cost in this region. They have nothing to do with
            you.
          </p>
          <p>
            Your logins, your files, your accounts, and your browsing history never enter the process. Each task is
            sessionless, so there are no cookies and no identifiers tied to it. The app does not read your tabs, your
            bookmarks, or your search history.
          </p>
          <p>
            Because the app uses only spare capacity, your own browsing always takes priority. You can see the full
            breakdown of task types in our{" "}
            <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
              transparency report
            </Link>
            , and how we handle data in our{" "}
            <Link href="/privacy" className="font-bold underline underline-offset-4 hover:text-brand-navy">
              privacy policy
            </Link>
            .
          </p>
          <Link
            href="/privacy"
            className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy"
          >
            Read our privacy policy <ArrowRight className="h-5 w-5" />
          </Link>
        </ContentBand>

        <ContentBand title="Why Fund Trees This Way" tinted>
          <p>
            Data tasks like these run across the internet every second of the day. The capacity to carry them already
            exists, sitting idle on millions of connections. IdleForest channels a slice of that demand into
            reforestation instead of letting it go to waste.
          </p>
          <p>
            It also keeps some of this work off the large data centers that handle it today, which carry their own energy
            cost. The result is the same trees, funded by capacity you were not using anyway, at no cost to you.
          </p>
        </ContentBand>

        <section className="bg-brand-gray">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 divide-y-2 divide-black border-y-2 border-black">
              {faqItems.map((item) => (
                <article key={item.question} className="grid gap-3 py-6 md:grid-cols-[320px_1fr] md:gap-8">
                  <h3 className="font-rethink-sans text-2xl font-extrabold">{item.question}</h3>
                  <div className="space-y-3 text-lg leading-8 text-neutral-800">
                    <p>{item.richAnswer ?? item.answer}</p>
                    {item.link ? (
                      <Link
                        href={item.link.href}
                        className="inline-flex items-center gap-2 font-bold underline underline-offset-4 hover:text-brand-navy"
                      >
                        {item.link.text} <ArrowRight className="h-5 w-5" />
                      </Link>
                    ) : null}
                  </div>
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
                Start Planting Trees in 10 Seconds
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-800 md:text-xl">
                Install it once, change nothing, and let it run. Your spare bandwidth does the rest.
              </p>
              <div className="mt-8 flex justify-center">
                <CtaGroup desktopDownloadHref={desktopDownloadHref} desktopDownloadLabel={desktopDownloadLabel} centered />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CtaGroup({
  desktopDownloadHref,
  desktopDownloadLabel,
  centered = false,
}: {
  desktopDownloadHref: string;
  desktopDownloadLabel: string;
  centered?: boolean;
}) {
  return (
    <div className={`mt-8 flex flex-col gap-3 sm:flex-row ${centered ? "sm:justify-center" : ""}`}>
      <Button asChild className="h-auto rounded-full bg-black px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-navy">
        <a href={chromeWebStoreUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
          <Chrome className="h-5 w-5" />
          Add to Chrome — It’s Free
        </a>
      </Button>
      <Button
        asChild
        variant="outline"
        className="h-auto rounded-full border-2 border-black bg-white px-7 py-4 text-base font-bold text-black hover:bg-brand-gray"
      >
        <a href={desktopDownloadHref} className="inline-flex items-center gap-2">
          <Download className="h-5 w-5" />
          {desktopDownloadLabel}
        </a>
      </Button>
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
