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

// Helper to create a slug from a name
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-')     // Replace spaces with hyphens
        .replace(/-+/g, '-')      // Remove duplicate hyphens
        .trim()
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

        const { name, description, imageUrl, discordGuildId } = await request.json()

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
        const { data: existingTeamMember } = await supabase
            .from('team_members')
            .select(`
                id, 
                team_id, 
                role,
                teams (
                    name,
                    slug,
                    discord_guild_id
                )
            `)
            .eq('user_id', user.id)
            .limit(1)

        if (existingTeamMember && existingTeamMember.length > 0) {
            const member = existingTeamMember[0]
            // @ts-ignore - Supabase type inference might be tricky with nested joins
            const team = member.teams

            return NextResponse.json({
                error: 'You are already a member of a team. You can only be part of one team at a time.',
                conflictTeamId: member.team_id,
                conflictTeamRole: member.role,
                conflictTeamName: team?.name,
                conflictTeamSlug: team?.slug,
                conflictHasDiscord: !!team?.discord_guild_id
            }, { status: 409 })
        }

        // Generate base slug
        const baseSlug = createSlug(teamName) || 'team'
        let slug = baseSlug
        let attempt = 0

        while (attempt < 5) {
            // Check if slug exists
            const { data: existingSlug } = await supabase
                .from('teams')
                .select('slug')
                .eq('slug', slug)
                .single()

            if (!existingSlug) {
                break
            }

            // If exists, append random number
            const randomSuffix = Math.floor(Math.random() * 10000)
            slug = `${baseSlug}-${randomSuffix}`
            attempt++
        }

        // Create the team
        const { data: team, error: createError } = await supabase
            .from('teams')
            .insert({
                name: teamName,
                description: teamDescription,
                image_url: teamImageUrl,
                created_by: user.id,
                total_points: 0,
                slug: slug,
                discord_guild_id: discordGuildId || null
            })
            .select()
            .single()

        if (createError) {
            // Check for unique violation on discord_guild_id
            if (createError.code === '23505' && discordGuildId) {
                // Fetch the existing team to return it
                const { data: existingTeam } = await supabase
                    .from('teams')
                    .select()
                    .eq('discord_guild_id', discordGuildId)
                    .single()

                if (existingTeam) {
                    // Check if the current user is a member of this team
                    const { data: isMember } = await supabase
                        .from('team_members')
                        .select('id')
                        .eq('team_id', existingTeam.id)
                        .eq('user_id', user.id)
                        .single()

                    if (!isMember) {
                        // Add them to the team if not already (though earlier check prevented 1 user > 1 team, 
                        // but maybe they are not in a team yet but this team exists)
                        const { error: joinError } = await supabase
                            .from('team_members')
                            .insert({
                                team_id: existingTeam.id,
                                user_id: user.id,
                                contribution_points: 0,
                                role: 'member' // Default role
                            })

                        if (joinError) {
                            console.error('Error joining existing Discord team:', joinError)
                        }
                    }

                    return NextResponse.json({
                        success: true,
                        team: existingTeam,
                        message: 'Team already active!'
                    })
                }
            }

            console.error('Error creating team:', createError)
            return NextResponse.json({ error: 'Failed to create team' }, { status: 500 })
        }

        // Add creator as the first team member
        const { error: memberError } = await supabase
            .from('team_members')
            .insert({
                team_id: team.id,
                user_id: user.id,
                contribution_points: 0,
                role: 'owner'
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
