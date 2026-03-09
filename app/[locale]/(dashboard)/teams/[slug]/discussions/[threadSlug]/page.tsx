import { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ThreadDetailClient from './ThreadDetailClient'

interface PageProps {
    params: { slug: string; threadSlug: string }
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const supabase = await createClient()

    const { data: thread } = await supabase
        .from('team_threads')
        .select('title, content, team_id')
        .eq('slug', params.threadSlug)
        .single()

    if (!thread) {
        return { title: 'Thread Not Found' }
    }

    const { data: team } = await supabase
        .from('teams')
        .select('name, slug')
        .eq('id', thread.team_id)
        .single()

    if (!thread || !team) {
        return {
            title: 'Thread Not Found',
        }
    }

    return {
        title: `${thread.title} - ${team.name} | IdleForest`,
        description: thread.content.substring(0, 157) + '...',
    }
}

export default async function ThreadDetailPage({ params }: PageProps) {
    const supabase = await createClient()

    // Fetch thread data by slug
    const { data: thread, error: threadError } = await supabase
        .from('team_threads')
        .select('*')
        .eq('slug', params.threadSlug)
        .single()

    if (threadError || !thread) {
        notFound()
    }

    // Fetch author profile
    const { data: authorProfile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('user_id', thread.user_id)
        .single()

    // Fetch team data by slug
    const { data: team } = await supabase
        .from('teams')
        .select('name, slug, id')
        .eq('slug', params.slug)
        .single()

    // Fetch comments with profiles
    const { data: comments } = await supabase
        .from('team_comments')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true })

    const commentUserIds = comments?.map(c => c.user_id) || []
    const { data: commentProfiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', commentUserIds)

    const profileMap = new Map(commentProfiles?.map(p => [p.user_id, p]))

    const enrichedComments = comments?.map(c => ({
        ...c,
        user: profileMap.get(c.user_id) || { display_name: 'Anonymous' }
    })) || []

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Get user's role if they're a member
    let currentUserRole: 'owner' | 'admin' | 'member' | null = null
    if (user) {
        const { data: memberData } = await supabase
            .from('team_members')
            .select('role')
            .eq('team_id', team?.id)
            .eq('user_id', user.id)
            .single()

        if (memberData) {
            currentUserRole = memberData.role as 'owner' | 'admin' | 'member'
        }
    }

    const threadWithAuthor = {
        ...thread,
        user: authorProfile || { display_name: 'Anonymous' }
    }

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        "headline": thread.title,
        "text": thread.content,
        "author": {
            "@type": "Person",
            "name": authorProfile?.display_name || 'Anonymous'
        },
        "interactionStatistic": {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": thread.upvotes
        },
        "commentCount": comments?.length || 0,
        "datePublished": thread.created_at,
        "publisher": {
            "@type": "Organization",
            "name": "IdleForest",
            "logo": {
                "@type": "ImageObject",
                "url": "https://idleforest.com/logo.png"
            }
        }
    }

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <ThreadDetailClient
                thread={threadWithAuthor}
                comments={enrichedComments}
                teamName={team?.name || 'Team'}
                teamSlug={team?.slug || params.slug}
                currentUserId={user?.id || null}
                currentUserRole={currentUserRole}
            />
        </>
    )
}
