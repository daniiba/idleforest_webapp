'use client'

import { useEffect, useState } from "react"
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import { Building2, Loader2, LogOut, Plus, Upload, X, Apple, Chrome, Monitor, Share2, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BadgeDisplay from "@/components/badge-display"
import { PointsHistoryChart } from "@/components/PointsHistoryChart"
import type { PublicReferralImpactData } from '@/components/referrals/PublicReferralImpact'
import ProfileJoinCta from '@/components/referrals/ProfileJoinCta'
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import { isMossyEarthCompanySlug, isPlanetwildCompanySlug, isWastefreeCompanySlug } from '@/lib/company-partners'

interface Profile {
    id: string
    user_id: string
    display_name: string
    username: string
    created_at: string
    total_points: number
    company_id: string | null
    company_joined_at: string | null
    company_points_baseline: number | null
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

interface CompanyForest {
    id: string
    name: string
    slug: string
    website: string | null
    logo_url: string | null
    impact_mode: 'idleforest_planting' | 'company_named_donation' | 'partner_payout'
    payout_recipient_name: string | null
    payout_recipient_url: string | null
}

// Create client once outside component
const supabase = createClient()

function WindowsIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
        </svg>
    )
}

const PLATFORM_META: Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    windows: { label: 'Windows', icon: WindowsIcon },
    mac: { label: 'Mac', icon: Apple },
    linux: { label: 'Linux', icon: Monitor },
    extension: { label: 'Extension', icon: Chrome },
}

function getCompanyImpactDescription(company: CompanyForest) {
    if (isWastefreeCompanySlug(company.slug)) {
        return 'Future IdleForest activity is routed to Waste Free Planet cleanup funding through 1ClickImpact and Plastic Bank.'
    }

    if (isPlanetwildCompanySlug(company.slug)) {
        return "Future IdleForest activity supports Planet Wild's rewilding work through this IdleForest-run fund."
    }

    if (isMossyEarthCompanySlug(company.slug)) {
        return "Future IdleForest activity supports Mossy Earth's conservation and rewilding projects."
    }

    if (company.impact_mode === 'partner_payout' && company.payout_recipient_name) {
        return `Future IdleForest activity is routed toward ${company.payout_recipient_name}.`
    }

    if (company.impact_mode === 'company_named_donation') {
        return `Future IdleForest activity is grouped under ${company.name}.`
    }

    return `Future IdleForest activity counts toward ${company.name}'s company forest.`
}

function getCompanyLogoUrl(company: CompanyForest) {
    if (company.logo_url) return company.logo_url
    if (isWastefreeCompanySlug(company.slug)) return '/partner/wastefree/wfp-logo-white.webp'

    return null
}

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
    const [publicReferralImpact, setPublicReferralImpact] = useState<PublicReferralImpactData | null>(null)
    const [treesPlanted, setTreesPlanted] = useState<number>(0)
    const [userTeam, setUserTeam] = useState<UserTeam | null>(null)
    const [companyForest, setCompanyForest] = useState<CompanyForest | null>(null)
    const [platforms, setPlatforms] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isOwnProfile, setIsOwnProfile] = useState(false)
    const [isSignedIn, setIsSignedIn] = useState(true)
    const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)
    const [showLeaveCompanyModal, setShowLeaveCompanyModal] = useState(false)
    const [creatingTeam, setCreatingTeam] = useState(false)
    const [leavingCompany, setLeavingCompany] = useState(false)
    const [teamName, setTeamName] = useState('')
    const [teamDescription, setTeamDescription] = useState('')
    const [teamImageUrl, setTeamImageUrl] = useState('')
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [uploadingImage, setUploadingImage] = useState(false)
    const [createError, setCreateError] = useState('')
    const [leaveCompanyError, setLeaveCompanyError] = useState('')
    const [historicalData, setHistoricalData] = useState<any[]>([])
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            setLoading(true)
            setCompanyForest(null)
            setUserTeam(null)
            setPlatforms([])
            setIsOwnProfile(false)
            setPublicReferralImpact(null)
            setLeaveCompanyError('')
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .ilike('display_name', decodeURIComponent(params.username as string))
                .single()

            if (error) throw error
            if (profile) {
                setProfile(profile)

                const publicImpactResponse = await fetch(`/api/referrals/profile?displayName=${encodeURIComponent(profile.display_name)}`)
                if (publicImpactResponse.ok) {
                    const publicImpact = await publicImpactResponse.json() as PublicReferralImpactData
                    setPublicReferralImpact(publicImpact)
                }

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

                if (profile.company_id) {
                    const { data: company } = await supabase
                        .from('companies')
                        .select('id, name, slug, website, logo_url, impact_mode, payout_recipient_name, payout_recipient_url')
                        .eq('id', profile.company_id)
                        .single()

                    if (company) {
                        setCompanyForest(company as CompanyForest)
                    }
                }

                // Fetch Tree badge progress for "Trees Planted" stat
                let plantedFromBadges = 0
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
                        plantedFromBadges = treeProgress[0].current_value || 0
                    }
                }

                const { data: treeRewards } = await supabase
                    .from('user_rewards')
                    .select('trees_awarded')
                    .eq('user_id', profile.user_id)
                    .eq('status', 'awarded')

                const plantedFromRewards = treeRewards?.reduce((sum, reward) => sum + (reward.trees_awarded || 0), 0) ?? 0
                setTreesPlanted(plantedFromBadges + plantedFromRewards)

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
                    if (nodesData.some(n => n.platform === 'linux')) userPlatforms.push('linux')
                    if (nodesData.some(n => n.platform === null)) userPlatforms.push('extension')
                    setPlatforms(userPlatforms)
                }

                // Check if current user is viewing their own profile
                const { data: { user } } = await supabase.auth.getUser()
                setIsSignedIn(Boolean(user))
                if (user && user.id === profile.user_id) {
                    setIsOwnProfile(true)
                }

                // Fetch historical data
                const { data: dailyStats } = await supabase
                    .from('user_daily_stats')
                    .select('date, total_points_snapshot, points_gained_that_day')
                    .eq('user_id', profile.user_id)
                    .order('date', { ascending: false })

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

    const handleLeaveCompany = async () => {
        setLeavingCompany(true)
        setLeaveCompanyError('')

        try {
            const response = await fetch('/api/companies/leave', {
                method: 'POST',
            })
            const data = await response.json()

            if (!response.ok) {
                setLeaveCompanyError(data.error || 'Failed to return to IdleForest')
                return
            }

            setCompanyForest(null)
            setShowLeaveCompanyModal(false)
            setProfile(currentProfile =>
                currentProfile
                    ? {
                          ...currentProfile,
                          company_id: null,
                          company_joined_at: null,
                          company_points_baseline: 0,
                      }
                    : currentProfile,
            )
            router.refresh()
        } catch (error) {
            console.error('Error leaving company:', error)
            setLeaveCompanyError('Failed to return to IdleForest')
        } finally {
            setLeavingCompany(false)
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
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-none p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Loading profile...</p>
                </div>
            </main>
        )
    }

    if (!profile) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-none p-8">
                    <h2 className="text-2xl font-extrabold font-candu uppercase mb-4">Profile Not Found</h2>
                    <p className="text-neutral-600 mb-6">The profile you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                    <Link
                        href="/"
                        className="block w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-none hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-center"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-gray px-4 pb-16 pt-10 font-rethink-sans sm:pt-14">
            <div className="w-full max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <section className="border-2 border-black bg-brand-gray p-6 sm:p-8">
                    <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <h1 className="break-words font-candu text-4xl font-extrabold uppercase leading-none text-brand-navy sm:text-5xl">
                                {profile.display_name}
                            </h1>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-neutral-700">
                                <span>Member since {new Date(profile.created_at).toLocaleDateString('en', { month: 'short', year: 'numeric' })}</span>
                                {platforms.map(platform => {
                                    const meta = PLATFORM_META[platform]
                                    if (!meta) return null
                                    const Icon = meta.icon
                                    return (
                                        <span key={platform} className="inline-flex items-center gap-1 border border-black/40 px-1.5 py-0.5 text-xs font-bold text-neutral-700">
                                            <Icon className="h-3 w-3" aria-hidden="true" />
                                            {meta.label}
                                        </span>
                                    )
                                })}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-2">
                                {userTeam ? (
                                    <Link
                                        href={`/teams/${userTeam.slug}`}
                                        className="inline-flex items-center gap-2 border-2 border-black bg-brand-navy px-3 py-2 text-sm font-black text-white"
                                    >
                                        <Users className="h-4 w-4 text-brand-yellow" aria-hidden="true" />
                                        {userTeam.name}
                                    </Link>
                                ) : null}

                                {companyForest ? (
                                    <span className="inline-flex items-center gap-2 border-2 border-black bg-brand-gray px-2 py-1.5">
                                        <Link href={`/en/c/${companyForest.slug}`} className="flex min-w-0 items-center gap-2" title={getCompanyImpactDescription(companyForest)}>
                                            <span className="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden border border-black bg-black">
                                                {getCompanyLogoUrl(companyForest) ? (
                                                    // eslint-disable-next-line @next/next/no-img-element
                                                    <img src={getCompanyLogoUrl(companyForest)!} alt="" className="h-full w-full object-contain p-0.5" />
                                                ) : (
                                                    <Building2 className="h-3.5 w-3.5 text-brand-yellow" />
                                                )}
                                            </span>
                                            <span className="truncate text-sm font-black">{companyForest.name}</span>
                                        </Link>
                                        {isOwnProfile && (
                                            <button
                                                type="button"
                                                onClick={() => setShowLeaveCompanyModal(true)}
                                                className="flex h-6 w-6 shrink-0 items-center justify-center border border-black bg-black text-white hover:bg-neutral-800"
                                                title="Return to IdleForest"
                                                aria-label="Return to IdleForest"
                                            >
                                                <LogOut className="h-3 w-3" />
                                            </button>
                                        )}
                                    </span>
                                ) : null}

                                {isOwnProfile && !userTeam && (
                                    <button
                                        onClick={() => setShowCreateTeamModal(true)}
                                        className="inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-sm font-black hover:bg-black/5"
                                    >
                                        <Plus className="h-4 w-4" aria-hidden="true" />
                                        Create team
                                    </button>
                                )}

                                {isOwnProfile && (
                                    <Link
                                        href={`/share/user/${profile.display_name}`}
                                        className="inline-flex items-center gap-2 border-2 border-black bg-brand-yellow px-3 py-2 text-sm font-black text-black"
                                    >
                                        <Share2 className="h-4 w-4" aria-hidden="true" />
                                        Share profile
                                    </Link>
                                )}
                            </div>
                        </div>

                        <dl className="grid shrink-0 grid-cols-3 gap-2 sm:w-[26rem] [&>div]:min-w-0">
                            <div className="border-2 border-black bg-brand-yellow p-3">
                                <dt className="text-[10px] font-black uppercase tracking-wider">Trees planted</dt>
                                <dd className="mt-1 truncate font-candu text-xl font-extrabold leading-none sm:text-3xl">{treesPlanted.toLocaleString('en')}</dd>
                            </div>
                            <div className="border-2 border-black p-3">
                                <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-600">Points</dt>
                                <dd className="mt-1 truncate font-candu text-xl font-extrabold leading-none sm:text-3xl">{(profile.total_points || 0).toLocaleString('en')}</dd>
                            </div>
                            <div className="border-2 border-black p-3">
                                <dt className="text-[10px] font-black uppercase tracking-wider text-neutral-600">Invited</dt>
                                <dd className="mt-1 truncate font-candu text-xl font-extrabold leading-none sm:text-3xl">{(publicReferralImpact?.referrals ?? referralStats.total_referrals).toLocaleString('en')}</dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {/* Create Team Modal */}
                {showCreateTeamModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="w-full max-w-md bg-white border-2 border-black shadow-none p-8">
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
                                    className="flex-1 py-3 font-bold uppercase tracking-wider bg-gray-100 border-2 border-black shadow-none hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateTeam}
                                    disabled={creatingTeam}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-none hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none transition-all disabled:opacity-50"
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

                {showLeaveCompanyModal && companyForest && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <div className="w-full max-w-md border-2 border-black bg-white p-8 shadow-none">
                            <h2 className="mb-4 text-2xl font-extrabold font-candu uppercase">Return to IdleForest?</h2>
                            <p className="mb-4 text-sm font-semibold leading-6 text-neutral-700">
                                This will stop routing your future activity to {companyForest.name} and move you back to IdleForest&apos;s general reforestation impact.
                            </p>
                            <p className="mb-6 text-sm font-semibold leading-6 text-neutral-700">
                                Your existing contribution history for {companyForest.name} will stay recorded.
                            </p>

                            {leaveCompanyError && (
                                <p className="mb-4 text-sm font-bold text-red-600">{leaveCompanyError}</p>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowLeaveCompanyModal(false)
                                        setLeaveCompanyError('')
                                    }}
                                    disabled={leavingCompany}
                                    className="flex-1 border-2 border-black bg-gray-100 py-3 font-bold uppercase tracking-wider shadow-none transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                                >
                                    Keep Fund
                                </button>
                                <button
                                    type="button"
                                    onClick={handleLeaveCompany}
                                    disabled={leavingCompany}
                                    className="flex-1 border-2 border-black bg-brand-yellow py-3 font-bold uppercase tracking-wider shadow-none transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none disabled:opacity-50"
                                >
                                    {leavingCompany ? 'Returning...' : 'Return'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {!isSignedIn && (
                    <ProfileJoinCta
                        displayName={profile.display_name}
                        invitePath={publicReferralImpact?.invitePath}
                    />
                )}

                <ForestImpactPanel mode="public" displayName={profile.display_name} />

                {historicalData.length > 0 && (
                    <PointsHistoryChart
                        data={historicalData}
                        title="Points History"
                        surfaceClassName="bg-brand-gray"
                    />
                )}

                <section className="border-2 border-black bg-brand-gray p-6 sm:p-8">
                    <BadgeDisplay userId={profile.user_id} variant="light" />
                </section>
            </div>
        </main>
    )
}
