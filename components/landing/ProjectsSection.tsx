"use client";

import Image from "next/image";
import { ArrowUpRight, Globe2, Leaf, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { groupByProject, plantingsData } from "@/lib/plantings";

type ProjectCard = {
    key: "kisumu" | "mkussu" | "poverty";
    projectId: string;
    imageSrc: string | null;
};

const projects: ProjectCard[] = [
    {
        key: "kisumu",
        projectId: "tftf-kisumu7-awach",
        imageSrc: "https://1clickimpact.com/_next/image?url=%2Fimages%2Fprojects%2Ftrees-kenya-fgp%2F1.jpg&w=1920&q=50",
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

                <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-3">
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
            </div>
        </section>
    );
}
