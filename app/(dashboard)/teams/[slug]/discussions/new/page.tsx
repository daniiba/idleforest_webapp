'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NewThreadPage() {
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const params = useParams()
    const teamSlug = Array.isArray(params.slug) ? params.slug[0] : params.slug
    const supabase = createClient()

    // We need to fetch the team ID from slug for database insert
    const [teamId, setTeamId] = useState<string | null>(null)

    // Fetch team ID on mount
    useEffect(() => {
        const fetchTeamId = async () => {
            const { data } = await supabase
                .from('teams')
                .select('id')
                .eq('slug', teamSlug)
                .single()
            if (data) setTeamId(data.id)
        }
        fetchTeamId()
    }, [teamSlug])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (title.length < 10) {
            setError('Title must be at least 10 characters')
            return
        }

        if (content.length < 20) {
            setError('Content must be at least 20 characters')
            return
        }

        setIsSubmitting(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                router.push('/auth/user/login')
                return
            }

            const { data, error: insertError } = await supabase
                .from('team_threads')
                .insert({
                    team_id: teamId,
                    user_id: user.id,
                    title: title.trim(),
                    content: content.trim()
                })
                .select()
                .single()

            if (insertError) throw insertError

            // Redirect to the new thread (using slugs)
            router.push(`/teams/${teamSlug}/discussions/${data.slug}`)
        } catch (err) {
            console.error('Error creating thread:', err)
            setError('Failed to create discussion. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="container mx-auto p-4 pt-32">
            <div className="max-w-3xl mx-auto">
                {/* Back Button */}
                <Link
                    href={`/teams/${teamSlug}`}
                    className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-brand-navy transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Team
                </Link>

                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Start a New Discussion</h1>
                    <p className="text-gray-600 mb-8">Share ideas, ask questions, or start a conversation with your team.</p>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-500 p-4 mb-6">
                            <p className="text-red-700 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block font-bold text-gray-900 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="What's this discussion about?"
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow font-medium"
                                maxLength={200}
                                disabled={isSubmitting}
                                required
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-sm text-gray-500">Minimum 10 characters</p>
                                <p className="text-sm text-gray-500">{title.length}/200</p>
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="block font-bold text-gray-900 mb-2">
                                Content *
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Share your thoughts, questions, or ideas..."
                                className="w-full p-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow font-medium resize-none"
                                rows={12}
                                maxLength={5000}
                                disabled={isSubmitting}
                                required
                            />
                            <div className="flex justify-between mt-1">
                                <p className="text-sm text-gray-500">Minimum 20 characters</p>
                                <p className="text-sm text-gray-500">{content.length}/5000</p>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4 justify-end">
                            <Link
                                href={`/teams/${teamSlug}`}
                                className="px-6 py-3 bg-gray-100 text-gray-700 font-bold border-2 border-black hover:bg-gray-200 transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                            >
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={isSubmitting || title.length < 10 || content.length < 20}
                                className="px-6 py-3 bg-black text-white font-bold border-2 border-black hover:bg-brand-yellow hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                            >
                                {isSubmitting ? 'Creating...' : 'Create Discussion'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
