"use client";

import Image from "next/image";
import { ArrowUpRight, Globe2, Leaf, MapPin } from "lucide-react";
import { Link } from "@/navigation";
import { useTranslations } from "next-intl";
import { groupByProject, plantingsData } from "@/lib/plantings";

type ProjectCard = {
    key: "kisumu" | "busoga" | "mkussu" | "poverty";
    projectId: string;
    imageSrc: string | null;
};

const projects: ProjectCard[] = [
    {
        key: "kisumu",
        projectId: "tftf-kisumu7-awach",
        imageSrc: "https://images.1clickimpact.com/projects/trees-kenya-fgp/thumb.jpg",
    },
    {
        key: "busoga",
        projectId: "tftf-busoga5-buwaiswa",
        imageSrc: "https://images.1clickimpact.com/projects/trees-uganda-fgp/thumb.jpg",
    },
    {
        key: "mkussu",
        projectId: "tn-syzygium",
        imageSrc: "/report-images/mkussu-forest.jpg",
    },
    {
        key: "poverty",
        projectId: "tn-plant-to-stop-poverty",
        imageSrc: "/report-images/plant-to-stop-poverty.jpg",
    },
];

const partnerDetails = [
    {
        name: "Trees for the Future",
        href: "https://trees.org",
        logoSrc: "/partner-logos/trees-for-the-future.png",
        logoAlt: "Trees for the Future logo",
        logoWidth: 220,
        logoHeight: 90,
        description: "Trees for the Future plants food forests with smallholder farmers across Sub-Saharan Africa. Their Forest Garden model trains farmers to grow trees, vegetables, and cash crops on the same land, restoring soil while supporting long-term local income.",
    },
    {
        name: "Tree-Nation",
        href: "https://tree-nation.com",
        logoSrc: "/partner-logos/tree-nation.svg",
        logoAlt: "Tree-Nation logo",
        logoWidth: 220,
        logoHeight: 64,
        description: "Tree-Nation restores native forests in 35+ countries, including Madagascar, Senegal, and Tanzania. They focus on species native to each region, which gives planted forests stronger survival rates and better long-term ecological value than monoculture planting.",
    },
    {
        name: "1ClickImpact",
        href: "https://1clickimpact.com",
        logoSrc: "/partner-logos/1clickimpact.png",
        logoAlt: "1ClickImpact logo",
        logoWidth: 220,
        logoHeight: 41,
        description: "1ClickImpact funds planting projects with traceability across certificates, project records, and impact reporting. We link their verified planting records in our transparency work so you can follow where funded trees go.",
    },
];

export default function ProjectsSection() {
    const t = useTranslations("Landing.projects");
    const projectStats = groupByProject(plantingsData.events);

    return (
        <section id="projects" className="scroll-mt-24 border-y-4 border-black bg-brand-navy text-white">
            <div className="container mx-auto px-6 py-20 md:py-24">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow">
                        {t("eyebrow")}
                    </p>
                    <h2 className="mt-3 font-rethink-sans text-3xl font-extrabold sm:text-4xl md:text-5xl">
                        {t("heading")}
                    </h2>
                    <p className="mt-4 text-base text-white/75 md:text-lg">
                        {t("subheading")}
                    </p>
                </div>

                <div className="mt-12 grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {projects.map((project) => {
                        const projectMeta = plantingsData.projects.find(
                            (item) => item.id === project.projectId
                        );

                        return (
                            <a
                                key={project.key}
                                href={projectMeta?.externalRef || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t(`${project.key}.title`)}
                                className="group block h-full"
                            >
                                <article className="flex h-full flex-col overflow-hidden rounded-[28px] border-2 border-black bg-brand-gray text-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] transition-transform duration-200 group-hover:-translate-y-1 group-focus-visible:-translate-y-1 group-focus-visible:outline-none">
                                    {project.imageSrc ? (
                                        <div className="relative h-52">
                                            <Image
                                                src={project.imageSrc}
                                                alt={t(`${project.key}.title`)}
                                                fill
                                                className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex h-52 items-end bg-[linear-gradient(135deg,#E0F146_0%,#D9D9D9_50%,#0B101F_100%)] p-6">
                                            <div className="max-w-[14rem]">
                                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/70">
                                                    {t(`${project.key}.partner`)}
                                                </p>
                                                <p className="mt-3 font-candu text-3xl uppercase leading-none text-black">
                                                    {t(`${project.key}.visual_title`)}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex flex-1 flex-col space-y-4 p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-2xl font-extrabold leading-tight">
                                                        {t(`${project.key}.title`)}
                                                    </h3>
                                                    <ArrowUpRight className="h-5 w-5 shrink-0 text-brand-navy transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                                </div>
                                                <p className="mt-3 text-sm leading-6 text-neutral-700">
                                                    {t(`${project.key}.description`)}
                                                </p>
                                            </div>

                                            <div className="flex w-[128px] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-black bg-brand-yellow px-3 py-3 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <div className="font-candu text-3xl leading-none text-black">
                                                    {(projectStats[project.projectId]?.trees ?? 0).toLocaleString()}
                                                </div>
                                                <div className="mt-2 w-full text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-black/70">
                                                    {t("trees_planted_label")}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto space-y-2 border-t border-black/10 pt-4 text-sm text-neutral-700">
                                            <div className="flex items-center gap-2">
                                                <Leaf className="h-4 w-4 text-brand-navy" />
                                                <span>{t(`${project.key}.partner`)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-brand-navy" />
                                                <span>{t(`${project.key}.location`)}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Globe2 className="h-4 w-4 text-brand-navy" />
                                                <span>{t(`${project.key}.focus`)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </article>
                            </a>
                        );
                    })}
                </div>

                {/* Hallmark · component: partner-logo-proof · pre-emit critique: P5 H4 E4 S5 R4 V4 · contrast: pass (46-50) */}
                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                    {partnerDetails.map((partner) => (
                        <article key={partner.name} className="flex h-full flex-col border-2 border-brand-yellow bg-black/20 p-6">
                            <div className="mb-5 flex h-24 items-center justify-center border-2 border-brand-yellow bg-white p-4">
                                <Image
                                    src={partner.logoSrc}
                                    alt={partner.logoAlt}
                                    width={partner.logoWidth}
                                    height={partner.logoHeight}
                                    unoptimized
                                    className="max-h-14 w-auto max-w-full object-contain"
                                />
                            </div>
                            <h3 className="font-rethink-sans text-2xl font-extrabold text-brand-yellow">
                                {partner.name}
                            </h3>
                            <p className="mt-4 flex-1 text-sm leading-6 text-white/75">
                                {partner.description}
                            </p>
                            <a
                                href={partner.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-6 inline-flex items-center gap-2 font-bold text-brand-yellow underline decoration-2 underline-offset-4 hover:text-white"
                            >
                                Visit their site <ArrowUpRight className="h-4 w-4" />
                            </a>
                        </article>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Link
                        href="/transparency"
                        className="inline-flex items-center gap-2 rounded-full border-2 border-brand-yellow bg-brand-yellow px-6 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(224,241,70,0.35)] transition-all hover:bg-white"
                    >
                        Read our full transparency report <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
