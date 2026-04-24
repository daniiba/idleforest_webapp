import { createClient } from "@/lib/supabase/server";

export interface CarbonSeoFaq {
    question: string;
    answer: string;
}

export interface CarbonSeoReviewer {
    name: string;
    role: string;
    organization: string;
}

export interface CarbonSeoSourceReference {
    title: string;
    url: string;
    note: string;
}

export interface CarbonSeoContent {
    intro: string;
    searchTopics?: string[];
    faq?: CarbonSeoFaq[];
    idleforest_pitch?: string;
    human_equivalent_comparison?: string;
    methodology_title?: string;
    methodology_summary?: string;
    methodology_bullets?: string[];
    reviewed_at?: string;
    reviewer?: CarbonSeoReviewer;
    key_drivers?: string[];
    assumptions?: string[];
    reduction_tips?: string[];
    uncertainty?: string;
    source_references?: CarbonSeoSourceReference[];
}

export interface CarbonData {
    app_name: string;
    category: string;
    avg_usage_hours_day: number | "N/A";
    co2_per_hour_grams: number;
    yearly_impact_kg: number;
    human_equivalent: string;
    trees_to_offset: number;
    idleforest_pitch: string;
    slug: string;
    seo_content?: Record<string, CarbonSeoContent>;
    seo?: CarbonSeoContent;
}

export function mapDbToCarbonData(dbRow: any): CarbonData {
    const avgUsageRaw = dbRow.avg_usage_hours_day;
    const avgUsage = avgUsageRaw === "N/A" || avgUsageRaw === null ? "N/A" : parseFloat(avgUsageRaw);
    const co2 = parseFloat(dbRow.co2_per_hour_grams);
    
    let yearlyImpact = 0;
    if (avgUsage !== "N/A") {
        yearlyImpact = (co2 * (avgUsage as number) * 365) / 1000;
    } else {
        // Special case for per-transaction apps like Crypto (Bitcoin/Ethereum)
        // In the original data, co2 was per hour, but for crypto it was used as per transaction.
        // We'll maintain the basic mapping principle used in original statics.
        yearlyImpact = co2 / 1000; 
    }

    return {
        slug: dbRow.slug,
        app_name: dbRow.app_name,
        category: dbRow.category,
        co2_per_hour_grams: co2,
        avg_usage_hours_day: avgUsage,
        idleforest_pitch: dbRow.idleforest_pitch,
        human_equivalent: dbRow.human_equivalent_comparison,
        yearly_impact_kg: Math.round(yearlyImpact * 10) / 10,
        trees_to_offset: Math.ceil(yearlyImpact / 20),
        seo_content: dbRow.seo_content,
    };
}

export function localizeCarbonData(data: CarbonData, locale: string): CarbonData {
    const baseSeo = data.seo_content?.en;
    const localizedSeo = data.seo_content?.[locale];
    const seo = localizedSeo ? { ...baseSeo, ...localizedSeo } : baseSeo;

    if (!seo) {
        return data;
    }

    return {
        ...data,
        seo,
        idleforest_pitch: seo.idleforest_pitch || data.idleforest_pitch,
        human_equivalent: seo.human_equivalent_comparison || data.human_equivalent,
    };
}

export function getIconUrl(data: CarbonData): string {
    // Manual overrides for icons that don't match slug or need special simple-icons slugs
    const overrides: Record<string, string> = {
        "chatgpt": "ollama",
        "league-of-legends": "leagueoflegends",
        "google-chrome": "googlechrome",
        "google-meet": "googlemeet",
        "twitter": "x",
        "minecraft": "fallback:gamepad",
        "microsoft-teams": "fallback:users",
        "roblox": "roblox"
    };

    const iconSlug = overrides[data.slug] || data.slug.replace(/-/g, "");
    
    if (iconSlug.startsWith("fallback:")) {
        return iconSlug;
    }
    
    return `https://cdn.simpleicons.org/${iconSlug}`;
}

export async function getAllCarbonData(): Promise<CarbonData[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('carbon_apps')
        .select('*');

    if (error || !data) return [];
    return data.map(mapDbToCarbonData);
}

export async function getCarbonData(slug: string): Promise<CarbonData | undefined> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('carbon_apps')
        .select('*')
        .eq('slug', slug)
        .single();

    if (error || !data) return undefined;
    return mapDbToCarbonData(data);
}

export async function getAllSlugs(): Promise<string[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('carbon_apps')
        .select('slug');

    if (error || !data) return [];
    return data.map((item) => item.slug);
}

export async function getCarbonCategories(): Promise<{ category: string; items: CarbonData[] }[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('carbon_apps')
        .select('*');

    if (error || !data) return [];

    const transformed = data.map(mapDbToCarbonData);

    const grouped = transformed.reduce<Record<string, CarbonData[]>>((acc, item) => {
        acc[item.category] = acc[item.category] || [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return Object.entries(grouped).map(([category, items]) => ({
        category,
        items: items.sort((a, b) => a.app_name.localeCompare(b.app_name)),
    }));
}

export async function getFeaturedCarbonPages(limit: number = 6): Promise<CarbonData[]> {
    const featuredSlugs = ["chatgpt", "instagram", "tiktok", "youtube", "netflix", "zoom"];
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('carbon_apps')
        .select('*')
        .in('slug', featuredSlugs)
        .limit(limit);

    if (error || !data) return [];
    
    const transformed = data.map(mapDbToCarbonData);
    // Maintain the order of featured slugs
    return transformed.sort((a, b) => featuredSlugs.indexOf(a.slug) - featuredSlugs.indexOf(b.slug));
}

export async function getRelatedCarbonData(currentSlug: string, category: string, limit: number = 3): Promise<CarbonData[]> {
    const supabase = await createClient();
    
    // 1. Fetch by category
    const { data: related, error } = await supabase
        .from('carbon_apps')
        .select('*')
        .eq('category', category)
        .neq('slug', currentSlug)
        .limit(limit);

    if (error) return [];

    let items = (related || []).map(mapDbToCarbonData);

    // 2. If not enough, fill with others
    if (items.length < limit) {
        const { data: others } = await supabase
            .from('carbon_apps')
            .select('*')
            .neq('category', category)
            .neq('slug', currentSlug)
            .limit(limit - items.length);
        
        if (others) {
            items = [...items, ...others.map(mapDbToCarbonData)];
        }
    }

    return items.slice(0, limit);
}
