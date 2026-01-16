'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, TrendingUp, Clock, ArrowUp } from "lucide-react"
import Link from "next/link"

interface Thread {
    id: string
    slug: string
    title: string
    content: string
    created_at: string
    upvotes: number
    user_id: string
    user: {
        display_name: string
    } | null
    comment_count?: number
}

interface ThreadListProps {
    teamSlug: string
    teamId: string
    teamName: string
    currentUserRole: 'owner' | 'admin' | 'member' | null
}

export function ThreadList({ teamSlug, teamId, teamName, currentUserRole }: ThreadListProps) {
    const [threads, setThreads] = useState<Thread[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [sortBy, setSortBy] = useState<'recent' | 'top'>('recent')
    const supabase = createClient()

    useEffect(() => {
        fetchThreads()
    }, [teamId, sortBy])

    const fetchThreads = async () => {
        setIsLoading(true)
        try {
            // Fetch threads with slugs
            const { data: threadsData, error } = await supabase
                .from('team_threads')
                .select('id, slug, title, content, created_at, upvotes, user_id')
                .eq('team_id', teamId)
                .order(sortBy === 'recent' ? 'created_at' : 'upvotes', { ascending: false })
                .limit(10)

            if (error) throw error

            if (threadsData) {
                // Get unique user IDs
                const userIds = Array.from(new Set(threadsData.map(t => t.user_id)))

                // Fetch profiles
                const { data: profilesData } = await supabase
                    .from('profiles')
                    .select('user_id, display_name')
                    .in('user_id', userIds)

                const profileMap = new Map(profilesData?.map(p => [p.user_id, p]))

                // Fetch comment counts
                const { data: commentCounts } = await supabase
                    .from('team_comments')
                    .select('thread_id')
                    .in('thread_id', threadsData.map(t => t.id))

                const commentCountMap = new Map<string, number>()
                commentCounts?.forEach(c => {
                    commentCountMap.set(c.thread_id, (commentCountMap.get(c.thread_id) || 0) + 1)
                })

                const enrichedThreads: Thread[] = threadsData.map(t => ({
                    ...t,
                    user: profileMap.get(t.user_id) ? { display_name: profileMap.get(t.user_id)!.display_name } : null,
                    comment_count: commentCountMap.get(t.id) || 0
                }))

                setThreads(enrichedThreads)
            }
        } catch (error) {
            console.error('Error fetching threads:', error)
        } finally {
            setIsLoading(false)
        }
    }

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 60) return 'just now'
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            {/* Header */}
            <div className="p-4 border-b-2 border-black bg-brand-navy flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">Team Discussions</h3>
                <div className="flex gap-2">
                    <button
                        onClick={() => setSortBy('recent')}
                        className={`px-3 py-1 text-xs font-bold border-2 border-white transition-all ${sortBy === 'recent' ? 'bg-white text-brand-navy' : 'bg-transparent text-white hover:bg-white/10'
                            }`}
                    >
                        <Clock className="w-3 h-3 inline mr-1" />
                        Recent
                    </button>
                    <button
                        onClick={() => setSortBy('top')}
                        className={`px-3 py-1 text-xs font-bold border-2 border-white transition-all ${sortBy === 'top' ? 'bg-white text-brand-navy' : 'bg-transparent text-white hover:bg-white/10'
                            }`}
                    >
                        <TrendingUp className="w-3 h-3 inline mr-1" />
                        Top
                    </button>
                </div>
            </div>

            {/* Thread List */}
            <div className="divide-y-2 divide-gray-100">
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading discussions...</div>
                ) : threads.length === 0 ? (
                    <div className="p-8 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No discussions yet</p>
                        <p className="text-sm text-gray-500 mt-1">Be the first to start a conversation!</p>
                    </div>
                ) : (
                    threads.map(thread => (
                        <Link
                            key={thread.id}
                            href={`/teams/${teamSlug}/discussions/${thread.slug}`}
                            className="block p-4 hover:bg-gray-50 transition-colors group"
                        >
                            <div className="flex items-start gap-4">
                                {/* Upvote Count */}
                                <div className="flex flex-col items-center flex-shrink-0 w-12">
                                    <ArrowUp className="w-4 h-4 text-gray-400 mb-1" />
                                    <span className="text-sm font-bold text-gray-700">{thread.upvotes}</span>
                                </div>

                                {/* Thread Info */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 group-hover:text-brand-navy transition-colors mb-1">
                                        {thread.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                        {thread.content.substring(0, 150)}...
                                    </p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="font-medium text-gray-700">{thread.user?.display_name || 'Anonymous'}</span>
                                        <span>•</span>
                                        <span>{formatTimeAgo(thread.created_at)}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <MessageSquare className="w-3 h-3" />
                                            {thread.comment_count}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* New Thread Button / Join Message */}
            <div className="p-4 border-t-2 border-black bg-gray-50">
                {currentUserRole ? (
                    <Link
                        href={`/teams/${teamSlug}/discussions/new`}
                        className="block w-full py-3 bg-black text-white text-center font-bold border-2 border-black hover:bg-brand-yellow hover:text-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                    >
                        Start New Discussion
                    </Link>
                ) : (
                    <p className="text-center text-gray-600 text-sm">
                        <Link href={`/teams/${teamSlug}`} className="text-brand-navy font-bold hover:underline">
                            Join this team
                        </Link>
                        {' '}to start discussions
                    </p>
                )}
            </div>

        </div>
    )
}
