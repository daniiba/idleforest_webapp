import BotLandingPage from "@/components/landing/BotLandingPage";
import { Metadata } from "next";
import { buildLocalizedAlternates, getLocalizedUrl } from "@/lib/carbon-routing";
import { DISCORD_BOT_TITLE_BY_LOCALE, getLocaleMeta } from "@/lib/seo-locales";

const description = "Add the IdleForest bot to your Discord server, connect your team, and have members download the IdleForest desktop app to grow your forest live in Discord.";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
    const title = getLocaleMeta(DISCORD_BOT_TITLE_BY_LOCALE, params.locale);

    return {
        title,
        description,
        alternates: buildLocalizedAlternates('/discord-bot', params.locale),
        openGraph: {
            title,
            description,
            url: getLocalizedUrl('/discord-bot', params.locale),
            type: 'website',
        },
    };
}

export default function Page() {
    return <BotLandingPage />;
}
