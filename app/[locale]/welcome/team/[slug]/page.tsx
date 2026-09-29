'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
    Loader2,
    Users,
    TreePine,
    Download,
    Monitor,
    CheckCircle2,
    ArrowRight,
    RefreshCw
} from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/onboarding-events'
import TeamForestPanel from '@/components/forest/TeamForestPanel'
import { WindowsLogo, AppleLogo, LinuxLogo, OsLogo } from "@/components/icons/os-logos";

interface TeamData {
    id: string
    name: string
    total_points: number
    description: string | null
    image_url: string | null
    slug: string
}

interface NodeStatus {
    hasNode: boolean
    hasDesktopNode: boolean
    nodeCount: number
    desktopNodeCount: number
    platforms: string[]
}

const supabase = createClient()

export default function TeamWelcomePage() {
    const [team, setTeam] = useState<TeamData | null>(null)
    const [memberCount, setMemberCount] = useState(0)
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isCheckingConnection, setIsCheckingConnection] = useState(false)
    const [detectedPlatform, setDetectedPlatform] = useState<'windows' | 'mac' | 'linux' | 'other'>('other')
    const [rewardMessage, setRewardMessage] = useState<string | null>(null)
    const [isClaimingReward, setIsClaimingReward] = useState(false)
    const [hasClickedDownload, setHasClickedDownload] = useState(false)
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        // Detect user's platform
        const platformString = navigator.platform.toLowerCase()
        if (platformString.includes('win')) {
            setDetectedPlatform('windows')
        } else if (platformString.includes('mac')) {
            setDetectedPlatform('mac')
        } else if (platformString.includes('linux')) {
            setDetectedPlatform('linux')
        }

        fetchData()
    }, [params.slug])

    // Poll for node status every 5 seconds when user doesn't have the desktop app connected yet
    useEffect(() => {
        if (loading || nodeStatus?.hasDesktopNode) return

        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch('/api/user/node-status')
                if (response.ok) {
                    const status = await response.json()
                    setNodeStatus(status)
                }
            } catch (error) {
                console.error('Polling error:', error)
            }
        }, 5000)

        return () => clearInterval(pollInterval)
    }, [loading, nodeStatus?.hasDesktopNode])

    useEffect(() => {
        if (!nodeStatus?.hasDesktopNode || rewardMessage || isClaimingReward) return

        trackOnboardingEvent('desktop_node_connected', {
            source: 'team_welcome',
            metadata: { teamSlug: params.slug, platforms: nodeStatus.platforms }
        })
        claimDesktopReward()
    }, [nodeStatus?.hasDesktopNode, rewardMessage, isClaimingReward])

    const fetchData = async () => {
        try {
            // Fetch team data
            const { data: teamData, error: teamError } = await supabase
                .from('teams')
                .select('id, name, total_points, description, image_url, slug')
                .eq('slug', params.slug)
                .single()

            if (teamError || !teamData) {
                router.push('/teams')
                return
            }

            setTeam(teamData)

            // Fetch member count
            const { count } = await supabase
                .from('team_members')
                .select('*', { count: 'exact', head: true })
                .eq('team_id', teamData.id)

            setMemberCount(count || 0)

            // Fetch node status
            const response = await fetch('/api/user/node-status')
            if (response.ok) {
                const status = await response.json()
                setNodeStatus(status)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    // Manual refetch for connection status
    const refetchNodeStatus = async () => {
        setIsCheckingConnection(true)
        try {
            const response = await fetch('/api/user/node-status')
            if (response.ok) {
                const status = await response.json()
                setNodeStatus(status)
            }
        } catch (error) {
            console.error('Error checking connection:', error)
        } finally {
            setIsCheckingConnection(false)
        }
    }

    const claimDesktopReward = async () => {
        setIsClaimingReward(true)
        try {
            const response = await fetch('/api/rewards/desktop-install', { method: 'POST' })
            const data = await response.json()

            if (response.ok) {
                if (!data.alreadyAwarded) {
                    trackOnboardingEvent('desktop_reward_awarded', {
                        source: 'team_welcome',
                        metadata: { teamSlug: params.slug, trees: data.trees || 5 }
                    })
                }
                setRewardMessage(data.alreadyAwarded
                    ? 'Desktop bonus already claimed.'
                    : `${data.trees || 5} desktop bonus trees awarded!`
                )
            } else if (response.status === 202) {
                setRewardMessage('Desktop bonus is being processed.')
            } else {
                setRewardMessage(data.error || 'Desktop connected. Bonus trees will be awarded soon.')
            }
        } catch (error) {
            console.error('Reward claim error:', error)
            setRewardMessage('Desktop connected. Bonus trees will be awarded soon.')
        } finally {
            setIsClaimingReward(false)
        }
    }

    const shell = (children: React.ReactNode) => (
        <main className="min-h-screen bg-[#F7F7F2] px-4 py-10 text-brand-navy sm:py-16">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
                <Link href="/" className="mx-auto">
                    <Image src="/logo.png" alt="IdleForest" width={121} height={33} priority className="h-auto w-[121px]" />
                </Link>
                {children}
            </div>
        </main>
    )

    if (loading) {
        return shell(
            <section className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 shadow-sm">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-3 text-sm font-semibold">Loading...</p>
            </section>
        )
    }

    if (!team) {
        return null
    }

    const teamHeader = (
        <div className="flex items-center gap-4">
            {team.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={team.image_url} alt="" className="h-14 w-14 rounded-2xl object-cover" />
            ) : (
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-yellow text-brand-navy">
                    <Users className="h-7 w-7" aria-hidden="true" />
                </span>
            )}
            <div className="min-w-0">
                <h2 className="truncate text-lg font-extrabold">{team.name}</h2>
                <p className="flex flex-wrap gap-x-4 text-sm text-neutral-600">
                    <span className="flex items-center gap-1"><Users className="h-4 w-4" aria-hidden="true" /> {memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
                    <span className="flex items-center gap-1"><TreePine className="h-4 w-4 text-green-600" aria-hidden="true" /> {team.total_points.toLocaleString()} points</span>
                </p>
            </div>
        </div>
    )

    // Desktop already connected: show completion and reward state.
    if (nodeStatus?.hasDesktopNode) {
        return shell(
            <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-extrabold">You&apos;re all set!</h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Your desktop app is connected. You&apos;re part of <span className="font-bold text-brand-navy">{team.name}</span> and earning points for the team.
                    </p>
                    <div className="mt-6 rounded-2xl bg-brand-yellow/60 p-4 text-sm font-bold" aria-live="polite">
                        {isClaimingReward ? 'Awarding your desktop bonus trees...' : rewardMessage || 'Checking desktop bonus...'}
                    </div>
                    <Link
                        href={`/teams/${team.slug}`}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
                    >
                        View your team <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </section>
                <TeamForestPanel teamSlug={team.slug} teamName={team.name} />
            </>
        )
    }

    const platformLabel = detectedPlatform === 'windows' ? 'Windows' : detectedPlatform === 'mac' ? 'Mac' : detectedPlatform === 'linux' ? 'Linux' : 'your computer'
    const downloadHref = detectedPlatform === 'mac'
        ? '/download/mac/installer'
        : detectedPlatform === 'windows'
            ? '/download/windows/installer'
            : detectedPlatform === 'linux'
                ? '/download/linux/installer'
                : '/downloads#desktop-apps'
    const steps = ['Join team', 'Download', 'Log in & sync']
    const currentStep = hasClickedDownload ? 3 : 2

    return shell(
        <>
            <header className="text-center">
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">Welcome to {team.name}</h1>
                <p className="mx-auto mt-3 max-w-md text-base text-neutral-600">
                    Install the desktop app and log in to start planting trees with your team. You&apos;ll get 5 bonus trees once it syncs.
                </p>
            </header>

            <ol className="flex items-center justify-center gap-2 text-xs font-semibold sm:text-sm" aria-label="Progress">
                {steps.map((label, index) => {
                    const step = index + 1
                    const done = step < currentStep
                    const active = step === currentStep
                    return (
                        <li key={label} className="flex items-center gap-2">
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                done ? 'bg-brand-navy text-brand-yellow' : active ? 'bg-brand-yellow text-brand-navy ring-2 ring-brand-navy' : 'bg-neutral-200 text-neutral-500'
                            }`}>
                                {done ? <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> : step}
                            </span>
                            <span className={active || done ? 'text-brand-navy' : 'text-neutral-500'}>{label}</span>
                            {step < steps.length && <span className="mx-1 h-px w-6 bg-neutral-300 sm:w-10" aria-hidden="true" />}
                        </li>
                    )
                })}
            </ol>

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
                {teamHeader}

                <Link
                    href={downloadHref}
                    target="_blank"
                    onClick={() => {
                        setHasClickedDownload(true)
                        trackOnboardingEvent('desktop_download_clicked', {
                            source: 'team_welcome',
                            metadata: { teamSlug: params.slug, platform: detectedPlatform }
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
                </Link>

                <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 p-4">
                    <div className="text-sm">
                        <p className="flex items-center gap-2 font-bold">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                            </span>
                            Waiting for desktop sync
                        </p>
                        <p className="mt-1 text-neutral-600">Open the app and log in with your account. This page updates automatically.</p>
                        {nodeStatus?.hasNode && !nodeStatus.hasDesktopNode && (
                            <p className="mt-2 font-semibold text-orange-700">We found the browser extension. Log in to the desktop app to unlock the bonus.</p>
                        )}
                    </div>
                    <button
                        onClick={refetchNodeStatus}
                        disabled={isCheckingConnection}
                        className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-neutral-100 disabled:opacity-50"
                    >
                        <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} aria-hidden="true" />
                        Check
                    </button>
                </div>
            </section>

            <TeamForestPanel teamSlug={team.slug} teamName={team.name} />

            <p className="text-center">
                <Link href={`/teams/${team.slug}`} className="text-sm font-semibold text-neutral-500 underline hover:text-brand-navy">
                    Skip for now: view team page
                </Link>
            </p>
        </>
    )
}
