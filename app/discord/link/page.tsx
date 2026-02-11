'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import Link from 'next/link'

function DiscordLinkContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const supabase = createClient()

    const [isLoading, setIsLoading] = useState(true)
    const [status, setStatus] = useState<'checking' | 'unauthenticated' | 'linking_required' | 'creating' | 'success' | 'error' | 'conflict_existing_team'>('checking')
    const [errorMessage, setErrorMessage] = useState('')
    const [teamData, setTeamData] = useState<{ name: string, slug: string } | null>(null)
    const [conflictTeamId, setConflictTeamId] = useState<string | null>(null)
    const [conflictTeamRole, setConflictTeamRole] = useState<string | null>(null)
    const [conflictTeamName, setConflictTeamName] = useState<string | null>(null)
    const [conflictHasDiscord, setConflictHasDiscord] = useState<boolean>(false)

    const action = searchParams.get('action')
    const guildId = searchParams.get('guild_id')
    const guildName = searchParams.get('guild_name')

    useEffect(() => {
        const createTeam = async (name: string, discordId: string) => {
            try {
                const response = await fetch('/api/teams/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: name,
                        discordGuildId: discordId
                        // Description and Image are optional/not provided by Discord params
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    if (response.status === 409 && data.conflictTeamId) {
                        setConflictTeamId(data.conflictTeamId)
                        setConflictTeamRole(data.conflictTeamRole)
                        setConflictTeamName(data.conflictTeamName)
                        setConflictHasDiscord(data.conflictHasDiscord)
                        setStatus('conflict_existing_team')
                        return
                    }
                    // Special handling if needed, but API returns standard error format
                    throw new Error(data.error || 'Failed to create team')
                }

                setTeamData(data.team)
                setStatus('success')
            } catch (err: any) {
                console.error('Team creation error:', err)
                setErrorMessage(err.message || 'Failed to create team')
                setStatus('error')
            } finally {
                setIsLoading(false)
            }
        }

        const init = async () => {
            try {
                // 1. Check Auth
                const { data: { user } } = await supabase.auth.getUser()

                if (!user) {
                    setStatus('unauthenticated')
                    setIsLoading(false)
                    return
                }

                // 2. Check Discord Link
                // supabase.auth.getUser() returns identities in user object
                const isDiscordLinked = user.identities?.some(id => id.provider === 'discord')

                if (!isDiscordLinked) {
                    setStatus('linking_required')
                    setIsLoading(false)
                    return
                }

                // 3. Handle Action
                if (action === 'create_team') {
                    if (!guildId || !guildName) {
                        setErrorMessage('Missing Discord server information.')
                        setStatus('error')
                        setIsLoading(false)
                        return
                    }

                    setStatus('creating')
                    await createTeam(guildName, guildId)
                } else {
                    // No action specified, just landed here?
                    // Maybe just show specific success or generic state
                    setStatus('success') // Or some "Connected" state
                    setIsLoading(false)
                }

            } catch (err) {
                console.error('Error in Discord link flow:', err)
                setErrorMessage('An unexpected error occurred.')
                setStatus('error')
                setIsLoading(false)
            }
        }

        init()
    }, [action, guildId, guildName, router, searchParams]) // supabase is stable

    const handleConnectDiscord = async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams(searchParams.toString())
            const currentPath = `${window.location.origin}/discord/link?${params.toString()}`

            const { data: { user } } = await supabase.auth.getUser()

            if (!user) {
                // Not logged in - Sign in with Discord
                const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'discord',
                    options: {
                        redirectTo: currentPath,
                        scopes: 'identify email guilds'
                    }
                })
                if (error) throw error
            } else {
                // Logged in - Link Identity
                const { data, error } = await supabase.auth.linkIdentity({
                    provider: 'discord',
                    options: {
                        redirectTo: currentPath,
                        scopes: 'identify email guilds'
                    }
                })

                if (error) throw error

                if (data?.url) {
                    window.location.href = data.url
                } else {
                    throw new Error('No redirect URL initiated')
                }
            }

        } catch (err: any) {
            console.error('Error connecting Discord:', err)
            setErrorMessage(err.message || 'Failed to connect Discord')
            setStatus('error')
            setIsLoading(false)
        }
    }

    const handleLeaveAndCreate = async () => {
        if (!conflictTeamId) return

        setIsLoading(true)
        try {
            // 1. Leave current team
            const leaveResponse = await fetch('/api/teams/leave', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teamId: conflictTeamId })
            })

            const leaveData = await leaveResponse.json()

            if (!leaveResponse.ok) {
                throw new Error(leaveData.error || 'Failed to leave current team')
            }

            // 2. Retry creating the new team
            if (guildName && guildId) {
                // Reset conflict state
                setConflictTeamId(null)
                // We need to call the create logic again. 
                // Since this function is outside useEffect, we can't easily reuse createTeam unless we extract it.
                // But we can trigger a state change or just reload/recall.

                // Let's manually call the creation logic here to be safe and clear
                const response = await fetch('/api/teams/create', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: guildName,
                        discordGuildId: guildId
                    })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to create team after leaving')
                }

                setTeamData(data.team)
                setStatus('success')
            }

        } catch (err: any) {
            console.error('Error leaving/creating team:', err)
            setErrorMessage(err.message || 'something went wrong')
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    const handleConnectExistingTeam = async () => {
        if (!conflictTeamId || !guildId) return

        setIsLoading(true)
        try {
            const response = await fetch('/api/teams/link-discord', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId: conflictTeamId,
                    discordGuildId: guildId
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to connect team')
            }

            setTeamData(data.team)
            setStatus('success')
        } catch (err: any) {
            console.error('Error connecting existing team:', err)
            setErrorMessage(err.message || 'Failed to connect team')
            setStatus('error')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading || status === 'checking' || status === 'creating') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-brand-yellow mb-4" />
                <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-2">
                    {status === 'creating' ? 'Setting up your Team...' : 'Checking details...'}
                </h1>
                <p className="text-neutral-600">Please wait a moment.</p>
            </div>
        )
    }

    if (status === 'unauthenticated') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
                    <div className="bg-brand-yellow w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                        Welcome to IdleForest
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        To join <strong>{guildName || 'this server'}</strong>'s team, please sign in with Discord.
                    </p>
                    <button
                        onClick={handleConnectDiscord}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Sign in with Discord
                    </button>
                    <div className="mt-4 text-sm">
                        <p className="text-neutral-500">Already have an account?</p>
                        <Link
                            href={`/auth/user/login?redirect=${encodeURIComponent(`/discord/link?${searchParams.toString()}`)}`}
                            className="font-bold underline hover:text-brand-navy"
                        >
                            Log in with Email
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'linking_required') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
                    <div className="bg-brand-yellow w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                        Connect Discord
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        To create a team for <strong>{guildName || 'your server'}</strong>, you need to link your Discord account first.
                    </p>
                    <button
                        onClick={handleConnectDiscord}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Connect Discord Account
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'error') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
                    <div className="bg-red-100 w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                        Something went wrong
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        {errorMessage}
                    </p>
                    <Link
                        href="/teams"
                        className="block w-full py-3 font-bold uppercase tracking-wider bg-white border-2 border-black hover:bg-neutral-50 transition-colors"
                    >
                        Back to Teams
                    </Link>
                </div>
            </div>
        )
    }

    if (status === 'conflict_existing_team') {
        const canConnect = (conflictTeamRole === 'owner' || conflictTeamRole === 'admin') && !conflictHasDiscord

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
                    <div className="bg-brand-yellow w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-black" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                        Already in a Team
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        You are already a member of <strong>{conflictTeamName || 'a team'}</strong>.
                        <br /><br />
                        {canConnect ? (
                            <>
                                Would you like to connect <strong>{conflictTeamName}</strong> to this Discord server, or leave and create a new team?
                            </>
                        ) : (
                            <>
                                You can only be part of one team at a time. Do you want to leave your current team and create <strong>{guildName}</strong>?
                            </>
                        )}
                    </p>
                    <div className="space-y-3">
                        {canConnect && (
                            <button
                                onClick={handleConnectExistingTeam}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-green-600 text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 className="animate-spin" /> : `Connect ${conflictTeamName}`}
                            </button>
                        )}

                        <button
                            onClick={handleLeaveAndCreate}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="animate-spin" /> : 'Leave & Create New Team'}
                        </button>

                        <Link
                            href="/teams"
                            className="block w-full py-3 font-bold uppercase tracking-wider bg-white border-2 border-black hover:bg-neutral-50 transition-colors"
                        >
                            Cancel
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (status === 'success' && teamData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full reveal-animation">
                    <div className="bg-green-100 w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-2">
                        Team Ready!
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        <strong>{teamData.name}</strong> has been successfully set up.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href={`/teams/${teamData.slug}`}
                            className="flex items-center justify-center gap-2 w-full py-4 font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            Go to Team Dashboard <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    // Generic success or fallback
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-2 border-black bg-white max-w-md mx-auto p-8">
            <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                Discord Connected
            </h1>
            <p className="text-neutral-600 mb-8">
                Your account is linked.
            </p>
            <Link
                href="/teams"
                className="block w-full py-3 font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black hover:bg-brand-yellow/80 transition-colors"
            >
                View Teams
            </Link>
        </div>
    )
}

export default function DiscordLinkPage() {
    return (
        <main className="min-h-screen bg-brand-gray font-rethink-sans pt-20">
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            }>
                <DiscordLinkContent />
            </Suspense>
        </main>
    )
}
