'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

const plasticFishSrc = '/partner/wastefree/plastic-bottle-fish.png'
const realFishSrc = '/partner/wastefree/real-fish.png'

function clamp(value: number) {
    return Math.min(1, Math.max(0, value))
}

export default function FishScrollReveal() {
    const revealRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const reveal = revealRef.current
        if (!reveal) return undefined

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion) {
            reveal.style.setProperty('--fish-reveal', '100%')
            return undefined
        }

        const update = () => {
            const rect = reveal.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight
            const isMobile = window.matchMedia('(max-width: 59.99rem)').matches
            const holdDistance = isMobile ? 80 : 52
            const startTop = viewportHeight - rect.height - holdDistance
            const scrollableDistance = Math.max(1, viewportHeight * (isMobile ? 0.2 : 0.24))
            const progress = clamp((startTop - rect.top) / scrollableDistance)
            reveal.style.setProperty('--fish-reveal', `${progress * 100}%`)
        }

        let frame = 0
        const scheduleUpdate = () => {
            if (frame) return
            frame = window.requestAnimationFrame(() => {
                frame = 0
                update()
            })
        }

        update()
        window.addEventListener('scroll', scheduleUpdate, { passive: true })
        window.addEventListener('resize', scheduleUpdate)

        return () => {
            if (frame) window.cancelAnimationFrame(frame)
            window.removeEventListener('scroll', scheduleUpdate)
            window.removeEventListener('resize', scheduleUpdate)
        }
    }, [])

    return (
        <div ref={revealRef} className="wfp-fish-scroll" aria-label="Plastic fish transforms into a real fish while scrolling">
            <div className="wfp-fish-scroll__stage">
                <Image
                    src={plasticFishSrc}
                    alt="A fish made from a transparent plastic bottle"
                    width={1254}
                    height={1254}
                    className="wfp-fish-scroll__fish wfp-fish-scroll__fish--plastic"
                    sizes="(min-width: 960px) 38rem, 88vw"
                    priority={false}
                />
                <Image
                    src={realFishSrc}
                    alt="A real silver fish in the same pose"
                    width={1254}
                    height={1254}
                    className="wfp-fish-scroll__fish wfp-fish-scroll__fish--real"
                    sizes="(min-width: 960px) 38rem, 88vw"
                    priority={false}
                />
                <span className="wfp-fish-scroll__wipe" aria-hidden="true" />
            </div>
        </div>
    )
}
