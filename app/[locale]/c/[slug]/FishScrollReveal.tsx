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

        let interval = 0
        const update = () => {
            const hero = reveal.closest('.wfp-hero')
            const rect = hero?.getBoundingClientRect() || reveal.getBoundingClientRect()
            const isMobile = window.matchMedia('(max-width: 59.99rem)').matches
            const revealDelay = isMobile ? rect.height * 0.22 : 0
            const scrollableDistance = Math.max(1, rect.height * (isMobile ? 0.58 : 0.35))
            const progress = clamp((-rect.top - revealDelay) / scrollableDistance)
            reveal.style.setProperty('--fish-reveal', `${progress * 100}%`)
        }

        update()
        interval = window.setInterval(update, 80)
        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)

        return () => {
            if (interval) window.clearInterval(interval)
            window.removeEventListener('scroll', update)
            window.removeEventListener('resize', update)
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
