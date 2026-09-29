"use client";

import { Link } from "@/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Leaf, Chrome, TreePine, PlayCircle, Shield, BadgeCheck, ShieldCheck, Globe, Users, DollarSign, Monitor, Smartphone, Share2, Award, Check, Download, ChevronDown, Apple, Wifi } from "lucide-react";
import Navigation from "@/components/navigation";
import { Fragment, useEffect, useState } from "react";

import { EmailForm } from "@/components/email-form";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { DeviceDetection } from "@/lib/device-detection";
import { ReviewsSection } from "@/components/reviews-section";
import { SmartCTA } from "@/components/smart-cta";
import TopTeamsBanner from "@/components/TopTeamsBanner";
import { useTranslations } from "next-intl";
import { trackPinterestEvent } from "@/lib/pinterest/client";
import HeroTrustSignals from "@/components/landing/HeroTrustSignals";
import ProjectsSection from "@/components/landing/ProjectsSection";
import PartnerProjects from "@/components/landing/PartnerProjects";
import TeamSection from "@/components/landing/TeamSection";
import IdleBandwidthArt from "@/components/landing/IdleBandwidthArt";
import { WindowsLogo, AppleLogo, LinuxLogo } from "@/components/icons/os-logos";

const screenshots = [
    "/landing/screenshot-1.png",
    "/landing/screenshot-2.png",
    "/landing/screenshot-3.png",
];

const STATIC_IMPACT_STATS = {
    treesPlanted: "5,364",
    earnings: "$2,796",
    totalRequests: "10.1M",
    totalUsers: "1,000+",
};

export default function LandingPageVideo({ deviceInfo }: { deviceInfo?: DeviceDetection }) {
    const [stats, setStats] = useState({
        totalUsers: STATIC_IMPACT_STATS.totalUsers,
        totalRequests: STATIC_IMPACT_STATS.totalRequests,
        earnings: STATIC_IMPACT_STATS.earnings,
        treesPlanted: STATIC_IMPACT_STATS.treesPlanted,
    });

    const { isMobile, isDesktop, isChrome, isEdge, isSafari, isMac, isWindows } = useDeviceDetection(deviceInfo);
    const t = useTranslations('Landing');
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

    const [currentScreenshot, setCurrentScreenshot] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentScreenshot((prev) => (prev + 1) % screenshots.length);
        }, 2000);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        // Clarity tracking
        if (typeof window !== "undefined" && window.clarity) {
            window.clarity("set", "ab_variant", "video");
        }

        const fetchStats = async () => {
            try {
                const [nodesResponse, statsResponse] = await Promise.all([
                    fetch("https://api.mellow.tel/provider-count?public_key=8418f448"),
                    fetch(
                        "https://fcgv4rovovvlixqc2a7qncvev40dbxsy.lambda-url.us-east-1.on.aws/?publicKey=8418f448"
                    ),
                ]);

                const nodesData = await nodesResponse.json();
                const statsData = await statsResponse.json();

                // Calculate trees planted (legacy formula from previous version)
                const earningsNum = parseFloat(String(statsData.earnings).replace("$", "")) + 25;
                const treesPlanted = Math.floor((earningsNum - 205) / 0.55) + 652;
                const formattedEarnings = Number.isFinite(earningsNum)
                    ? `$${Math.round(earningsNum).toLocaleString()}`
                    : STATIC_IMPACT_STATS.earnings;

                setStats((prev) => ({
                    ...prev,
                    totalRequests: statsData.requestsTotal
                        ? Number(statsData.requestsTotal).toLocaleString()
                        : STATIC_IMPACT_STATS.totalRequests,
                    earnings: formattedEarnings,
                    treesPlanted: Number.isFinite(treesPlanted) && treesPlanted > 0
                        ? Math.max(0, treesPlanted).toLocaleString()
                        : STATIC_IMPACT_STATS.treesPlanted,
                    totalUsers: nodesData.active_node_count
                        ? Number(nodesData.active_node_count).toLocaleString()
                        : STATIC_IMPACT_STATS.totalUsers,
                }));
            } catch (error) {
                console.error("Error fetching stats:", error);
                setStats(STATIC_IMPACT_STATS);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-[#F7F7F2] text-brand-navy">
                {/* HERO */}

                <section className="relative overflow-hidden">
                    <div className="container mx-auto max-w-6xl px-6 py-16 md:py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Image src="/europelogo.svg" alt="European Union flag" width={74} height={62} />
                                </div>
                                <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight text-brand-navy lowercase first-letter:uppercase sm:text-5xl lg:text-6xl">
                                    <span className="font-extrabold">{t('hero.title_line1')} </span>
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line2')} </span>
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line3')} </span>
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line4')} </span>
                                </h1>
                                <p className="text-base md:text-lg text-neutral-600 max-w-xl">
                                    {t('hero.description')}
                                </p>
                                <div className="flex flex-col w-full sm:w-auto items-stretch gap-3">
                                    {/* CTAs based on Device/Browser */}
                                    <SmartCTA className="text-black" deviceInfo={deviceInfo} showExtensionDownload />
                                </div>
                                <HeroTrustSignals />
                            </div>
                            {/* HERO ART PLACEHOLDER */}
                            <div className="relative w-full flex items-center justify-center">
                                <div className="w-full max-w-lg lg:max-w-full aspect-video rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/10">
                                    <iframe
                                        className="w-full h-full"
                                        src="https://www.youtube.com/embed/tCnupe1tkfs?rel=0"
                                        title="Idleforest - How it works"
                                        loading="lazy"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <PartnerProjects />

                <ProjectsSection />

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="relative bg-brand-yellow text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-24 md:py-28">
                        {/* Badge */}
                        <div className="w-full flex justify-center">
                            <div className="text-brand-yellow inline-flex items-center gap-2 rounded-full bg-brand-navy px-4 py-2 text-sm font-semibold">
                                <Leaf className="h-4 w-4" />
                                <span>{t('how_it_works.trees_planted_badge', { count: stats.treesPlanted })}</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mt-6">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                {t('how_it_works.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                                {t('how_it_works.subheading')}
                            </p>
                        </div>

                        {/* Screenshots Carousel area */}
                        <div className="mt-14 grid place-items-center">
                            <div className="w-full max-w-xl aspect-video rounded-3xl overflow-hidden bg-white/40 relative group ">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={screenshots[currentScreenshot]}
                                        alt={`Screenshot ${currentScreenshot + 1}`}
                                        fill
                                        className="object-contain"
                                    />
                                </div>

                                {/* Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                    {screenshots.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentScreenshot(index)}
                                            className={`w-2 h-2 rounded-full transition-colors ${currentScreenshot === index ? "bg-black/50" : "bg-black/20"
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>



                        {/* Three steps */}
                        <div className="mt-16 grid gap-6 lg:grid-cols-3">
                            <div id="step-1">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-lg font-extrabold text-brand-yellow">1</div>
                                <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">
                                    {t('how_it_works.step1_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step1_desc')} Learn more about the{" "}
                                    <Link href="/tree-planting-extension" className="font-bold underline hover:text-black">
                                        Chrome extension
                                    </Link>
                                    .
                                </p>
                            </div>
                            <div id="step-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-lg font-extrabold text-brand-yellow">2</div>
                                <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">
                                    {t('how_it_works.step2_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step2_desc')}{" "}
                                    <Link href="/how-it-works" className="font-bold underline hover:text-black">
                                        {t('how_it_works.step2_link')}
                                    </Link>
                                </p>
                            </div>
                            <div id="step-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-navy text-lg font-extrabold text-brand-yellow">3</div>
                                <h3 className="mt-4 text-2xl font-extrabold leading-tight tracking-tight">
                                    {t('how_it_works.step3_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step3_desc')}
                                </p>
                            </div>
                        </div>
                        <div className="mt-14 text-center">
                            <Link
                                href="/how-it-works"
                                className="inline-flex items-center gap-2 rounded-full bg-brand-navy px-6 py-3 font-bold text-brand-yellow transition-colors hover:bg-black"
                            >
                                See how it works in detail →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* IDLE BANDWIDTH */}
                <section id="idle-bandwidth" className="relative overflow-hidden bg-white text-brand-navy scroll-mt-24">
                    <div className="container relative mx-auto px-6 py-20 md:py-24">
                        <div className="mx-auto max-w-5xl text-center">
                            <h2 className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl">
                                How Idle Bandwidth Funds Trees
                            </h2>
                        </div>

                        <IdleBandwidthArt className="mx-auto mt-8 h-auto w-full max-w-5xl" />

                        <ol className="mx-auto mt-6 grid max-w-5xl items-stretch gap-4 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-3">
                            {[
                                { icon: Wifi, title: "Spare bandwidth", text: "IdleForest only uses the internet capacity you are not using, and steps back when you need it." },
                                { icon: Globe, title: "Client pays for public data", text: "Companies pay for tasks like uptime monitoring and market research on public sites." },
                                { icon: TreePine, title: "Trees are funded", text: "That revenue funds verified planting with partners like Trees for the Future and Tree-Nation." },
                            ].map((step, index, all) => {
                                const Icon = step.icon;
                                return (
                                    <Fragment key={step.title}>
                                        <li className="flex flex-col rounded-3xl border border-neutral-200 bg-[#F7F7F2] p-6 text-left">
                                            <div className="flex items-center justify-between">
                                                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${index === all.length - 1 ? "bg-brand-yellow text-brand-navy" : "bg-brand-navy text-brand-yellow"}`}>
                                                    <Icon className="h-6 w-6" aria-hidden="true" />
                                                </span>
                                                <span className="text-sm font-semibold text-brand-navy/40">{String(index + 1).padStart(2, "0")}</span>
                                            </div>
                                            <h3 className="mt-5 text-xl font-extrabold leading-tight tracking-tight">{step.title}</h3>
                                            <p className="mt-2 text-sm leading-6 text-neutral-600">{step.text}</p>
                                        </li>
                                        {index < all.length - 1 && (
                                            <li aria-hidden="true" className="flex items-center justify-center text-brand-navy/30">
                                                <ArrowRight className="h-5 w-5 rotate-90 md:rotate-0" />
                                            </li>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </ol>

                        <div className="mx-auto mt-7 flex max-w-5xl flex-col items-center justify-between gap-4 sm:flex-row">
                            <p className="flex items-center gap-2 text-center text-sm text-brand-navy/60 sm:text-left">
                                <ShieldCheck className="h-4 w-4 shrink-0 text-brand-navy/70" aria-hidden="true" />
                                No browsing data shared.
                            </p>
                            <Link
                                href="/how-it-works"
                                className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-navy underline decoration-brand-navy/25 underline-offset-4 transition-colors hover:text-black"
                            >
                                Technical details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* DESKTOP APPS */}
                <section id="desktop-apps" className="relative bg-[#F7F7F2] text-brand-navy scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                {t('desktop_apps.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-3xl mx-auto">
                                {t('desktop_apps.description')}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
                            {/* Windows Card */}
                            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center mb-5">
                                    <WindowsLogo className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <h3 className="text-2xl font-extrabold mb-3">
                                    Windows
                                </h3>
                                <p className="text-neutral-600 mb-8 max-w-sm">
                                    {t('desktop_apps.windows_desc')}
                                </p>
                                <Button
                                    asChild
                                    className="bg-brand-navy text-brand-yellow hover:bg-black rounded-full px-6 py-6 font-bold"
                                >
                                    <Link
                                        href="/download/windows/installer"
                                        prefetch={false}
                                        className="flex items-center gap-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackPinterestEvent({
                                            eventName: "lead",
                                            eventSourceUrl: "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe",
                                            customData: { lead_type: 'Desktop Download - Windows' }
                                        })}
                                    >
                                        <Download className="h-5 w-5" />
                                        {t('desktop_apps.download_windows')}
                                    </Link>
                                </Button>
                            </div>

                            {/* Linux Card */}
                            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center mb-5">
                                    <LinuxLogo className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <h3 className="text-2xl font-extrabold mb-3">
                                    Linux
                                </h3>
                                <p className="text-neutral-600 mb-8 max-w-sm">
                                    {t('desktop_apps.linux_desc')}
                                </p>
                                <Button
                                    asChild
                                    className="bg-brand-navy text-brand-yellow hover:bg-black rounded-full px-6 py-6 font-bold"
                                >
                                    <Link
                                        href="/download/linux/installer"
                                        prefetch={false}
                                        className="flex items-center gap-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackPinterestEvent({
                                            eventName: "lead",
                                            eventSourceUrl: "https://idleforest-updates.s3.us-east-1.amazonaws.com/updates/linux/x64/idle-forest.deb",
                                            customData: { lead_type: 'Desktop Download - Linux' }
                                        })}
                                    >
                                        <Download className="h-5 w-5" />
                                        {t('desktop_apps.download_linux')}
                                    </Link>
                                </Button>
                            </div>

                            {/* Mac OS Card */}
                            <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-navy rounded-2xl flex items-center justify-center mb-5">
                                    <AppleLogo className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <h3 className="text-2xl font-extrabold mb-3">
                                    macOS
                                </h3>
                                <p className="text-neutral-600 mb-8 max-w-sm">
                                    {t('desktop_apps.mac_desc')}
                                </p>
                                <Button
                                    asChild
                                    className="bg-brand-navy text-brand-yellow hover:bg-black rounded-full px-6 py-6 font-bold"
                                >
                                    <Link
                                        href="/download/mac/installer"
                                        prefetch={false}
                                        className="flex items-center gap-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackPinterestEvent({
                                            eventName: "lead",
                                            eventSourceUrl: "https://idleforest-updates.s3.us-east-1.amazonaws.com/updates/darwin/arm64/IdleForest-darwin-arm64-1.0.7.zip",
                                            customData: { lead_type: 'Desktop Download - Mac' }
                                        })}
                                    >
                                        <Download className="h-5 w-5" />
                                        {t('desktop_apps.download_mac')}
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* IMPACT */}
                <section id="impact" className="relative overflow-visible scroll-mt-24 bg-white">

                    <div className="relative container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="text-brand-navy text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">{t('impact.heading')}</h2>
                        </div>
                        {/* 2x2 grid, no gaps so borders align perfectly */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <ImpactCard icon={<TreePine className="h-6 w-6 text-brand-yellow" />} value={stats.treesPlanted} label={t('impact.trees_label')} />
                            <ImpactCard icon={<Globe className="h-6 w-6 text-brand-yellow" />} value={stats.totalRequests} label={t('impact.requests_label')} />
                            <ImpactCard icon={<Users className="h-6 w-6 text-brand-yellow" />} value={stats.totalUsers} label={t('impact.users_label')} />
                            <ImpactCard icon={<DollarSign className="h-6 w-6 text-brand-yellow" />} value={stats.earnings} label={t('impact.contributions_label')} />
                        </div>
                        <div className="mt-10 text-center">
                            <Link
                                href="/transparency"
                                className="inline-flex items-center gap-2 rounded-full bg-brand-yellow px-6 py-3 font-bold text-brand-navy transition-colors hover:brightness-95"
                            >
                                Read our full transparency report →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* TEAM */}
                <TeamSection />

                {/* REVIEWS */}
                <ReviewsSection />

                {/* ACHIEVEMENTS */}
                <section id="achievements" className="relative bg-[#F7F7F2] text-brand-navy scroll-mt-24">
                    <div className="relative container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                {t('achievements.heading_line1')}
                                <br className="hidden sm:block" />
                                <span className="sm:hidden"> </span>
                                {t('achievements.heading_line2')}
                            </h2>
                        </div>

                        <div className="mx-auto max-w-3xl space-y-4">
                            <RoadmapItem
                                icon={<Chrome className="h-6 w-6" />}
                                title={t('achievements.browser_ext_title')}
                                status={{ label: t('achievements.browser_ext_status'), variant: "success" }}
                                description={t('achievements.browser_ext_desc')}
                            />

                            <RoadmapItem
                                icon={<Monitor className="h-6 w-6" />}
                                title={t('achievements.desktop_title')}
                                status={{ label: t('achievements.desktop_status'), variant: "warning" }}
                                description={t('achievements.desktop_desc')}
                            />

                            <RoadmapItem
                                icon={<Share2 className="h-6 w-6" />}
                                title={t('achievements.referral_title')}
                                status={{ label: t('achievements.referral_status'), variant: "info" }}
                                description={t('achievements.referral_desc')}
                            />

                            <RoadmapItem
                                icon={<Smartphone className="h-6 w-6" />}
                                title={t('achievements.mobile_title')}
                                status={{ label: t('achievements.mobile_status'), variant: "neutral" }}
                                description={t('achievements.mobile_desc')}
                            />

                            <RoadmapItem
                                icon={<Award className="h-6 w-6" />}
                                title={t('achievements.corporate_title')}
                                status={{ label: t('achievements.corporate_status'), variant: "neutral" }}
                                description={t('achievements.corporate_desc')}
                            />
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="relative bg-white text-brand-navy scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                {t('faq.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                                {t('faq.subheading')}
                            </p>
                        </div>

                        <div className="max-w-3xl mx-auto space-y-4">
                            <FaqItem
                                question="How do I get started with IdleForest?"
                                answer={
                                    <div className="w-full mt-4 aspect-video rounded-lg overflow-hidden">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src="https://www.youtube.com/embed/tCnupe1tkfs"
                                            title="How to install and use IdleForest"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                }
                                isOpen={openFaqIndex === 10}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 10 ? null : 10)}
                            />

                            <FaqItem
                                question="Is the tree planting app really free?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Yes. There is no subscription, no donation, no signup, and no paid tier. IdleForest is funded by revenue from idle bandwidth tasks, not by you.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 0}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
                            />

                            <FaqItem
                                question="Does the app slow down my computer or internet?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            No. IdleForest uses only the bandwidth you are not using. When you start a video call, open a heavy site, or download a file, IdleForest steps back.
                                        </p>
                                        <p>
                                            You can also pause it at any time from the extension menu.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 1}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
                            />

                            <FaqItem
                                question="How does IdleForest plant trees?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            The app uses your unused internet bandwidth to power small backend tasks for paying clients. Revenue from those tasks funds tree planting with partners like Trees for the Future, Tree-Nation, and 1ClickImpact.
                                        </p>
                                        <p>
                                            You can see the live count of trees funded on our{" "}
                                            <Link href="/transparency" className="font-bold underline hover:text-black">
                                                transparency page
                                            </Link>.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 2}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
                            />

                            <FaqItem
                                question="What is idle bandwidth?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Idle bandwidth is the part of your internet connection that is not being used. Most home connections sit below their full capacity most of the time.
                                        </p>
                                        <p>
                                            IdleForest uses that unused capacity to generate revenue, then routes that revenue to verified reforestation.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 3}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
                            />

                            <FaqItem
                                question="Can I use IdleForest with Ecosia or another browser?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Yes. IdleForest does not change how you browse or what search engine you use. It works alongside Ecosia, Brave, Chrome, and Edge.
                                        </p>
                                        <p>
                                            You can stack the impact from IdleForest with other environmentally focused tools.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 4}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
                            />

                            <FaqItem
                                question="What data does the app collect?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            None of your personal browsing data. The traffic that runs through IdleForest is sessionless, meaning it does not carry cookies, personal identifiers, or browsing history.
                                        </p>
                                        <p>
                                            The app does not read your tabs, bookmarks, or search history. See our{" "}
                                            <Link href="/privacy" className="font-bold underline hover:text-black">
                                                privacy policy
                                            </Link>
                                            {" "}for the full breakdown.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 5}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
                            />

                            <FaqItem
                                question="Is the bandwidth used for anything harmful?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            No. Tasks are limited to uptime monitoring, market research, and similar passive data collection from public sites.
                                        </p>
                                        <p>
                                            IdleForest does not participate in ad fraud, crypto mining, scraping private data, or malicious activity. We publish more detail in our{" "}
                                            <Link href="/transparency" className="font-bold underline hover:text-black">
                                                transparency report
                                            </Link>.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 6}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 6 ? null : 6)}
                            />

                            <FaqItem
                                question="How many trees has IdleForest planted?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            IdleForest has funded 5,364 trees through our partners. We update the monthly total on the transparency report as new partner records are added.
                                        </p>
                                        <p>
                                            See the{" "}
                                            <Link href="/transparency" className="font-bold underline hover:text-black">
                                                transparency report
                                            </Link>
                                            {" "}for the latest breakdown by partner and region.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 7}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 7 ? null : 7)}
                            />

                            <FaqItem
                                question="How much money does IdleForest make from my bandwidth?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Active desktop users usually generate around $2-$5 per month, depending on location, how often the app is running, and how much spare capacity is available. One person&apos;s contribution is modest, but across a community it becomes steady funding for verified trees.
                                        </p>
                                        <p>
                                            The more users join, the more idle bandwidth becomes available, and the more trees can be funded.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 8}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 8 ? null : 8)}
                            />

                            <FaqItem
                                question="Is IdleForest available on mobile?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Not yet. IdleForest runs as a Chrome extension and as a desktop app for Mac, Windows, and Linux.
                                        </p>
                                        <p>
                                            Mobile is on the roadmap, but mobile networks usually have less idle bandwidth than home connections, so the impact per user would be lower. We will launch when the math works.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 9}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 9 ? null : 9)}
                            />

                            <FaqItem
                                question="Can I uninstall the app at any time?"
                                answer={
                                    <>
                                        <p className="mb-3">
                                            Yes. Remove the Chrome extension from your extensions menu, or uninstall the desktop app like any other application.
                                        </p>
                                        <p>
                                            Once uninstalled, no bandwidth is used and no data is collected. The trees you have already helped fund stay funded.
                                        </p>
                                    </>
                                }
                                isOpen={openFaqIndex === 11}
                                onClick={() => setOpenFaqIndex(openFaqIndex === 11 ? null : 11)}
                            />

                            {/* Disambiguation note for GEO - helps AI engines distinguish from "Idle Forest" mobile game */}
                            <p className="mt-6 text-center text-sm text-neutral-600 italic">
                                {t('faq.disclaimer')}
                            </p>
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section id="start" className="relative bg-brand-navy text-white scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                                Start Planting Trees in 10 Seconds
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-white/70">
                                Install IdleForest. Use your computer as usual. Help fund verified trees.
                            </p>
                            <div className="mt-8 flex justify-center">
                                <SmartCTA deviceInfo={deviceInfo} buttonVariant="default" showExtensionDownload />
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* FAQPage Schema for Google rich results */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": "Is the tree planting app really free?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. There is no subscription, no donation, no signup, and no paid tier. The app is funded by the revenue from idle bandwidth tasks, not by you."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Does the app slow down my computer or internet?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "No. The app uses only the bandwidth you're not using. When you start a video call, open a heavy site, or download a file, IdleForest steps back. You can also pause it at any time from the extension menu."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How does IdleForest plant trees?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "The app uses your unused internet bandwidth to power small backend tasks for paying clients. The revenue from those tasks funds tree planting with Trees for the Future, Tree-Nation, and 1ClickImpact."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What is idle bandwidth?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Idle bandwidth is the part of your internet connection that isn't being used. Most home connections sit unused most of the time. IdleForest uses that unused capacity to generate revenue, and routes the revenue to reforestation."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I use IdleForest with Ecosia or another browser?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. IdleForest doesn't change how you browse or what search engine you use. It works alongside Ecosia, Brave, Chrome, and Edge. You can stack the impact."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "What data does the app collect?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "None of your personal browsing data. The traffic that runs through the app is sessionless, meaning it doesn't carry cookies, personal identifiers, or browsing history."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is the bandwidth used for anything harmful?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "No. The tasks routed through your connection are limited to uptime monitoring, market research, and similar passive data collection from public sites. The app doesn't participate in ad fraud, crypto mining, scraping of private data, or any malicious activity."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How many trees has IdleForest planted?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "IdleForest has funded 5,364 trees through our partners. We update the monthly total on the transparency report as new partner records are added."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How much money does IdleForest make from my bandwidth?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Active desktop users usually generate around $2-$5 per month, depending on location, how often the app is running, and how much spare capacity is available. One person's contribution is modest, but across a community it becomes steady funding for verified trees."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is IdleForest available on mobile?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Not yet. The app runs as a Chrome extension and as a desktop app for Mac, Windows, and Linux. Mobile is on the roadmap, but mobile networks have less idle bandwidth than home connections, so the impact per user would be lower. We will launch when the math works."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I uninstall the app at any time?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. Uninstall the Chrome extension from the extensions menu, or remove the desktop app like any other application. Once uninstalled, no bandwidth is used and no data is collected. The trees you've already funded stay funded."
                                }
                            }
                        ]
                    })
                }}
            />

            {/* HowTo Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "How to plant trees for free while you use your computer",
                        "totalTime": "PT10S",
                        "step": [
                            {
                                "@type": "HowToStep",
                                "position": 1,
                                "name": "Install the app",
                                "text": "Add IdleForest to Chrome or download the desktop app for Mac, Windows, or Linux. Takes 10 seconds.",
                                "url": "https://www.idleforest.com/#step-1"
                            },
                            {
                                "@type": "HowToStep",
                                "position": 2,
                                "name": "Use your computer as usual",
                                "text": "The desktop app uses unused internet bandwidth while your computer is on and connected, even with your browser closed. The extension works while your browser is open.",
                                "url": "https://www.idleforest.com/#step-2"
                            },
                            {
                                "@type": "HowToStep",
                                "position": 3,
                                "name": "Trees get planted",
                                "text": "Every gigabyte of idle bandwidth funds verified tree-planting projects.",
                                "url": "https://www.idleforest.com/#step-3"
                            }
                        ]
                    })
                }}
            />
        </>
    );
}

function HowCard({ number, title, description, icon }: { number: number; title: string; description: string; icon: React.ReactNode }) {
    return (
        <Card className="bg-black border-2 border-neutral-800 p-6 h-full">
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-brand-yellow text-black grid place-items-center font-bold">
                    {number}
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-brand-yellow">{icon}</span>
                        <h3 className="text-2xl">{title}</h3>
                    </div>
                    <p className="text-brand-gray leading-relaxed">{description}</p>
                </div>
            </div>
        </Card>
    );
}

function RoadmapItem({
    icon,
    title,
    description,
    status,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    status: { label: string; variant: "success" | "warning" | "info" | "neutral" };
}) {
    // Badges: brand yellow background, black text, square corners, Candu font
    const badgeClass = "bg-brand-yellow text-brand-navy rounded-full" as const;

    return (
        <div className="relative rounded-2xl border border-neutral-200 bg-white p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand-navy text-brand-yellow grid place-items-center mb-2 md:mb-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                        <h3 className="text-lg md:text-xl font-extrabold break-words">{title}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-bold self-start md:self-auto mt-1 md:mt-0 ${badgeClass}`}>
                            {status.label === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
                            {status.label}
                        </span>
                    </div>
                    <p className="mt-2 text-neutral-600 max-w-3xl">{description}</p>
                </div>
            </div>
        </div>
    );
}

function ImpactCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="bg-brand-navy rounded-3xl px-6 py-10 text-center flex flex-col items-center justify-center min-h-[180px]">
            <div className="flex items-center justify-center text-brand-yellow mb-2">{icon}</div>
            <div className="text-3xl sm:text-4xl font-extrabold text-brand-yellow leading-none tabular-nums">{value}</div>
            <div className="mt-3 text-white/70 text-sm">{label}</div>
        </div>
    );
}

function FaqItem({
    question,
    answer,
    isOpen,
    onClick
}: {
    question: string;
    answer: React.ReactNode;
    isOpen: boolean;
    onClick: () => void;
}) {
    return (
        <div className="rounded-2xl border border-neutral-200 bg-[#F7F7F2] overflow-hidden">
            <button
                onClick={onClick}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-neutral-100 transition-colors"
            >
                <h3 className="text-base md:text-lg font-bold pr-4 text-brand-navy">{question}</h3>
                <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 text-brand-navy ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-5 text-neutral-700 leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
