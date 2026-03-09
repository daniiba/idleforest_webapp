import { CarbonData } from "@/lib/carbon-data";
import { ExternalLink } from "lucide-react";
import { useTranslations } from "next-intl";

interface TrustSectionProps {
    category: string;
}

export function TrustSection({ category }: TrustSectionProps) {
    const t = useTranslations("CarbonFootprint.sources");
    let sources = [
        {
            name: t("carbon_trust_name"),
            detail: t("carbon_trust_detail"),
        },
    ];

    if (category === "Gaming") {
        sources = [
            {
                name: t("greenly_name"),
                detail: t("greenly_detail"),
            },
        ];
    } else if (category === "Productivity" || category === "AI") {
        sources = [
            {
                name: t("llm_name"),
                detail: t("llm_detail"),
            },
        ];
    } else if (category === "Crypto") {
        sources = [
            {
                name: t("bitcoin_name"),
                detail: t("bitcoin_detail"),
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
                            <div className="text-black font-bold text-lg mb-1">{source.name}</div>
                            <div className="text-neutral-600 leading-relaxed">{source.detail}</div>
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
