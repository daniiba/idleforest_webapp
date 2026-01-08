import { useReducer, useEffect, useCallback, useMemo, useRef, useState } from "react";
import { gameReducer, INITIAL_STATE, GameState } from "../reducer";
import { ACHIEVEMENTS, GoldenAppleType } from "../data";


import { createClient } from "@/lib/supabase/client";

export function useGameLogic() {
    const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
    const userIdRef = useRef<string | null>(null);
    const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

    // Offline Welcome State
    const [offlineWelcomeData, setOfflineWelcomeData] = useState<{ timeAway: number; treesEarned: number } | null>(null);

    // Derived Stats - Advanced Calculation with Techs & Lab Multipliers
    const stats = useMemo(() => {
        // 1. Calculate Multipliers per Upgrade Type from Lab Items (Merged)
        const upgradeMultipliers: Record<string, number> = {};
        let techGlobalClickMult = 1;
        let techGlobalProductionMult = 1;

        // Process Lab Items (Targeted Multipliers)
        state.upgrades.filter(u => u.type === 'multiplier').forEach(labItem => {
            if (labItem.level > 0 && labItem.targetUpgradeId && labItem.multiplierSignal) {
                // Check for Global Multipliers first
                if (labItem.targetUpgradeId === 'ALL_GLOBAL') {
                    // Additive Multiplier Logic: 1 + (signal * level)
                    // If signal is 1 (100%), then Lvl 1 = x2, Lvl 2 = x3
                    // If signal is 0.5 (50%), then Lvl 1 = x1.5
                    techGlobalProductionMult *= (1 + (labItem.multiplierSignal * labItem.level));
                } else if (labItem.targetUpgradeId === 'ALL_CLICK') {
                    techGlobalClickMult *= (1 + (labItem.multiplierSignal * labItem.level));
                } else {
                    // Additive Multiplier Logic for specific items: 1 + (signal * level)
                    const bonus = 1 + (labItem.multiplierSignal * labItem.level);
                    upgradeMultipliers[labItem.targetUpgradeId] = (upgradeMultipliers[labItem.targetUpgradeId] || 1) * bonus;
                }
            }
        });

        // 2. Sum up totals from Items
        const baseClickPercent = 0.05; // Base: 5% of TPS
        let baseAutoTotal = 0;
        const autoBreakdown: Record<string, number> = {};

        state.upgrades.forEach(u => {
            if (u.level === 0) return;

            // Check for specific multiplier for this upgrade
            const specificMult = upgradeMultipliers[u.id] || 1;

            if (u.autoSignal) {
                const itemProd = (u.autoSignal * u.level) * specificMult;
                autoBreakdown[u.id] = itemProd;
                baseAutoTotal += itemProd;
            }
        });

        // 3. Return generic stats structure
        return {
            baseClickPercent,
            baseAutoTotal,
            autoBreakdown, // Per-item production/sec
            techGlobalClickMult,
            techGlobalProductionMult,
            upgradeMultipliers
        };
    }, [state.upgrades, state.techs]);

    // Final Calculation formula
    // Seeds Multiplier: 10% per seed
    const goldenSeedMult = 1 + ((state.goldenSeeds || 0) * 0.10);

    // Sap Multiplier (Achievements): 2% per achievement (Rebalanced from 4%)
    const sapMult = 1 + ((state.unlockedAchievements?.length || 0) * 0.02);

    // Active Buffs Multipliers (Golden Apples / Spells)
    const buffsProductionMult = state.activeMultipliers
        .filter(m => m.type === 'production')
        .reduce((acc, curr) => acc * curr.value, 1);

    const buffsClickMult = state.activeMultipliers
        .filter(m => m.type === 'click')
        .reduce((acc, curr) => acc * curr.value, 1);

    // Productivity = TechGlobal * SeedMult * SapMult * Buffs
    const totalProductivityMultiplier = stats.techGlobalProductionMult * goldenSeedMult * sapMult * buffsProductionMult;

    // Auto: (Items) * Productivity
    const finalAutoProduction = Math.max(0, stats.baseAutoTotal * totalProductivityMultiplier);

    // Click Power: Base 1 + (TPS * 5%) * ClickTechs * Buffs
    // Ensure clicking is always at least 1, even with 0 TPS
    const finalClickPower = ((1 + (finalAutoProduction * stats.baseClickPercent)) * stats.techGlobalClickMult) * buffsClickMult;

    // Final Breakdown including Global Multipliers
    const finalAutoBreakdown = useMemo(() => {
        const bd: Record<string, number> = {};
        Object.entries(stats.autoBreakdown).forEach(([id, val]) => {
            bd[id] = val * totalProductivityMultiplier;
        });
        return bd;
    }, [stats.autoBreakdown, totalProductivityMultiplier]);

    // Calculate per-item single unit production for UI display
    // This answers: "How much does ONE of these items produce right now?"
    const itemProductionRates = useMemo(() => {
        const rates: Record<string, number> = {};

        state.upgrades.forEach(u => {
            if (u.type === 'auto' && u.autoSignal) {
                // Formula: Base * SpecificMultiplier * GlobalProductivity
                const specificMult = stats.upgradeMultipliers[u.id] || 1;
                rates[u.id] = (u.autoSignal * specificMult) * totalProductivityMultiplier;
            }
        });
        return rates;
    }, [state.upgrades, stats.upgradeMultipliers, totalProductivityMultiplier]);


    // Save Game Version to force resets when needed
    const CURRENT_SAVE_VERSION = 1;

    // Load Game on Mount
    useEffect(() => {
        const savedSave = localStorage.getItem("idleForestSave");
        if (savedSave) {
            try {
                const parsed = JSON.parse(savedSave);

                // VERSION CHECK: If version doesn't match, we ignore the save (wipe)
                if (parsed.version !== CURRENT_SAVE_VERSION) {
                    console.warn("Save version mismatch or missing. Resetting game state.");
                    dispatch({ type: "LOAD_GAME", payload: {} });
                    return;
                }

                dispatch({ type: "LOAD_GAME", payload: parsed });
            } catch (e) {
                console.error("Failed to load save", e);
                dispatch({ type: "LOAD_GAME", payload: {} });
            }
        } else {
            dispatch({ type: "LOAD_GAME", payload: {} });
        }
    }, []);



    // Actually, let's do the check inside a ref-guarded effect or just once.
    const hasCheckedOffline = useRef(false);
    useEffect(() => {
        if (!state.loaded || hasCheckedOffline.current) return;

        hasCheckedOffline.current = true;

        const now = Date.now();
        const lastSave = state.lastSaveTime || now;
        const diffMS = now - lastSave;

        console.log("OFFLINE CHECK:", {
            loaded: state.loaded,
            lastSave,
            now,
            diffSeconds: diffMS / 1000,
            hasChecked: hasCheckedOffline.current
        });

        // Minimum 60 seconds to count as offline
        if (diffMS > 60000) {
            const diffSeconds = Math.min(diffMS / 1000, 86400); // Max 24h

            // Efficiency: 50%
            const efficiency = 0.5;

            // We need the *current* production rate. 
            // Note: stats.finalAutoProduction is derived from current state.
            // Ideally we'd know the production rate *when they left*, but using current is standard for MVPs.

            const earned = Math.floor(diffSeconds * finalAutoProduction * efficiency);

            if (earned > 0) {
                setOfflineWelcomeData({
                    timeAway: diffSeconds,
                    treesEarned: earned
                });
            }
        }
    }, [state.loaded, state.lastSaveTime, finalAutoProduction]);

    const clearOfflineWelcome = useCallback(() => {
        if (offlineWelcomeData) {
            dispatch({ type: "ADD_OFFLINE_TREES", payload: offlineWelcomeData.treesEarned });
            setOfflineWelcomeData(null);
        }
    }, [offlineWelcomeData]);

    // State Ref for Silent Saving
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    // Save Internal Function
    const saveInternal = useCallback(() => {
        const currentState = stateRef.current;
        if (!currentState.loaded) return;

        const save = {
            trees: currentState.trees,
            lifetimeTrees: currentState.lifetimeTrees,
            upgrades: currentState.upgrades,
            itemLifetimeProduction: currentState.itemLifetimeProduction,
            techs: currentState.techs,
            goldenSeeds: currentState.goldenSeeds,
            prestigeCount: currentState.prestigeCount,
            startTime: currentState.startTime,
            lastSaveTime: Date.now(),
            lastSave: Date.now(),
            stats: currentState.stats,
            version: CURRENT_SAVE_VERSION
        };
        localStorage.setItem("idleForestSave", JSON.stringify(save));
    }, []); // No deps, reads from ref

    // Periodic Save (Every 10s)
    useEffect(() => {
        const interval = setInterval(() => {
            saveInternal();
        }, 10000);

        // Also save on unmount/reload
        const handleUnload = () => saveInternal();
        window.addEventListener('beforeunload', handleUnload);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeunload', handleUnload);
            saveInternal(); // Final save on component unmount
        };
    }, [saveInternal]);

    // Game Loop (rAF)
    useEffect(() => {
        if (finalAutoProduction === 0) return;

        let lastTime = Date.now();
        let frameId: number;

        const loop = () => {
            const now = Date.now();
            const rawDt = (now - lastTime) / 1000;
            lastTime = now;

            // If dt is very large (> 60s), treat as offline time (Suspend/Resume case)
            if (rawDt > 0) {
                // Normal loop behavior - treat even large gaps (tab throttle/sleep) as active play
                // This prevents "Welcome Back" modal from popping up when just tabbing out
                const breakdownForTick: Record<string, number> = {};
                Object.entries(finalAutoBreakdown).forEach(([id, val]) => {
                    breakdownForTick[id] = val * rawDt;
                });

                dispatch({
                    type: "AUTO_TICK",
                    payload: {
                        total: finalAutoProduction * rawDt,
                        breakdown: breakdownForTick,
                        dt: rawDt // Pass delta time in seconds
                    }
                });
            }
            frameId = requestAnimationFrame(loop);
        };

        frameId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(frameId);
    }, [finalAutoProduction, finalAutoBreakdown]);


    // Action Handlers
    const clickTree = useCallback(() => {
        dispatch({ type: "CLICK_TREE", payload: finalClickPower });
    }, [finalClickPower]);

    const buyUpgrade = useCallback((upgradeId: string, amount: number) => {
        dispatch({ type: "BUY_UPGRADE", payload: { id: upgradeId, amount } });
    }, []);

    const buyTech = useCallback((techId: string) => {
        dispatch({ type: "BUY_TECH", payload: techId });
    }, []);

    const doPrestige = useCallback(() => {
        dispatch({ type: "PRESTIGE", payload: null });
    }, []);

    const clickGoldenApple = useCallback(() => {
        dispatch({ type: "CLICK_GOLDEN_APPLE", payload: null });
    }, []);

    // --- SYSTEMS ---

    // 1. ACHIVEMENT CHECKER
    useEffect(() => {
        const checkAchievements = () => {
            ACHIEVEMENTS.forEach(ach => {
                let unlocked = false;
                if (state.unlockedAchievements.includes(ach.id)) return;

                switch (ach.conditionType) {
                    case 'click_total':
                        if (state.stats.totalManualClicks >= ach.threshold) unlocked = true;
                        break;
                    case 'trees_lifetime':
                        if (state.lifetimeTrees >= ach.threshold) unlocked = true;
                        break;
                    // Add other types as needed
                }

                if (unlocked) {
                    dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: ach.id });
                }
            });
        };
        // Check every 2s to save perf
        const interval = setInterval(checkAchievements, 2000);
        return () => clearInterval(interval);
    }, [state.stats.totalManualClicks, state.lifetimeTrees, state.unlockedAchievements]);

    // 2. GOLDEN APPLE SPAWNER
    useEffect(() => {
        if (state.goldenApple.active) return;

        // Spawn chance check every 10s
        // 5% chance every 10s -> roughly every 3-4 mins
        const interval = setInterval(() => {
            // SCALING: Base 1% + 1% per Golden Seed (Cap at 30% total)
            const appleMagnetLevel = state.prestigeUpgrades?.find(u => u.id === 'apple_magnet')?.level || 0;
            const magnetBonus = appleMagnetLevel * 0.2; // 20% MORE frequent per level (additive to base rate? or multiplier to chance?)
            // Description said "20% more often". Let's interpret as 1.2x chance multiplier.

            let baseChance = 0.01 + Math.min((state.goldenSeeds || 0) * 0.01, 0.25);
            baseChance = baseChance * (1 + magnetBonus);

            const chance = baseChance;

            if (Math.random() < chance) {
                // Spawn!
                const typeRoll = Math.random();
                let type: GoldenAppleType = 'frenzy';
                if (typeRoll > 0.7) type = 'chain'; // 30% chance for Chain/Click Frenzy

                dispatch({
                    type: "SPAWN_GOLDEN_APPLE",
                    payload: {
                        type,
                        x: 10 + Math.random() * 80, // 10-90%
                        y: 20 + Math.random() * 60  // 20-80%
                    }
                });
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [state.goldenApple.active, state.goldenSeeds]);

    // 2.5 GOLDEN APPLE DESPAWNER
    useEffect(() => {
        if (!state.goldenApple.active) return;

        // Life duration: 20s (matches animation duration)
        const timer = setTimeout(() => {
            dispatch({ type: "DESPAWN_GOLDEN_APPLE", payload: null });
        }, 20000);

        return () => clearTimeout(timer);
    }, [state.goldenApple.active]);

    // 3. BUFF EXPIRATION CHECKER
    useEffect(() => {
        if (state.activeMultipliers.length === 0) return;
        const interval = setInterval(() => {
            dispatch({ type: "REMOVE_EXPIRED_EFFECTS", payload: Date.now() });
        }, 1000);
        return () => clearInterval(interval);
    }, [state.activeMultipliers.length]);

    // Leaderboard Integration 
    useEffect(() => {
        const checkUser = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                userIdRef.current = user.id;

                // Try to get from profiles first
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('display_name')
                    .eq('user_id', user.id)
                    .single();

                if (profile && profile.display_name) {
                    setUserDisplayName(profile.display_name);
                } else if (user.user_metadata?.display_name) {
                    setUserDisplayName(user.user_metadata.display_name);
                }
            }
        };
        checkUser();
    }, []);

    // Leaderboard Save Internal (Reads from Ref)
    const saveScoreInternal = useCallback(async () => {
        const userId = userIdRef.current;
        const currentState = stateRef.current;

        if (!userId) return;
        if (!currentState.loaded) return;

        try {
            const supabase = createClient();
            await supabase
                .from('game_rankings')
                .upsert({
                    user_id: userId,
                    display_name: userDisplayName || 'Anonymous Planter',
                    lifetime_trees: Math.floor(currentState.lifetimeTrees),
                    updated_at: new Date().toISOString()
                });

        } catch (e) {
            console.error("Failed to save score to leaderboard", e);
        }
    }, [userDisplayName]); // userDisplayName changes rarely

    // Periodic Save Leaderboard
    useEffect(() => {
        const interval = setInterval(() => {
            saveScoreInternal();
        }, 60000);
        return () => clearInterval(interval);
    }, [saveScoreInternal]);

    return {
        state,
        stats: {
            baseClickPercent: stats.baseClickPercent,
            techGlobalClickMult: stats.techGlobalClickMult,
            finalAutoProduction,
            finalClickPower,
            finalAutoBreakdown,
            itemProductionRates
        },
        actions: {
            clickTree,
            buyUpgrade,
            buyTech,
            doPrestige,
            buyPrestigeUpgrade: (id: string) => dispatch({ type: "BUY_PRESTIGE_UPGRADE", payload: id }),
            saveScore: saveScoreInternal,
            clearOfflineWelcome,
            clickGoldenApple
        },
        userDisplayName,
        offlineWelcomeData
    };
}

