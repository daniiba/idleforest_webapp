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
    Chrome,
    CheckCircle2,
    ArrowRight,
    Sparkles,
    Info,
    RefreshCw
} from 'lucide-react'

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
    nodeCount: number
    platforms: string[]
}

const supabase = createClient()

export default function TeamWelcomePage() {
    const [team, setTeam] = useState<TeamData | null>(null)
    const [memberCount, setMemberCount] = useState(0)
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isCheckingConnection, setIsCheckingConnection] = useState(false)
    const [detectedPlatform, setDetectedPlatform] = useState<'windows' | 'mac' | 'other'>('other')
    const params = useParams()
    const router = useRouter()

    useEffect(() => {
        // Detect user's platform
        const platformString = navigator.platform.toLowerCase()
        if (platformString.includes('win')) {
            setDetectedPlatform('windows')
        } else if (platformString.includes('mac')) {
            setDetectedPlatform('mac')
        }

        fetchData()
    }, [params.slug])

    // Poll for node status every 5 seconds when user doesn't have a node yet
    useEffect(() => {
        if (loading || nodeStatus?.hasNode) return

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
    }, [loading, nodeStatus?.hasNode])

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

    if (loading) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                    <p className="mt-4 text-neutral-600 font-bold">Loading...</p>
                </div>
            </main>
        )
    }

    if (!team) {
        return null
    }

    // If user already has nodes, redirect to team page
    if (nodeStatus?.hasNode) {
        return (
            <main className="flex items-center justify-center min-h-screen bg-brand-gray p-4 font-rethink-sans">
                <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 border-2 border-black mb-4">
                        <CheckCircle2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-extrabold font-candu uppercase mb-2">
                        You&apos;re All Set!
                    </h1>
                    <p className="text-neutral-600 mb-6">
                        You already have IdleForest installed. You&apos;re now part of{' '}
                        <span className="font-bold text-black">{team.name}</span> and earning points for the team!
                    </p>
                    <Link
                        href={`/teams/${team.slug}`}
                        className="inline-flex items-center gap-2 px-6 py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                    >
                        View Your Team <ArrowRight className="w-5 h-5" />
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-brand-gray p-4 py-16 font-rethink-sans">
            {/* Yellow background shape */}
            <Image
                src="/yellow-shape.svg"
                alt=""
                fill
                sizes="150vw"
                className="absolute -bottom-20 -left-10 object-cover pointer-events-none select-none opacity-100"
            />

            <div className="w-full max-w-2xl mx-auto relative z-10 space-y-6">
                {/* Welcome Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                        <Sparkles className="w-10 h-10 text-black" />
                    </div>
                    <h1 className="text-4xl font-extrabold font-candu uppercase mb-2">
                        Welcome to {team.name}!
                    </h1>
                    <p className="text-neutral-600 text-lg">
                        You&apos;re now part of the team. Let&apos;s start planting trees together!
                    </p>
                </div>

                {/* Team Stats Card */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {team.image_url ? (
                            <img
                                src={team.image_url}
                                alt={team.name}
                                className="w-16 h-16 object-cover border-2 border-black"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-brand-yellow border-2 border-black flex items-center justify-center">
                                <Users className="w-8 h-8 text-black" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold font-candu uppercase">{team.name}</h2>
                            <div className="flex gap-4 text-sm text-neutral-600">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" /> {memberCount} members
                                </span>
                                <span className="flex items-center gap-1">
                                    <TreePine className="w-4 h-4 text-green-600" /> {team.total_points.toLocaleString()} points
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-orange-100 border-2 border-orange-400 p-4">
                        <p className="font-bold text-orange-800 flex items-center gap-2">
                            <TreePine className="w-5 h-5" />
                            Your contribution: 0 points
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            Install IdleForest to start earning points and help your team plant more trees!
                        </p>
                    </div>
                </div>

                {/* Install Options */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-xl font-bold font-candu uppercase mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" /> Get IdleForest
                    </h3>
                    <p className="text-neutral-600 mb-6">
                        Choose how you want to plant trees. The desktop app earns more points, but the extension is lightweight and easy to install.
                    </p>

                    <div className="space-y-4">
                        {/* Desktop App - Primary for Windows/Mac */}
                        {(detectedPlatform === 'windows' || detectedPlatform === 'mac') && (
                            <Link
                                href={detectedPlatform === 'windows'
                                    ? 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe'
                                    : 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip'
                                }
                                target="_blank"
                                className="flex items-center gap-4 p-4 bg-brand-navy text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                                <div className="bg-brand-yellow text-black p-3 border-2 border-black">
                                    <Monitor className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-lg">Desktop App</p>
                                    <p className="text-sm text-gray-300">
                                        {detectedPlatform === 'windows' ? 'For Windows' : 'For Mac'} • Earns more points
                                    </p>
                                </div>
                                <span className="bg-brand-yellow text-black px-2 py-1 text-xs font-bold border border-black">
                                    RECOMMENDED
                                </span>
                            </Link>
                        )}

                        {/* Browser Extension */}
                        <Link
                            href="https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"
                            target="_blank"
                            className="flex items-center gap-4 p-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <div className="bg-neutral-100 p-3 border-2 border-black">
                                <Chrome className="w-6 h-6 text-neutral-700" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg">Browser Extension</p>
                                <p className="text-sm text-neutral-600">
                                    Chrome & Edge • Lightweight
                                </p>
                            </div>
                            {detectedPlatform === 'other' && (
                                <span className="bg-brand-yellow text-black px-2 py-1 text-xs font-bold border border-black">
                                    RECOMMENDED
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Connection Status Info */}
                <div className="bg-blue-50 border-2 border-blue-400 p-5">
                    <div className="flex items-start gap-3 mb-3">
                        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-bold text-blue-800">
                                Important: Log in after installing
                            </p>
                            <p className="text-sm text-blue-700 mt-1">
                                After installing, open the app or extension and <strong>log in with your account</strong>.
                                We'll automatically detect when you're connected.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-blue-300">
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            Waiting for connection...
                        </div>
                        <button
                            onClick={refetchNodeStatus}
                            disabled={isCheckingConnection}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-bold bg-white border-2 border-blue-400 hover:bg-blue-100 disabled:opacity-50 transition-all"
                        >
                            <RefreshCw className={`w-4 h-4 ${isCheckingConnection ? 'animate-spin' : ''}`} />
                            Check Connection
                        </button>
                    </div>
                </div>

                {/* Skip Link */}
                <div className="text-center">
                    <Link
                        href={`/teams/${team.slug}`}
                        className="text-sm font-bold text-neutral-500 underline decoration-1 hover:text-black hover:decoration-brand-yellow hover:decoration-2 transition-all"
                    >
                        Skip for now → View team page
                    </Link>
                </div>
            </div>
        </main>
    )
}
