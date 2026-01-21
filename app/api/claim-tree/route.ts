import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const ONE_CLICK_IMPACT_API_KEY = process.env.ONE_CLICK_IMPACT_API_KEY; // In production, move to env var

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
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

        // 2. Perform Action & Determine Tree Count
        let treesToPlant = 0;
        let generatedInviteCode: string | undefined;

        // Start Supabase transaction (conceptually, by doing checks before actions)
        // Note: We'll do best-effort content updates.

        if (action === 'quick') {
            treesToPlant = 1;

        } else if (action === 'team_join_and_invite') {
            const teamId = payload?.teamId;

            if (!teamId) {
                return NextResponse.json({ error: 'Missing teamId for team_join_and_invite' }, { status: 400 });
            }

            // Verify team exists
            const { data: team } = await supabase.from('teams').select('id, name').eq('id', teamId).single();
            if (!team) {
                return NextResponse.json({ error: 'Team not found' }, { status: 404 });
            }

            // check if user is already a member
            const { data: existingMember } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('team_id', teamId)
                .eq('user_id', claim.user_id)
                .single();

            if (!existingMember) {
                // Add user to team if not already member
                const { error: joinError } = await supabase
                    .from('team_members')
                    .insert({
                        team_id: teamId,
                        user_id: claim.user_id,
                        contribution_points: 0
                    });

                if (joinError) {
                    console.error('Join Error', joinError);
                    return NextResponse.json({ error: 'Failed to join team' }, { status: 400 });
                }
            }

            // Generate Invite Code
            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            // Create Invite Record
            const { error: inviteError } = await supabase
                .from('team_invites')
                .insert({
                    team_id: teamId,
                    created_by: claim.user_id,
                    invite_code: inviteCode
                    // expires_at: ... (optional, default to null or some future date if schema requires)
                });

            if (inviteError) {
                console.error('Invite Creation Error', inviteError);
                return NextResponse.json({ error: 'Failed to generate invite' }, { status: 500 });
            }

            // Success: 2 Trees
            treesToPlant = 2;

            // Return invite code so frontend can display it
            // We'll attach it to the final response, need to store it temporarily
            // (Using a let or modifying the response structure at the end)
            // Let's modify the return structure at the end to include `inviteCode` if present.
            // For now, I'll assume I can attach it to a variable to include later.
            generatedInviteCode = inviteCode;

        } else if (action === 'team_create') {
            if (!payload?.name) {
                return NextResponse.json({ error: 'Missing name for team_create' }, { status: 400 });
            }

            // Create Team
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
                return NextResponse.json({ error: 'Failed to create team' }, { status: 500 });
            }

            // Add creator as member
            await supabase.from('team_members').insert({
                team_id: newTeam.id,
                user_id: claim.user_id,
                contribution_points: 0
            });

            // Also generate invite for new team?
            const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            await supabase.from('team_invites').insert({
                team_id: newTeam.id,
                created_by: claim.user_id,
                invite_code: inviteCode
            });
            generatedInviteCode = inviteCode;

            treesToPlant = 2;
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        // 3. Plant Trees via 1ClickImpact
        try {
            const plantResponse = await fetch('https://api.1clickimpact.com/v1/plant_tree', {
                method: 'POST',
                headers: {
                    'x-api-key': ONE_CLICK_IMPACT_API_KEY,
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
            // If planting fails, we revert the team join? Too complex for now.
            // We will return error and NOT mark claim as complete, so user can retry.
            // Side effect: User might be added to team but trees failed. 
            // Next retry: "Already member of team" error might block them.
            // Mitigation: In team_join check, if already member AND claim is valid, allow proceeding?
            // For now, simple fail.
            console.error("Tree planting failed", e);
            return NextResponse.json({ error: 'Tree planting service unavailable. Please try again.' }, { status: 503 });
        }

        // 4. Update Claim Record
        const { error: updateError } = await supabase
            .from('pending_tree_claims')
            .update({
                claimed_at: new Date().toISOString(),
                trees_earned: treesToPlant,
                claim_method: action
            })
            .eq('id', claim.id);

        if (updateError) {
            console.error('Failed to update claim record', updateError);
            return NextResponse.json({ error: 'Internal Error finalizing claim' }, { status: 500 });
        }

        return NextResponse.json({ success: true, trees: treesToPlant, inviteCode: generatedInviteCode });

    } catch (error) {
        console.error('Claim error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
