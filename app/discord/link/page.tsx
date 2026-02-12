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
    const [status, setStatus] = useState<'checking' | 'unauthenticated' | 'linking_required' | 'success' | 'error'>('checking')
    const [errorMessage, setErrorMessage] = useState('')

    // We can use these for context in the UI, but no logic depends on them for team creation anymore
    const guildId = searchParams.get('guild_id')
    const guildName = searchParams.get('guild_name')

    useEffect(() => {
        const init = async () => {
            try {
                // 1. Check Auth
                console.log('[Discord Link] Checking auth...')
                const { data: { user }, error: authError } = await supabase.auth.getUser()

                if (authError) {
                    console.error('[Discord Link] Auth error:', authError)
                    // If session is missing, just treat as unauthenticated
                    if (authError.name !== 'AuthSessionMissingError') {
                        throw authError
                    }
                }

                if (!user) {
                    console.log('[Discord Link] No user found, showing login screen')
                    // Show login screen instead of auto-redirecting
                    setStatus('unauthenticated')
                    setIsLoading(false)
                    return
                }

                console.log('[Discord Link] User found:', user.id)

                // 2. Check Discord Link
                const discordIdentity = user.identities?.find(id => id.provider === 'discord')

                if (!discordIdentity) {
                    console.log('[Discord Link] No Discord identity found for user')
                    setStatus('linking_required')
                    setIsLoading(false)
                    return
                }

                console.log('[Discord Link] Discord identity found:', discordIdentity.id)

                // 2.5 Sync Discord ID to Profile if missing
                // The bot looks for 'discord_user_id' in the profiles table.
                const discordUserId = discordIdentity.id // Supabase stores the provider's unique ID here

                console.log('[Discord Link] Updating profile with discord_user_id:', discordUserId)
                const { data: profileData, error: profileError } = await supabase
                    .from('profiles')
                    .update({ discord_user_id: discordUserId })
                    .eq('user_id', user.id)
                    .select()

                if (profileError) {
                    console.error('[Discord Link] Profile update error:', profileError)
                } else {
                    console.log('[Discord Link] Profile updated successfully:', profileData)
                    if (profileData.length === 0) {
                        console.warn('[Discord Link] WARNING: Profile update returned 0 rows. Does the profile exist?')
                    }
                }

                // 3. Success - User is logged in and linked
                setStatus('success')
                setIsLoading(false)

            } catch (err) {
                console.error('[Discord Link] Error in Discord link flow:', err)
                setErrorMessage('An unexpected error occurred.')
                setStatus('error')
                setIsLoading(false)
            }
        }

        init()
    }, [router, searchParams])

    const handleLoginWithDiscord = async () => {
        setIsLoading(true)
        try {
            const origin = window.location.origin
            const redirectUrl = `${origin}/discord/link`
            const queryParams: Record<string, string> = {}
            searchParams.forEach((value, key) => {
                queryParams[key] = value
            })

            console.log('Starting Discord login flow')
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'discord',
                options: {
                    redirectTo: `${origin}/auth/callback?next=/discord/link`,
                    scopes: 'identify email guilds',
                    queryParams: queryParams
                }
            })

            if (error) throw error
        } catch (err: any) {
            console.error('Error logging in with Discord:', err)
            setErrorMessage(err.message || 'Failed to login with Discord')
            setStatus('error')
            setIsLoading(false)
        }
    }

    const handleConnectDiscord = async () => {
        setIsLoading(true)
        try {
            const origin = window.location.origin
            // Redirect to callback route to handle code exchange
            // const redirectUrl = `${origin}/auth/callback?next=/discord/link`

            const queryParams: Record<string, string> = {}
            searchParams.forEach((value, key) => {
                queryParams[key] = value
            })

            console.log('Starting Discord link flow')
            const { error } = await supabase.auth.linkIdentity({
                provider: 'discord',
                options: {
                    redirectTo: `${origin}/auth/callback?next=/discord/link`,
                    scopes: 'identify email guilds',
                    queryParams: queryParams
                }
            })

            if (error) throw error

            // linkIdentity will handle the redirect
        } catch (err: any) {
            console.error('Error linking Discord:', err)
            setErrorMessage(err.message || 'Failed to connect Discord')
            setStatus('error')
            setIsLoading(false)
        }
    }

    if (isLoading || status === 'checking') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <Loader2 className="w-12 h-12 animate-spin text-brand-yellow mb-4" />
                <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-2">
                    Checking Account...
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
                        Login Required
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        To continue setting up your team for <strong>{guildName || 'your server'}</strong>, please log in with Discord.
                    </p>
                    <button
                        onClick={handleLoginWithDiscord}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Login with Discord
                    </button>
                    <div className="mt-6">
                        <Link
                            href="/"
                            className="text-sm text-neutral-500 hover:text-black underline"
                        >
                            Back to Home
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
                        To continue setting up your team for <strong>{guildName || 'your server'}</strong>, please link your Discord account.
                    </p>
                    <button
                        onClick={handleConnectDiscord}
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Connect Discord Account
                    </button>
                    <div className="mt-6">
                        <Link
                            href="/profile"
                            className="text-sm text-neutral-500 hover:text-black underline"
                        >
                            Return to Profile
                        </Link>
                    </div>
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
                    <button
                        onClick={() => window.location.reload()}
                        className="block w-full py-3 font-bold uppercase tracking-wider bg-white border-2 border-black hover:bg-neutral-50 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    if (status === 'success') {
        const returnUrl = guildId
            ? `https://discord.com/channels/${guildId}`
            : 'https://discord.com/app'

        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center max-w-md mx-auto">
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full reveal-animation">
                    <div className="bg-green-100 w-16 h-16 flex items-center justify-center border-2 border-black rounded-full mx-auto mb-6">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold font-candu uppercase text-brand-navy mb-4">
                        Account Connected!
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        Your Discord account has been successfully linked. You can now return to Discord to finish setting up your team.
                    </p>
                    <a
                        href={returnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 py-4 font-bold uppercase tracking-wider bg-[#5865F2] text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        Return to Discord <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        )
    }

    return null
}

export default function DiscordLinkPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-yellow" />
            </div>
        }>
            <DiscordLinkContent />
        </Suspense>
    )
}
