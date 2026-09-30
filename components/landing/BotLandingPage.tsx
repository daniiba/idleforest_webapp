"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessageSquare } from "lucide-react";
import Navigation from "@/components/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";
import { BotArt, BoltArt, MedalArt, TrophyArt } from "@/components/landing/DiscordArt";
import { ForestArt } from "@/components/partner/SilveiraArt";
import { CommunityArt } from "@/components/partner/WastefreeArt";
import { FreeArt, HabitatArt, InstallArt, PrivacyArt } from "@/components/partner/MossyEarthArt";

interface DiscordTeam {
    id: string;
    name: string;
    image_url: string | null;
}

// Replace with actual bot invitation link when available
const BOT_INVITE_URL = "https://discord.com/oauth2/authorize?client_id=1471135568690806825";

const discordButton =
    "inline-flex items-center justify-center gap-2 rounded-full bg-[#5865F2] px-7 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#4752C4]";
const secondaryButton =
    "inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-7 py-3.5 text-base font-bold text-brand-navy transition-colors hover:bg-neutral-100";

// Translation strings for these are uppercase in some locales, so normalise to sentence case.
const sentence = "lowercase first-letter:uppercase";

export default function BotLandingPage() {
    const t = useTranslations('DiscordBot');
    const [stats, setStats] = useState({
        totalServers: "0",
        treesPlanted: "0",
        members: "0",
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
                const { count: userCount } = await supabase
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
                    members: formatNumber(userCount || 0),
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

    const features = [
        { art: TrophyArt, title: t('feat_leaderboard_title'), body: t('feat_leaderboard_desc') },
        { art: ForestArt, title: t('feat_forest_title'), body: t('feat_forest_desc') },
        { art: BoltArt, title: t('feat_realtime_title'), body: t('feat_realtime_desc') },
        { art: PrivacyArt, title: t('feat_privacy_title'), body: t('feat_privacy_desc') },
        { art: MedalArt, title: t('feat_badges_title'), body: t('feat_badges_desc') },
        { art: FreeArt, title: t('feat_free_title'), body: t('feat_free_desc') },
    ];

    const steps = [
        { art: BotArt, title: t('step1_title'), body: t('step1_desc') },
        { art: CommunityArt, title: t('step2_title'), body: t('step2_desc') },
        { art: InstallArt, title: t('step3_title'), body: t('step3_desc'), cta: { label: t('step3_cta'), href: "/downloads#desktop-apps" } },
        { art: HabitatArt, title: t('step4_title'), body: t('step4_desc') },
    ];

    const statCards = [
        { value: stats.totalServers, label: t('stats_servers') },
        { value: stats.treesPlanted, label: t('stats_trees') },
        { value: stats.members, label: t('stats_members') },
    ];

    return (
        <div className="min-h-screen bg-[#F7F7F2] text-brand-navy selection:bg-brand-yellow selection:text-black">
            <Navigation />

            <main className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12">
                {/* Hero */}
                <section className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
                    <div>
                        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-neutral-600 ring-1 ring-neutral-200">
                            <span className="h-2 w-2 rounded-full bg-[#5865F2]" aria-hidden />
                            Discord bot
                        </p>
                        <h1 className={`mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl ${sentence}`}>
                            {t('hero_title_line1')} {t('hero_title_line2')}
                        </h1>
                        <p className="mt-5 max-w-lg text-lg leading-7 text-neutral-600">{t('hero_desc')}</p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href={BOT_INVITE_URL} target="_blank" rel="noopener noreferrer" className={discordButton}>
                                <MessageSquare className="h-5 w-5" aria-hidden />
                                {t('add_bot')}
                            </Link>
                            <Link href="#features" className={secondaryButton}>
                                Explore features
                                <ArrowRight className="h-4 w-4" aria-hidden />
                            </Link>
                        </div>
                        <div className="mt-7 flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {(discordTeams.length > 0 ? discordTeams : []).map((team) => (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        key={team.id}
                                        src={team.image_url || "/logo.png"}
                                        alt={team.name}
                                        title={team.name}
                                        className="h-10 w-10 rounded-full border-2 border-[#F7F7F2] bg-neutral-200 object-cover"
                                    />
                                ))}
                            </div>
                            <p className="text-sm text-neutral-600">
                                Used by <span className="font-bold text-brand-navy">{stats.totalServers}</span> Discord servers
                            </p>
                        </div>
                    </div>

                    <figure className="relative">
                        <div className="overflow-hidden rounded-3xl bg-[#1E1F22] p-2 shadow-xl ring-1 ring-black/10 sm:p-3">
                            <Image
                                src="/landing/discord/screenshot1.png"
                                alt="The IdleForest bot posting a global server leaderboard in Discord"
                                width={1490}
                                height={744}
                                priority
                                sizes="(min-width: 1024px) 560px, 100vw"
                                className="h-auto w-full rounded-2xl"
                            />
                        </div>
                        <figcaption className="mt-3 text-center text-xs text-neutral-500">
                            <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-[11px] text-neutral-700 ring-1 ring-neutral-200">/forest top</code>{" "}
                            posts the global server leaderboard.
                        </figcaption>
                    </figure>
                </section>

                {/* Stats */}
                <dl className="grid gap-3 sm:grid-cols-3">
                    {statCards.map((stat) => (
                        <div key={stat.label} className="rounded-2xl border border-neutral-200 bg-white p-5">
                            <dd className="text-3xl font-extrabold tabular-nums tracking-tight">{stat.value}</dd>
                            <dt className={`mt-1 text-sm text-neutral-500 ${sentence}`}>{stat.label}</dt>
                        </div>
                    ))}
                </dl>

                {/* Features */}
                <section id="features" className="scroll-mt-24" aria-labelledby="features-heading">
                    <div className="max-w-2xl">
                        <h2 id="features-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t('features_title')}</h2>
                        <p className="mt-1 text-neutral-600">{t('features_desc')}</p>
                    </div>
                    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map(({ art: Art, title, body }) => (
                            <article key={title} className="rounded-3xl border border-neutral-200 bg-white p-6">
                                <Art className="h-20 w-20" />
                                <h3 className="mt-4 text-lg font-extrabold tracking-tight">{title}</h3>
                                <p className="mt-1 text-sm leading-6 text-neutral-600">{body}</p>
                            </article>
                        ))}
                    </div>
                </section>

                {/* In Discord */}
                <section aria-labelledby="see-heading" className="rounded-3xl border border-neutral-200 bg-white p-6 sm:p-8">
                    <h2 id="see-heading" className="text-2xl font-extrabold tracking-tight sm:text-3xl">See it in Discord</h2>
                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        <figure className="overflow-hidden rounded-2xl bg-[#1E1F22] p-3">
                            <div className="flex h-full items-center justify-center rounded-xl bg-[#2B2D31] p-4">
                                <Image
                                    src="/landing/discord/screenshot2.png"
                                    alt="The IdleForest bot showing a live tree counter as its Discord status"
                                    width={518}
                                    height={182}
                                    className="h-auto w-full max-w-sm"
                                />
                            </div>
                            <figcaption className="px-1 pb-1 pt-3 text-sm text-white/80">A live tree counter, right in the member list.</figcaption>
                        </figure>
                        <figure className="overflow-hidden rounded-2xl bg-[#1E1F22] p-3">
                            <Image
                                src="/landing/discord/screenshot3.png"
                                alt="The IdleForest bot showing a member's stats with the stats user command"
                                width={1490}
                                height={392}
                                className="h-auto w-full rounded-xl"
                            />
                            <figcaption className="px-1 pb-1 pt-3 text-sm text-white/80">
                                <code className="font-mono text-xs text-white">/stats user</code> shows a member&apos;s points and trees.
                            </figcaption>
                        </figure>
                    </div>
                </section>

                {/* How it works */}
                <section className="overflow-hidden rounded-3xl bg-[#232A5C] px-5 py-10 text-white sm:px-10 sm:py-14" aria-labelledby="how-heading">
                    <h2 id="how-heading" className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{t('how_title')}</h2>
                    <p className="mx-auto mt-2 max-w-xl text-center text-white/75">{t('how_desc')}</p>
                    <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {steps.map((step) => (
                            <li key={step.title} className="flex flex-col items-center rounded-3xl bg-white/10 p-6 text-center">
                                <step.art className="h-24 w-24" />
                                <p className="mt-4 text-lg font-extrabold">{step.title}</p>
                                <p className="mt-1 text-sm text-white/75">{step.body}</p>
                                {step.cta && (
                                    <Link href={step.cta.href} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-yellow px-4 py-2 text-sm font-bold text-brand-navy transition hover:brightness-95">
                                        {step.cta.label}
                                        <ArrowRight className="h-4 w-4" aria-hidden />
                                    </Link>
                                )}
                            </li>
                        ))}
                    </ol>
                </section>

                {/* Final CTA */}
                <section className="rounded-3xl bg-brand-navy px-6 py-14 text-center text-white sm:py-20">
                    <h2 className="mx-auto max-w-2xl text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{t('cta_title')}</h2>
                    <p className="mx-auto mt-3 max-w-xl text-white/70">{t('cta_desc')}</p>
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                        <Link href={BOT_INVITE_URL} target="_blank" rel="noopener noreferrer" className={discordButton}>
                            <MessageSquare className="h-5 w-5" aria-hidden />
                            {t('add_bot')}
                        </Link>
                        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/40 px-7 py-3.5 text-base font-bold text-white transition hover:bg-white/10">
                            Learn about IdleForest
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
}
