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
import ForestImpactPanel from '@/components/forest/ForestImpactPanel'
import {
    isMossyEarthCompanySlug,
    isPlanetwildCompanySlug,
    isWastefreeCompanySlug,
} from '@/lib/company-partners'
import { WindowsLogo, AppleLogo, LinuxLogo, OsLogo } from "@/components/icons/os-logos";

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

    const shell = (children: React.ReactNode) => (
        <>
            <Navigation />
            <main className="min-h-screen bg-[#F7F7F2] px-4 py-10 text-brand-navy sm:py-14">
                <div className="mx-auto flex w-full max-w-xl flex-col gap-6">{children}</div>
            </main>
        </>
    )

    if (loading) {
        return shell(
            <section className="rounded-3xl border border-neutral-200 bg-white p-8 text-center text-neutral-600 shadow-sm">
                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                <p className="mt-3 text-sm font-semibold">Loading...</p>
            </section>
        )
    }

    if (!company) {
        return null
    }

    // Desktop already connected: show completion state.
    if (nodeStatus?.hasDesktopNode) {
        return shell(
            <>
                <section className="rounded-3xl border border-neutral-200 bg-white p-6 text-center shadow-sm sm:p-8">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
                        <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
                    </div>
                    <h1 className="text-2xl font-extrabold">You&apos;re all set!</h1>
                    <p className="mt-2 text-sm text-neutral-600">
                        Your desktop app is connected. Your idle activity now counts toward <span className="font-bold text-brand-navy">{company.name}</span>.
                    </p>
                    <CompanyMemberPanel
                        companyName={company.name}
                        portalHref={`/portal/c/${company.slug}`}
                        logoUrl={getCompanyLogoUrl(company)}
                        impactLabel={getCompanyImpactLabel(company)}
                        portalLabel="Open member portal"
                        description={getCompanyImpactDescription(company)}
                        leaveRedirectHref="/welcome"
                        className="mt-6 text-left"
                    />
                    <Link
                        href={`/portal/c/${company.slug}`}
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-navy px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-black"
                    >
                        View member portal <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                </section>
                <ForestImpactPanel mode="self" />
            </>
        )
    }

    const isMobile = detectedPlatform === 'mobile'
    const isWastefree = isWastefreeCompanySlug(company.slug)
    const downloadHref = detectedPlatform === 'mac'
        ? '/download/mac/installer'
        : detectedPlatform === 'windows'
            ? '/download/windows/installer'
            : detectedPlatform === 'linux' ? '/download/linux/installer' : '/downloads#desktop-apps'
    const platformLabel = detectedPlatform === 'mac' ? 'Mac' : detectedPlatform === 'windows' ? 'Windows' : detectedPlatform === 'linux' ? 'Linux' : 'your computer'
    const logoUrl = getCompanyLogoUrl(company)
    const steps = ['Join', 'Download', 'Log in & sync']
    const currentStep = hasClickedDownload ? 3 : 2

    return shell(
        <>
            <header className="text-center">
                <p className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-bold shadow-sm ring-1 ring-neutral-200">
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="" className="h-4 w-4 rounded-full object-cover" />
                    ) : (
                        <CheckCircle2 className="h-4 w-4 text-green-600" aria-hidden="true" />
                    )}
                    Joined {company.name}
                </p>
                <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                    {isMobile ? 'Finish setup on your computer' : isWastefree ? 'Connect your computer to help fund cleanup' : 'Connect your computer to start contributing'}
                </h1>
                <p className="mx-auto mt-3 max-w-md text-base text-neutral-600">
                    {isWastefree
                        ? 'Your account is ready. Connect the desktop app to help fund ocean-bound plastic removal with Waste Free Planet.'
                        : `Your account is ready. Connect the desktop app so your future activity supports ${company.name}.`}
                </p>
            </header>

            {!isMobile && (
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
            )}

            <section className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8" aria-label="Computer setup">
                {isMobile ? (
                    <>
                        <h2 className="flex items-center gap-2 text-xl font-extrabold"><Monitor className="h-5 w-5" aria-hidden="true" /> Keep your place</h2>
                        <p className="mb-5 mt-2 text-sm text-neutral-600">IdleForest runs on Windows, Mac, and Linux computers. Email yourself the setup link, then open it on your computer when you&apos;re ready.</p>
                        <DesktopSetupEmail companySlug={company.slug} locale={String(params.locale)} />
                    </>
                ) : (
                    <>
                        <h2 className="text-xl font-extrabold">Download and install IdleForest</h2>
                        <a
                            href={downloadHref}
                            onClick={() => {
                                setHasClickedDownload(true)
                                trackOnboardingEvent('desktop_download_clicked', { source: 'company_welcome', metadata: { companySlug: company.slug, platform: detectedPlatform } })
                            }}
                            className="mt-5 flex items-center gap-4 rounded-2xl bg-brand-navy p-4 text-white transition-colors hover:bg-black"
                        >
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-yellow text-brand-navy">
                                <OsLogo os={detectedPlatform === 'mac' ? 'mac' : detectedPlatform === 'linux' ? 'linux' : 'windows'} className="h-6 w-6" />
                            </span>
                            <span className="flex-1">
                                <span className="block text-base font-bold">Download for {platformLabel}</span>
                                <span className="block text-sm text-neutral-300">Free. Shares unused bandwidth. Pause anytime.</span>
                            </span>
                            <Download className="h-5 w-5 shrink-0 text-brand-yellow" aria-hidden="true" />
                        </a>
                        <a href="/downloads#desktop-apps" className="mt-3 inline-block text-sm font-semibold text-neutral-600 underline">Choose another operating system</a>

                        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl bg-neutral-50 p-4">
                            <div className="text-sm">
                                <p className="flex items-center gap-2 font-bold">
                                    <span className="relative flex h-2 w-2">
                                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                                        <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                                    </span>
                                    Waiting for your desktop
                                </p>
                                <p className="mt-1 text-neutral-600">Open the app and log in with the account you just joined with.</p>
                                {hasClickedDownload && <p role="status" className="mt-2 font-semibold">Download requested. Open the installer, then log in inside IdleForest.</p>}
                                {nodeStatus?.hasNode && <p className="mt-2 font-semibold text-orange-700">Your browser extension is linked. Connect the desktop app to finish.</p>}
                            </div>
                            <button
                                type="button"
                                onClick={refetchNodeStatus}
                                disabled={isCheckingConnection}
                                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-bold transition-colors hover:bg-neutral-100 disabled:opacity-50"
                            >
                                <RefreshCw className={`h-4 w-4 ${isCheckingConnection ? 'animate-spin' : ''}`} aria-hidden="true" />
                                Check
                            </button>
                        </div>

                        <details className="mt-6 border-t border-neutral-200 pt-4">
                            <summary className="cursor-pointer text-sm font-bold">Finish on another computer</summary>
                            <div className="mt-4"><DesktopSetupEmail companySlug={company.slug} locale={String(params.locale)} /></div>
                        </details>
                    </>
                )}
            </section>

            <ForestImpactPanel mode="self" />

            <p className="text-center text-sm text-neutral-600">{getCompanyImpactDescription(company)}</p>
            <p className="text-center text-sm"><Link href={`/portal/c/${company.slug}`} className="font-semibold text-neutral-500 underline hover:text-brand-navy">Finish later: open member portal</Link></p>
        </>
    )
}
