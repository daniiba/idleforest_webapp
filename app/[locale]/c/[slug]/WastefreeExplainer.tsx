'use client'

import { useEffect, useState } from 'react'
import { Apple, BadgeCheck, Chrome, CircleUserRound, Download } from 'lucide-react'

type WastefreeStep = {
    number: string
    title: string
    body: string
    visual: string
}

const autoAdvanceMs = 2800

export default function WastefreeExplainer({ steps }: { steps: WastefreeStep[] }) {
    const [activeIndex, setActiveIndex] = useState(0)

    useEffect(() => {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (prefersReducedMotion || steps.length < 2) return undefined

        const timeout = window.setTimeout(() => {
            setActiveIndex((currentIndex) => (currentIndex + 1) % steps.length)
        }, autoAdvanceMs)

        return () => window.clearTimeout(timeout)
    }, [activeIndex, steps.length])

    return (
        <div className="wfp-explainer" aria-label="How Waste Free Planet and IdleForest work together">
            <div className="wfp-explainer__steps">
                {steps.map((step, index) => (
                    <button
                        key={step.number}
                        type="button"
                        className={`wfp-explainer-step wfp-explainer-step--${index + 1}${activeIndex === index ? ' is-active' : ''}`}
                        aria-pressed={activeIndex === index}
                        onClick={() => setActiveIndex(index)}
                    >
                        <span>{step.number}</span>
                        <div>
                            <h3>{step.title}</h3>
                            <p>{step.body}</p>
                        </div>
                    </button>
                ))}
            </div>
            <div className="wfp-explainer-stage" aria-hidden="true">
                {steps.map((step, index) => (
                    <div key={step.visual} className={`wfp-explainer-scene wfp-explainer-scene--${index + 1}${activeIndex === index ? ' is-active' : ''}`}>
                        <WastefreeExplainerArt visual={step.visual} />
                    </div>
                ))}
            </div>
        </div>
    )
}

function WastefreeExplainerArt({ visual }: { visual: string }) {
    if (visual === 'join') {
        return (
            <div className="wfp-art-join-flow">
                <div className="wfp-art-box wfp-art-community-card">
                    <small>Join free</small>
                    <strong>Waste Free Planet</strong>
                    <div className="wfp-art-member-stack">
                        <span />
                        <span />
                        <span />
                    </div>
                </div>
                <div className="wfp-art-membership-badge">
                    <CircleUserRound strokeWidth={2.8} />
                    <span>Member</span>
                    <BadgeCheck strokeWidth={2.8} />
                </div>
                <div className="wfp-art-box wfp-art-box--accent wfp-art-fund-card">
                    <small>Clean-ocean fund</small>
                    <strong>Points ready to count</strong>
                    <span className="wfp-art-check">Connected</span>
                </div>
            </div>
        )
    }

    if (visual === 'install') {
        return (
            <>
                <div className="wfp-art-window wfp-art-install-window">
                    <div className="wfp-art-window-dots">
                        <span />
                        <span />
                        <span />
                    </div>
                    <div className="wfp-art-install-header">
                        <span className="wfp-art-download-badge">
                            <Download strokeWidth={3} />
                        </span>
                        <div>
                            <small>IdleForest setup</small>
                            <strong>Install once</strong>
                        </div>
                    </div>
                </div>
                <div className="wfp-art-install-grid">
                    <strong>
                        <Chrome strokeWidth={2.8} />
                        Chrome
                    </strong>
                    <strong>
                        <Apple strokeWidth={2.8} />
                        Mac
                    </strong>
                    <strong>
                        <span className="wfp-windows-icon">
                            <span />
                            <span />
                            <span />
                            <span />
                        </span>
                        Windows
                    </strong>
                </div>
            </>
        )
    }

    if (visual === 'run') {
        return (
            <>
                <div className="wfp-art-status">
                    <div>
                        <small>IdleForest</small>
                        <strong>Running quietly</strong>
                    </div>
                    <span>ON</span>
                </div>
                <div className="wfp-art-meter">
                    <span />
                </div>
                <div className="wfp-art-safe-row">
                    <small>No browsing history</small>
                    <small>Pause anytime</small>
                </div>
            </>
        )
    }

    return (
        <>
            <div className="wfp-art-bottles">
                {Array.from({ length: 8 }).map((_, bottleIndex) => (
                    <span key={bottleIndex} />
                ))}
            </div>
            <div className="wfp-art-box wfp-art-box--accent wfp-art-cleanup">
                <small>Plastic Bank cleanup</small>
                <strong>Less plastic at sea</strong>
            </div>
        </>
    )
}
