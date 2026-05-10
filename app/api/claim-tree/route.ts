import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ONE_CLICK_IMPACT_API_KEY = process.env.ONE_CLICK_IMPACT_API_KEY; // In production, move to env var

export async function POST(request: Request) {
    try {
        const supabase = createAdminClient();
        const { token, action, payload } = await request.json();

        if (!token || !action) {
            return NextResponse.json({ error: 'Missing token or action' }, { status: 400 });
        }

        // 1. Validate Claim
        const { data: claim, error: claimError } = await supabase
            .from('pending_tree_claims')
            .select('*')
            .eq('claim_token', token)
            .single();

        if (claimError || !claim) {
            return NextResponse.json({ error: 'Invalid claim token' }, { status: 404 });
        }

        if (claim.claimed_at) {
            return NextResponse.json({ error: 'Trees already claimed' }, { status: 409 });
        }

        if (new Date(claim.expires_at) < new Date()) {
            return NextResponse.json({ error: 'Claim expired' }, { status: 410 });
        }

        // 2. Validate action & determine tree count
        let treesToPlant = 0;
        let generatedInviteCode: string | undefined;
        let joinedTeamId: string | undefined;
        let joinedTeamSlug: string | undefined;

        if (action === 'quick') {
            treesToPlant = 1;

        } else if (action === 'team_join_and_invite') {
            const teamId = payload?.teamId;

            if (!teamId) {
                return NextResponse.json({ error: 'Missing teamId for team_join_and_invite' }, { status: 400 });
            }
            joinedTeamId = teamId;

            // Verify team exists
            const { data: team } = await supabase.from('teams').select('id, name, slug').eq('id', teamId).single();
            if (!team) {
                return NextResponse.json({ error: 'Team not found' }, { status: 404 });
            }
            joinedTeamSlug = team.slug;
            treesToPlant = 2;

        } else if (action === 'team_create') {
            if (!payload?.name) {
                return NextResponse.json({ error: 'Missing name for team_create' }, { status: 400 });
            }
            treesToPlant = 2;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        const claimTimestamp = new Date().toISOString();

        // 3. Atomically consume the claim before calling the external planting API.
        // This prevents duplicate planting from double-clicks, retries, or parallel tabs.
        const { data: consumedClaim, error: consumeError } = await supabase
            .from('pending_tree_claims')
            .update({
                claimed_at: claimTimestamp,
                trees_earned: treesToPlant,
                claim_method: action
            })
            .eq('id', claim.id)
            .is('claimed_at', null)
            .select('id')
            .single();

        if (consumeError || !consumedClaim) {
            return NextResponse.json({ error: 'Trees already claimed' }, { status: 409 });
        }

        const reopenClaim = async () => {
            await supabase
                .from('pending_tree_claims')
                .update({
                    claimed_at: null,
                    trees_earned: 0,
                    claim_method: null
                })
                .eq('id', claim.id)
                .eq('claimed_at', claimTimestamp);
        };

        // 4. Perform any team action after the claim has been consumed.
        if (action === 'team_join_and_invite') {
            const teamId = payload.teamId;

            const { data: existingMember } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('team_id', teamId)
                .eq('user_id', claim.user_id)
                .single();

            if (!existingMember) {
                const { error: joinError } = await supabase
                    .from('team_members')
                    .insert({
                        team_id: teamId,
                        user_id: claim.user_id,
                        contribution_points: 0
                    });

                if (joinError) {
                    console.error('Join Error', joinError);
                    await reopenClaim();
                    return NextResponse.json({ error: 'Failed to join team' }, { status: 400 });
                }
            }

            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            const { error: inviteError } = await supabase
                .from('team_invites')
                .insert({
                    team_id: teamId,
                    created_by: claim.user_id,
                    invite_code: inviteCode
                });

            if (inviteError) {
                console.error('Invite Creation Error', inviteError);
                await reopenClaim();
                return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
            }

            generatedInviteCode = inviteCode;

        } else if (action === 'team_create') {
            const { data: newTeam, error: createError } = await supabase
                .from('teams')
                .insert({
                    name: payload.name,
                    description: payload.description,
                    created_by: claim.user_id,
                    total_points: 0
                })
                .select()
                .single();

            if (createError || !newTeam) {
                console.error('Team Creation Error', createError);
                await reopenClaim();
                return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
            }

            const { error: memberError } = await supabase.from('team_members').insert({
                team_id: newTeam.id,
                user_id: claim.user_id,
                contribution_points: 0
            });

            if (memberError) {
                console.error('Team Member Creation Error', memberError);
                await reopenClaim();
                return NextResponse.json({ error: 'Failed to create team membership' }, { status: 500 });
            }

            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            const { error: inviteError } = await supabase.from('team_invites').insert({
                team_id: newTeam.id,
                created_by: claim.user_id,
                invite_code: inviteCode
            });

            if (inviteError) {
                console.error('Invite Creation Error', inviteError);
                await reopenClaim();
                return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
            }

            generatedInviteCode = inviteCode;
            joinedTeamId = newTeam.id;
            joinedTeamSlug = newTeam.slug;
        }

        // 5. Plant Trees via 1ClickImpact
        try {
            const plantResponse = await fetch('https://api.1clickimpact.com/v1/plant_tree', {
                method: 'POST',
                headers: {
                    'x-api-key': ONE_CLICK_IMPACT_API_KEY!,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: treesToPlant,
                    customer_email: claim.email,
                    customer_name: claim.user_name || 'IdleForest User',
                    category: 'food'
                })
            });

            if (!plantResponse.ok) {
                console.error('1ClickImpact Error', await plantResponse.text());
                // We'll throw to trigger catch block and NOT mark as claimed
                throw new Error('Failed to plant trees');
            }

            // const treeData = await plantResponse.json();

        } catch (e) {
            console.error("Tree planting failed", e);

            await reopenClaim();

            return NextResponse.json({ error: 'Tree planting service unavailable. Please try again.' }, { status: 503 });
        }

        return NextResponse.json({ success: true, trees: treesToPlant, inviteCode: generatedInviteCode, teamId: joinedTeamId, teamSlug: joinedTeamSlug });

    } catch (error) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
