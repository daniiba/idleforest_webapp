'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState } from 'react'
import type { Player } from '@lottiefiles/react-lottie-player'
import plantAnimation from '@/app/plant-animation.json'

const LottiePlayer = dynamic(() => import('@/components/LottiePlayer'), { ssr: false })

type PlayerHandle = Player & {
    state?: {
        instance?: {
            totalFrames?: number
        } | null
    }
}

const plantFrameCount = Math.max(1, Math.floor((plantAnimation.op ?? 120) - (plantAnimation.ip ?? 0)))

function syncAnimationToScroll(player: PlayerHandle | null, progress: number) {
    if (!player?.setSeeker) return

    const totalFrames = Math.max(1, Math.floor(player.state?.instance?.totalFrames ?? plantFrameCount))
    player.setSeeker(progress * (totalFrames - 1), false)
    player.pause?.()
}

function easeOutCubic(progress: number) {
    return 1 - Math.pow(1 - progress, 3)
}

function PhoneRepairGrowingTree({
    className = '',
    progress,
}: {
    className?: string
    progress: number
}) {
    const playerRef = useRef<PlayerHandle | null>(null)
    const progressRef = useRef(progress)

    useEffect(() => {
        progressRef.current = progress
        syncAnimationToScroll(playerRef.current, progress)
    }, [progress])

    return (
        <div
            className={`phone-line-growing-tree ${className}`}
            style={{ opacity: Math.min(1, Math.max(0, progress * 5)) }}
            aria-hidden="true"
        >
            <div className="phone-line-growing-tree-frame">
                <LottiePlayer
                    playerRef={playerRef}
                    src={plantAnimation}
                    autoplay={false}
                    loop={false}
                    keepLastFrame
                    onEvent={(event) => {
                        if (event === 'load' || event === 'ready' || event === 'instanceSaved') {
                            syncAnimationToScroll(playerRef.current, progressRef.current)
                        }
                    }}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
            <span className="phone-line-growing-tree-shadow" />
        </div>
    )
}

export default function PhoneRepairGrowingTrees() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const stageRef = useRef<HTMLDivElement | null>(null)
    const lastScrollStateRef = useRef({ progress: -1, scrollY: -1, viewportHeight: -1 })

    useEffect(() => {
        const stage = stageRef.current
        if (!stage) return

        const source = stage.closest('.phone-line-hero-panel') ?? stage
        const entranceElements = {
            phone: source.querySelector<HTMLElement>('.phone-line-device'),
            macbook: source.querySelector<HTMLElement>('.phone-line-macbook'),
            ipad: source.querySelector<HTMLElement>('.phone-line-ipad'),
        }
        const deviceStage = source.querySelector<HTMLElement>('.phone-line-stage:not(.phone-line-plant-stage)')
        const handleDevicePointerEnter = () => source.classList.add('is-device-hovered')
        const handleDevicePointerLeave = () => source.classList.remove('is-device-hovered')
        deviceStage?.addEventListener('pointerenter', handleDevicePointerEnter)
        deviceStage?.addEventListener('pointerleave', handleDevicePointerLeave)
        const entranceStart = Date.now()
        const entranceDuration = 760
        let isEntranceSettled = false
        const finishEntrance = () => {
            if (isEntranceSettled) return

            isEntranceSettled = true
            window.clearInterval(entranceTimer)
            source.classList.add('is-device-loaded')
            Object.values(entranceElements).forEach((element) => {
                if (!element) return
                element.style.transition = ''
                element.style.transform = ''
            })
        }
        const entranceTimer = window.setInterval(() => {
            const elapsed = Date.now() - entranceStart
            const progress = Math.min(1, elapsed / entranceDuration)
            const easedProgress = easeOutCubic(progress)
            const phoneY = 34 + (-4 - 34) * easedProgress
            const phoneScale = 0.96 + 0.04 * easedProgress
            const macbookX = -64 + 14 * easedProgress
            const macbookY = 36 * (1 - easedProgress)
            const macbookScale = 0.96 + 0.04 * easedProgress
            const ipadX = -36 - 14 * easedProgress
            const ipadY = 36 * (1 - easedProgress)
            const ipadScale = 0.96 + 0.04 * easedProgress

            if (progress === 1) {
                finishEntrance()
                return
            }

            Object.values(entranceElements).forEach((element) => {
                if (element) element.style.transition = 'none'
            })
            if (entranceElements.phone) {
                entranceElements.phone.style.transform = `translate3d(0, ${phoneY}px, 0) scale(${phoneScale})`
            }
            if (entranceElements.macbook) {
                entranceElements.macbook.style.transform = `translateX(${macbookX}%) translateY(${macbookY}px) rotate(-3deg) scale(${macbookScale})`
            }
            if (entranceElements.ipad) {
                entranceElements.ipad.style.transform = `translateX(${ipadX}%) translateY(${ipadY}px) rotate(15deg) scale(${ipadScale})`
            }
        }, 16)
        const entranceFallbackTimer = window.setTimeout(finishEntrance, entranceDuration + 120)

        const updateScrollProgress = () => {
            const rect = source.getBoundingClientRect()
            const scrollY = window.scrollY || document.documentElement.scrollTop || 0
            const viewportHeight = window.innerHeight
            const sectionTop = scrollY + rect.top
            const sectionHeight = rect.height
            const start = Math.max(0, sectionTop - viewportHeight * 0.12)
            const end = sectionTop + sectionHeight * 0.7
            const rawProgress = (scrollY - start) / Math.max(1, end - start)
            const nextProgress = Math.min(1, Math.max(0, rawProgress))
            const lastScrollState = lastScrollStateRef.current

            if (
                Math.abs(lastScrollState.progress - nextProgress) >= 0.002 ||
                lastScrollState.scrollY !== scrollY ||
                lastScrollState.viewportHeight !== viewportHeight
            ) {
                lastScrollStateRef.current = { progress: nextProgress, scrollY, viewportHeight }
                setScrollProgress(nextProgress)
            }
        }

        updateScrollProgress()
        const progressTimer = window.setInterval(updateScrollProgress, 33)
        window.addEventListener('scroll', updateScrollProgress, { passive: true })
        window.addEventListener('resize', updateScrollProgress)

        return () => {
            window.clearInterval(entranceTimer)
            window.clearTimeout(entranceFallbackTimer)
            source.classList.remove('is-device-loaded')
            source.classList.remove('is-device-hovered')
            deviceStage?.removeEventListener('pointerenter', handleDevicePointerEnter)
            deviceStage?.removeEventListener('pointerleave', handleDevicePointerLeave)
            Object.values(entranceElements).forEach((element) => {
                if (!element) return
                element.style.transition = ''
                element.style.transform = ''
            })
            window.clearInterval(progressTimer)
            window.removeEventListener('scroll', updateScrollProgress)
            window.removeEventListener('resize', updateScrollProgress)
        }
    }, [])

    return (
        <div ref={stageRef} className="phone-line-stage phone-line-plant-stage" aria-hidden="true">
            <PhoneRepairGrowingTree progress={scrollProgress} />
            <PhoneRepairGrowingTree className="phone-line-growing-tree-left" progress={scrollProgress} />
        </div>
    )
}
