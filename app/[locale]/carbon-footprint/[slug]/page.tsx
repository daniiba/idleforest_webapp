import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarbonData, getRelatedCarbonData, getIconUrl, getFeaturedCarbonPages, localizeCarbonData } from "@/lib/carbon-data";
import { CalculatorWidget } from "@/components/carbon/calculator-widget";
import { ComparisonGraph } from "@/components/carbon/comparison-graph";
import { SmartCTA } from "@/components/smart-cta";
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Gamepad2, Monitor, Users } from "lucide-react";
import { Link } from "@/navigation";
import Navigation from "@/components/navigation";
import { getTranslations } from "next-intl/server";
import { buildComparisonPath, buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { getCuratedComparisonPeers } from "@/lib/carbon-compares";

interface PageProps {
    params: {
        slug: string;
        locale: string;
    };
}

const CALCULATION_PROOF_COPY = {
    eyebrow: "Calculation proof",
    title: "How the estimate is calculated",
    annualFormulaLabel: "Annual footprint formula",
    transactionFormulaLabel: "Per-transaction conversion",
    treeFormulaLabel: "Tree offset formula",
    evidenceLabel: "Evidence trail",
    evidenceNote: "The hourly estimate, assumptions, methodology notes, and source URLs are stored in the Supabase carbon_apps.seo_content row for this page.",
    roundedUp: "rounded up",
    treeYear: "kg CO2e per tree-year",
};

function formatProofKg(value: number): string {
    if (value >= 0.1) {
        return String(Math.round(value * 10) / 10);
    }

    return value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const rawData = await getCarbonData(params.slug);
    const data = rawData ? localizeCarbonData(rawData, params.locale) : undefined;
    const t = await getTranslations("CarbonFootprint");

    if (!data) {
        return {
            title: t("page.not_found_title"),
            description: t("page.not_found_desc"),
        };
    }

    return {
        title: t("page.seo_title", { app: data.app_name }),
        description: t("page.seo_desc", { app: data.app_name }),
        alternates: buildLocalizedAlternates(`/carbon-footprint/${params.slug}`, params.locale),
        keywords: [
            `carbon footprint of ${data.app_name}`,
            `${data.app_name} environmental impact`,
            `co2 emissions of ${data.app_name}`,
            "digital carbon footprint",
            "offset carbon emissions",
            ...(data.seo?.searchTopics || []),
        ],
        openGraph: {
            images: [
                {
                    url: `/api/og/carbon?slug=${data.slug}&locale=${params.locale}`,
                    width: 1200,
                    height: 630,
                }
            ]
        }
    };
}

export default async function CarbonFootprintPage({ params }: PageProps) {
    const rawData = await getCarbonData(params.slug);
    const data = rawData ? localizeCarbonData(rawData, params.locale) : undefined;
    const t = await getTranslations("CarbonFootprint");

    if (!data) {
        notFound();
    }

    const canonicalPath = `/carbon-footprint/${data.slug}`;
    const canonicalUrl = getLocalizedUrl(canonicalPath, params.locale);
    const localizedHubUrl = getLocalizedUrl("/carbon-footprint", params.locale);
    const isPerTransaction = data.avg_usage_hours_day === "N/A" || data.category === "Crypto";
    const reviewedDate = data.seo?.reviewed_at ? new Intl.DateTimeFormat(params.locale, {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(new Date(data.seo.reviewed_at)) : undefined;
    const avgDailyHours = typeof data.avg_usage_hours_day === "number" ? data.avg_usage_hours_day : undefined;
    const rawImpactKg = avgDailyHours
        ? (data.co2_per_hour_grams * avgDailyHours * 365) / 1000
        : data.co2_per_hour_grams / 1000;
    const proofImpactKg = formatProofKg(rawImpactKg);
    const annualFormula = avgDailyHours
        ? `${data.co2_per_hour_grams}g CO2e/hour x ${avgDailyHours}h/day x 365 / 1000 = ${proofImpactKg}kg CO2e/year`
        : `${data.co2_per_hour_grams}g CO2e / 1000 = ${proofImpactKg}kg CO2e per modeled use event`;
    const treeFormula = `ceil(${proofImpactKg}kg CO2e / 20 ${CALCULATION_PROOF_COPY.treeYear}) = ${data.trees_to_offset} ${CALCULATION_PROOF_COPY.roundedUp}`;
    const clusterLinks = [
        {
            title: t("page.cluster_links.hub.title"),
            description: t("page.cluster_links.hub.description"),
            href: "/carbon-footprint",
        },
        {
            title: t("page.cluster_links.ai.title"),
            description: t("page.cluster_links.ai.description"),
            href: "/carbon-footprint/ai",
        },
        {
            title: t("page.cluster_links.streaming.title"),
            description: t("page.cluster_links.streaming.description"),
            href: "/carbon-footprint/streaming",
        },
        {
            title: t("page.cluster_links.digital_footprint.title"),
            description: t("page.cluster_links.digital_footprint.description"),
            href: "/carbon-footprint/digital-carbon-footprint",
        },
    ].filter((item) => item.href !== `/carbon-footprint/${data.slug}`);
    const featuredGuides = (await getFeaturedCarbonPages())
        .map((page) => localizeCarbonData(page, params.locale))
        .filter((page) => page.slug !== data.slug)
        .slice(0, 3);
    const curatedComparisonPeers = getCuratedComparisonPeers(data.slug);
    const curatedComparisonPages = (await Promise.all(
        curatedComparisonPeers.map((peerSlug) => getCarbonData(peerSlug))
    ))
        .filter((peer): peer is NonNullable<typeof peer> => Boolean(peer))
        .map((peer) => localizeCarbonData(peer, params.locale));
    const relatedPages = (await getRelatedCarbonData(data.slug, data.category)).map((related) =>
        localizeCarbonData(related, params.locale)
    );
    const comparisonPages = (curatedComparisonPages.length ? curatedComparisonPages : relatedPages).slice(0, 3);

    const faqEntities = [
        {
            "@type": "Question",
            "name": t("page.faq_q1", { app: data.app_name }),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": t("page.faq_a1_no_equivalent", { app: data.app_name, grams: data.co2_per_hour_grams })
            }
        },
        {
            "@type": "Question",
            "name": t("page.faq_q2", { app: data.app_name }),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": t("page.faq_a2", { app: data.app_name, kg: data.yearly_impact_kg, trees: data.trees_to_offset })
            }
        },
        ...(data.seo?.faq || []).map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
                "@type": "Answer",
                text: item.answer,
            },
        })),
    ];

    const jsonLd = [
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqEntities
        },
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
                    item: localizedHubUrl,
                },
                {
                    "@type": "ListItem",
                    position: 3,
                    name: t("page.seo_title", { app: data.app_name }),
                    item: canonicalUrl,
                },
            ]
        },
        {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: t("page.seo_title", { app: data.app_name }),
            description: t("page.seo_desc", { app: data.app_name }),
            url: canonicalUrl,
            dateModified: data.seo?.reviewed_at,
            about: {
                "@type": "Thing",
                name: `${data.app_name} carbon footprint`
            },
            publisher: {
                "@type": "Organization",
                name: data.seo?.reviewer?.organization || "IdleForest",
                url: "https://www.idleforest.com"
            }
        }
    ];

    return (
        <div className="min-h-screen bg-brand-gray  pb-12 font-inter">
            <Navigation />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <div className="container mx-auto px-6">
                {/* Breadcrumb / Back Link */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-neutral-600 hover:text-black transition-colors font-medium"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t("page.back_to_home")}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="flex items-center gap-6 mb-6">
                            <div className="w-20 h-20 bg-white flex items-center justify-center border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                {(() => {
                                    const iconUrl = getIconUrl(data);
                                    if (iconUrl.startsWith("fallback:")) {
                                        const type = iconUrl.split(":")[1];
                                        if (type === "gamepad") return <Gamepad2 className="w-12 h-12 text-black" />;
                                        if (type === "users") return <Users className="w-12 h-12 text-black" />;
                                        return <Monitor className="w-12 h-12 text-black" />;
                                    }
                                    return (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={iconUrl}
                                            alt={`${data.app_name} Logo`}
                                            className="w-12 h-12"
                                        />
                                    );
                                })()}
                            </div>
                            <h1 className="font-candu text-[38px] sm:text-5xl md:text-6xl font-extrabold text-black uppercase leading-[1.05]">
                                {t("page.carbon_footprint_of")} <span className="text-brand-yellow bg-black px-2">{data.app_name}</span>
                            </h1>
                        </div>



                        <p className="text-xl text-neutral-800 mb-8 leading-relaxed max-w-2xl">
                            {isPerTransaction ? (
                                t.rich("page.per_transaction_estimate_sentence", {
                                    app: data.app_name,
                                    grams: data.co2_per_hour_grams,
                                    strong: (chunks) => <strong className="text-black bg-brand-yellow/30 px-1 rounded">{chunks}</strong>,
                                })
                            ) : (
                                t("page.hourly_estimate_sentence", { app: data.app_name, grams: data.co2_per_hour_grams })
                            )}
                        </p>

                        {data.seo && (
                            <div className="mb-10 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-lg text-neutral-800 leading-relaxed">
                                    {data.seo.intro}
                                </p>
                            </div>
                        )}

                        <div className="mb-12">
                            <CalculatorWidget data={data} />
                        </div>

                        {data.seo?.methodology_summary || data.seo?.methodology_bullets?.length ? (
                            <div className="mb-12 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                    {data.seo.methodology_title || t("sources.title")}
                                </h2>
                                {data.seo.methodology_summary ? (
                                    <p className="text-neutral-800 leading-relaxed mb-5">
                                        {data.seo.methodology_summary}
                                    </p>
                                ) : null}
                                {data.seo.methodology_bullets?.length ? (
                                    <ul className="space-y-3">
                                        {data.seo.methodology_bullets.map((bullet) => (
                                            <li key={bullet} className="flex items-start gap-3 text-neutral-800 leading-relaxed">
                                                <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />
                                                <span>{bullet}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="mb-12 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">
                                {CALCULATION_PROOF_COPY.eyebrow}
                            </p>
                            <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-5">
                                {CALCULATION_PROOF_COPY.title}
                            </h2>
                            <div className="space-y-4">
                                <div className="rounded-lg border border-black/10 bg-brand-gray p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                                        {isPerTransaction ? CALCULATION_PROOF_COPY.transactionFormulaLabel : CALCULATION_PROOF_COPY.annualFormulaLabel}
                                    </p>
                                    <p className="font-mono text-sm text-black break-words">{annualFormula}</p>
                                </div>
                                <div className="rounded-lg border border-black/10 bg-brand-gray p-4">
                                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">
                                        {CALCULATION_PROOF_COPY.treeFormulaLabel}
                                    </p>
                                    <p className="font-mono text-sm text-black break-words">{treeFormula}</p>
                                </div>
                                <p className="text-sm leading-relaxed text-neutral-700">
                                    <strong className="text-black">{CALCULATION_PROOF_COPY.evidenceLabel}:</strong> {CALCULATION_PROOF_COPY.evidenceNote}
                                </p>
                            </div>
                        </div>

                        {data.seo?.key_drivers?.length || data.seo?.assumptions?.length || data.seo?.uncertainty ? (
                            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.seo?.key_drivers?.length ? (
                                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                            {t("page.drivers_title")}
                                        </h2>
                                        <ul className="space-y-3">
                                            {data.seo.key_drivers.map((driver) => (
                                                <li key={driver} className="flex items-start gap-3 text-neutral-800 leading-relaxed">
                                                    <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />
                                                    <span>{driver}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {data.seo?.assumptions?.length || data.seo?.uncertainty ? (
                                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                            {t("page.assumptions_title")}
                                        </h2>
                                        {data.seo?.assumptions?.length ? (
                                            <ul className="space-y-3">
                                                {data.seo.assumptions.map((assumption) => (
                                                    <li key={assumption} className="flex items-start gap-3 text-neutral-800 leading-relaxed">
                                                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-black" />
                                                        <span>{assumption}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : null}
                                        {data.seo?.uncertainty ? (
                                            <p className="mt-5 rounded-lg border border-black/10 bg-brand-gray p-4 text-sm leading-relaxed text-neutral-700">
                                                <strong className="text-black">{t("page.uncertainty_note")}</strong> {data.seo.uncertainty}
                                            </p>
                                        ) : null}
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className="mb-12">
                            <ComparisonGraph data={data} />
                        </div>

                        {data.seo?.reduction_tips?.length || data.seo?.reviewer ? (
                            <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                                {data.seo?.reduction_tips?.length ? (
                                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                            {t("page.reduction_title")}
                                        </h2>
                                        <ul className="space-y-3">
                                            {data.seo.reduction_tips.map((tip) => (
                                                <li key={tip} className="flex items-start gap-3 text-neutral-800 leading-relaxed">
                                                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-green" />
                                                    <span>{tip}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : null}

                                {data.seo?.reviewer ? (
                                    <div className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                        <p className="text-xs font-bold uppercase tracking-[0.24em] text-neutral-500 mb-3">
                                            {t("page.reviewed_eyebrow")}
                                        </p>
                                        <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                            {t("page.review_title")}
                                        </h2>
                                        <div className="space-y-2 text-neutral-800">
                                            <p><strong className="text-black">{t("page.reviewed_by_label")}</strong> {data.seo.reviewer.name}</p>
                                            <p><strong className="text-black">{t("page.role_label")}</strong> {data.seo.reviewer.role}</p>
                                            <p><strong className="text-black">{t("page.organization_label")}</strong> {data.seo.reviewer.organization}</p>
                                            {reviewedDate ? (
                                                <p><strong className="text-black">{t("page.last_reviewed_label")}</strong> {reviewedDate}</p>
                                            ) : null}
                                        </div>
                                        <p className="mt-5 rounded-lg border border-black/10 bg-brand-gray p-4 text-sm leading-relaxed text-neutral-700">
                                            {t("page.editorial_note")}
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        {data.seo?.source_references?.length ? (
                            <div className="mb-12 border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <h2 className="font-rethink-sans text-2xl font-extrabold text-black mb-4">
                                    {t("page.sources_title")}
                                </h2>
                                <div className="space-y-4">
                                    {data.seo.source_references.map((source) => (
                                        <a
                                            key={source.url}
                                            href={source.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block rounded-lg border border-black/10 bg-brand-gray p-4 transition-colors hover:border-black"
                                        >
                                            <div className="flex items-center justify-between gap-4 mb-2">
                                                <h3 className="font-rethink-sans text-lg font-extrabold text-black">{source.title}</h3>
                                                <ExternalLink className="h-4 w-4 shrink-0 text-neutral-500" />
                                            </div>
                                            <p className="text-neutral-700 leading-relaxed">{source.note}</p>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        {data.seo?.faq?.length ? (
                            <div className="mt-12 mb-12 border-t-2 border-black/10 pt-12">
                                <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">
                                    {t("page.more_questions_about", { app: data.app_name })}
                                </h2>
                                <div className="space-y-4">
                                    {data.seo.faq.map((item) => (
                                        <div key={item.question} className="border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                            <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-3">
                                                {item.question}
                                            </h3>
                                            <p className="text-neutral-700 leading-relaxed">{item.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-12 mb-12 border-t-2 border-black/10 pt-12">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">
                                {t("page.explore_the_cluster")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {clusterLinks.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="border-2 border-black bg-white p-6 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-2">{item.title}</h3>
                                        <p className="text-neutral-700 leading-relaxed">{item.description}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 mb-12 border-t-2 border-black/10 pt-12">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-6">
                                {t("page.featured_carbon_guides")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {featuredGuides.map((guide) => (
                                    <Link
                                        key={guide.slug}
                                        href={`/carbon-footprint/${guide.slug}`}
                                        className="border-2 border-black bg-brand-gray p-5 hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500 mb-2">
                                            {t(`categories.${guide.category}`)}
                                        </div>
                                        <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-2">{guide.app_name}</h3>
                                        <p className="text-neutral-700 text-sm leading-relaxed">{guide.seo?.intro || guide.idleforest_pitch}</p>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        <div className="mt-16 pt-12 border-t-2 border-black/10">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-8">
                                {t("page.compare_with_related")}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {comparisonPages.map((related) => (
                                    <Link
                                        key={related.slug}
                                        href={buildComparisonPath(data.slug, related.slug)}
                                        className="relative block p-6 bg-white border-2 border-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all group duration-200"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-3">
                                                {(() => {
                                                    const iconUrl = getIconUrl(related);
                                                    if (iconUrl.startsWith("fallback:")) {
                                                        const type = iconUrl.split(":")[1];
                                                        if (type === "gamepad") return <Gamepad2 className="w-8 h-8" />;
                                                        if (type === "users") return <Users className="w-8 h-8" />;
                                                        return <Monitor className="w-8 h-8" />;
                                                    }
                                                    return (
                                                        // eslint-disable-next-line @next/next/no-img-element
                                                        <img
                                                            src={iconUrl}
                                                            alt=""
                                                            className="w-8 h-8"
                                                        />
                                                    );
                                                })()}
                                                <h3 className="font-rethink-sans font-extrabold text-xl group-hover:text-brand-green transition-colors">
                                                    {related.app_name}
                                                </h3>
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-brand-yellow text-black px-2 py-1 border border-black">
                                                {t(`categories.${related.category}`)}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                                {related.co2_per_hour_grams}{t("page.g_co2_hour")}
                                            </p>
                                            <p className="text-sm text-neutral-600 pl-4">
                                                {t("page.requires")} <span className="font-bold text-black">{related.trees_to_offset} {t("page.trees_yr_to_offset")}</span>
                                            </p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-black/10 flex items-center justify-between gap-3 text-sm font-bold text-black">
                                            <span>{t("page.open_comparison")}</span>
                                            <ArrowRight className="w-4 h-4 shrink-0" />
                                        </div>
                                    </Link>
                                ))}
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

                            <SmartCTA className="w-full text-black" showLearnMore={false} forceVertical={true} buttonVariant="inverse" />

                            <div className="mt-6 text-sm text-neutral-800 border-t-2 border-black/10 pt-4 font-medium">
                                <p className="mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    {t("page.free_to_use")}
                                </p>
                                <p className="mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    {t("page.no_account")}
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    {t("page.open_source")}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
