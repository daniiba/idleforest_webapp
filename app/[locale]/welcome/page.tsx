'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
    AlertCircle,
    ArrowRight,
    CheckCircle2,
    Download,
    Loader2,
    Monitor,
    RefreshCw,
    Sparkles,
    TreePine
} from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/onboarding-events'

interface NodeStatus {
    hasNode: boolean
    hasDesktopNode: boolean
    nodeCount: number
    desktopNodeCount: number
    platforms: string[]
}

type Platform = 'windows' | 'mac' | 'other'
type RewardState = 'idle' | 'claiming' | 'awarded' | 'already-awarded' | 'error'

export default function WelcomePage() {
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loadingStatus, setLoadingStatus] = useState(true)
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
        }

        fetchNodeStatus()
    }, [])

    useEffect(() => {
        if (loadingStatus || nodeStatus?.hasDesktopNode) return

        const pollInterval = setInterval(() => {
            fetchNodeStatus({ silent: true })
        }, 5000)

        return () => clearInterval(pollInterval)
    }, [loadingStatus, nodeStatus?.hasDesktopNode])

    useEffect(() => {
        if (!nodeStatus?.hasDesktopNode || rewardState !== 'idle') return

        trackOnboardingEvent('desktop_node_connected', {
            source: 'generic_welcome',
            metadata: { platforms: nodeStatus.platforms }
        })
        claimDesktopReward()
    }, [nodeStatus?.hasDesktopNode, rewardState])

    const downloadUrl = useMemo(() => {
        if (detectedPlatform === 'mac') {
            return 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip'
        }

        return 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe'
    }, [detectedPlatform])

    const platformLabel = detectedPlatform === 'mac' ? 'Mac' : detectedPlatform === 'windows' ? 'Windows' : 'Desktop'

    const fetchNodeStatus = async ({ silent = false } = {}) => {
        if (!silent) {
            setIsCheckingConnection(true)
        }

        try {
            const response = await fetch('/api/user/node-status')
            if (response.ok) {
                const status = await response.json()
                setNodeStatus(status)
            }
        } catch (error) {
            console.error('Error checking node status:', error)
        } finally {
            setLoadingStatus(false)
            setIsCheckingConnection(false)
        }
    }

    const claimDesktopReward = async () => {
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

    return (
        <main className="relative min-h-screen overflow-hidden bg-brand-gray px-4 py-12 font-rethink-sans text-black">
            <Image
                src="/yellow-shape.svg"
                alt=""
                fill
                sizes="150vw"
                className="absolute -bottom-20 -left-10 object-cover pointer-events-none select-none opacity-100"
            />

            <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-6">
                <section className="bg-white border-2 border-black p-8 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center border-2 border-black bg-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Sparkles className="h-10 w-10" />
                    </div>
                    <h1 className="font-candu text-4xl font-extrabold uppercase leading-tight md:text-6xl">
                        Unlock Desktop Bonus Trees
                    </h1>
                    <p className="mx-auto mt-4 max-w-xl text-lg text-neutral-700">
                        Download the IdleForest desktop app, log in with this account, and we&apos;ll automatically detect your connection.
                    </p>
                </section>

                {nodeStatus?.hasDesktopNode ? (
                    <section className="bg-white border-2 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex flex-col items-center text-center">
                            <div className="mb-5 flex h-16 w-16 items-center justify-center border-2 border-black bg-green-500">
                                <CheckCircle2 className="h-9 w-9 text-white" />
                            </div>
                            <h2 className="font-candu text-3xl font-extrabold uppercase">
                                Desktop Connected
                            </h2>
                            <p className="mt-3 max-w-lg text-neutral-700">
                                Your desktop app is synced to this account.
                            </p>

                            <div className="mt-6 w-full border-2 border-black bg-brand-yellow p-5">
                                {rewardState === 'claiming' && (
                                    <p className="flex items-center justify-center gap-2 font-bold">
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Awarding your desktop bonus...
                                    </p>
                                )}
                                {(rewardState === 'awarded' || rewardState === 'already-awarded') && (
                                    <p className="flex items-center justify-center gap-2 text-xl font-extrabold">
                                        <TreePine className="h-6 w-6" />
                                        {rewardState === 'already-awarded' ? 'Desktop bonus already claimed' : `${treesAwarded} bonus trees awarded`}
                                    </p>
                                )}
                                {rewardState === 'error' && (
                                    <div className="space-y-3">
                                        <p className="flex items-center justify-center gap-2 font-bold text-red-800">
                                            <AlertCircle className="h-5 w-5" />
                                            {rewardError}
                                        </p>
                                        <button
                                            onClick={claimDesktopReward}
                                            className="inline-flex items-center gap-2 border-2 border-black bg-white px-4 py-2 text-sm font-bold uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/"
                                className="mt-6 inline-flex items-center gap-2 border-2 border-black bg-black px-6 py-4 font-bold uppercase tracking-wider text-white shadow-[4px_4px_0px_0px_rgba(224,241,70,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(224,241,70,1)]"
                            >
                                Continue <ArrowRight className="h-5 w-5" />
                            </Link>
                        </div>
                    </section>
                ) : (
                    <>
                        <section className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-4 font-candu text-2xl font-extrabold uppercase">
                                Desktop Bonus Checklist
                            </h2>
                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="border-2 border-black bg-green-50 p-4">
                                    <CheckCircle2 className="mb-2 h-6 w-6 text-green-600" />
                                    <p className="font-bold">Account created</p>
                                    <p className="text-xs text-neutral-600">You&apos;re signed in.</p>
                                </div>
                                <div className={`border-2 border-black p-4 ${hasClickedDownload ? 'bg-green-50' : 'bg-white'}`}>
                                    {hasClickedDownload ? <CheckCircle2 className="mb-2 h-6 w-6 text-green-600" /> : <Download className="mb-2 h-6 w-6 text-brand-navy" />}
                                    <p className="font-bold">Download desktop</p>
                                    <p className="text-xs text-neutral-600">Get the app for this computer.</p>
                                </div>
                                <div className="border-2 border-black bg-white p-4">
                                    <Monitor className="mb-2 h-6 w-6 text-brand-navy" />
                                    <p className="font-bold">Log in and sync</p>
                                    <p className="text-xs text-neutral-600">We&apos;ll award 5 trees automatically.</p>
                                </div>
                            </div>
                        </section>

                        <section className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                            <h2 className="mb-4 flex items-center gap-2 font-candu text-2xl font-extrabold uppercase">
                                <Download className="h-6 w-6" />
                                Get the Desktop App
                            </h2>
                            <p className="mb-6 text-neutral-700">
                                The desktop app earns more impact because it can keep planting while your browser is closed.
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
                                className="flex items-center gap-4 border-2 border-black bg-brand-navy p-4 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            >
                                <div className="border-2 border-black bg-brand-yellow p-3 text-black">
                                    <Monitor className="h-7 w-7" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-lg font-bold">Download for {platformLabel}</p>
                                    <p className="text-sm text-gray-300">Log in after installing to claim 5 bonus trees</p>
                                </div>
                                <span className="border border-black bg-brand-yellow px-2 py-1 text-xs font-bold text-black">
                                    RECOMMENDED
                                </span>
                            </a>
                        </section>

                        <section className="border-2 border-blue-400 bg-blue-50 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="font-bold text-blue-800">
                                        Waiting for desktop sync...
                                    </p>
                                    <p className="mt-1 text-sm text-blue-700">
                                        Open IdleForest after installing and log in with this account. This page will update automatically.
                                    </p>
                                    {hasExtensionOnly && (
                                        <p className="mt-2 text-sm font-bold text-orange-700">
                                            We detected the browser extension. Install and log in to the desktop app to unlock the bonus trees.
                                        </p>
                                    )}
                                </div>
                                <button
                                    onClick={() => fetchNodeStatus()}
                                    disabled={isCheckingConnection || loadingStatus}
                                    className="inline-flex items-center justify-center gap-2 border-2 border-blue-400 bg-white px-4 py-3 text-sm font-bold uppercase transition-all hover:bg-blue-100 disabled:opacity-50"
                                >
                                    <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} />
                                    Check
                                </button>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </main>
    )
}
