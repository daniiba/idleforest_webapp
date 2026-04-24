import { getTranslations } from "next-intl/server";
import { CarbonData, mapDbToCarbonData } from "./carbon-data";
import { createClient } from "./supabase/server";

export interface CarbonHubDefinition {
    slug: string;
    title: string;
    seoTitle: string;
    seoDescription: string;
    queryChips: string[];
    eyebrow: string;
    intro: string;
    categoryFilter?: string[];
    sections: { title: string; body: string }[];
}

interface CarbonHubConfig {
    slug: string;
    translationKey: string;
    queryChips: string[];
    categoryFilter?: string[];
    sectionKeys: string[];
}

export const CARBON_HUBS: Record<string, CarbonHubConfig> = {
    "ai": {
        slug: "ai",
        translationKey: "ai",
        queryChips: ["ai carbon footprint", "carbon footprint of chatgpt", "llm emissions", "ai co2"],
        categoryFilter: ["AI"],
        sectionKeys: ["trainingVsInference", "hardwareAndCooling"],
    },
    "streaming": {
        slug: "streaming",
        translationKey: "streaming",
        queryChips: ["streaming carbon footprint", "netflix emissions", "youtube carbon footprint", "spotify co2"],
        categoryFilter: ["Streaming"],
        sectionKeys: ["dataCentersToDevices", "audioVsVideo"],
    },
    "digital-carbon-footprint": {
        slug: "digital-carbon-footprint",
        translationKey: "digitalCarbonFootprint",
        queryChips: ["digital carbon footprint", "internet emissions", "reduce digital footprint", "carbon footprint of internet"],
        categoryFilter: ["Browsing", "Social", "Work"],
        sectionKeys: ["theInvisibleCloud", "howCanYouReduceIt"],
    }
};

export async function getCarbonHub(slug: string, locale: string = "en"): Promise<CarbonHubDefinition | undefined> {
    const hub = CARBON_HUBS[slug];

    if (!hub) {
        return undefined;
    }

    const t = await getTranslations({
        locale,
        namespace: "CarbonFootprint.page.hubs",
    });

    return {
        slug: hub.slug,
        title: t(`${hub.translationKey}.title`),
        seoTitle: t(`${hub.translationKey}.seoTitle`),
        seoDescription: t(`${hub.translationKey}.seoDescription`),
        queryChips: hub.queryChips,
        eyebrow: t(`${hub.translationKey}.eyebrow`),
        intro: t(`${hub.translationKey}.intro`),
        categoryFilter: hub.categoryFilter,
        sections: hub.sectionKeys.map((sectionKey) => ({
            title: t(`${hub.translationKey}.sections.${sectionKey}.title`),
            body: t(`${hub.translationKey}.sections.${sectionKey}.body`),
        })),
    };
}

export async function getCarbonHubPages(hub: CarbonHubDefinition): Promise<CarbonData[]> {
    const supabase = await createClient();
    let query = supabase.from('carbon_apps').select('*');
    
    if (hub.categoryFilter && hub.categoryFilter.length > 0) {
        query = query.in('category', hub.categoryFilter);
    }
    
    const { data, error } = await query;
    if (error || !data) return [];
    
    return data.map(mapDbToCarbonData);
}
