"use client";

import Image from "next/image";
import { useReducedMotion, motion } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CircleDollarSign,
  FileCheck2,
  Globe2,
  HeartHandshake,
  Leaf,
  Megaphone,
  Network,
  ShieldCheck,
  Sparkles,
  TreePine,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";

import Navigation from "@/components/navigation";
import { Link } from "@/navigation";

const partnerTypes = [
  { icon: BadgeCheck, title: "esg_title", description: "esg_desc" },
  { icon: TreePine, title: "image_title", description: "image_desc" },
  { icon: Users, title: "community_title", description: "community_desc" },
  {
    icon: CircleDollarSign,
    title: "onboarding_title",
    description: "onboarding_desc",
  },
  {
    icon: HeartHandshake,
    title: "certificates_title",
    description: "certificates_desc",
  },
  { icon: FileCheck2, title: "donation_title", description: "donation_desc" },
] as const;

const fundingSteps = [
  {
    icon: Megaphone,
    title: "recognized_title",
    description: "recognized_desc",
  },
  { icon: Network, title: "shareable_title", description: "shareable_desc" },
  { icon: BarChart3, title: "esg_ready_title", description: "esg_ready_desc" },
] as const;

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.48, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({
  children,
  inverse = false,
}: {
  children: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <p
      className={`mb-5 inline-flex items-center gap-2 font-mono text-xs font-extrabold ${inverse ? "text-brand-yellow" : "text-black/60"}`}
    >
      <span
        className={`h-2 w-2 rounded-full ${inverse ? "bg-brand-yellow" : "bg-black"}`}
      />
      {children}
    </p>
  );
}

export default function BusinessPage() {
  const t = useTranslations("Business");

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#F7F7F2] text-brand-navy selection:bg-brand-yellow selection:text-black">
      <Navigation />

      <section className="relative isolate border-b border-neutral-200 bg-brand-navy text-white">
        <div className="mx-auto grid min-h-[720px] max-w-[1500px] lg:grid-cols-[1.08fr_0.92fr]">
          <div className="flex items-center px-5 py-14 sm:px-8 lg:px-14 lg:py-16 xl:px-20">
            <Reveal className="max-w-3xl">
              <SectionLabel inverse>{t("features_title")}</SectionLabel>
              <h1 className="text-[clamp(3rem,4.2vw,4.5rem)] font-extrabold leading-[0.88] tracking-[-0.03em]">
                {t("hero_title_line1")}
                <span className="relative mt-3 block w-fit text-brand-yellow">
                  {t("hero_title_line2")}
                  <span
                    className="absolute -bottom-3 left-0 h-1 w-[72%] bg-brand-yellow"
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <p className="mt-7 max-w-2xl text-lg font-semibold leading-8 text-white/75 sm:text-xl">
                {t("hero_desc")}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex min-h-14 items-center justify-center gap-3 border border-brand-yellow bg-brand-yellow px-7 text-base font-extrabold text-black transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow rounded-2xl"
                >
                  {t("contact_us")}{" "}
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
                <a
                  href="#funding-model"
                  className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/40 px-7 text-base font-extrabold text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-white"
                >
                  {t("download_windows")}{" "}
                  <ArrowDown className="h-5 w-5" aria-hidden="true" />
                </a>
              </div>
            </Reveal>
          </div>

          <div className="relative min-h-[560px] overflow-hidden border-t border-neutral-200 lg:min-h-full lg:border-l lg:border-t-0">
            <Image
              src="/report-images/plant-to-stop-poverty.jpg"
              alt="A community-led tree planting project"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy via-brand-navy/5 to-transparent" />

            <div className="absolute bottom-6 left-5 right-5 border border-neutral-200 bg-white p-5 text-black sm:bottom-10 sm:left-10 sm:right-auto sm:w-[390px] sm:p-7 rounded-2xl">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <span className="font-mono text-xs font-extrabold">
                  {t("cert_impact")}
                </span>
                <Sparkles className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-5 text-sm font-bold text-black/55">
                {t("cert_certifies")}
              </p>
              <p className="mt-1 text-3xl font-extrabold leading-none">
                {t("cert_contributed")}
              </p>
              <div
                className="mt-6 grid grid-cols-[auto_1fr_auto] items-center gap-3"
                aria-hidden="true"
              >
                <Users className="h-5 w-5" />
                <div className="h-1 bg-brand-navy" />
                <Leaf className="h-6 w-6 fill-brand-yellow" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-neutral-200 bg-brand-yellow">
        <div className="mx-auto grid max-w-[1500px] divide-y divide-neutral-200 md:grid-cols-3 md:divide-x-2 md:divide-y-0">
          {["trees_planted", "co2_offset", "project_locations"].map(
            (key, index) => {
              const icons = [Globe2, Users, ShieldCheck];
              const Icon = icons[index];
              return (
                <div
                  key={key}
                  className="flex min-h-24 items-center gap-4 px-5 py-5 sm:px-8 lg:px-12"
                >
                  <Icon
                    className="h-6 w-6 shrink-0"
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-extrabold tracking-wide">
                    {t(key)}
                  </span>
                </div>
              );
            },
          )}
        </div>
      </section>

      <section className="px-5 py-20 sm:px-8 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto max-w-[1360px]">
          <Reveal className="grid gap-8 border-b border-neutral-200 pb-12 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
            <div>
              <SectionLabel>{t("features_title")}</SectionLabel>
              <h2 className="text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl">
                {t("features_title")}
              </h2>
            </div>
            <p className="max-w-3xl text-lg font-semibold leading-8 text-black/65 lg:justify-self-end lg:text-xl">
              {t("features_desc")}
            </p>
          </Reveal>

          <div className="mt-10 grid gap-px overflow-hidden border border-neutral-200 bg-brand-navy md:grid-cols-2 lg:grid-cols-3 rounded-2xl">
            {partnerTypes.map(({ icon: Icon, title, description }, index) => (
              <Reveal
                key={title}
                delay={index * 0.04}
                className="h-full bg-white"
              >
                <article className="group flex h-full min-h-64 flex-col p-6 transition-colors hover:bg-brand-yellow sm:p-8">
                  <div className="flex items-start justify-between">
                    <Icon
                      className="h-8 w-8"
                      strokeWidth={2.25}
                      aria-hidden="true"
                    />
                    <span className="font-mono text-xs font-extrabold text-black/40">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="mt-10 text-2xl font-extrabold leading-tight">
                    {t(title)}
                  </h3>
                  <p className="mt-3 text-sm font-semibold leading-6 text-black/65">
                    {t(description)}
                  </p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section
        id="funding-model"
        className="border-y border-neutral-200 bg-white px-5 py-20 sm:px-8 lg:px-14 lg:py-28 xl:px-20"
      >
        <div className="mx-auto grid max-w-[1360px] gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <Reveal>
            <SectionLabel>{t("period")}</SectionLabel>
            <h2 className="max-w-2xl text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl">
              {t("download_title")}
            </h2>
            <p className="mt-6 max-w-xl text-lg font-semibold leading-8 text-black/65">
              {t("download_desc")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex min-h-13 items-center justify-center gap-2 border border-neutral-200 bg-brand-navy px-6 font-extrabold text-brand-yellow transition-colors hover:bg-brand-yellow hover:text-black focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black rounded-2xl"
              >
                {t("contact_us")}{" "}
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
              <Link
                href="/transparency"
                className="inline-flex min-h-13 items-center justify-center border border-neutral-200 px-6 font-extrabold transition-colors hover:bg-black hover:text-white focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black rounded-2xl"
              >
                {t("download_mac")}
              </Link>
            </div>
          </Reveal>

          <div className="relative">
            <div
              className="absolute bottom-8 left-[25px] top-8 w-0.5 bg-brand-navy md:left-[31px]"
              aria-hidden="true"
            />
            <div className="space-y-5">
              {fundingSteps.map(({ icon: Icon, title, description }, index) => (
                <Reveal key={title} delay={index * 0.08}>
                  <article className="relative grid grid-cols-[52px_1fr] gap-5 border border-neutral-200 bg-neutral-100 p-5 md:grid-cols-[64px_1fr] md:p-7 rounded-2xl">
                    <div className="relative z-10 flex h-13 w-13 items-center justify-center rounded-full border border-neutral-200 bg-brand-yellow md:h-16 md:w-16">
                      <Icon
                        className="h-6 w-6 md:h-7 md:w-7"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-mono text-xs font-extrabold text-black/45">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-2 text-2xl font-extrabold leading-tight">
                        {t(title)}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm font-semibold leading-6 text-black/65">
                        {t(description)}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-brand-navy px-5 py-20 text-white sm:px-8 lg:px-14 lg:py-28 xl:px-20">
        <div className="mx-auto grid max-w-[1360px] gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-20">
          <Reveal>
            <SectionLabel inverse>{t("cert_section_title")}</SectionLabel>
            <h2 className="max-w-3xl text-4xl font-extrabold leading-[0.95] sm:text-5xl lg:text-6xl">
              {t("cert_section_title")}
            </h2>
            <p className="mt-6 max-w-2xl text-lg font-semibold leading-8 text-white/65">
              {t("cert_section_desc")}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="border border-white/25 p-5">
                <p className="font-mono text-xs font-extrabold text-brand-yellow">
                  {t("trees_planted")}
                </p>
                <p className="mt-3 font-bold leading-6 text-white/75">
                  {t("windows_desc")}
                </p>
              </div>
              <div className="border border-white/25 p-5">
                <p className="font-mono text-xs font-extrabold text-brand-yellow">
                  {t("co2_offset")}
                </p>
                <p className="mt-3 font-bold leading-6 text-white/75">
                  {t("mac_desc")}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal
            className="relative border border-white bg-neutral-100 p-6 text-black sm:p-8"
            delay={0.08}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-brand-navy text-brand-yellow">
                  <Leaf className="h-5 w-5 fill-current" aria-hidden="true" />
                </div>
                <span className="text-xl font-extrabold">
                  IdleForest
                </span>
              </div>
              <FileCheck2 className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="mt-7 font-mono text-xs font-extrabold tracking-[0.17em] text-black/50">
              {t("cert_impact")}
            </p>
            <h3 className="mt-3 text-3xl font-extrabold leading-none">
              {t("cert_certifies")}
            </h3>
            <p className="mt-4 text-base font-bold leading-7 text-black/65">
              {t("cert_contributed")}
            </p>
            <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
              {[
                "trees_planted",
                "co2_offset",
                "project_locations",
                "period",
              ].map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-6 py-4"
                >
                  <span className="font-mono text-xs font-extrabold tracking-wide text-black/50">
                    {t(key)}
                  </span>
                  <BadgeCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs font-bold leading-5 text-black/55">
              {t("verified_by")}
            </p>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-neutral-200 bg-brand-yellow px-5 py-20 sm:px-8 lg:px-14 lg:py-24 xl:px-20">
        <div
          className="absolute -right-16 -top-20 h-72 w-72 rounded-full border-[48px] border-black/10"
          aria-hidden="true"
        />
        <Reveal className="relative mx-auto max-w-5xl text-center">
          <SectionLabel>{t("cta_title")}</SectionLabel>
          <h2 className="text-4xl font-extrabold leading-[0.9] sm:text-6xl lg:text-6xl">
            {t("cta_title")}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-bold leading-8 text-black/65">
            {t("cta_desc")}
          </p>
          <Link
            href="/contact"
            className="mt-9 inline-flex min-h-14 items-center justify-center gap-3 border border-neutral-200 bg-brand-navy px-8 text-lg font-extrabold text-brand-yellow transition-transform hover:-translate-y-1 focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-black rounded-2xl"
          >
            {t("contact_us")}{" "}
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </Link>
        </Reveal>
      </section>
    </main>
  );
}
