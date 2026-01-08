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

// Create a new team
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, description, imageUrl } = await request.json()

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return NextResponse.json({ error: 'Team name is required' }, { status: 400 })
        }

        const teamName = name.trim()

        if (teamName.length > 50) {
            return NextResponse.json({ error: 'Team name must be 50 characters or less' }, { status: 400 })
        }

        const teamDescription = description?.trim() || null
        if (teamDescription && teamDescription.length > 500) {
            return NextResponse.json({ error: 'Description must be 500 characters or less' }, { status: 400 })
        }

        const teamImageUrl = imageUrl?.trim() || null

        // Check if user is already a member of any team (1 team max constraint)
        const { data: existingTeam } = await supabase
            .from('team_members')
            .select('id, team_id')
            .eq('user_id', user.id)
            .limit(1)

        if (existingTeam && existingTeam.length > 0) {
            return NextResponse.json({
                error: 'You are already a member of a team. You can only be part of one team at a time.',
            }, { status: 409 })
        }

        // Create the team
        const { data: team, error: createError } = await supabase
            .from('teams')
            .insert({
                name: teamName,
                description: teamDescription,
                image_url: teamImageUrl,
                created_by: user.id,
                total_points: 0
            })
            .select()
            .single()

        if (createError) {
            console.error('Error creating team:', createError)
            return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
        }

        // Add creator as the first team member
        const { error: memberError } = await supabase
            .from('team_members')
            .insert({
                team_id: team.id,
                user_id: user.id,
                contribution_points: 0
            })

        if (memberError) {
            console.error('Error adding creator to team:', memberError)
            // Clean up the team if we couldn't add the member
            await supabase.from('teams').delete().eq('id', team.id)
            return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
        }

        return NextResponse.json({
            success: true,
            team: team,
            message: 'Team created successfully!'
        })

    } catch (error) {
        console.error('Create team error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
