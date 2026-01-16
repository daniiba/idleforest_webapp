'use client'

import { useRef, useState, useCallback, useMemo, useEffect } from 'react'
import { Trophy, Users, TreePine, Award, Sparkles } from 'lucide-react'
import Link from 'next/link'

// === RARITY TIER SYSTEM ===
// Based on points: 0 to 200,000 maximum

export type CardRarity =
    | 'common'      // 0 - 1,000 points
    | 'uncommon'    // 1,000 - 10,000 points
    | 'rare'        // 10,000 - 50,000 points
    | 'holo'        // 50,000 - 100,000 points
    | 'ultra'       // 100,000 - 150,000 points
    | 'secret'      // 150,000+ points (max legendary tier)

// Effect types matching Pokemon CSS categories
export type EffectType = 'none' | 'reverse' | 'holofoil' | 'amazing' | 'radiant' | 'rainbow'

// Rarity configuration with effect types and intensities
export const RARITY_CONFIG: Record<CardRarity, {
    label: string
    effectType: EffectType
    intensity: { rest: number; hover: number }
}> = {
    common: {
        label: 'Common',
        effectType: 'none',
        intensity: { rest: 0.1, hover: 0.25 },
    },
    uncommon: {
        label: 'Uncommon',
        effectType: 'reverse',
        intensity: { rest: 0.15, hover: 0.35 },
    },
    rare: {
        label: 'Rare',
        effectType: 'holofoil',
        intensity: { rest: 0.2, hover: 0.5 },
    },
    holo: {
        label: 'Holo Rare',
        effectType: 'amazing',
        intensity: { rest: 0.25, hover: 0.6 },
    },
    ultra: {
        label: 'Ultra Rare',
        effectType: 'radiant',
        intensity: { rest: 0.3, hover: 0.7 },
    },
    secret: {
        label: 'Secret Rare',
        effectType: 'rainbow',
        intensity: { rest: 0.4, hover: 0.85 },
    },
}

// Calculate rarity based on points (0 - 200,000)
export function getRarityFromPoints(points: number): CardRarity {
    if (points >= 150000) return 'secret'
    if (points >= 100000) return 'ultra'
    if (points >= 50000) return 'holo'
    if (points >= 10000) return 'rare'
    if (points >= 1000) return 'uncommon'
    return 'common'
}

// Team data for the card
export interface TeamCardData {
    id: string
    name: string
    imageUrl?: string | null
    totalPoints: number
    memberCount: number
    treesPlanted?: number
    slug?: string
}

// User data for the card
export interface UserCardData {
    username: string
    displayName: string
    totalPoints: number
    treesPlanted: number
    badgeCount?: number
    team?: {
        id: string
        name: string
        slug: string
    } | null
}

interface StatsCard3DProps {
    variant: 'team' | 'user'
    teamData?: TeamCardData
    userData?: UserCardData
    interactive?: boolean
    rarity?: CardRarity  // Optional override, otherwise calculated from points
}

// Clamp value between min and max
const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max)

// Round to 2 decimal places
const round = (value: number) => Math.round(value * 100) / 100

// Adjust value from one range to another
const adjust = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {
    return round(toMin + ((value - fromMin) / (fromMax - fromMin)) * (toMax - toMin))
}

export default function StatsCard3D({
    variant,
    teamData,
    userData,
    interactive = true,
    rarity: rarityOverride
}: StatsCard3DProps) {
    const cardRef = useRef<HTMLDivElement>(null)

    // Calculate rarity from points or use override
    const points = variant === 'team' ? (teamData?.totalPoints || 0) : (userData?.totalPoints || 0)
    const rarity = rarityOverride || getRarityFromPoints(points)
    const rarityConfig = RARITY_CONFIG[rarity]

    // Pointer position as percentage (0-100)
    const [pointer, setPointer] = useState({ x: 50, y: 50 })
    // Rotation in degrees
    const [rotate, setRotate] = useState({ x: 0, y: 0 })
    // Background position for subtle parallax
    const [background, setBackground] = useState({ x: 50, y: 50 })
    // Glare opacity
    const [glareOpacity, setGlareOpacity] = useState(0)

    const [isHovering, setIsHovering] = useState(false)

    // Calculate derived values
    const pointerFromCenter = useMemo(() => {
        return clamp(
            Math.sqrt(
                Math.pow(pointer.y - 50, 2) + Math.pow(pointer.x - 50, 2)
            ) / 50,
            0,
            1
        )
    }, [pointer.x, pointer.y])

    const pointerFromTop = pointer.y / 100
    const pointerFromLeft = pointer.x / 100

    // Holographic gradient angle based on mouse position
    const holoAngle = useMemo(() => {
        return Math.atan2(pointer.y - 50, pointer.x - 50) * (180 / Math.PI) + 90
    }, [pointer.x, pointer.y])

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || !cardRef.current) return

        const rect = cardRef.current.getBoundingClientRect()

        const absolute = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }

        const percent = {
            x: clamp(round((100 / rect.width) * absolute.x)),
            y: clamp(round((100 / rect.height) * absolute.y)),
        }

        const center = {
            x: percent.x - 50,
            y: percent.y - 50,
        }

        // Update states
        setPointer({ x: round(percent.x), y: round(percent.y) })
        setRotate({
            x: round(-(center.x / 2)),  // Increased from /3.5 to /2 for more dramatic effect
            y: round(center.y / 2),
        })
        setBackground({
            x: adjust(percent.x, 0, 100, 37, 63),
            y: adjust(percent.y, 0, 100, 33, 67),
        })
        setGlareOpacity(1)
    }, [interactive])

    const handleMouseEnter = () => {
        setIsHovering(true)
    }

    const handleMouseLeave = () => {
        // Smoothly reset all values
        setPointer({ x: 50, y: 50 })
        setRotate({ x: 0, y: 0 })
        setBackground({ x: 50, y: 50 })
        setGlareOpacity(0)
        setIsHovering(false)
    }

    // CSS variables for the card effects
    const cardStyles = useMemo(() => ({
        '--pointer-x': `${pointer.x}%`,
        '--pointer-y': `${pointer.y}%`,
        '--pointer-from-center': pointerFromCenter,
        '--pointer-from-top': pointerFromTop,
        '--pointer-from-left': pointerFromLeft,
        '--rotate-x': `${rotate.x}deg`,
        '--rotate-y': `${rotate.y}deg`,
        '--background-x': `${background.x}%`,
        '--background-y': `${background.y}%`,
        '--card-opacity': glareOpacity,
        '--holo-angle': `${holoAngle}deg`,
    } as React.CSSProperties), [pointer, pointerFromCenter, pointerFromTop, pointerFromLeft, rotate, background, glareOpacity, holoAngle])

    return (
        <>
            {/* Global styles for card effects - Pokemon TCG inspired */}
            <style jsx global>{`
                @keyframes holo-shimmer {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                
                @keyframes sparkle-twinkle {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
                
                @keyframes reveal-burst {
                    0% { opacity: 0.8; }
                    100% { opacity: 0; }
                }
                
                @keyframes float-sparkle {
                    0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
                    50% { transform: translateY(-8px) scale(1.2); opacity: 0.8; }
                }

                /* Grain texture overlay - adds paper/card texture */
                .pokemon-card-grain {
                    background-image: url('/images/holo-grain.webp');
                    background-size: 150px 150px;
                    background-repeat: repeat;
                    mix-blend-mode: overlay;
                    opacity: 0.4;
                }

                /* Sparkle/glitter texture layer */
                .pokemon-card-sparkle {
                    background-image: url('/images/holo-sparkle.png');
                    background-size: 25%;
                    background-position: 
                        calc(var(--pointer-x) * 0.8) calc(var(--pointer-y) * 0.8);
                    mix-blend-mode: color-dodge;
                    filter: brightness(1.2) contrast(1.5);
                }

                /* Illusion/foil pattern texture */
                .pokemon-card-illusion {
                    background-image: url('/images/holo-illusion.png');
                    background-size: 33%;
                    background-position: 
                        calc(var(--background-x) * 1.5) calc(var(--background-y) * 1.5);
                    mix-blend-mode: exclusion;
                    filter: brightness(0.8) contrast(2) saturate(1.5);
                }

                /* Shimmer shine effect - diagonal light sweep */
                .pokemon-card-shine {
                    background: linear-gradient(
                        115deg,
                        transparent 20%,
                        rgba(255, 255, 255, 0) 30%,
                        rgba(255, 255, 255, 0.5) 45%,
                        rgba(255, 255, 255, 0.8) 50%,
                        rgba(255, 255, 255, 0.5) 55%,
                        rgba(255, 255, 255, 0) 70%,
                        transparent 80%
                    );
                    background-size: 250% 250%;
                    background-position: var(--background-x) var(--background-y);
                    mix-blend-mode: soft-light;
                }

                /* Glare/spotlight at cursor position */
                .pokemon-card-glare {
                    background: radial-gradient(
                        farthest-corner circle at var(--pointer-x) var(--pointer-y),
                        hsla(0, 0%, 100%, 0.8) 10%,
                        hsla(0, 0%, 100%, 0.65) 20%,
                        hsla(0, 0%, 0%, 0.5) 90%
                    );
                    mix-blend-mode: overlay;
                }

                /* Rainbow holographic gradient */
                .pokemon-card-holo {
                    --red: #f80e35;
                    --yellow: #eedf10;
                    --green: #21e985;
                    --blue: #0dbde9;
                    --violet: #c929f1;
                    
                    background-image:
                        repeating-linear-gradient(
                            110deg,
                            var(--violet), var(--blue), var(--green), var(--yellow), var(--red),
                            var(--violet), var(--blue), var(--green), var(--yellow), var(--red),
                            var(--violet), var(--blue), var(--green), var(--yellow), var(--red)
                        ),
                        repeating-linear-gradient(
                            90deg,
                            #222 0px, #222 1px,
                            #444 1px, #444 2px
                        );
                    background-position: 
                        calc(((50% - var(--background-x)) * 2.6) + 50%) calc(((50% - var(--background-y)) * 3.5) + 50%),
                        center center;
                    background-size: 400% 400%, cover;
                    background-blend-mode: overlay;
                    mix-blend-mode: color-dodge;
                    filter: brightness(1.1) contrast(1.1) saturate(1.2);
                }

                /* Foil texture with vertical bars (sunpillar effect) */
                .pokemon-card-foil {
                    --space: 5%;
                    background-image: 
                        repeating-linear-gradient(
                            0deg,
                            hsla(2, 100%, 73%, 0.3) calc(var(--space)*1),
                            hsla(53, 100%, 69%, 0.3) calc(var(--space)*2),
                            hsla(93, 100%, 69%, 0.3) calc(var(--space)*3),
                            hsla(176, 100%, 76%, 0.3) calc(var(--space)*4),
                            hsla(228, 100%, 74%, 0.3) calc(var(--space)*5),
                            hsla(283, 100%, 73%, 0.3) calc(var(--space)*6),
                            hsla(2, 100%, 73%, 0.3) calc(var(--space)*7)
                        ),
                        repeating-linear-gradient(
                            133deg,
                            #0e152e 0%,
                            hsl(180, 10%, 60%) 3.8%,
                            hsl(180, 29%, 66%) 4.5%,
                            hsl(180, 10%, 60%) 5.2%,
                            #0e152e 10%,
                            #0e152e 12%
                        );
                    background-size: 200% 700%, 300% 100%;
                    background-position: 
                        0% var(--background-y),
                        calc(var(--background-x) + (var(--background-y) * 0.2)) var(--background-y);
                    background-blend-mode: hue, hard-light;
                    mix-blend-mode: color-dodge;
                    filter: brightness(calc((var(--pointer-from-center) * 0.4) + 0.6)) contrast(1.4) saturate(2);
                }

                /* Extra glare layer with high contrast */
                .pokemon-card-glare-after {
                    background-image: radial-gradient(
                        farthest-corner circle at var(--pointer-x) var(--pointer-y),
                        hsl(180, 100%, 95%) 5%,
                        hsla(0, 0%, 39%, 0.25) 55%,
                        hsla(0, 0%, 0%, 0.36) 110%
                    );
                    mix-blend-mode: overlay;
                    filter: brightness(0.6) contrast(3);
                }
            `}</style>

            <div
                className="perspective-1000"
                style={{ perspective: '1200px' }}
            >
                <div
                    ref={cardRef}
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className={`
                        relative w-full max-w-md cursor-pointer
                        transition-transform duration-300 ease-out
                    `}
                    style={{
                        ...cardStyles,
                        transform: `
                            rotateX(${rotate.y}deg) 
                            rotateY(${rotate.x}deg) 
                            ${isHovering ? 'translateZ(30px) scale(1.02)' : 'translateZ(0) scale(1)'}
                        `,
                        transformStyle: 'preserve-3d',
                    }}
                >
                    {/* Resting state border (original style) */}
                    <div
                        className={`absolute -inset-[3px] rounded-2xl bg-gradient-to-br from-white/20 to-white/5 transition-opacity duration-500 ${isHovering ? 'opacity-0' : 'opacity-100'}`}
                        style={{ transform: 'translateZ(-1px)' }}
                    />

                    {/* Subtle holographic border glow - like Pokemon cards */}
                    <div
                        className={`
                            absolute -inset-[2px] rounded-2xl transition-opacity duration-500
                            ${isHovering ? 'opacity-60' : 'opacity-0'}
                        `}
                        style={{
                            background: `
                                linear-gradient(
                                    ${holoAngle}deg,
                                    rgba(255, 0, 170, 0.4) 0%,
                                    rgba(0, 255, 255, 0.4) 25%,
                                    rgba(255, 255, 0, 0.4) 50%,
                                    rgba(0, 255, 136, 0.4) 75%,
                                    rgba(255, 0, 170, 0.4) 100%
                                )
                            `,
                            filter: 'blur(4px)',
                            backgroundSize: '200% 200%',
                            backgroundPosition: `${background.x}% ${background.y}%`,
                        }}
                    />

                    {/* Main card */}
                    <div
                        className="relative bg-brand-navy border-2 border-black/80 rounded-2xl overflow-hidden shadow-[0_15px_35px_-5px_rgba(0,0,0,0.5)]"
                        style={{
                            transform: 'translateZ(0)',
                            boxShadow: isHovering
                                ? '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(224, 241, 70, 0.2)'
                                : '0 15px 35px -5px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {/* === EFFECT LAYERS BASED ON RARITY effectType === */}

                        {/* COMMON: Just a subtle shine, no holo effects */}
                        {rarityConfig.effectType === 'none' && (
                            <div
                                className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                style={{
                                    zIndex: 5,
                                    opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest
                                }}
                            />
                        )}

                        {/* REVERSE HOLO: Foil pattern without rainbow */}
                        {rarityConfig.effectType === 'reverse' && (
                            <>
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-foil"
                                    style={{
                                        zIndex: 5,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                    style={{
                                        zIndex: 6,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.8 : rarityConfig.intensity.rest * 0.5
                                    }}
                                />
                            </>
                        )}

                        {/* HOLOFOIL: Standard rainbow holographic */}
                        {rarityConfig.effectType === 'holofoil' && (
                            <>
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-holo"
                                    style={{
                                        zIndex: 5,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                    style={{
                                        zIndex: 6,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.6 : rarityConfig.intensity.rest * 0.4
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-sparkle"
                                    style={{
                                        zIndex: 7,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.5 : rarityConfig.intensity.rest * 0.3
                                    }}
                                />
                            </>
                        )}

                        {/* AMAZING RARE: Deep sparkle with foil and color shifting */}
                        {rarityConfig.effectType === 'amazing' && (
                            <>
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-holo"
                                    style={{
                                        zIndex: 5,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.8 : rarityConfig.intensity.rest * 0.6
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-sparkle"
                                    style={{
                                        zIndex: 6,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest * 0.8
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-illusion"
                                    style={{
                                        zIndex: 7,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.6 : rarityConfig.intensity.rest * 0.4
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                    style={{
                                        zIndex: 8,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.7 : rarityConfig.intensity.rest * 0.5
                                    }}
                                />
                            </>
                        )}

                        {/* RADIANT: Metallic bar pattern with strong contrast */}
                        {rarityConfig.effectType === 'radiant' && (
                            <>
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-holo"
                                    style={{
                                        zIndex: 5,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.7 : rarityConfig.intensity.rest * 0.5
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-foil"
                                    style={{
                                        zIndex: 6,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest * 0.8,
                                        filter: 'brightness(1.2) saturate(1.5)'
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-sparkle"
                                    style={{
                                        zIndex: 7,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.8 : rarityConfig.intensity.rest * 0.6
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                    style={{
                                        zIndex: 8,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.9 : rarityConfig.intensity.rest * 0.7
                                    }}
                                />
                            </>
                        )}

                        {/* RAINBOW RARE: Full spectrum maximum effects */}
                        {rarityConfig.effectType === 'rainbow' && (
                            <>
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-holo"
                                    style={{
                                        zIndex: 5,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest,
                                        filter: 'saturate(1.5) brightness(1.1)'
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-foil"
                                    style={{
                                        zIndex: 6,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.8 : rarityConfig.intensity.rest * 0.6
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-sparkle"
                                    style={{
                                        zIndex: 7,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest * 0.8
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-500 rounded-2xl overflow-hidden pokemon-card-illusion"
                                    style={{
                                        zIndex: 8,
                                        opacity: isHovering ? rarityConfig.intensity.hover * 0.7 : rarityConfig.intensity.rest * 0.5
                                    }}
                                />
                                <div
                                    className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-2xl overflow-hidden pokemon-card-shine"
                                    style={{
                                        zIndex: 9,
                                        opacity: isHovering ? rarityConfig.intensity.hover : rarityConfig.intensity.rest * 0.8
                                    }}
                                />
                            </>
                        )}

                        {/* Glare/spotlight at cursor - for all tiers except common */}
                        {rarityConfig.effectType !== 'none' && (
                            <div
                                className="absolute inset-0 pointer-events-none transition-opacity duration-200 rounded-2xl overflow-hidden pokemon-card-glare"
                                style={{
                                    zIndex: 10,
                                    opacity: isHovering ? 0.3 : 0
                                }}
                            />
                        )}

                        {/* Hotspot at cursor */}
                        <div
                            className="absolute inset-0 pointer-events-none transition-opacity duration-200"
                            style={{
                                background: `
                                    radial-gradient(
                                        circle at ${pointer.x}% ${pointer.y}%,
                                        rgba(255, 255, 255, 0.9) 0%,
                                        rgba(255, 255, 255, 0.4) 20%,
                                        transparent 50%
                                    )
                                `,
                                mixBlendMode: 'overlay',
                                zIndex: 11,
                                opacity: isHovering ? 0.4 : 0
                            }}
                        />

                        {/* Grain texture for paper feel */}
                        <div
                            className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden pokemon-card-grain"
                            style={{ zIndex: 12 }}
                        />

                        {/* Card content */}
                        <div className="relative p-6 z-20">
                            {variant === 'team' && teamData && (
                                <TeamCardContent data={teamData} />
                            )}
                            {variant === 'user' && userData && (
                                <UserCardContent data={userData} />
                            )}
                        </div>

                        {/* Bottom accent bar with enhanced holographic effect */}
                        <div className="h-2 relative z-20 overflow-hidden">
                            {/* Base gradient bar */}
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(90deg, #e0f146 0%, #ffd700 50%, #e0f146 100%)'
                                }}
                            />

                            {/* Holographic shimmer on bar */}
                            <div
                                className={`
                                    absolute inset-0 transition-opacity duration-300
                                    ${isHovering ? 'opacity-100' : 'opacity-0'}
                                `}
                                style={{
                                    background: `
                                        linear-gradient(
                                            90deg,
                                            transparent 0%,
                                            rgba(255, 255, 255, 0.9) ${pointer.x - 15}%,
                                            rgba(255, 255, 255, 1) ${pointer.x}%,
                                            rgba(255, 255, 255, 0.9) ${pointer.x + 15}%,
                                            transparent 100%
                                        )
                                    `,
                                    mixBlendMode: 'overlay'
                                }}
                            />

                            {/* Rainbow shimmer on bar */}
                            <div
                                className={`
                                    absolute inset-0 transition-opacity duration-300
                                    ${isHovering ? 'opacity-50' : 'opacity-0'}
                                `}
                                style={{
                                    background: `
                                        linear-gradient(
                                            90deg,
                                            #ff00aa 0%,
                                            #00ffff 25%,
                                            #ffff00 50%,
                                            #00ff88 75%,
                                            #ff00aa 100%
                                        )
                                    `,
                                    backgroundSize: '200% 100%',
                                    backgroundPosition: `${pointer.x * 2}% 0`,
                                    mixBlendMode: 'color-dodge'
                                }}
                            />
                        </div>
                    </div>

                    {/* Floating sparkles - enhanced Pokemon style */}
                    {isHovering && (
                        <>
                            <Sparkles
                                className="absolute -top-5 -right-5 w-10 h-10 text-brand-yellow"
                                style={{
                                    transform: 'translateZ(50px)',
                                    filter: 'drop-shadow(0 0 12px rgba(224, 241, 70, 1))',
                                    animation: 'float-sparkle 2s ease-in-out infinite'
                                }}
                            />
                            <Sparkles
                                className="absolute -bottom-3 -left-5 w-7 h-7 text-cyan-400"
                                style={{
                                    transform: 'translateZ(35px)',
                                    filter: 'drop-shadow(0 0 10px rgba(0, 255, 255, 1))',
                                    animation: 'float-sparkle 2s ease-in-out infinite 0.5s'
                                }}
                            />
                            <Sparkles
                                className="absolute top-1/2 -right-7 w-8 h-8 text-pink-400"
                                style={{
                                    transform: 'translateZ(40px)',
                                    filter: 'drop-shadow(0 0 10px rgba(255, 0, 170, 1))',
                                    animation: 'float-sparkle 2s ease-in-out infinite 1s'
                                }}
                            />
                            <Sparkles
                                className="absolute top-1/4 -left-6 w-6 h-6 text-yellow-300"
                                style={{
                                    transform: 'translateZ(32px)',
                                    filter: 'drop-shadow(0 0 8px rgba(255, 255, 0, 1))',
                                    animation: 'float-sparkle 2s ease-in-out infinite 1.5s'
                                }}
                            />
                        </>
                    )}
                </div>
            </div>
        </>
    )
}

// Team card content
function TeamCardContent({ data }: { data: TeamCardData }) {
    return (
        <div className="space-y-3">
            {/* Card illustration - Pokemon style */}
            <div className="relative -mx-2 -mt-2 mb-3">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-inner">
                    <img
                        src="/images/card-team-illustration.png"
                        alt="Team Spirit Guardian"
                        className="w-full h-full object-cover"
                    />
                    {/* Holographic overlay on image */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                            mixBlendMode: 'overlay'
                        }}
                    />
                </div>
            </div>

            {/* Header with logo and name */}
            <div className="flex items-center gap-3">
                {data.imageUrl ? (
                    <img
                        src={data.imageUrl}
                        alt={data.name}
                        className="w-12 h-12 rounded-lg border-2 border-brand-yellow object-cover shadow-lg"
                    />
                ) : (
                    <div className="w-12 h-12 rounded-lg border-2 border-brand-yellow bg-brand-yellow/20 flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-brand-yellow" />
                    </div>
                )}
                <div className="flex-1">
                    <h2 className="text-xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg leading-tight">
                        {data.name}
                    </h2>
                    <p className="text-brand-yellow text-xs font-bold uppercase tracking-wider">Team Guardian</p>
                </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
                <StatBox
                    icon={<Trophy className="w-4 h-4 text-brand-yellow" />}
                    label="Points"
                    value={data.totalPoints.toLocaleString()}
                />
                <StatBox
                    icon={<Users className="w-4 h-4 text-brand-yellow" />}
                    label="Members"
                    value={data.memberCount.toString()}
                />
                <StatBox
                    icon={<TreePine className="w-4 h-4 text-green-400" />}
                    label="Trees"
                    value={data.treesPlanted?.toLocaleString() || '0'}
                />
            </div>

            {/* IdleForest branding */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                <span className="text-base">🌲</span>
                <span className="text-white/70 text-xs font-bold tracking-wider uppercase">IdleForest</span>
            </div>
        </div>
    )
}

// User card content
function UserCardContent({ data }: { data: UserCardData }) {
    return (
        <div className="space-y-3">
            {/* Card illustration - Pokemon style */}
            <div className="relative -mx-2 -mt-2 mb-3">
                <div className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-white/20 shadow-inner">
                    <img
                        src="/images/card-user-illustration.png"
                        alt="Forest Guardian Sprite"
                        className="w-full h-full object-cover"
                    />
                    {/* Holographic overlay on image */}
                    <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)',
                            mixBlendMode: 'overlay'
                        }}
                    />
                </div>
            </div>

            {/* Header with name */}
            <div>
                <h2 className="text-xl font-extrabold text-white uppercase tracking-tight drop-shadow-lg leading-tight">
                    {data.displayName}
                </h2>
                <p className="text-brand-yellow text-xs font-bold uppercase tracking-wider">
                    {data.team ? `Team ${data.team.name}` : 'Forest Guardian'}
                </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-2">
                <StatBox
                    icon={<Trophy className="w-4 h-4 text-brand-yellow" />}
                    label="Points"
                    value={data.totalPoints.toLocaleString()}
                />
                <StatBox
                    icon={<TreePine className="w-4 h-4 text-green-400" />}
                    label="Trees"
                    value={data.treesPlanted.toLocaleString()}
                />
                <StatBox
                    icon={<Award className="w-4 h-4 text-purple-400" />}
                    label="Badges"
                    value={data.badgeCount?.toString() || '0'}
                />
            </div>

            {/* Team link if exists */}
            {data.team && (
                <Link
                    href={`/teams/${data.team.slug}`}
                    className="block text-center text-xs text-white/60 hover:text-brand-yellow transition-colors font-medium"
                >
                    View Team →
                </Link>
            )}

            {/* IdleForest branding */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/10">
                <span className="text-base">🌲</span>
                <span className="text-white/70 text-xs font-bold tracking-wider uppercase">IdleForest</span>
            </div>
        </div>
    )
}

// Reusable stat box with enhanced styling
function StatBox({
    icon,
    label,
    value
}: {
    icon: React.ReactNode
    label: string
    value: string
}) {
    return (
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10 shadow-inner">
            <div className="flex justify-center mb-1">{icon}</div>
            <p className="text-white font-bold text-lg drop-shadow">{value}</p>
            <p className="text-white/50 text-xs uppercase tracking-wider font-medium">{label}</p>
        </div>
    )
}
