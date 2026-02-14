"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    CheckCircle2,
    Users,
    Trophy,
    Zap,
    MessageSquare,
    Layout,
    Bot,
    ArrowRight,
    TreePine,
    Globe,
    ShieldCheck
} from "lucide-react";
import Navigation from "@/components/navigation";
import { useEffect, useState } from "react";
import { ReviewsSection } from "@/components/reviews-section";
import { supabase } from "@/lib/supabase/client";

interface DiscordTeam {
    id: string;
    name: string;
    image_url: string | null;
}

// Replace with actual bot invitation link when available
const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1471135568690806825";

export default function BotLandingPage() {
    const [stats, setStats] = useState({
        totalServers: "0",
        treesPlanted: "0",
        activeUsers: "0",
    });
    const [discordTeams, setDiscordTeams] = useState<DiscordTeam[]>([]);

    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                // 1. Fetch Discord teams and server count from Supabase
                const { data: teamsData, count: serverCount, error: teamsError } = await supabase
                    .from('teams')
                    .select('id, name, image_url', { count: 'exact' })
                    .not('discord_guild_id', 'is', null)
                    .limit(5);

                if (teamsData && !teamsError) {
                    setDiscordTeams(teamsData);
                }

                // 2. Fetch user count from Supabase profiles table
                const { count: userCount, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id', { count: 'exact', head: true });

                // 3. Fetch global stats from Lambda for trees
                const statsResponse = await fetch(
                    "https://fcgv4rovovvlixqc2a7qncvev40dbxsy.lambda-url.us-east-1.on.aws/?publicKey=8418f448"
                );

                const statsData = await statsResponse.json();

                // Calculate trees planted (using the established formula)
                const earningsNum = parseFloat(String(statsData.earnings).replace("$", "")) + 25;
                const treesPlantedNum = Math.floor((earningsNum - 205) / 0.55) + 652;

                const formatNumber = (num: number) => {
                    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M+";
                    if (num >= 1000) return (num / 1000).toFixed(1) + "k+";
                    return num.toString();
                };

                setStats({
                    totalServers: serverCount ? serverCount.toLocaleString() : "0",
                    treesPlanted: formatNumber(treesPlantedNum),
                    activeUsers: formatNumber(userCount || 0),
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchAllStats();
        const interval = setInterval(fetchAllStats, 60000); // Refresh every minute

        // Clarity tracking if needed
        if (typeof window !== "undefined" && window.clarity) {
            window.clarity("set", "page_type", "discord_bot");
        }

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-brand-gray text-white selection:bg-brand-yellow selection:text-black">
            <Navigation />

            <main>
                {/* HERO SECTION */}
                <section className="relative pt-20 pb-32 overflow-hidden">
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-8 animate-in fade-in slide-in-from-left duration-1000">

                                <h1 className="font-candu text-black uppercase text-[42px] sm:text-6xl md:text-7xl leading-[1.05]">
                                    <span className="font-extrabold block">Grow Your </span>
                                    <span className="font-extrabold text-brand-navy">Server's Forest</span>
                                </h1>
                                <p className="text-lg md:text-xl text-neutral-800 max-w-xl leading-relaxed">
                                    Track your server's environmental impact in real-time. Compete on global leaderboards and turn every message into a tree planted.
                                </p>
                                <div className="flex flex-wrap gap-4 pt-4">
                                    <Button asChild size="lg" className="bg-[#5865F2] hover:bg-[#4752C4] text-white border-2 border-black font-bold h-16 px-8 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all text-xl">
                                        <Link href={BOT_INVITE_URL} target="_blank" rel="noopener noreferrer">
                                            <MessageSquare className="w-6 h-6 mr-2" />
                                            Add to Discord
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline" size="lg" className="bg-white hover:bg-neutral-50 text-black border-2 border-black font-bold h-16 px-8 rounded-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all text-xl">
                                        <Link href="#features">
                                            Explore Features
                                        </Link>
                                    </Button>
                                </div>
                                <div className="flex items-center gap-6 pt-6">
                                    <div className="flex -space-x-3">
                                        {discordTeams.length > 0 ? (
                                            discordTeams.map((team) => (
                                                <div key={team.id} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 overflow-hidden relative" title={team.name}>
                                                    <Image
                                                        src={team.image_url || "/logo.png"}
                                                        alt={team.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))
                                        ) : (
                                            [1, 2, 3, 4].map(i => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-neutral-200 overflow-hidden">
                                                    <Image src={`/reviews/avatar_${i}.jpg`} alt="" width={40} height={40} />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-600 font-medium">
                                        Joined by <span className="text-black font-bold">{stats.totalServers}</span> servers this month
                                    </p>
                                </div>
                            </div>

                            <div className="relative lg:h-[600px] flex items-center justify-center animate-in fade-in zoom-in duration-1000 delay-300">
                                <div className="relative w-full max-w-md aspect-square bg-brand-yellow rounded-3xl border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                    <div className="p-8 h-full flex flex-col justify-between relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
                                                <TreePine className="text-brand-yellow w-7 h-7" />
                                            </div>
                                            <div className="flex gap-1">
                                                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white/80 backdrop-blur-sm border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="font-bold text-black text-sm uppercase">Server Ranking</span>
                                                    <Trophy className="w-4 h-4 text-brand-yellow fill-brand-yellow stroke-black" />
                                                </div>
                                                <div className="text-2xl font-black text-brand-navy">#1 WORLDWIDE</div>
                                            </div>

                                            <div className="bg-brand-navy p-4 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-white">
                                                <div className="text-xs uppercase font-bold text-brand-yellow mb-1">Impact Level</div>
                                                <div className="flex items-end justify-between">
                                                    <div className="text-3xl font-black">12,482</div>
                                                    <div className="text-sm font-bold text-brand-yellow">TREES</div>
                                                </div>
                                                <div className="w-full h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
                                                    <div className="w-3/4 h-full bg-brand-yellow"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Lottie or Animation would go here */}
                                    <div className="absolute bottom-[-20%] right-[-10%] opacity-20">
                                        <Bot className="w-64 h-64 text-black" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 bg-[radial-gradient(circle_at_70%_20%,rgba(24ACC,204,0,0.15),transparent_40%)]"></div>
                </section>

                {/* STATS STRIP */}
                <section className="bg-brand-navy border-y-4 border-black py-12 relative z-20">
                    <div className="container mx-auto px-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0">
                            <div className="text-center md:border-r-2 md:border-white/10">
                                <div className="text-4xl md:text-5xl font-black text-brand-yellow mb-2">{stats.totalServers}</div>
                                <div className="text-sm uppercase tracking-widest font-bold text-white/60">Servers Onboarded</div>
                            </div>
                            <div className="text-center md:border-r-2 md:border-white/10">
                                <div className="text-4xl md:text-5xl font-black text-brand-yellow mb-2">{stats.treesPlanted}</div>
                                <div className="text-sm uppercase tracking-widest font-bold text-white/60">Total Trees Funded</div>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl md:text-5xl font-black text-brand-yellow mb-2">{stats.activeUsers}</div>
                                <div className="text-sm uppercase tracking-widest font-bold text-white/60">Active Tree Planters</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FEATURES SECTION */}
                <section id="features" className="py-32 bg-white text-black">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-20">
                            <h2 className="font-candu text-5xl md:text-6xl font-extrabold uppercase mb-6">Built for Discord Communities</h2>
                            <p className="text-xl text-neutral-600">The first-ever Discord bot that rewards community activity with real-world reforestation.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<Zap className="w-8 h-8" />}
                                title="Instant Impact"
                                description="Real-time tracking of trees planted by your server members through our app and extension."
                                delay={0}
                            />
                            <FeatureCard
                                icon={<Trophy className="w-8 h-8" />}
                                title="Leaderboards"
                                description="Compete against other Discord servers. See who has the greenest community on the platform."
                                delay={100}
                            />
                            <FeatureCard
                                icon={<Users className="w-8 h-8" />}
                                title="Member Synergy"
                                description="Connect your server members to a singular goal. Every member's contribution counts towards the total."
                                delay={200}
                            />
                            <FeatureCard
                                icon={<Layout className="w-8 h-8" />}
                                title="Visual Forest"
                                description="Generate beautiful forest maps and impact reports directly in your Discord channels."
                                delay={300}
                            />
                            <FeatureCard
                                icon={<MessageSquare className="w-8 h-8" />}
                                title="Engagement Tips"
                                description="Incentivize activity with unique ranks based on environmental contribution."
                                delay={400}
                            />
                            <FeatureCard
                                icon={<Globe className="w-8 h-8" />}
                                title="Global Impact"
                                description="We partner with verified reforestation heroes to ensure every tree counts."
                                delay={500}
                            />
                        </div>
                    </div>
                </section>

                {/* INTERFACE SHOWCASE SECTION */}
                <section className="py-24 bg-neutral-100 overflow-hidden border-b-4 border-black">
                    <div className="container mx-auto px-6">
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="font-candu text-4xl text-brand-navy md:text-5xl font-extrabold uppercase mb-6">Experience the Integration</h2>
                            <p className="text-xl text-neutral-600">See how IdleForest brings your server's impact to life with beautiful, interactive interfaces.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 items-center">
                            <div className="relative group animate-in fade-in slide-in-from-bottom duration-700">
                                <div className="absolute -inset-2 bg-brand-yellow rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative bg-white border-4 border-black rounded-3xl p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                    <Image
                                        src="/landing/discord/screenshot1.png"
                                        alt="Discord Bot Interface 1"
                                        width={600}
                                        height={400}
                                        className="rounded-2xl w-full h-auto"
                                    />
                                </div>
                            </div>
                            <div className="relative group animate-in fade-in slide-in-from-bottom duration-700 delay-100">
                                <div className="absolute -inset-2 bg-brand-navy rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
                                <div className="relative bg-white border-4 border-black rounded-3xl p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                    <Image
                                        src="/landing/discord/screenshot2.png"
                                        alt="Discord Bot Interface 2"
                                        width={600}
                                        height={400}
                                        className="rounded-2xl w-full h-auto"
                                    />
                                </div>
                            </div>
                            <div className="relative group animate-in fade-in slide-in-from-bottom duration-700 delay-200">
                                <div className="absolute -inset-2 bg-brand-yellow rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                                <div className="relative bg-white border-4 border-black rounded-3xl p-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                    <Image
                                        src="/landing/discord/screenshot3.png"
                                        alt="Discord Bot Interface 3"
                                        width={600}
                                        height={400}
                                        className="rounded-2xl w-full h-auto"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section className="py-32 bg-brand-yellow text-black border-y-4 border-black">
                    <div className="container mx-auto px-6">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="font-candu text-5xl md:text-6xl font-extrabold uppercase mb-16 text-center">3 Steps to start</h2>

                            <div className="space-y-12">
                                <StepItem
                                    number="01"
                                    title="Add the Bot"
                                    description="Click the 'Add to Discord' button to invite IdleForest to your server. No complex configuration needed."
                                />
                                <StepItem
                                    number="02"
                                    title="Connect Members"
                                    description="Members use the IdleForest desktop app or browser extension to fund trees while their computers are idle."
                                />
                                <StepItem
                                    number="03"
                                    title="Watch it Grow"
                                    description="Receive daily impact reports and see your server climb the global leaderboards."
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA SECTION */}
                <section className="py-40 relative overflow-hidden bg-brand-navy text-white">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(24ACC,204,0,0.4),transparent_70%)]"></div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10 text-center">
                        <h2 className="font-candu text-[42px] md:text-7xl font-extrabold uppercase mb-8 leading-tight">
                            Make Your Server <br /> <span className="text-brand-yellow">One in a Million</span>
                        </h2>
                        <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto mb-12">
                            Join the growing ecosystem of Discord servers making a tangible difference for our planet.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                            <Button asChild size="lg" className="w-full sm:w-auto bg-[#5865F2] hover:bg-[#4752C4] text-white border-2 border-white font-bold h-16 px-12 rounded-full shadow-[8px_8px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none transition-all text-xl">
                                <Link href={BOT_INVITE_URL} target="_blank" rel="noopener noreferrer">
                                    <MessageSquare className="w-6 h-6 mr-2" />
                                    Add to Discord
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent hover:bg-white/10 text-white border-2 border-white font-bold h-16 px-12 rounded-full shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none transition-all text-xl">
                                <Link href="/">
                                    Learn About IdleForest
                                </Link>
                            </Button>
                        </div>

                    </div>
                </section>

                <ReviewsSection />
            </main>


        </div>
    );
}

function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode, title: string, description: string, delay: number }) {
    return (
        <Card className="p-8 bg-neutral-50 border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            <div className="w-16 h-16 bg-brand-yellow border-2 border-black rounded-xl flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {icon}
            </div>
            <h3 className="font-candu text-2xl font-extrabold uppercase mb-4">{title}</h3>
            <p className="text-neutral-600 leading-relaxed">{description}</p>
        </Card>
    );
}

function StepItem({ number, title, description }: { number: string, title: string, description: string }) {
    return (
        <div className="flex gap-8 group">
            <div className="flex-shrink-0 text-5xl md:text-7xl font-black text-black/10 group-hover:text-black transition-colors duration-500 font-rethink-sans">
                {number}
            </div>
            <div className="pt-2 md:pt-4">
                <h3 className="font-candu text-3xl font-extrabold uppercase mb-3">{title}</h3>
                <p className="text-lg text-neutral-800 leading-relaxed max-w-xl">{description}</p>
            </div>
        </div>
    );
}
