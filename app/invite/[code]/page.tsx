import { Metadata } from 'next'
import { createClient as createServerClient } from '@/lib/supabase/server'
import InvitePageClient from './InvitePageClient'

type Props = {
    params: Promise<{ code: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { code } = await params
    const supabase = await createServerClient()

    try {
        // Fetch invite details
        const { data: invite } = await supabase
            .from('team_invites')
            .select('team_id, created_by')
            .eq('invite_code', code)
            .single()

        if (!invite) {
            return {
                title: 'Team Invite | IdleForest',
                description: 'Join a team on IdleForest and plant trees together!',
            }
        }

        // Fetch team details
        const { data: team } = await supabase
            .from('teams')
            .select('name, description, total_points, image_url')
            .eq('id', invite.team_id)
            .single()

        // Fetch inviter details
        const { data: inviter } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', invite.created_by)
            .single()

        // Get member count
        const { count: memberCount } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', invite.team_id)

        const teamName = team?.name || 'a team'
        const inviterName = inviter?.display_name || 'A friend'
        const description = team?.description
            ? `${team.description} • ${memberCount || 0} members • ${(team.total_points || 0).toLocaleString()} points`
            : `Join ${teamName} on IdleForest! ${memberCount || 0} members planting trees together.`

        const ogImage = team?.image_url || '/preview.png'

        return {
            title: `${inviterName} invited you to join ${teamName} | IdleForest`,
            description: `${inviterName} invited you to join ${teamName} and plant trees together! ${memberCount || 0} members • ${(team?.total_points || 0).toLocaleString()} points`,
            openGraph: {
                title: `🌲 ${inviterName} invited you to join ${teamName}`,
                description: `Join ${teamName} on IdleForest and plant trees together! ${memberCount || 0} members planting trees.`,
                images: [
                    {
                        url: ogImage,
                        width: 1200,
                        height: 630,
                        alt: `Join ${teamName} on IdleForest`,
                    },
                ],
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `🌲 ${inviterName} invited you to join ${teamName}`,
                description: `Join ${teamName} on IdleForest and plant trees together!`,
                images: [ogImage],
            },
        }
    } catch (error) {
        console.error('Error generating invite metadata:', error)
        return {
            title: 'Team Invite | IdleForest',
            description: 'Join a team on IdleForest and plant trees together!',
        }
    }
}

export default function InvitePage() {
    return <InvitePageClient />
}
