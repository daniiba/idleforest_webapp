import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { finalizeActiveCompanyMembershipForUser } from '@/lib/company-node-points'

async function createSupabaseClient() {
    const cookieStore = await cookies()
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    } catch {
                        // Ignore - called from Server Component
                    }
                },
            },
        }
    )
}

export async function POST() {
    try {
        const supabase = await createSupabaseClient()
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admin = createAdminClient()
        await finalizeActiveCompanyMembershipForUser(admin, user.id, 'left')

        const { error: updateError } = await supabase
            .from('profiles')
            .update({
                company_id: null,
                company_joined_at: null,
                company_points_baseline: 0,
            })
            .eq('user_id', user.id)

        if (updateError) {
            console.error('Error leaving company:', updateError)
            return NextResponse.json({ error: 'Failed to leave company' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Leave company error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
