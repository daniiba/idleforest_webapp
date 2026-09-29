'use client'

import { useEffect, useRef, useState } from 'react'
import { Hand, Minus, Plus, RotateCcw } from 'lucide-react'
import ForestIsland from '@/components/forest/ForestIsland'
import type { ForestFriend, PresenceStatus } from '@/lib/forest-scene'
import type { Forest3DHandle } from '@/lib/forest-3d'

type Forest3DProps = {
    seed: string
    ownTrees: number
    inviteTrees: number
    friends: ForestFriend[]
    title?: string
    className?: string
    /** Empty plots become clickable when set (invite a friend / join). */
    onPlotClick?: () => void
    plotLabel?: string
    /** Name of the centre grove in tooltips (default "Your forest"). */
    mainTitle?: string
    /** Your own computer: a working or sleeping person in the middle grove. */
    ownStatus?: PresenceStatus | null
    /** Team forest: a shared clearing in the middle, every tree in its planter's grove. */
    hub?: boolean
}

type Status = 'idle' | 'loading' | 'ready' | 'fallback'

const buttonClass = 'flex h-9 w-9 items-center justify-center border-2 border-black bg-brand-gray/85 text-black backdrop-blur hover:bg-brand-yellow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black'

// Interactive 3D forest. Shows the SVG island immediately (and keeps it for
// devices without WebGL); three.js is only downloaded once the forest is
// about to scroll into view.
export default function Forest3D({ seed, ownTrees, inviteTrees, friends, title, className, onPlotClick, plotLabel, mainTitle, ownStatus, hub }: Forest3DProps) {
    const frameRef = useRef<HTMLDivElement>(null)
    const mountRef = useRef<HTMLDivElement>(null)
    const handleRef = useRef<Forest3DHandle | null>(null)
    const [status, setStatus] = useState<Status>('idle')
    const [nearViewport, setNearViewport] = useState(false)
    const [active, setActive] = useState(false)
    const [focused, setFocused] = useState<string | null>(null)
    const [coarse, setCoarse] = useState(false)
    // Latest click handler without re-mounting the scene when it changes.
    const plotClickRef = useRef(onPlotClick)
    plotClickRef.current = onPlotClick
    const hasPlotClick = Boolean(onPlotClick)

    useEffect(() => {
        setCoarse(window.matchMedia?.('(pointer: coarse)').matches ?? false)
        const frame = frameRef.current
        if (!frame) return
        const observer = new IntersectionObserver(entries => {
            if (entries.some(entry => entry.isIntersecting)) {
                setNearViewport(true)
                observer.disconnect()
            }
        }, { rootMargin: '300px' })
        observer.observe(frame)
        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (!nearViewport || !mountRef.current) return
        let cancelled = false
        const mount = mountRef.current
        setStatus('loading')

        import('@/lib/forest-3d')
            .then(({ isWebGLAvailable, mountForest3D }) => {
                if (cancelled) return
                if (!isWebGLAvailable()) {
                    setStatus('fallback')
                    return
                }
                handleRef.current = mountForest3D(mount, { seed, ownTrees, inviteTrees, friends, ownStatus, hub }, {
                    reducedMotion: window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false,
                    onActiveChange: setActive,
                    onFocusChange: setFocused,
                    onPlotClick: hasPlotClick ? () => plotClickRef.current?.() : undefined,
                    plotLabel,
                    mainTitle,
                })
                setStatus('ready')
            })
            .catch(error => {
                console.error('3D forest unavailable, showing 2D view:', error)
                if (!cancelled) setStatus('fallback')
            })

        return () => {
            cancelled = true
            handleRef.current?.dispose()
            handleRef.current = null
        }
    }, [friends, hasPlotClick, hub, inviteTrees, mainTitle, nearViewport, ownStatus, ownTrees, plotLabel, seed])

    const ready = status === 'ready'

    return (
        <div
            ref={frameRef}
            className={`relative aspect-[4/3] w-full select-none sm:aspect-[16/10] ${className || ''}`}
            role="group"
            aria-label={title || 'Forest island'}
        >
            {!ready ? (
                <ForestIsland
                    className="absolute inset-0 flex items-center justify-center [&_svg]:!h-full [&_svg]:!w-full"
                    seed={seed}
                    ownTrees={ownTrees}
                    inviteTrees={inviteTrees}
                    friends={friends}
                    title={title}
                    hub={hub}
                />
            ) : null}

            <div ref={mountRef} className={`absolute inset-0 ${ready ? '' : 'pointer-events-none opacity-0'}`} />

            {ready ? (
                <>
                    <div className="absolute right-2 top-2 flex flex-col gap-1.5">
                        <button type="button" className={buttonClass} onClick={() => handleRef.current?.zoomBy(0.75)} aria-label="Zoom in">
                            <Plus className="h-4 w-4" />
                        </button>
                        <button type="button" className={buttonClass} onClick={() => handleRef.current?.zoomBy(1.33)} aria-label="Zoom out">
                            <Minus className="h-4 w-4" />
                        </button>
                        <button type="button" className={buttonClass} onClick={() => handleRef.current?.reset()} aria-label="Back to your forest">
                            <RotateCcw className="h-4 w-4" />
                        </button>
                    </div>

                    {focused ? (
                        <button
                            type="button"
                            onClick={() => handleRef.current?.reset()}
                            className="absolute left-2 top-2 border-2 border-black bg-brand-yellow px-3 py-1.5 text-xs font-black uppercase text-black"
                        >
                            ← Back · {focused.split(':')[0]}
                        </button>
                    ) : null}

                    {coarse && !active ? (
                        <button
                            type="button"
                            onClick={() => handleRef.current?.setActive(true)}
                            className="absolute inset-x-0 bottom-3 mx-auto flex w-fit items-center gap-2 border-2 border-black bg-brand-gray/90 px-3 py-1.5 text-xs font-bold text-black backdrop-blur"
                        >
                            <Hand className="h-3.5 w-3.5" aria-hidden="true" />
                            Tap to explore in 3D
                        </button>
                    ) : (
                        <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center text-[11px] font-semibold text-black/45">
                            {coarse ? 'Drag · pinch · tap a grove' : active ? 'Drag · scroll · click a grove' : 'Drag to explore'}
                        </p>
                    )}
                </>
            ) : null}
        </div>
    )
}
