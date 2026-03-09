import BotLandingPage from "@/components/landing/BotLandingPage";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Discord Bot | IdleForest - Grow Your Server's Forest",
    description: "Add the IdleForest bot to your Discord server and track how many trees your community plants. Turn every message into a tree planted.",
};

export default function Page() {
    return <BotLandingPage />;
}
