import type { Metadata } from "next";
import { buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { getLocaleMeta, TEAMS_TITLE_BY_LOCALE } from "@/lib/seo-locales";

const description = "Browse IdleForest teams, user rankings, and leaderboards. See the top players and fastest-growing teams contributing to reforestation.";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    const title = getLocaleMeta(TEAMS_TITLE_BY_LOCALE, params.locale);

    return {
        title,
        description,
        alternates: buildLocalizedAlternates('/teams', params.locale),
        openGraph: {
            title,
            description,
            url: getLocalizedUrl('/teams', params.locale),
            type: "website",
        },
    };
}

export default function TeamsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
