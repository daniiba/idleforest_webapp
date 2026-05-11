"use client";

import { ArrowUpRight, Linkedin } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type TeamMember = {
    name: string;
    initials: string;
    linkedInUrl: string;
    roleKey: "founder_ceo" | "cofounder_product_design" | "ecology_impact_lead" | "project_management_marketing" | "team_member";
    imageSrc?: string;
    imagePosition?: string;
    imageScale?: string;
};

const TEAM_MEMBERS: TeamMember[] = [
    {
        name: "Daniel Ibanez Becker",
        initials: "DI",
        linkedInUrl: "https://www.linkedin.com/in/daniel-ibanez-becker-b16821151/",
        roleKey: "founder_ceo",
        imageSrc: "/images/team-daniel.jpeg",
        imagePosition: "50% 24%",
        imageScale: "scale(1.08)",
    },
    {
        name: "Tobias Stein",
        initials: "TS",
        linkedInUrl: "https://www.linkedin.com/in/tobias-stein-81258a18b/",
        roleKey: "cofounder_product_design",
        imageSrc: "/images/team-tobias.jpeg",
        imagePosition: "48% 34%",
    },
    {
        name: "Dilyara Kenzhebayeva",
        initials: "DK",
        linkedInUrl: "https://www.linkedin.com/in/dilyarakenzh/",
        roleKey: "project_management_marketing",
        imageSrc: "/images/team-dilyara.jpeg",
        imagePosition: "50% 45%",
    },
    {
        name: "Rahel Schnell",
        initials: "RS",
        linkedInUrl: "https://www.linkedin.com/in/rahelschnell21/",
        roleKey: "ecology_impact_lead",
        imageSrc: "/images/team-rahel.jpeg",
        imagePosition: "52% 32%",
    },
];

export default function TeamSection() {
    const t = useTranslations("Landing.team");

    return (
        <section id="team" className="relative overflow-hidden bg-brand-gray text-brand-navy scroll-mt-24">
            <div className="relative container mx-auto px-6 py-16 md:py-20">
                <div className="max-w-3xl">
                    <div className="inline-flex items-center gap-3 rounded-full border border-brand-navy/15 bg-brand-yellow px-4 py-2 text-xs font-bold uppercase text-brand-navy">
                        <span>04</span>
                        <span className="h-1 w-1 rounded-full bg-brand-navy" />
                        <span>{t("eyebrow")}</span>
                    </div>
                    <h2 className="mt-6 max-w-2xl text-4xl font-extrabold leading-[1.05] text-brand-navy sm:text-5xl md:text-6xl">
                        {t("heading")}
                    </h2>
                    <p className="mt-5 max-w-2xl text-base leading-7 text-brand-navy/70 md:text-lg">
                        {t("subheading")}
                    </p>
                </div>

                <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-6 pb-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:grid lg:grid-cols-4 lg:overflow-visible lg:pb-0">
                    {TEAM_MEMBERS.map((member) => (
                        <TeamPortraitCard
                            key={member.linkedInUrl}
                            member={member}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
}

function TeamPortraitCard({ member }: { member: TeamMember }) {
    const t = useTranslations("Landing.team");
    const roleLabel = t(member.roleKey);

    return (
        <article className="group min-w-[270px] snap-start overflow-hidden rounded-lg border border-brand-navy/15 bg-brand-yellow shadow-[0_18px_50px_rgba(11,16,31,0.12)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-brand-navy/35 hover:shadow-[0_22px_60px_rgba(11,16,31,0.16)] sm:min-w-[320px] lg:min-w-0">
            <a
                href={member.linkedInUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full flex-col"
                aria-label={`${t("linkedin_label")} ${member.name}`}
            >
                <div className="relative aspect-[4/4.35] overflow-hidden bg-brand-navy">
                    <MemberImage
                        member={member}
                        className="h-full w-full"
                        sizes="(min-width: 1024px) 18vw, (min-width: 640px) 50vw, 100vw"
                    />
                </div>

                <div className="flex min-h-[138px] flex-1 flex-col justify-between border-t border-brand-navy/20 p-5">
                    <div>
                        <p className="text-xs font-bold uppercase leading-snug text-brand-navy/60">
                            {roleLabel}
                        </p>
                        <h3 className="mt-3 text-2xl font-extrabold leading-tight text-brand-navy">
                            {member.name}
                        </h3>
                    </div>

                    <span
                        className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-brand-navy/20 px-3 py-2 text-xs font-bold uppercase text-brand-navy transition-colors group-hover:border-brand-navy group-hover:bg-brand-navy group-hover:text-brand-yellow"
                        aria-hidden="true"
                    >
                        <Linkedin className="h-4 w-4" />
                        {t("linkedin_label")}
                        <ArrowUpRight className="h-4 w-4" />
                    </span>
                </div>
            </a>
        </article>
    );
}

function MemberImage({ member, className, sizes }: { member: TeamMember; className?: string; sizes: string }) {
    return (
        <div className={`relative overflow-hidden bg-brand-navy ${className ?? ""}`}>
            {member.imageSrc ? (
                <>
                    <Image
                        src={member.imageSrc}
                        alt={`${member.name} profile photo`}
                        fill
                        sizes={sizes}
                        className="object-cover saturate-[0.88] contrast-[1.04]"
                        style={{
                            objectPosition: member.imagePosition,
                            transform: member.imageScale,
                        }}
                    />
                    <span className="pointer-events-none absolute inset-0 bg-brand-navy/10 mix-blend-multiply" />
                    <span className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-brand-navy/15" />
                </>
            ) : (
                <div className="flex h-full w-full items-center justify-center bg-brand-yellow text-5xl font-extrabold text-brand-navy">
                    {member.initials}
                </div>
            )}
        </div>
    );
}
