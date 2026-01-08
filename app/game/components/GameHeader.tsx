import { useState, useEffect } from "react";
import Navigation from "@/components/navigation";

interface GameHeaderProps {
    startTime: number;
    onOpenLeaderboard: () => void;
    onOpenStats: () => void;
}

export function GameHeader({ startTime, onOpenLeaderboard, onOpenStats }: GameHeaderProps) {
    return (
        <div className="flex flex-col gap-8">
            <div className="bg-white border-2 border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                    <h1 className="text-4xl md:text-5xl font-extrabold font-candu uppercase leading-[0.9]">
                        Idle <span className="text-brand-yellow bg-black px-2 mt-1 inline-block">Forest</span>
                    </h1>
                    <p className="text-neutral-600 font-bold mt-2 font-mono text-xs tracking-widest uppercase">
                        Strategic Reforestation
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={onOpenLeaderboard}
                        className="bg-brand-yellow border-2 border-black px-4 py-2 font-candu text-lg uppercase tracking-widest hover:bg-yellow-400 hover:-translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                    >
                        <span>🏆</span>
                        <span className="hidden sm:inline">Leaderboard</span>
                    </button>
                    <button
                        onClick={onOpenStats}
                        className="bg-white border-2 border-black px-4 py-2 font-candu text-lg uppercase tracking-widest hover:bg-neutral-100 hover:-translate-y-0.5 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                        title="Statistics"
                    >
                        <span>📊</span>
                    </button>
                    <div className="text-right hidden sm:block">
                        <div className="text-xs font-bold uppercase tracking-widest text-neutral-400">Current Session</div>
                        <SessionTimer startTime={startTime} />
                    </div>
                </div>
            </div>
        </div>
    );
}

function SessionTimer({ startTime }: { startTime: number }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        setElapsed(Date.now() - startTime);
        const interval = setInterval(() => {
            setElapsed(Date.now() - startTime);
        }, 1000); // 1s update to be safe, though minute precision is fine
        return () => clearInterval(interval);
    }, [startTime]);

    if (elapsed === 0) return <div className="font-mono text-xl font-bold">...</div>;

    return (
        <div className="font-mono text-xl font-bold">{(elapsed / 1000 / 60).toFixed(0)}m Playing</div>
    );
}
