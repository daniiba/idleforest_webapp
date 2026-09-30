"use client";

import Navigation from "@/components/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronDown,
  ExternalLink,
  Globe,
  Leaf,
  MapPin,
  Shield,
} from "lucide-react";
import { Link } from "@/navigation";
import NextLink from "next/link";
import { FREE_TREE_GUIDE_PATH } from "@/lib/free-tree-guide";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { groupByProject, plantingsData } from "@/lib/plantings";
import { FundingArt } from "@/components/partner/WastefreeArt";
import { HabitatArt, RunArt } from "@/components/partner/MossyEarthArt";

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
  { art: RunArt, title: "Idle bandwidth does small public tasks", body: "Sessionless requests to public web pages for one vetted client. No personal data, cookies or browsing history." },
  { art: FundingArt, title: "Those tasks generate revenue", body: "The client pays for the web-data work. That payment, not your money, funds the trees." },
  { art: HabitatArt, title: "The revenue funds verified planting", body: "It goes to established partners who plant and record the trees. The rest of this page lets you check it." },
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

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black";
const secondaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-6 py-3.5 text-sm font-bold text-brand-navy transition-colors hover:bg-neutral-100";
const linkStyle = "font-bold underline decoration-brand-yellow decoration-2 underline-offset-4 hover:text-black";

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group rounded-3xl border border-neutral-200 bg-white">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 text-lg font-extrabold tracking-tight sm:px-8 sm:py-6 [&::-webkit-details-marker]:hidden">
        {title}
        <ChevronDown className="h-5 w-5 shrink-0 text-neutral-400 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-neutral-200 p-5 sm:px-8 sm:py-6">{children}</div>
    </details>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-6 text-neutral-700">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
            <Check className="h-3 w-3" aria-hidden="true" />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

export default function TransparencyPage() {
  const t = useTranslations('Transparency');

  return (
    <>
      <Navigation />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <main className="min-h-screen bg-[#F7F7F2] text-brand-navy">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
          {/* Hero */}
          <section className="grid items-center gap-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3.5 py-1.5 text-sm font-bold">
                <Shield className="h-4 w-4" aria-hidden="true" />
                {t('badge')}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Does IdleForest actually plant trees?
              </h1>
              <p className="mt-4 max-w-lg text-lg leading-7 text-neutral-600">
                Yes, and you can check every step. Named partners plant the trees, and their public records back the live counter.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#receipts" className={primaryButton}>
                  See the verified projects <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
                <a href="https://github.com/daniiba/idleforest" target="_blank" rel="noopener noreferrer" className={secondaryButton}>
                  Read the open-source code <ExternalLink className="h-4 w-4" aria-hidden="true" />
                </a>
              </div>
            </div>
            <div className="rounded-2xl bg-brand-navy p-6 text-white sm:p-8">
              <p className="text-sm font-semibold text-white/70">Live community total</p>
              <p className="mt-1 text-6xl font-extrabold leading-none tracking-tight text-brand-yellow sm:text-7xl">{totalTrees.toLocaleString()}</p>
              <p className="mt-2 text-sm text-white/70">trees funded, from public partner records</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <Link href="/report" className="inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-navy">
                  Full report <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link href="/map" className="inline-flex items-center gap-1.5 rounded-full border border-white/40 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">
                  Planting map <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </div>
          </section>

          {/* Funding chain */}
          <section aria-labelledby="chain-heading">
            <h2 id="chain-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">How IdleForest plants trees</h2>
            <p className="mt-1 max-w-2xl text-neutral-600">
              Money has to come from somewhere and end up somewhere, and both ends are public. See{" "}
              <Link href="/how-it-works" className={linkStyle}>how idle bandwidth funds trees</Link>.
            </p>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {fundingSteps.map((step) => (
                <li key={step.title} className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-6 text-center">
                  <step.art className="h-24 w-24" />
                  <h3 className="mt-4 text-lg font-extrabold tracking-tight">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-neutral-600">{step.body}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* Partners */}
          <section aria-labelledby="partners-heading" className="overflow-hidden rounded-3xl bg-brand-navy px-5 py-10 text-white sm:px-10 sm:py-12">
            <h2 id="partners-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Who plants the trees</h2>
            <p className="mt-1 max-w-2xl text-white/70">IdleForest funds organizations chosen for published records and long-term survival, not cheap volume.</p>
            <div className="mt-6 grid gap-3 lg:grid-cols-3">
              {partners.map((partner) => (
                <article key={partner.name} className="flex flex-col rounded-3xl bg-white/10 p-5">
                  <div className="flex h-20 items-center justify-center rounded-2xl bg-white p-4">
                    <Image src={partner.logoSrc} alt={partner.logoAlt} width={220} height={90} unoptimized className="max-h-12 w-auto max-w-full object-contain" />
                  </div>
                  <h3 className="mt-4 text-lg font-extrabold">{partner.name}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/75">{partner.body}</p>
                  <a href={partner.href} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-brand-yellow underline decoration-2 underline-offset-4">
                    Visit partner <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </article>
              ))}
            </div>
          </section>

          {/* Receipts */}
          <section id="receipts" className="scroll-mt-24" aria-labelledby="receipts-heading">
            <h2 id="receipts-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">The receipts: real projects you can open</h2>
            <p className="mt-1 max-w-2xl text-neutral-600">Project records live on the partners&apos; own sites. These cards link straight to them.</p>
            <div className="mt-5 grid gap-4 lg:grid-cols-3">
              {proofProjects.map((proofProject) => {
                const project = plantingsData.projects.find((item) => item.id === proofProject.projectId);
                const partner = plantingsData.partners.find((item) => item.id === project?.partnerId);
                const trees = projectStats[proofProject.projectId]?.trees ?? 0;

                return (
                  <a key={proofProject.projectId} href={project?.externalRef || "#"} target="_blank" rel="noopener noreferrer" className="group block">
                    <article className="h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                      <div className="relative aspect-[16/10] bg-neutral-100">
                        <Image src={proofProject.imageSrc} alt={project?.name || "IdleForest planting project"} fill sizes="(min-width: 1024px) 360px, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                        <span className="absolute left-3 top-3 rounded-full bg-brand-yellow px-3 py-1 text-sm font-bold text-brand-navy">{trees.toLocaleString()} trees</span>
                      </div>
                      <div className="p-5">
                        <h3 className="text-lg font-extrabold leading-tight">{project?.name}</h3>
                        <p className="mt-2 text-sm leading-6 text-neutral-600">{proofProject.body}</p>
                        <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-neutral-700">
                          <span className="inline-flex items-center gap-1.5"><Leaf className="h-4 w-4 text-emerald-700" aria-hidden="true" />{partner?.name}</span>
                          <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-700" aria-hidden="true" />{proofProject.location}</span>
                        </p>
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                          Open the project records <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </span>
                      </div>
                    </article>
                  </a>
                );
              })}
            </div>

            <div className="mt-4 rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
              <h3 className="text-lg font-extrabold tracking-tight">How to check this yourself</h3>
              <div className="mt-4 grid gap-x-8 gap-y-3 md:grid-cols-2">
                <Bullets
                  items={[
                    "Open a partner project page. The counts are published on their sites, not just here.",
                    "Compare those totals with the live counter, the report and the map.",
                  ]}
                />
                <Bullets
                  items={[
                    "Audit the code: the extension and desktop app are open source.",
                    "Check the client at olostep.com to see who pays for the bandwidth work.",
                  ]}
                />
              </div>
            </div>
          </section>

          {/* Where the money comes from */}
          <section aria-labelledby="client-heading" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10">
              <div>
                <h2 id="client-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Where the money comes from</h2>
                <p className="mt-2 text-neutral-600">A vetted client pays to use idle bandwidth for public web tasks. That revenue funds the planting.</p>
                <div className="mt-5 flex items-center gap-3 rounded-2xl bg-neutral-50 p-4">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-navy text-brand-yellow">
                    <Globe className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-extrabold leading-tight">Olostep</p>
                    <p className="text-sm text-neutral-600">{t('olostep_subtitle')}</p>
                  </div>
                  <a href="https://www.olostep.com" target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                    {t('visit_olostep')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
              </div>
              <div>
                <p className="mb-3 text-sm font-semibold text-neutral-500">{t('how_bandwidth_used')}</p>
                <Bullets items={[t('no_cookies'), t('public_only'), t('isolated'), t('ip_usage')]} />
              </div>
            </div>
          </section>

          {/* Deep dives */}
          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">The details</h2>
            <p className="mt-1 text-neutral-600">Environmental impact, what tasks run, legal protections and security. Open what you need.</p>
            <div className="mt-5 space-y-3">
              <Detail title={t('env_title')}>
                <p className="max-w-3xl text-neutral-600">{t('env_desc')}</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-2xl bg-red-50 p-5">
                    <h3 className="font-extrabold">{t('dc_title')}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                      {["dc_energy", "dc_cooling", "dc_infra", "dc_water", "dc_waste"].map((k) => (
                        <li key={k} className="flex items-start gap-2"><span className="font-bold text-red-600" aria-hidden="true">✗</span>{t(k)}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-5">
                    <h3 className="font-extrabold">{t('dn_title')}</h3>
                    <ul className="mt-3 space-y-2 text-sm text-neutral-700">
                      {["dn_infra", "dn_cooling", "dn_idle", "dn_water"].map((k) => (
                        <li key={k} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />{t(k)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <h3 className="mt-6 text-lg font-extrabold">{t('savings_title')}</h3>
                <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                  {[
                    ["energy_pct", "energy_label", "energy_desc"],
                    ["water_pct", "water_label", "water_desc"],
                    ["carbon_pct", "carbon_label", "carbon_desc"],
                  ].map(([pct, label, desc]) => (
                    <div key={pct} className="rounded-2xl bg-neutral-50 p-4">
                      <dd className="text-3xl font-extrabold tracking-tight">{t(pct)}</dd>
                      <dt className="mt-1 text-sm font-bold">{t(label)}</dt>
                      <p className="mt-1 text-xs leading-5 text-neutral-500">{t(desc)}</p>
                    </div>
                  ))}
                </dl>
                <p className="mt-4 rounded-2xl bg-neutral-50 p-4 text-sm leading-6 text-neutral-700">
                  <strong className="text-brand-navy">{t('bottom_line')}</strong> {t('bottom_line_desc')}
                </p>
              </Detail>

              <Detail title={t('searches_title')}>
                <div className="grid gap-3 md:grid-cols-2">
                  {[["bi_title", "bi_desc"], ["price_title", "price_desc"], ["research_title", "research_desc"], ["content_title", "content_desc"]].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl bg-neutral-50 p-4">
                      <h3 className="font-extrabold">{t(title)}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{t(desc)}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden="true" />
                  <div>
                    <h3 className="font-extrabold">{t('dont_do_title')}</h3>
                    <ul className="mt-2 space-y-1.5 text-sm text-neutral-700">
                      {["dont_password", "dont_illegal", "dont_spam", "dont_personal", "dont_tos"].map((k) => (
                        <li key={k} className="flex items-start gap-2"><span className="font-bold" aria-hidden="true">✗</span>{t(k)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Detail>

              <Detail title={t('legal_title')}>
                <p className="max-w-3xl text-neutral-600">{t('legal_desc')}</p>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {[
                    ["liability_title", "liability_desc", ["liability_1", "liability_2", "liability_3"]],
                    ["vetting_title", "vetting_desc", ["vetting_1", "vetting_2", "vetting_3", "vetting_4"]],
                    ["monitoring_title", "monitoring_desc", ["monitoring_1", "monitoring_2", "monitoring_3", "monitoring_4"]],
                    ["gdpr_title", "gdpr_desc", ["gdpr_1", "gdpr_2", "gdpr_3", "gdpr_4"]],
                  ].map(([title, desc, items]) => (
                    <div key={title as string} className="rounded-2xl bg-neutral-50 p-5">
                      <h3 className="font-extrabold">{t(title as string)}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{t(desc as string)}</p>
                      <div className="mt-3">
                        <Bullets items={(items as string[]).map((k) => t(k))} />
                      </div>
                    </div>
                  ))}
                </div>
              </Detail>

              <Detail title={t('security_title')}>
                <div className="grid gap-3 md:grid-cols-2">
                  {[["encrypted_title", "encrypted_desc"], ["isolated_title", "isolated_desc"], ["logging_title", "logging_desc"], ["opensource_title", "opensource_desc"], ["bandwidth_title", "bandwidth_desc"], ["optout_title", "optout_desc"]].map(([title, desc]) => (
                    <div key={title} className="rounded-2xl bg-neutral-50 p-4">
                      <h3 className="font-extrabold">{t(title)}</h3>
                      <p className="mt-1 text-sm leading-6 text-neutral-600">{t(desc)}</p>
                      {title === "opensource_title" && (
                        <a href="https://github.com/daniiba/idleforest" target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                          {t('view_github')} <ExternalLink className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Detail>
            </div>
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Tree-planting proof: common questions</h2>
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

          {/* Next steps */}
          <section aria-labelledby="next-heading">
            <h2 id="next-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Keep exploring</h2>
            <p className="mt-1 text-neutral-600">
              Our <NextLink href={FREE_TREE_GUIDE_PATH} className={linkStyle}>guide to planting trees for free</NextLink> also covers search engines, local tree giveaways and volunteering.
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {[
                { href: "/reviews", title: "Reviews and user proof", body: "Independent user feedback." },
                { href: "/ecosia-alternatives", title: "Compare tree-planting tools", body: "Ecosia alternatives side by side." },
                { href: "/ecosia", title: "Use IdleForest with Ecosia", body: "How the two approaches complement each other." },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="group block">
                  <article className="h-full rounded-3xl border border-neutral-200 bg-white p-6 transition duration-200 group-hover:-translate-y-0.5 group-hover:shadow-md">
                    <h3 className="text-lg font-extrabold tracking-tight">{item.title}</h3>
                    <p className="mt-1 text-sm text-neutral-600">{item.body}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline decoration-brand-yellow decoration-2 underline-offset-4">
                      Open page <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </article>
                </Link>
              ))}
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-3xl bg-brand-navy px-6 py-12 text-center text-white sm:py-16">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{t('still_questions')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-white/70">{t('still_questions_desc')}</p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
              <Link href="/contact" className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-6 py-3.5 text-sm font-bold text-brand-navy transition hover:brightness-95">
                {t('contact_us')}
              </Link>
              <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/10">
                {t('back_home')}
              </Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
