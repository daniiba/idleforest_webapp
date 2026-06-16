import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Chrome,
  Leaf,
  Search,
  ShieldCheck,
  Trees,
  Wifi,
} from "lucide-react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { transformedData, getHistoricalTreeData, getMonthlyData, getProjectLocations } from "@/lib/dataTransform";
import { plantingsData } from "@/lib/plantings";
import Script from "next/script";
import EcosiaClient from "./EcosiaClient";
import { Link } from "@/navigation";
import { routeAlternates } from "@/lib/i18n-routes";

const pageTitle = "Use IdleForest With Ecosia: Plant More Trees, No Switch";
const pageDescription =
  "Already use Ecosia? Add IdleForest to plant more verified trees from idle bandwidth, with no search switch. Two independent sources of impact, both free.";

const useCaseFaqs = [
  {
    question: "Can I use IdleForest with Ecosia?",
    answer:
      "Yes. IdleForest works alongside Ecosia, so you can keep using Ecosia for searches while IdleForest adds a passive tree-funding layer from opt-in idle bandwidth. It works with Chrome, Edge, and the desktop apps.",
  },
  {
    question: "Do I have to stop using Ecosia?",
    answer:
      "No. IdleForest does not replace Ecosia, change your search engine, or ask you to give up search-funded impact.",
  },
  {
    question: "Does running both slow down my browser?",
    answer:
      "IdleForest is designed to run quietly in the background with controls for bandwidth use. If you ever need every bit of connection speed, you can pause it.",
  },
  {
    question: "Will I plant more trees by using both?",
    answer:
      "Using both creates two independent sources of impact: Ecosia funds climate projects when you search, and IdleForest funds verified tree planting while opted in.",
  },
  {
    question: "Is Ecosia's AI bad for the environment?",
    answer:
      "Ecosia says its AI adds about 5% to its emissions and that it offsets this with renewable energy. Adding IdleForest gives you verified planting that does not depend on that question.",
  },
  {
    question: "Is IdleForest free like Ecosia?",
    answer:
      "Yes. IdleForest is free for users. Its tree funding comes from opt-in idle bandwidth, not subscriptions or purchases.",
  },
  {
    question: "How do I know IdleForest actually plants trees?",
    answer:
      "IdleForest publishes a transparency page with public planting records, receipt links, partner details, and open-source code so users can inspect how the model works.",
  },
];

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      "use idleforest with ecosia",
      "IdleForest Ecosia",
      "plant more trees with Ecosia",
      "Ecosia browser extension",
      "verified tree planting",
      "tree planting extension",
      "environmentally friendly search engine",
    ],
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      url: "https://www.idleforest.com/ecosia",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
    },
    alternates: routeAlternates("/ecosia", params.locale),
  };
}

const Highlight = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <article className="group flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-black bg-brand-gray text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1">
    <div className="flex h-28 items-end bg-brand-navy p-5 text-brand-yellow">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {icon}
      </div>
    </div>
    <div className="flex flex-1 flex-col p-6">
      <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight text-black">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-neutral-700">{children}</p>
    </div>
  </article>
);

const ProofRow = ({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) => (
  <div className="rounded-2xl border border-brand-yellow/20 bg-white/5 p-4">
    <div className="flex gap-4">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-black">
      {icon}
      </div>
      <div>
        <h3 className="font-bold text-brand-yellow">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-brand-yellow/75">{children}</p>
      </div>
    </div>
  </div>
);

const Index = () => {
  const monthlyData = getMonthlyData();
  const historicalTreeData = getHistoricalTreeData();
  const projectLocations = getProjectLocations();
  const idleForestTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0);

  const totalIncome = monthlyData.reduce((acc, curr) => acc + curr.income, 0);
  const totalTreesFinanced = historicalTreeData.reduce((acc, curr) => acc + curr.numberOfTreesFinanced, 0);
  const avgTreeSurplus = historicalTreeData.reduce((acc, curr) => acc + curr.treeSurplusPercent, 0) / historicalTreeData.length;

  const latestData = monthlyData[monthlyData.length - 1];
  const totalTreeFund = latestData?.treeFund || 0;
  const treePlanting = monthlyData.reduce((acc, curr) => acc + curr.paidProjects, 0);
  const greenInvestments = monthlyData.reduce((acc, curr) => acc + curr.greenInvestments, 0);
  const operationalCosts = monthlyData.reduce((acc, curr) => acc + curr.operationalCosts, 0);
  const taxes = monthlyData.reduce((acc, curr) => acc + curr.taxes, 0);
  const marketing = monthlyData.reduce((acc, curr) => acc + curr.marketing, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "SoftwareApplication",
        name: "IdleForest",
        applicationCategory: "BrowserExtension",
        operatingSystem: "Chrome, Edge, macOS, Windows",
        url: "https://www.idleforest.com/ecosia",
        downloadUrl: "https://www.idleforest.com/download/chrome",
        description: pageDescription,
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: useCaseFaqs.map((faq) => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer,
          },
        })),
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
            name: "Use IdleForest With Ecosia",
            item: "https://www.idleforest.com/ecosia",
          },
        ],
      },
      {
        "@type": "Dataset",
        name: "Ecosia Financial Data and Historical Tree Planting Report",
        description:
          "Financial data and historical records of Ecosia's tree planting efforts, including income reports, expense breakdowns, and environmental impact metrics.",
        url: "https://www.idleforest.com/ecosia",
        keywords: [
          "ecosia financial data",
          "ecosia historical data",
          "ecosia financial report",
          "ecosia tree planting data",
          "ecosia revenue data",
          "ecosia expense breakdown",
        ],
        creator: {
          "@type": "Organization",
          name: "IdleForest",
          url: "https://www.idleforest.com",
        },
        temporalCoverage: "2020/..",
        spatialCoverage: {
          "@type": "Place",
          name: "Global",
        },
      },
    ],
  };

  return (
    <>
      <main className="relative min-h-screen bg-brand-gray pb-24 text-black">
        <Navigation />

        <section className="border-b-2 border-black bg-brand-yellow">
          <div className="container mx-auto grid gap-10 px-4 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 border-2 border-black bg-white px-3 py-1 text-sm font-bold uppercase">
                <Leaf className="h-4 w-4" />
                Ecosia companion
              </p>
              <h1 className="font-rethink-sans text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                Use IdleForest With Ecosia
              </h1>
              <p className="mt-6 max-w-3xl text-xl leading-relaxed text-neutral-800">
                Already use Ecosia? Add IdleForest to plant more verified trees from idle bandwidth,
                with no search switch. Two independent sources of impact, both free.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="border-2 border-black bg-brand-navy px-6 py-6 font-bold text-brand-yellow hover:bg-black">
                  <Link href="/download/chrome">
                    <Chrome className="h-5 w-5" />
                    Add IdleForest to Chrome
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-black bg-white px-6 py-6 font-bold text-black hover:bg-black hover:text-brand-yellow">
                  <Link href="/transparency">
                    See the verified planting proof <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-3 text-sm font-bold text-black">
                <span className="rounded-full border-2 border-black bg-white px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">No search-engine switch</span>
                <span className="rounded-full border-2 border-black bg-white px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Free to use</span>
                <span className="rounded-full border-2 border-black bg-white px-4 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Public planting records</span>
              </div>
            </div>

            <aside className="overflow-hidden rounded-[28px] border-2 border-black bg-brand-navy p-6 text-brand-yellow shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="font-rethink-sans text-3xl font-extrabold leading-tight">Keep Ecosia. Add more trees.</h2>
              <div className="mt-6 space-y-5">
                <ProofRow icon={<Search className="h-5 w-5" />} title="Ecosia keeps funding trees when you search">
                  Your existing search habit can stay exactly where it is.
                </ProofRow>
                <ProofRow icon={<Wifi className="h-5 w-5" />} title="IdleForest adds idle-bandwidth impact">
                  Install once, opt in, and turn spare bandwidth into tree funding.
                </ProofRow>
                <ProofRow icon={<Trees className="h-5 w-5" />} title={`${idleForestTrees.toLocaleString()} trees in public records`}>
                  IdleForest publishes planting data and receipts on its transparency page.
                </ProofRow>
              </div>
            </aside>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="font-rethink-sans text-3xl font-extrabold sm:text-4xl">
              Why use IdleForest and Ecosia together
            </h2>
            <p className="mt-4 text-lg text-neutral-700">
              Ecosia and IdleForest do not need to compete for the same habit. Ecosia attaches impact to
              search. IdleForest attaches impact to the time your browser is already open.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <Highlight icon={<Search className="h-6 w-6" />} title="Search stays search">
              You can keep using Ecosia for web searches and still add IdleForest without changing your
              homepage, new-tab page, or default search engine.
            </Highlight>
            <Highlight icon={<Wifi className="h-6 w-6" />} title="Idle time can help">
              IdleForest funds verified planting through opt-in idle bandwidth, so impact can happen beyond
              the search box.
            </Highlight>
            <Highlight icon={<BadgeCheck className="h-6 w-6" />} title="Proof stays inspectable">
              Ecosia publishes financial reports. IdleForest publishes planting records, receipts, partner
              details, and open-source code.
            </Highlight>
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-center text-lg text-neutral-700">
            Want to{" "}
            <Link href="/compare" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
              see how IdleForest compares with Ecosia and other tools
            </Link>
            ?
          </p>
        </section>

        <section className="border-y-2 border-black bg-white py-16">
          <div className="container mx-auto grid gap-10 px-4 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <h2 className="font-rethink-sans text-3xl font-extrabold sm:text-4xl">
                What IdleForest adds for Ecosia users
              </h2>
              <p className="mt-4 text-neutral-700">
                IdleForest is useful if you like Ecosia's idea but want an extra climate tool that does not
                depend on making every search through one provider. See{" "}
                <Link href="/how-it-works" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                  how idle bandwidth funds trees
                </Link>
                , or compare options{" "}
                <Link href="/ecosia-alternatives" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                  if you want to leave Ecosia
                </Link>
                .
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/how-it-works" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-brand-yellow hover:shadow-none">
                  How it works <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/ecosia-alternatives" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-brand-yellow hover:shadow-none">
                  Ecosia alternatives
                </Link>
              </div>
            </div>
            <div className="grid gap-5">
              {[
                <>
                  A passive{" "}
                  <Link href="/tree-planting-extension" className="font-bold underline decoration-2 underline-offset-4">
                    tree-planting extension
                  </Link>{" "}
                  that runs alongside Ecosia rather than asking you to switch away.
                </>,
                "A different funding model, based on opt-in idle bandwidth instead of search advertising.",
                "A direct transparency trail for IdleForest planting, including public records and receipts.",
              ].map((item, index) => (
                <div
                  key={`ecosia-addition-${index}`}
                  className={`flex gap-5 rounded-[28px] border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1 ${index === 0
                    ? "bg-brand-navy text-brand-yellow"
                    : index === 1
                      ? "bg-brand-yellow text-black"
                      : "bg-brand-gray text-black"
                    }`}
                >
                  <span className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-black font-candu text-2xl font-extrabold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ${index === 0 ? "bg-brand-yellow text-black" : "bg-white text-black"}`}>
                    {index + 1}
                  </span>
                  <p className={`text-lg font-semibold leading-7 ${index === 0 ? "text-brand-yellow/90" : "text-neutral-800"}`}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="mx-auto mb-10 max-w-4xl text-center">
            <h2 className="font-rethink-sans text-3xl font-extrabold sm:text-4xl">
              How Ecosia plants trees (and where it stops)
            </h2>
            <p className="mt-4 text-lg text-neutral-700">
              <a href="https://www.ecosia.org/" target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                Ecosia
              </a>
              {" "}is an{" "}
              <Link href="/eco-friendly-search-engine" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                eco-friendly search engine
              </Link>
              {" "}with a search-based model: revenue from searches can be allocated to climate projects and
              tree planting. The dashboard below keeps the financial and historical data visible so you can
              inspect how Ecosia reports income, expenses, tree funding, and project activity.
            </p>
          </div>
        </section>

        <EcosiaClient
          monthlyData={monthlyData}
          transformedData={transformedData}
          historicalTreeData={historicalTreeData}
          projectLocations={projectLocations}
          totalIncome={totalIncome}
          totalTreesFinanced={totalTreesFinanced}
          avgTreeSurplus={avgTreeSurplus}
          totalTreeFund={totalTreeFund}
          treePlanting={treePlanting}
          greenInvestments={greenInvestments}
          operationalCosts={operationalCosts}
          taxes={taxes}
          marketing={marketing}
        />

        <section className="container mx-auto grid gap-8 px-4 py-16 lg:grid-cols-2">
          <article className="flex min-w-0 flex-col rounded-[28px] border-2 border-black bg-white p-7 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Bot className="h-7 w-7" />
            </div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">
              Is Ecosia's AI environmentally friendly?
            </h2>
            <p className="mt-4 flex-1 leading-7 text-neutral-700">
              AI search features can use more energy than traditional search results, which is why Ecosia users
              have been asking sharper questions about environmental impact. IdleForest does not make a verdict
              on Ecosia for you; it gives you another free, inspectable way to fund planting while the broader
              search industry gets heavier.
            </p>
            <Link href="/blog/ecosias-ai-user-backlash-and-environmental-impact" className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-brand-yellow hover:shadow-none">
              Read about Ecosia AI impact <ArrowRight className="h-4 w-4" />
            </Link>
          </article>

          <article className="flex min-w-0 flex-col rounded-[28px] border-2 border-black bg-brand-yellow p-7 text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 hover:-translate-y-1">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-black bg-brand-navy text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h2 className="font-rethink-sans text-3xl font-extrabold">
              The planting you are adding is verified
            </h2>
            <p className="mt-4 flex-1 leading-7 text-neutral-800">
              IdleForest's public records currently show {idleForestTrees.toLocaleString()} trees funded or planted.
              The transparency page links the community total to partner records, receipts, and project details.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/transparency" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-navy px-5 py-3 font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:shadow-none">
                See transparency <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/is-ecosia-legit-safe" className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:text-brand-yellow hover:shadow-none">
                Ecosia safety guide
              </Link>
            </div>
          </article>
        </section>

        <section className="border-y-2 border-black bg-white py-16">
          <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <h2 className="font-rethink-sans text-3xl font-extrabold">Using IdleForest with Ecosia: common questions</h2>
              <p className="mt-3 text-neutral-700">
                The practical questions Ecosia users usually ask before adding IdleForest.
              </p>
            </div>
            <div className="grid gap-4">
              {useCaseFaqs.map((faq, index) => (
                <section key={faq.question} className="rounded-2xl border-2 border-black bg-brand-gray p-5 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex gap-4">
                    <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-yellow font-candu text-lg font-extrabold text-black">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="font-rethink-sans text-xl font-extrabold leading-tight">{faq.question}</h3>
                      <p className="mt-2 leading-7 text-neutral-700">{faq.answer}</p>
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-brand-navy py-16 text-white">
          <div className="container mx-auto grid gap-8 px-4 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="font-rethink-sans text-4xl font-extrabold text-brand-yellow">
                Keep Ecosia. Add more trees.
              </h2>
              <p className="mt-3 max-w-2xl text-white/80">
                Keep search-funded impact where you already have it, and add IdleForest for verified passive
                planting in the background.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="border-2 border-brand-yellow bg-brand-yellow px-6 py-6 font-bold text-black hover:bg-white">
                <Link href="/download/chrome">
                  Add IdleForest to Chrome <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-brand-yellow bg-transparent px-6 py-6 font-bold text-brand-yellow hover:bg-brand-yellow hover:text-black">
                <Link href="/blog/how-to-plant-more-trees-with-ecosia">
                  Plant more with Ecosia
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Script
        id="ecosia-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
};

export default Index;
