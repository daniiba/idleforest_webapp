import { useState, useEffect, useCallback } from "react";
import { Store, FlaskConical } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UpgradeItem } from "./UpgradeItem";
import { CustomAmountModal } from "./CustomAmountModal";
import { GameState } from "../reducer";
import { formatNumber } from "../utils";

interface GameControlsProps {
    state: GameState;
    stats?: { itemProductionRates?: Record<string, number> }; // Optional to prevent immediate break if parent not updated yet
    buyUpgrade: (id: string, amount: number) => void;
    buyTech: (id: string) => void;
    openPrestigeModal: () => void;
}

export function GameControls({ state, stats, buyUpgrade, buyTech, openPrestigeModal }: GameControlsProps) {
    const [activeTab, setActiveTab] = useState<'market' | 'lab'>('market');

    // Check key listeners in this component? 
    // Since this component is always mounted, we can listen to keys here.

    const [buyAmount, setBuyAmount] = useState<number>(1);
    const [baseBuyAmount, setBaseBuyAmount] = useState<number>(1);
    const [showCustomAmountModal, setShowCustomAmountModal] = useState(false);
    const [customAmountInput, setCustomAmountInput] = useState("");

    const openCustomAmountModal = useCallback(() => {
        setCustomAmountInput(baseBuyAmount.toString());
        setShowCustomAmountModal(true);
    }, [baseBuyAmount]);

    const handleCustomAmountConfirm = useCallback((amount: number) => {
        setBaseBuyAmount(amount);
        setBuyAmount(amount);
        setShowCustomAmountModal(false);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;

            if (e.shiftKey && e.altKey) {
                openCustomAmountModal();
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                setBuyAmount(100);
            } else if (e.shiftKey) {
                setBuyAmount(10);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Shift' || e.key === 'Control' || e.key === 'Meta') {
                setBuyAmount(baseBuyAmount);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [baseBuyAmount, openCustomAmountModal]);


    return (
        <div className="sticky top-8 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-[calc(100vh-100px)]">

            {/* PRESTIGE TEASER */}
            {(() => {
                const currentSeeds = state.goldenSeeds || 0;

                // New formula: claimable = floor(sqrt(current/1M + seeds^2) - seeds)
                const claimable = Math.max(0, Math.floor(
                    Math.sqrt((state.trees / 1000000) + Math.pow(currentSeeds, 2)) - currentSeeds
                ));

                if (claimable >= 1 || currentSeeds > 0) {
                    return (
                        <div className="bg-neutral-900 text-white p-2 border-b-2 border-black">
                            <button
                                onClick={openPrestigeModal}
                                className="w-full flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                <span className="text-lg">🔥</span>
                                {claimable >= 1 ? "Forest Fire Available" : "Evolution Shop"}
                            </button>
                        </div>
                    );
                }
                return null;
            })()}


            <div className="flex border-b-2 border-black">
                <button
                    onClick={() => setActiveTab('market')}
                    className={`flex-1 p-4 font-candu text-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-colors
                        ${activeTab === 'market' ? 'bg-brand-yellow text-black' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}
                    `}
                >
                    <Store className="w-5 h-5" />
                    Market
                </button>
                <div className="w-0.5 bg-black self-stretch" />
                <button
                    onClick={() => setActiveTab('lab')}
                    className={`flex-1 p-4 font-candu text-xl uppercase tracking-widest flex items-center justify-center gap-2 transition-colors
                        ${activeTab === 'lab' ? 'bg-brand-yellow text-black' : 'bg-neutral-100 text-neutral-400 hover:bg-neutral-200'}
                    `}
                >
                    <FlaskConical className="w-5 h-5" />
                    Lab
                </button>
            </div>

            {/* Content Area */}
            <div className="overflow-y-auto p-4 space-y-3 bg-[#F4F4F5] flex-1">

                {/* MARKET TAB */}
                {activeTab === 'market' && (
                    <>
                        <div className="flex bg-neutral-100 border-b-2 border-black mb-3 sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-1 p-2 w-full justify-center">
                                <TooltipProvider delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-1 cursor-help mr-2 group">
                                                <span className="text-xs font-bold uppercase text-neutral-500 group-hover:text-black transition-colors">Buy Amount:</span>
                                                <div className="w-3 h-3 rounded-full bg-neutral-400 text-white flex items-center justify-center text-[8px] font-bold group-hover:bg-black transition-colors">?</div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent className="bg-neutral-900 text-white border-2 border-black text-xs p-3" side="bottom">
                                            <p className="font-bold mb-1 border-b border-neutral-700 pb-1">Shortcuts</p>
                                            <div className="font-mono text-[10px] space-y-1">
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-neutral-400">Shift</span>
                                                    <span className="text-brand-yellow font-bold">10x</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-neutral-400">Ctrl</span>
                                                    <span className="text-brand-yellow font-bold">100x</span>
                                                </div>
                                                <div className="flex justify-between gap-4">
                                                    <span className="text-neutral-400">Alt + Shift</span>
                                                    <span className="text-brand-yellow font-bold">Custom</span>
                                                </div>
                                            </div>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                                {[1, 10, 100].map((amt) => (
                                    <button
                                        key={amt}
                                        onClick={() => {
                                            setBaseBuyAmount(amt);
                                            setBuyAmount(amt);
                                        }}
                                        className={`px-3 py-1 text-sm font-bold border-2 transition-all ${baseBuyAmount === amt
                                            ? "bg-brand-yellow border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5"
                                            : "bg-white border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600"
                                            }`}
                                    >
                                        {amt}x
                                    </button>
                                ))}
                                {![1, 10, 100].includes(baseBuyAmount) && (
                                    <button
                                        className="px-3 py-1 text-sm font-bold border-2 bg-brand-yellow border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] -translate-y-0.5 ml-2"
                                        onClick={openCustomAmountModal}
                                    >
                                        {baseBuyAmount}x (Custom)
                                    </button>
                                )}
                            </div>
                        </div>
                        {state.upgrades
                            .filter(u => u.category === 'market')
                            .map((upgrade) => {
                                const isLocked = state.lifetimeTrees < (upgrade.unlockThreshold || 0);

                                if (isLocked) {
                                    return (
                                        <div key={upgrade.id} className="w-full bg-neutral-200 border-2 border-neutral-400 p-3 opacity-50 grayscale flex items-center gap-3">
                                            <div className="w-12 h-12 flex-shrink-0 bg-neutral-300 border-2 border-neutral-500 flex items-center justify-center">
                                                <span className="text-2xl">?</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 w-24 bg-neutral-300 rounded mb-2"></div>
                                                <div className="h-3 w-32 bg-neutral-300 rounded"></div>
                                                <div className="mt-2 text-xs font-mono font-bold uppercase text-neutral-500">
                                                    Unlocks at {formatNumber(upgrade.unlockThreshold || 0)} Trees
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }

                                // Calculate Bulk Cost
                                let currentCost = 0;
                                const actualBuyAmount = (upgrade.maxLevel && upgrade.maxLevel === 1) ? 1 : buyAmount;

                                if (actualBuyAmount === 1) {
                                    currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
                                } else {
                                    const firstCost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level);
                                    const geometricFactor = (Math.pow(upgrade.costMultiplier, actualBuyAmount) - 1) / (upgrade.costMultiplier - 1);
                                    currentCost = Math.floor(firstCost * geometricFactor);
                                }

                                const canAfford = state.trees >= currentCost;

                                const currentProductionRate = stats?.itemProductionRates?.[upgrade.id];

                                return (
                                    <UpgradeItem
                                        key={upgrade.id}
                                        upgrade={upgrade}
                                        canAfford={canAfford}
                                        onBuy={buyUpgrade}
                                        currentCost={currentCost}
                                        currencyIcon="/game/leaf_currency.png"
                                        buyAmount={actualBuyAmount}
                                        currentProductionRate={currentProductionRate}
                                    />
                                );
                            })}
                    </>
                )}

                {/* LAB TAB */}
                {activeTab === 'lab' && (
                    <>
                        {/* LAB: ITEM UPGRADES (Click/Multiplier) */}
                        {state.upgrades
                            .filter(u => u.category === 'lab' && !(u.maxLevel && u.level >= u.maxLevel))
                            .sort((a, b) => (a.unlockThreshold || 0) - (b.unlockThreshold || 0))
                            .map((upgrade) => {
                                // Show lab items
                                const isLocked = state.lifetimeTrees < (upgrade.unlockThreshold || 0);
                                if (isLocked) {
                                    // Simplified locked state for Lab or same as Market
                                    return (
                                        <div key={upgrade.id} className="w-full bg-neutral-200 border-2 border-neutral-400 p-3 opacity-50 grayscale flex items-center gap-3">
                                            <div className="w-12 h-12 flex-shrink-0 bg-neutral-300 border-2 border-neutral-500 flex items-center justify-center">
                                                <span className="text-2xl">?</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="mt-2 text-xs font-mono font-bold uppercase text-neutral-500">
                                                    Unlocks at {formatNumber(upgrade.unlockThreshold || 0)} Trees
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                // Lab items usually ignore bulk buy (maxLevel=1), but just in case
                                const actualBuyAmount = (upgrade.maxLevel && upgrade.maxLevel === 1) ? 1 : buyAmount;

                                let currentCost = 0;
                                if (actualBuyAmount === 1) {
                                    currentCost = Math.floor(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
                                } else {
                                    const firstCost = upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level);
                                    const geometricFactor = (Math.pow(upgrade.costMultiplier, actualBuyAmount) - 1) / (upgrade.costMultiplier - 1);
                                    currentCost = Math.floor(firstCost * geometricFactor);
                                }

                                const canAfford = state.trees >= currentCost;
                                return (
                                    <UpgradeItem
                                        key={upgrade.id}
                                        upgrade={upgrade}
                                        canAfford={canAfford}
                                        onBuy={buyUpgrade}
                                        currentCost={currentCost}
                                        currencyIcon="/game/leaf_currency.png"
                                        buyAmount={actualBuyAmount}
                                    />
                                );
                            })}


                    </>
                )}

            </div>

            <CustomAmountModal
                open={showCustomAmountModal}
                onClose={() => setShowCustomAmountModal(false)}
                onConfirm={handleCustomAmountConfirm}
                baseAmount={baseBuyAmount}
                inputValue={customAmountInput}
                onInputChange={setCustomAmountInput}
            />
        </div>
    );
}
