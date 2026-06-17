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

const STATIC_IMPACT_STATS = {
    treesPlanted: "5,364",
    earnings: "$2,796",
    totalRequests: "10.1M",
    totalUsers: "1,000+",
};

const comparisonCriteria = [
    "Cost",
    "Effort",
    "How trees are funded",
    "Works with your browser",
];

const comparisonProducts = [
    {
        name: "IdleForest",
        summary: "A passive layer that runs beside the browser and computer you already use.",
        values: ["Free", "Install once; keep browsing", "Idle bandwidth revenue funds verified trees", "Yes: Chrome, Edge, Mac, and Windows"],
        featured: true,
    },
    {
        name: "Ecosia",
        summary: "A search engine that turns everyday searches into funding for tree planting.",
        values: ["Free", "Switch your default search engine", "Search ad revenue funds climate projects", "Yes, if you choose Ecosia as your search engine"],
    },
    {
        name: "Mossy Earth",
        summary: "A field-led rewilding membership with biologists, project updates, and deep conservation work.",
        values: ["Paid membership", "Subscribe and follow projects", "Member fees fund rewilding work", "Yes, but it is not a browser tool"],
    },
    {
        name: "Direct donations",
        summary: "Straightforward support for charities or local projects you already trust.",
        values: ["You choose the donation", "Give manually", "Your donation funds the project directly", "Yes, but it is separate from browsing"],
    },
];

const comparisonLinks = [
    {
        label: "IdleForest vs Ecosia",
        href: "/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025",
    },
    {
        label: "Planet Wild vs Mossy Earth",
        href: "/blog/planet-wild-vs-mossy-earth-which-conservation-membership-offers-the-best-rewilding-impact-in-2025",
    },
    {
        label: "9 alternatives to Ecosia",
        href: "/blog/9-companies-like-ecosia-sustainable-search-engines-and-products-for-environmental-impact-2025",
    },
];

const partnerAnnouncements = [
    {
        id: "mossy-earth",
        eyebrow: "Support page",
        logoSrc: "/game/idleforest_icon.png",
        logoAlt: "IdleForest logo",
        title: "Support Mossy Earth for free with IdleForest.",
        description:
            "Open the IdleForest support page, install once, and future background activity can help generate passive conservation funding for Mossy Earth.",
        href: "/c/mossy-earth",
        cta: "Support for free",
        externalHref: "https://www.mossy.earth/",
        externalCta: "Visit Mossy Earth",
        stats: [
            { value: "700K+", label: "YouTube subscribers" },
            { value: "£408K", label: "to rewilding in Q1 2026" },
        ],
        tags: ["Rewilding", "Conservation", "Free to join"],
        videoSrc: "/partner/mossy-earth/hero-video.mp4",
        imageSrc: "/partner/mossy-earth/planting-portrait.png",
        imageAlt: "A restoration worker planting a young seedling",
        accentClassName: "bg-brand-yellow",
    },
    {
        id: "wastefree-planet",
        eyebrow: "New cleanup partner",
        logoSrc: "/partner/wastefree/wfp-logo-white.webp",
        logoAlt: "Waste Free Planet logo",
        title: "Waste Free Planet joins IdleForest.",
        description:
            "The Waste Free Planet cleanup fund is now live. Join for free and let future background activity help fund ocean-bound plastic recovery through 1ClickImpact and Plastic Bank.",
        href: "/c/wastefree-planet",
        cta: "Join for free",
        externalHref: "https://www.wastefreeplanet.org/",
        externalCta: "Visit Waste Free Planet",
        stats: [
            { value: "100%", label: "profits to plastic removal" },
            { value: "0¢", label: "cost to participate" },
        ],
        tags: ["Plastic removal", "Ocean cleanup", "Free to join"],
        imageSrc: "/partner/wastefree/hero-coast.jpg",
        imageAlt: "A coastline connected to Waste Free Planet cleanup work",
        accentClassName: "bg-cyan-200",
    },
];

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
                                    <br className="hidden sm:block" />
                                    <span className="font-extrabold">{t('hero.title_line4')} </span>
                                </h1>
                                <p className="text-base md:text-lg text-neutral-800 max-w-xl">
                                    {t('hero.description')}
                                </p>
                                <div className="flex flex-col w-full sm:w-auto items-stretch gap-3">
                                    {/* CTAs based on Device/Browser */}
                                    <SmartCTA className="text-black" deviceInfo={deviceInfo} showExtensionDownload />
                                    <Link
                                        href="/how-it-works"
                                        className="inline-flex items-center justify-center gap-2 text-sm font-bold text-black underline decoration-2 underline-offset-4 hover:text-brand-navy sm:justify-start"
                                    >
                                        See how it works <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                                <p className="text-sm font-bold text-black">
                                    Featured on Chrome Web Store · 4.8 ★ from 33 reviews · 5,364 verified trees planted
                                </p>
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

                {/* PARTNERSHIP ANNOUNCEMENTS */}
                <section id="partner-announcements" className="relative overflow-hidden bg-brand-gray text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-14 md:py-20">
                        <div className="mx-auto max-w-3xl text-center">
                            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-neutral-700">
                                Partner projects
                            </p>
                            <h2 className="mt-3 font-rethink-sans text-[34px] font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                                Meet the projects you can support with IdleForest.
                            </h2>
                            <p className="mt-4 text-base leading-7 text-neutral-800 md:text-lg md:leading-8">
                                Choose a partner page, join for free, and future background activity can support that project&apos;s impact stream.
                            </p>
                        </div>

                        {/* Hallmark · component: partner-announcement-cards · pre-emit critique: P5 H4 E4 S5 R4 V4 · contrast: pass (46-50) */}
                        <div className="mt-10 grid gap-6 lg:grid-cols-2">
                            {partnerAnnouncements.map((partner) => (
                                <article
                                    key={partner.id}
                                    id={partner.id}
                                    className="flex min-w-0 flex-col overflow-hidden rounded-lg border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden border-b-2 border-black bg-brand-navy">
                                        {partner.videoSrc ? (
                                            <video
                                                className="h-full w-full object-cover"
                                                autoPlay
                                                muted
                                                loop
                                                playsInline
                                                preload="metadata"
                                                aria-label={`${partner.title} footage`}
                                            >
                                                <source src={partner.videoSrc} type="video/mp4" />
                                            </video>
                                        ) : (
                                            <Image
                                                src={partner.imageSrc}
                                                alt={partner.imageAlt}
                                                fill
                                                sizes="(min-width: 1024px) 50vw, 100vw"
                                                className="object-cover"
                                            />
                                        )}
                                        <div className="absolute left-4 top-4 inline-flex max-w-[calc(100%-2rem)] items-center gap-3 border-2 border-black bg-white px-3 py-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                            <span className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-sm bg-brand-navy p-1">
                                                <Image src={partner.logoSrc} alt={partner.logoAlt} width={36} height={36} className="h-full w-full object-contain" />
                                            </span>
                                            <span className="min-w-0 text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-neutral-700 sm:text-xs">
                                                {partner.eyebrow}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {partner.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className={`border-2 border-black px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] text-black ${partner.accentClassName}`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <h3 className="mt-5 font-rethink-sans text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                                            {partner.title}
                                        </h3>
                                        <p className="mt-4 text-sm leading-7 text-neutral-800 sm:text-base">
                                            {partner.description}
                                        </p>

                                        <div className="mt-6 grid grid-cols-2 gap-3">
                                            {partner.stats.map((stat) => (
                                                <div key={stat.label} className="min-h-[94px] border-2 border-black bg-brand-gray p-4">
                                                    <p className="font-candu text-3xl leading-none text-black">{stat.value}</p>
                                                    <p className="mt-2 text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-neutral-700">
                                                        {stat.label}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                                            <Link
                                                href={partner.href}
                                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-5 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-white hover:shadow-none"
                                            >
                                                {partner.cta} <ArrowRight className="h-4 w-4 flex-none" />
                                            </Link>
                                            <a
                                                href={partner.externalHref}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border-2 border-black bg-white px-5 py-3 text-sm font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-brand-yellow hover:shadow-none"
                                            >
                                                {partner.externalCta} <ArrowRight className="h-4 w-4 flex-none" />
                                            </a>
                                        </div>
                                    </div>
                                </article>
                            ))}
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
                                <span>{t('how_it_works.trees_planted_badge', { count: stats.treesPlanted })}</span>
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
                                    {t('how_it_works.step1_desc')} Learn more about the{" "}
                                    <Link href="/tree-planting-extension" className="font-bold underline hover:text-black">
                                        Chrome extension
                                    </Link>
                                    .
                                </p>
                            </div>
                            <div id="step-2">
                                <div className="text-6xl font-extrabold">2.</div>
                                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
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
                                <div className="text-6xl font-extrabold">3.</div>
                                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
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
                                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-navy px-6 py-3 font-bold text-brand-yellow shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:shadow-none"
                            >
                                See how it works in detail →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* COMPARISON */}
                <section id="comparison" className="relative bg-brand-gray text-black scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="font-rethink-sans text-[36px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                Why IdleForest Is Different From Other Tree Planting Apps
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-neutral-800">
                                Ecosia, Mossy Earth, direct donations, and IdleForest all help in different ways. IdleForest is the extra passive layer: install it once, keep your habits, and let it add funding in the background.
                            </p>
                        </div>

                        {/* Hallmark · component: comparison-proof · pre-emit critique: P5 H4 E4 S5 R4 V4 · contrast: pass (46-50) */}
                        <div className="mt-12 grid gap-4 lg:grid-cols-4">
                            {comparisonProducts.map((product) => (
                                <article
                                    key={product.name}
                                    className={`relative flex min-w-0 flex-col border-2 border-black p-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${product.featured
                                        ? "bg-brand-navy text-brand-yellow"
                                        : "bg-white text-black"
                                        }`}
                                >
                                    {product.featured ? (
                                        <div className="absolute right-4 top-4 border-2 border-brand-yellow bg-brand-yellow px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-black">
                                            Passive layer
                                        </div>
                                    ) : null}
                                    <div className={product.featured ? "pr-24" : ""}>
                                        <h3 className="font-rethink-sans text-2xl font-extrabold leading-tight">
                                            {product.name}
                                        </h3>
                                        <p className={`mt-3 text-sm leading-6 ${product.featured ? "text-brand-yellow/80" : "text-neutral-700"}`}>
                                            {product.summary}
                                        </p>
                                    </div>
                                    <dl className="mt-6 flex-1">
                                        {comparisonCriteria.map((criterion, index) => (
                                            <div
                                                key={`${product.name}-${criterion}`}
                                                className={`border-t py-4 ${product.featured ? "border-brand-yellow/25" : "border-black/10"}`}
                                            >
                                                <dt className={`text-[11px] font-extrabold uppercase tracking-[0.16em] ${product.featured ? "text-brand-yellow/65" : "text-neutral-500"}`}>
                                                    {criterion}
                                                </dt>
                                                <dd className={`mt-1 text-sm font-semibold leading-6 ${product.featured ? "text-brand-yellow" : "text-black"}`}>
                                                    {product.values[index]}
                                                </dd>
                                            </div>
                                        ))}
                                    </dl>
                                </article>
                            ))}
                        </div>

                        <div className="mt-6 grid gap-4 md:grid-cols-2">
                            <div className="border-2 border-black bg-brand-yellow p-5 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-black/70">Stack your impact</p>
                                <p className="mt-2 text-sm font-semibold leading-6">
                                    You can use Ecosia, support Mossy Earth, donate directly, and still add IdleForest in the background.
                                </p>
                            </div>
                            <div className="border-2 border-black bg-white p-5 text-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-neutral-500">Different strengths</p>
                                <p className="mt-2 text-sm font-semibold leading-6">
                                    Search tools are great for daily habits. Rewilding memberships fund expert field teams. IdleForest adds passive funding without replacing either.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm font-bold">
                            <span className="text-neutral-700">Compare in detail:</span>
                            {comparisonLinks.map((item) => (
                                <Link key={item.label} href={item.href} className="underline decoration-2 underline-offset-4 hover:text-brand-navy">
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                        <div className="mt-6 text-center">
                            <Link href="/compare" className="inline-flex items-center gap-2 font-bold underline decoration-2 underline-offset-4 hover:text-brand-navy">
                                Browse the full comparison hub →
                            </Link>
                        </div>
                    </div>
                </section>

                {/* IDLE BANDWIDTH */}
                <section id="idle-bandwidth" className="relative bg-brand-navy text-brand-yellow scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-yellow/70">
                                    Background impact
                                </p>
                                <h2 className="mt-3 font-rethink-sans text-[36px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                    How Idle Bandwidth Funds Trees
                                </h2>
                                <Link
                                    href="/how-it-works"
                                    className="mt-8 inline-flex items-center gap-2 rounded-full border-2 border-brand-yellow bg-brand-yellow px-6 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(224,241,70,0.35)] transition-all hover:bg-white"
                                >
                                    Read the full technical explanation <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="space-y-5 text-base leading-8 text-brand-yellow/90 md:text-lg">
                                <p>Idle bandwidth is the part of your internet connection you are not using. Most of the time, your connection sits at a small fraction of its capacity. The rest is wasted.</p>
                                <p>IdleForest puts that unused capacity to work. The app routes small data tasks through your connection, like checking website uptime or running market research queries. These tasks are sessionless: they do not carry personal data, cookies, or browsing history.</p>
                                <p>Clients pay for those tasks. We take that revenue and send it to our reforestation partners. The result: you plant trees with bandwidth you were not using anyway. The cost to you is zero.</p>
                                <p>This model is why IdleForest is free. We do not need your money, your search history, or your email. We just need the gigabytes you would have wasted.</p>
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
                            <ImpactCard icon={<TreePine className="h-6 w-6 text-brand-yellow" />} value={stats.treesPlanted} label={t('impact.trees_label')} />
                            <ImpactCard icon={<Globe className="h-6 w-6 text-brand-yellow" />} value={stats.totalRequests} label={t('impact.requests_label')} />
                            <ImpactCard icon={<Users className="h-6 w-6 text-brand-yellow" />} value={stats.totalUsers} label={t('impact.users_label')} />
                            <ImpactCard icon={<DollarSign className="h-6 w-6 text-brand-yellow" />} value={stats.earnings} label={t('impact.contributions_label')} />
                        </div>
                        <div className="mt-10 text-center">
                            <Link
                                href="/transparency"
                                className="inline-flex items-center gap-2 rounded-full border-2 border-black bg-brand-yellow px-6 py-3 font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-white hover:shadow-none"
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
                                            IdleForest has funded 5,364 trees through our partners. We update the monthly total on the transparency report as new partner records are added.
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
                                            Not yet. IdleForest runs as a Chrome extension and as a desktop app for Mac and Windows.
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
                <section id="start" className="relative bg-brand-navy text-brand-yellow scroll-mt-24">
                    <div className="container mx-auto px-6 py-20 md:py-24">
                        <div className="mx-auto max-w-3xl text-center">
                            <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                                Start Planting Trees in 10 Seconds
                            </h2>
                            <p className="mt-4 text-base md:text-lg text-brand-yellow/80">
                                Install IdleForest. Browse like you always do. Watch trees get planted.
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
                                    "text": "Not yet. The app runs as a Chrome extension and as a desktop app for Mac and Windows. Mobile is on the roadmap, but mobile networks have less idle bandwidth than home connections, so the impact per user would be lower. We will launch when the math works."
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
