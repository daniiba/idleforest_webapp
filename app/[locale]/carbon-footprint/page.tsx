import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Navigation from "@/components/navigation";
import { Link } from "@/navigation";
import { ArrowLeft, ArrowRight, Leaf, Trees } from "lucide-react";
import { getCarbonCategories, getFeaturedCarbonPages, getIconUrl, localizeCarbonData } from "@/lib/carbon-data";
import { buildLocalizedAlternates } from "@/lib/carbon-routing";

interface PageProps {
    params: {
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const t = await getTranslations({ locale: params.locale, namespace: "CarbonFootprint" });

    return {
        title: `${t("page.digital_carbon_footprint_hub")} | IdleForest`,
        description: t("page.hub_intro"),
        alternates: buildLocalizedAlternates("/carbon-footprint", params.locale),
        keywords: [
            "digital carbon footprint",
            "ai carbon footprint",
            "streaming carbon footprint",
            "carbon footprint of apps",
            "carbon footprint calculator",
        ],
    };
}

export default async function CarbonFootprintHubPage({ params }: PageProps) {
    const t = await getTranslations("CarbonFootprint");
    const categories = await getCarbonCategories();
    const featuredPages = (await getFeaturedCarbonPages()).map((page) => localizeCarbonData(page, params.locale));

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: t("page.digital_carbon_footprint_hub"),
        description: t("page.hub_intro"),
        url: "https://www.idleforest.com/carbon-footprint",
        hasPart: featuredPages.map((page) => ({
            "@type": "WebPage",
            name: `${t("page.carbon_footprint_of")} ${page.app_name}`,
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
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-neutral-600 hover:text-black transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("page.back_to_home")}
                    </Link>
                </div>

                <section className="border-2 border-black bg-white p-8 md:p-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-10">
                    <div className="max-w-4xl">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-4">
                            {t("page.carbon_footprint_cluster_hub")}
                        </p>
                        <h1 className="font-candu text-[42px] sm:text-6xl md:text-7xl leading-[0.95] uppercase text-black mb-6">
                            {t.rich("page.hub_title", {
                                highlight: (chunks) => <span className="bg-brand-yellow px-2">{chunks}</span>,
                            })}
                        </h1>
                        <p className="text-lg md:text-xl text-neutral-800 leading-relaxed max-w-3xl mb-8">
                            {t("page.hub_intro")}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div className="border-2 border-black bg-brand-yellow p-5">
                                <div className="flex items-center gap-2 font-bold text-black mb-2">
                                    <Leaf className="w-5 h-5" />
                                    {t("page.hub_cards.ai.title")}
                                </div>
                                <p className="text-sm text-neutral-900">
                                    {t("page.hub_cards.ai.description")}
                                </p>
                            </div>
                            <div className="border-2 border-black bg-white p-5">
                                <div className="flex items-center gap-2 font-bold text-black mb-2">
                                    <Trees className="w-5 h-5" />
                                    {t("page.hub_cards.streaming.title")}
                                </div>
                                <p className="text-sm text-neutral-700">
                                    {t("page.hub_cards.streaming.description")}
                                </p>
                            </div>
                            <div className="border-2 border-black bg-white p-5">
                                <div className="flex items-center gap-2 font-bold text-black mb-2">
                                    <Leaf className="w-5 h-5" />
                                    {t("page.hub_cards.work.title")}
                                </div>
                                <p className="text-sm text-neutral-700">
                                    {t("page.hub_cards.work.description")}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/carbon-footprint/ai"
                                className="inline-flex items-center gap-2 border-2 border-black bg-black text-brand-yellow px-4 py-3 font-bold uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
                            >
                                {t("page.explore_ai_emissions")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/carbon-footprint/streaming"
                                className="inline-flex items-center gap-2 border-2 border-black bg-white text-black px-4 py-3 font-bold uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
                            >
                                {t("page.explore_streaming")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/carbon-footprint/digital-carbon-footprint"
                                className="inline-flex items-center gap-2 border-2 border-black bg-white text-black px-4 py-3 font-bold uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
                            >
                                {t("page.explore_digital_footprint")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/carbon-footprint/leaderboard"
                                className="inline-flex items-center gap-2 border-2 border-black bg-brand-gray text-black px-4 py-3 font-bold uppercase tracking-wide hover:-translate-y-0.5 transition-transform"
                            >
                                {t("page.view_leaderboard")}
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="mb-12">
                    <div className="flex items-end justify-between gap-4 mb-6">
                        <div>
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-2">{t("page.featured_pages_eyebrow")}</p>
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black">{t("page.best_places_to_start")}</h2>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {featuredPages.map((page) => {
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
                                    <p className="text-neutral-700 mb-4 leading-relaxed">
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

                <section className="border-t-2 border-black/10 pt-10">
                    <div className="mb-6">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-2">{t("page.all_carbon_pages")}</p>
                        <h2 className="font-rethink-sans text-3xl font-extrabold text-black">{t("page.browse_by_category")}</h2>
                    </div>

                    <div className="space-y-10">
                        {categories.map(({ category, items }) => (
                            <div key={category}>
                                <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                    {t(`categories.${category}`)}
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {items.map((item) => (
                                        <Link
                                            key={item.slug}
                                            href={`/carbon-footprint/${item.slug}`}
                                            className="border border-black/15 bg-white px-4 py-4 font-medium text-neutral-800 hover:border-black hover:text-black transition-colors flex items-center justify-between gap-4"
                                        >
                                            <span>{item.app_name}</span>
                                            <ArrowRight className="w-4 h-4 shrink-0" />
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
