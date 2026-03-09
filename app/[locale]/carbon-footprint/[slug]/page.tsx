import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCarbonData, getAllSlugs, getRelatedCarbonData, getIconUrl } from "@/lib/carbon-data";
import { CalculatorWidget } from "@/components/carbon/calculator-widget";
import { ComparisonGraph } from "@/components/carbon/comparison-graph";
import { TrustSection } from "@/components/carbon/trust-section";
import { SmartCTA } from "@/components/smart-cta";
import { ArrowLeft, Gamepad2, Users, Monitor } from "lucide-react";
import Link from "next/link";
import Navigation from "@/components/navigation";

interface PageProps {
    params: {
        slug: string;
    };
}

export async function generateStaticParams() {
    const slugs = getAllSlugs();
    return slugs.map((slug) => ({
        slug: slug,
    }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const data = getCarbonData(params.slug);

    if (!data) {
        return {
            title: "Not Found",
            description: "The requested page was not found.",
        };
    }

    return {
        title: `Carbon Footprint of ${data.app_name} | IdleForest`,
        description: `Discover the environmental impact of using ${data.app_name}. Calculate your CO2 emissions and see how many trees are needed to offset them.`,
        alternates: {
            canonical: `https://idleforest.com/carbon-footprint/${params.slug}`,
        },
        keywords: [
            `carbon footprint of ${data.app_name}`,
            `${data.app_name} environmental impact`,
            `co2 emissions of ${data.app_name}`,
            "digital carbon footprint",
            "offset carbon emissions",
        ],
    };
}

export default function CarbonFootprintPage({ params }: PageProps) {
    const data = getCarbonData(params.slug);

    if (!data) {
        notFound();
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": `What is the carbon footprint of ${data.app_name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `Using ${data.app_name} for just one hour generates approximately ${data.co2_per_hour_grams}g of CO2. This is equivalent to ${data.human_equivalent.toLowerCase()}.`
                }
            },
            {
                "@type": "Question",
                "name": `How many trees do I need to plant to offset ${data.app_name}?`,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `To offset a year of typical usage of ${data.app_name} (approx. ${data.yearly_impact_kg}kg of CO2), you would need to plant about ${data.trees_to_offset} trees.`
                }
            }
        ]
    };

    return (
        <div className="min-h-screen bg-brand-gray pt-32 pb-12 font-inter">
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
                        Back to Home
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
                                Carbon Footprint of <span className="text-brand-yellow bg-black px-2">{data.app_name}</span>
                            </h1>
                        </div>



                        <p className="text-xl text-neutral-800 mb-8 leading-relaxed max-w-2xl">
                            Did you know that using {data.app_name} for just one hour generates{" "}
                            <strong className="text-black bg-brand-yellow/30 px-1 rounded">{data.co2_per_hour_grams}g of CO2</strong>?
                            {' '}That's equivalent to {data.human_equivalent.toLowerCase()}.
                        </p>


                        <div className="mb-12">
                            <CalculatorWidget data={data} />
                        </div>

                        <div className="mb-12">
                            <ComparisonGraph data={data} />
                        </div>

                        <TrustSection category={data.category} />

                        <div className="mt-16 pt-12 border-t-2 border-black/10">
                            <h2 className="font-rethink-sans text-3xl font-extrabold text-black mb-8">
                                Compare with Related Apps
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {getRelatedCarbonData(data.slug, data.category).map((related) => (
                                    <Link
                                        key={related.slug}
                                        href={`/carbon-footprint/${related.slug}`}
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
                                                {related.category}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-base font-bold text-neutral-900 flex items-center gap-2">
                                                <span className="w-2 h-2 bg-black rounded-full"></span>
                                                {related.co2_per_hour_grams}g CO2 / hour
                                            </p>
                                            <p className="text-sm text-neutral-600 pl-4">
                                                Requires <span className="font-bold text-black">{related.trees_to_offset} trees/yr</span> to offset
                                            </p>
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
                                About IdleForest
                            </h3>
                            <p className="text-neutral-900 mb-6 leading-relaxed">
                                IdleForest is a passive browser extension that plants trees while you browse, game, or stream.
                                It uses your unused internet bandwidth to fund reforestation projects.
                            </p>

                            <SmartCTA className="w-full text-black" showLearnMore={false} forceVertical={true} buttonVariant="inverse" />

                            <div className="mt-6 text-sm text-neutral-800 border-t-2 border-black/10 pt-4 font-medium">
                                <p className="mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    Free to use
                                </p>
                                <p className="mb-2 flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    No account required
                                </p>
                                <p className="flex items-center gap-2">
                                    <span className="w-4 h-4 bg-black text-brand-yellow rounded-full flex items-center justify-center text-[10px]">✓</span>
                                    Open source
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
