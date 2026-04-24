'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { CARBON_SEED_DATA } from '@/lib/carbon-seed-data'
import { CARBON_HUB_SEED_DATA } from '@/lib/carbon-hub-seed-data'
import { CARBON_COMPARE_SEED_DATA } from '@/lib/carbon-compare-seed-data'
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

        const { error: appsError } = await supabase
            .from('carbon_apps')
            .upsert(rows, { onConflict: 'slug' })

        if (appsError) {
            console.error("Supabase Error:", appsError)
            return { success: false, error: appsError.message }
        }

        const hubRows = CARBON_HUB_SEED_DATA.map((hub) => ({
            slug: hub.slug,
            content: hub.content,
        }))

        const { error: hubsError } = await supabase
            .from('carbon_hubs')
            .upsert(hubRows, { onConflict: 'slug' })

        if (hubsError) {
            console.error("Supabase Error:", hubsError)
            return { success: false, error: hubsError.message }
        }

        const compareRows = CARBON_COMPARE_SEED_DATA.map((comparison) => ({
            slug: comparison.slug,
            content: comparison.content,
        }))

        const { error: comparesError } = await supabase
            .from('carbon_compares')
            .upsert(compareRows, { onConflict: 'slug' })

        if (comparesError) {
            console.error("Supabase Error:", comparesError)
            return { success: false, error: comparesError.message }
        }

        // Clear cache for all carbon footprint pages
        revalidatePath('/[locale]/carbon-footprint', 'layout')

        return { success: true, apps: rows.length, hubs: hubRows.length, compares: compareRows.length }
    } catch (e: any) {
        return { success: false, error: e.message }
    }
}
