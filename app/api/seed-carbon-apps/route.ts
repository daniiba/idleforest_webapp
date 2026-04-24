import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CARBON_SEED_DATA } from '@/lib/carbon-seed-data';
import { CARBON_HUB_SEED_DATA } from '@/lib/carbon-hub-seed-data';
import { CARBON_COMPARE_SEED_DATA } from '@/lib/carbon-compare-seed-data';

async function seedCarbonAppsToSupabase() {
    try {
        const supabase = createAdminClient();

        // Map the hardcoded TypeScript data into our new database schema format
        const rows = CARBON_SEED_DATA.map((app) => {
            const englishSeo = app.seo_content?.en;

            return {
                slug: app.slug,
                app_name: app.app_name,
                category: app.category,
                co2_per_hour_grams: app.co2_per_hour_grams,
                avg_usage_hours_day: app.avg_usage_hours_day,
                idleforest_pitch: englishSeo?.idleforest_pitch || null,
                human_equivalent_comparison: englishSeo?.human_equivalent_comparison || null,
                seo_content: app.seo_content || null
            };
        });

        // Upsert pushes to Supabase, replacing old data if the slug already exists
        const { error: appsError } = await supabase
            .from('carbon_apps')
            .upsert(rows, { onConflict: 'slug' });

        if (appsError) {
            console.error("Supabase Error:", appsError);
            return NextResponse.json({ success: false, error: appsError.message }, { status: 500 });
        }

        const hubRows = CARBON_HUB_SEED_DATA.map((hub) => ({
            slug: hub.slug,
            content: hub.content,
        }));

        const { error: hubsError } = await supabase
            .from('carbon_hubs')
            .upsert(hubRows, { onConflict: 'slug' });

        if (hubsError) {
            console.error("Supabase Error:", hubsError);
            return NextResponse.json({ success: false, error: hubsError.message }, { status: 500 });
        }

        const compareRows = CARBON_COMPARE_SEED_DATA.map((comparison) => ({
            slug: comparison.slug,
            content: comparison.content,
        }));

        const { error: comparesError } = await supabase
            .from('carbon_compares')
            .upsert(compareRows, { onConflict: 'slug' });

        if (comparesError) {
            console.error("Supabase Error:", comparesError);
            return NextResponse.json({ success: false, error: comparesError.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${rows.length} apps, ${hubRows.length} hubs, and ${compareRows.length} comparisons to Supabase!` 
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function GET() {
    return seedCarbonAppsToSupabase();
}

export async function POST() {
    return seedCarbonAppsToSupabase();
}
