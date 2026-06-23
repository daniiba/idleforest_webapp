'use client'

import { useState } from 'react'
import { Loader2, LogOut, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

type CompanyLeaveButtonProps = {
    companyName: string
    leaveRedirectHref?: string
    className?: string
}

export default function CompanyLeaveButton({
    companyName,
    leaveRedirectHref,
    className = '',
}: CompanyLeaveButtonProps) {
    const router = useRouter()
    const [confirmingLeave, setConfirmingLeave] = useState(false)
    const [leaving, setLeaving] = useState(false)
    const [error, setError] = useState('')

    const closePopup = () => {
        if (leaving) return
        setConfirmingLeave(false)
        setError('')
    }

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
        <>
            <button
                type="button"
                onClick={() => setConfirmingLeave(true)}
                className={`inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-md border border-black/10 bg-white px-3 py-2 text-sm font-black text-black transition-colors hover:bg-neutral-50 active:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
            >
                <LogOut className="h-4 w-4" />
                Leave
            </button>

            {confirmingLeave ? (
                <div
                    className="fixed inset-0 z-[500] flex items-center justify-center bg-black/45 px-4 py-6"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="company-leave-title"
                >
                    <button
                        type="button"
                        aria-label="Close leave confirmation"
                        className="absolute inset-0 cursor-default"
                        onClick={closePopup}
                        disabled={leaving}
                    />
                    <div className="relative w-full max-w-md rounded-lg border border-black bg-white p-5 text-black shadow-[0_18px_60px_rgba(0,0,0,0.32)] sm:p-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <h2 id="company-leave-title" className="font-candu text-2xl font-extrabold uppercase leading-none text-black">
                                    Leave {companyName}?
                                </h2>
                                <p className="mt-3 text-sm font-semibold leading-6 text-neutral-700">
                                    Future activity will return to IdleForest&apos;s general reforestation impact. Your existing {companyName} contribution history stays recorded.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closePopup}
                                disabled={leaving}
                                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-black/10 bg-white text-black transition-colors hover:bg-neutral-50 active:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Close</span>
                            </button>
                        </div>

                        {error ? (
                            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                                {error}
                            </p>
                        ) : null}

                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={closePopup}
                                disabled={leaving}
                                className="inline-flex min-h-10 items-center justify-center rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black text-black transition-colors hover:bg-neutral-50 active:bg-neutral-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Keep support
                            </button>
                            <button
                                type="button"
                                onClick={handleLeave}
                                disabled={leaving}
                                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md border border-black bg-brand-yellow px-4 py-2 text-sm font-black uppercase tracking-wider text-black shadow-sm transition-transform duration-150 ease-out hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                            >
                                {leaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                                Return to IdleForest
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    )
}
