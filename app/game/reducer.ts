import { ToggleLeft } from "lucide-react";
import { Upgrade, INITIAL_UPGRADES, GoldenAppleState, ActiveMultiplier, GoldenAppleType, PRESTIGE_ITEMS, PrestigeUpgrade } from "./data";

export interface GameState {
    trees: number;
    lifetimeTrees: number;
    prestigeCount: number; // How many times prestiged
    goldenSeeds: number; // Prestige Currency
    upgrades: Upgrade[];
    itemLifetimeProduction: Record<string, number>; // New: Track production per item type
    techs: string[]; // List of unlocked tech IDs
    unlockedAchievements: string[]; // List of unlocked achievement IDs
    goldenApple: GoldenAppleState; // Current active event
    activeMultipliers: ActiveMultiplier[]; // Temporary buffs
    prestigeUpgrades: PrestigeUpgrade[]; // New: Permanent enhancements
    loaded: boolean;
    startTime: number;
    lastSaveTime: number; // For offline production calculation
    stats: {
        totalManualClicks: number;
        totalTreesProduced: number;
        totalPlayTime: number; // in seconds
    };
    version: number; // For state migrations and resets
}

export type GameAction =
    | { type: "LOAD_GAME"; payload: Partial<GameState> | any }
    | { type: "CLICK_TREE"; payload: number }
    | { type: "AUTO_TICK"; payload: { total: number, breakdown: Record<string, number>, dt?: number } } // Updated payload
    | { type: "BUY_UPGRADE"; payload: { id: string, amount: number } }
    | { type: "BUY_TECH"; payload: string }
    | { type: "PRESTIGE"; payload: null }
    | { type: "BUY_PRESTIGE_UPGRADE"; payload: string } // payload is Upgrade ID
    | { type: "ADD_OFFLINE_TREES"; payload: number }
    | { type: "UNLOCK_ACHIEVEMENT"; payload: string }
    | { type: "SPAWN_GOLDEN_APPLE"; payload: { type: GoldenAppleType, x: number, y: number } }
    | { type: "CLICK_GOLDEN_APPLE"; payload: null }
    | { type: "DESPAWN_GOLDEN_APPLE"; payload: null }
    | { type: "REMOVE_EXPIRED_EFFECTS"; payload: number }; // payload is current time

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case "LOAD_GAME":
            // Merge initial upgrades structure with saved levels to ensure new upgrades appear
            // FORCE RESET if version mismatch
            // This is the "migration" to v2: Clear everything.
            if (action.payload.version !== 2) {
                return INITIAL_STATE;
            }

            // Standard Load for v2+
            let mergedUpgrades = state.upgrades;
            if (action.payload.upgrades) {
                mergedUpgrades = INITIAL_UPGRADES.map(init => {
                    // 1. Try to find existing upgrade state
                    const saved = action.payload.upgrades?.find((u: Upgrade) => u.id === init.id);
                    if (saved) return { ...init, level: saved.level };
                    return init;
                });
            }
            return {
                ...state,
                ...action.payload,
                upgrades: mergedUpgrades,
                // Merge Prestige Upgrades ensuring new ones appear
                prestigeUpgrades: PRESTIGE_ITEMS.map(init => {
                    const saved = action.payload.prestigeUpgrades?.find((u: PrestigeUpgrade) => u.id === init.id);
                    return saved ? { ...init, level: saved.level } : init;
                }),
                loaded: true,
                itemLifetimeProduction: action.payload.itemLifetimeProduction || {},
                startTime: action.payload.startTime || state.startTime || Date.now(),
                // Fix: Check for both lastSaveTime (new) and lastSave (legacy)
                lastSaveTime: action.payload.lastSaveTime || action.payload.lastSave || Date.now(),
                goldenSeeds: action.payload.goldenSeeds || 0,
                unlockedAchievements: action.payload.unlockedAchievements || [],
                // Don't load saved temporary buffs or active apples, they expire/reset
                goldenApple: { active: false, type: 'frenzy', spawnTime: 0, x: 0, y: 0 },
                activeMultipliers: [],
                prestigeCount: action.payload.prestigeCount || 0,
                stats: action.payload.stats || {
                    totalManualClicks: 0,
                    totalTreesProduced: action.payload.lifetimeTrees || 0, // Best guess migration
                    totalPlayTime: 0
                }
            };

        case "ADD_OFFLINE_TREES":
            return {
                ...state,
                trees: state.trees + action.payload,
                lifetimeTrees: state.lifetimeTrees + action.payload,
            };

        case "CLICK_TREE":
            return {
                ...state,
                trees: state.trees + action.payload,
                lifetimeTrees: state.lifetimeTrees + action.payload,
                stats: {
                    ...state.stats,
                    totalManualClicks: (state.stats?.totalManualClicks || 0) + 1,
                    totalTreesProduced: (state.stats?.totalTreesProduced || 0) + action.payload
                }
            };

        case "AUTO_TICK":
            if (action.payload.total <= 0) return state;

            // Merge breakdown into lifetime stats
            const newItemLifetime = { ...state.itemLifetimeProduction };
            Object.entries(action.payload.breakdown).forEach(([id, val]) => {
                newItemLifetime[id] = (newItemLifetime[id] || 0) + val;
            });

            return {
                ...state,
                trees: state.trees + action.payload.total,
                lifetimeTrees: state.lifetimeTrees + action.payload.total,
                itemLifetimeProduction: newItemLifetime,
                stats: {
                    ...state.stats,
                    totalTreesProduced: (state.stats?.totalTreesProduced || 0) + action.payload.total,
                    totalPlayTime: (state.stats?.totalPlayTime || 0) + (action.payload.dt || 0)
                }
            };

        case "BUY_UPGRADE":
            const upgradeIndex = state.upgrades.findIndex((u) => u.id === action.payload.id);
            if (upgradeIndex === -1) return state;

            const upgrade = state.upgrades[upgradeIndex];
            if (upgrade.maxLevel && upgrade.level >= upgrade.maxLevel) return state;

            // Calculate Cost for N items
            // Geometric Series: Cost = Base * Mult^L * ( (Mult^N - 1) / (Mult - 1) )
            // If N=1, logic simplifies to Base * Mult^L
            const amount = action.payload.amount;

            // Safety: If maxLevel exists, clamp amount
            let actualAmount = amount;
            if (upgrade.maxLevel) {
                const remaining = upgrade.maxLevel - upgrade.level;
                if (remaining <= 0) return state;
                actualAmount = Math.min(amount, remaining);
            }

            const geneticMemoryLevel = state.prestigeUpgrades?.find(u => u.id === 'genetic_memory')?.level || 0;
            const costScaleDiscount = geneticMemoryLevel * 0.002; // 0.002 discount per level
            const activeCostMultiplier = Math.max(1.01, upgrade.costMultiplier - costScaleDiscount);
            // Min 1.01 scaling to prevent infinite overlapping or negative cost growth

            let totalCost = 0;
            if (actualAmount === 1) {
                totalCost = Math.floor(upgrade.baseCost * Math.pow(activeCostMultiplier, upgrade.level));
            } else {
                const firstCost = upgrade.baseCost * Math.pow(activeCostMultiplier, upgrade.level);
                const geometricFactor = (Math.pow(activeCostMultiplier, actualAmount) - 1) / (activeCostMultiplier - 1);
                totalCost = Math.floor(firstCost * geometricFactor);
            }

            // ATOMIC CHECK
            if (state.trees >= totalCost) {
                const newUpgrades = [...state.upgrades];
                newUpgrades[upgradeIndex] = { ...upgrade, level: upgrade.level + actualAmount };
                return {
                    ...state,
                    trees: state.trees - totalCost,
                    upgrades: newUpgrades,
                };
            }
            return state;

        // case "BUY_TECH": // DEPRECATED - Merged into Upgrades
        //     const tech = INITIAL_TECHS.find((t) => t.id === action.payload);
        //     if (!tech) return state;
        //     if (state.techs.includes(tech.id)) return state; // Already owned
        // 
        //     if (state.trees >= tech.cost) {
        //         return {
        //             ...state,
        //             trees: state.trees - tech.cost,
        //             techs: [...state.techs, tech.id]
        //         };
        //     }
        //     return state;

        case "PRESTIGE":
            // New Formula (User Request): Ignore "Past Burned" history.
            // Cost scales based on Total Seeds held, but you must pay the full marginal cost.
            // Formula: Claimable = floor( sqrt( (CurrentTrees / 1M) + TotalSeeds^2 ) - TotalSeeds )

            const currentTrees = state.trees;
            const existingSeeds = state.goldenSeeds || 0;

            // 1. Calculate Seeds to Award
            // Derived from: TotalTargetSeeds = sqrt(TotalVirtualTrees / 1M)
            // TotalVirtualTrees = CurrentTrees + (ExistingSeeds^2 * 1M)
            const seedsToAward = Math.floor(
                Math.sqrt((currentTrees / 1000000) + Math.pow(existingSeeds, 2)) - existingSeeds
            );

            if (seedsToAward <= 0) return state;

            if (seedsToAward <= 0) return state;

            // Create new state object
            const baseNewState: GameState = {
                ...state,
                trees: 0,
                lifetimeTrees: 0,
                upgrades: INITIAL_UPGRADES, // Reset all levels
                techs: [],
                unlockedAchievements: state.unlockedAchievements, // KEEP Achievements
                goldenApple: { active: false, type: 'frenzy', spawnTime: 0, x: 0, y: 0 },
                activeMultipliers: [],
                itemLifetimeProduction: {},
                goldenSeeds: (state.goldenSeeds || 0) + seedsToAward,
                prestigeCount: (state.prestigeCount || 0) + 1,
                startTime: Date.now(), // Reset session time
                stats: state.stats, // Preserve statistics
                prestigeUpgrades: state.prestigeUpgrades // Preserve Prestige Upgrades
            };

            // Apply "Golden Shovel" (Start Trees)
            const shovelLevel = state.prestigeUpgrades?.find(u => u.id === 'golden_shovel')?.level || 0;
            if (shovelLevel > 0) {
                baseNewState.trees = 1000 * shovelLevel;
                // Optional: decide if starting trees count towards lifetime for this run. Usually yes.
                baseNewState.lifetimeTrees = 1000 * shovelLevel;
            }

            // Apply "Permaculture" (Retain % of Trees)
            const permaLevel = state.prestigeUpgrades?.find(u => u.id === 'permaculture')?.level || 0;
            if (permaLevel > 0) {
                const keepPercent = 0.01 * permaLevel; // 1% per level
                const kept = Math.floor(currentTrees * keepPercent);
                baseNewState.trees += kept;
                baseNewState.lifetimeTrees += kept;
            }

            return baseNewState;


        case "BUY_PRESTIGE_UPGRADE":
            const pId = action.payload;
            const pIdx = state.prestigeUpgrades?.findIndex(u => u.id === pId);
            if (pIdx === -1 || pIdx === undefined) return state;

            const pItem = state.prestigeUpgrades[pIdx];
            if (pItem.level >= pItem.maxLevel) return state;

            if (state.goldenSeeds >= pItem.cost) {
                const newPUpgrades = [...state.prestigeUpgrades];
                newPUpgrades[pIdx] = { ...pItem, level: pItem.level + 1 };

                return {
                    ...state,
                    goldenSeeds: state.goldenSeeds - pItem.cost,
                    prestigeUpgrades: newPUpgrades
                };
            }
            return state;

        case "UNLOCK_ACHIEVEMENT":
            if (state.unlockedAchievements.includes(action.payload)) return state;
            return {
                ...state,
                unlockedAchievements: [...state.unlockedAchievements, action.payload]
            };

        case "SPAWN_GOLDEN_APPLE":
            return {
                ...state,
                goldenApple: {
                    active: true,
                    type: action.payload.type,
                    x: action.payload.x,
                    y: action.payload.y,
                    spawnTime: Date.now()
                }
            };

        case "CLICK_GOLDEN_APPLE":
            if (!state.goldenApple.active) return state;

            // Effect Logic handled in Hook mostly, but we set state here
            // We need to add a multiplier based on type
            const appleType = state.goldenApple.type;
            const newMultipliers = [...state.activeMultipliers];

            if (appleType === 'frenzy') {
                newMultipliers.push({
                    id: `frenzy_${Date.now()}`,
                    source: 'golden_apple',
                    type: 'production',
                    value: 7, // x7 Production
                    expiresAt: Date.now() + 30000, // 30 Seconds
                    name: "Frenzy"
                });
            } else if (appleType === 'chain') {
                newMultipliers.push({
                    id: `chain_${Date.now()}`,
                    source: 'golden_apple',
                    type: 'click',
                    value: 777, // x777 Click Power
                    expiresAt: Date.now() + 13000, // 13 Seconds
                    name: "Click Frenzy"
                });
            }

            return {
                ...state,
                goldenApple: { ...state.goldenApple, active: false },
                activeMultipliers: newMultipliers
            };

        case "DESPAWN_GOLDEN_APPLE":
            return {
                ...state,
                goldenApple: { ...state.goldenApple, active: false }
            };

        case "REMOVE_EXPIRED_EFFECTS":
            const now = action.payload;
            const valid = state.activeMultipliers.filter(m => m.expiresAt > now);
            if (valid.length === state.activeMultipliers.length) return state; // No change
            return {
                ...state,
                activeMultipliers: valid
            };

        default:
            return state;
    }
};

export const INITIAL_STATE: GameState = {
    trees: 0,
    lifetimeTrees: 0,
    prestigeCount: 0,
    goldenSeeds: 0,
    upgrades: INITIAL_UPGRADES,
    prestigeUpgrades: PRESTIGE_ITEMS, // Default empty start
    itemLifetimeProduction: {},
    techs: [],
    unlockedAchievements: [],
    goldenApple: { active: false, type: 'frenzy', spawnTime: 0, x: 0, y: 0 },
    activeMultipliers: [],
    loaded: false,
    startTime: Date.now(),
    lastSaveTime: Date.now(),
    stats: {
        totalManualClicks: 0,
        totalTreesProduced: 0,
        totalPlayTime: 0
    },
    version: 2 // Current Version
};
