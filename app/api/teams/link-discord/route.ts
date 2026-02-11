import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

// Helper to create Supabase client for route handlers
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

// Link existing team to Discord
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { teamId, discordGuildId } = await request.json()

        if (!teamId || !discordGuildId) {
            return NextResponse.json({ error: 'Team ID and Discord Guild ID are required' }, { status: 400 })
        }

        // 1. Verify user is owner or admin of the team
        const { data: membership, error: memberError } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', teamId)
            .eq('user_id', user.id)
            .single()

        if (memberError || !membership) {
            return NextResponse.json({ error: 'You are not a member of this team' }, { status: 403 })
        }

        if (membership.role !== 'owner' && membership.role !== 'admin') {
            return NextResponse.json({ error: 'Only team owners or admins can link Discord servers' }, { status: 403 })
        }

        // 2. Check if team is already linked (optional, but good practice to double check or just overwrite)
        // We'll overwrite or update.

        // 3. Update the team
        const { data: team, error: updateError } = await supabase
            .from('teams')
            .update({ discord_guild_id: discordGuildId })
            .eq('id', teamId)
            .select()
            .single()

        if (updateError) {
            // Handle unique constraint violation if another team already uses this guild ID
            if (updateError.code === '23505') {
                return NextResponse.json({ error: 'This Discord server is already linked to another team.' }, { status: 409 })
            }
            console.error('Error linking Discord to team:', updateError)
            return NextResponse.json({ error: 'Failed to link Discord server' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            team: team,
            message: 'Team successfully connected to Discord!'
        })

    } catch (error) {
        console.error('Link Discord error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
