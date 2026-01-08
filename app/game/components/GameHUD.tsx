import { memo } from "react";
import Image from "next/image";
import { Zap, Trees } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

import { ActiveMultiplier } from "../data";
import { formatNumber } from "../utils";

interface GameHUDProps {
    trees: number;
    finalClickPower: number;
    finalAutoProduction: number;
    baseClickPercent: number;
    techGlobalClickMult: number;
    goldenSeeds: number;
    activeMultipliers: ActiveMultiplier[];
}

const GameHUD = memo(function GameHUD({
    trees,
    finalClickPower,
    finalAutoProduction,
    baseClickPercent,
    techGlobalClickMult,
    goldenSeeds,
    activeMultipliers
}: GameHUDProps) {
    return (
        <div className="absolute top-6 left-6 right-6 z-30 flex flex-col gap-2 pointer-events-none">
            <div className="flex items-center gap-3 bg-black text-white px-4 py-3 border-2 border-white/20 shadow-lg backdrop-blur-md rounded-lg self-start pointer-events-auto">
                <Image src="/game/leaf_currency.png" width={32} height={32} alt="Leaf" className="animate-pulse-slow w-6 h-6 md:w-8 md:h-8" />
                <div>
                    <div className="text-2xl md:text-4xl font-mono font-bold leading-none">{formatNumber(Math.floor(trees))}</div>
                    <div className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-brand-yellow">Total Trees</div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2 pointer-events-auto">
                <div className="bg-white/90 text-black px-3 py-1.5 text-sm font-bold border-2 border-black shadow-md flex items-center gap-1.5">
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <Zap className="w-3 h-3 text-brand-yellow fill-black" />
                                    <span>{finalClickPower.toFixed(1)} / click</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-neutral-900 text-white border-2 border-black text-xs p-3 max-w-[200px]" side="bottom">
                                <p className="font-bold mb-1 border-b border-neutral-700 pb-1">Click Power Formula</p>
                                <div className="font-mono text-[10px] space-y-1">
                                    <div className="flex justify-between">
                                        <span>Base:</span>
                                        <span>1.0</span>
                                    </div>
                                    <div className="flex justify-between text-brand-yellow">
                                        <span>From Auto (5%):</span>
                                        <span>+{(finalAutoProduction * baseClickPercent).toFixed(1)}</span>
                                    </div>
                                    <div className="flex justify-between text-blue-400">
                                        <span>Multipliers:</span>
                                        <span>x{techGlobalClickMult.toFixed(1)}</span>
                                    </div>
                                </div>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <div className="bg-white/90 text-black px-3 py-1.5 text-sm font-bold border-2 border-black shadow-md flex items-center gap-1.5">
                    <Trees className="w-3 h-3 text-green-600" />
                    <span>{finalAutoProduction.toFixed(1)} / sec</span>
                </div>
                {goldenSeeds > 0 && (
                    <div className="bg-amber-400 text-black px-3 py-1.5 text-xs font-bold border-2 border-black shadow-md flex items-center gap-1.5" title={`${goldenSeeds} Golden Seeds giving +${(goldenSeeds * 10).toFixed(0)}% production`}>
                        <span className="text-lg leading-none">🌰</span>
                        <span>+{((goldenSeeds * 0.10) * 100).toFixed(0)}% Boost</span>
                    </div>
                )}
                {activeMultipliers.map((buff) => {
                    const timeLeft = Math.max(0, (buff.expiresAt - Date.now()) / 1000);
                    if (timeLeft <= 0) return null;

                    return (
                        <div key={buff.id} className="bg-purple-600 text-white px-3 py-1.5 text-xs font-bold border-2 border-black shadow-md flex items-center gap-1.5 animate-pulse">
                            <span className="text-lg leading-none">✨</span>
                            <span>{buff.name}: {timeLeft.toFixed(1)}s</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default GameHUD;
