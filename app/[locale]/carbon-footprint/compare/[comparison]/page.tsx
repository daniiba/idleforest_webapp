import { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getCarbonData, getIconUrl, localizeCarbonData } from "@/lib/carbon-data";
import { Link } from "@/navigation";
import Navigation from "@/components/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, CheckCircle2, Monitor } from "lucide-react";
import { buildComparisonPath, buildLocalizedAlternates, getLocalizedPath, getLocalizedUrl, isIndexableComparison, normalizeComparisonSlugs } from "@/lib/carbon-routing";
import { getCarbonCompare } from "@/lib/carbon-compares";

interface PageProps {
    params: {
        comparison: string;
        locale: string;
    };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const slugs = params.comparison.split('-vs-');
    if (slugs.length !== 2) return { title: "Compare Carbon Footprints" };

    const [slugA, slugB] = normalizeComparisonSlugs(slugs[0], slugs[1]);
    const data1 = await getCarbonData(slugA);
    const data2 = await getCarbonData(slugB);
    const t = await getTranslations({ locale: params.locale, namespace: "CarbonFootprint" });
    const indexableComparison = isIndexableComparison(slugA, slugB);

    if (!data1 || !data2) return { title: "Not Found" };

    return {
        title: t("page.compare_seo_title", { app1: data1.app_name, app2: data2.app_name }),
        description: t("page.compare_seo_desc", { app1: data1.app_name, app2: data2.app_name }),
        alternates: buildLocalizedAlternates(buildComparisonPath(slugA, slugB), params.locale),
        robots: indexableComparison ? undefined : {
            index: false,
            follow: true,
        },
        openGraph: {
            images: [
                {
                    url: `/api/og/compare?app1=${data1.slug}&app2=${data2.slug}&locale=${params.locale}`,
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
    if (slugs[0] === slugs[1]) notFound();

    const [normalizedSlugA, normalizedSlugB] = normalizeComparisonSlugs(slugs[0], slugs[1]);
    const canonicalComparison = `${normalizedSlugA}-vs-${normalizedSlugB}`;

    if (canonicalComparison !== params.comparison) {
        permanentRedirect(getLocalizedPath(buildComparisonPath(normalizedSlugA, normalizedSlugB), params.locale));
    }

    const rawData1 = await getCarbonData(normalizedSlugA);
    const rawData2 = await getCarbonData(normalizedSlugB);

    if (!rawData1 || !rawData2) notFound();

    const data1 = localizeCarbonData(rawData1, params.locale);
    const data2 = localizeCarbonData(rawData2, params.locale);

    const t = await getTranslations("CarbonFootprint");
    const compareEditorial = await getCarbonCompare(data1.slug, data2.slug, params.locale);
    const indexableComparison = isIndexableComparison(data1.slug, data2.slug);
    const canonicalPath = buildComparisonPath(data1.slug, data2.slug);
    const comparisonUrl = getLocalizedUrl(canonicalPath, params.locale);

    const iconUrl1 = getIconUrl(data1);
    const iconUrl2 = getIconUrl(data2);

    const isData1Worse = data1.co2_per_hour_grams > data2.co2_per_hour_grams;
    const isTie = data1.co2_per_hour_grams === data2.co2_per_hour_grams;
    const winner = isTie ? undefined : (isData1Worse ? data1 : data2);
    const lighter = isTie ? undefined : (isData1Worse ? data2 : data1);
    const delta = Math.abs(data1.co2_per_hour_grams - data2.co2_per_hour_grams);
    const category1 = t(`categories.${data1.category}`);
    const category2 = t(`categories.${data2.category}`);
    const dataBackedReasons = [
        !isTie && winner && lighter
            ? t("page.compare_model_gap_reason", {
                winner: winner.app_name,
                winnerGrams: winner.co2_per_hour_grams,
                lighter: lighter.app_name,
                lighterGrams: lighter.co2_per_hour_grams,
                delta,
            })
            : t("page.compare_tie_note"),
        data1.category === data2.category
            ? t("page.compare_same_category_reason", { category: category1 })
            : t("page.compare_different_category_reason", {
                app1: data1.app_name,
                category1,
                app2: data2.app_name,
                category2,
            }),
        winner?.seo?.methodology_summary,
        winner?.seo?.key_drivers?.[0],
        lighter?.seo?.key_drivers?.[0],
    ].filter((reason): reason is string => Boolean(reason));
    const comparisonReasons = compareEditorial?.whyItDiffers?.length
        ? compareEditorial.whyItDiffers
        : Array.from(new Set(dataBackedReasons)).slice(0, 4);
    const comparisonHeading = compareEditorial?.heading || t("page.compare_data_backed_heading");
    const comparisonSummary = compareEditorial?.summary || t("page.compare_data_backed_summary", {
        app1: data1.app_name,
        app2: data2.app_name,
    });
    const comparisonAction = compareEditorial?.actionAngle
        || (winner?.seo?.reduction_tips?.[0]
            ? t("page.compare_fallback_action_with_tip", {
                app: winner.app_name,
                tip: winner.seo.reduction_tips[0],
            })
            : t("page.compare_fallback_action"));
    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
                {
                    "@type": "ListItem",
                    position: 1,
                    name: "Home",
                    item: getLocalizedUrl("/", params.locale),
                },
                {
                    "@type": "ListItem",
                    position: 2,
                    name: t("page.carbon_footprint_cluster_hub"),
                    item: getLocalizedUrl("/carbon-footprint", params.locale),
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: `${data1.app_name} vs ${data2.app_name}`,
                    item: comparisonUrl,
                },
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: t("page.compare_seo_title", { app1: data1.app_name, app2: data2.app_name }),
            description: t("page.compare_seo_desc", { app1: data1.app_name, app2: data2.app_name }),
            url: comparisonUrl,
        }
    ];

    return (
        <div className="min-h-screen bg-brand-gray pb-12 font-inter">
            <Navigation />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
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
                    <span className="text-black">{t("page.compare_breadcrumb")}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="mb-10 text-center">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-4">
                                {t("page.compare_eyebrow")}
                            </p>
                            <h1 className="font-candu text-[38px] sm:text-5xl md:text-6xl font-extrabold text-black uppercase leading-[1.05]">
                                {data1.app_name} <span className="bg-brand-yellow px-2 mx-2">vs</span> {data2.app_name}
                            </h1>
                            {comparisonSummary ? (
                                <p className="mt-5 mx-auto max-w-3xl text-lg leading-relaxed text-neutral-700">
                                    {comparisonSummary}
                                </p>
                            ) : null}
                            {!indexableComparison ? (
                                <p className="mt-4 inline-flex rounded-full border border-black/10 bg-white px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-neutral-700">
                                    {t("page.supporting_comparison_page")}
                                </p>
                            ) : null}
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
                                    <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">{t("page.co2_per_hour_short")}</p>
                                </div>
                                {isData1Worse && !isTie && (
                                    <div className="mt-6 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 border-2 border-red-800">
                                        {t("page.higher_emissions")}
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
                                    <p className="text-sm font-bold text-neutral-600 uppercase tracking-widest">{t("page.co2_per_hour_short")}</p>
                                </div>
                                {!isData1Worse && !isTie && (
                                    <div className="mt-6 bg-red-100 text-red-800 text-xs font-bold uppercase tracking-wider px-3 py-1 border-2 border-red-800">
                                        {t("page.higher_emissions")}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mb-12 border-2 border-black bg-white p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">{comparisonHeading}</p>
                            <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">{t("page.compare_summary_title")}</h3>
                            <p className="text-lg text-neutral-800 leading-relaxed">
                                {t("page.compare_summary_intro", { app1: data1.app_name, app2: data2.app_name })}{' '}
                                {isTie 
                                    ? t("page.compare_summary_tie")
                                    : t("page.compare_summary_winner", {
                                        winner: isData1Worse ? data1.app_name : data2.app_name,
                                        winnerGrams: isData1Worse ? data1.co2_per_hour_grams : data2.co2_per_hour_grams,
                                        loser: isData1Worse ? data2.app_name : data1.app_name,
                                        loserGrams: isData1Worse ? data2.co2_per_hour_grams : data1.co2_per_hour_grams,
                                    })
                                }
                                {' '}{t("page.compare_summary_outro")}
                            </p>
                        </div>

                        {comparisonReasons.length ? (
                            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">{t("page.why_gap_title")}</h3>
                                    <ul className="space-y-3">
                                        {comparisonReasons.map((reason) => (
                                            <li key={reason} className="flex items-start gap-3 text-neutral-800 leading-relaxed">
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />
                                                <span>{reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                    <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">{t("page.action_first_title")}</h3>
                                    <p className="text-neutral-800 leading-relaxed mb-5">{comparisonAction}</p>
                                    {winner && lighter ? (
                                        <div className="rounded-lg border border-black/10 bg-brand-gray p-4 text-sm leading-relaxed text-neutral-700">
                                            {t.rich("page.compare_delta_note", {
                                                winner: winner.app_name,
                                                delta,
                                                lighter: lighter.app_name,
                                                strong: (chunks) => <strong className="text-black">{chunks}</strong>,
                                            })}
                                        </div>
                                    ) : (
                                        <div className="rounded-lg border border-black/10 bg-brand-gray p-4 text-sm leading-relaxed text-neutral-700">
                                            {t("page.compare_tie_note")}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-12 mb-12 border-t-2 border-black/10 pt-12">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">
                                {t("page.deep_dive_into_footprints")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link
                                    href={`/carbon-footprint/${data1.slug}`}
                                    className="border-2 border-black bg-brand-gray p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                                >
                                    {t("page.read_full_report", { app: data1.app_name })}
                                    <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href={`/carbon-footprint/${data2.slug}`}
                                    className="border-2 border-black bg-brand-gray p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all font-bold group"
                                >
                                    {t("page.read_full_report", { app: data2.app_name })}
                                    <ArrowRight className="inline-block w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar / CTA */}
                    <div className="lg:col-span-4 space-y-8">
                        {comparisonReasons.length ? (
                            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">{t("page.compare_takeaways_title")}</h3>
                                <div className="space-y-3">
                                    {comparisonReasons.slice(0, 2).map((reason) => (
                                        <div key={reason} className="flex items-start gap-3 text-sm leading-relaxed text-neutral-700">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
                                            <span>{reason}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="bg-brand-yellow border-2 border-black p-8 sticky top-24 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <h3 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                {t("page.about_idleforest")}
                            </h3>
                            <p className="text-neutral-900 mb-6 leading-relaxed">
                                {t("page.about_desc")}
                            </p>
                            <Link
                                href="/welcome"
                                className="block w-full border-2 border-black bg-black text-brand-yellow px-6 py-4 text-center font-bold uppercase tracking-wide hover:-translate-y-1 transition-transform"
                            >
                                Connect Desktop App
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
