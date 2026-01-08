"use client";

import { useState } from "react";
import Navigation from "@/components/navigation";
import { useGameLogic } from "./hooks/useGameLogic";
import { GameHeader } from "./components/GameHeader";
import { NewsTicker } from "./components/NewsTicker";
import { GameViewport } from "./components/GameViewport";
import { InventoryShelf } from "./components/InventoryShelf";
import { GameControls } from "./components/GameControls";
import { PrestigeModal } from "./components/PrestigeModal";
import { LeaderboardModal } from "./components/LeaderboardModal";
import { WelcomeBackModal } from "./components/WelcomeBackModal";
import { StatsModal } from "./components/StatsModal";

export default function IdleForestGame() {
    const { state, stats, actions, offlineWelcomeData, userDisplayName } = useGameLogic();
    const [showPrestigeModal, setShowPrestigeModal] = useState(false);
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [showStatsModal, setShowStatsModal] = useState(false);

    const handlePrestigeClick = () => {
        // We save score in the logic hook periodically, but we might want to trigger a save before prestige?
        // Logic hook 'doPrestige' handles the state reset.
        // If we want to save *before* reset, we might need to expose saveScore.
        actions.saveScore();
        actions.doPrestige();
        setShowPrestigeModal(false);
    };

    return (
        <div className="min-h-screen bg-brand-gray pt-0 pb-12 font-rethink-sans text-black overflow-x-hidden relative">
            <Navigation />

            {/* News Ticker positioned below the 96px (h-24) Navigation */}
            <div className="fixed top-24 left-0 right-0 z-40 pointer-events-none">
                <div className="pointer-events-auto">
                    <NewsTicker gameState={state} />
                </div>
            </div>

            {/* Spacer for fixed header (Nav + Ticker) */}
            {/* Nav (h-24/96px) + Ticker (h-10/40px) = 136px ~ h-34 */}
            <div className="h-36"></div>

            <div className="container mx-auto px-4 max-w-7xl pt-4">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Game Viewport */}
                    <div className="lg:col-span-8 flex flex-col gap-8">

                        <GameHeader
                            startTime={state.startTime}
                            onOpenLeaderboard={() => setShowLeaderboardModal(true)}
                            onOpenStats={() => setShowStatsModal(true)}
                        />

                        <GameViewport
                            state={state}
                            stats={stats}
                            onTreeClick={actions.clickTree}
                            handlePrestigeClick={() => setShowPrestigeModal(true)}
                            showPrestigeModal={showPrestigeModal}
                            userDisplayName={userDisplayName}
                            goldenAppleState={state.goldenApple}
                            onAppleClick={actions.clickGoldenApple}
                        >
                            <LeaderboardModal
                                open={showLeaderboardModal}
                                onClose={() => setShowLeaderboardModal(false)}
                            // We don't have direct access to userId in state, but logic hook
                            // handles saving. For highlighting, we might need to expose it 
                            // or the auth user from hook. For now, skipping highlight or 
                            // we can verify if useGameLogic exposes user info.
                            />
                            {offlineWelcomeData && (
                                <WelcomeBackModal
                                    open={!!offlineWelcomeData}
                                    onClose={actions.clearOfflineWelcome}
                                    timeAway={offlineWelcomeData.timeAway}
                                    treesEarned={offlineWelcomeData.treesEarned}
                                />
                            )}
                        </GameViewport>

                        <PrestigeModal
                            open={showPrestigeModal}
                            onClose={() => setShowPrestigeModal(false)}
                            onPrestige={handlePrestigeClick}
                            onBuyUpgrade={actions.buyPrestigeUpgrade}
                            state={state}
                        />

                        <StatsModal
                            isOpen={showStatsModal}
                            onClose={() => setShowStatsModal(false)}
                            stats={state.stats}
                            lifetimeTrees={state.lifetimeTrees}
                            unlockedAchievements={state.unlockedAchievements}
                        />

                        <InventoryShelf
                            state={state}
                            finalAutoBreakdown={stats.finalAutoBreakdown}
                            finalAutoProduction={stats.finalAutoProduction}
                        />

                    </div>

                    {/* Right Column: Shop & Lab */}
                    <div className="lg:col-span-4">
                        <GameControls
                            state={state}
                            stats={stats}
                            buyUpgrade={actions.buyUpgrade}
                            buyTech={actions.buyTech}
                            openPrestigeModal={() => setShowPrestigeModal(true)}
                        />
                    </div>

                </div>
            </div>

            <style jsx global>{`
                .pixelated { image-rendering: pixelated; }
                .text-stroke-thin { -webkit-text-stroke: 1px black; }
                /* Custom Scrollbar for Shop */
                ::-webkit-scrollbar { width: 6px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #000; border-radius: 0; }
                ::-webkit-scrollbar-thumb:hover { background: #333; }
            `}</style>
        </div >
    );
}
