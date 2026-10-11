'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'
import { useRouter } from '@/navigation'

type Props = {
    code: string
    teamId: string
    teamName: string
    teamHref: string
    // True when the viewer is in another team, so joining switches teams.
    switching: boolean
}

export default function InviteJoinButton({ code, teamId, teamName, teamHref, switching }: Props) {
    const t = useTranslations('TeamInvite')
    const router = useRouter()
    const [busy, setBusy] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const join = async () => {
        setBusy(true)
        setError(null)
        try {
            const response = await fetch('/api/teams/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteCode: code, confirmSwitch: switching }),
            })
            const data = await response.json().catch(() => ({}))

            if (response.ok) {
                router.push(`/welcome/team/${teamId}`)
                return
            }
            if (response.status === 409 && !data.requiresConfirmation) {
                // Already a member of this team.
                router.push(teamHref)
                return
            }
            if (response.status === 409 || (response.status === 403 && data.isOwner)) {
                // The viewer's team changed since the page rendered; re-render with the right warning.
                router.refresh()
                setBusy(false)
                return
            }
            setError(typeof data.error === 'string' ? data.error : t('error_join_failed'))
        } catch {
            setError(t('error_join_failed'))
        }
        setBusy(false)
    }

    return (
        <div>
            <button
                type="button"
                onClick={join}
                disabled={busy}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-brand-yellow px-8 py-4 text-lg font-extrabold text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {busy ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                        {switching ? t('cta_switching') : t('cta_joining')}
                    </>
                ) : switching ? (
                    t('cta_switch', { team: teamName })
                ) : (
                    t('cta_join', { team: teamName })
                )}
            </button>
            {error ? (
                <p role="alert" className="mt-3 text-sm font-bold text-red-600">
                    {error}
                </p>
            ) : null}
        </div>
    )
}
