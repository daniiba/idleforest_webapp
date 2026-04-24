import { CarbonData, mapDbToCarbonData } from "./carbon-data";
import {
    CARBON_HUB_SEED_DATA,
    CarbonHubFaqItem,
    CarbonHubLocaleContent,
    CarbonHubPlaybookItem,
    CarbonHubSection,
} from "./carbon-hub-seed-data";
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
    sections: CarbonHubSection[];
    playbook: CarbonHubPlaybookItem[];
    faq: CarbonHubFaqItem[];
    featuredComparisonPairs: [string, string][];
}

interface CarbonHubRow {
    slug: string;
    content: Record<string, CarbonHubLocaleContent> | null;
}

function mergeHubLocaleContent(
    slug: string,
    baseContent: CarbonHubLocaleContent,
    localizedContent?: CarbonHubLocaleContent
): CarbonHubDefinition {
    const merged = localizedContent ? { ...baseContent, ...localizedContent } : baseContent;

    return {
        slug,
        title: merged.title,
        seoTitle: merged.seoTitle,
        seoDescription: merged.seoDescription,
        queryChips: merged.queryChips,
        eyebrow: merged.eyebrow,
        intro: merged.intro,
        categoryFilter: merged.categoryFilter,
        sections: merged.sections,
        playbook: merged.playbook,
        faq: merged.faq,
        featuredComparisonPairs: merged.featuredComparisonPairs,
    };
}

function getSeedCarbonHub(slug: string, locale: string): CarbonHubDefinition | undefined {
    const seedEntry = CARBON_HUB_SEED_DATA.find((item) => item.slug === slug);
    if (!seedEntry) {
        return undefined;
    }

    const baseContent = seedEntry.content.en;
    const localizedContent = seedEntry.content[locale];
    return mergeHubLocaleContent(slug, baseContent, localizedContent);
}

export async function getCarbonHub(slug: string, locale: string = "en"): Promise<CarbonHubDefinition | undefined> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("carbon_hubs")
        .select("slug, content")
        .eq("slug", slug)
        .single<CarbonHubRow>();

    if (error || !data?.content) {
        return getSeedCarbonHub(slug, locale);
    }

    const baseContent = data.content.en;
    if (!baseContent) {
        return getSeedCarbonHub(slug, locale);
    }

    return mergeHubLocaleContent(slug, baseContent, data.content[locale]);
}

export async function getCarbonHubPages(hub: CarbonHubDefinition): Promise<CarbonData[]> {
    const supabase = await createClient();
    let query = supabase.from("carbon_apps").select("*");

    if (hub.categoryFilter && hub.categoryFilter.length > 0) {
        query = query.in("category", hub.categoryFilter);
    }

    const { data, error } = await query;
    if (error || !data) {
        return [];
    }

    return data.map(mapDbToCarbonData);
}
