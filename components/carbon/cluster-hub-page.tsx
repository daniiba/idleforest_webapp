import { Metadata } from "next";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CarbonHubDefinition, getCarbonHubPages } from "@/lib/carbon-hubs";
import { getIconUrl, localizeCarbonData } from "@/lib/carbon-data";
import { getTranslations } from "next-intl/server";
import { buildComparisonPath, buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";

interface CarbonHubPageProps {
    hub: CarbonHubDefinition;
    locale: string;
}

export function buildCarbonHubMetadata(hub: CarbonHubDefinition, locale: string): Metadata {
    return {
        title: hub.seoTitle,
        description: hub.seoDescription,
        alternates: buildLocalizedAlternates(`/carbon-footprint/${hub.slug}`, locale),
        keywords: hub.queryChips,
    };
}

export async function CarbonHubPageTemplate({ hub, locale }: CarbonHubPageProps) {
    const t = await getTranslations("CarbonFootprint");
    const showEnglishEnhancements = locale === "en";
    const pages = (await getCarbonHubPages(hub)).map((page) => localizeCarbonData(page, locale));
    const topEmitters = [...pages]
        .sort((left, right) => right.co2_per_hour_grams - left.co2_per_hour_grams)
        .slice(0, 3);
    const featuredComparisons = hub.featuredComparisonPairs
        .map(([slugA, slugB]) => {
            const pageA = pages.find((page) => page.slug === slugA);
            const pageB = pages.find((page) => page.slug === slugB);
            if (!pageA || !pageB) {
                return null;
            }

            return {
                pageA,
                pageB,
                href: buildComparisonPath(slugA, slugB),
            };
        })
        .filter(Boolean) as { pageA: typeof pages[number]; pageB: typeof pages[number]; href: string }[];

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: hub.title,
        description: hub.seoDescription,
        url: getLocalizedUrl(`/carbon-footprint/${hub.slug}`, locale),
        hasPart: pages.map((page) => ({
            "@type": "WebPage",
            name: `${t("page.carbon_footprint_of")} ${page.app_name}`,
            url: getLocalizedUrl(`/carbon-footprint/${page.slug}`, locale),
        })),
    };

    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: hub.faq.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    };

    return (
        <div className="min-h-screen bg-brand-gray pb-12 font-inter">
            <Navigation />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />

            <div className="container mx-auto px-6 pt-8">
                <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-600">
                    <Link href="/" className="inline-flex items-center hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("page.back_to_home")}
                    </Link>
                    <span>/</span>
                    <Link href="/carbon-footprint" className="hover:text-black transition-colors">
                        {t("page.carbon_hub")}
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

                {showEnglishEnhancements ? (
                <section className="mb-12 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] gap-6">
                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">Cluster playbook</p>
                        <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-5">What makes this hub worth ranking</h2>
                        <div className="space-y-4">
                            {hub.playbook.map((item) => (
                                <div key={item.title} className="rounded-lg border border-black/10 bg-brand-gray p-4">
                                    <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-2">{item.title}</h3>
                                    <p className="text-neutral-700 leading-relaxed">{item.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">Highest estimated emitters</p>
                        <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-5">Best pages to enter this cluster</h2>
                        <div className="space-y-4">
                            {topEmitters.map((page, index) => (
                                <Link
                                    key={page.slug}
                                    href={`/carbon-footprint/${page.slug}`}
                                    className="flex items-center justify-between gap-4 rounded-lg border border-black/10 bg-brand-gray p-4 hover:border-black"
                                >
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1">#{index + 1}</div>
                                        <div className="font-rethink-sans text-xl font-extrabold text-black">{page.app_name}</div>
                                        <div className="text-sm text-neutral-600">{page.co2_per_hour_grams}{t("page.g_co2_hour")}</div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 shrink-0 text-black" />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
                ) : null}

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
                                            <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                                                {t(`categories.${page.category}`)}
                                            </div>
                                            <h3 className="font-rethink-sans text-xl font-extrabold text-black group-hover:text-brand-green transition-colors">
                                                {page.app_name}
                                            </h3>
                                        </div>
                                    </div>
                                    <p className="text-neutral-700 mb-4 leading-relaxed text-sm">
                                        {page.seo?.intro || page.idleforest_pitch}
                                    </p>
                                    <div className="flex items-center justify-between text-sm font-bold text-black">
                                        <span>{page.co2_per_hour_grams}{t("page.g_co2_hour")}</span>
                                        <span className="inline-flex items-center gap-1">
                                            {t("page.open_page")} <ArrowRight className="w-4 h-4" />
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </section>

                {showEnglishEnhancements && featuredComparisons.length ? (
                    <section className="mb-12">
                        <div className="mb-6">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-2">Comparison pathways</p>
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black">Best comparison pages in this cluster</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {featuredComparisons.map(({ pageA, pageB, href }) => (
                                <Link
                                    key={href}
                                    href={href}
                                    className="border-2 border-black bg-white p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-3">
                                        {pageA.app_name} vs {pageB.app_name}
                                    </h3>
                                    <p className="text-neutral-700 leading-relaxed mb-4">
                                        Compare two closely related digital habits without leaving the cluster.
                                    </p>
                                    <div className="flex items-center justify-between text-sm font-bold text-black">
                                        <span>{pageA.co2_per_hour_grams}{t("page.g_co2_hour")} vs {pageB.co2_per_hour_grams}{t("page.g_co2_hour")}</span>
                                        <span className="inline-flex items-center gap-1">Open <ArrowRight className="w-4 h-4" /></span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                ) : null}

                {showEnglishEnhancements ? (
                <section className="mb-12 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">Cluster FAQ</p>
                    <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">Questions this hub should satisfy</h2>
                    <div className="space-y-4">
                        {hub.faq.map((item) => (
                            <div key={item.question} className="rounded-lg border border-black/10 bg-brand-gray p-5">
                                <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-2">{item.question}</h3>
                                <p className="text-neutral-700 leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
                ) : null}
            </div>
        </div>
    );
}
