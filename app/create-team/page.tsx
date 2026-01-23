'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Users, Upload, X, Loader2, Copy, Check, ArrowRight, Sparkles, Share2 } from 'lucide-react'
import Link from 'next/link'

const supabase = createClient()

type Step = 'details' | 'success'

export default function CreateTeamPage() {
    const router = useRouter()
    const [step, setStep] = useState<Step>('details')
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
    const [existingTeam, setExistingTeam] = useState<{ id: string; slug: string; name: string } | null>(null)

    // Form state
    const [teamName, setTeamName] = useState('')
    const [teamDescription, setTeamDescription] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [error, setError] = useState('')

    // Success state
    const [createdTeam, setCreatedTeam] = useState<{ id: string; slug: string; name: string } | null>(null)
    const [inviteCode, setInviteCode] = useState<string | null>(null)
    const [inviteUrl, setInviteUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)

    // Check auth and existing team on mount
    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/auth/user/login?redirect=/create-team')
                return
            }
            setCurrentUser(user)

            // Check if user already has a team
            const { data: membership } = await supabase
                .from('team_members')
                .select('team_id')
                .eq('user_id', user.id)
                .single()

            if (membership) {
                const { data: team } = await supabase
                    .from('teams')
                    .select('id, slug, name')
                    .eq('id', membership.team_id)
                    .single()

                if (team) {
                    setExistingTeam(team)
                }
            }

            setIsLoading(false)
        }
        checkUser()
    }, [router])

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                setError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
                return
            }
            if (file.size > 2 * 1024 * 1024) {
                setError('File too large. Maximum size is 2MB')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setError('')
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setError('Team name is required')
            return
        }

        setIsSubmitting(true)
        setError('')

        try {
            let finalImageUrl: string | null = null

            // Upload image if selected
            if (imageFile) {
                setUploadingImage(true)
                const formData = new FormData()
                formData.append('file', imageFile)

                const uploadResponse = await fetch('/api/teams/upload-image', {
                    method: 'POST',
                    body: formData
                })

                const uploadData = await uploadResponse.json()
                setUploadingImage(false)

                if (!uploadResponse.ok) {
                    setError(uploadData.error || 'Failed to upload image')
                    setIsSubmitting(false)
                    return
                }

                finalImageUrl = uploadData.url
            }

            // Create the team
            const response = await fetch('/api/teams/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: teamName.trim(),
                    description: teamDescription.trim() || null,
                    imageUrl: finalImageUrl
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to create team')
                setIsSubmitting(false)
                return
            }

            setCreatedTeam(data.team)

            // Generate invite code immediately
            const inviteResponse = await fetch('/api/teams/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: data.team.id,
                    usesRemaining: null,
                    expiresInDays: null
                })
            })

            const inviteData = await inviteResponse.json()

            if (inviteResponse.ok && inviteData.inviteUrl) {
                setInviteCode(inviteData.invite.invite_code)
                setInviteUrl(inviteData.inviteUrl)
            }

            setStep('success')
        } catch (err) {
            console.error('Error creating team:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
            setUploadingImage(false)
        }
    }

    const handleCopyInvite = async () => {
        if (inviteUrl) {
            await navigator.clipboard.writeText(inviteUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (isLoading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Loading...</p>
                </div>
            </main>
        )
    }

    // If user already has a team, show message
    if (existingTeam) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 pt-32 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-brand-yellow p-3 border-2 border-black">
                            <Users className="w-6 h-6 text-black" />
                        </div>
                        <h1 className="text-2xl font-extrabold font-candu uppercase">You're Already in a Team!</h1>
                    </div>
                    <p className="text-neutral-600 mb-6">
                        You're currently a member of <strong>{existingTeam.name}</strong>.
                        You can only be part of one team at a time.
                    </p>
                    <div className="flex gap-3">
                        <Link
                            href={`/teams/${existingTeam.slug}`}
                            className="flex-1 py-4 text-center font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            Go to Your Team
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-gray p-4 pt-32 pb-16 font-rethink-sans">
            <div className="w-full max-w-2xl mx-auto">
                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-4 mb-8">
                    <div className={`flex items-center gap-2 px-4 py-2 border-2 border-black ${step === 'details' ? 'bg-brand-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}>
                        <span className="font-bold">1</span>
                        <span className="text-sm font-bold uppercase">Create</span>
                    </div>
                    <ArrowRight className="w-5 h-5 text-neutral-400" />
                    <div className={`flex items-center gap-2 px-4 py-2 border-2 border-black ${step === 'success' ? 'bg-brand-yellow shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white'}`}>
                        <span className="font-bold">2</span>
                        <span className="text-sm font-bold uppercase">Invite</span>
                    </div>
                </div>

                {/* Step 1: Details */}
                {step === 'details' && (
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        {/* Hero Section */}
                        <div className="bg-brand-navy p-8 border-b-2 border-black">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-brand-yellow p-4 border-2 border-black">
                                    <Users className="w-8 h-8 text-black" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-extrabold font-candu uppercase text-white">
                                        Create Your Team
                                    </h1>
                                    <p className="text-gray-300 text-sm">
                                        Lead the charge in planting trees together
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white text-sm">
                                    <Sparkles className="w-4 h-4 text-brand-yellow" />
                                    <span>Compete on leaderboards</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/20 text-white text-sm">
                                    <Share2 className="w-4 h-4 text-brand-yellow" />
                                    <span>Invite friends & grow</span>
                                </div>
                            </div>
                        </div>

                        {/* Form */}
                        <div className="p-8">
                            <div className="space-y-6">
                                {/* Team Name */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                        Team Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={teamName}
                                        onChange={(e) => setTeamName(e.target.value)}
                                        placeholder="e.g., Green Warriors"
                                        maxLength={50}
                                        className="w-full px-4 py-4 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow text-lg font-bold"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">{teamName.length}/50 characters</p>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                        Description <span className="font-normal text-neutral-400">(optional)</span>
                                    </label>
                                    <textarea
                                        value={teamDescription}
                                        onChange={(e) => setTeamDescription(e.target.value)}
                                        placeholder="What's your team all about?"
                                        maxLength={500}
                                        rows={3}
                                        className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow resize-none"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">{teamDescription.length}/500 characters</p>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label className="block text-sm font-bold uppercase tracking-wider text-neutral-600 mb-2">
                                        Team Logo <span className="font-normal text-neutral-400">(optional)</span>
                                    </label>
                                    {imagePreview ? (
                                        <div className="relative inline-block">
                                            <img
                                                src={imagePreview}
                                                alt="Team preview"
                                                className="w-32 h-32 object-cover border-2 border-black"
                                            />
                                            <button
                                                type="button"
                                                onClick={removeImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 border-2 border-black hover:bg-red-600 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-neutral-400 cursor-pointer hover:border-brand-yellow hover:bg-brand-yellow/5 transition-colors">
                                            <Upload className="w-6 h-6 text-neutral-500" />
                                            <span className="text-neutral-500 font-bold">Click to upload (max 2MB)</span>
                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/gif,image/webp"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>

                                {error && (
                                    <div className="bg-red-50 border-2 border-red-400 p-4">
                                        <p className="text-red-700 font-bold">{error}</p>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={handleCreateTeam}
                                    disabled={isSubmitting || !teamName.trim()}
                                    className="w-full flex items-center justify-center gap-3 py-5 text-xl font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-6 h-6 animate-spin" />
                                            {uploadingImage ? 'Uploading...' : 'Creating...'}
                                        </>
                                    ) : (
                                        <>
                                            Create Team
                                            <ArrowRight className="w-6 h-6" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Success */}
                {step === 'success' && createdTeam && (
                    <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] reveal-animation">
                        {/* Success Hero */}
                        <div className="bg-green-500 p-8 border-b-2 border-black text-center">
                            <div className="inline-flex items-center justify-center bg-white p-4 border-2 border-black mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <span className="text-4xl">🎉</span>
                            </div>
                            <h1 className="text-3xl font-extrabold font-candu uppercase text-white mb-2">
                                Team Created!
                            </h1>
                            <p className="text-white/90 text-lg">
                                <strong>{createdTeam.name}</strong> is ready to grow
                            </p>
                        </div>

                        {/* Invite Section */}
                        <div className="p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-extrabold uppercase mb-2">Invite Your Friends</h2>
                                <p className="text-neutral-600">
                                    Share this link to grow your team and plant more trees together!
                                </p>
                            </div>

                            {inviteUrl ? (
                                <div className="space-y-4">
                                    {/* Invite URL Display */}
                                    <div className="bg-brand-gray border-2 border-black p-4">
                                        <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-2">Your Invite Link</p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-sm font-mono bg-white px-3 py-2 border border-black truncate">
                                                {inviteUrl}
                                            </code>
                                            <button
                                                onClick={handleCopyInvite}
                                                className={`flex items-center gap-2 px-4 py-2 font-bold uppercase text-sm border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all ${copied ? 'bg-green-500 text-white' : 'bg-brand-yellow'
                                                    }`}
                                            >
                                                {copied ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Copied!
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        Copy
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Tip */}
                                    <div className="bg-blue-50 border-2 border-blue-300 p-4">
                                        <p className="text-blue-800 text-sm">
                                            <strong>💡 Tip:</strong> Share this link on social media, messaging apps, or anywhere you want to invite people to join your team!
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-4 bg-neutral-100 border-2 border-black">
                                    <p className="text-neutral-600">
                                        Invite link will be available on your team page
                                    </p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <Link
                                    href={`/teams/${createdTeam.slug}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-4 text-lg font-bold uppercase tracking-wider bg-brand-navy text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    <Users className="w-5 h-5" />
                                    Go to Team Page
                                </Link>
                                <Link
                                    href="/teams"
                                    className="flex-1 flex items-center justify-center gap-2 py-4 text-lg font-bold uppercase tracking-wider bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    View All Teams
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* Back Link */}
                <div className="text-center mt-8">
                    <Link href="/teams" className="text-sm font-bold text-neutral-600 underline decoration-1 hover:text-black hover:decoration-brand-yellow hover:decoration-2 transition-all">
                        ← Back to Teams
                    </Link>
                </div>
            </div>
        </main>
    )
}
