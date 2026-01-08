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

// Update team details (owner only)
export async function PATCH(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { teamId, description, imageUrl } = await request.json()

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        // Verify user is the team owner
        const { data: team, error: teamError } = await supabase
            .from('teams')
            .select('id, created_by')
            .eq('id', teamId)
            .single()

        if (teamError || !team) {
            return NextResponse.json({ error: 'Team not found' }, { status: 404 })
        }

        if (team.created_by !== user.id) {
            return NextResponse.json({ error: 'Only the team owner can update team details' }, { status: 403 })
        }

        // Validate description
        const teamDescription = description?.trim() ?? null
        if (teamDescription && teamDescription.length > 500) {
            return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
        }

        // Build update object - only include fields that were provided
        const updateData: { description?: string | null; image_url?: string | null } = {}

        if (description !== undefined) {
            updateData.description = teamDescription
        }

        if (imageUrl !== undefined) {
            updateData.image_url = imageUrl?.trim() || null
        }

        // Update the team
        const { data: updatedTeam, error: updateError } = await supabase
            .from('teams')
            .update(updateData)
            .eq('id', teamId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating team:', updateError)
            return NextResponse.json({ error: 'Failed to update team' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            team: updatedTeam,
            message: 'Team updated successfully!'
        })

    } catch (error) {
        console.error('Update team error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
