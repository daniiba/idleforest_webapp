'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Loader2, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CompanyMemberPanelProps = {
    companyName: string
    portalHref: string
    logoUrl?: string | null
    description: string
    impactLabel?: string
    portalLabel?: string
    className?: string
    variant?: 'light' | 'dark' | 'ocean'
    leaveRedirectHref?: string
}

export default function CompanyMemberPanel({
    companyName,
    portalHref,
    logoUrl,
    description,
    impactLabel = 'Active support',
    portalLabel = 'Open portal',
    className = '',
    variant = 'light',
    leaveRedirectHref,
}: CompanyMemberPanelProps) {
    const router = useRouter()
    const [confirmingLeave, setConfirmingLeave] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [error, setError] = useState('')

    const isDark = variant === 'dark' || variant === 'ocean'
    const panelClassName = isDark
        ? 'border-white/25 bg-black/45 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] backdrop-blur'
        : 'border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
    const mutedClassName = isDark ? 'text-white/72' : 'text-neutral-600'
    const secondaryButtonClassName = isDark
        ? 'border-white/25 bg-white/10 text-white hover:bg-white/18'
        : 'border-black bg-white text-black hover:bg-neutral-100'

    const handleLeave = async () => {
        setLeaving(true)
        setError('')

        try {
            const response = await fetch('/api/companies/leave', {
                method: 'POST',
            })
            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Could not return to IdleForest')
                return
            }

            if (leaveRedirectHref) {
                router.push(leaveRedirectHref)
            } else {
                router.refresh()
            }
        } catch (leaveError) {
            console.error('Could not leave company', leaveError)
            setError('Could not return to IdleForest')
        } finally {
            setLeaving(false)
        }
    }

    return (
        <div className={`max-w-xl border-2 p-3 ${panelClassName} ${className}`}>
            <div className="flex gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden border ${isDark ? 'border-white/25 bg-white' : 'border-black bg-black'}`}>
                    {logoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoUrl} alt="" className="h-full w-full object-contain p-1" />
                    ) : (
                        <CheckCircle className={`h-5 w-5 ${isDark ? 'text-black' : 'text-brand-yellow'}`} />
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-[0.66rem] font-black uppercase leading-none tracking-wider ${isDark ? 'text-white/62' : 'text-neutral-500'}`}>You are contributing to</p>
                        <span className={`border px-2 py-0.5 text-[0.62rem] font-black uppercase tracking-wider ${isDark ? 'border-white/25 bg-white/10' : 'border-black bg-[#f8fff1]'}`}>
                            {impactLabel}
                        </span>
                    </div>
                    <h3 className="mt-1 truncate text-base font-black leading-tight">{companyName}</h3>
                    <p className={`mt-1 text-xs font-semibold leading-5 ${mutedClassName}`}>{description}</p>
                </div>
            </div>

            {confirmingLeave ? (
                <div className={`mt-3 border p-3 ${isDark ? 'border-white/20 bg-black/25' : 'border-black bg-neutral-50'}`}>
                    <p className={`text-xs font-semibold leading-5 ${mutedClassName}`}>
                        Future activity will return to IdleForest&apos;s general reforestation impact. Your existing {companyName} contribution history stays recorded.
                    </p>
                    {error ? <p className="mt-2 text-xs font-bold text-red-500">{error}</p> : null}
                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                setConfirmingLeave(false)
                                setError('')
                            }}
                            disabled={leaving}
                            className={`inline-flex h-9 items-center justify-center border px-3 text-xs font-black uppercase tracking-wider ${secondaryButtonClassName} disabled:opacity-60`}
                        >
                            Keep support
                        </button>
                        <button
                            type="button"
                            onClick={handleLeave}
                            disabled={leaving}
                            className="inline-flex h-9 items-center justify-center gap-2 border border-black bg-brand-yellow px-3 text-xs font-black uppercase tracking-wider text-black disabled:opacity-60"
                        >
                            {leaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                            Return to IdleForest
                        </button>
                    </div>
                </div>
            ) : (
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                        href={portalHref}
                        className="inline-flex h-9 items-center justify-center gap-2 border border-black bg-brand-yellow px-3 text-xs font-black uppercase tracking-wider text-black"
                    >
                        {portalLabel}
                        <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <button
                        type="button"
                        onClick={() => setConfirmingLeave(true)}
                        className={`inline-flex h-9 items-center justify-center gap-2 border px-3 text-xs font-black uppercase tracking-wider ${secondaryButtonClassName}`}
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave
                    </button>
                </div>
            )}
        </div>
    )
}
