import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarbonData, getFeaturedCarbonPages, getIconUrl } from "@/lib/carbon-data";
import { Link } from "@/navigation";
import Navigation from "@/components/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Gamepad2, Users, Monitor } from "lucide-react";

interface PageProps {
    params: {
        comparison: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const slugs = params.comparison.split('-vs-');
    if (slugs.length !== 2) return { title: "Compare Carbon Footprints" };

    const data1 = getCarbonData(slugs[0]);
    const data2 = getCarbonData(slugs[1]);

    if (!data1 || !data2) return { title: "Not Found" };

    return {
        title: `${data1.app_name} vs ${data2.app_name} Carbon Footprint | IdleForest`,
        description: `Compare the carbon footprint of ${data1.app_name} and ${data2.app_name}. See which one generates more CO2 emissions per hour and how to offset them.`,
        openGraph: {
            images: [
                {
                    url: `/api/og/compare?app1=${data1.slug}&app2=${data2.slug}`,
                    width: 1200,
                    height: 630,
                }
            ],
        }
    };
}

export default async function CompareCarbonFootprintPage({ params }: PageProps) {
    const slugs = params.comparison.split('-vs-');
    if (slugs.length !== 2) notFound();

    const data1 = getCarbonData(slugs[0]);
    const data2 = getCarbonData(slugs[1]);

    if (!data1 || !data2) notFound();

    const t = await getTranslations("CarbonFootprint");
    const featuredGuides = getFeaturedCarbonPages(3).filter(g => g.slug !== data1.slug && g.slug !== data2.slug);

    const iconUrl1 = getIconUrl(data1);
    const iconUrl2 = getIconUrl(data2);

    const isData1Worse = data1.co2_per_hour_grams > data2.co2_per_hour_grams;
    const isTie = data1.co2_per_hour_grams === data2.co2_per_hour_grams;

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
                    <span className="text-black">Compare</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-4">
                                Carbon Footprint Comparison
                            </p>
                            <h1 className="font-candu text-[38px] sm:text-5xl md:text-6xl font-extrabold text-black uppercase leading-[1.05]">
                                {data1.app_name} <span className="bg-brand-yellow px-2 mx-2">vs</span> {data2.app_name}
                            </h1>
                        </div>

                        <div className="flex flex-col md:flex-row gap-6 items-stretch mb-12">
                            {/* App 1 Card */}
                            <div className="flex-1 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-brand-gray flex items-center justify-center border-2 border-black mb-6">
                                    {!iconUrl1.startsWith("fallback:") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={iconUrl1} alt={`${data1.app_name} Logo`} className="w-10 h-10" />
                                    ) : (
                                        <Monitor className="w-10 h-10 text-black" />
                                    )}
                                </div>
                                <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-2">{data1.app_name}</h2>
                                <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">{t(`categories.${data1.category}`)}</p>
                                <div className="mt-auto pt-6 border-t-2 border-black/10 w-full">
                                    <div className="text-5xl font-black text-black mb-2">{data1.co2_per_hour_grams}<span className="text-xl">g</span></div>
                                    <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">CO2 / Hour</p>
                                </div>
                                {isData1Worse && !isTie && (
                                    <div className="mt-6 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 border-2 border-red-800">
                                        Higher Emissions
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-center md:px-4">
                                <div className="w-16 h-16 rounded-full bg-brand-yellow border-4 border-black flex items-center justify-center font-black text-2xl z-10 shrink-0">
                                    VS
                                </div>
                            </div>

                            {/* App 2 Card */}
                            <div className="flex-1 bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-brand-gray flex items-center justify-center border-2 border-black mb-6">
                                    {!iconUrl2.startsWith("fallback:") ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={iconUrl2} alt={`${data2.app_name} Logo`} className="w-10 h-10" />
                                    ) : (
                                        <Monitor className="w-10 h-10 text-black" />
                                    )}
                                </div>
                                <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-2">{data2.app_name}</h2>
                                <p className="text-sm font-bold uppercase tracking-widest text-neutral-500 mb-6">{t(`categories.${data2.category}`)}</p>
                                <div className="mt-auto pt-6 border-t-2 border-black/10 w-full">
                                    <div className="text-5xl font-black text-black mb-2">{data2.co2_per_hour_grams}<span className="text-xl">g</span></div>
                                    <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">CO2 / Hour</p>
                                </div>
                                {!isData1Worse && !isTie && (
                                    <div className="mt-6 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 border-2 border-red-800">
                                        Higher Emissions
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-12 border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">Summary</h3>
                            <p className="text-lg text-neutral-800 leading-relaxed">
                                When comparing <strong>{data1.app_name}</strong> and <strong>{data2.app_name}</strong>,{' '}
                                {isTie 
                                    ? "they have an identical estimated carbon footprint per hour of usage."
                                    : `using ${isData1Worse ? data1.app_name : data2.app_name} generates significantly more CO2 emissions per hour (${isData1Worse ? data1.co2_per_hour_grams : data2.co2_per_hour_grams}g) compared to ${isData1Worse ? data2.app_name : data1.app_name} (${isData1Worse ? data2.co2_per_hour_grams : data1.co2_per_hour_grams}g).`
                                }
                                {' '}Both applications require device power, data transfer networks, and server infrastructure which all contribute to their environmental impact.
                            </p>
                        </div>

                        <div className="mt-12 mb-12 border-t-2 border-black/10 pt-12">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">
                                Deep dive into their footprints
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link
                                    href={`/carbon-footprint/${data1.slug}`}
                                    className="border-2 border-black bg-brand-gray p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                                >
                                    Read the full {data1.app_name} report
                                    <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={`/carbon-footprint/${data2.slug}`}
                                    className="border-2 border-black bg-brand-gray p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                                >
                                    Read the full {data2.app_name} report
                                    <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / CTA */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-brand-yellow border-2 border-black p-8 sticky top-24 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                {t("page.about_idleforest")}
                            </h3>
                            <p className="text-neutral-900 mb-6 leading-relaxed">
                                {t("page.about_desc")}
                            </p>
                            <Link
                                href="/"
                                className="block w-full border-2 border-black bg-black text-brand-yellow px-6 py-4 text-center font-bold uppercase tracking-wide hover:-translate-y-1 transition-transform"
                            >
                                Start Planting Free
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
