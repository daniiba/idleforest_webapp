import { CarbonData } from "@/lib/carbon-data";
import { ExternalLink } from "lucide-react";

interface TrustSectionProps {
    category: string;
}

export function TrustSection({ category }: TrustSectionProps) {
    let sources = [
        {
            name: "Carbon Trust (2021) & IEA",
            detail: "Estimates ~55g/hr for streaming video.",
        },
    ];

    if (category === "Gaming") {
        sources = [
            {
                name: "Greenly.earth",
                detail: "Reports ~150g/hr for typical PC gaming power consumption.",
            },
        ];
    } else if (category === "Productivity" || category === "AI") {
        sources = [
            {
                name: "LLM Inference Studies",
                detail: "Research indicates ~4-5g CO2 per query for large models.",
            },
        ];
    } else if (category === "Crypto") {
        sources = [
            {
                name: "Digiconmist",
                detail: "Bitcoin Energy Consumption Index.",
            },
        ];
    }

    return (
        <div className="border-t-2 border-neutral-200 pt-12 mt-12 mb-12">
            <h3 className="font-rethink-sans text-xl font-extrabold text-black mb-6">Sources & Methodology</h3>
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
                        <div className="text-black font-bold text-lg mb-1">IdleForest Calculation</div>
                        <div className="text-neutral-600 leading-relaxed">
                            Offset calculations assume an average mature tree absorbs ~20kg CO2 per year. Usage hours are based on typical user averages.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
