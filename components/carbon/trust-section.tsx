import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

interface TrustSectionProps {
    category: string;
}

interface SourceReference {
    name: string;
    detail: string;
    url?: string;
}

const STREAMING_SOURCE_URL = "https://www.carbontrust.com/our-work-and-impact/guides-reports-and-tools/carbon-impact-of-video-streaming";
const DIGITAL_SOURCE_URL = "https://www.iea.org/energy-system/digitalisation/data-centres-and-data-transmission-networks";
const GAMING_SOURCE_URL = "https://www.energy.ca.gov/publications/2019/plug-loads-game-changer-computer-gaming-energy-efficiency-without-performance";
const AI_SOURCE_URL = "https://www.iea.org/reports/energy-and-ai";
const CRYPTO_SOURCE_URL = "https://ccaf.io/cbnsi/cbeci";

export function TrustSection({ category }: TrustSectionProps) {
    const t = useTranslations("CarbonFootprint.sources");

    const defaultSource: SourceReference = {
        name: t("digital_name"),
        detail: t("digital_detail"),
        url: DIGITAL_SOURCE_URL,
    };

    let sources: SourceReference[] = [
        {
            ...defaultSource,
        },
    ];

    if (category === "Streaming") {
        sources = [
            {
                name: t("carbon_trust_name"),
                detail: t("carbon_trust_detail"),
                url: STREAMING_SOURCE_URL,
            },
        ];
    } else if (category === "Gaming") {
        sources = [
            {
                name: t("greenly_name"),
                detail: t("greenly_detail"),
                url: GAMING_SOURCE_URL,
            },
        ];
    } else if (category === "AI") {
        sources = [
            {
                name: t("llm_name"),
                detail: t("llm_detail"),
                url: AI_SOURCE_URL,
            },
        ];
    } else if (category === "Crypto") {
        sources = [
            {
                name: t("bitcoin_name"),
                detail: t("bitcoin_detail"),
                url: CRYPTO_SOURCE_URL,
            },
        ];
    }

    return (
        <div className="border-t-2 border-neutral-200 pt-12 mt-12 mb-12">
            <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-6">{t("title")}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {sources.map((source, idx) => (
                    <div key={idx} className="flex gap-4">
                        <div className="mt-1">
                            <ExternalLink className="w-5 h-5 text-neutral-400" />
                        </div>
                        <div>
                            <div className="text-black font-bold text-lg mb-1">
                                {source.url ? (
                                    <a
                                        href={source.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="hover:underline underline-offset-4"
                                    >
                                        {source.name}
                                    </a>
                                ) : (
                                    source.name
                                )}
                            </div>
                            <div className="text-neutral-600 leading-relaxed">{source.detail}</div>
                            {source.url ? (
                                <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-black hover:underline underline-offset-4"
                                >
                                    {t("visit_source")}
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            ) : null}
                        </div>
                    </div>
                ))}
                <div className="flex gap-4">
                    <div className="mt-1">
                        <ExternalLink className="w-5 h-5 text-neutral-400" />
                    </div>
                    <div>
                        <div className="text-black font-bold text-lg mb-1">{t("idleforest_name")}</div>
                        <div className="text-neutral-600 leading-relaxed">
                            {t("idleforest_detail")}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
