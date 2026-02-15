'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Trophy, Users, Gift, Loader2, Plus, Upload, X, Apple, Chrome, Share2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BadgeDisplay from "@/components/badge-display"
import { PointsHistoryChart } from "@/components/PointsHistoryChart"

interface Profile {
    id: string
    user_id: string
    display_name: string
    username: string
    created_at: string
    total_points: number
}

interface ReferralStats {
    user_id: string
    total_referrals: number
    total_earnings: number
    donated_amount: number
    total_requests: number
    updated_at: string
}

interface BadgeTier {
    id: string
    name: string
    threshold: number
    badge_type_id: string
}

interface UserTeam {
    id: string
    name: string
    total_points: number
    slug: string
}

// Create client once outside component
const supabase = createClient()

export default function PublicProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [referralStats, setReferralStats] = useState<ReferralStats>({
        user_id: '',
        total_referrals: 0,
        total_earnings: 0,
        donated_amount: 0,
        total_requests: 0,
        updated_at: ''
    })
    const [treesPlanted, setTreesPlanted] = useState<number>(0)
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
    const [platforms, setPlatforms] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
    const [creatingTeam, setCreatingTeam] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [teamDescription, setTeamDescription] = useState('')
    const [teamImageUrl, setTeamImageUrl] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [createError, setCreateError] = useState('')
    const [historicalData, setHistoricalData] = useState<any[]>([])
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('display_name', params.username as string)
                .single()

            if (error) throw error
            if (profile) {
                setProfile(profile)
                // Fetch referral stats
                const { data: referralStats, error: referralError } = await supabase
                    .from('referral_stats')
                    .select('*')
                    .eq('user_id', profile.user_id)
                    .single()

                if (!referralError && referralStats) {
                    setReferralStats({
                        ...referralStats
                    })
                }

                // Fetch Tree badge progress for "Trees Planted" stat
                // First, get the Tree badge type and its tiers
                const { data: treeBadgeType, error: treeBadgeError } = await supabase
                    .from('badge_types')
                    .select(`
                        id,
                        name,
                        badge_tiers (*)
                    `)
                    .eq('name', 'Tree')
                    .single()

                if (!treeBadgeError && treeBadgeType) {
                    // Get the tier IDs for the Tree badge
                    const tierIds = (treeBadgeType.badge_tiers as BadgeTier[]).map((tier: BadgeTier) => tier.id)

                    // Fetch the user's progress for this badge (don't use .single() as it may fail)
                    const { data: treeProgress, error: progressError } = await supabase
                        .from('badge_progress')
                        .select('current_value')
                        .eq('user_id', profile.user_id)
                        .in('badge_tier_id', tierIds)

                    if (!progressError && treeProgress && treeProgress.length > 0) {
                        setTreesPlanted(treeProgress[0].current_value || 0)
                    }
                }

                // Fetch user's team
                const { data: teamMembership } = await supabase
                    .from('team_members')
                    .select('team_id')
                    .eq('user_id', profile.user_id)
                    .single()

                if (teamMembership) {
                    const { data: team } = await supabase
                        .from('teams')
                        .select('id, name, total_points, slug')
                        .eq('id', teamMembership.team_id)
                        .single()

                    if (team) {
                        setUserTeam(team)
                    }
                }

                // Fetch user's nodes to determine installed platforms
                const { data: nodesData } = await supabase
                    .from('nodes')
                    .select('platform')
                    .eq('user_id', profile.user_id)

                if (nodesData && nodesData.length > 0) {
                    const userPlatforms: string[] = []
                    if (nodesData.some(n => n.platform === 'win32')) userPlatforms.push('windows')
                    if (nodesData.some(n => n.platform === 'darwin')) userPlatforms.push('mac')
                    if (nodesData.some(n => n.platform === null)) userPlatforms.push('extension')
                    setPlatforms(userPlatforms)
                }

                // Check if current user is viewing their own profile
                const { data: { user } } = await supabase.auth.getUser()
                if (user && user.id === profile.user_id) {
                    setIsOwnProfile(true)
                }

                // Fetch historical data
                const { data: dailyStats } = await supabase
                    .from('user_daily_stats')
                    .select('date, total_points_snapshot, points_gained_that_day')
                    .eq('user_id', profile.user_id)
                    .order('date', { ascending: true })
                    .limit(30)

                if (dailyStats) {
                    setHistoricalData(dailyStats)
                }
            }
        } catch (error) {
            console.error('Error fetching profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateTeam = async () => {
        if (!teamName.trim()) {
            setCreateError('Please enter a team name')
            return
        }

        setCreatingTeam(true)
        setCreateError('')

        try {
            let finalImageUrl = teamImageUrl.trim() || null

            // Upload image if one is selected
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
                    setCreateError(uploadData.error || 'Failed to upload image')
                    setCreatingTeam(false)
                    return
                }

                finalImageUrl = uploadData.url
            }

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

            if (response.ok && data.team) {
                router.push(`/teams/${data.team.slug}`)
            } else {
                setCreateError(data.error || 'Failed to create team')
            }
        } catch (error) {
            console.error('Error creating team:', error)
            setCreateError('Failed to create team')
        } finally {
            setCreatingTeam(false)
            setUploadingImage(false)
        }
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
            if (!allowedTypes.includes(file.type)) {
                setCreateError('Invalid file type. Allowed: JPEG, PNG, GIF, WebP')
                return
            }
            // Validate file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                setCreateError('File too large. Maximum size is 2MB')
                return
            }
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
            setCreateError('')
        }
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
    }

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Loading profile...</p>
                </div>
            </main>
        )
    }

    if (!profile) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <h2 className="text-2xl font-extrabold font-candu uppercase mb-4">Profile Not Found</h2>
                    <p className="text-neutral-600 mb-6">The profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link
                        href="/"
                        className="block w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-center"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-gray p-4 py-32 font-rethink-sans">
            <div className="w-full max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <div className="flex items-center gap-4 mb-2">
                        <h1 className="text-4xl font-extrabold font-candu uppercase">
                            {profile.display_name}
                        </h1>
                        {/* Platform Icons */}
                        {platforms.length > 0 && (
                            <div className="flex items-center gap-2">
                                {platforms.includes('windows') && (
                                    <div className="bg-blue-100 p-2 rounded border-2 border-black" title="Windows">
                                        <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                                        </svg>
                                    </div>
                                )}
                                {platforms.includes('mac') && (
                                    <div className="bg-gray-100 p-2 rounded border-2 border-black" title="Mac">
                                        <Apple className="w-4 h-4 text-gray-700" />
                                    </div>
                                )}
                                {platforms.includes('extension') && (
                                    <div className="bg-green-100 p-2 rounded border-2 border-black" title="Browser Extension">
                                        <Chrome className="w-4 h-4 text-green-600" />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-neutral-600">Member since {new Date(profile.created_at).toLocaleDateString()}</p>

                    {/* Team Badge */}
                    {userTeam && (
                        <Link
                            href={`/teams/${userTeam.slug}`}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-navy text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <Users className="w-4 h-4 text-brand-yellow" />
                            <span className="font-bold">{userTeam.name}</span>
                            <span className="text-xs text-gray-400">• {userTeam.total_points.toLocaleString()} pts</span>
                        </Link>
                    )}

                    {/* Create Team Button - shown when viewing own profile with no team */}
                    {isOwnProfile && !userTeam && (
                        <button
                            onClick={() => setShowCreateTeamModal(true)}
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-brand-yellow text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Team</span>
                        </button>
                    )}

                    {/* Share My Stats Button - shown for own profile */}
                    {isOwnProfile && (
                        <Link
                            href={`/share/user/${profile.display_name}`}
                            className="inline-flex items-center gap-2 mt-4 ml-2 px-4 py-2 bg-purple-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all font-bold"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>Share My Stats</span>
                        </Link>
                    )}
                </div>

                {/* Create Team Modal */}
                {showCreateTeamModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                            <h2 className="text-2xl font-extrabold font-candu uppercase mb-4">Create a Team</h2>
                            <p className="text-neutral-600 mb-6">Give your team a name to get started.</p>

                            <input
                                type="text"
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Team name *"
                                maxLength={50}
                                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-4"
                            />

                            <textarea
                                value={teamDescription}
                                onChange={(e) => setTeamDescription(e.target.value)}
                                placeholder="Team description (optional)"
                                maxLength={500}
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-black focus:outline-none focus:ring-2 focus:ring-brand-yellow mb-4 resize-none"
                            />

                            {/* Image Upload */}
                            <div className="mb-4">
                                <label className="block text-sm font-bold text-neutral-600 mb-2">Team Image (optional)</label>
                                {imagePreview ? (
                                    <div className="relative inline-block">
                                        <img
                                            src={imagePreview}
                                            alt="Team preview"
                                            className="w-24 h-24 object-cover border-2 border-black"
                                        />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 border-2 border-black hover:bg-red-600 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-400 cursor-pointer hover:border-brand-yellow hover:bg-gray-50 transition-colors">
                                        <Upload className="w-5 h-5 text-gray-500" />
                                        <span className="text-gray-500 text-sm">Click to upload image (max 2MB)</span>
                                        <input
                                            type="file"
                                            accept="image/jpeg,image/png,image/gif,image/webp"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            {createError && (
                                <p className="text-red-600 text-sm mb-4">{createError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowCreateTeamModal(false)
                                        setTeamName('')
                                        setTeamDescription('')
                                        setTeamImageUrl('')
                                        setImageFile(null)
                                        setImagePreview(null)
                                        setCreateError('')
                                    }}
                                    className="flex-1 py-3 font-bold uppercase tracking-wider bg-gray-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTeam}
                                    disabled={creatingTeam}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                                >
                                    {creatingTeam ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> {uploadingImage ? 'Uploading...' : 'Creating...'}</>
                                    ) : (
                                        'Create Team'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Total Points */}
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy className="w-5 h-5 text-brand-yellow" />
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Points</p>
                        </div>
                        <p className="text-3xl font-extrabold font-candu text-black">{profile.total_points?.toLocaleString() || '0'}</p>
                    </div>

                    {/* Trees Planted */}
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-green-500 text-lg">🌳</span>
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Trees Planted</p>
                        </div>
                        <p className="text-3xl font-extrabold font-candu text-black">{treesPlanted}</p>
                    </div>

                    {/* Total Referrals */}
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Referrals</p>
                        </div>
                        <p className="text-3xl font-extrabold font-candu text-black">{referralStats.total_referrals}</p>
                    </div>

                    {/* Points from Referrals */}
                    <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <Gift className="w-5 h-5 text-purple-500" />
                            <p className="text-xs font-bold uppercase tracking-wider text-neutral-500">Referral Points</p>
                        </div>
                        <p className="text-3xl font-extrabold font-candu text-black">{referralStats.total_requests}</p>
                    </div>
                </div>

                {/* Points History */}
                {historicalData.length > 0 && (
                    <PointsHistoryChart
                        data={historicalData}
                        title="Points History"
                    />
                )}

                {/* Badges Section */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <BadgeDisplay userId={profile.user_id} variant="light" />
                </div>

                <div className="text-center">
                    <Link href="/" className="text-sm font-bold text-neutral-600 underline decoration-1 hover:text-black hover:decoration-brand-yellow hover:decoration-2 transition-all">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </main>
    )
}