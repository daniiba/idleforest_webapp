'use client'

import { useEffect } from 'react'

export default function SilveiraPaintStrokes() {
    useEffect(() => {
        const marks = Array.from(document.querySelectorAll<HTMLElement>('.silveira-paint-mark'))
        if (!marks.length) return undefined

        const show = (mark: HTMLElement) => {
            window.requestAnimationFrame(() => {
                window.setTimeout(() => {
                    mark.classList.add('is-visible')
                    mark.style.setProperty('--silveira-stroke-scale', '1')
                }, 80)
            })
        }

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion || !('IntersectionObserver' in window)) {
            marks.forEach(show)
            return undefined
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting || entry.intersectionRatio < 0.995) return

                    const mark = entry.target as HTMLElement
                    show(mark)
                    observer.unobserve(mark)
                })
            },
            { threshold: [0, 0.995, 1] },
        )

        marks.forEach((mark) => observer.observe(mark))

        return () => observer.disconnect()
    }, [])

    return null
}
