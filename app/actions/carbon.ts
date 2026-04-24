'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { CARBON_SEED_DATA } from '@/lib/carbon-seed-data'
import { revalidatePath } from 'next/cache'

export async function seedCarbonApps() {
    try {
        const supabase = createAdminClient()
        
        // Map data to DB schema
        const rows = CARBON_SEED_DATA.map((app) => {
            const englishSeo = app.seo_content?.en

            return {
                slug: app.slug,
                app_name: app.app_name,
                category: app.category,
                co2_per_hour_grams: app.co2_per_hour_grams,
                avg_usage_hours_day: app.avg_usage_hours_day,
                idleforest_pitch: englishSeo?.idleforest_pitch || null,
                human_equivalent_comparison: englishSeo?.human_equivalent_comparison || null,
                seo_content: app.seo_content || null,
            }
        })

        const { data, error } = await supabase
            .from('carbon_apps')
            .upsert(rows, { onConflict: 'slug' })

        if (error) {
            console.error("Supabase Error:", error)
            return { success: false, error: error.message }
        }

        // Clear cache for all carbon footprint pages
        revalidatePath('/[locale]/carbon-footprint', 'layout')

        return { success: true, count: rows.length }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
