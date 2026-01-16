'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowUp, MessageSquare, Trash2, Clock, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Thread {
    id: string
    title: string
    content: string
    created_at: string
    upvotes: number
    user_id: string
    user: {
        display_name: string
    }
}

interface Comment {
    id: string
    content: string
    created_at: string
    user_id: string
    user: {
        display_name: string
    }
}

interface ThreadDetailClientProps {
    thread: Thread
    comments: Comment[]
    teamName: string
    teamSlug: string
    currentUserId: string | null
    currentUserRole: 'owner' | 'admin' | 'member' | null
}

export default function ThreadDetailClient({
    thread,
    comments: initialComments,
    teamName,
    teamSlug,
    currentUserId,
    currentUserRole
}: ThreadDetailClientProps) {
    const [comments, setComments] = useState(initialComments)
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [hasUpvoted, setHasUpvoted] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || !currentUserId) return

        setIsSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('team_comments')
                .insert({
                    thread_id: thread.id,
                    user_id: currentUserId,
                    content: newComment.trim()
                })
                .select()
                .single()

            if (error) throw error

            // Fetch user profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', currentUserId)
                .single()

            const newCommentWithUser = {
                ...data,
                user: profile || { display_name: 'Anonymous' }
            }

            setComments([...comments, newCommentWithUser])
            setNewComment('')
        } catch (error) {
            console.error('Error posting comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Delete this comment?')) return

        try {
            await supabase
                .from('team_comments')
                .delete()
                .eq('id', commentId)

            setComments(comments.filter(c => c.id !== commentId))
        } catch (error) {
            console.error('Error deleting comment:', error)
        }
    }

    const handleUpvote = async () => {
        if (hasUpvoted) return

        try {
            const { error } = await supabase
                .from('team_threads')
                .update({ upvotes: thread.upvotes + 1 })
                .eq('id', thread.id)

            if (!error) {
                setHasUpvoted(true)
                router.refresh()
            }
        } catch (error) {
            console.error('Error upvoting:', error)
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

    const canDelete = (userId: string) => {
        return currentUserId === userId || currentUserRole === 'owner' || currentUserRole === 'admin'
    }

    return (
        <div className="container mx-auto p-4 pt-32">
            <div className="max-w-4xl mx-auto">
                {/* Breadcrumbs */}
                <div className="mb-4 text-sm text-gray-600">
                    <Link href="/teams" className="hover:text-brand-navy">Teams</Link>
                    {' > '}
                    <Link href={`/teams/${teamSlug}`} className="hover:text-brand-navy">{teamName}</Link>
                    {' > '}
                    <span className="text-gray-900">Discussion</span>
                </div>

                {/* Back Button */}
                <Link
                    href={`/teams/${teamSlug}`}
                    className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-brand-navy transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to {teamName}
                </Link>

                {/* Thread Header */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
                    <div className="flex gap-6">
                        {/* Upvote Section */}
                        <div className="flex flex-col items-center flex-shrink-0">
                            <button
                                onClick={handleUpvote}
                                disabled={hasUpvoted || !currentUserId}
                                className={`p-2 border-2 border-black mb-2 transition-all ${hasUpvoted
                                    ? 'bg-brand-yellow cursor-not-allowed'
                                    : 'bg-white hover:bg-brand-yellow'
                                    }`}
                            >
                                <ArrowUp className="w-5 h-5" />
                            </button>
                            <span className="text-xl font-bold">{thread.upvotes}</span>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>
                            <div className="prose max-w-none mb-4">
                                <p className="text-gray-700 whitespace-pre-wrap">{thread.content}</p>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                                <span className="font-medium text-gray-700">{thread.user.display_name}</span>
                                <span>•</span>
                                <Clock className="w-4 h-4" />
                                <span>{formatTimeAgo(thread.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </h2>

                    {/* Comment List */}
                    <div className="space-y-4 mb-6">
                        {comments.map(comment => (
                            <div key={comment.id} className="border-l-4 border-gray-200 pl-4 py-2">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="font-bold text-gray-900">{comment.user.display_name}</span>
                                        <span className="text-gray-500">•</span>
                                        <span className="text-gray-500">{formatTimeAgo(comment.created_at)}</span>
                                    </div>
                                    {canDelete(comment.user_id) && (
                                        <button
                                            onClick={() => handleDeleteComment(comment.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                            </div>
                        ))}
                    </div>

                    {/* Comment Form */}
                    {currentUserRole ? (
                        <form onSubmit={handleSubmitComment} className="border-t-2 border-gray-200 pt-6">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow font-medium resize-none"
                                rows={4}
                                maxLength={1000}
                                disabled={isSubmitting}
                            />
                            <div className="flex justify-between items-center mt-3">
                                <span className="text-sm text-gray-500">{newComment.length}/1000</span>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="px-6 py-2 bg-black text-white font-bold border-2 border-black hover:bg-brand-yellow hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                                >
                                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="border-t-2 border-gray-200 pt-6 text-center">
                            <p className="text-gray-600">
                                <Link href="/auth/user/login" className="text-brand-navy font-bold hover:underline">
                                    Log in
                                </Link>
                                {' '}or{' '}
                                <Link href={`/teams/${teamSlug}`} className="text-brand-navy font-bold hover:underline">
                                    join this team
                                </Link>
                                {' '}to comment.
                            </p>
                        </div>
                    )}
                </div>

                {/* Schema.org JSON-LD for SEO */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            '@context': 'https://schema.org',
                            '@type': 'DiscussionForumPosting',
                            headline: thread.title,
                            text: thread.content,
                            author: {
                                '@type': 'Person',
                                name: thread.user.display_name
                            },
                            datePublished: thread.created_at,
                            interactionStatistic: {
                                '@type': 'InteractionCounter',
                                interactionType: 'https://schema.org/CommentAction',
                                userInteractionCount: comments.length
                            }
                        })
                    }}
                />
            </div>
        </div>
    )
}
