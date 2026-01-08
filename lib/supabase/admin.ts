import { createClient } from '@supabase/supabase-js'

// Admin client that bypasses RLS - use only for trusted server-side operations
// Requires SUPABASE_SERVICE_ROLE_KEY environment variable
export function createAdminClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Missing Supabase admin credentials')
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}
