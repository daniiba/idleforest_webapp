


export type UpgradeType = "click" | "auto" | "multiplier";

export interface Upgrade {
    id: string;
    name: string;
    type: UpgradeType;
    baseCost: number;
    costMultiplier: number; // Standardizing around 1.15 for smoother long-term scaling
    level: number;
    iconPath: string;
    description: string;
    unlockThreshold: number;
    maxLevel?: number;         // Cap on upgrades (e.g. 1 for one-time items)
    // Generic effect hooks
    clickSignal?: number;      // Deprecated: No longer used, but kept for type safety if needed
    autoSignal?: number;       // +X per second per level
    multiplierSignal?: number; // +0.X multiplier per level (additive) (e.g. 0.1 = +10%)
    targetUpgradeId?: string;  // Specific item to target (e.g. 'seedling')
    category?: 'market' | 'lab'; // Explicit category for shop sorting
}

// MARKET ITEMS: Only generate Trees Per Second (Auto)
// Values matched exactly to Cookie Clicker for balanced progression
export const MARKET_ITEMS: Upgrade[] = [
    {
        id: "seedling",
        name: "Seedling",
        type: "auto",
        baseCost: 15, // CC: Cursor (15)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/seedling_icon.png",
        description: "+0.1 Tree/sec", // CC: 0.1
        unlockThreshold: 0,
        autoSignal: 0.1,
        category: 'market'
    },
    {
        id: "potted_plant",
        name: "Potted Plant",
        type: "auto",
        baseCost: 100, // CC: Grandma (100)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/potted_icon.png",
        description: "+1 Tree/sec", // CC: 1
        unlockThreshold: 75,
        autoSignal: 1,
        category: 'market'
    },
    {
        id: "garden_patch",
        name: "Garden Patch",
        type: "auto",
        baseCost: 1100, // CC: Farm (1,100)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/garden_icon.png",
        description: "+8 Trees/sec", // CC: 8
        unlockThreshold: 800,
        autoSignal: 8,
        category: 'market'
    },
    {
        id: "backyard_nursery",
        name: "Backyard Nursery",
        type: "auto",
        baseCost: 12000, // CC: Mine (12,000)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/nursery_icon.png",
        description: "+47 Trees/sec", // CC: 47
        unlockThreshold: 9000,
        autoSignal: 47,
        category: 'market'
    },
    {
        id: "community_garden",
        name: "Community Garden",
        type: "auto",
        baseCost: 130000, // CC: Factory (130,000)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/community_icon.png",
        description: "+260 Trees/sec", // CC: 260
        unlockThreshold: 100000,
        autoSignal: 260,
        category: 'market'
    },
    {
        id: "greenhouse",
        name: "Greenhouse",
        type: "auto",
        baseCost: 1400000, // CC: Bank (1.4M)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/greenhouse_icon.png",
        description: "+1,400 Trees/sec", // CC: 1,400
        unlockThreshold: 1000000,
        autoSignal: 1400,
        category: 'market'
    },
    {
        id: "reforestation_project",
        name: "Reforestation Project",
        type: "auto",
        baseCost: 20000000, // CC: Temple (20M)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/reforest_icon.png",
        description: "+7,800 Trees/sec", // CC: 7,800
        unlockThreshold: 15000000,
        autoSignal: 7800,
        category: 'market'
    },
    {
        id: "drone_seeder",
        name: "Drone Seeder Fleet",
        type: "auto",
        baseCost: 330000000, // CC: Wizard Tower (330M)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/drone_icon.png",
        description: "+44,000 Trees/sec", // CC: 44,000
        unlockThreshold: 250000000,
        autoSignal: 44000,
        category: 'market'
    },
    {
        id: "vertical_forest",
        name: "Vertical Forest Tower",
        type: "auto",
        baseCost: 5100000000, // CC: Shipment (5.1B)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/vertical_icon.png",
        description: "+260,000 Trees/sec", // CC: 260,000
        unlockThreshold: 4000000000,
        autoSignal: 260000,
        category: 'market'
    },
    {
        id: "weather_control",
        name: "Weather Control Node",
        type: "auto",
        baseCost: 75000000000, // CC: Alchemy Lab (75B)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/weather_icon.png",
        description: "+1.6M Trees/sec", // CC: 1.6M
        unlockThreshold: 50000000000,
        autoSignal: 1600000,
        category: 'market'
    },
    {
        id: "planetary_geoeng",
        name: "Planetary Geo-Engineering",
        type: "auto",
        baseCost: 1000000000000, // CC: Portal (1T)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/planet_icon.png",
        description: "+10M Trees/sec", // CC: 10M
        unlockThreshold: 750000000000,
        autoSignal: 10000000,
        category: 'market'
    },
    {
        id: "orbital_greenhouse",
        name: "Orbital Greenhouse",
        type: "auto",
        baseCost: 3000000000000, // 3T (Realism compression)
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/satellite_icon.png",
        description: "+15M Trees/sec",
        unlockThreshold: 2000000000000,
        autoSignal: 15000000,
        category: 'market'
    },
    {
        id: "solar_silviculture",
        name: "Solar System Silviculture",
        type: "auto",
        baseCost: 25000000000000, // 25T
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/sun_icon.png",
        description: "+100M Trees/sec",
        unlockThreshold: 15000000000000,
        autoSignal: 100000000,
        category: 'market'
    },
    {
        id: "galactic_reforest",
        name: "Galactic Reforestation",
        type: "auto",
        baseCost: 150000000000000, // 150T
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/dna_icon.png",
        description: "+500M Trees/sec",
        unlockThreshold: 100000000000000,
        autoSignal: 500000000,
        category: 'market'
    },
    {
        id: "universal_reserve",
        name: "Universal Nature Reserve",
        type: "auto",
        baseCost: 900000000000000, // 900T - End Game Goal
        costMultiplier: 1.15,
        level: 0,
        iconPath: "/game/ai_icon.png",
        description: "+2.5B Trees/sec",
        unlockThreshold: 750000000000000,
        autoSignal: 2500000000,
        category: 'market'
    }
];

// LAB ITEMS: Automation and Multipliers (Merged with Techs)
export const LAB_ITEMS: Upgrade[] = [
    // --- TECH CONVERSIONS (New Early Game Goals) ---
    {
        "id": "tech_seedling_1",
        "name": "Miracle Seeds",
        "type": "multiplier",
        "baseCost": 5000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/seedling_icon.png",
        "description": "Doubles Seedling efficiency.",
        "unlockThreshold": 500,
        "multiplierSignal": 1,
        "targetUpgradeId": "seedling",
        "category": "lab"
    },
    {
        "id": "tech_click_1",
        "name": "Ergonomic Handles",
        "type": "multiplier",
        "baseCost": 25000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/glove_icon.png",
        "description": "Doubles all Click efficiency.",
        "unlockThreshold": 2500,
        "multiplierSignal": 1,
        "targetUpgradeId": "ALL_CLICK",
        "category": "lab"
    },
    {
        "id": "tech_garden_1",
        "name": "Crop Rotation",
        "type": "multiplier",
        "baseCost": 500000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/garden_icon.png",
        "description": "Doubles Garden Patch efficiency.",
        "unlockThreshold": 50000,
        "multiplierSignal": 1,
        "targetUpgradeId": "garden_patch",
        "category": "lab"
    },
    {
        "id": "tech_global_1",
        "name": "Carbon Credits API",
        "type": "multiplier",
        "baseCost": 10000000, // 10M
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/market_icon.png",
        "description": "x1.5 Global Production Multiplier.",
        "unlockThreshold": 5000000,
        "multiplierSignal": 0.5,
        "targetUpgradeId": "ALL_GLOBAL",
        "category": "lab"
    },
    // --- STANDARD TIER UPGRADES (Rebalanced: x10, x100, x2500, x50000 of Base) ---
    {
        "id": "seedling_t1",
        "name": "Seedling Fertilizer",
        "type": "multiplier",
        "baseCost": 150,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/seedling_icon.png",
        "description": "Doubles Seedling production.",
        "unlockThreshold": 15,
        "multiplierSignal": 1,
        "targetUpgradeId": "seedling",
        "category": "lab"
    },
    {
        "id": "seedling_t2",
        "name": "Seedling Optimization",
        "type": "multiplier",
        "baseCost": 7500,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/seedling_icon.png",
        "description": "Doubles Seedling production.",
        "unlockThreshold": 750,
        "multiplierSignal": 1,
        "targetUpgradeId": "seedling",
        "category": "lab"
    },
    {
        "id": "seedling_t3",
        "name": "Seedling Synergy",
        "type": "multiplier",
        "baseCost": 150000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/seedling_icon.png",
        "description": "Doubles Seedling production.",
        "unlockThreshold": 15000,
        "multiplierSignal": 1,
        "targetUpgradeId": "seedling",
        "category": "lab"
    },
    {
        "id": "seedling_t4",
        "name": "Seedling Neuro-Link",
        "type": "multiplier",
        "baseCost": 150000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/seedling_icon.png",
        "description": "Doubles Seedling production.",
        "unlockThreshold": 15000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "seedling",
        "category": "lab"
    },
    {
        "id": "potted_plant_t1",
        "name": "Potted Plant Fertilizer",
        "type": "multiplier",
        "baseCost": 1000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/potted_icon.png",
        "description": "Doubles Potted Plant production.",
        "unlockThreshold": 100,
        "multiplierSignal": 1,
        "targetUpgradeId": "potted_plant",
        "category": "lab"
    },
    {
        "id": "potted_plant_t2",
        "name": "Potted Plant Optimization",
        "type": "multiplier",
        "baseCost": 50000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/potted_icon.png",
        "description": "Doubles Potted Plant production.",
        "unlockThreshold": 5000,
        "multiplierSignal": 1,
        "targetUpgradeId": "potted_plant",
        "category": "lab"
    },
    {
        "id": "potted_plant_t3",
        "name": "Potted Plant Synergy",
        "type": "multiplier",
        "baseCost": 1000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/potted_icon.png",
        "description": "Doubles Potted Plant production.",
        "unlockThreshold": 100000,
        "multiplierSignal": 1,
        "targetUpgradeId": "potted_plant",
        "category": "lab"
    },
    {
        "id": "potted_plant_t4",
        "name": "Potted Plant Neuro-Link",
        "type": "multiplier",
        "baseCost": 1000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/potted_icon.png",
        "description": "Doubles Potted Plant production.",
        "unlockThreshold": 100000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "potted_plant",
        "category": "lab"
    },
    {
        "id": "garden_patch_t1",
        "name": "Garden Patch Fertilizer",
        "type": "multiplier",
        "baseCost": 11000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/garden_icon.png",
        "description": "Doubles Garden Patch production.",
        "unlockThreshold": 1100,
        "multiplierSignal": 1,
        "targetUpgradeId": "garden_patch",
        "category": "lab"
    },
    {
        "id": "garden_patch_t2",
        "name": "Garden Patch Optimization",
        "type": "multiplier",
        "baseCost": 550000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/garden_icon.png",
        "description": "Doubles Garden Patch production.",
        "unlockThreshold": 55000,
        "multiplierSignal": 1,
        "targetUpgradeId": "garden_patch",
        "category": "lab"
    },
    {
        "id": "garden_patch_t3",
        "name": "Garden Patch Synergy",
        "type": "multiplier",
        "baseCost": 11000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/garden_icon.png",
        "description": "Doubles Garden Patch production.",
        "unlockThreshold": 1100000,
        "multiplierSignal": 1,
        "targetUpgradeId": "garden_patch",
        "category": "lab"
    },
    {
        "id": "garden_patch_t4",
        "name": "Garden Patch Neuro-Link",
        "type": "multiplier",
        "baseCost": 11000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/garden_icon.png",
        "description": "Doubles Garden Patch production.",
        "unlockThreshold": 1100000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "garden_patch",
        "category": "lab"
    },
    {
        "id": "backyard_nursery_t1",
        "name": "Backyard Nursery Fertilizer",
        "type": "multiplier",
        "baseCost": 120000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/nursery_icon.png",
        "description": "Doubles Backyard Nursery production.",
        "unlockThreshold": 12000,
        "multiplierSignal": 1,
        "targetUpgradeId": "backyard_nursery",
        "category": "lab"
    },
    {
        "id": "backyard_nursery_t2",
        "name": "Backyard Nursery Optimization",
        "type": "multiplier",
        "baseCost": 6000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/nursery_icon.png",
        "description": "Doubles Backyard Nursery production.",
        "unlockThreshold": 600000,
        "multiplierSignal": 1,
        "targetUpgradeId": "backyard_nursery",
        "category": "lab"
    },
    {
        "id": "backyard_nursery_t3",
        "name": "Backyard Nursery Synergy",
        "type": "multiplier",
        "baseCost": 120000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/nursery_icon.png",
        "description": "Doubles Backyard Nursery production.",
        "unlockThreshold": 12000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "backyard_nursery",
        "category": "lab"
    },
    {
        "id": "backyard_nursery_t4",
        "name": "Backyard Nursery Neuro-Link",
        "type": "multiplier",
        "baseCost": 120000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/nursery_icon.png",
        "description": "Doubles Backyard Nursery production.",
        "unlockThreshold": 12000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "backyard_nursery",
        "category": "lab"
    },
    {
        "id": "community_garden_t1",
        "name": "Community Garden Fertilizer",
        "type": "multiplier",
        "baseCost": 1300000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/community_icon.png",
        "description": "Doubles Community Garden production.",
        "unlockThreshold": 130000,
        "multiplierSignal": 1,
        "targetUpgradeId": "community_garden",
        "category": "lab"
    },
    {
        "id": "community_garden_t2",
        "name": "Community Garden Optimization",
        "type": "multiplier",
        "baseCost": 65000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/community_icon.png",
        "description": "Doubles Community Garden production.",
        "unlockThreshold": 6500000,
        "multiplierSignal": 1,
        "targetUpgradeId": "community_garden",
        "category": "lab"
    },
    {
        "id": "community_garden_t3",
        "name": "Community Garden Synergy",
        "type": "multiplier",
        "baseCost": 1300000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/community_icon.png",
        "description": "Doubles Community Garden production.",
        "unlockThreshold": 130000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "community_garden",
        "category": "lab"
    },
    {
        "id": "community_garden_t4",
        "name": "Community Garden Neuro-Link",
        "type": "multiplier",
        "baseCost": 1300000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/community_icon.png",
        "description": "Doubles Community Garden production.",
        "unlockThreshold": 130000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "community_garden",
        "category": "lab"
    },
    {
        "id": "greenhouse_t1",
        "name": "Greenhouse Fertilizer",
        "type": "multiplier",
        "baseCost": 14000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/greenhouse_icon.png",
        "description": "Doubles Greenhouse production.",
        "unlockThreshold": 1400000,
        "multiplierSignal": 1,
        "targetUpgradeId": "greenhouse",
        "category": "lab"
    },
    {
        "id": "greenhouse_t2",
        "name": "Greenhouse Optimization",
        "type": "multiplier",
        "baseCost": 700000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/greenhouse_icon.png",
        "description": "Doubles Greenhouse production.",
        "unlockThreshold": 70000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "greenhouse",
        "category": "lab"
    },
    {
        "id": "greenhouse_t3",
        "name": "Greenhouse Synergy",
        "type": "multiplier",
        "baseCost": 14000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/greenhouse_icon.png",
        "description": "Doubles Greenhouse production.",
        "unlockThreshold": 1400000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "greenhouse",
        "category": "lab"
    },
    {
        "id": "greenhouse_t4",
        "name": "Greenhouse Neuro-Link",
        "type": "multiplier",
        "baseCost": 14000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/greenhouse_icon.png",
        "description": "Doubles Greenhouse production.",
        "unlockThreshold": 1400000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "greenhouse",
        "category": "lab"
    },
    {
        "id": "reforestation_project_t1",
        "name": "Reforestation Project Fertilizer",
        "type": "multiplier",
        "baseCost": 200000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/reforest_icon.png",
        "description": "Doubles Reforestation Project production.",
        "unlockThreshold": 20000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "reforestation_project",
        "category": "lab"
    },
    {
        "id": "reforestation_project_t2",
        "name": "Reforestation Project Optimization",
        "type": "multiplier",
        "baseCost": 10000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/reforest_icon.png",
        "description": "Doubles Reforestation Project production.",
        "unlockThreshold": 1000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "reforestation_project",
        "category": "lab"
    },
    {
        "id": "reforestation_project_t3",
        "name": "Reforestation Project Synergy",
        "type": "multiplier",
        "baseCost": 200000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/reforest_icon.png",
        "description": "Doubles Reforestation Project production.",
        "unlockThreshold": 20000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "reforestation_project",
        "category": "lab"
    },
    {
        "id": "reforestation_project_t4",
        "name": "Reforestation Project Neuro-Link",
        "type": "multiplier",
        "baseCost": 200000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/reforest_icon.png",
        "description": "Doubles Reforestation Project production.",
        "unlockThreshold": 20000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "reforestation_project",
        "category": "lab"
    },
    {
        "id": "drone_seeder_t1",
        "name": "Drone Seeder Fleet Fertilizer",
        "type": "multiplier",
        "baseCost": 3300000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/drone_icon.png",
        "description": "Doubles Drone Seeder Fleet production.",
        "unlockThreshold": 330000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "drone_seeder",
        "category": "lab"
    },
    // T2: x100 Base (33B)
    {
        "id": "drone_seeder_t2",
        "name": "Drone Seeder Fleet Optimization",
        "type": "multiplier",
        "baseCost": 33000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/drone_icon.png",
        "description": "Doubles Drone Seeder Fleet production.",
        "unlockThreshold": 3300000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "drone_seeder",
        "category": "lab"
    },
    // T3: x2,500 Base (825B)
    {
        "id": "drone_seeder_t3",
        "name": "Drone Seeder Fleet Synergy",
        "type": "multiplier",
        "baseCost": 825000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/drone_icon.png",
        "description": "Doubles Drone Seeder Fleet production.",
        "unlockThreshold": 82500000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "drone_seeder",
        "category": "lab"
    },
    // T4: x50,000 Base (16.5T)
    {
        "id": "drone_seeder_t4",
        "name": "Drone Seeder Fleet Neuro-Link",
        "type": "multiplier",
        "baseCost": 16500000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/drone_icon.png",
        "description": "Doubles Drone Seeder Fleet production.",
        "unlockThreshold": 1650000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "drone_seeder",
        "category": "lab"
    },
    {
        "id": "vertical_forest_t1",
        "name": "Vertical Forest Tower Fertilizer",
        "type": "multiplier",
        "baseCost": 51000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/vertical_icon.png",
        "description": "Doubles Vertical Forest Tower production.",
        "unlockThreshold": 5100000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "vertical_forest",
        "category": "lab"
    },
    {
        "id": "vertical_forest_t2",
        "name": "Vertical Forest Tower Optimization",
        "type": "multiplier",
        "baseCost": 2550000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/vertical_icon.png",
        "description": "Doubles Vertical Forest Tower production.",
        "unlockThreshold": 255000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "vertical_forest",
        "category": "lab"
    },
    {
        "id": "vertical_forest_t3",
        "name": "Vertical Forest Tower Synergy",
        "type": "multiplier",
        "baseCost": 51000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/vertical_icon.png",
        "description": "Doubles Vertical Forest Tower production.",
        "unlockThreshold": 5100000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "vertical_forest",
        "category": "lab"
    },
    {
        "id": "vertical_forest_t4",
        "name": "Vertical Forest Tower Neuro-Link",
        "type": "multiplier",
        "baseCost": 51000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/vertical_icon.png",
        "description": "Doubles Vertical Forest Tower production.",
        "unlockThreshold": 5100000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "vertical_forest",
        "category": "lab"
    },
    {
        "id": "weather_control_t1",
        "name": "Weather Control Node Fertilizer",
        "type": "multiplier",
        "baseCost": 750000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/weather_icon.png",
        "description": "Doubles Weather Control Node production.",
        "unlockThreshold": 75000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "weather_control",
        "category": "lab"
    },
    {
        "id": "weather_control_t2",
        "name": "Weather Control Node Optimization",
        "type": "multiplier",
        "baseCost": 37500000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/weather_icon.png",
        "description": "Doubles Weather Control Node production.",
        "unlockThreshold": 3750000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "weather_control",
        "category": "lab"
    },
    {
        "id": "weather_control_t3",
        "name": "Weather Control Node Synergy",
        "type": "multiplier",
        "baseCost": 750000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/weather_icon.png",
        "description": "Doubles Weather Control Node production.",
        "unlockThreshold": 75000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "weather_control",
        "category": "lab"
    },
    {
        "id": "weather_control_t4",
        "name": "Weather Control Node Neuro-Link",
        "type": "multiplier",
        "baseCost": 750000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/weather_icon.png",
        "description": "Doubles Weather Control Node production.",
        "unlockThreshold": 75000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "weather_control",
        "category": "lab"
    },
    {
        "id": "planetary_geoeng_t1",
        "name": "Planetary Geo-Engineering Fertilizer",
        "type": "multiplier",
        "baseCost": 10000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/planet_icon.png",
        "description": "Doubles Planetary Geo-Engineering production.",
        "unlockThreshold": 1000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "planetary_geoeng",
        "category": "lab"
    },
    {
        "id": "planetary_geoeng_t2",
        "name": "Planetary Geo-Engineering Optimization",
        "type": "multiplier",
        "baseCost": 500000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/planet_icon.png",
        "description": "Doubles Planetary Geo-Engineering production.",
        "unlockThreshold": 50000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "planetary_geoeng",
        "category": "lab"
    },
    {
        "id": "planetary_geoeng_t3",
        "name": "Planetary Geo-Engineering Synergy",
        "type": "multiplier",
        "baseCost": 10000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/planet_icon.png",
        "description": "Doubles Planetary Geo-Engineering production.",
        "unlockThreshold": 1000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "planetary_geoeng",
        "category": "lab"
    },
    {
        "id": "planetary_geoeng_t4",
        "name": "Planetary Geo-Engineering Neuro-Link",
        "type": "multiplier",
        "baseCost": 10000000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/planet_icon.png",
        "description": "Doubles Planetary Geo-Engineering production.",
        "unlockThreshold": 1000000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "planetary_geoeng",
        "category": "lab"
    },
    // ORBITAL GREENHOUSE UPGRADES
    {
        "id": "orbital_greenhouse_t1",
        "name": "Orbital Greenhouse Fertilizer",
        "type": "multiplier",
        "baseCost": 140000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/satellite_icon.png",
        "description": "Doubles Orbital Greenhouse production.",
        "unlockThreshold": 14000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "orbital_greenhouse",
        "category": "lab"
    },
    {
        "id": "orbital_greenhouse_t2",
        "name": "Orbital Greenhouse Optimization",
        "type": "multiplier",
        "baseCost": 7000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/satellite_icon.png",
        "description": "Doubles Orbital Greenhouse production.",
        "unlockThreshold": 700000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "orbital_greenhouse",
        "category": "lab"
    },
    {
        "id": "orbital_greenhouse_t3",
        "name": "Orbital Greenhouse Synergy",
        "type": "multiplier",
        "baseCost": 140000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/satellite_icon.png",
        "description": "Doubles Orbital Greenhouse production.",
        "unlockThreshold": 14000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "orbital_greenhouse",
        "category": "lab"
    },
    {
        "id": "orbital_greenhouse_t4",
        "name": "Orbital Greenhouse Neuro-Link",
        "type": "multiplier",
        "baseCost": 140000000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/satellite_icon.png",
        "description": "Doubles Orbital Greenhouse production.",
        "unlockThreshold": 14000000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "orbital_greenhouse",
        "category": "lab"
    },
    // SOLAR SYSTEM SILVICULTURE UPGRADES
    {
        "id": "solar_silviculture_t1",
        "name": "Solar System Silviculture Fertilizer",
        "type": "multiplier",
        "baseCost": 1700000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/sun_icon.png",
        "description": "Doubles Solar System Silviculture production.",
        "unlockThreshold": 170000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "solar_silviculture",
        "category": "lab"
    },
    {
        "id": "solar_silviculture_t2",
        "name": "Solar System Silviculture Optimization",
        "type": "multiplier",
        "baseCost": 85000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/sun_icon.png",
        "description": "Doubles Solar System Silviculture production.",
        "unlockThreshold": 8500000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "solar_silviculture",
        "category": "lab"
    },
    {
        "id": "solar_silviculture_t3",
        "name": "Solar System Silviculture Synergy",
        "type": "multiplier",
        "baseCost": 1700000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/sun_icon.png",
        "description": "Doubles Solar System Silviculture production.",
        "unlockThreshold": 170000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "solar_silviculture",
        "category": "lab"
    },
    {
        "id": "solar_silviculture_t4",
        "name": "Solar System Silviculture Neuro-Link",
        "type": "multiplier",
        "baseCost": 1700000000000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/sun_icon.png",
        "description": "Doubles Solar System Silviculture production.",
        "unlockThreshold": 170000000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "solar_silviculture",
        "category": "lab"
    },
    // GALACTIC REFORESTATION UPGRADES
    {
        "id": "galactic_reforest_t1",
        "name": "Galactic Reforestation Fertilizer",
        "type": "multiplier",
        // Correction: Base Cost 150T.
        // T1 = 1.5 Qd.
        // T2 = 15 Qd.
        // T3 = 375 Qd.
        // T4 = 7.5 Quint.
        // This still seems high but proportionate.
        // Let's stick to the rule: T1=x10, T2=x100, T3=x2500, T4=x50000
        "baseCost": 1500000000000000,
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/dna_icon.png",
        "description": "Doubles Galactic Reforestation production.",
        "unlockThreshold": 150000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "galactic_reforest",
        "category": "lab"
    },
    {
        "id": "galactic_reforest_t2",
        "name": "Galactic Reforestation Optimization",
        "type": "multiplier",
        "baseCost": 15000000000000000, // x100 = 15Qd
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/dna_icon.png",
        "description": "Doubles Galactic Reforestation production.",
        "unlockThreshold": 1500000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "galactic_reforest",
        "category": "lab"
    },
    {
        "id": "galactic_reforest_t3",
        "name": "Galactic Reforestation Synergy",
        "type": "multiplier",
        "baseCost": 375000000000000000, // x2500 = 375Qd
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/dna_icon.png",
        "description": "Doubles Galactic Reforestation production.",
        "unlockThreshold": 37500000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "galactic_reforest",
        "category": "lab"
    },
    {
        "id": "galactic_reforest_t4",
        "name": "Galactic Reforestation Neuro-Link",
        "type": "multiplier",
        "baseCost": 7500000000000000000, // x50000 = 7.5 Quint
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/dna_icon.png",
        "description": "Doubles Galactic Reforestation production.",
        "unlockThreshold": 750000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "galactic_reforest",
        "category": "lab"
    },
    // UNIVERSAL NATURE RESERVE UPGRADES
    // Base: 900T
    {
        "id": "universal_reserve_t1",
        "name": "Universal Nature Reserve Fertilizer",
        "type": "multiplier",
        "baseCost": 9000000000000000, // x10 = 9Qd
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/ai_icon.png",
        "description": "Doubles Universal Nature Reserve production.",
        "unlockThreshold": 900000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "universal_reserve",
        "category": "lab"
    },
    {
        "id": "universal_reserve_t2",
        "name": "Universal Nature Reserve Optimization",
        "type": "multiplier",
        "baseCost": 90000000000000000, // x100 = 90Qd
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/ai_icon.png",
        "description": "Doubles Universal Nature Reserve production.",
        "unlockThreshold": 9000000000000000, // Correction: 9Qd unlock
        "multiplierSignal": 1,
        "targetUpgradeId": "universal_reserve",
        "category": "lab"
    },
    {
        "id": "universal_reserve_t3",
        "name": "Universal Nature Reserve Synergy",
        "type": "multiplier",
        "baseCost": 2250000000000000000, // x2500 = 2.25 Quint
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/ai_icon.png",
        "description": "Doubles Universal Nature Reserve production.",
        "unlockThreshold": 225000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "universal_reserve",
        "category": "lab"
    },
    {
        "id": "universal_reserve_t4",
        "name": "Universal Nature Reserve Neuro-Link",
        "type": "multiplier",
        "baseCost": 45000000000000000000, // x50000 = 45 Quint
        "costMultiplier": 2.5,
        "level": 0,
        "maxLevel": 1,
        "iconPath": "/game/ai_icon.png",
        "description": "Doubles Universal Nature Reserve production.",
        "unlockThreshold": 4500000000000000000,
        "multiplierSignal": 1,
        "targetUpgradeId": "universal_reserve",
        "category": "lab"
    },

];

export interface PrestigeUpgrade {
    id: string;
    name: string;
    description: string;
    cost: number; // Cost in Golden Seeds
    iconPath: string;
    maxLevel: number;
    // Effects
    effectType: 'start_trees' | 'cost_scaling' | 'apple_rate' | 'retain_trees' | 'generic_production';
    effectValue: number; // e.g., 1000 for trees, 0.99 for scaling, 2.0 for rate
    level: number;
}

export const PRESTIGE_ITEMS: PrestigeUpgrade[] = [
    {
        id: "golden_shovel",
        name: "Golden Shovel",
        description: "Start every run with 1,000 Trees.",
        cost: 5,
        iconPath: "/game/shovel_icon.png", // Verify icon existence or use generic?
        maxLevel: 10, // Scales: 1k, 2k, 3k...
        effectType: 'start_trees',
        effectValue: 1000,
        level: 0
    },
    {
        id: "genetic_memory",
        name: "Genetic Memory",
        description: "Upgrade costs scale slightly slower (1% cheaper scaling per level).",
        cost: 50,
        iconPath: "/game/dna_icon.png",
        maxLevel: 5,
        effectType: 'cost_scaling',
        effectValue: 0.002, // -0.002 to multiplier (1.15 -> 1.148)
        level: 0
    },
    {
        id: "apple_magnet",
        name: "Apple Magnet",
        description: "Golden Apples appear 20% more often.",
        cost: 25,
        iconPath: "/game/apple_icon.png",
        maxLevel: 5,
        effectType: 'apple_rate',
        effectValue: 0.2, // +20%
        level: 0
    },
    {
        id: "permaculture",
        name: "Permaculture",
        description: "Retain 1% of your Trees after prestige per level.",
        cost: 100,
        iconPath: "/game/nursery_icon.png",
        maxLevel: 10,
        effectType: 'retain_trees',
        effectValue: 0.01,
        level: 0
    }
];

export const INITIAL_UPGRADES: Upgrade[] = [...MARKET_ITEMS, ...LAB_ITEMS];

export interface Achievement {
    id: string;
    name: string;
    description: string;
    icon: string;
    conditionType: 'trees_total' | 'trees_lifetime' | 'click_total' | 'upgrade_count';
    threshold: number;
    unlocked?: boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
    { id: 'click_1', name: 'First Steps', description: 'Click the tree 1 time.', icon: '👆', conditionType: 'click_total', threshold: 1 },
    { id: 'click_100', name: 'Woodpecker', description: 'Click the tree 100 times.', icon: '🔨', conditionType: 'click_total', threshold: 100 },
    { id: 'click_1000', name: 'Carpal Tunnel', description: 'Click the tree 1,000 times.', icon: '🚑', conditionType: 'click_total', threshold: 1000 },

    { id: 'prod_100', name: 'Gardener', description: 'Produce 100 total trees.', icon: '🌱', conditionType: 'trees_lifetime', threshold: 100 },
    { id: 'prod_100k', name: 'Forester', description: 'Produce 100,000 total trees.', icon: '🌲', conditionType: 'trees_lifetime', threshold: 100000 },
    { id: 'prod_1m', name: 'Terraformer', description: 'Produce 1,000,000 total trees.', icon: '🌍', conditionType: 'trees_lifetime', threshold: 1000000 },
    { id: 'prod_1b', name: 'Gaia', description: 'Produce 1 Billion total trees.', icon: '🌞', conditionType: 'trees_lifetime', threshold: 1000000000 },
];

export type GoldenAppleType = 'frenzy' | 'lucky' | 'chain';

export interface GoldenAppleState {
    active: boolean;
    type: GoldenAppleType;
    spawnTime: number;
    x: number;
    y: number;
}

export interface ActiveMultiplier {
    id: string;
    source: 'golden_apple' | 'spell';
    type: 'production' | 'click';
    value: number;
    expiresAt: number;
    name: string;
}

