import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Idle Forest Game — Grow a Virtual Forest | IdleForest",
    description:
        "Play the IdleForest idle game — grow a virtual forest, earn points, unlock upgrades, and compete on the leaderboard. Every tree you grow is tracked toward real-world reforestation.",
    openGraph: {
        title: "Idle Forest Game — Grow a Virtual Forest | IdleForest",
        description:
            "Play the IdleForest idle game — grow a virtual forest, earn points, unlock upgrades, and compete on the leaderboard.",
    },
};

export default function GameLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
