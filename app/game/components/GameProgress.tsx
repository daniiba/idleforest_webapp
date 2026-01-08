import { memo } from "react";
import { motion } from "framer-motion";

interface GameProgressProps {
    lifetimeTrees: number;
}

const GameProgress = memo(function GameProgress({ lifetimeTrees }: GameProgressProps) {
    const getProgressToNextStage = () => {
        const STAGE_2 = 1000000;
        const STAGE_3 = 1000000000000;

        if (lifetimeTrees >= STAGE_3) return 100;
        if (lifetimeTrees >= STAGE_2) return ((lifetimeTrees - STAGE_2) / (STAGE_3 - STAGE_2)) * 100;
        return (lifetimeTrees / STAGE_2) * 100;
    };

    const getStageLabel = () => {
        if (lifetimeTrees >= 1000000000000) return "Mature Tree";
        if (lifetimeTrees >= 1000000) return "Young Tree";
        return "Sprout";
    };

    return (
        <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
            <div className="flex justify-between text-xs font-bold text-white uppercase tracking-widest mb-1 drop-shadow-md">
                <span>Stage: {getStageLabel()}</span>
                <span>Next Stage: {Math.floor(getProgressToNextStage())}%</span>
            </div>
            <div className="h-4 bg-black/50 border-2 border-white/30 backdrop-blur rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-brand-yellow"
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgressToNextStage()}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
});

export default GameProgress;
