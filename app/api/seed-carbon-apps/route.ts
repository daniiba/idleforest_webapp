import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { CARBON_SEED_DATA } from '@/lib/carbon-seed-data';

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
        const { error } = await supabase
            .from('carbon_apps')
            .upsert(rows, { onConflict: 'slug' });

        if (error) {
            console.error("Supabase Error:", error);
            return NextResponse.json({ success: false, error: error.message }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully seeded ${rows.length} apps to your Supabase 'carbon_apps' table!` 
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
