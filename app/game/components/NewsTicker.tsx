import { useEffect, useState, useMemo } from "react";
import { GameState } from "../reducer";
import { GENERIC_NEWS, UNLOCKABLE_NEWS, NewsItem } from "../newsData";

interface NewsTickerProps {
    gameState: GameState;
}

export function NewsTicker({ gameState }: NewsTickerProps) {
    const [currentNews, setCurrentNews] = useState<NewsItem>(GENERIC_NEWS[0]);
    const [isFading, setIsFading] = useState(false);

    // Filter available news based on game state
    const availableNews = useMemo(() => {
        const unlocked = UNLOCKABLE_NEWS.filter(item => item.condition ? item.condition(gameState) : false);
        return [...GENERIC_NEWS, ...unlocked];
    }, [gameState.upgrades]); // Re-calculate when upgrades change

    useEffect(() => {
        const interval = setInterval(() => {
            setIsFading(true);

            // Wait for fade out, then swap text and fade in
            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * availableNews.length);
                setCurrentNews(availableNews[randomIndex]);
                setIsFading(false);
            }, 500); // Half second fade out

        }, 12000); // New headline every 12 seconds

        return () => clearInterval(interval);
    }, [availableNews]);

    return (
        <div className="w-full bg-[#1a1a1a] text-[#d4d4d4] border-b-2 border-black h-10 flex items-center justify-center overflow-hidden relative select-none z-40 shadow-md">
            {/* Background Texture/Pattern could go here */}

            <div
                className={`
                    text-sm md:text-base font-mono transition-opacity duration-500 ease-in-out px-4 text-center
                    ${isFading ? 'opacity-0' : 'opacity-100'}
                `}
            >
                {currentNews.text}
            </div>

            {/* Subtle scanline or vignette effect overlay for retro feel */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-black/20 via-transparent to-black/20"></div>
        </div>
    );
}
