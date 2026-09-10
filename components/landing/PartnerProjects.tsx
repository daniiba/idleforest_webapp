import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "@/navigation";
import { SILVEIRA_COMPANY_SLUG } from "@/lib/company-partners";

const partners = [
    {
        id: "mossy-earth",
        name: "Mossy Earth",
        category: "Rewilding & conservation",
        description: "Help restore wild ecosystems and protect biodiversity. Your background activity can support Mossy Earth’s conservation projects.",
        href: "/c/mossy-earth",
        website: "https://www.mossy.earth/",
        // Official asset: https://www.mossy.earth/images/logo/logo-green.png
        logo: "/partner/mossy-earth/logo-official.png",
        logoClass: "h-14 w-14",
        image: "/partner/mossy-earth/planting-portrait.png",
        imageAlt: "A restoration worker planting a young seedling",
        imagePosition: "object-center",
        accent: "bg-[#DDE9DF] text-[#245943]",
    },
    {
        id: "wastefree-planet",
        name: "Waste Free Planet",
        category: "Ocean & plastic recovery",
        description: "Help keep plastic out of the ocean. Support collection work through Waste Free Planet, 1ClickImpact, and Plastic Bank.",
        href: "/c/wastefree-planet",
        website: "https://www.wastefreeplanet.org/",
        logo: "/partner/wastefree/wfp-logo-white.webp",
        logoClass: "h-16 w-28 brightness-0",
        image: "/partner/wastefree/plastic-bank-collection.webp",
        imageAlt: "Plastic Bank collectors recovering plastic along the coast",
        imagePosition: "object-[center_35%]",
        accent: "bg-[#DCECF0] text-[#235467]",
    },
    {
        id: "silveira-tech",
        name: "Silveira Tech",
        category: "Village & forest regeneration",
        description: "Help bring a Portuguese mountain village back to life. Support native forests, biodiversity, and regeneration in Serra da Lousã.",
        href: `/c/${SILVEIRA_COMPANY_SLUG}`,
        website: "https://silveiratech.pt/",
        logo: "/partner/silveira/logo.svg",
        logoClass: "h-16 w-16 brightness-0",
        image: "/partner/silveira/intro.webp",
        imageAlt: "Exploring old stone buildings in the Silveira forest",
        imagePosition: "object-center",
        accent: "bg-[#ECE4D6] text-[#675233]",
    },
];

export default function PartnerProjects() {
    return (
        <section id="partner-announcements" aria-labelledby="partner-projects-heading" className="scroll-mt-24 bg-brand-gray text-brand-navy">
            <div className="mx-auto max-w-7xl px-6 py-14 md:py-20">
                <div className="mx-auto max-w-3xl text-center">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-600">Partner projects</p>
                    <h2 id="partner-projects-heading" className="mt-3 font-rethink-sans text-[34px] font-extrabold leading-tight tracking-tight sm:text-5xl">
                        Meet the projects you can support with IdleForest.
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-neutral-700 md:text-lg">
                        Choose a cause you care about. Join its page, install IdleForest, and help fund the work while you use your computer.
                    </p>
                </div>

                <div className="mt-10 grid gap-6 md:grid-cols-3">
                    {partners.map((partner) => (
                        <article key={partner.id} id={partner.id} className="flex min-w-0 flex-col overflow-hidden rounded-3xl border border-brand-navy/15 bg-white">
                            <div className="flex h-24 items-center justify-between gap-4 px-6">
                                <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`Visit ${partner.name} website`} className="inline-flex items-center rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                                    <Image src={partner.logo} alt={`${partner.name} logo`} width={120} height={72} className={`${partner.logoClass} object-contain`} />
                                </a>
                                <span className="text-xs font-semibold text-neutral-500">Free to support</span>
                            </div>
                            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
                                <Image src={partner.image} alt={partner.imageAlt} fill sizes="(min-width: 1280px) 400px, (min-width: 1024px) 33vw, 100vw" className={`object-cover ${partner.imagePosition}`} />
                            </div>
                            <div className="flex flex-1 flex-col p-5 xl:p-6">
                                <p className={`self-start rounded-full px-3 py-1.5 text-[11px] font-bold ${partner.accent}`}>{partner.category}</p>
                                <h3 className="mt-4 font-rethink-sans text-2xl font-extrabold tracking-tight xl:text-3xl">{partner.name}</h3>
                                <p className="mt-3 text-sm leading-7 text-neutral-600">{partner.description}</p>
                                <div className="mt-auto pt-6">
                                    <Link href={partner.href} aria-label={`Support ${partner.name} for free`} className="flex min-h-12 items-center justify-between gap-3 rounded-full bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-navy transition-colors hover:bg-brand-navy hover:text-brand-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                                        Support for free <ArrowRight className="h-4 w-4" />
                                    </Link>
                                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-neutral-600 underline underline-offset-4 hover:text-brand-navy">
                                        Visit {partner.name} <ArrowUpRight className="h-3.5 w-3.5" />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    );
}
