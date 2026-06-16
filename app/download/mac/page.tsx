import type { Metadata } from "next";
import { Apple, ArrowRight, BadgeCheck, Chrome, Download, ShieldCheck, Sprout, TreePine, Wifi } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const pageTitle = "Tree Planting App for Mac, Free | IdleForest";
const pageDescription =
  "IdleForest is a free tree planting app for Mac. Install it once and it plants verified trees with your idle bandwidth, even when your browser is closed.";
const canonicalUrl = "https://www.idleforest.com/download/mac";
const macInstallerHref = "/download/mac/installer";
const impactStats = [
  ["5,364", "trees planted"],
  ["$2,796", "contributed"],
  ["10.1M", "requests powered"],
  ["1,000+", "users"],
];

const faqs = [
  {
    question: "Is the Mac app free?",
    answer:
      "Yes. There is no cost, no subscription, and no donation. The app is funded by the revenue from idle bandwidth tasks, not by you.",
  },
  {
    question: "Will it slow down my computer or internet?",
    answer:
      "No. The app uses only the bandwidth you are not using, and it steps back the moment you need it. When you start a video call, open a heavy site, or download a file, the app backs off. Your computer keeps its full speed.",
  },
  {
    question: "Which versions of macOS does it support?",
    answer:
      "IdleForest runs on macOS 11 Big Sur and later, on both Apple Silicon and Intel Macs. The app is light and runs in the background without slowing your machine.",
  },
  {
    question: "Is it safe to install?",
    answer:
      "Yes. IdleForest is featured on the Chrome Web Store and rated 4.8 stars from 33 reviews. The app runs in the background and touches only spare bandwidth, not your personal data.",
  },
  {
    question: "What data passes through my connection?",
    answer:
      "Automated data requests from paying clients, such as uptime checks and price lookups. None of it is yours. Your files, logins, and browsing history never enter the process, and the tasks carry no cookies or identifiers.",
  },
  {
    question: "Do I need the Chrome extension too?",
    answer:
      "No. The desktop app works on its own and funds more trees than the extension because it runs even when your browser is closed. You can run both if you like, but you do not need to.",
  },
  {
    question: "How do I uninstall it on Mac?",
    answer:
      "Quit IdleForest, then drag it from your Applications folder to the Trash. Once removed, no bandwidth is used. The trees you have already funded stay funded.",
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
        alt: "IdleForest Mac app",
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

export default function MacDownloadPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        <section className="relative overflow-hidden bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                  <Apple className="h-4 w-4" />
                  tree planting app for mac
                </div>
                <h1 className="font-rethink-sans text-[42px] font-extrabold leading-[1.02] tracking-normal sm:text-6xl md:text-7xl">
                  The Free Tree Planting App for Mac
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                  IdleForest is a free Mac app that plants verified trees while you use your computer. It runs in the
                  background and uses the internet bandwidth you are not using to fund tree-planting projects. You
                  download it once. There is no account, no payment, and nothing to change about how you work.
                </p>
                <MacCtas />
              </div>

              <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
                <div className="grid gap-4">
                  <Signal icon={<Apple className="h-5 w-5" />} label="Runs on macOS 11+" />
                  <Signal icon={<Wifi className="h-5 w-5" />} label="Uses spare bandwidth" />
                  <Signal icon={<BadgeCheck className="h-5 w-5" />} label="Works when browsers are closed" />
                  <Signal icon={<TreePine className="h-5 w-5" />} label="Funds verified trees" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContentBand title="What the Mac App Does">
          <p>
            Once installed, the app sits quietly in the background. It uses your idle bandwidth, the part of your
            connection you are not using, to run small data tasks for paying clients. The revenue from those tasks funds
            tree planting with verified partners.
          </p>
          <p>
            It runs as a lightweight Mac app and starts with your computer, so it keeps funding trees even when your
            browser is closed. You do not switch your search engine, change a setting, or remember to do anything. You
            use your computer the way you always have, and trees get funded in the background.
          </p>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
            See exactly how it works →
          </Link>
        </ContentBand>

        <ContentBand title="Why the Desktop App Plants More Than the Extension" tinted>
          <p>
            The Chrome extension only runs while Chrome is open. The Mac app runs whenever your computer is on, even
            when every browser is closed. That means more idle bandwidth put to work, and more trees funded over time. If
            you leave your computer on, the desktop app is the stronger choice. You can run both if you want.
          </p>
          <Link href="/download/chrome" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
            Prefer the browser? Add the Chrome extension <ArrowRight className="h-5 w-5" />
          </Link>
        </ContentBand>

        <section className="bg-brand-navy text-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="max-w-4xl">
              <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal text-brand-yellow md:text-5xl">
                How to Install IdleForest on Mac
              </h2>
              <p className="mt-5 text-lg leading-8 text-white/85">
                Installing takes about a minute. There are three steps.
              </p>
            </div>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <StepCard id="step-1" number="1." title="Download the App">
                Click “Download for Mac” on this page. The .dmg file downloads to your computer.
              </StepCard>
              <StepCard id="step-2" number="2." title="Open the .dmg and Install">
                Open the downloaded .dmg file and drag IdleForest into your Applications folder. The install takes about
                a minute.
              </StepCard>
              <StepCard id="step-3" number="3." title="You’re Done">
                Open IdleForest once, and it starts running on its own. You do not need to create an account or change
                any setting. Trees begin to get funded as you use your computer.
              </StepCard>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-[360px_1fr] md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
              Trees You Can Verify
            </h2>
            <div className="max-w-3xl space-y-6 text-lg leading-8 text-neutral-800">
              <p>
                The app funds planting with three reforestation partners: Trees for the Future, Tree-Nation, and
                1ClickImpact. Each one publishes its planting records, and each works in regions where reforestation has
                measurable carbon and biodiversity impact. You can see the full breakdown on the{" "}
                <Link href="/transparency" className="font-bold underline underline-offset-4 hover:text-brand-navy">
                  transparency page
                </Link>
                .
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {impactStats.map(([value, label]) => (
                  <div key={label} className="border-2 border-black bg-brand-yellow p-4">
                    <p className="font-candu text-4xl leading-none text-brand-navy">{value}</p>
                    <p className="mt-2 text-xs font-extrabold uppercase tracking-[0.14em] text-black/70">{label}</p>
                  </div>
                ))}
              </div>
              <Link href="/transparency" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
                Read our full transparency report <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-brand-gray">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">
              Frequently Asked Questions
            </h2>
            <div className="mt-10 divide-y-2 divide-black border-y-2 border-black">
              {faqs.map((item) => (
                <article key={item.question} className="grid gap-3 py-6 md:grid-cols-[320px_1fr] md:gap-8">
                  <h3 className="font-rethink-sans text-2xl font-extrabold">{item.question}</h3>
                  <p className="text-lg leading-8 text-neutral-800">{item.answer}</p>
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
                Install IdleForest on Mac in a Minute
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-800 md:text-xl">
                Download it once. Use your computer like always. Watch trees get planted.
              </p>
              <div className="mt-8 flex justify-center">
                <MacCtas centered compact />
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function MacCtas({ centered = false, compact = false }: { centered?: boolean; compact?: boolean }) {
  return (
    <div className={`mt-8 flex flex-col gap-4 ${centered ? "items-center" : ""}`}>
      <Button asChild className="h-auto rounded-full bg-black px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-navy">
        <a href={macInstallerHref} className="inline-flex items-center gap-2">
          <Download className="h-5 w-5" />
          Download for Mac — It’s Free
        </a>
      </Button>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold md:text-base">
        {compact ? null : <span>Use Windows instead?</span>}
        <Link href="/download/windows" className="underline underline-offset-4 hover:text-brand-navy">
          Get the Windows app
        </Link>
        <span>·</span>
        <Link href="/download/chrome" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
          <Chrome className="h-4 w-4" />
          {compact ? "Add the Chrome extension" : "Or add the Chrome extension"}
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
    <article className="rounded-lg border-2 border-brand-yellow bg-white p-6 text-black">
      <div className="text-5xl font-extrabold text-brand-navy">{number}</div>
      <h3 id={id} className="mt-4 font-rethink-sans text-2xl font-extrabold md:text-3xl">{title}</h3>
      <p className="mt-4 text-base leading-7 text-neutral-800 md:text-lg">{children}</p>
    </article>
  );
}
