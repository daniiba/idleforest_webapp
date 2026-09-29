'use client'

import Image from 'next/image'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Download,
    Loader2,
    Monitor,
    RefreshCw,
    TreePine
} from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/onboarding-events'
import InviterNudge from '@/components/referrals/InviterNudge'
import ReferralAttributionSync from '@/components/referrals/ReferralAttributionSync'
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import { WindowsLogo, AppleLogo, LinuxLogo, OsLogo } from "@/components/icons/os-logos";

interface NodeStatus {
    hasNode: boolean
    hasDesktopNode: boolean
    nodeCount: number
    desktopNodeCount: number
    platforms: string[]
}

type Platform = 'windows' | 'mac' | 'linux' | 'other'
type RewardState = 'idle' | 'claiming' | 'awarded' | 'already-awarded' | 'error'
type AuthState = 'loading' | 'authenticated' | 'unauthenticated'

const supabase = createClient()

export default function WelcomePage() {
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)
    const [authState, setAuthState] = useState<AuthState>('loading')
    const [isCheckingConnection, setIsCheckingConnection] = useState(false)
    const [detectedPlatform, setDetectedPlatform] = useState<Platform>('other')
    const [rewardState, setRewardState] = useState<RewardState>('idle')
    const [rewardError, setRewardError] = useState<string | null>(null)
    const [treesAwarded, setTreesAwarded] = useState(5)
    const [hasClickedDownload, setHasClickedDownload] = useState(false)

    useEffect(() => {
        const platformString = navigator.platform.toLowerCase()
        if (platformString.includes('win')) {
            setDetectedPlatform('windows')
        } else if (platformString.includes('mac')) {
            setDetectedPlatform('mac')
        } else if (platformString.includes('linux')) {
            setDetectedPlatform('linux')
        }

        checkAuthAndNodeStatus()
    }, [])

    useEffect(() => {
        if (loadingStatus || authState !== 'authenticated' || nodeStatus?.hasDesktopNode) return

        const pollInterval = setInterval(() => {
            fetchNodeStatus({ silent: true })
        }, 5000)

        return () => clearInterval(pollInterval)
    }, [authState, loadingStatus, nodeStatus?.hasDesktopNode])

    useEffect(() => {
        if (authState !== 'authenticated' || !nodeStatus?.hasDesktopNode || rewardState !== 'idle') return

        trackOnboardingEvent('desktop_node_connected', {
            source: 'generic_welcome',
            metadata: { platforms: nodeStatus.platforms }
        })
        claimDesktopReward()
    }, [authState, nodeStatus?.hasDesktopNode, rewardState])

    const downloadUrl = useMemo(() => {
        if (detectedPlatform === 'mac') {
            return '/download/mac/installer'
        }

        if (detectedPlatform === 'linux') {
            return '/download/linux/installer'
        }

        return '/download/windows/installer'
    }, [detectedPlatform])

    const platformLabel = detectedPlatform === 'mac' ? 'Mac' : detectedPlatform === 'windows' ? 'Windows' : detectedPlatform === 'linux' ? 'Linux' : 'Desktop'

    const checkAuthAndNodeStatus = async () => {
        setLoadingStatus(true)

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setAuthState('unauthenticated')
            setNodeStatus(null)
            setLoadingStatus(false)
            return
        }

        setAuthState('authenticated')
        await fetchNodeStatus()
    }

    const fetchNodeStatus = async ({ silent = false } = {}) => {
        if (!silent) {
            setIsCheckingConnection(true)
        }

        try {
            const response = await fetch('/api/user/node-status')
            if (response.ok) {
                const status = await response.json()
                setNodeStatus(status)
                setAuthState('authenticated')
            } else if (response.status === 401) {
                setAuthState('unauthenticated')
                setNodeStatus(null)
            }
        } catch (error) {
            console.error('Error checking node status:', error)
        } finally {
            setLoadingStatus(false)
            setIsCheckingConnection(false)
        }
    }

    const claimDesktopReward = async () => {
        if (authState !== 'authenticated') {
            setRewardState('error')
            setRewardError('Sign in before claiming your desktop bonus trees.')
            return
        }

        setRewardState('claiming')
        setRewardError(null)

        try {
            const response = await fetch('/api/rewards/desktop-install', {
                method: 'POST'
            })
            const data = await response.json()

            if (!response.ok && response.status !== 202) {
                throw new Error(data.error || 'Could not award desktop bonus yet.')
            }

            setTreesAwarded(data.trees || 5)

            if (data.processing) {
                window.setTimeout(() => setRewardState('idle'), 3000)
                return
            }

            if (data.alreadyAwarded) {
                setRewardState('already-awarded')
            } else if (data.awarded) {
                trackOnboardingEvent('desktop_reward_awarded', {
                    source: 'generic_welcome',
                    metadata: { trees: data.trees || 5 }
                })
                setRewardState('awarded')
            } else {
                setRewardState('claiming')
            }
        } catch (error) {
            setRewardState('error')
            setRewardError(error instanceof Error ? error.message : 'Could not award desktop bonus yet.')
        }
    }

    const hasExtensionOnly = nodeStatus?.hasNode && !nodeStatus.hasDesktopNode
    const isAuthenticated = authState === 'authenticated'

    const currentStep = !isAuthenticated ? 1 : nodeStatus?.hasDesktopNode ? 3 : hasClickedDownload ? 3 : 2
    const steps = ['Sign in', 'Download', 'Log in & sync']

    return (
        <main className="min-h-screen bg-[#F7F7F2] px-4 py-10 text-brand-navy sm:py-16">
            <ReferralAttributionSync />

            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
                <Link href="/" className="mx-auto">
                    <Image src="/logo.png" alt="IdleForest" width={121} height={33} priority className="h-auto w-[121px]" />
                </Link>

                {isAuthenticated ? <InviterNudge connected={Boolean(nodeStatus?.hasDesktopNode)} /> : null}

                <header className="text-center">
                    <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Grow your forest faster</h1>
                    <p className="mx-auto mt-3 max-w-md text-base text-neutral-600">
                        {isAuthenticated
                            ? "Install the desktop app and log in with this account to claim 5 bonus trees. We'll detect the connection automatically."
                            : 'Sign in, then connect the desktop app to claim 5 bonus trees.'}
                    </p>
                </header>

                <ol className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Progress">
                    {steps.map((label, index) => {
                        const step = index + 1
                        const done = nodeStatus?.hasDesktopNode || step < currentStep
                        const active = !done && step === currentStep
                        return (
                            <li key={label} className="flex items-center gap-2">
                                <span
                                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                        done ? 'bg-brand-navy text-brand-yellow' : active ? 'bg-brand-yellow text-brand-navy ring-2 ring-brand-navy' : 'bg-neutral-200 text-neutral-500'
                                    }`}
                                >
                                    {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : step}
                                </span>
                                <span className={active || done ? 'text-brand-navy' : 'text-neutral-500'}>{label}</span>
                                {step < steps.length && <span className="mx-1 h-px w-6 bg-neutral-300 sm:w-10" aria-hidden="true" />}
                            </li>
                        )
                    })}
                </ol>

                <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                    {authState === 'loading' ? (
                        <div className="py-6 text-center text-neutral-600">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                            <p className="mt-3 text-sm font-semibold">Checking your account...</p>
                        </div>
                    ) : authState === 'unauthenticated' ? (
                        <div className="text-center">
                            <h2 className="text-xl font-extrabold">Sign in to continue</h2>
                            <p className="mx-auto mt-2 max-w-sm text-sm text-neutral-600">
                                The bonus is tied to your profile. Sign in, then come back here to install the app.
                            </p>
                            <Link
                                href="/auth/user/login?redirect=/welcome"
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
                            >
                                Sign in <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    ) : nodeStatus?.hasDesktopNode ? (
                        <div className="text-center">
                            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                            </div>
                            <h2 className="text-2xl font-extrabold">Desktop connected</h2>
                            <p className="mt-2 text-sm text-neutral-600">Your desktop app is synced to this account.</p>

                            <div className="mt-6 rounded-2xl bg-brand-yellow/60 p-4" aria-live="polite">
                                {rewardState === 'claiming' && (
                                    <p className="flex items-center justify-center gap-2 text-sm font-bold">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Awarding your bonus...
                                    </p>
                                )}
                                {(rewardState === 'awarded' || rewardState === 'already-awarded') && (
                                    <p className="flex items-center justify-center gap-2 text-lg font-extrabold">
                                        <TreePine className="h-5 w-5" aria-hidden="true" />
                                        {rewardState === 'already-awarded' ? 'Bonus already claimed' : `${treesAwarded} bonus trees awarded`}
                                    </p>
                                )}
                                {rewardState === 'error' && (
                                    <div className="space-y-3">
                                        <p className="flex items-center justify-center gap-2 text-sm font-bold text-red-800">
                                            <AlertCircle className="h-4 w-4" aria-hidden="true" />
                                            {rewardError}
                                        </p>
                                        <button
                                            onClick={claimDesktopReward}
                                            className="rounded-full bg-white px-4 py-2 text-sm font-bold"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/"
                                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
                            >
                                Continue <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-extrabold">Get the desktop app</h2>
                            <p className="mt-2 text-sm text-neutral-600">
                                It keeps planting while your browser is closed, so it earns more impact.
                            </p>

                            <a
                                href={downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => {
                                    setHasClickedDownload(true)
                                    trackOnboardingEvent('desktop_download_clicked', {
                                        source: 'generic_welcome',
                                        metadata: { platform: detectedPlatform }
                                    })
                                }}
                                className="mt-6 flex items-center gap-4 rounded-2xl bg-brand-navy p-4 text-white transition-colors hover:bg-black"
                            >
                                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-brand-navy">
                                    <OsLogo os={detectedPlatform === 'mac' ? 'mac' : detectedPlatform === 'linux' ? 'linux' : 'windows'} className="h-6 w-6" />
                                </span>
                                <span className="flex-1">
                                    <span className="block text-base font-bold">Download for {platformLabel}</span>
                                    <span className="block text-sm text-neutral-300">Log in after installing to claim 5 trees</span>
                                </span>
                                <Download className="h-5 w-5 shrink-0 text-brand-yellow" aria-hidden="true" />
                            </a>

                            <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 p-4">
                                <div className="text-sm">
                                    <p className="flex items-center gap-2 font-bold">
                                        <span className="relative flex h-2 w-2">
                                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                                            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                                        </span>
                                        Waiting for desktop sync
                                    </p>
                                    <p className="mt-1 text-neutral-600">
                                        This page updates automatically once you log in.
                                    </p>
                                    {hasExtensionOnly && (
                                        <p className="mt-2 font-semibold text-orange-700">
                                            We found the browser extension. Log in to the desktop app to unlock the bonus.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => fetchNodeStatus()}
                                    disabled={isCheckingConnection || loadingStatus}
                                    className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-neutral-100 disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} aria-hidden="true" />
                                    Check
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {isAuthenticated ? <ForestImpactPanel mode="self" /> : null}
            </div>
        </main>
    )
}
