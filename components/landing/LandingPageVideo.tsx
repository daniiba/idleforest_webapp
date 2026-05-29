"use client";

import { Link } from "@/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Leaf, Chrome, Wifi, TreePine, PlayCircle, Shield, BadgeCheck, BarChart3, ShieldCheck, Globe, Users, DollarSign, Monitor, Smartphone, Share2, Award, Check, Download, ChevronDown, Apple } from "lucide-react";
import Navigation from "@/components/navigation";
import { useEffect, useState } from "react";

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
import TeamSection from "@/components/landing/TeamSection";

const screenshots = [
    "/landing/screenshot-1.png",
    "/landing/screenshot-2.png",
    "/landing/screenshot-3.png",
];

export default function LandingPageVideo({ deviceInfo }: { deviceInfo?: DeviceDetection }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalRequests: 0,
        earnings: "$0",
        treesPlanted: 0,
    });

    const { isMobile, isDesktop, isChrome, isEdge, isSafari, /* isFirefox, */ isMac, isWindows } = useDeviceDetection(deviceInfo);
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
                const formattedEarnings = `$${earningsNum.toFixed(2)}`;

                setStats((prev) => ({
                    ...prev,
                    totalRequests: statsData.requestsTotal ?? 0,
                    earnings: formattedEarnings,
                    treesPlanted: Number.isFinite(treesPlanted) ? Math.max(0, treesPlanted) : 0,
                    totalUsers: nodesData.active_node_count ?? 0,
                }));
            } catch (error) {
                console.error("Error fetching stats:", error);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Refresh every 30 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <Navigation />
            <main className="min-h-screen bg-brand-gray text-white">
                {/* HERO */}

                <section className="relative overflow-hidden">
                    {/* Decorative wavy background */}
                    <Image
                        src="/Vector (Stroke).svg"
                        alt=""
                        fill
                        priority
                        sizes="150vw"
                        className="absolute top-[100px] right-[100px] object-cover pointer-events-none select-none"
                    />
                    <div className="container mx-auto px-6 py-24 ">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">
                            <div className="space-y-6">
                                <div className="flex items-center gap-2">
                                    <Image src="/europelogo.svg" alt="European Union flag" width={74} height={62} />
                                </div>
                                <h1 className="font-candu text-black uppercase text-[38px] sm:text-5xl md:text-6xl leading-[1.05]">
                                    <span className="font-extrabold">{t('hero.title_line1')} </span>
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line2')} </span>
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line3')} </span>
                                </h1>
                                <p className="text-base md:text-lg text-neutral-800 max-w-xl">
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
                                <div className="w-full max-w-lg lg:max-w-full aspect-video rounded-xl overflow-hidden shadow-2xl border-4 border-white/20">
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

                <ProjectsSection />

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="relative bg-brand-yellow text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-24 md:py-28">
                        {/* Badge */}
                        <div className="w-full flex justify-center">
                            <div className="text-brand-yellow inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium shadow">
                                <Leaf className="h-4 w-4" />
                                <span>{t('how_it_works.trees_planted_badge', { count: stats.treesPlanted.toLocaleString() })}</span>
                            </div>
                        </div>

                        {/* Heading */}
                        <div className="text-center mt-6">
                            <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                {t('how_it_works.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
                                {t('how_it_works.subheading')}
                            </p>
                        </div>

                        {/* Screenshots Carousel area */}
                        <div className="mt-14 grid place-items-center">
                            <div className="w-full max-w-xl aspect-video rounded-lg overflow-hidden shadow-lg relative group ">
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
                        <div className="mt-20 grid gap-12 lg:grid-cols-3">
                            <div id="step-1">
                                <div className="text-6xl font-extrabold">1.</div>
                                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                                    {t('how_it_works.step1_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step1_desc')}
                                </p>
                            </div>
                            <div id="step-2">
                                <div className="text-6xl font-extrabold">2.</div>
                                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                                    {t('how_it_works.step2_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step2_desc')}{" "}
                                    <Link href="/transparency" className="font-bold underline hover:text-black">
                                        {t('how_it_works.step2_link')}
                                    </Link>
                                </p>
                            </div>
                            <div id="step-3">
                                <div className="text-6xl font-extrabold">3.</div>
                                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                                    {t('how_it_works.step3_title')}
                                </h3>
                                <p className="mt-3 text-neutral-800 max-w-sm">
                                    {t('how_it_works.step3_desc')}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* DESKTOP APPS */}
                <section id="desktop-apps" className="relative bg-brand-gray text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-12">
                            <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                {t('desktop_apps.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-3xl mx-auto">
                                {t('desktop_apps.description')}
                            </p>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
                            {/* Windows Card */}
                            <div className="bg-brand-yellow rounded-lg p-8 md:p-10 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-navy rounded-sm flex items-center justify-center mb-6">
                                    <Monitor className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <h3 className="font-candu text-4xl md:text-5xl font-extrabold mb-4">
                                    WINDOWS
                                </h3>
                                <p className="text-neutral-800 mb-8 max-w-sm">
                                    {t('desktop_apps.windows_desc')}
                                </p>
                                <Button
                                    asChild
                                    className="bg-brand-navy text-brand-yellow hover:bg-black rounded-full px-6 py-6 font-bold"
                                >
                                    <Link
                                        href="https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/idle-forest.exe"
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

                            {/* Mac OS Card */}
                            <div className="bg-brand-yellow rounded-lg p-8 md:p-10 flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-brand-navy rounded-sm flex items-center justify-center mb-6">
                                    <Monitor className="h-6 w-6 text-brand-yellow" />
                                </div>
                                <h3 className="font-candu text-4xl md:text-5xl font-extrabold mb-4">
                                    MAC OS
                                </h3>
                                <p className="text-neutral-800 mb-8 max-w-sm">
                                    {t('desktop_apps.mac_desc')}
                                </p>
                                <Button
                                    asChild
                                    className="bg-brand-navy text-brand-yellow hover:bg-black rounded-full px-6 py-6 font-bold"
                                >
                                    <Link
                                        href="https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip"
                                        className="flex items-center gap-2"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackPinterestEvent({
                                            eventName: "lead",
                                            eventSourceUrl: "https://idleforest-updates.s3.us-east-1.amazonaws.com/desktop-app/mac.zip",
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
                <section id="impact" className="relative overflow-visible scroll-mt-24 bg-brand-gray">
                    {/* Decorative background lines */}
                    <Image
                        src="/yellow-shape.svg"
                        alt=""
                        fill
                        priority
                        sizes="100vw"
                        className="text-brand-yellow absolute top-[100px] right-[100px] object-fill pointer-events-none select-none"
                    />

                    <div className="relative container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="font-rethink-sans text-black text-3xl sm:text-4xl md:text-5xl font-extrabold">{t('impact.heading')}</h2>
                        </div>
                        {/* 2x2 grid, no gaps so borders align perfectly */}
                        <div className="grid gap-2 sm:grid-cols-2">
                            <ImpactCard icon={<TreePine className="h-6 w-6 text-brand-yellow" />} value={stats.treesPlanted.toLocaleString()} label={t('impact.trees_label')} />
                            <ImpactCard icon={<Globe className="h-6 w-6 text-brand-yellow" />} value={stats.totalRequests.toLocaleString()} label={t('impact.requests_label')} />
                            <ImpactCard icon={<Users className="h-6 w-6 text-brand-yellow" />} value={stats.totalUsers.toLocaleString()} label={t('impact.users_label')} />
                            <ImpactCard icon={<DollarSign className="h-6 w-6 text-brand-yellow" />} value={stats.earnings} label={t('impact.contributions_label')} />
                        </div>
                    </div>
                </section>

                {/* TEAM */}
                <TeamSection />

                {/* REVIEWS */}
                <ReviewsSection />

                {/* ACHIEVEMENTS */}
                <section id="achievements" className="relative bg-brand-gray text-black scroll-mt-24">
                    <div className="relative container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-10 md:mb-12">
                            <h2 className="font-rethink-sans text-[36px] sm:text-5xl md:text-6xl font-extrabold">
                                {t('achievements.heading_line1')}
                                <br className="hidden sm:block" />
                                <span className="sm:hidden"> </span>
                                {t('achievements.heading_line2')}
                            </h2>
                        </div>

                        <div className="space-y-6">
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
                <section id="faq" className="relative bg-brand-yellow text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="text-center mb-12">
                            <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                {t('faq.heading')}
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
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
                                            <Link href="/transparency" className="font-bold underline hover:text-white">
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
                                            Yes. IdleForest does not change how you browse or what search engine you use. It works alongside Ecosia, Brave, Firefox, Chrome, Edge, and other browsers.
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
                                            <Link href="/privacy" className="font-bold underline hover:text-white">
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
                                            <Link href="/transparency" className="font-bold underline hover:text-white">
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
                                            IdleForest has funded {stats.treesPlanted.toLocaleString()} trees through our partners, based on the current live counter.
                                        </p>
                                        <p>
                                            See the{" "}
                                            <Link href="/transparency" className="font-bold underline hover:text-white">
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
                                            The revenue per user is small, often just a few cents per month for an average user. The model works at scale, not because any one person contributes a large amount.
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
                                            Not yet. IdleForest runs as a Chrome extension and as a desktop app for Mac and Windows.
                                        </p>
                                        <p>
                                            Mobile is on the roadmap, but mobile networks usually have less idle bandwidth than home connections, so the impact per user would be lower.
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
                                            Once uninstalled, no bandwidth is used. The trees you have already helped fund stay funded.
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
                                    "text": "Yes. IdleForest doesn't change how you browse or what search engine you use. It works alongside Ecosia, Brave, Firefox, and any other browser."
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
                                    "text": `IdleForest has funded ${stats.treesPlanted.toLocaleString()} trees through our partners, based on the current live counter.`
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "How much money does IdleForest make from my bandwidth?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "The revenue per user is small, often just a few cents per month for an average user. That's why the model works at scale, not per individual."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Is IdleForest available on mobile?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Not yet. The app runs as a Chrome extension and as a desktop app for Mac and Windows. Mobile is on the roadmap, but mobile networks have less idle bandwidth than home connections."
                                }
                            },
                            {
                                "@type": "Question",
                                "name": "Can I uninstall the app at any time?",
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": "Yes. Uninstall the Chrome extension from the extensions menu, or remove the desktop app like any other application. Once uninstalled, no bandwidth is used and the trees you've already funded stay funded."
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
                        "name": "How to plant trees by browsing with IdleForest",
                        "totalTime": "PT10S",
                        "step": [
                            {
                                "@type": "HowToStep",
                                "position": 1,
                                "name": "Install the app",
                                "text": "Add IdleForest to Chrome or download the desktop app for Mac or Windows. Takes 10 seconds.",
                                "url": "https://www.idleforest.com/#step-1"
                            },
                            {
                                "@type": "HowToStep",
                                "position": 2,
                                "name": "Browse normally",
                                "text": "The app runs quietly in the background, using only your unused internet bandwidth.",
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
                        <h3 className="font-rethink-sans text-2xl">{title}</h3>
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
    const badgeClass = "bg-brand-yellow text-black font-rethink-sans rounded-none" as const;

    return (
        <div className="relative border-b-2 border-r-2 border-black bg-transparent p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-md bg-neutral-900 text-brand-yellow grid place-items-center mb-2 md:mb-0">
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                        <h3 className="font-rethink-sans text-xl md:text-2xl font-extrabold break-words">{title}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-extrabold tracking-wide self-start md:self-auto mt-1 md:mt-0 ${badgeClass}`}>
                            {status.label === "COMPLETED" && <Check className="h-3.5 w-3.5" />}
                            {status.label}
                        </span>
                    </div>
                    <p className="mt-2 text-neutral-800 max-w-3xl">{description}</p>
                </div>
            </div>
        </div>
    );
}

function ImpactCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
    return (
        <div className="font-candu bg-brand-navy rounded-none border border-neutral-800 px-6 py-10 md:px-2 md:py-32 text-center flex flex-col items-center justify-center min-h-[180px]">
            <div className="flex items-center justify-center text-brand-yellow mb-2">{icon}</div>
            <div className="text-3xl sm:text-4xl md:text-5xl text-brand-yellow leading-none">{value}</div>
            <div className="mt-3 text-brand-yellow text-xs sm:text-sm md:text-base tracking-wide">{label}</div>
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
        <div className="border-2 border-black bg-brand-navy overflow-hidden">
            <button
                onClick={onClick}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-brand-navy/90 transition-colors"
            >
                <h3 className="font-rethink-sans text-lg md:text-xl font-bold pr-4 text-brand-yellow">{question}</h3>
                <ChevronDown
                    className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 text-brand-yellow ${isOpen ? 'rotate-180' : ''
                        }`}
                />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-5 text-brand-yellow leading-relaxed">
                    {answer}
                </div>
            </div>
        </div>
    );
}
