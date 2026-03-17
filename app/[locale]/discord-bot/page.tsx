import BotLandingPage from "@/components/landing/BotLandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Discord Bot | IdleForest - Grow Your Server's Forest",
    description: "Add the IdleForest bot to your Discord server, connect your team, and have members download the IdleForest desktop app to grow your forest live in Discord.",
};

export default function Page() {
    return <BotLandingPage />;
}
