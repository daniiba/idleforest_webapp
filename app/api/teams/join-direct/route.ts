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

// Join a team directly by team ID
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { teamId, confirmSwitch } = await request.json()

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        // Verify team exists
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, name')
            .eq('id', teamId)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        // Check if user is already a member of ANY team (1 team max constraint)
        const { data: existingAnyTeam } = await supabase
            .from('team_members')
            .select('id, team_id, teams(id, name, created_by)')
            .eq('user_id', user.id)
            .limit(1)

        if (existingAnyTeam && existingAnyTeam.length > 0) {
            const existingTeam = existingAnyTeam[0]

            // Check if trying to join the same team
            if (existingTeam.team_id === teamId) {
                return NextResponse.json({
                    error: 'You are already a member of this team.',
                }, { status: 409 })
            }

            // Check if user owns their current team - owners can't switch
            const currentTeamData = existingTeam.teams as unknown as { id: string; name: string; created_by: string }
            if (currentTeamData?.created_by === user.id) {
                return NextResponse.json({
                    error: 'You are the owner of your current team. Delete your team before joining a new one.',
                    isOwner: true
                }, { status: 403 })
            }

            // User is in a different team - check if they want to switch
            if (!confirmSwitch) {
                // Return current team info so UI can show warning
                return NextResponse.json({
                    error: 'You are already a member of a team. Joining this team will remove you from your current team.',
                    currentTeam: { id: currentTeamData.id, name: currentTeamData.name },
                    requiresConfirmation: true
                }, { status: 409 })
            }

            // User confirmed switch - remove from old team first
            const { error: leaveError } = await supabase
                .from('team_members')
                .delete()
                .eq('id', existingTeam.id)

            if (leaveError) {
                console.error('Error leaving old team:', leaveError)
                return NextResponse.json({ error: 'Failed to leave current team' }, { status: 500 })
            }
        }

        // Add user to team
        const { error: joinError } = await supabase
            .from('team_members')
            .insert({
                team_id: teamId,
                user_id: user.id,
                contribution_points: 0
            })

        if (joinError) {
            console.error('Error joining team:', joinError)
            return NextResponse.json({ error: 'Failed to join team' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            team,
            message: 'Successfully joined the team!'
        })

    } catch (error) {
        console.error('Join team direct error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
