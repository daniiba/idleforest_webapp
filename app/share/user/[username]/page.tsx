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
        // The share preview shows the member's forest island.
        const image = `${process.env.NEXT_PUBLIC_APP_URL || 'https://www.idleforest.com'}/api/og/forest?${new URLSearchParams({ displayName }).toString()}`

        return {
            title: `${displayName}'s Stats | IdleForest`,
            description: `${displayName} has earned ${points.toLocaleString()} points planting trees on IdleForest!`,
            openGraph: {
                title: `🌲 ${displayName} - Forest Guardian Stats`,
                description: `${points.toLocaleString()} points • Planting trees by sharing unused bandwidth!`,
                type: 'website',
                images: [{ url: image, width: 1200, height: 630, alt: `${displayName}'s forest` }],
            },
            twitter: {
                card: 'summary_large_image',
                title: `🌲 ${displayName} - Forest Guardian Stats`,
                description: `${points.toLocaleString()} points on IdleForest`,
                images: [image],
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
