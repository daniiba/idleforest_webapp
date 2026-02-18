import { Metadata } from 'next'
import { createClient as createServerClient } from '@/lib/supabase/server'
import UserShareClient from './UserShareClient'

type Props = {
    params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { username } = await params
    const supabase = await createServerClient()

    try {
        const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, total_points')
            .ilike('display_name', decodeURIComponent(username))
            .single()

        const displayName = profile?.display_name || username
        const points = profile?.total_points || 0

        return {
            title: `${displayName}'s Stats | IdleForest`,
            description: `${displayName} has earned ${points.toLocaleString()} points planting trees on IdleForest!`,
            openGraph: {
                title: `🌲 ${displayName} - Forest Guardian Stats`,
                description: `${points.toLocaleString()} points • Planting trees by sharing unused bandwidth!`,
                type: 'website',
            },
            twitter: {
                card: 'summary_large_image',
                title: `🌲 ${displayName} - Forest Guardian Stats`,
                description: `${points.toLocaleString()} points on IdleForest`,
            },
        }
    } catch {
        return {
            title: 'User Stats | IdleForest',
            description: 'View stats and plant trees together!',
        }
    }
}

export default function UserSharePage() {
    return <UserShareClient />
}
