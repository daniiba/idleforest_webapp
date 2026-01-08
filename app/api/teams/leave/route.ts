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

// Leave a team
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { teamId } = await request.json()

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        // Get team info to check if user is the owner
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, created_by')
            .eq('id', teamId)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        // Prevent team owner from leaving (they must delete the team instead)
        if (team.created_by === user.id) {
            return NextResponse.json({
                error: 'As the team owner, you cannot leave. Delete the team instead.'
            }, { status: 403 })
        }

        // Check if user is a member of this team
        const { data: membership, error: memberError } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', user.id)
            .single()

        if (memberError || !membership) {
            return NextResponse.json({ error: 'You are not a member of this team' }, { status: 404 })
        }

        // Remove user from team
        const { error: deleteError } = await supabase
            .from('team_members')
            .delete()
            .eq('team_id', teamId)
            .eq('user_id', user.id)

        if (deleteError) {
            console.error('Error leaving team:', deleteError)
            return NextResponse.json({ error: 'Failed to leave team' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Successfully left the team'
        })

    } catch (error) {
        console.error('Leave team error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
