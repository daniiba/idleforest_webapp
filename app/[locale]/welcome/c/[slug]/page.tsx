'use client'

import { useEffect, useRef, useState } from 'react'
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
    Sparkles,
    Info,
    RefreshCw
} from 'lucide-react'
import { trackOnboardingEvent } from '@/lib/onboarding-events'
import CompanyMemberPanel from '@/components/partner/CompanyMemberPanel'
import Navigation from '@/components/navigation'
import {
    isMossyEarthCompanySlug,
    isPlanetwildCompanySlug,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'

interface CompanyData {
    id: string
    name: string
    description: string | null
    logo_url: string | null
    slug: string
    impact_mode: 'idleforest_planting' | 'company_named_donation' | 'partner_payout'
    payout_recipient_name: string | null
}

interface NodeStatus {
    hasNode: boolean
    hasDesktopNode: boolean
    nodeCount: number
    desktopNodeCount: number
    platforms: string[]
}

const supabase = createClient()

function getCompanyImpactLabel(company: CompanyData) {
    if (isWastefreeCompanySlug(company.slug)) return 'Clean-ocean fund'
    if (isPlanetwildCompanySlug(company.slug) || isMossyEarthCompanySlug(company.slug)) return 'Rewilding fund'
    if (company.impact_mode === 'partner_payout') return 'Partner payout'
    if (company.impact_mode === 'company_named_donation') return 'Named fund'

    return 'Company forest'
}

function getCompanyImpactDescription(company: CompanyData) {
    if (isWastefreeCompanySlug(company.slug)) {
        return 'Your future IdleForest activity supports the Waste Free Planet cleanup fund through 1ClickImpact and Plastic Bank.'
    }

    if (isPlanetwildCompanySlug(company.slug)) {
        return "Your future IdleForest activity supports this Planet Wild rewilding fund. It does not replace Planet Wild's own membership."
    }

    if (isMossyEarthCompanySlug(company.slug)) {
        return "Your future IdleForest activity supports this Mossy Earth rewilding fund. It does not replace Mossy Earth's own membership."
    }

    if (company.impact_mode === 'partner_payout' && company.payout_recipient_name) {
        return `Your future IdleForest activity is routed toward ${company.payout_recipient_name}.`
    }

    return `Your future IdleForest activity counts toward ${company.name}.`
}

function getCompanyLogoUrl(company: CompanyData) {
    if (company.logo_url) return company.logo_url
    if (isWastefreeCompanySlug(company.slug)) return '/partner/wastefree/wfp-logo-white.webp'

    return null
}

export default function CompanyWelcomePage() {
    const [company, setCompany] = useState<CompanyData | null>(null)
    const [memberCount, setMemberCount] = useState(0)
    const [totalPoints, setTotalPoints] = useState(0)
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isCheckingConnection, setIsCheckingConnection] = useState(false)
    const [detectedPlatform, setDetectedPlatform] = useState<'windows' | 'mac' | 'other'>('other')
    const [hasClickedDownload, setHasClickedDownload] = useState(false)
    const hasTrackedDesktopConnection = useRef(false)
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
        if (!nodeStatus?.hasDesktopNode || hasTrackedDesktopConnection.current) return

        hasTrackedDesktopConnection.current = true
        trackOnboardingEvent('desktop_node_connected', {
            source: 'company_welcome',
            metadata: { companySlug: params.slug, platforms: nodeStatus.platforms }
        })
    }, [nodeStatus?.hasDesktopNode, nodeStatus?.platforms, params.slug])

    const fetchData = async () => {
        try {
            // Fetch company data
            const { data: companyData, error: companyError } = await supabase
                .from('companies')
                .select('id, name, description, logo_url, slug, impact_mode, payout_recipient_name')
                .eq('slug', params.slug)
                .single()

            if (companyError || !companyData) {
                router.push('/')
                return
            }

            setCompany(companyData)

            const statsResponse = await fetch(`/api/companies/${companyData.slug}/stats`)
            if (statsResponse.ok) {
                const companyStats = await statsResponse.json()
                setMemberCount(companyStats.memberCount || 0)
                setTotalPoints(companyStats.generatedPoints || 0)
            }

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
            <>
                <Navigation />
                <main className="flex min-h-screen items-center justify-center bg-brand-gray p-4 font-rethink-sans">
                    <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-black" />
                        <p className="mt-4 text-neutral-600 font-bold">Loading...</p>
                    </div>
                </main>
            </>
        )
    }

    if (!company) {
        return null
    }

    // If user already has the desktop app connected, show completion state.
    if (nodeStatus?.hasDesktopNode) {
        return (
            <>
                <Navigation />
                <main className="flex min-h-screen items-center justify-center bg-brand-gray p-4 font-rethink-sans">
                    <div className="w-full max-w-lg bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 border-2 border-black mb-4">
                            <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-extrabold font-candu uppercase mb-2">
                            You&apos;re All Set!
                        </h1>
                        <p className="text-neutral-600 mb-6">
                            You have the IdleForest desktop app connected. Your future activity is linked to{' '}
                            <span className="font-bold text-black">{company.name}</span>.
                        </p>
                        <CompanyMemberPanel
                            companyName={company.name}
                            portalHref={`/portal/c/${company.slug}`}
                            logoUrl={getCompanyLogoUrl(company)}
                            impactLabel={getCompanyImpactLabel(company)}
                            portalLabel="Open member portal"
                            description={getCompanyImpactDescription(company)}
                            leaveRedirectHref="/welcome"
                            className="mb-6 text-left"
                        />
                        <div className="mb-6 border-2 border-black bg-brand-yellow p-4 font-bold">
                            Desktop connected. Your idle activity now counts toward {company.name}.
                        </div>
                        <Link
                            href={`/portal/c/${company.slug}`}
                            className="inline-flex items-center gap-2 px-6 py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            View Member Portal <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </main>
            </>
        )
    }

    return (
        <>
            <Navigation />
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
                        Welcome to {company.name}!
                    </h1>
                    <p className="text-neutral-600 text-lg">
                        You&apos;re connected to this IdleForest impact route. Install the desktop app to start contributing.
                    </p>
                </div>

                <CompanyMemberPanel
                    companyName={company.name}
                    portalHref={`/portal/c/${company.slug}`}
                    logoUrl={getCompanyLogoUrl(company)}
                    impactLabel={getCompanyImpactLabel(company)}
                    portalLabel="Open member portal"
                    description={getCompanyImpactDescription(company)}
                    leaveRedirectHref="/welcome"
                />

                {/* Company Stats Card */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-4 mb-4">
                        {company.logo_url ? (
                            <img
                                src={company.logo_url}
                                alt={company.name}
                                className="w-16 h-16 object-cover border-2 border-black"
                            />
                        ) : (
                            <div className="w-16 h-16 bg-brand-yellow border-2 border-black flex items-center justify-center">
                                <Users className="w-8 h-8 text-black" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl font-bold font-candu uppercase">{company.name}</h2>
                            <div className="flex gap-4 text-sm text-neutral-600">
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" /> {memberCount} joined
                                </span>
                                <span className="flex items-center gap-1">
                                    <TreePine className="w-4 h-4 text-green-600" /> {totalPoints.toLocaleString()} tasks
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Progress Indicator */}
                    <div className="bg-orange-100 border-2 border-orange-400 p-4">
                        <p className="font-bold text-orange-800 flex items-center gap-2">
                            <TreePine className="w-5 h-5" />
                            Your contribution: 0 tasks handled
                        </p>
                        <p className="text-sm text-orange-700 mt-1">
                            Install IdleForest to start handling tasks and help your company fund more impact!
                        </p>
                    </div>
                </div>

                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-xl font-bold font-candu uppercase mb-4">Company Setup Checklist</h3>
                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="border-2 border-black bg-green-50 p-4">
                            <CheckCircle2 className="mb-2 h-6 w-6 text-green-600" />
                            <p className="font-bold">Joined company</p>
                            <p className="text-xs text-neutral-600">You&apos;re in {company.name}.</p>
                        </div>
                        <div className={`border-2 border-black p-4 ${hasClickedDownload ? 'bg-green-50' : 'bg-white'}`}>
                            {hasClickedDownload ? <CheckCircle2 className="mb-2 h-6 w-6 text-green-600" /> : <Download className="mb-2 h-6 w-6 text-brand-navy" />}
                            <p className="font-bold">Download desktop</p>
                            <p className="text-xs text-neutral-600">Install the app on this computer.</p>
                        </div>
                        <div className="border-2 border-black bg-white p-4">
                            <Monitor className="mb-2 h-6 w-6 text-brand-navy" />
                            <p className="font-bold">Log in and sync</p>
                            <p className="text-xs text-neutral-600">Your future idle activity counts for {company.name}.</p>
                        </div>
                    </div>
                </div>

                {/* Install Options */}
                <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="text-xl font-bold font-candu uppercase mb-4 flex items-center gap-2">
                        <Download className="w-5 h-5" /> Get IdleForest
                    </h3>
                    <p className="text-neutral-600 mb-6">
                        Install the desktop app first. It starts counting idle activity for {company.name} after sync.
                    </p>

                    <div className="space-y-4">
                        <Link
                            href={detectedPlatform === 'mac'
                                ? 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip'
                                : detectedPlatform === 'windows'
                                    ? 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe'
                                    : '/downloads#desktop-apps'
                            }
                            target="_blank"
                            onClick={() => {
                                setHasClickedDownload(true)
                                trackOnboardingEvent('desktop_download_clicked', {
                                    source: 'company_welcome',
                                    metadata: { companySlug: params.slug, platform: detectedPlatform }
                                })
                            }}
                            className="flex items-center gap-4 p-4 bg-brand-navy text-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                            <div className="bg-brand-yellow text-black p-3 border-2 border-black">
                                <Monitor className="w-6 h-6" />
                            </div>
                            <div className="flex-1">
                                <p className="font-bold text-lg">Desktop App</p>
                                <p className="text-sm text-gray-300">
                                    {detectedPlatform === 'windows' ? 'For Windows' : detectedPlatform === 'mac' ? 'For Mac' : 'Windows or Mac'} • Starts company impact
                                </p>
                            </div>
                            <span className="bg-brand-yellow text-black px-2 py-1 text-xs font-bold border border-black">
                                RECOMMENDED
                            </span>
                        </Link>
                        <p className="text-center text-xs text-neutral-500">
                            Need the browser extension too? Add it later from the downloads page after desktop is connected.
                        </p>
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
                                After installing, open the desktop app and <strong>log in with your account</strong>.
                                We'll automatically detect when your desktop app is connected.
                            </p>
                            {nodeStatus?.hasNode && !nodeStatus.hasDesktopNode && (
                                <p className="text-sm font-bold text-orange-700 mt-2">
                                    We detected the browser extension. Connect the desktop app to start company impact.
                                </p>
                            )}
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
                        href={`/portal/c/${company.slug}`}
                        className="text-sm font-bold text-neutral-500 underline decoration-1 hover:text-black hover:decoration-brand-yellow hover:decoration-2 transition-all"
                    >
                        Skip for now → Go to member portal
                    </Link>
                </div>
                </div>
            </main>
        </>
    )
}
