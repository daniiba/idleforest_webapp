import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
    getCanonicalCompanySlug,
    isSilveiraCompanyIdentity,
    isSilveiraCompanySlug,
    isWastefreeCompanyIdentity,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'
import { createCompanyMembershipForUser, finalizeActiveCompanyMembershipForUser } from '@/lib/company-node-points'

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

        const { inviteCode, companySlug, confirmSwitch, isNewSignup } = await request.json()

        if (!inviteCode && !companySlug) {
            return NextResponse.json({ error: 'Invite code or company slug is required' }, { status: 400 })
        }

        const assignUserToCompany = async (targetCompany: { id: string; name: string; slug: string }) => {
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('company_id, total_points, company_points_baseline, company_joined_at, companies(id, name, slug)')
                .eq('user_id', user.id)
                .single()

            if (profileError) {
                console.error('Error checking current company:', profileError)
                return NextResponse.json({ error: 'Failed to check current company' }, { status: 500 })
            }

            if (profile?.company_id === targetCompany.id) {
                if (profile.company_points_baseline === null || profile.company_joined_at === null) {
                    const { error: baselineError } = await supabase
                        .from('profiles')
                        .update({
                            company_points_baseline: profile.total_points || 0,
                            company_joined_at: new Date().toISOString(),
                        })
                        .eq('user_id', user.id)

                    if (baselineError) {
                        console.error('Error setting company points baseline:', baselineError)
                        return NextResponse.json({ error: 'Failed to update company points baseline' }, { status: 500 })
                    }
                }

                return NextResponse.json({
                    success: true,
                    team: { id: targetCompany.id, name: targetCompany.name, slug: targetCompany.slug, isCompany: true },
                    message: 'You are already in this company forest.'
                })
            }

            if (profile?.company_id && !confirmSwitch) {
                const currentCompany = profile.companies as unknown as { id: string; name: string; slug: string } | null

                return NextResponse.json({
                    error: 'You are already part of a company forest. Joining this one will switch your company forest.',
                    currentCompany: currentCompany
                        ? { id: currentCompany.id, name: currentCompany.name, slug: currentCompany.slug }
                        : { id: profile.company_id },
                    targetCompany: { id: targetCompany.id, name: targetCompany.name, slug: targetCompany.slug },
                    requiresConfirmation: true
                }, { status: 409 })
            }

            const admin = createAdminClient()
            if (profile?.company_id && profile.company_id !== targetCompany.id) {
                await finalizeActiveCompanyMembershipForUser(admin, user.id, 'switched')
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    company_id: targetCompany.id,
                    company_points_baseline: profile?.total_points || 0,
                    company_joined_at: new Date().toISOString(),
                })
                .eq('user_id', user.id)

            if (updateError) {
                console.error('Error assigning user to company:', updateError)
                return NextResponse.json({ error: 'Failed to join company' }, { status: 500 })
            }

            await createCompanyMembershipForUser(admin, targetCompany.id, user.id)

            return NextResponse.json({
                success: true,
                team: { id: targetCompany.id, name: targetCompany.name, slug: targetCompany.slug, isCompany: true },
                message: 'Successfully joined the company portal!'
            })
        }

        // First, check if it's a company invite
        const { data: company } = inviteCode
            ? await supabase
                  .from('companies')
                  .select('id, name, slug')
                  .eq('invite_code', inviteCode)
                  .single()
            : { data: null }

        if (company) {
            return assignUserToCompany(company)
        }

        if (companySlug) {
            const canonicalCompanySlug = getCanonicalCompanySlug(companySlug)
            const { data: publicCompany, error: publicCompanyError } = await supabase
                .from('companies')
                .select('id, name, slug, website, is_invite_only')
                .eq('slug', canonicalCompanySlug)
                .single()

            if (publicCompanyError || !publicCompany) {
                return NextResponse.json({ error: 'Company not found' }, { status: 404 })
            }

            const isPublicPartnerCompany =
                isSilveiraCompanySlug(companySlug) ||
                isSilveiraCompanyIdentity(publicCompany) ||
                isWastefreeCompanySlug(companySlug) ||
                isWastefreeCompanyIdentity(publicCompany)

            if (publicCompany.is_invite_only && !isPublicPartnerCompany) {
                return NextResponse.json({ error: 'This company requires an invite code' }, { status: 403 })
            }

            return assignUserToCompany(publicCompany)
        }

        // If not a company invite, check if it's a team invite
        const { data: invite, error: inviteError } = await supabase
            .from('team_invites')
            .select(`
                id,
                team_id,
                uses_remaining,
                expires_at,
                teams (
                    id,
                    name,
                    slug
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
