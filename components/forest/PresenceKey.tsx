import type { PresenceStatus } from '@/lib/forest-scene'

type PresenceKeyProps = {
    statuses: Array<PresenceStatus | null | undefined>
    className?: string
}

// Explains the little people in the groves, with a live count.
export default function PresenceKey({ statuses, className }: PresenceKeyProps) {
    const known = statuses.filter(Boolean)
    if (known.length === 0) return null
    const awake = known.filter(status => status === 'working').length

    return (
        <p className={`text-xs font-semibold text-black/60 ${className || ''}`}>
            <span className="font-black text-brand-navy">{awake} of {known.length}</span> {known.length === 1 ? 'person is' : 'people are'} planting right now.
            {' '}Watering means the computer is on and planting. Sleeping means it is off or resting.
        </p>
    )
}
