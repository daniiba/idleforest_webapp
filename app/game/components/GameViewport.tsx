import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import SpriteAnimation, { AnimationSequence } from "@/components/SpriteAnimation";
import { FloatingText, Particle } from "../types";
import { GameState } from "../reducer";
import { GoldenAppleState } from "../data";
import { GoldenApple } from "./GoldenApple";

// Extracted Components
import GameBackground from "./GameBackground";
import GameHUD from "./GameHUD";
import GameProgress from "./GameProgress";

// Animations
const CHARACTER_ANIMATIONS: Record<string, AnimationSequence> = {
    idle: { startFrame: 0, endFrame: 10, loop: true, fps: 12 }, // Sheet 4
    react: { startFrame: 0, endFrame: 29, loop: false, fps: 24 }, // Sheet 5
    dance: { startFrame: 24, endFrame: 35, loop: true, fps: 12 },  // Sheet 4
};

interface GameViewportProps {
    state: GameState;
    stats: {
        baseClickPercent: number;
        techGlobalClickMult: number;
        finalAutoProduction: number;
        finalClickPower: number;
    };
    onTreeClick: () => void;
    handlePrestigeClick: () => void;
    showPrestigeModal: boolean;
    userDisplayName: string | null;
    children?: React.ReactNode;
    goldenAppleState: GoldenAppleState;
    onAppleClick: () => void;
}

export function GameViewport({ state, stats, onTreeClick, handlePrestigeClick, showPrestigeModal, userDisplayName, children, goldenAppleState, onAppleClick }: GameViewportProps) {
    const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
    const [particles, setParticles] = useState<Particle[]>([]);

    // Throttling Ref
    const lastParticleTimeRef = useRef(0);

    // Character Animation State
    const [isReacting, setIsReacting] = useState(false);
    const [clickTrigger, setClickTrigger] = useState(0);

    const { finalAutoProduction, finalClickPower } = stats;

    const handleAnimationComplete = useCallback((animName: string) => {
        if (animName === 'react') {
            setIsReacting(false);
        }
    }, []);

    const getCurrentAnimation = () => {
        if (isReacting) return 'react';
        if (finalAutoProduction > 10) return 'dance';
        return 'idle';
    };

    const handleTreeInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        // ALWAYS trigger game logic and character reaction
        onTreeClick();
        setIsReacting(true);
        setClickTrigger(prev => prev + 1);

        // THROTTLE Particles & Floating Text (Visuals only)
        const now = Date.now();
        if (now - lastParticleTimeRef.current < 40) { // Limit to ~25fps visual spawns
            return;
        }
        lastParticleTimeRef.current = now;

        // Visuals Calculation
        const rect = e.currentTarget.getBoundingClientRect();
        let clientX = rect.left + rect.width / 2;
        let clientY = rect.top + rect.height / 2;

        if ('clientX' in e) {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        } else if ('touches' in e && (e as React.TouchEvent).touches.length > 0) {
            clientX = (e as React.TouchEvent).touches[0].clientX;
            clientY = (e as React.TouchEvent).touches[0].clientY;
        }

        // Add randomized offset
        const randomX = (Math.random() - 0.5) * 40;
        const randomY = (Math.random() - 0.5) * 40;

        const newFloatingText: FloatingText = {
            id: now + Math.random(),
            x: clientX - rect.left + randomX,
            y: clientY - rect.top + randomY,
            value: "+" + (Math.floor(finalClickPower * 10) / 10).toFixed(1)
        };

        setFloatingTexts(prev => {
            if (prev.length > 20) return prev.slice(1); // Cap floating texts
            return [...prev, newFloatingText];
        });

        // Spawn Particles (Confetti Style)
        const newParticles: Particle[] = [];
        const particleCount = 2 + Math.floor(Math.random() * 2); // Reduced to 2-3 particles

        for (let i = 0; i < particleCount; i++) {
            const drift = (Math.random() - 0.5) * 100; // -50 to 50 horizontal drift
            const apex = -100 - Math.random() * 100;   // -100 to -200 up
            const land = 100 + Math.random() * 100;    // 100 to 200 down

            newParticles.push({
                id: now + Math.random(),
                x: clientX - rect.left + (Math.random() - 0.5) * 20, // Start near click
                y: clientY - rect.top + (Math.random() - 0.5) * 20,
                apexY: apex,
                landY: land,
                driftX: drift,
                rotation: Math.random() * 360
            });
        }

        setParticles(prev => {
            if (prev.length > 50) return prev.slice(newParticles.length); // Cap particles
            return [...prev, ...newParticles];
        });

        // Cleanup text and particles
        setTimeout(() => {
            setFloatingTexts(prev => prev.filter(ft => ft.id !== newFloatingText.id));
        }, 1000);
        setTimeout(() => {
            setParticles(prev => prev.filter(p => !newParticles.find(np => np.id === p.id)));
        }, 1600);
    };

    return (
        <div className="relative w-full aspect-square md:aspect-video min-h-[400px] bg-[#87CEEB] border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden cursor-default group touch-manipulation user-select-none">

            {/* OPTIMIZED LAYER 1: Background */}
            <GameBackground
                lifetimeTrees={state.lifetimeTrees}
                finalAutoProduction={finalAutoProduction}
            />

            {/* OPTIMIZED LAYER 2: HUD */}
            <GameHUD
                trees={state.trees}
                finalClickPower={finalClickPower}
                finalAutoProduction={finalAutoProduction}
                baseClickPercent={stats.baseClickPercent}
                techGlobalClickMult={stats.techGlobalClickMult}
                goldenSeeds={state.goldenSeeds}
                activeMultipliers={state.activeMultipliers}
            />

            {/* MODAL OVERLAYS */}
            {children}

            {/* Center Tree - Interactive Layer */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pt-12">
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                    className="relative cursor-pointer flex items-center justify-center pointer-events-auto"
                    onPointerDown={handleTreeInteraction}
                >

                    {userDisplayName === 'Saufbirne2007' ? (
                        <div className="relative w-[256px] h-[256px] z-10 drop-shadow-2xl">
                            <Image
                                src="/saufbirne_avatar.jpg"
                                alt="Saufbirne Avatar"
                                fill
                                className="object-cover rounded-full"
                                priority
                            />
                        </div>
                    ) : (
                        <SpriteAnimation
                            src={getCurrentAnimation() === 'react' ? "/game/spritesheet5.png" : "/game/spritesheet4.png"}
                            frameWidth={2048 / 6}
                            frameHeight={2048 / 6}
                            cols={6}
                            animations={CHARACTER_ANIMATIONS}
                            currentAnimation={getCurrentAnimation()}
                            triggerId={clickTrigger}
                            onAnimationComplete={handleAnimationComplete}
                            scale={0.75}
                            className="drop-shadow-2xl relative z-10 w-[256px] h-[256px]"
                        />
                    )}

                    {/* Ground shadow */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/40 blur-xl rounded-[100%] z-0" />
                </motion.div>
            </div>

            {/* Floating Feedback - Particles Layer */}
            <AnimatePresence>
                {floatingTexts.map(ft => (
                    <motion.div
                        key={ft.id}
                        initial={{ opacity: 1, y: 0, scale: 0.8 }}
                        animate={{ opacity: 0, y: -100, scale: 1.2 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="absolute top-0 left-0 pointer-events-none z-50 font-black text-4xl text-brand-yellow drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] text-stroke-thin"
                        style={{ left: ft.x, top: ft.y }}
                    >
                        {ft.value}
                    </motion.div>
                ))}
                {particles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ x: p.x, y: p.y, opacity: 1, scale: 0.5, rotate: p.rotation }}
                        animate={{
                            x: p.x + p.driftX,
                            y: p.y + p.landY,
                            opacity: 0,
                            rotate: p.rotation + 360
                        }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute top-0 left-0 pointer-events-none z-40"
                    >
                        <Image src="/game/leaf_currency.png" width={24} height={24} alt="" className="w-6 h-6 object-contain" />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Golden Apple Layer */}
            <GoldenApple
                gameState={goldenAppleState}
                onClick={(e: React.MouseEvent) => {
                    // Show Feedback
                    const type = goldenAppleState.type;
                    const text = type === 'frenzy' ? "FRENZY! (x7 Prod)" : "CHAIN! (x777 Click)";

                    const rect = (e.target as HTMLElement).getBoundingClientRect();
                    // Add some randomness to position
                    const randomX = (Math.random() - 0.5) * 40;
                    const randomY = (Math.random() - 0.5) * 40;

                    const newFloatingText: FloatingText = {
                        id: Date.now(),
                        x: (e.clientX || rect.left) - e.currentTarget.getBoundingClientRect().left + randomX, // approximation
                        y: (e.clientY || rect.top) - e.currentTarget.getBoundingClientRect().top + randomY,
                        value: text
                    };

                    // Note: We need to use setFloatingTexts from parent scope
                    // But we can't access it easily here if we inline.
                    // Actually we are inside the component function, so setFloatingTexts is available!

                    // Correcting coordinate logic:
                    // The floating texts are absolute positioned relative to the container.
                    // We need relative coordinates.
                    const containerRect = e.currentTarget.closest('.relative')?.getBoundingClientRect();
                    if (containerRect) {
                        const relX = e.clientX - containerRect.left;
                        const relY = e.clientY - containerRect.top;
                        setFloatingTexts(prev => [
                            ...prev,
                            {
                                id: Date.now(),
                                x: relX,
                                y: relY,
                                value: text
                            }
                        ]);
                    }

                    onAppleClick();
                }}
            />

            {/* OPTIMIZED LAYER 3: Progress Bar */}
            <GameProgress lifetimeTrees={state.lifetimeTrees} />
        </div>
    );
}
