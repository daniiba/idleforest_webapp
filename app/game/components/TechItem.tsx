import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upgrade } from "../data";
import { formatNumber } from "../utils";

interface TechItemProps {
    tech: Upgrade;
    isOwned: boolean;
    canAfford: boolean;
    onBuy: (id: string) => void;
    currencyIcon: string;
}

export const TechItem = memo(({ tech, isOwned, canAfford, onBuy, currencyIcon }: TechItemProps) => {
    if (isOwned) {
        return (
            <div className="w-full bg-green-50 border-2 border-green-800 p-3 opacity-60 grayscale-[0.5]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 border-2 border-green-800 bg-green-200 flex items-center justify-center">
                        <Image src={tech.iconPath} alt={tech.name} width={24} height={24} className="pixelated" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-green-900 line-through decoration-2">{tech.name}</h4>
                        <span className="text-[10px] bg-green-800 text-white px-1.5 rounded uppercase font-bold">Researched</span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <motion.button
            layout
            className={`w-full text-left relative group border-2 transition-all duration-150 active:translate-y-1 active:shadow-none
                ${canAfford
                    ? "bg-blue-50 border-blue-900 shadow-[4px_4px_0px_0px_rgba(30,58,138,1)] hover:bg-blue-100"
                    : "bg-neutral-200 border-neutral-400 text-neutral-400 cursor-not-allowed grayscale"
                }
            `}
            onClick={() => canAfford && onBuy(tech.id)}
            disabled={!canAfford}
        >
            <div className="p-3 flex items-start gap-3">
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 border-blue-900 bg-blue-200`}>
                    <Image src={tech.iconPath} alt={tech.name} width={32} height={32} className="pixelated" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className={`font-bold text-base leading-tight truncate pr-2 ${canAfford ? 'text-blue-900' : ''}`}>{tech.name}</h4>
                    <p className={`text-xs mt-1 font-mono leading-tight ${canAfford ? 'text-blue-800' : ''}`}>{tech.description}</p>

                    <span className="text-xs uppercase font-bold text-blue-400/80 tracking-widest">Research</span>
                    <div className={`px-2 py-0.5 text-sm font-bold border flex items-center gap-1
                            ${canAfford ? "bg-white border-blue-900 text-blue-900" : "bg-neutral-300 border-neutral-400"}
                        `}>
                        <Image src={currencyIcon} width={10} height={10} alt="" />
                        {formatNumber(tech.baseCost)}
                    </div>
                </div>
            </div>
        </motion.button>
    )
});

TechItem.displayName = "TechItem";
