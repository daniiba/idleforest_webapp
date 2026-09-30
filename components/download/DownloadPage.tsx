import type { ComponentType, SVGProps } from "react";
import { ArrowRight, Check, ChevronDown, Chrome, Download } from "lucide-react";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import IdleBandwidthArt from "@/components/landing/IdleBandwidthArt";
import { OsLogo } from "@/components/icons/os-logos";
import { InstallArt, RunArt } from "@/components/partner/MossyEarthArt";
import { InstallerArt, PackageArt } from "@/components/download/DownloadArt";

type Platform = "windows" | "mac" | "linux" | "chrome";
type Art = ComponentType<SVGProps<SVGSVGElement>>;

export type DownloadPageConfig = {
  platform: Platform;
  /** "Windows", "Mac", "Linux" or "Chrome" */
  name: string;
  /** H1, kept close to the SEO title */
  title: string;
  /** One short sentence under the title */
  lede: string;
  primaryHref: string;
  primaryLabel: string;
  external?: boolean;
  /** Short facts shown as chips */
  chips: string[];
  /** Exactly three short steps */
  steps: { title: string; body: string; art?: Art }[];
  faqs: { question: string; answer: string }[];
};

const stats = [
  ["5,364", "trees planted"],
  ["$2,796", "contributed"],
  ["10.1M", "requests powered"],
  ["1,000+", "users"],
];

const others: { platform: Platform; label: string; href: string }[] = [
  { platform: "windows", label: "Windows", href: "/download/windows" },
  { platform: "mac", label: "Mac", href: "/download/mac" },
  { platform: "linux", label: "Linux", href: "/download/linux" },
  { platform: "chrome", label: "Chrome extension", href: "/download/chrome" },
];

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-full bg-brand-navy px-7 py-4 text-base font-bold text-white transition-colors hover:bg-black";

export default function DownloadPage({ config }: { config: DownloadPageConfig }) {
  const { platform, name, title, lede, primaryHref, primaryLabel, external, chips, steps, faqs } = config;
  const defaultArts: Art[] = platform === "chrome" ? [InstallArt, InstallerArt, RunArt] : [PackageArt, InstallerArt, RunArt];
  const linkProps = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  const Icon = platform === "chrome" ? Chrome : Download;

  const cta = (
    <a href={primaryHref} className={primaryButton} {...linkProps}>
      <Icon className="h-5 w-5" aria-hidden="true" />
      {primaryLabel}
    </a>
  );

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-[#F7F7F2] text-brand-navy">
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
          {/* Hero */}
          <section className="grid items-center gap-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-3.5 py-1.5 text-sm font-bold text-brand-navy">
                {platform === "chrome" ? <Chrome className="h-4 w-4" aria-hidden="true" /> : <OsLogo os={platform} className="h-4 w-4" />}
                IdleForest for {name}
              </p>
              <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
              <p className="mt-4 max-w-lg text-lg leading-7 text-neutral-600">{lede}</p>
              <div className="mt-7">{cta}</div>
              <ul className="mt-6 flex flex-wrap gap-2">
                {chips.map((chip) => (
                  <li key={chip} className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-sm font-medium text-neutral-700">
                    <Check className="h-3.5 w-3.5 text-green-600" aria-hidden="true" />
                    {chip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl bg-[#F7F7F2] p-3 sm:p-5">
              <IdleBandwidthArt className="h-auto w-full" />
            </div>
          </section>

          {/* Steps */}
          <section aria-labelledby="steps-heading">
            <h2 id="steps-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Set up in about a minute</h2>
            <ol className="mt-5 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => {
                const StepArt = step.art ?? defaultArts[index];
                return (
                  <li key={step.title} id={`step-${index + 1}`} className="flex flex-col items-center rounded-3xl border border-neutral-200 bg-white p-6 text-center">
                    <StepArt className="h-24 w-24" />
                    <h3 className="mt-4 text-xl font-extrabold tracking-tight">{step.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{step.body}</p>
                  </li>
                );
              })}
            </ol>
          </section>

          {/* Verified impact */}
          <section className="rounded-3xl bg-brand-navy p-6 text-white sm:p-10" aria-labelledby="impact-heading">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 id="impact-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Trees you can verify</h2>
                <p className="mt-1 text-white/70">Funded through Trees for the Future, Tree-Nation and 1ClickImpact. All planting records are public.</p>
              </div>
              <Link href="/transparency" className="inline-flex items-center gap-2 text-sm font-bold text-brand-yellow underline decoration-2 underline-offset-4">
                See the transparency report
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="rounded-2xl bg-white/10 p-4">
                  <dd className="text-3xl font-extrabold tabular-nums tracking-tight text-brand-yellow">{value}</dd>
                  <dt className="mt-1 text-sm text-white/70">{label}</dt>
                </div>
              ))}
            </dl>
          </section>

          {/* FAQ */}
          <section className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8" aria-labelledby="faq-heading">
            <h2 id="faq-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">Quick answers</h2>
            <div className="mt-4 divide-y divide-neutral-200">
              {faqs.map((item) => (
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
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Use your computer like always. Trees get planted.
            </h2>
            <div className="mt-7 flex justify-center">{cta}</div>
            <p className="mt-6 text-sm font-semibold text-neutral-800">
              Also available for:{" "}
              {others
                .filter((item) => item.platform !== platform)
                .map((item, index, list) => (
                  <span key={item.platform}>
                    <Link href={item.href} className="underline underline-offset-4 hover:text-brand-navy">
                      {item.label}
                    </Link>
                    {index < list.length - 1 ? " · " : ""}
                  </span>
                ))}
            </p>
          </section>
        </div>
      </main>
    </>
  );
}
