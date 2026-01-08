import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoldenAppleState } from '../data';
import Image from 'next/image';

interface GoldenAppleProps {
    gameState: GoldenAppleState;
    onClick: (e: React.MouseEvent) => void;
}

export function GoldenApple({ gameState, onClick }: GoldenAppleProps) {
    if (!gameState.active) return null;

    // Different visuals for different types
    const iconPath = gameState.type === 'chain' ? '/game/chain_apple.png' : '/game/golden_apple.png';
    // Fallback if images don't exist yet: Hue rotate
    const hueRotate = gameState.type === 'chain' ? 'hue-rotate(240deg)' : 'hue-rotate(0deg)';

    return (
        <AnimatePresence>
            <motion.div
                key={`apple_${gameState.spawnTime}`}
                // Start off-screen left (-10%), random Y vertical position
                initial={{ left: '-10%', top: `${gameState.y}%`, opacity: 0, rotate: 0 }}
                // Animate to off-screen right (110%)
                animate={{
                    left: '110%',
                    opacity: 1,
                    rotate: 360 * 4 // Spin a few times while flying
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{
                    duration: 20, // 20 seconds to cross
                    ease: "linear",
                    opacity: { duration: 0.5 } // Fade in quickly
                }}
                whileHover={{ scale: 1.2, cursor: 'pointer' }}
                onClick={(e) => {
                    e.stopPropagation(); // prevent tree click underneath
                    onClick(e);
                }}
                className="absolute z-50 w-16 h-16 drop-shadow-[0_0_15px_rgba(255,215,0,0.8)]"
            >
                {/* Visual Representation */}
                <div className="relative w-full h-full animate-pulse">
                    <Image
                        src={iconPath}
                        alt="Golden Apple"
                        fill
                        className="object-contain"
                        style={{ filter: hueRotate }}
                    />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
