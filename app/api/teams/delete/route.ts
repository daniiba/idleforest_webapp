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

// Delete a team (owner only)
export async function DELETE(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const teamId = searchParams.get('teamId')

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        // Get team info to verify ownership
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, created_by')
            .eq('id', teamId)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        // Only the owner can delete the team
        if (team.created_by !== user.id) {
            return NextResponse.json({
                error: 'Only the team owner can delete this team'
            }, { status: 403 })
        }

        // Delete the team (cascade will handle team_members and team_invites)
        const { error: deleteError } = await supabase
            .from('teams')
            .delete()
            .eq('id', teamId)

        if (deleteError) {
            console.error('Error deleting team:', deleteError)
            return NextResponse.json({ error: 'Failed to delete team' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            message: 'Team deleted successfully'
        })

    } catch (error) {
        console.error('Delete team error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
