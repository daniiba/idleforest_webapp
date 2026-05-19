import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const DESKTOP_INSTALL_REWARD_TYPE = 'desktop_first_connect'
const DESKTOP_INSTALL_BONUS_TREES = 5
const ONE_CLICK_IMPACT_API_KEY = process.env.ONE_CLICK_IMPACT_API_KEY

export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const admin = createAdminClient()

        const { data: desktopNodes, error: nodesError } = await admin
            .from('nodes')
            .select('id, platform')
            .eq('user_id', user.id)
            .in('platform', ['win32', 'darwin'])
            .limit(1)

        if (nodesError) {
            console.error('Desktop reward node lookup failed', nodesError)
            return NextResponse.json({ error: 'Failed to verify desktop app connection' }, { status: 500 })
        }

        const desktopNode = desktopNodes?.[0]
        if (!desktopNode) {
            return NextResponse.json({
                eligible: false,
                awarded: false,
                trees: 0,
                message: 'Connect the desktop app before claiming this reward.'
            }, { status: 409 })
        }

        const { data: profile } = await admin
            .from('profiles')
            .select('display_name, company_id')
            .eq('user_id', user.id)
            .maybeSingle()

        const { data: existingReward } = await admin
            .from('user_rewards')
            .select('id, status, trees_awarded, company_id')
            .eq('user_id', user.id)
            .eq('reward_type', DESKTOP_INSTALL_REWARD_TYPE)
            .maybeSingle()

        let reward = existingReward

        if (!reward) {
            const { data: insertedReward, error: insertError } = await admin
                .from('user_rewards')
                .insert({
                    user_id: user.id,
                    reward_type: DESKTOP_INSTALL_REWARD_TYPE,
                    trees_awarded: DESKTOP_INSTALL_BONUS_TREES,
                    node_id: String(desktopNode.id),
                    company_id: profile?.company_id || null,
                    status: 'pending'
                })
                .select('id, status, trees_awarded, company_id')
                .single()

            if (insertError) {
                const { data: duplicateReward } = await admin
                    .from('user_rewards')
                    .select('id, status, trees_awarded, company_id')
                    .eq('user_id', user.id)
                    .eq('reward_type', DESKTOP_INSTALL_REWARD_TYPE)
                    .maybeSingle()

                reward = duplicateReward
            } else {
                reward = insertedReward
            }
        }

        if (!reward) {
            return NextResponse.json({ error: 'Failed to create reward' }, { status: 500 })
        }

        if (reward.status === 'awarded') {
            if (!reward.company_id && profile?.company_id) {
                await admin
                    .from('user_rewards')
                    .update({
                        company_id: profile.company_id,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', reward.id)
            }

            return NextResponse.json({
                eligible: true,
                awarded: true,
                alreadyAwarded: true,
                trees: reward.trees_awarded || DESKTOP_INSTALL_BONUS_TREES
            })
        }

        if (reward.status === 'processing') {
            return NextResponse.json({
                eligible: true,
                awarded: false,
                processing: true,
                trees: reward.trees_awarded || DESKTOP_INSTALL_BONUS_TREES,
                message: 'Reward is already being processed.'
            }, { status: 202 })
        }

        const { data: claimedReward, error: claimError } = await admin
            .from('user_rewards')
            .update({
                status: 'processing',
                trees_awarded: DESKTOP_INSTALL_BONUS_TREES,
                node_id: String(desktopNode.id),
                company_id: profile?.company_id || reward.company_id || null,
                updated_at: new Date().toISOString(),
                error_message: null
            })
            .eq('id', reward.id)
            .in('status', ['pending', 'failed'])
            .select('id, trees_awarded')
            .single()

        if (claimError || !claimedReward) {
            return NextResponse.json({
                eligible: true,
                awarded: false,
                processing: true,
                trees: reward.trees_awarded || DESKTOP_INSTALL_BONUS_TREES,
                message: 'Reward is already being processed.'
            }, { status: 202 })
        }

        try {
            if (!ONE_CLICK_IMPACT_API_KEY) {
                throw new Error('Missing 1ClickImpact API key')
            }

            const plantResponse = await fetch('https://api.1clickimpact.com/v1/plant_tree', {
                method: 'POST',
                headers: {
                    'x-api-key': ONE_CLICK_IMPACT_API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: DESKTOP_INSTALL_BONUS_TREES,
                    customer_email: user.email,
                    customer_name: profile?.display_name || user.user_metadata?.display_name || 'IdleForest User',
                    category: 'food'
                })
            })

            const responseText = await plantResponse.text()

            if (!plantResponse.ok) {
                throw new Error(responseText || 'Failed to plant desktop bonus trees')
            }

            let providerResponse = null
            try {
                providerResponse = responseText ? JSON.parse(responseText) : null
            } catch {
                providerResponse = { raw: responseText }
            }

            await admin
                .from('user_rewards')
                .update({
                    status: 'awarded',
                    provider: '1ClickImpact',
                    provider_response: providerResponse,
                    awarded_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    error_message: null
                })
                .eq('id', claimedReward.id)

            await admin.from('onboarding_events').insert({
                user_id: user.id,
                event_name: 'desktop_reward_awarded',
                source: 'desktop_install_reward_api',
                metadata: {
                    trees: DESKTOP_INSTALL_BONUS_TREES,
                    nodeId: String(desktopNode.id),
                    companyId: profile?.company_id || reward.company_id || null
                }
            })

            return NextResponse.json({
                eligible: true,
                awarded: true,
                alreadyAwarded: false,
                trees: DESKTOP_INSTALL_BONUS_TREES
            })
        } catch (rewardError) {
            console.error('Desktop install reward failed', rewardError)

            await admin
                .from('user_rewards')
                .update({
                    status: 'failed',
                    error_message: rewardError instanceof Error ? rewardError.message : 'Unknown reward error',
                    updated_at: new Date().toISOString()
                })
                .eq('id', claimedReward.id)

            return NextResponse.json({
                eligible: true,
                awarded: false,
                trees: DESKTOP_INSTALL_BONUS_TREES,
                error: 'Desktop app connected, but the bonus could not be awarded yet. Please try again.'
            }, { status: 503 })
        }
    } catch (error) {
        console.error('Desktop reward error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
