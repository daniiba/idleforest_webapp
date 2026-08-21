import type { Metadata } from "next";
import { ArrowRight, BadgeCheck, Chrome, Download, Monitor, Sprout, Terminal, TreePine, Wifi } from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Link } from "@/navigation";

const pageTitle = "Tree Planting App for Linux, Free | IdleForest";
const pageDescription =
  "IdleForest is a free tree planting app for Linux. Install the 64-bit .deb package and fund verified trees with your idle bandwidth, even when your browser is closed.";
const canonicalUrl = "https://www.idleforest.com/download/linux";
const linuxInstallerHref = "/download/linux/installer";

const impactStats = [
  ["5,364", "trees planted"],
  ["$2,796", "contributed"],
  ["10.1M", "requests powered"],
  ["1,000+", "users"],
];

const faqs = [
  {
    question: "Is the Linux app free?",
    answer:
      "Yes. There is no cost, subscription, or donation. The app is funded by revenue from idle bandwidth tasks, not by you.",
  },
  {
    question: "Which Linux systems does it support?",
    answer:
      "The first Linux release is a 64-bit .deb package for x64 Linux systems that support Debian packages.",
  },
  {
    question: "Will it slow down my computer or internet?",
    answer:
      "No. IdleForest uses only bandwidth you are not using and steps back when you need your connection.",
  },
  {
    question: "Is it safe to install?",
    answer:
      "IdleForest uses spare bandwidth for automated client requests. Your files, logins, and browsing history do not enter the process.",
  },
  {
    question: "Do I need the Chrome extension too?",
    answer:
      "No. The Linux app works on its own, including when your browser is closed. You can run both, but you do not need to.",
  },
  {
    question: "How do I uninstall it?",
    answer:
      "Remove IdleForest using your system software manager or package manager. Once removed, it stops using bandwidth; trees already funded stay funded.",
  },
];

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: canonicalUrl,
    siteName: "IdleForest",
    type: "website",
    images: [{ url: "/preview.png", width: 1280, height: 800, alt: "IdleForest Linux app" }],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: ["/preview.png"],
  },
};

export default function LinuxDownloadPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-brand-gray text-black">
        <section className="relative overflow-hidden bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
              <div className="max-w-4xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-md bg-brand-navy px-4 py-2 text-sm font-bold uppercase text-brand-yellow">
                  <Terminal className="h-4 w-4" />
                  64-bit · .deb · x64
                </div>
                <h1 className="font-rethink-sans text-[42px] font-extrabold leading-[1.02] tracking-normal sm:text-6xl md:text-7xl">
                  The Free Tree Planting App for Linux
                </h1>
                <p className="mt-6 max-w-3xl text-lg leading-8 text-neutral-800 md:text-xl">
                  Install IdleForest once and turn spare internet bandwidth into funding for verified trees. The Linux
                  app runs quietly in the background, even when your browser is closed—without an account or payment.
                </p>
                <LinuxCtas />
              </div>

              <div className="rounded-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(11,16,31,1)]">
                <div className="grid gap-4">
                  <Signal icon={<Terminal className="h-5 w-5" />} label="64-bit .deb package for x64 Linux" />
                  <Signal icon={<Wifi className="h-5 w-5" />} label="Uses spare bandwidth" />
                  <Signal icon={<BadgeCheck className="h-5 w-5" />} label="Works when browsers are closed" />
                  <Signal icon={<TreePine className="h-5 w-5" />} label="Funds verified trees" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <ContentBand title="What the Linux App Does">
          <p>
            IdleForest uses the part of your internet connection you are not using to run small data tasks for paying
            clients. Revenue from those tasks funds tree planting with verified partners.
          </p>
          <p>
            The desktop app keeps working while your computer is on, including when every browser is closed. There is
            no search engine to switch, no donation, and no daily action to remember.
          </p>
          <Link href="/how-it-works" className="inline-flex items-center gap-2 text-lg font-bold underline underline-offset-4 hover:text-brand-navy">
            See exactly how it works <ArrowRight className="h-5 w-5" />
          </Link>
        </ContentBand>

        <ContentBand title="Built for a Simple Linux Install" tinted>
          <p>
            This first Linux release is packaged as a 64-bit .deb for x64 systems that support Debian packages. Download
            it directly from IdleForest, open it with your system package installer, and launch the app once.
          </p>
          <p>
            Prefer another platform? IdleForest is also available for Windows, Mac, and as a Chrome extension.
          </p>
        </ContentBand>

        <section className="bg-brand-navy text-white">
          <div className="container mx-auto px-6 py-16 md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal text-brand-yellow md:text-5xl">
              How to Install IdleForest on Linux
            </h2>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              <StepCard id="step-1" number="1." title="Download the Package">
                Click “Download for Linux” to get the 64-bit .deb package.
              </StepCard>
              <StepCard id="step-2" number="2." title="Install the .deb">
                Open the downloaded file with your system package installer and follow the prompts.
              </StepCard>
              <StepCard id="step-3" number="3." title="Launch IdleForest">
                Open IdleForest once. No account or settings are needed, and trees begin getting funded as you use your computer.
              </StepCard>
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-[360px_1fr] md:py-24">
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">Trees You Can Verify</h2>
            <div className="max-w-3xl space-y-6 text-lg leading-8 text-neutral-800">
              <p>
                IdleForest funds planting with Trees for the Future, Tree-Nation, and 1ClickImpact. See the planting
                records and contribution breakdown on our transparency page.
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
            <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">Frequently Asked Questions</h2>
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
            <Sprout className="mx-auto h-12 w-12 text-brand-navy" />
            <h2 className="mx-auto mt-5 max-w-3xl font-rethink-sans text-4xl font-extrabold tracking-normal md:text-6xl">
              Put Your Linux Computer to Work for Trees
            </h2>
            <p className="mt-5 text-lg leading-8 text-neutral-800 md:text-xl">Download it once. Use Linux like always. Help fund verified trees.</p>
            <div className="mt-8 flex justify-center"><LinuxCtas centered /></div>
          </div>
        </section>
      </main>
    </>
  );
}

function LinuxCtas({ centered = false }: { centered?: boolean }) {
  return (
    <div className={`mt-8 flex flex-col gap-4 ${centered ? "items-center" : ""}`}>
      <Button asChild className="h-auto rounded-full bg-black px-7 py-4 text-base font-bold text-brand-yellow hover:bg-brand-navy">
        <a href={linuxInstallerHref} className="inline-flex items-center gap-2">
          <Download className="h-5 w-5" /> Download for Linux — It’s Free
        </a>
      </Button>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm font-bold md:text-base">
        <Link href="/download/windows" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
          <Monitor className="h-4 w-4" /> Windows
        </Link>
        <span>·</span>
        <Link href="/download/mac" className="underline underline-offset-4 hover:text-brand-navy">Mac</Link>
        <span>·</span>
        <Link href="/download/chrome" className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-brand-navy">
          <Chrome className="h-4 w-4" /> Chrome extension
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

function ContentBand({ title, children, tinted = false }: { title: string; children: React.ReactNode; tinted?: boolean }) {
  return (
    <section className={tinted ? "bg-white" : "bg-brand-gray"}>
      <div className="container mx-auto grid gap-8 px-6 py-16 md:grid-cols-[360px_1fr] md:py-24">
        <h2 className="font-rethink-sans text-4xl font-extrabold tracking-normal md:text-5xl">{title}</h2>
        <div className="max-w-3xl space-y-6 text-lg leading-8 text-neutral-800">{children}</div>
      </div>
    </section>
  );
}

function StepCard({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-lg border-2 border-brand-yellow bg-white p-6 text-black">
      <div className="text-5xl font-extrabold text-brand-navy">{number}</div>
      <h3 id={id} className="mt-4 font-rethink-sans text-2xl font-extrabold md:text-3xl">{title}</h3>
      <p className="mt-4 text-base leading-7 text-neutral-800 md:text-lg">{children}</p>
    </article>
  );
}
