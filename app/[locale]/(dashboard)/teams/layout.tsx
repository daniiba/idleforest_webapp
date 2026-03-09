import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Teams & Rankings — Leaderboards | IdleForest",
    description:
        "Browse IdleForest teams, user rankings, and leaderboards. See the top players and fastest-growing teams contributing to reforestation.",
    openGraph: {
        title: "Teams & Rankings — Leaderboards | IdleForest",
        description:
            "Browse IdleForest teams, user rankings, and leaderboards. See the top contributors to reforestation.",
    },
};

export default function TeamsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
