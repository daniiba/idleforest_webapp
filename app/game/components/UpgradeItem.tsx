import { memo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Upgrade } from "../data";
import { formatNumber } from "../utils";

interface UpgradeItemProps {
    upgrade: Upgrade;
    canAfford: boolean;
    onBuy: (id: string, amount: number) => void;
    currentCost: number;
    currencyIcon: string;
    buyAmount: number;
    currentProductionRate?: number;
}

export const UpgradeItem = memo(({ upgrade, canAfford, onBuy, currentCost, currencyIcon, buyAmount, currentProductionRate }: UpgradeItemProps) => {
    return (
        <motion.button
            layout
            className={`w-full text-left relative group border-2 transition-all duration-150 active:translate-y-1 active:shadow-none
                ${canAfford
                    ? "bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-brand-yellow/10"
                    : (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel)
                        ? "bg-green-50 border-green-800 opacity-80 cursor-default" // Ownership state
                        : "bg-neutral-200 border-neutral-400 text-neutral-400 cursor-not-allowed grayscale"
                }
            `}
            onClick={() => {
                if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return;
                if (canAfford) onBuy(upgrade.id, buyAmount);
            }}
            disabled={(!canAfford && !(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel))}
        >
            <div className="p-3 flex items-start gap-3">
                <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center border-2 
                    ${(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel)
                        ? "bg-green-200 border-green-800"
                        : canAfford ? "bg-brand-yellow border-black" : "bg-neutral-300 border-neutral-400"
                    }`}>
                    <Image src={upgrade.iconPath} alt={upgrade.name} width={32} height={32} className="pixelated" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className={`font-bold text-base leading-tight truncate pr-2 ${(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) ? "text-green-900 line-through decoration-2" : ""}`}>{upgrade.name}</h4>
                        {(!upgrade.maxLevel || upgrade.level < upgrade.maxLevel) && upgrade.maxLevel !== 1 && (
                            <span className="text-xs bg-black text-white px-1.5 py-0.5 rounded-sm font-mono">
                                x{upgrade.level}
                            </span>
                        )}
                        {(!upgrade.maxLevel || upgrade.level < upgrade.maxLevel) && buyAmount > 1 && (
                            <span className="ml-1 text-xs bg-neutral-800 text-brand-yellow px-1.5 py-0.5 rounded-sm font-mono">
                                +{buyAmount}
                            </span>
                        )}
                        {(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) && (
                            <span className="text-xs bg-green-800 text-white px-1.5 rounded uppercase font-bold">
                                {upgrade.maxLevel === 1 ? "Owned" : "Max"}
                            </span>
                        )}
                    </div>
                    <p className="text-xs mt-1 font-mono leading-tight opacity-80">
                        {(() => {
                            if (currentProductionRate !== undefined && upgrade.type === 'auto' && upgrade.autoSignal) {
                                const mult = currentProductionRate / upgrade.autoSignal;
                                const totalFormatted = formatNumber(currentProductionRate);

                                // Show breakdown only if there's a meaningful multiplier (approx > 1)
                                if (mult > 1.01) {
                                    const multFormatted = mult.toLocaleString(undefined, { maximumFractionDigits: 1 });
                                    const baseFormatted = formatNumber(upgrade.autoSignal);
                                    return `+${totalFormatted}/sec (${baseFormatted} x ${multFormatted})`;
                                }
                                return `+${totalFormatted} Trees/sec`;
                            }
                            return upgrade.description;
                        })()}
                    </p>

                    <div className="mt-2 flex items-center gap-1.5">
                        {/* Cost or Max Tag */}
                        {!(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) && (
                            <div className={`px-2 py-0.5 text-sm font-bold border flex items-center gap-1
                                ${canAfford ? "bg-green-100 border-green-600 text-green-800" : "bg-neutral-300 border-neutral-400"}
                            `}>
                                <Image src={currencyIcon} width={10} height={10} alt="" />
                                {formatNumber(currentCost)}
                            </div>
                        )}
                        {(upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) && (
                            <div className="px-2 py-0.5 text-sm font-bold border border-green-800 bg-green-100 text-green-900 flex items-center gap-1">
                                {upgrade.maxLevel === 1 ? "Active" : "Ownership Verified"}
                            </div>
                        )}
                        {upgrade.type === 'click' && <span className="text-xs uppercase font-bold text-neutral-400">Click</span>}
                        {upgrade.type === 'auto' && <span className="text-xs uppercase font-bold text-neutral-400">Auto</span>}
                    </div>
                </div>
            </div>
        </motion.button >
    );
});

UpgradeItem.displayName = "UpgradeItem";
