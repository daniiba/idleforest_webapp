import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

// Join a team via invite code
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { inviteCode, confirmSwitch, isNewSignup } = await request.json()

        if (!inviteCode) {
            return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
        }

        // Find the invite
        const { data: invite, error: inviteError } = await supabase
            .from('team_invites')
            .select(`
                id,
                team_id,
                uses_remaining,
                expires_at,
                teams (
                    id,
                    name
                )
            `)
            .eq('invite_code', inviteCode)
            .single()

        if (inviteError || !invite) {
            return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
        }

        // Check if invite has expired
        if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
            return NextResponse.json({ error: 'This invite has expired' }, { status: 410 })
        }

        // Check if invite has remaining uses
        if (invite.uses_remaining !== null && invite.uses_remaining <= 0) {
            return NextResponse.json({ error: 'This invite has no remaining uses' }, { status: 410 })
        }

        // Check if user is already a member of ANY team (1 team max constraint)
        const { data: existingAnyTeam } = await supabase
            .from('team_members')
            .select('id, team_id, teams(id, name)')
            .eq('user_id', user.id)
            .limit(1)

        if (existingAnyTeam && existingAnyTeam.length > 0) {
            const existingTeam = existingAnyTeam[0]

            // Check if trying to join the same team
            if (existingTeam.team_id === invite.team_id) {
                return NextResponse.json({
                    error: 'You are already a member of this team.',
                }, { status: 409 })
            }

            // User is in a different team - check if they want to switch
            if (!confirmSwitch) {
                // Return current team info so UI can show warning
                return NextResponse.json({
                    error: 'You are already a member of a team. Joining this team will remove you from your current team.',
                    currentTeam: existingTeam.teams,
                    requiresConfirmation: true
                }, { status: 409 })
            }

            // Check if user owns their current team - owners can't switch, they must delete first
            const { data: currentTeamData } = await supabase
                .from('teams')
                .select('created_by')
                .eq('id', existingTeam.team_id)
                .single()

            if (currentTeamData?.created_by === user.id) {
                return NextResponse.json({
                    error: 'You are the owner of your current team. Delete your team before joining a new one.',
                    isOwner: true
                }, { status: 403 })
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
                team_id: invite.team_id,
                user_id: user.id,
                contribution_points: 0
            })

        if (joinError) {
            console.error('Error joining team:', joinError)
            return NextResponse.json({ error: 'Failed to join team' }, { status: 500 })
        }

        // Decrement uses_remaining if it's limited
        if (invite.uses_remaining !== null) {
            await supabase
                .from('team_invites')
                .update({ uses_remaining: invite.uses_remaining - 1 })
                .eq('id', invite.id)
        }

        // Log invite usage for analytics (using admin client to bypass RLS)
        try {
            const adminSupabase = createAdminClient()
            await adminSupabase
                .from('team_invite_uses')
                .insert({
                    invite_id: invite.id,
                    user_id: user.id,
                    team_id: invite.team_id,
                    is_new_signup: isNewSignup || false
                })
        } catch (logError) {
            // Don't fail the join if logging fails
            console.error('Failed to log invite usage:', logError)
        }

        return NextResponse.json({
            success: true,
            team: invite.teams,
            message: 'Successfully joined the team!'
        })

    } catch (error) {
        console.error('Join team error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
