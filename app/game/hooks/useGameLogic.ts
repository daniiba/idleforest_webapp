import {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useRef,
	useState,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { ACHIEVEMENTS, type GoldenAppleType } from "../data";
import { GameState, gameReducer, INITIAL_STATE } from "../reducer";

export function useGameLogic() {
	const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);
	const userIdRef = useRef<string | null>(null);
	const [userDisplayName, setUserDisplayName] = useState<string | null>(null);

	// Offline Welcome State
	const [offlineWelcomeData, setOfflineWelcomeData] = useState<{
		timeAway: number;
		treesEarned: number;
	} | null>(null);

	// Derived Stats - Advanced Calculation with Techs & Lab Multipliers
	const stats = useMemo(() => {
		const upgradeMultipliers: Record<string, number> = {};
		let techGlobalClickMult = 1;
		let techGlobalProductionMult = 1;

		state.upgrades
			.filter((u) => u.type === "multiplier")
			.forEach((labItem) => {
				if (
					labItem.level > 0 &&
					labItem.targetUpgradeId &&
					labItem.multiplierSignal
				) {
					if (labItem.targetUpgradeId === "ALL_GLOBAL") {
						techGlobalProductionMult *=
							1 + labItem.multiplierSignal * labItem.level;
					} else if (labItem.targetUpgradeId === "ALL_CLICK") {
						techGlobalClickMult *= 1 + labItem.multiplierSignal * labItem.level;
					} else {
						const bonus = 1 + labItem.multiplierSignal * labItem.level;
						upgradeMultipliers[labItem.targetUpgradeId] =
							(upgradeMultipliers[labItem.targetUpgradeId] || 1) * bonus;
					}
				}
			});

		const baseClickPercent = 0.05; // Base: 5% of TPS
		let baseAutoTotal = 0;
		const autoBreakdown: Record<string, number> = {};

		state.upgrades.forEach((u) => {
			if (u.level === 0) return;
			const specificMult = upgradeMultipliers[u.id] || 1;
			if (u.autoSignal) {
				const itemProd = u.autoSignal * u.level * specificMult;
				autoBreakdown[u.id] = itemProd;
				baseAutoTotal += itemProd;
			}
		});

		return {
			baseClickPercent,
			baseAutoTotal,
			autoBreakdown,
			techGlobalClickMult,
			techGlobalProductionMult,
			upgradeMultipliers,
		};
	}, [state.upgrades, state.techs]);

	// Final Calculation formula
	const goldenSeedMult = 1 + (state.goldenSeeds || 0) * 0.1;
	const sapMult = 1 + (state.unlockedAchievements?.length || 0) * 0.02;

	const buffsProductionMult = state.activeMultipliers
		.filter((m) => m.type === "production")
		.reduce((acc, curr) => acc * curr.value, 1);

	const buffsClickMult = state.activeMultipliers
		.filter((m) => m.type === "click")
		.reduce((acc, curr) => acc * curr.value, 1);

	const totalProductivityMultiplier =
		stats.techGlobalProductionMult *
		goldenSeedMult *
		sapMult *
		buffsProductionMult;

	const finalAutoProduction = Math.max(
		0,
		stats.baseAutoTotal * totalProductivityMultiplier,
	);

	// Ensure clicking is always at least 1, even with 0 TPS
	const finalClickPower =
		(1 + finalAutoProduction * stats.baseClickPercent) *
		stats.techGlobalClickMult *
		buffsClickMult;

	const finalAutoBreakdown = useMemo(() => {
		const bd: Record<string, number> = {};
		Object.entries(stats.autoBreakdown).forEach(([id, val]) => {
			bd[id] = val * totalProductivityMultiplier;
		});
		return bd;
	}, [stats.autoBreakdown, totalProductivityMultiplier]);

	const itemProductionRates = useMemo(() => {
		const rates: Record<string, number> = {};
		state.upgrades.forEach((u) => {
			if (u.type === "auto" && u.autoSignal) {
				const specificMult = stats.upgradeMultipliers[u.id] || 1;
				rates[u.id] = u.autoSignal * specificMult * totalProductivityMultiplier;
			}
		});
		return rates;
	}, [state.upgrades, stats.upgradeMultipliers, totalProductivityMultiplier]);

	// Save Game Version to force resets when needed
	const CURRENT_SAVE_VERSION = 2;

	// Load Game on Mount
	useEffect(() => {
		const savedSave = localStorage.getItem("idleForestSave");
		if (savedSave) {
			try {
				const parsed = JSON.parse(savedSave);
				if (parsed.version !== CURRENT_SAVE_VERSION) {
					// Force reset to v2, and mark as loaded via reducer
					dispatch({
						type: "LOAD_GAME",
						payload: { version: CURRENT_SAVE_VERSION },
					});
					return;
				}
				dispatch({ type: "LOAD_GAME", payload: parsed });
			} catch {
				// Corrupt save -> reset to v2
				dispatch({
					type: "LOAD_GAME",
					payload: { version: CURRENT_SAVE_VERSION },
				});
			}
		} else {
			// First-time load -> initialize v2 and set loaded: true via reducer
			dispatch({
				type: "LOAD_GAME",
				payload: { version: CURRENT_SAVE_VERSION },
			});
		}
	}, []);

	// Offline Welcome (once after load)
	const hasCheckedOffline = useRef(false);
	useEffect(() => {
		if (!state.loaded || hasCheckedOffline.current) return;
		hasCheckedOffline.current = true;

		const now = Date.now();
		const lastSave = state.lastSaveTime || now;
		const diffMS = now - lastSave;

		if (diffMS > 60000) {
			const diffSeconds = Math.min(diffMS / 1000, 86400); // Max 24h
			const efficiency = 0.5;
			const earned = Math.floor(diffSeconds * finalAutoProduction * efficiency);
			if (earned > 0) {
				setOfflineWelcomeData({ timeAway: diffSeconds, treesEarned: earned });
			}
		}
	}, [state.loaded, state.lastSaveTime, finalAutoProduction]);

	const clearOfflineWelcome = useCallback(() => {
		if (offlineWelcomeData) {
			dispatch({
				type: "ADD_OFFLINE_TREES",
				payload: offlineWelcomeData.treesEarned,
			});
			setOfflineWelcomeData(null);
		}
	}, [offlineWelcomeData]);

	// State Ref for Silent Saving
	const stateRef = useRef(state);
	useEffect(() => {
		stateRef.current = state;
	}, [state]);

	// Save Internal Function (robust)
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
			version: CURRENT_SAVE_VERSION,
		};
		try {
			localStorage.setItem("idleForestSave", JSON.stringify(save));
		} catch (e) {
			// Fallback: try to clear oldest item or just ignore
			console.error("Save failed", e);
		}
	}, []); // No deps, reads from ref

	// Debounced Save on meaningful state changes
	const saveDebounceTimer = useRef<number | null>(null);
	useEffect(() => {
		if (!state.loaded) return;
		if (saveDebounceTimer.current) clearTimeout(saveDebounceTimer.current);
		saveDebounceTimer.current = window.setTimeout(saveInternal, 500);
	}, [
		state.loaded,
		state.trees,
		state.lifetimeTrees,
		state.upgrades,
		state.techs,
		state.goldenSeeds,
		state.prestigeCount,
		state.activeMultipliers,
		state.itemLifetimeProduction,
		saveInternal,
	]);

	useEffect(() => {
		const interval = setInterval(saveInternal, 1000);

		const handleUnload = () => saveInternal();
		window.addEventListener("beforeunload", handleUnload);

		const handleVisibility = () => {
			if (document.visibilityState === "hidden") saveInternal();
		};
		document.addEventListener("visibilitychange", handleVisibility);

		return () => {
			clearInterval(interval);
			window.removeEventListener("beforeunload", handleUnload);
			document.removeEventListener("visibilitychange", handleVisibility);
			saveInternal();
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

			if (rawDt > 0) {
				const breakdownForTick: Record<string, number> = {};
				Object.entries(finalAutoBreakdown).forEach(([id, val]) => {
					breakdownForTick[id] = val * rawDt;
				});

				dispatch({
					type: "AUTO_TICK",
					payload: {
						total: finalAutoProduction * rawDt,
						breakdown: breakdownForTick,
						dt: rawDt,
					},
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
			ACHIEVEMENTS.forEach((ach) => {
				let unlocked = false;
				if (state.unlockedAchievements.includes(ach.id)) return;

				switch (ach.conditionType) {
					case "click_total":
						if (state.stats.totalManualClicks >= ach.threshold) unlocked = true;
						break;
					case "trees_lifetime":
						if (state.lifetimeTrees >= ach.threshold) unlocked = true;
						break;
				}

				if (unlocked) {
					dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: ach.id });
				}
			});
		};
		const interval = setInterval(checkAchievements, 2000);
		return () => clearInterval(interval);
	}, [
		state.stats.totalManualClicks,
		state.lifetimeTrees,
		state.unlockedAchievements,
	]);

	// 2. GOLDEN APPLE SPAWNER
	useEffect(() => {
		if (state.goldenApple.active) return;

		const interval = setInterval(() => {
			const appleMagnetLevel =
				state.prestigeUpgrades?.find((u) => u.id === "apple_magnet")?.level ||
				0;
			const magnetBonus = appleMagnetLevel * 0.2;

			const baseChance =
				(0.01 + Math.min((state.goldenSeeds || 0) * 0.01, 0.25)) *
				(1 + magnetBonus);

			if (Math.random() < baseChance) {
				const type: GoldenAppleType = Math.random() > 0.7 ? "chain" : "frenzy";
				dispatch({
					type: "SPAWN_GOLDEN_APPLE",
					payload: {
						type,
						x: 10 + Math.random() * 80,
						y: 20 + Math.random() * 60,
					},
				});
			}
		}, 10000);
		return () => clearInterval(interval);
	}, [state.goldenApple.active, state.goldenSeeds]);

	// 2.5 GOLDEN APPLE DESPAWNER
	useEffect(() => {
		if (!state.goldenApple.active) return;
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
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				userIdRef.current = user.id;

				const { data: profile } = await supabase
					.from("profiles")
					.select("display_name")
					.eq("user_id", user.id)
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

		if (!userId || !currentState.loaded) return;

		try {
			const supabase = createClient();
			await supabase.from("game_rankings").upsert({
				user_id: userId,
				display_name: userDisplayName || "Anonymous Planter",
				lifetime_trees: Math.floor(currentState.lifetimeTrees),
				updated_at: new Date().toISOString(),
			});
		} catch (e) {
			console.error("Failed to save score to leaderboard", e);
		}
	}, [userDisplayName]);

	// Periodic Save Leaderboard
	useEffect(() => {
		const interval = setInterval(saveScoreInternal, 60000);
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
			itemProductionRates,
		},
		actions: {
			clickTree,
			buyUpgrade,
			buyTech,
			doPrestige,
			buyPrestigeUpgrade: (id: string) =>
				dispatch({ type: "BUY_PRESTIGE_UPGRADE", payload: id }),
			saveScore: saveScoreInternal,
			clearOfflineWelcome,
			clickGoldenApple,
		},
		userDisplayName,
		offlineWelcomeData,
	};
}
