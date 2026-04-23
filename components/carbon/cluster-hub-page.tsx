import { Metadata } from "next";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CarbonHubDefinition, getCarbonHubPages } from "@/lib/carbon-hubs";
import { getIconUrl } from "@/lib/carbon-data";
import { getTranslations } from "next-intl/server";

interface CarbonHubPageProps {
    hub: CarbonHubDefinition;
}

export function buildCarbonHubMetadata(hub: CarbonHubDefinition): Metadata {
    return {
        title: hub.seoTitle,
        description: hub.seoDescription,
        alternates: {
            canonical: `https://www.idleforest.com/carbon-footprint/${hub.slug}`,
        },
        keywords: hub.queryChips,
    };
}

export async function CarbonHubPageTemplate({ hub }: CarbonHubPageProps) {
    const pages = getCarbonHubPages(hub);
    const t = await getTranslations("CarbonFootprint");

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: hub.title,
        description: hub.seoDescription,
        url: `https://www.idleforest.com/carbon-footprint/${hub.slug}`,
        hasPart: pages.map((page) => ({
            "@type": "WebPage",
            name: `Carbon Footprint of ${page.app_name}`,
            url: `https://www.idleforest.com/carbon-footprint/${page.slug}`,
        })),
    };

    return (
        <div className="min-h-screen bg-brand-gray pb-12 font-inter">
            <Navigation />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="container mx-auto px-6 pt-8">
                <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-600">
                    <Link href="/" className="inline-flex items-center hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Home
                    </Link>
                    <span>/</span>
                    <Link href="/carbon-footprint" className="hover:text-black transition-colors">
                        Carbon Hub
                    </Link>
                    <span>/</span>
                    <span className="text-black">{hub.title}</span>
                </div>

                <section className="border-2 border-black bg-white p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-10">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-4">
                        {hub.eyebrow}
                    </p>
                    <h1 className="font-candu text-[42px] sm:text-6xl md:text-7xl leading-[0.95] uppercase text-black mb-6">
                        {hub.title}
                    </h1>
                    <p className="text-lg md:text-xl text-neutral-800 leading-relaxed max-w-4xl mb-8">
                        {hub.intro}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-8">
                        {hub.queryChips.map((chip) => (
                            <span
                                key={chip}
                                className="border border-black bg-brand-gray px-3 py-2 text-sm font-semibold text-black"
                            >
                                {chip}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {hub.sections.map((section) => (
                            <div key={section.title} className="border-2 border-black bg-brand-yellow/20 p-5">
                                <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-3">
                                    {section.title}
                                </h2>
                                <p className="text-neutral-800 leading-relaxed">{section.body}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mb-12">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-2">{t("page.recommended_pages")}</p>
                        <h2 className="font-rethink-sans text-3xl font-extrabold text-black">{t("page.explore_related_guides")}</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {pages.map((page) => {
                            const iconUrl = getIconUrl(page);
                            return (
                                <Link
                                    key={page.slug}
                                    href={`/carbon-footprint/${page.slug}`}
                                    className="group border-2 border-black bg-white p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 border-2 border-black bg-brand-gray flex items-center justify-center">
                                            {iconUrl.startsWith("fallback:") ? (
                                                <span className="font-bold text-xs uppercase text-black">{page.category}</span>
                                            ) : (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={iconUrl} alt="" className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">{page.category}</div>
                                            <h3 className="font-rethink-sans text-xl font-extrabold text-black group-hover:text-brand-green transition-colors">
                                                {page.app_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 mb-4 leading-relaxed text-sm">
                                        {page.seo?.intro || page.idleforest_pitch}
                                    </p>
                                    <div className="flex items-center justify-between text-sm font-bold text-black">
                                        <span>{page.co2_per_hour_grams}g CO2 / hour</span>
                                        <span className="inline-flex items-center gap-1">Open <ArrowRight className="w-4 h-4" /></span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>
            </div>
        </div>
    );
}
