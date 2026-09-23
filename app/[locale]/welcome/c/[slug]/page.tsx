'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import DesktopSetupEmail from '@/components/partner/DesktopSetupEmail'
import { detectDesktopPlatform, companySetupPath, type DesktopPlatform } from '@/lib/desktop-setup'
import { createClient } from '@/lib/supabase/client'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
    Loader2,
    Download,
    Monitor,
    CheckCircle2,
    ArrowRight,
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
    const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null)
    const [loading, setLoading] = useState(true)
    const [isCheckingConnection, setIsCheckingConnection] = useState(false)
    const [detectedPlatform, setDetectedPlatform] = useState<DesktopPlatform>('other')
    const [hasClickedDownload, setHasClickedDownload] = useState(false)
    const hasTrackedDesktopConnection = useRef(false)
    const params = useParams()
    const router = useRouter()

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.replace(`/auth/user/login?redirect=${encodeURIComponent(companySetupPath(String(params.slug), String(params.locale)))}`)
                return
            }
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
    }, [params.slug, params.locale, router])

    useEffect(() => {
        setDetectedPlatform(detectDesktopPlatform(navigator))

        fetchData()
    }, [fetchData])

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
                    <div className="w-full max-w-lg bg-white border-2 border-black shadow-none p-8 text-center">
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
                    <div className="w-full max-w-lg bg-white border-2 border-black shadow-none p-8 text-center">
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
                            className="inline-flex items-center gap-2 px-6 py-4 text-lg font-bold uppercase tracking-wider bg-brand-yellow border-2 border-black shadow-none hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all"
                        >
                            View Member Portal <ArrowRight className="w-5 h-5" />
                        </Link>
                    </div>
                </main>
            </>
        )
    }

    const isMobile = detectedPlatform === 'mobile'
    const isWastefree = isWastefreeCompanySlug(company.slug)
    const downloadHref = detectedPlatform === 'mac'
        ? 'https://idleforest-updates.s3.us-east-1.amazonaws.com/updates/darwin/arm64/IdleForest-darwin-arm64-1.0.7.zip'
        : detectedPlatform === 'windows'
            ? 'https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe'
            : detectedPlatform === 'linux' ? '/download/linux/installer' : '/downloads#desktop-apps'
    const platformLabel = detectedPlatform === 'mac' ? 'Mac' : detectedPlatform === 'windows' ? 'Windows' : detectedPlatform === 'linux' ? 'Linux' : 'your computer'

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-brand-gray px-4 py-10 font-rethink-sans">
                <div className="mx-auto w-full max-w-2xl space-y-6">
                    <header>
                        <p className="mb-3 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="h-5 w-5 text-green-700" /> Joined {company.name}</p>
                        <h1 className="font-candu text-3xl font-extrabold uppercase sm:text-4xl">
                            {isMobile ? 'Finish setup on your computer' : isWastefree ? 'Connect your computer to help fund cleanup' : 'Connect your computer to start contributing'}
                        </h1>
                        <p className="mt-3 text-neutral-700">{isWastefree
                            ? 'Your account is ready. Connect the desktop app to help fund ocean-bound plastic removal with Waste Free Planet.'
                            : `Your account is ready. Connect the desktop app so your future activity supports ${company.name}.`}</p>
                    </header>

                    <section className="border-2 border-black bg-white p-5 sm:p-7" aria-label="Computer setup">
                        {isMobile ? (
                            <>
                                <h2 className="mb-3 flex items-center gap-2 text-xl font-bold"><Monitor className="h-5 w-5" /> Keep your place</h2>
                                <p className="mb-5 text-neutral-700">IdleForest runs on Windows, Mac, and Linux computers. Email yourself the setup link, then open it on your computer when you’re ready.</p>
                                <DesktopSetupEmail companySlug={company.slug} locale={String(params.locale)} />
                            </>
                        ) : (
                            <>
                                <h2 className="mb-4 text-xl font-bold">1. Download and install IdleForest</h2>
                                <a href={downloadHref} onClick={() => {
                                    setHasClickedDownload(true)
                                    trackOnboardingEvent('desktop_download_clicked', { source: 'company_welcome', metadata: { companySlug: company.slug, platform: detectedPlatform } })
                                }} className="flex items-center justify-center gap-3 border-2 border-black bg-brand-navy px-5 py-4 text-center text-lg font-bold text-white hover:bg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">
                                    <Download className="h-6 w-6 shrink-0" /> Download for {platformLabel}
                                </a>
                                <p className="mt-3 text-sm text-neutral-600">Free to install. Share unused bandwidth while it runs. You can pause anytime.</p>
                                <a href="/downloads#desktop-apps" className="mt-2 inline-block text-sm font-bold underline">Choose another operating system</a>
                                <div className="mt-6 border-t border-neutral-300 pt-5">
                                    <h2 className="text-xl font-bold">2. Open the app and log in</h2>
                                    <p className="mt-2 text-neutral-700">Use the same account you just joined with. We’ll detect your desktop once it connects.</p>
                                    {hasClickedDownload && <p role="status" className="mt-2 text-sm font-bold">Download requested. Open the installer from your downloads folder, then log in inside IdleForest.</p>}
                                    {nodeStatus?.hasNode && <p className="mt-3 text-sm font-bold">Your browser extension is linked. Connect the desktop app to finish this setup.</p>}
                                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                                        <p className="text-sm text-neutral-600">Waiting for your desktop to connect…</p>
                                        <button type="button" onClick={refetchNodeStatus} disabled={isCheckingConnection}
                                            className="inline-flex items-center gap-2 border-2 border-black px-3 py-2 text-sm font-bold hover:bg-brand-yellow disabled:opacity-50">
                                            <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} /> Check connection
                                        </button>
                                    </div>
                                </div>
                                <details className="mt-6 border-t border-neutral-300 pt-4">
                                    <summary className="cursor-pointer font-bold">Finish on another computer</summary>
                                    <div className="mt-4"><DesktopSetupEmail companySlug={company.slug} locale={String(params.locale)} /></div>
                                </details>
                            </>
                        )}
                    </section>
                    <p className="text-sm text-neutral-600">{getCompanyImpactDescription(company)}</p>
                    <p className="text-center text-sm"><Link href={`/portal/c/${company.slug}`} className="font-bold text-neutral-600 underline">Finish later — open member portal</Link></p>
                </div>
            </main>
        </>
    )
}
