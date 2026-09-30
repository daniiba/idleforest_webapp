"use client";

import Image from "next/image";
import { ArrowUpRight, Leaf, MapPin } from "lucide-react";
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

const visibleProjects = projects.slice(0, 3);

const partnerDetails = [
    {
        name: "Trees for the Future",
        href: "https://trees.org",
        logoSrc: "/partner-logos/trees-for-the-future.png",
        logoAlt: "Trees for the Future logo",
        logoWidth: 220,
        logoHeight: 90,
    },
    {
        name: "Tree-Nation",
        href: "https://tree-nation.com",
        logoSrc: "/partner-logos/tree-nation.svg",
        logoAlt: "Tree-Nation logo",
        logoWidth: 220,
        logoHeight: 64,
    },
    {
        name: "1ClickImpact",
        href: "https://1clickimpact.com",
        logoSrc: "/partner-logos/1clickimpact.png",
        logoAlt: "1ClickImpact logo",
        logoWidth: 220,
        logoHeight: 41,
    },
];

export default function ProjectsSection() {
    const t = useTranslations("Landing.projects");
    const projectStats = groupByProject(plantingsData.events);

    return (
        <section id="projects" className="scroll-mt-24 bg-brand-navy text-white">
            <div className="container mx-auto max-w-6xl px-6 py-16 md:py-20">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-sm font-semibold text-brand-yellow">{t("eyebrow")}</p>
                    <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">{t("heading")}</h2>
                </div>

                <div className="mt-10 grid gap-4 md:grid-cols-3">
                    {visibleProjects.map((project) => {
                        const projectMeta = plantingsData.projects.find((item) => item.id === project.projectId);
                        const trees = (projectStats[project.projectId]?.trees ?? 0).toLocaleString();

                        return (
                            <a
                                key={project.key}
                                href={projectMeta?.externalRef || "#"}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={t(`${project.key}.title`)}
                                className="group relative block aspect-[4/3] overflow-hidden md:aspect-[4/5] rounded-3xl bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                            >
                                {project.imageSrc && (
                                    <Image
                                        src={project.imageSrc}
                                        alt=""
                                        fill
                                        sizes="(min-width: 768px) 33vw, 100vw"
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                    />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" aria-hidden="true" />
                                <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-3 py-1 text-sm font-bold text-brand-navy">
                                    {trees} {t("trees_planted_label").toLowerCase()}
                                </span>
                                <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 text-white/80 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                                <div className="absolute inset-x-5 bottom-5">
                                    <h3 className="text-xl font-extrabold leading-tight">{t(`${project.key}.title`)}</h3>
                                    <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/80">
                                        <span className="inline-flex items-center gap-1.5">
                                            <Leaf className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t(`${project.key}.partner`)}
                                        </span>
                                        <span className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
                                            {t(`${project.key}.location`)}
                                        </span>
                                    </p>
                                </div>
                            </a>
                        );
                    })}
                </div>

                <ul className="mt-4 grid gap-4 sm:grid-cols-3" aria-label="Planting partners">
                    {partnerDetails.map((partner) => (
                        <li key={partner.name}>
                            <a
                                href={partner.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Visit ${partner.name}`}
                                className="flex h-24 items-center justify-center rounded-3xl bg-white p-5 transition hover:brightness-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-yellow"
                            >
                                <Image
                                    src={partner.logoSrc}
                                    alt={partner.logoAlt}
                                    width={partner.logoWidth}
                                    height={partner.logoHeight}
                                    unoptimized
                                    className="max-h-12 w-auto max-w-full object-contain"
                                />
                            </a>
                        </li>
                    ))}
                </ul>

                <div className="mt-8 text-center">
                    <Link
                        href="/transparency"
                        className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-navy transition-colors hover:brightness-95"
                    >
                        Read our full transparency report <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
