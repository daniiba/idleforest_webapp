import { motion, AnimatePresence } from "framer-motion";
import { GameState } from "../reducer";
import { PRESTIGE_ITEMS, PrestigeUpgrade } from "../data";
import { useState } from "react";
import { Lock, Zap, ArrowUp, Loader2 } from "lucide-react";

interface PrestigeModalProps {
    open: boolean;
    onClose: () => void;
    onPrestige: () => void;
    onBuyUpgrade: (id: string) => void;
    state: GameState;
}

export function PrestigeModal({ open, onClose, onPrestige, onBuyUpgrade, state }: PrestigeModalProps) {
    const [activeTab, setActiveTab] = useState<'reset' | 'shop'>('reset');

    if (!open) return null;

    // Helper to get current level of an upgrade from state
    const getLevel = (id: string) => {
        return state.prestigeUpgrades?.find(u => u.id === id)?.level || 0;
    };

    return (
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 text-left"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-neutral-900 border-4 border-amber-600 text-white max-w-lg w-full shadow-[0_0_50px_rgba(217,119,6,0.2)] flex flex-col max-h-[90vh]"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header Tabs */}
                    <div className="flex border-b border-amber-600/50">
                        <button
                            onClick={() => setActiveTab('reset')}
                            className={`flex-1 py-4 font-candu tracking-widest uppercase transition-colors ${activeTab === 'reset' ? 'bg-amber-600 text-white' : 'bg-transparent text-neutral-500 hover:text-white'
                                }`}
                        >
                            Forest Fire
                        </button>
                        <button
                            onClick={() => setActiveTab('shop')}
                            className={`flex-1 py-4 font-candu tracking-widest uppercase transition-colors ${activeTab === 'shop' ? 'bg-amber-600 text-white' : 'bg-transparent text-neutral-500 hover:text-white'
                                }`}
                        >
                            Evolution
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 flex-1 overflow-y-auto">
                        {activeTab === 'reset' ? (
                            <div className="text-center">
                                <h2 className="text-3xl font-candu text-red-500 uppercase tracking-widest mb-2">Ignite Forest</h2>
                                <p className="text-sm text-neutral-400 mb-6">
                                    Burn your forest to the ground. The ash will enrich the soil for your next generation.
                                </p>

                                <div className="bg-neutral-800 p-4 rounded mb-6 border border-neutral-700">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-neutral-400 text-xs uppercase" title="Current trees in your bank">Current Trees</span>
                                        <span className="font-mono font-bold">
                                            {Math.floor(state.trees).toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-neutral-400 text-xs uppercase">Seeds Owned</span>
                                        <span className="font-bold text-amber-400">{state.goldenSeeds || 0}</span>
                                    </div>

                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-neutral-400 text-xs uppercase">Claimable</span>
                                        <span className="font-bold text-green-400 flex items-center gap-1">
                                            <span className="text-lg">🌰</span>
                                            {(() => {
                                                const currentTrees = state.trees;
                                                const existingSeeds = state.goldenSeeds || 0;
                                                const claimable = Math.max(0, Math.floor(Math.sqrt((currentTrees / 1000000) + Math.pow(existingSeeds, 2)) - existingSeeds));
                                                return claimable;
                                            })()}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-neutral-500 mt-2">
                                        {(() => {
                                            const currentSeeds = state.goldenSeeds || 0;
                                            const claimable = Math.max(0, Math.floor(Math.sqrt((state.trees / 1000000) + Math.pow(currentSeeds, 2)) - currentSeeds));
                                            const targetSeedCount = currentSeeds + claimable + 1;
                                            const requiredBank = (Math.pow(targetSeedCount, 2) - Math.pow(currentSeeds, 2)) * 1000000;
                                            return `Next seed at: ${requiredBank.toLocaleString()} trees in bank`;
                                        })()}
                                    </div>
                                </div>

                                <button
                                    onClick={onPrestige}
                                    disabled={(() => {
                                        const currentTrees = state.trees;
                                        const existingSeeds = state.goldenSeeds || 0;
                                        const claimable = Math.floor(Math.sqrt((currentTrees / 1000000) + Math.pow(existingSeeds, 2)) - existingSeeds);
                                        return claimable <= 0;
                                    })()}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 uppercase tracking-widest border-2 border-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                                >
                                    {(() => {
                                        const currentTrees = state.trees;
                                        const existingSeeds = state.goldenSeeds || 0;
                                        const claimable = Math.floor(Math.sqrt((currentTrees / 1000000) + Math.pow(existingSeeds, 2)) - existingSeeds);
                                        return claimable > 0 ? "Ignite Forest" : "Need more trees";
                                    })()}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="bg-neutral-800/50 p-2 rounded mb-4 text-center border border-neutral-700 sticky top-0 backdrop-blur-md z-10">
                                    <span className="text-neutral-400 text-xs uppercase mr-2">Available Seeds:</span>
                                    <span className="font-bold text-amber-400 text-xl">{state.goldenSeeds || 0} 🌰</span>
                                </div>

                                {PRESTIGE_ITEMS.map((item) => {
                                    const currentLevel = getLevel(item.id);
                                    const isMaxed = currentLevel >= item.maxLevel;
                                    const canAfford = state.goldenSeeds >= item.cost;

                                    return (
                                        <div key={item.id} className="bg-neutral-800 border border-neutral-700 p-4 rounded flex items-start gap-4 hover:border-amber-600/30 transition-colors">
                                            <div className="w-12 h-12 bg-black rounded border border-neutral-600 flex items-center justify-center text-2xl shrink-0">
                                                <img
                                                    src={item.iconPath}
                                                    alt={item.name}
                                                    className="w-8 h-8 object-contain pixelated"
                                                    onError={(e) => {
                                                        // Fallback if image fails
                                                        (e.target as HTMLImageElement).style.display = 'none';
                                                        (e.target as HTMLImageElement).parentElement!.innerText = "🧬";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-bold text-amber-500">{item.name}</h3>
                                                    <span className="text-xs text-neutral-500">Lvl {currentLevel} / {item.maxLevel}</span>
                                                </div>
                                                <p className="text-xs text-neutral-300 my-1">{item.description}</p>

                                                {!isMaxed ? (
                                                    <button
                                                        onClick={() => onBuyUpgrade(item.id)}
                                                        disabled={!canAfford}
                                                        className={`mt-2 text-xs py-1 px-3 rounded font-bold uppercase tracking-wider transition-colors flex items-center gap-1
                                                            ${canAfford
                                                                ? "bg-amber-600 hover:bg-amber-500 text-white"
                                                                : "bg-neutral-700 text-neutral-500 cursor-not-allowed"
                                                            }`}
                                                    >
                                                        Buy for {item.cost} 🌰
                                                    </button>
                                                ) : (
                                                    <div className="mt-2 text-xs py-1 px-3 bg-green-900/30 text-green-500 border border-green-900 rounded inline-block font-bold">
                                                        MAXED
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-neutral-800">
                        <button
                            onClick={onClose}
                            className="w-full bg-transparent hover:bg-white/10 text-neutral-400 font-bold py-2 text-xs uppercase rounded"
                        >
                            Close Modal
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
