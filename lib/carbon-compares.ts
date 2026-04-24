import { createClient } from "@/lib/supabase/server";
import { CARBON_COMPARE_SEED_DATA, CarbonCompareLocaleContent } from "@/lib/carbon-compare-seed-data";

export interface CarbonCompareDefinition {
    slug: string;
    heading: string;
    summary: string;
    whyItDiffers: string[];
    actionAngle: string;
}

interface CarbonCompareRow {
    slug: string;
    content: Record<string, CarbonCompareLocaleContent> | null;
}

function buildComparisonSlug(slugA: string, slugB: string): string {
    return [slugA, slugB].sort((left, right) => left.localeCompare(right)).join("-vs-");
}

function mergeCompareLocaleContent(
    slug: string,
    baseContent: CarbonCompareLocaleContent,
    localizedContent?: CarbonCompareLocaleContent
): CarbonCompareDefinition {
    const merged = localizedContent ? { ...baseContent, ...localizedContent } : baseContent;

    return {
        slug,
        heading: merged.heading,
        summary: merged.summary,
        whyItDiffers: merged.whyItDiffers,
        actionAngle: merged.actionAngle,
    };
}

function getSeedCarbonCompare(slug: string, locale: string): CarbonCompareDefinition | undefined {
    const seedEntry = CARBON_COMPARE_SEED_DATA.find((item) => item.slug === slug);
    if (!seedEntry) {
        return undefined;
    }

    const baseContent = seedEntry.content.en;
    const localizedContent = seedEntry.content[locale];
    return mergeCompareLocaleContent(slug, baseContent, localizedContent);
}

export const INDEXABLE_COMPARE_SLUGS = new Set(
    CARBON_COMPARE_SEED_DATA.map((comparison) => comparison.slug)
);

export async function getCarbonCompare(slugA: string, slugB: string, locale: string = "en"): Promise<CarbonCompareDefinition | undefined> {
    const slug = buildComparisonSlug(slugA, slugB);
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("carbon_compares")
        .select("slug, content")
        .eq("slug", slug)
        .single<CarbonCompareRow>();

    if (error || !data?.content) {
        return getSeedCarbonCompare(slug, locale);
    }

    const baseContent = data.content.en;
    if (!baseContent) {
        return getSeedCarbonCompare(slug, locale);
    }

    return mergeCompareLocaleContent(slug, baseContent, data.content[locale]);
}
