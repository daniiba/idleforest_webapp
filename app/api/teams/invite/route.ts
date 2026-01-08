import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'

// Generate a unique 8-character invite code
function generateInviteCode(): string {
    return crypto.randomBytes(4).toString('hex')
}

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

// Generate a new invite link for a team
export async function POST(request: Request) {
    try {
        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { teamId, usesRemaining, expiresInDays } = await request.json()

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        // Check if user is a member of this team
        const { data: membership, error: memberError } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', user.id)
            .single()

        if (memberError || !membership) {
            return NextResponse.json({ error: 'You must be a team member to create invites' }, { status: 403 })
        }

        // Check if user already has an invite for this team (limit 1 per user)
        const { data: existingInvite } = await supabase
            .from('team_invites')
            .select('id')
            .eq('team_id', teamId)
            .eq('created_by', user.id)
            .limit(1)

        if (existingInvite && existingInvite.length > 0) {
            return NextResponse.json({
                error: 'You already have an invite link. Delete it first to create a new one.'
            }, { status: 409 })
        }

        // Generate unique invite code
        const inviteCode = generateInviteCode()

        // Calculate expiration
        let expiresAt = null
        if (expiresInDays && expiresInDays > 0) {
            expiresAt = new Date()
            expiresAt.setDate(expiresAt.getDate() + expiresInDays)
        }

        // Create the invite
        const { data: invite, error: insertError } = await supabase
            .from('team_invites')
            .insert({
                team_id: teamId,
                created_by: user.id,
                invite_code: inviteCode,
                uses_remaining: usesRemaining || null,
                expires_at: expiresAt?.toISOString() || null
            })
            .select()
            .single()

        if (insertError) {
            console.error('Error creating invite:', insertError)
            return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
        }

        // Return the invite with the full URL - always use production URL
        const inviteUrl = `https://idleforest.com/invite/${inviteCode}`

        return NextResponse.json({
            invite,
            inviteUrl
        })

    } catch (error) {
        console.error('Invite creation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Get invites for a team
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const teamId = searchParams.get('teamId')

        if (!teamId) {
            return NextResponse.json({ error: 'Team ID is required' }, { status: 400 })
        }

        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Check if user is a member of this team
        const { data: membership } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamId)
            .eq('user_id', user.id)
            .single()

        if (!membership) {
            return NextResponse.json({ error: 'You must be a team member to view invites' }, { status: 403 })
        }

        // Get only the current user's invites for this team
        const { data: invites, error } = await supabase
            .from('team_invites')
            .select(`
                id,
                invite_code,
                uses_remaining,
                expires_at,
                created_at,
                created_by
            `)
            .eq('team_id', teamId)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
        }

        // Filter out expired invites
        interface Invite {
            id: string
            invite_code: string
            uses_remaining: number | null
            expires_at: string | null
            created_at: string
            created_by: string
        }

        const activeInvites = invites.filter((invite: Invite) => {
            if (!invite.expires_at) return true
            return new Date(invite.expires_at) > new Date()
        })

        // Fetch usage stats for these invites using admin client
        let invitesWithStats = activeInvites
        try {
            const adminSupabase = createAdminClient()
            const inviteIds = activeInvites.map((i: Invite) => i.id)

            if (inviteIds.length > 0) {
                const { data: usageData } = await adminSupabase
                    .from('team_invite_uses')
                    .select('invite_id, is_new_signup')
                    .in('invite_id', inviteIds)

                // Aggregate stats per invite
                const statsMap = new Map<string, { total_uses: number; new_signups: number }>()
                for (const invite of activeInvites) {
                    statsMap.set(invite.id, { total_uses: 0, new_signups: 0 })
                }
                if (usageData) {
                    for (const use of usageData) {
                        const stats = statsMap.get(use.invite_id)
                        if (stats) {
                            stats.total_uses++
                            if (use.is_new_signup) stats.new_signups++
                        }
                    }
                }

                invitesWithStats = activeInvites.map((invite: Invite) => ({
                    ...invite,
                    ...statsMap.get(invite.id)
                }))
            }
        } catch (statsError) {
            console.error('Failed to fetch invite stats:', statsError)
            // Continue without stats
        }

        return NextResponse.json({ invites: invitesWithStats })

    } catch (error) {
        console.error('Get invites error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// Delete/revoke an invite
export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const inviteId = searchParams.get('inviteId')

        if (!inviteId) {
            return NextResponse.json({ error: 'Invite ID is required' }, { status: 400 })
        }

        const supabase = await createSupabaseClient()

        // Check if user is authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Delete the invite (RLS will ensure only creator can delete)
        const { error } = await supabase
            .from('team_invites')
            .delete()
            .eq('id', inviteId)
            .eq('created_by', user.id)

        if (error) {
            return NextResponse.json({ error: 'Failed to delete invite' }, { status: 500 })
        }

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete invite error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
