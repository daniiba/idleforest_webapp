'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Users, Loader2, UserPlus, TreePine, AlertTriangle } from 'lucide-react'

interface InviteData {
    id: string
    team_id: string
    invite_code: string
    expires_at: string | null
    created_by: string
    team: {
        id: string
        name: string
        total_points: number
        description: string | null
        image_url: string | null
        slug: string
    }
    inviter: {
        display_name: string
    }
    memberCount: number
}

// Create client once outside component
const supabase = createClient()

export default function InvitePageClient() {
    const [inviteData, setInviteData] = useState<InviteData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [joining, setJoining] = useState(false)
    const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null)
    const [existingTeam, setExistingTeam] = useState<{ id: string; name: string; slug?: string } | null>(null)
    const [isTeamOwner, setIsTeamOwner] = useState(false)
    const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        fetchInviteData()
        checkCurrentUser()
    }, [params.code])

    const checkCurrentUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setCurrentUser(user)

        // Check if user is already in a team
        if (user) {
            const { data: membership } = await supabase
                .from('team_members')
                .select('team_id, teams(id, name, created_by, slug)')
                .eq('user_id', user.id)
                .single()

            if (membership?.teams) {
                // teams is an object when using .single()
                const team = membership.teams as unknown as { id: string; name: string; created_by: string; slug: string }
                setExistingTeam({ id: team.id, name: team.name, slug: team.slug })
                // Check if user is the owner
                setIsTeamOwner(team.created_by === user.id)
            }
        }
    }

    const fetchInviteData = async () => {
        try {
            setLoading(true)
            setError(null)

            // Get invite details
            const { data: invite, error: inviteError } = await supabase
                .from('team_invites')
                .select(`
					id,
					team_id,
					invite_code,
					expires_at,
					created_by
				`)
                .eq('invite_code', params.code)
                .single()

            if (inviteError || !invite) {
                setError('This invite link is invalid or has expired.')
                return
            }

            // Check if invite has expired
            if (invite.expires_at && new Date(invite.expires_at) < new Date()) {
                setError('This invite link has expired.')
                return
            }

            // Get team details
            const { data: team, error: teamError } = await supabase
                .from('teams')
                .select('id, name, total_points, description, image_url, slug')
                .eq('id', invite.team_id)
                .single()

            if (teamError || !team) {
                setError('Team not found.')
                return
            }

            // Get inviter details
            const { data: inviterProfile } = await supabase
                .from('profiles')
                .select('display_name')
                .eq('user_id', invite.created_by)
                .single()

            // Get member count
            const { count } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', invite.team_id)

            setInviteData({
                ...invite,
                team,
                inviter: inviterProfile || { display_name: 'A team member' },
                memberCount: count || 0
            })

        } catch (err) {
            console.error('Error fetching invite:', err)
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleJoinTeam = async (confirmSwitch = false) => {
        if (!currentUser) {
            // Redirect to signup with invite code
            router.push(`/auth/user/signup?invite=${params.code}`)
            return
        }

        setJoining(true)
        setError(null)
        try {
            const response = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: params.code, confirmSwitch })
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 409) {
                    if (data.requiresConfirmation && data.currentTeam) {
                        // Show confirmation dialog
                        setExistingTeam(data.currentTeam)
                        setShowSwitchConfirm(true)
                        setJoining(false)
                        return
                    }
                    // Already a member of this team
                    router.push(`/teams/${inviteData?.team.slug}`)
                    return
                }
                if (response.status === 403 && data.isOwner) {
                    // User owns their current team - can't switch
                    setError('You are the owner of your current team. Delete your team before joining a new one.')
                    setJoining(false)
                    return
                }
                throw new Error(data.error || 'Failed to join team')
            }

            // Success - redirect to team welcome page for progressive engagement
            router.push(`/welcome/team/${inviteData?.team.id}`)

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to join team')
        } finally {
            setJoining(false)
        }
    }

    const handleConfirmSwitch = () => {
        setShowSwitchConfirm(false)
        handleJoinTeam(true)
    }

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Loading invite...</p>
                </div>
            </main>
        )
    }

    if (error || !inviteData) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                    <h1 className="text-3xl font-extrabold font-candu uppercase mb-4 text-center">
                        Oops!
                    </h1>
                    <p className="text-neutral-600 text-center mb-6">{error || 'Invalid invite link'}</p>
                    <Link
                        href="/"
                        className="block w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all text-center"
                    >
                        Go to Homepage
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
            <div className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-yellow border-2 border-black mb-4">
                        <UserPlus className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-candu uppercase mb-2">
                        You&apos;re Invited!
                    </h1>
                    <p className="text-neutral-600">
                        <span className="font-bold text-black">{inviteData.inviter.display_name}</span> has invited you to join
                    </p>
                </div>

                {/* Team Info Card */}
                <div className="border-2 border-black p-6 mb-6 bg-neutral-50">
                    {/* Team Image */}
                    {inviteData.team.image_url ? (
                        <div className="flex justify-center mb-4">
                            <img
                                src={inviteData.team.image_url}
                                alt={`${inviteData.team.name} logo`}
                                className="w-24 h-24 object-cover border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </div>
                    ) : (
                        <div className="flex justify-center mb-4">
                            <div className="w-24 h-24 bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                                <Users className="w-10 h-10 text-black" />
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl font-bold font-candu uppercase text-center text-black">{inviteData.team.name}</h2>

                    {/* Team Description */}
                    {inviteData.team.description && (
                        <p className="text-neutral-600 text-sm text-center mt-2">{inviteData.team.description}</p>
                    )}

                    {/* Stats */}
                    <div className="flex justify-center gap-8 mt-4 pt-4 border-t-2 border-dashed border-neutral-300">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-black">{inviteData.memberCount}</p>
                            <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Members</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-black">{inviteData.team.total_points.toLocaleString()}</p>
                            <p className="text-xs uppercase tracking-wider text-neutral-500 font-semibold">Points</p>
                        </div>
                    </div>

                    {/* Tree Planting Message */}
                    <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t-2 border-dashed border-neutral-300">
                        <TreePine className="w-5 h-5 text-green-600" />
                        <p className="text-sm text-neutral-600">
                            Plant trees together!
                        </p>
                    </div>
                </div>

                {/* Switch Team Warning - shows proactively if user is in a different team */}
                {existingTeam && existingTeam.id !== inviteData.team.id && (
                    <div className={`border-2 p-4 mb-4 ${isTeamOwner ? 'border-red-400 bg-red-50' : 'border-orange-400 bg-orange-50'}`}>
                        <div className="flex items-start gap-3">
                            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isTeamOwner ? 'text-red-500' : 'text-orange-500'}`} />
                            <div>
                                <p className={`font-bold mb-1 ${isTeamOwner ? 'text-red-800' : 'text-orange-800'}`}>
                                    {isTeamOwner ? "You're the owner of your team" : "You're already in a team"}
                                </p>
                                <p className={`text-sm mb-3 ${isTeamOwner ? 'text-red-700' : 'text-orange-700'}`}>
                                    {isTeamOwner ? (
                                        <>
                                            You own <span className="font-bold">{existingTeam.name}</span>.
                                            You must delete your team before joining <span className="font-bold">{inviteData.team.name}</span>.
                                        </>
                                    ) : (
                                        <>
                                            You are currently a member of <span className="font-bold">{existingTeam.name}</span>.
                                            Joining <span className="font-bold">{inviteData.team.name}</span> will remove you from your current team.
                                        </>
                                    )}
                                </p>
                                {isTeamOwner ? (
                                    <Link
                                        href={`/teams/${existingTeam.slug || existingTeam.id}`}
                                        className="inline-block px-4 py-2 text-sm font-bold uppercase bg-red-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                    >
                                        Go to Your Team
                                    </Link>
                                ) : showSwitchConfirm ? (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleConfirmSwitch}
                                            disabled={joining}
                                            className="px-4 py-2 text-sm font-bold uppercase bg-orange-500 text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                                        >
                                            {joining ? 'Switching...' : 'Confirm Switch'}
                                        </button>
                                        <button
                                            onClick={() => setShowSwitchConfirm(false)}
                                            className="px-4 py-2 text-sm font-bold uppercase bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    </div>
                )}

                {/* CTA Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => handleJoinTeam()}
                        disabled={joining || showSwitchConfirm || isTeamOwner}
                        className="w-full py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-[4px] active:translate-x-[4px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {joining ? (
                            <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Joining...</>
                        ) : currentUser ? (
                            'Join Team'
                        ) : (
                            'Sign Up & Join'
                        )}
                    </button>

                    {!currentUser && (
                        <Link
                            href={`/auth/user/login?redirect=/invite/${params.code}`}
                            className="block w-full py-3 text-sm font-bold uppercase tracking-wider text-center text-neutral-600 border-2 border-neutral-300 hover:border-black hover:bg-neutral-100 transition-all"
                        >
                            Already have an account? Log in
                        </Link>
                    )}
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-neutral-300 text-center">
                    <p className="text-xs text-neutral-500">
                        By joining, you agree to our{' '}
                        <Link href="/terms" className="underline hover:text-black">Terms of Service</Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
