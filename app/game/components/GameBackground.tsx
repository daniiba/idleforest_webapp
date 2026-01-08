import { memo, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Particle } from "../types";

interface GameBackgroundProps {
    lifetimeTrees: number;
    finalAutoProduction: number;
}

const GameBackground = memo(function GameBackground({ lifetimeTrees, finalAutoProduction }: GameBackgroundProps) {
    const [bgParticles, setBgParticles] = useState<Particle[]>([]);

    // Background Leaves Effect
    useEffect(() => {
        if (finalAutoProduction <= 0) return;

        // Limit maximum particle spawn rate
        const spawnRate = Math.max(100, 5000 / Math.max(1, Math.sqrt(finalAutoProduction)));

        const interval = setInterval(() => {
            const id = Date.now() + Math.random();
            const startX = Math.random() * 100; // Percent
            const duration = 5 + Math.random() * 5; // 5-10s fall time

            setBgParticles(prev => {
                // Limit active background particles to 50 to prevent overflow
                if (prev.length > 50) return prev;
                return [
                    ...prev,
                    {
                        id,
                        x: startX,
                        y: -10, // Start above
                        apexY: 0,
                        landY: 120, // End below (percent)
                        driftX: (Math.random() - 0.5) * 20,
                        rotation: Math.random() * 360
                    }
                ];
            });

            // Cleanup
            setTimeout(() => {
                setBgParticles(prev => prev.filter(p => p.id !== id));
            }, duration * 1000);

        }, spawnRate);

        return () => clearInterval(interval);
    }, [finalAutoProduction]);

    const getBgImage = () => {
        if (lifetimeTrees >= 1000000) return "/game/bg_stage_3.png";
        if (lifetimeTrees >= 50000) return "/game/bg_stage_2.png";
        if (lifetimeTrees >= 1000) return "/game/bg_stage_1.png";
        return "/game/bg_stage_0.png";
    };

    return (
        <div className="absolute inset-0 z-0">
            <Image
                src={getBgImage()}
                alt="World"
                fill
                className="object-cover pixelated scale-[1.02]"
                draggable={false}
                priority
            />

            {/* Background Falling Leaves */}
            <AnimatePresence>
                {bgParticles.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ top: "-10%", left: `${p.x}%`, rotate: p.rotation, opacity: 0 }}
                        animate={{
                            top: "110%",
                            left: `${p.x + p.driftX}%`,
                            rotate: p.rotation + 360,
                            opacity: [0, 1, 1, 0]
                        }}
                        transition={{ duration: 8, ease: "linear" }}
                        className="absolute z-0 pointer-events-none"
                    >
                        <Image src="/game/leaf_currency.png" width={16} height={16} alt="" className="w-4 h-4 object-contain opacity-60" />
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* Ambient Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none" />
        </div>
    );
});

export default GameBackground;
