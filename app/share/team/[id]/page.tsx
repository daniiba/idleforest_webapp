import { Metadata } from 'next'
import { createClient as createServerClient } from '@/lib/supabase/server'
import TeamShareClient from './TeamShareClient'

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params
    const supabase = await createServerClient()

    try {
        const { data: team } = await supabase
            .from('teams')
            .select('name, description, total_points, image_url')
            .eq('id', id)
            .single()

        const { count: memberCount } = await supabase
            .from('team_members')
            .select('*', { count: 'exact', head: true })
            .eq('team_id', id)

        const teamName = team?.name || 'Team'
        const description = team?.description
            ? `${team.description} • ${memberCount || 0} members • ${(team.total_points || 0).toLocaleString()} points`
            : `Join ${teamName} on IdleForest! ${memberCount || 0} members planting trees together.`

        return {
            title: `${teamName} Stats | IdleForest`,
            description,
            openGraph: {
                title: `🌲 ${teamName} - Team Stats`,
                description: `${memberCount || 0} members • ${(team?.total_points || 0).toLocaleString()} points • Planting trees together!`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `🌲 ${teamName} - Team Stats`,
                description: `${memberCount || 0} members • ${(team?.total_points || 0).toLocaleString()} points`,
            },
        }
    } catch {
        return {
            title: 'Team Stats | IdleForest',
            description: 'View team stats and plant trees together!',
        }
    }
}

export default function TeamSharePage() {
    return <TeamShareClient />
}
