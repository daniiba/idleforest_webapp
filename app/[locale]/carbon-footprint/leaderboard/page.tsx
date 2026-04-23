import { Metadata } from "next";
import { CARBON_DATA, getIconUrl } from "@/lib/carbon-data";
import { Link } from "@/navigation";
import Navigation from "@/components/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, Monitor } from "lucide-react";

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: "App Carbon Footprint Leaderboard & Rankings | IdleForest",
        description: "Which apps have the highest carbon footprint? See the leaderboard comparing the digital emissions of popular apps, AI tools, games, and streaming services.",
        alternates: {
            canonical: "https://www.idleforest.com/carbon-footprint/leaderboard",
        },
    };
}

export default async function LeaderboardPage() {
    const t = await getTranslations("CarbonFootprint");

    // Sort heavily polluting to least polluting.
    const sortedApps = [...CARBON_DATA].sort((a, b) => b.co2_per_hour_grams - a.co2_per_hour_grams);

    return (
        <div className="min-h-screen bg-brand-gray pb-12 font-inter">
            <Navigation />
            <div className="container mx-auto px-6 pt-8">
                {/* Breadcrumb / Back Link */}
                <div className="mb-8 flex flex-wrap items-center gap-3 text-sm font-medium text-neutral-600">
                    <Link href="/" className="inline-flex items-center hover:text-black transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("page.back_to_home")}
                    </Link>
                    <span>/</span>
                    <Link href="/carbon-footprint" className="hover:text-black transition-colors">
                        {t("page.carbon_footprint_cluster_hub")}
                    </Link>
                    <span>/</span>
                    <span className="text-black">{t("page.leaderboard_breadcrumb")}</span>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="mb-10 text-center">
                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-4">
                            {t("page.leaderboard_eyebrow")}
                        </p>
                        <h1 className="font-candu text-[42px] sm:text-6xl uppercase text-black mb-6 leading-none">
                            {t("page.leaderboard_title_pt1")} <span className="text-brand-yellow bg-black px-2 mx-1">{t("page.leaderboard_title_pt2")}</span> {t("page.leaderboard_title_pt3")}
                        </h1>
                        <p className="text-lg text-neutral-800 leading-relaxed">
                            {t("page.leaderboard_desc")}
                        </p>
                    </div>

                    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] divide-y-2 divide-black/20 overflow-hidden">
                        {sortedApps.map((app, index) => {
                            const iconUrl = getIconUrl(app);
                            const isCrypto = app.category === "Crypto";
                            
                            return (
                                <Link 
                                    href={`/carbon-footprint/${app.slug}`} 
                                    key={app.slug}
                                    className="flex items-center p-4 sm:p-6 hover:bg-brand-yellow/15 transition-colors group"
                                >
                                    <div className="flex-shrink-0 w-8 sm:w-12 text-center font-rethink-sans text-xl sm:text-2xl font-black text-neutral-400 group-hover:text-black transition-colors">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-shrink-0 w-12 h-12 bg-white border-2 border-black flex items-center justify-center mx-3 sm:mx-4">
                                        {!iconUrl.startsWith("fallback:") ? (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={iconUrl} alt={app.app_name} className="w-6 h-6" />
                                        ) : (
                                            <Monitor className="w-6 h-6 text-black" />
                                        )}
                                    </div>
                                    <div className="flex-grow min-w-0 pr-2 sm:pr-4">
                                        <h2 className="font-rethink-sans text-lg sm:text-xl font-extrabold text-black truncate">{app.app_name}</h2>
                                        <div className="flex flex-wrap items-center gap-2 mt-1">
                                            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500">
                                                {t(`categories.${app.category}`)}
                                            </span>
                                            {isCrypto && (
                                                <span className="text-[9px] font-bold uppercase tracking-wider bg-black text-brand-yellow px-1 py-0.5">
                                                    Per Transaction
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <div className="font-rethink-sans text-xl sm:text-3xl font-black text-brand-green">
                                            {app.co2_per_hour_grams >= 1000 ? (app.co2_per_hour_grams / 1000).toLocaleString() + 'kg' : app.co2_per_hour_grams + 'g'}
                                        </div>
                                        <div className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-neutral-500 mt-1">
                                            {isCrypto ? "CO2 / TX" : "CO2 / HOUR"}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
