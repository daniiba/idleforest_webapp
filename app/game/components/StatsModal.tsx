import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MousePointer2, TreePine, Award } from "lucide-react";
import { GameState } from "../reducer";
import { AchievementsList } from "./AchievementsList";
import { cn } from "@/lib/utils";

interface StatsModalProps {
    isOpen: boolean;
    onClose: () => void;
    stats: GameState['stats'];
    lifetimeTrees: number;
    unlockedAchievements: string[];
}

export function StatsModal({ isOpen, onClose, stats, lifetimeTrees, unlockedAchievements }: StatsModalProps) {
    const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
    // Format seconds into "12d 5h 30m"
    const formatTime = (seconds: number) => {
        if (!seconds) return "0s";

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (parts.length === 0) return "< 1m";

        return parts.join(" ");
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                {/* Backdrop - Removed blur, just dimming */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/50"
                />

                {/* Modal Content - Branded */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="w-full max-w-sm bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative z-10"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b-2 border-black bg-neutral-100">
                        <h2 className="text-2xl font-candu uppercase tracking-widest flex items-center gap-2">
                            <span>📊</span> Statistics
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-black/10 transition-colors border-2 border-transparent hover:border-black"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b-2 border-black bg-white">
                        <button
                            onClick={() => setActiveTab('stats')}
                            className={cn(
                                "flex-1 p-3 font-bold text-sm uppercase tracking-wider transition-colors",
                                activeTab === 'stats' ? "bg-brand-yellow/30" : "hover:bg-gray-100"
                            )}
                        >
                            Statistics
                        </button>
                        <button
                            onClick={() => setActiveTab('achievements')}
                            className={cn(
                                "flex-1 p-3 font-bold text-sm uppercase tracking-wider transition-colors flex items-center justify-center gap-2",
                                activeTab === 'achievements' ? "bg-brand-yellow/30" : "hover:bg-gray-100"
                            )}
                        >
                            <Award className="w-4 h-4" />
                            Achievements
                        </button>
                    </div>

                    {/* Content */}
                    {activeTab === 'stats' ? (
                        <div className="p-6 space-y-4">

                            {/* Time Played */}
                            <div className="flex items-center justify-between p-4 bg-blue-50 border-2 border-black shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-200 border border-black">
                                        <Clock className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="font-bold text-sm uppercase tracking-wide">Time Played</div>
                                </div>
                                <div className="text-xl font-mono font-bold">
                                    {formatTime(stats?.totalPlayTime || 0)}
                                </div>
                            </div>

                            {/* Manual Clicks */}
                            <div className="flex items-center justify-between p-4 bg-yellow-50 border-2 border-black shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-brand-yellow border border-black">
                                        <MousePointer2 className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="font-bold text-sm uppercase tracking-wide">Manual Clicks</div>
                                </div>
                                <div className="text-xl font-mono font-bold">
                                    {(stats?.totalManualClicks || 0).toLocaleString()}
                                </div>
                            </div>

                            {/* Lifetime Trees */}
                            <div className="flex items-center justify-between p-4 bg-green-50 border-2 border-black shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-200 border border-black">
                                        <TreePine className="w-5 h-5 text-black" />
                                    </div>
                                    <div className="font-bold text-sm uppercase tracking-wide">Lifetime Trees</div>
                                </div>
                                <div className="text-xl font-mono font-bold">
                                    {Math.floor(lifetimeTrees).toLocaleString()}
                                </div>
                            </div>

                            <div className="text-[10px] text-center text-neutral-500 pt-4 font-mono uppercase tracking-widest">
                                * Statistics track overall progress across all prestiges
                            </div>
                        </div>

                    ) : (
                        <div className="p-6">
                            <AchievementsList unlockedAchievements={unlockedAchievements} />
                        </div>
                    )}
                </motion.div>
            </div >
        </AnimatePresence >
    );
}
