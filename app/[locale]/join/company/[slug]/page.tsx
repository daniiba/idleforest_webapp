'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowRight, BadgeCheck, Loader2, Lock, ShieldCheck } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'
import { getCanonicalCompanySlug, isMossyEarthCompanySlug, isPlanetwildCompanySlug, isWastefreeCompanySlug } from '@/lib/company-partners'

type CompanyInfo = {
    name: string
    slug: string
    logo_url?: string | null
}

type JoinResponse = {
    success?: boolean
    error?: string
    requiresConfirmation?: boolean
    currentCompany?: { id?: string; name?: string; slug?: string }
    targetCompany?: { id: string; name: string; slug: string }
    team?: { id: string; name: string; slug: string; isCompany?: boolean }
}

export default function JoinCompanyPage({ params }: { params: { locale: string; slug: string } }) {
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()
    const [company, setCompany] = useState<CompanyInfo | null>(null)
    const [loadingCompany, setLoadingCompany] = useState(true)
    const [joining, setJoining] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [switchWarning, setSwitchWarning] = useState<JoinResponse | null>(null)
    const companySlug = getCanonicalCompanySlug(params.slug)
    const isWastefree = isWastefreeCompanySlug(companySlug)
    const isPlanetwild = isPlanetwildCompanySlug(companySlug)
    const isMossyEarth = isMossyEarthCompanySlug(companySlug)

    const joinPath = `/${params.locale}/join/company/${companySlug}`
    const loginHref = `/auth/user/login?redirect=${encodeURIComponent(joinPath)}`
    const signupHref = `/auth/user/signup?company=${encodeURIComponent(companySlug)}`

    useEffect(() => {
        let cancelled = false

        async function loadCompany() {
            setLoadingCompany(true)
            const { data } = await supabase.from('companies').select('name, slug, logo_url').eq('slug', companySlug).single()

            if (!cancelled) {
                setCompany(data ?? { name: companySlug.replace(/[-_]/g, ' '), slug: companySlug })
                setLoadingCompany(false)
            }
        }

        loadCompany()

        return () => {
            cancelled = true
        }
    }, [companySlug])

    const joinCompany = useCallback(
        async (confirmSwitch = false) => {
            if (!user) return

            setJoining(true)
            setError(null)
            setSwitchWarning(null)

            try {
                const response = await fetch('/api/teams/join', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        companySlug,
                        confirmSwitch,
                    }),
                })
                const result = (await response.json()) as JoinResponse

                if (response.ok && result.team?.slug) {
                    router.push(`/${params.locale}/welcome/c/${result.team.slug}`)
                    return
                }

                if (result.requiresConfirmation) {
                    setSwitchWarning(result)
                    return
                }

                setError(result.error || 'Could not join this company forest.')
            } catch (err) {
                setError('Could not join this company forest. Please try again.')
            } finally {
                setJoining(false)
            }
        },
        [companySlug, params.locale, router, user],
    )

    useEffect(() => {
        if (!authLoading && user) {
            joinCompany(false)
        }
    }, [authLoading, joinCompany, user])

    const companyName = company?.name || 'this company'
    const joinLabel = isWastefree ? 'clean-ocean fund' : isPlanetwild || isMossyEarth ? 'rewilding fund' : 'company forest'
    const pageTitle = isWastefree ? 'Join Waste Free Planet for free' : isPlanetwild ? 'Join Planet Wild with IdleForest' : isMossyEarth ? 'Join Mossy Earth with IdleForest' : `Join ${companyName}`
    const joinDescription = isWastefree
        ? 'Connect your IdleForest account to the Waste Free Planet clean-ocean fund. After setup, future activity helps fund ocean-bound plastic recovery through Plastic Bank.'
        : isPlanetwild
          ? "Connect your IdleForest account to the Planet Wild support forest. IdleForest is a separate free app from Planet Wild's own website and membership."
          : isMossyEarth
            ? 'Connect your IdleForest account to Mossy Earth. After setup, future desktop activity helps generate passive funding for conservation and rewilding projects.'
        : `Connect your IdleForest account to ${companyName}. Future activity will count toward this company forest.`
    const signupLabel = isWastefree ? 'Create account to join Waste Free Planet' : isPlanetwild ? 'Create account to join Planet Wild' : isMossyEarth ? 'Create account to join Mossy Earth' : 'Create account to join'
    const loginLabel = isWastefree ? 'Log in to join Waste Free Planet' : isPlanetwild ? 'Log in to join Planet Wild' : isMossyEarth ? 'Log in to join Mossy Earth' : 'Log in to join'
    const installedNote = isWastefree
        ? 'Already installed IdleForest? Joining connects future desktop activity to the clean-ocean fund automatically after your app syncs.'
        : isPlanetwild
          ? "Already installed IdleForest? Joining connects future desktop activity to this IdleForest-run support forest automatically after your app syncs. It does not replace Planet Wild's membership."
          : isMossyEarth
            ? 'Already installed IdleForest? Joining connects future desktop activity to the Mossy Earth rewilding fund automatically after your app syncs.'
          : 'Already installed IdleForest? Joining connects future desktop activity to this company forest automatically after your app syncs.'
    const logoUrl = isWastefree ? '/partner/wastefree/wfp-logo-white.webp' : isMossyEarth ? '/partner/mossy-earth/logo-mark.svg' : company?.logo_url
    const logoClassName = isWastefree
        ? 'h-16 w-28 rounded-lg border border-[#e4dccc] bg-black object-contain p-1.5'
        : isMossyEarth
          ? 'h-14 w-14 rounded-full border border-[#e4dccc] bg-white object-contain'
        : 'h-12 w-12 rounded-lg border border-[#e4dccc] bg-white object-contain p-2'
    const safetyNotes = [
        { icon: Lock, label: 'No donation or payment method' },
        { icon: ShieldCheck, label: 'No browsing history or private data' },
        { icon: BadgeCheck, label: 'You can pause or uninstall anytime' },
    ]

    if (isPlanetwild) {
        const planetWildLogoUrl = company?.logo_url || '/partner/planetwild/pw-logo-black.png'

        return (
            <main className="pw-page pw-join-page">
                <section className="pw-join-shell" aria-labelledby="planetwild-join-heading">
                    <div className="pw-join-copy">
                        <Link href={`/${params.locale}/c/planetwild`} className="pw-join-brand" aria-label="Back to Planet Wild landing page">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={planetWildLogoUrl} alt="" />
                            <span>Planet Wild</span>
                        </Link>
                        <p className="pw-kicker">IdleForest company forest</p>
                        <h1 id="planetwild-join-heading">{pageTitle}</h1>
                        <p>{joinDescription}</p>
                        <div className="pw-join-notes">
                            {safetyNotes.map((note) => {
                                const Icon = note.icon

                                return (
                                    <article key={note.label}>
                                        <Icon aria-hidden className="pw-join-note-icon" strokeWidth={2.6} />
                                        <span>{note.label}</span>
                                    </article>
                                )
                            })}
                        </div>
                    </div>

                    <div className="pw-join-panel">
                        <p className="pw-kicker">Free support setup</p>

                        {authLoading || loadingCompany ? (
                            <div className="pw-join-status" role="status">
                                <Loader2 aria-hidden className="pw-join-spinner" />
                                <span>Checking your account...</span>
                            </div>
                        ) : user ? (
                            switchWarning ? (
                                <div className="pw-join-switch">
                                    <h2>Switch company forest?</h2>
                                    <p>
                                        You are currently part of {switchWarning.currentCompany?.name || 'another company forest'}. Joining {companyName} will switch your account to this rewilding
                                        fund.
                                    </p>
                                    <div className="pw-join-actions">
                                        <button type="button" disabled={joining} onClick={() => joinCompany(true)} className="pw-chip pw-chip--solid">
                                            {joining ? 'Switching...' : 'Switch company'}
                                            <ArrowRight aria-hidden />
                                        </button>
                                        <button type="button" onClick={() => setSwitchWarning(null)} className="pw-chip pw-chip--outline">
                                            Keep current
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="pw-join-status" role="status">
                                    <Loader2 aria-hidden className="pw-join-spinner" />
                                    <span>Joining {companyName}...</span>
                                </div>
                            )
                        ) : (
                            <div className="pw-join-actions">
                                <Link href={signupHref} className="pw-chip pw-chip--solid">
                                    Create account
                                    <ArrowRight aria-hidden />
                                </Link>
                                <Link href={loginHref} className="pw-chip pw-chip--outline">
                                    Log in
                                </Link>
                            </div>
                        )}

                        {error ? <div className="pw-join-error">{error}</div> : null}

                        <p className="pw-join-installed">{installedNote}</p>
                    </div>
                </section>
            </main>
        )
    }

    return (
        <main className="min-h-screen bg-[#f7f4ec] px-4 py-12 text-[#172116] sm:px-6">
            <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-2xl items-center justify-center">
                <section className="w-full rounded-lg border border-[#e4dccc] bg-white p-6 shadow-[0_24px_80px_rgba(23,33,22,0.12)] sm:p-8">
                    <div className="flex items-center gap-3">
                        {logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={logoUrl} alt="" className={logoClassName} />
                        ) : (
                            <div className="h-12 w-12 rounded-lg bg-[#d7e7df]" />
                        )}
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#4d6f45]">{joinLabel}</p>
                            <h1 className="mt-1 text-3xl font-black leading-tight text-[#172116] sm:text-4xl">{pageTitle}</h1>
                        </div>
                    </div>

                    <p className="mt-6 text-base font-semibold leading-8 text-[#4f5848]">{joinDescription}</p>

                    {authLoading || loadingCompany ? (
                        <div className="mt-6 flex items-center gap-3 rounded-lg bg-[#eef3eb] p-4 text-sm font-bold text-[#4f5848]">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Checking your account...
                        </div>
                    ) : user ? (
                        <div className="mt-6">
                            {switchWarning ? (
                                <div className="rounded-lg border border-[#d6c48f] bg-[#fff8df] p-5">
                                    <h2 className="text-xl font-black text-[#172116]">Switch company forest?</h2>
                                    <p className="mt-3 text-sm font-medium leading-6 text-[#5d5946]">
                                        You are currently part of {switchWarning.currentCompany?.name || 'another company forest'}. Joining {companyName} will switch your account to this company
                                        forest.
                                    </p>
                                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                        <button
                                            type="button"
                                            disabled={joining}
                                            onClick={() => joinCompany(true)}
                                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#172116] px-5 py-3 text-sm font-black text-white transition hover:bg-[#4d6f45] disabled:opacity-60"
                                        >
                                            {joining ? 'Switching...' : 'Switch company'}
                                            <ArrowRight className="h-4 w-4" strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSwitchWarning(null)}
                                            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#172116]/20 px-5 py-3 text-sm font-black text-[#172116] transition hover:bg-[#eef3eb]"
                                        >
                                            Keep current company
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 rounded-lg bg-[#eef3eb] p-4 text-sm font-bold text-[#4f5848]">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Joining {companyName}...
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            <Link
                                href={signupHref}
                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#172116] px-6 py-3 text-sm font-black text-white transition hover:bg-[#4d6f45]"
                            >
                                {signupLabel}
                                <ArrowRight className="h-4 w-4" strokeWidth={3} />
                            </Link>
                            <Link
                                href={loginHref}
                                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#172116]/18 bg-[#eef3eb] px-6 py-3 text-sm font-black text-[#172116] transition hover:bg-white"
                            >
                                {loginLabel}
                            </Link>
                        </div>
                    )}

                    <div className="mt-6 grid gap-3">
                        {safetyNotes.map((note) => {
                            const Icon = note.icon

                            return (
                                <div key={note.label} className="flex items-start gap-3 rounded-lg bg-[#f7f4ec] p-3">
                                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#4d6f45]" strokeWidth={2.8} />
                                    <p className="text-sm font-bold leading-6 text-[#4f5848]">{note.label}</p>
                                </div>
                            )
                        })}
                    </div>

                    {error ? <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700">{error}</div> : null}

                    <div className="mt-6 border-t border-[#e4dccc] pt-5">
                        <p className="text-sm font-medium leading-6 text-[#606858]">{installedNote}</p>
                    </div>
                </section>
            </div>
        </main>
    )
}
