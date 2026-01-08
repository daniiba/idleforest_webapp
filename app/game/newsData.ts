import { GameState } from "./reducer";

export interface NewsItem {
    id: string;
    text: string;
    condition?: (state: GameState) => boolean;
}

export const GENERIC_NEWS: NewsItem[] = [
    { id: "gen_1", text: "News: Local squirrel announces candidacy for mayor." },
    { id: "gen_2", text: "News: Scientists confirm that trees are 'pretty cool'." },
    { id: "gen_3", text: "News: Breaking: Man discovers that money actually does grow on trees." },
    { id: "gen_4", text: "News: Local park ranger mysteriously disappears into a very dense patch of forest." },
    { id: "gen_5", text: "News: Oxygen levels at an all-time high; citizens report feeling 'dizzy with joy'." },
    { id: "gen_6", text: "News: 'Too many leaves!' cries elderly neighbor sweeping his porch." },
    { id: "gen_7", text: "News: Stocks in lumber plummet as conservation efforts reach critical mass." },
];

export const UNLOCKABLE_NEWS: NewsItem[] = [
    // Seedling
    {
        id: "seedling_1",
        text: "News: Seedling sales skyrocket; window sills everywhere are full.",
        condition: (s) => s.upgrades.find(u => u.id === 'seedling' && u.level > 10) !== undefined
    },
    // Potted Plant
    {
        id: "potted_1",
        text: "News: Interior designers declare 'Potted Plants' the new minimalist trend.",
        condition: (s) => s.upgrades.find(u => u.id === 'potted_plant' && u.level > 10) !== undefined
    },
    // Garden Patch
    {
        id: "garden_1",
        text: "News: Community morale improves as Garden Patches replace parking lots.",
        condition: (s) => s.upgrades.find(u => u.id === 'garden_patch' && u.level > 5) !== undefined
    },
    // Backyard Nursery
    {
        id: "nursery_1",
        text: "News: Homeowners Associations baffled by sudden proliferation of Backyard Nurseries.",
        condition: (s) => s.upgrades.find(u => u.id === 'backyard_nursery' && u.level > 5) !== undefined
    },
    // Community Garden
    {
        id: "community_1",
        text: "News: Community Gardens voted 'Best Place to Pretend to Work'.",
        condition: (s) => s.upgrades.find(u => u.id === 'community_garden' && u.level > 5) !== undefined
    },
    // Greenhouse
    {
        id: "greenhouse_1",
        text: "News: Glass sales through the roof as Greenhouses pop up everywhere.",
        condition: (s) => s.upgrades.find(u => u.id === 'greenhouse' && u.level > 5) !== undefined
    },
    // Reforestation Project
    {
        id: "reforest_1",
        text: "News: Desertification halted; entire regions now indistinguishable from The Shire.",
        condition: (s) => s.upgrades.find(u => u.id === 'reforestation_project' && u.level > 0) !== undefined
    },
    // Drone Seeder
    {
        id: "drone_1",
        text: "News: Sky darkened by swarms of benevolent tree-planting drones.",
        condition: (s) => s.upgrades.find(u => u.id === 'drone_seeder' && u.level > 0) !== undefined
    },
    {
        id: "drone_2",
        text: "News: Conspiracy theorists claim drones are actually planting surveillance devices.",
        condition: (s) => s.upgrades.find(u => u.id === 'drone_seeder' && u.level > 20) !== undefined
    },
    // Vertical Forest
    {
        id: "vertical_1",
        text: "News: Skyscrapers now 80% foliage; window washers demand hazard pay.",
        condition: (s) => s.upgrades.find(u => u.id === 'vertical_forest' && u.level > 0) !== undefined
    },
    // Weather Control
    {
        id: "weather_1",
        text: "News: Weather forecast for today: Perfect growing conditions, forever.",
        condition: (s) => s.upgrades.find(u => u.id === 'weather_control' && u.level > 0) !== undefined
    },
    // Planetary Geo-Engineering
    {
        id: "planet_1",
        text: "News: Earth officially renamed 'Arboria Prime'.",
        condition: (s) => s.upgrades.find(u => u.id === 'planetary_geoeng' && u.level > 0) !== undefined
    },
    // Orbital Greenhouse
    {
        id: "orbital_1",
        text: "News: ISS reports collision warning with aggressive ivy growth.",
        condition: (s) => s.upgrades.find(u => u.id === 'orbital_greenhouse' && u.level > 0) !== undefined
    },
    // Solar System Silviculture
    {
        id: "solar_1",
        text: "News: Mars terraforming complete; it's now just a really big forest.",
        condition: (s) => s.upgrades.find(u => u.id === 'solar_silviculture' && u.level > 0) !== undefined
    },
    // Galactic Reforestation
    {
        id: "galactic_1",
        text: "News: Aliens confused by sudden influx of trees in vacuum of space.",
        condition: (s) => s.upgrades.find(u => u.id === 'galactic_reforest' && u.level > 0) !== undefined
    },
    // Universal Reserve
    {
        id: "universal_1",
        text: "News: Entropy reversed; heat death of universe cancelled due to excess photosynthesis.",
        condition: (s) => s.upgrades.find(u => u.id === 'universal_reserve' && u.level > 0) !== undefined
    }
];
