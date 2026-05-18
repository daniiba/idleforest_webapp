'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import plantAnimation from '@/app/plant-animation.json'

const Player = dynamic(
    () => import('@lottiefiles/react-lottie-player').then((module) => module.Player),
    { ssr: false }
)

const bigTreeDelayMs = 850
const treeCycleMs = 6800

function PhoneRepairGrowingTree({
    className = '',
    delayMs = 0,
    cycleKey,
}: {
    className?: string
    delayMs?: number
    cycleKey: number
}) {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        setIsReady(false)

        const timer = window.setTimeout(() => setIsReady(true), delayMs)

        return () => window.clearTimeout(timer)
    }, [cycleKey, delayMs])

    return (
        <div className={`phone-line-growing-tree ${className}`} aria-hidden="true">
            <div className="phone-line-growing-tree-frame">
                {isReady ? (
                    <Player
                        key={cycleKey}
                        src={plantAnimation}
                        autoplay
                        loop={false}
                        speed={0.78}
                        keepLastFrame
                        style={{ width: '100%', height: '100%' }}
                    />
                ) : null}
            </div>
            <span className="phone-line-growing-tree-shadow" />
        </div>
    )
}

export default function PhoneRepairGrowingTrees() {
    const [cycleKey, setCycleKey] = useState(0)

    useEffect(() => {
        const cycleTimer = window.setInterval(() => {
            setCycleKey((currentKey) => currentKey + 1)
        }, treeCycleMs)

        return () => window.clearInterval(cycleTimer)
    }, [])

    return (
        <>
            <PhoneRepairGrowingTree cycleKey={cycleKey} />
            <PhoneRepairGrowingTree className="phone-line-growing-tree-left" delayMs={bigTreeDelayMs} cycleKey={cycleKey} />
        </>
    )
}
