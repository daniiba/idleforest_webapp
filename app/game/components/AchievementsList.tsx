import React from 'react';
import { ACHIEVEMENTS } from '../data';
import { cn } from "@/lib/utils";

interface AchievementsListProps {
    unlockedAchievements: string[];
}

export function AchievementsList({ unlockedAchievements }: AchievementsListProps) {
    // Sort: Unlocked first, then by ID or threshold
    const sorted = [...ACHIEVEMENTS].sort((a, b) => {
        const aUnlocked = unlockedAchievements.includes(a.id);
        const bUnlocked = unlockedAchievements.includes(b.id);
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
    });

    const sapBonus = unlockedAchievements.length * 2; // 2% per achievement

    return (
        <div className="flex flex-col gap-4">
            <div className="bg-brand-light p-4 rounded-xl border-2 border-black pixelated relative overflow-hidden">
                <div className="flex justify-between items-center relative z-10">
                    <h3 className="font-bold text-xl uppercase">Sap Multiplier</h3>
                    <span className="text-2xl font-black text-brand-green">+{sapBonus}%</span>
                </div>
                <p className="text-sm text-gray-600 relative z-10">
                    Each unlocked achievement grants <b className="text-brand-green">+2%</b> global production bonus.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {sorted.map(ach => {
                    const isUnlocked = unlockedAchievements.includes(ach.id);
                    return (
                        <div
                            key={ach.id}
                            className={cn(
                                "flex items-center gap-3 p-3 border-2 border-black rounded-lg transition-all",
                                isUnlocked ? "bg-white shadow-[4px_4px_0px_rgba(0,0,0,0.1)]" : "bg-gray-200 opacity-60 grayscale"
                            )}
                        >
                            <div className="text-3xl select-none">
                                {isUnlocked ? ach.icon : '🔒'}
                            </div>
                            <div>
                                <h4 className="font-bold text-sm uppercase">{ach.name}</h4>
                                <p className="text-xs text-gray-600 line-clamp-2">{ach.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #000; border-radius: 4px; }
            `}</style>
        </div>
    );
}
