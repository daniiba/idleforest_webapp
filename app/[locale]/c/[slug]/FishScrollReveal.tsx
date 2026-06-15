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
    const startScrollYRef = useRef<number | null>(null)
    const maxProgressRef = useRef(0)

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
            const rect = reveal.getBoundingClientRect()
            const viewportHeight = window.innerHeight || document.documentElement.clientHeight
            const isFullyVisible = rect.top >= 0 && rect.bottom <= viewportHeight

            if (startScrollYRef.current === null) {
                if (!isFullyVisible) {
                    reveal.style.setProperty('--fish-reveal', `${maxProgressRef.current * 100}%`)
                    return
                }

                startScrollYRef.current = window.scrollY
            }

            const isMobile = window.matchMedia('(max-width: 59.99rem)').matches
            const scrollableDistance = Math.max(1, viewportHeight * (isMobile ? 0.22 : 0.28))
            const progress = clamp((window.scrollY - startScrollYRef.current) / scrollableDistance)
            maxProgressRef.current = Math.max(maxProgressRef.current, progress)
            reveal.style.setProperty('--fish-reveal', `${maxProgressRef.current * 100}%`)
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
