"use client";

import Navigation from "@/components/navigation";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  Leaf,
  Lock,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import { Link } from "@/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { groupByProject, plantingsData } from "@/lib/plantings";

const totalTrees = plantingsData.events.reduce((sum, event) => sum + event.trees, 0);
const projectStats = groupByProject(plantingsData.events);

const faqItems = [
  {
    question: "Does IdleForest actually plant trees?",
    answer:
      "Yes. Funding goes to Trees for the Future, Tree-Nation, and 1ClickImpact, each with public project records, and the live counter on this page is drawn from those records.",
  },
  {
    question: "How does IdleForest plant trees?",
    answer:
      "Your idle bandwidth performs small public web tasks for a vetted client, that client pays for the work, and that revenue funds verified planting. Your money is never involved.",
  },
  {
    question: "How do I know the trees are real?",
    answer:
      "Every project links to the partner's own page, where the counts and details are published independently. You can also see the breakdown on the report and map pages.",
  },
  {
    question: "How many trees has IdleForest funded?",
    answer: "The current community total is shown on the live counter, updated from partner records.",
  },
  {
    question: "Where are the trees planted?",
    answer:
      "In partner projects across regions such as Kenya and Tanzania, chosen for native species, food forests, and long-term community benefit.",
  },
  {
    question: "Do these apps really plant trees, or is it a gimmick?",
    answer:
      "The credible ones publish records and let you verify. IdleForest names its partners, links each project, and open-sources its code so the whole chain is checkable.",
  },
  {
    question: "Where does the money come from if it is free for me?",
    answer:
      "From the client that pays to use your idle bandwidth for public web tasks. You pay nothing; the revenue funds the trees.",
  },
  {
    question: "Is sharing my bandwidth safe?",
    answer:
      "Yes. Requests are sessionless, carry no personal data, run in isolation, and you can pause or uninstall any time. For independent user reviews of IdleForest, see the reviews page.",
  },
  {
    question: "Can I audit the code?",
    answer: "Yes. The extension and desktop app are open source on GitHub for independent review.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqItems.map((item) => ({
    "@type": "Question",
    "name": item.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.answer,
    },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.idleforest.com/" },
    { "@type": "ListItem", "position": 2, "name": "Transparency", "item": "https://www.idleforest.com/transparency" },
  ],
};

const fundingSteps = [
  {
    title: "Your idle bandwidth does small public tasks.",
    body: (
      <>
        While your device sits idle, IdleForest routes sessionless requests to public web pages for one vetted client. See{" "}
        <Link href="/how-it-works" className="font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
          how idle bandwidth funds trees
        </Link>
        . No personal data, cookies, or browsing history is involved.
      </>
    ),
  },
  {
    title: "Those tasks generate revenue.",
    body: "The client pays for that web-data work. That payment, not your money, is what funds the trees.",
  },
  {
    title: "The revenue funds verified planting.",
    body: "IdleForest sends that revenue to established reforestation partners, who plant and record the trees. The rest of this page proves links two and three.",
  },
];

const partners = [
  {
    name: "Trees for the Future",
    href: "https://trees.org",
    logoSrc: "/partner-logos/trees-for-the-future.png",
    logoAlt: "Trees for the Future logo",
    body: "Plants food forests with smallholder farmers across Sub-Saharan Africa, restoring soil and local income.",
  },
  {
    name: "Tree-Nation",
    href: "https://tree-nation.com",
    logoSrc: "/partner-logos/tree-nation.svg",
    logoAlt: "Tree-Nation logo",
    body: "Restores native forests across dozens of countries, prioritizing native species over monoculture for stronger survival.",
  },
  {
    name: "1ClickImpact",
    href: "https://1clickimpact.com",
    logoSrc: "/partner-logos/1clickimpact.png",
    logoAlt: "1ClickImpact logo",
    body: "Funds planting with traceability across certificates, project records, and impact reporting.",
  },
];

const proofProjects = [
  {
    projectId: "tftf-kisumu7-awach",
    imageSrc: "https://images.1clickimpact.com/projects/trees-kenya-fgp/thumb.jpg",
    location: "Kenya",
    focus: "Agroforestry and land restoration",
    body: "Trees for the Future helps smallholder farmers build food forests that restore soil, capture carbon, and create long-term local income.",
  },
  {
    projectId: "tn-syzygium",
    imageSrc: "/report-images/mkussu-forest.jpg",
    location: "Lushoto District, Tanzania",
    focus: "Native forest recovery after wildfire",
    body: "Tree-Nation supports native forest recovery in the Mkussu Nature Forest Reserve after fire damage.",
  },
  {
    projectId: "tn-plant-to-stop-poverty",
    imageSrc: "/report-images/plant-to-stop-poverty.jpg",
    location: "Tanzania",
    focus: "Agroforestry and poverty reduction",
    body: "Tree-Nation helps rural communities implement agroforestry for ecological recovery and local income.",
  },
];

export default function TransparencyPage() {
  const t = useTranslations('Transparency');

  return (
    <>
      <Navigation />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <main className="min-h-screen bg-brand-gray text-black">
        {/* Hero Section */}
        <section className="relative bg-brand-yellow">
          <div className="container mx-auto px-6 py-16 md:py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-brand-navy text-brand-yellow px-4 py-2 rounded-md mb-6">
                <Shield className="h-5 w-5" />
                <span className="font-bold text-sm uppercase">{t('badge')}</span>
              </div>
              <h1 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold mb-6">
                Does IdleForest Actually Plant Trees?
              </h1>
              <p className="text-lg md:text-xl text-neutral-800 max-w-3xl mx-auto">
                Yes. IdleForest funds verified tree planting through named reforestation partners, each with public
                project records you can open yourself, and a live counter that draws from those records. This page shows
                the full chain, from the bandwidth you share to the trees in the ground, and exactly how to check every
                step.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href="#receipts"
                  className="inline-flex items-center justify-center gap-2 bg-brand-navy text-brand-yellow font-bold px-8 py-4 rounded-full hover:bg-black transition-colors"
                >
                  See the verified projects <ArrowRight className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com/daniiba/idleforest"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border-2 border-black text-black font-bold px-8 py-4 rounded-full hover:bg-white transition-colors"
                >
                  Read the open-source code <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Funding Chain Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  How does IdleForest plant trees?
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  The claim is simple, so the proof should be too. Money has to come from somewhere and end up
                  somewhere, and both ends are public. Unlike donation-based or search-based models, IdleForest funds
                  planting from idle bandwidth, so here is that chain in three steps.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {fundingSteps.map((step, index) => (
                  <Card key={step.title} className="bg-brand-yellow border-2 border-black p-6">
                    <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-md bg-brand-navy font-candu text-3xl text-brand-yellow">
                      {index + 1}
                    </div>
                    <h3 className="font-rethink-sans text-xl font-extrabold mb-3">{step.title}</h3>
                    <p className="text-neutral-800 leading-relaxed">{step.body}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Our Approved Client Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Where the money comes from: your idle bandwidth
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  {t('client_desc')}
                </p>
              </div>

              <Card className="bg-brand-yellow border-2 border-black p-8 md:p-10 mb-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                    <Globe className="h-6 w-6 text-brand-yellow" />
                  </div>
                  <div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-2">
                      Olostep
                    </h3>
                    <p className="text-neutral-800 font-bold mb-2">{t('olostep_subtitle')}</p>
                    <a
                      href="https://www.olostep.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold"
                    >
                      {t('visit_olostep')}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('what_olostep_does')}</h4>
                    <p className="text-neutral-800 leading-relaxed">
                      {t('what_olostep_does_desc')}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('how_bandwidth_used')}</h4>
                    <p className="text-neutral-800 leading-relaxed mb-3">
                      {t('how_bandwidth_desc')}
                    </p>
                    <ul className="space-y-2 ml-6">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('no_cookies')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('public_only')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('isolated')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-0.5" />
                        <span className="text-neutral-800">{t('ip_usage')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Who Uses Olostep */}
              <div className="bg-brand-gray border-2 border-black p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold mb-6 text-center">
                  {t('who_uses')}
                </h3>
                <p className="text-neutral-800 mb-6 text-center">
                  {t('who_uses_desc')}
                </p>

                <div className="bg-brand-yellow border-2 border-black p-6 text-center mb-6">
                  <p className="text-neutral-800 leading-relaxed">
                    Olostep serves vetted AI, research, and business-intelligence companies. We keep the client proof
                    here short because this page is about the full funding chain, not a customer directory.
                  </p>
                  <a
                    href="https://www.olostep.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-brand-navy hover:underline font-bold"
                  >
                    Check Olostep independently <ExternalLink className="h-4 w-4" />
                  </a>
                </div>

                <p className="text-sm text-neutral-600 text-center italic">
                  {t('who_uses_note')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Planting Partners Section */}
        <section className="relative bg-brand-navy text-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Who plants the trees
                </h2>
                <p className="text-lg max-w-3xl mx-auto">
                  IdleForest does not plant trees itself. It funds organizations that do, chosen for published records
                  and long-term survival rather than cheap volume. Each partner is linked so you can read their work
                  directly.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {partners.map((partner) => (
                  <Card key={partner.name} className="bg-brand-yellow text-black border-2 border-brand-yellow p-6">
                    <div className="mb-5 flex h-24 items-center justify-center border-2 border-black bg-white p-4">
                      <Image
                        src={partner.logoSrc}
                        alt={partner.logoAlt}
                        width={220}
                        height={90}
                        unoptimized
                        className="max-h-14 w-auto max-w-full object-contain"
                      />
                    </div>
                    <h3 className="font-rethink-sans text-2xl font-extrabold mb-3">{partner.name}</h3>
                    <p className="text-neutral-800 leading-relaxed mb-5">{partner.body}</p>
                    <a
                      href={partner.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold"
                    >
                      Visit partner site <ExternalLink className="h-4 w-4" />
                    </a>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Receipts Section */}
        <section id="receipts" className="relative scroll-mt-24 bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  The receipts: real projects you can open
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  This is the core IdleForest tree planting proof: project records live on partner sites, not only here.
                  The cards below pull the current project counts from our local planting records and link out to the
                  external project pages.
                </p>
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mb-10">
                {proofProjects.map((proofProject) => {
                  const project = plantingsData.projects.find((item) => item.id === proofProject.projectId);
                  const partner = plantingsData.partners.find((item) => item.id === project?.partnerId);
                  const trees = projectStats[proofProject.projectId]?.trees ?? 0;

                  return (
                    <a
                      key={proofProject.projectId}
                      href={project?.externalRef || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block h-full"
                    >
                      <article className="flex h-full flex-col overflow-hidden border-2 border-black bg-brand-yellow text-black transition-transform duration-200 group-hover:-translate-y-1">
                        <div className="relative h-52 border-b-2 border-black">
                          <Image
                            src={proofProject.imageSrc}
                            alt={project?.name || "IdleForest planting project"}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          />
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight">
                                {project?.name}
                              </h3>
                              <p className="mt-3 text-sm leading-6 text-neutral-800">{proofProject.body}</p>
                            </div>
                            <div className="w-[118px] shrink-0 border-2 border-black bg-brand-gray px-3 py-3 text-center">
                              <div className="font-candu text-3xl leading-none text-black">{trees.toLocaleString()}</div>
                              <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/70">
                                trees
                              </div>
                            </div>
                          </div>

                          <div className="mt-auto space-y-2 border-t border-black/15 pt-5 text-sm text-neutral-800">
                            <div className="flex items-center gap-2">
                              <Leaf className="h-4 w-4 text-brand-navy" />
                              <span>{partner?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-brand-navy" />
                              <span>{proofProject.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="h-4 w-4 text-brand-navy" />
                              <span>{proofProject.focus}</span>
                            </div>
                            <span className="inline-flex items-center gap-2 pt-2 font-bold text-brand-navy underline underline-offset-4">
                              Open the project records <ExternalLink className="h-4 w-4" />
                            </span>
                          </div>
                        </div>
                      </article>
                    </a>
                  );
                })}
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-8">
                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-brand-yellow/80">
                    Live community total
                  </p>
                  <div className="mt-3 font-candu text-6xl leading-none text-brand-yellow md:text-7xl">
                    {totalTrees.toLocaleString()}
                  </div>
                  <p className="mt-4 text-brand-yellow/85">
                    Trees funded to date from partner records currently stored in IdleForest's planting data.
                  </p>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <Link
                      href="/report"
                      className="inline-flex items-center justify-center gap-2 bg-brand-yellow px-5 py-3 font-bold text-black hover:bg-white"
                    >
                      Full report <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href="/map"
                      className="inline-flex items-center justify-center gap-2 border-2 border-brand-yellow px-5 py-3 font-bold text-brand-yellow hover:bg-brand-yellow hover:text-black"
                    >
                      Planting map <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <h2 className="font-rethink-sans text-2xl font-extrabold mb-5">How to check this yourself</h2>
                  <ul className="space-y-4 text-neutral-800">
                    {[
                      "Open the partner project pages above; the tree counts and project details are published on the partners' own sites, not just here.",
                      "Compare those totals against the live counter and the breakdown on the report and map pages.",
                      "Inspect the bandwidth side directly: the extension and desktop app are open source, so anyone can audit what the code does.",
                      "Check the client independently at olostep.com to confirm who pays for the bandwidth work.",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-brand-navy flex-shrink-0 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Impact Section */}
        <section className="relative bg-brand-navy text-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  {t('env_title')}
                </h2>
                <p className="text-lg max-w-3xl mx-auto">
                  {t('env_desc')}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <Card className="bg-brand-yellow text-black border-2 border-brand-yellow p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
                      <span className="text-3xl">🏭</span>
                    </div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                      {t('dc_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_energy')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_cooling')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_infra')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_water')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="font-bold text-red-600">✗</span>
                      <span>{t('dc_waste')}</span>
                    </li>
                  </ul>
                </Card>

                <Card className="bg-brand-yellow text-black border-2 border-brand-yellow p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-4 p-2">
                      <Image src="/logo.png" alt="IdleForest logo" width={48} height={48} className="w-full h-full object-contain" />
                    </div>
                    <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold">
                      {t('dn_title')}
                    </h3>
                  </div>
                  <ul className="space-y-3 text-neutral-800">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_infra')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_cooling')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_idle')}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>{t('dn_water')}</span>
                    </li>
                  </ul>
                </Card>
              </div>

              <div className="bg-brand-yellow border-2 border-brand-yellow p-8 md:p-10">
                <h3 className="font-rethink-sans text-2xl md:text-3xl font-extrabold text-center mb-8 text-black">
                  {t('savings_title')}
                </h3>
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('energy_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('energy_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('energy_desc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('water_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('water_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('water_desc')}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-extrabold text-brand-navy mb-2">{t('carbon_pct')}</div>
                    <div className="text-sm md:text-base text-neutral-800 font-bold">{t('carbon_label')}</div>
                    <p className="text-xs text-neutral-600 mt-2">{t('carbon_desc')}</p>
                  </div>
                </div>
                <div className="bg-brand-gray border-2 border-black p-6 text-center">
                  <p className="text-neutral-800 leading-relaxed">
                    <strong className="text-black">{t('bottom_line')}</strong> {t('bottom_line_desc')}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* What Types of Searches Section */}
        <section className="relative bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  {t('searches_title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('bi_title')}</h3>
                      <p className="text-sm">
                        {t('bi_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('price_title')}</h3>
                      <p className="text-sm">
                        {t('price_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('research_title')}</h3>
                      <p className="text-sm">
                        {t('research_desc')}
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-navy text-brand-yellow border-2 border-black p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <CheckCircle2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-lg mb-2">{t('content_title')}</h3>
                      <p className="text-sm">
                        {t('content_desc')}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="mt-8 bg-brand-gray border-2 border-black p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-brand-navy flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold text-lg mb-2">{t('dont_do_title')}</h4>
                    <ul className="space-y-2 text-neutral-800">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_password')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_illegal')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_spam')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_personal')}</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">✗</span>
                        <span>{t('dont_tos')}</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Protections Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  {t('legal_title')}
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  {t('legal_desc')}
                </p>
              </div>

              <div className="space-y-6">
                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Shield className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        {t('liability_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('liability_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('liability_3')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Lock className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        {t('vetting_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('vetting_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('vetting_4')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        {t('monitoring_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('monitoring_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('monitoring_4')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>

                <Card className="bg-brand-yellow border-2 border-black p-8">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-brand-navy rounded-md flex items-center justify-center flex-shrink-0">
                      <Users className="h-6 w-6 text-brand-yellow" />
                    </div>
                    <div>
                      <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold mb-3">
                        {t('gdpr_title')}
                      </h3>
                      <p className="text-neutral-800 mb-3">
                        {t('gdpr_desc')}
                      </p>
                      <ul className="space-y-2 ml-6 text-neutral-800">
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_1')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_2')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_3')}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="font-bold">•</span>
                          <span>{t('gdpr_4')}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Security Measures Section */}
        <section className="relative bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  {t('security_title')}
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('encrypted_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('encrypted_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('isolated_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('isolated_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('logging_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('logging_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('opensource_title')}</h3>
                  <p className="text-neutral-800 text-sm mb-3">
                    {t('opensource_desc')}
                  </p>
                  <a
                    href="https://github.com/daniiba/idleforest"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-brand-navy hover:underline font-bold text-sm"
                  >
                    {t('view_github')}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('bandwidth_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('bandwidth_desc')}
                  </p>
                </Card>

                <Card className="bg-brand-gray border-2 border-black p-6">
                  <h3 className="font-bold text-lg mb-3">{t('optout_title')}</h3>
                  <p className="text-neutral-800 text-sm">
                    {t('optout_desc')}
                  </p>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="relative bg-brand-gray py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Tree-planting proof: common questions
                </h2>
              </div>

              <div className="space-y-4">
                {faqItems.map((item) => (
                  <Card key={item.question} className="bg-brand-yellow border-2 border-black p-6">
                    <h3 className="font-bold text-lg mb-2">{item.question}</h3>
                    <p className="text-neutral-800">{item.answer}</p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps Section */}
        <section className="relative bg-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-4">
                  Next steps
                </h2>
                <p className="text-lg text-neutral-800 max-w-3xl mx-auto">
                  This page answers whether the planting is real. These related pages cover user proof, comparison
                  research, and how IdleForest can run alongside the tools you already use.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {[
                  {
                    href: "/reviews",
                    title: "IdleForest reviews and user proof",
                    body: "Read independent user feedback and social proof.",
                  },
                  {
                    href: "/ecosia-alternatives",
                    title: "comparing tree-planting tools",
                    body: "Compare tree-planting tools and Ecosia alternatives.",
                  },
                  {
                    href: "/ecosia",
                    title: "use IdleForest alongside Ecosia",
                    body: "See how search-based and idle-bandwidth funding can complement each other.",
                  },
                ].map((item) => (
                  <Link key={item.href} href={item.href} className="group block h-full">
                    <Card className="h-full bg-brand-gray border-2 border-black p-6 transition-transform duration-200 group-hover:-translate-y-1">
                      <h3 className="font-rethink-sans text-xl font-extrabold mb-3">{item.title}</h3>
                      <p className="text-neutral-800 mb-5">{item.body}</p>
                      <span className="inline-flex items-center gap-2 font-bold text-brand-navy underline underline-offset-4">
                        Open page <ArrowRight className="h-4 w-4" />
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="relative bg-brand-navy text-brand-yellow py-16 md:py-20">
          <div className="container mx-auto px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="font-rethink-sans text-[36px] sm:text-4xl md:text-5xl font-extrabold mb-6">
                {t('still_questions')}
              </h2>
              <p className="text-lg mb-8">
                {t('still_questions_desc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-brand-yellow text-black font-bold px-8 py-4 rounded-full hover:bg-white transition-colors"
                >
                  {t('contact_us')}
                </Link>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center gap-2 border-2 border-brand-yellow text-brand-yellow font-bold px-8 py-4 rounded-full hover:bg-brand-yellow hover:text-black transition-colors"
                >
                  {t('back_home')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
