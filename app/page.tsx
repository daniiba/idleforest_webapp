"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Leaf, Chrome, Wifi, TreePine, PlayCircle, CheckCircle2, Shield, BadgeCheck, BarChart3, ShieldCheck, Globe, Users, DollarSign, Monitor, Smartphone, Share2, Award, Check, Download, ChevronDown, Apple } from "lucide-react";
import Navigation from "@/components/navigation";
import { useEffect, useState } from "react";

import { EmailForm } from "@/components/email-form";
import { useDeviceDetection } from "@/hooks/useDeviceDetection";
import { ReviewsSection } from "@/components/reviews-section";
import { SmartCTA } from "@/components/smart-cta";

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    earnings: "$0",
    treesPlanted: 0,
  });

  const { isMobile, isDesktop, isChrome, isEdge, isSafari, isFirefox, isMac, isWindows } = useDeviceDetection();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
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
      <main className="min-h-screen bg-brand-gray text-white pt-32 lg:pt-24 xl:pt-0">
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
          <div className="container mx-auto px-6 ">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Image src="/europelogo.svg" alt="European Union flag" width={74} height={62} />
                </div>
                <h1 className="font-candu text-black uppercase text-[38px] sm:text-5xl md:text-6xl leading-[1.05]">
                  <span className="font-extrabold">TURN YOUR IDLE </span>
                  <br className="hidden sm:block" />
                  <span className="font-extrabold">INTERNET INTO </span>
                  <br className="hidden sm:block" />
                  <span className="font-extrabold">REAL TREES </span>
                </h1>
                <p className="text-base md:text-lg text-neutral-800 max-w-xl">
                  Our desktop app safely uses your unused bandwidth to fund tree planting around the world. Join thousands making an environmental impact while your computer is idle.
                </p>
                <div className="flex flex-col w-full sm:w-auto items-stretch gap-3">
                  {/* CTAs based on Device/Browser */}
                  <SmartCTA className="text-black" />
                </div>
                <ul className="mt-2 space-y-2 text-sm text-neutral-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-black" /> 100% Safe & Secure
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-black" /> No Performance Impact
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-black" /> Plant trees automatically
                  </li>
                </ul>
              </div>
              {/* HERO ART PLACEHOLDER */}
              <div className="relative">
                {/* Masked video inside the Union shape (previous working approach) */}
                <div className="relative w-full aspect-[4/3] grid place-items-center">
                  <div className="mask-union w-[90%] h-[90%] mt-[-100px] lg:mt-[0px]">
                    <video
                      className="w-full h-full object-cover"
                      src="/7654892-hd_1080_1920_25fps.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-label="Idleforest demo video"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ROADMAP / WHAT WE ACHIEVED */}

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="relative bg-brand-yellow text-black scroll-mt-24">
          <div className="container mx-auto px-6 py-24 md:py-28">
            {/* Badge */}
            <div className="w-full flex justify-center">
              <div className="text-brand-yellow inline-flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium shadow">
                <Leaf className="h-4 w-4" />
                <span>{stats.treesPlanted.toLocaleString()} trees planted by our community</span>
              </div>
            </div>

            {/* Heading */}
            <div className="text-center mt-6">
              <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                How it works
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
                Three simple steps to start making an environmental impact with your unused internet connection.
              </p>
            </div>

            {/* Video demo area */}
            <div className="mt-14 grid place-items-center">
              <div className="w-full max-w-5xl aspect-[16/9] rounded-lg overflow-hidden border-2 border-black/10 shadow-lg">
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

            {/* Three steps */}
            <div className="mt-20 grid gap-12 lg:grid-cols-3">
              <div>
                <div className="text-6xl font-extrabold">1.</div>
                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                  Install Extension
                </h3>
                <p className="mt-3 text-neutral-800 max-w-sm">
                  Add our lightweight Chrome extension in seconds. No registration or setup required.
                </p>
              </div>
              <div>
                <div className="text-6xl font-extrabold">2.</div>
                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                  Share Unused Bandwidth
                </h3>
                <p className="mt-3 text-neutral-800 max-w-sm">
                  Your idle internet connection is securely used for approved research and content delivery—replacing traditional data centers that consume massive amounts of energy and water.{" "}
                  <Link href="/transparency" className="font-bold underline hover:text-black">
                    See how we're 80-90% greener than server farms
                  </Link>
                </p>
              </div>
              <div>
                <div className="text-6xl font-extrabold">3.</div>
                <h3 className="mt-4 font-inter font-light text-[50px] leading-[1] tracking-[-0.03em]">
                  We Plant Trees
                </h3>
                <p className="mt-3 text-neutral-800 max-w-sm">
                  Revenue generated funds verified tree planting projects worldwide. Track your impact in real-time.
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
                Desktop Apps Available Now
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-3xl mx-auto">
                By downloading IdleForest, you're joining a global community dedicated to reforestation and environmental conservation. Our application runs in the background, utilizing your idle computing resources to help plant trees around the world.
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
                  Download IdleForest for Windows to start making a difference with your idle computing power.
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
                  >
                    <Download className="h-5 w-5" />
                    Download for Windows
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
                  Download IdleForest for macOS to contribute to reforestation efforts while your computer is idle.
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
                  >
                    <Download className="h-5 w-5" />
                    Download for Mac OS
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
              <h2 className="font-rethink-sans text-black text-3xl sm:text-4xl md:text-5xl font-extrabold">Our Impact</h2>
            </div>
            {/* 2x2 grid, no gaps so borders align perfectly */}
            <div className="grid gap-2 sm:grid-cols-2">
              <ImpactCard icon={<TreePine className="h-6 w-6 text-brand-yellow" />} value={stats.treesPlanted.toLocaleString()} label="TREES TO BE PLANTED" />
              <ImpactCard icon={<Globe className="h-6 w-6 text-brand-yellow" />} value={stats.totalRequests.toLocaleString()} label="TOTAL REQUESTS" />
              <ImpactCard icon={<Users className="h-6 w-6 text-brand-yellow" />} value={stats.totalUsers.toLocaleString()} label="ACTIVE USERS" />
              <ImpactCard icon={<DollarSign className="h-6 w-6 text-brand-yellow" />} value={stats.earnings} label="TOTAL CONTRIBUTIONS" />
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <ReviewsSection />

        {/* ACHIEVEMENTS */}
        <section id="achievements" className="relative bg-brand-gray text-black scroll-mt-24">
          <div className="relative container mx-auto px-6 py-20 md:py-24">
            <div className="text-center mb-10 md:mb-12">
              <h2 className="font-rethink-sans text-[36px] sm:text-5xl md:text-6xl font-extrabold">
                What we achieved
                <br className="hidden sm:block" />
                & where we're heading
              </h2>
            </div>

            <div className="space-y-6">
              <RoadmapItem
                icon={<Chrome className="h-6 w-6" />}
                title="BROWSER EXTENSION"
                status={{ label: "COMPLETED", variant: "success" }}
                description="Launched our flagship browser extensions for Chrome, Firefox, and Edge. This key milestone allows users to seamlessly contribute to reforestation during their daily browsing, making eco‑friendly actions more accessible."
              />

              <RoadmapItem
                icon={<Monitor className="h-6 w-6" />}
                title="DESKTOP APP"
                status={{ label: "BETA", variant: "warning" }}
                description="Our desktop application expands Idleforest beyond the browser, enabling contributions even when you’re not actively browsing."
              />

              <RoadmapItem
                icon={<Share2 className="h-6 w-6" />}
                title="REFERRAL SYSTEM"
                status={{ label: "IN DEV", variant: "info" }}
                description="Invite friends and businesses to multiply impact. Earn bonus trees for successful referrals and help grow the forest faster."
              />

              <RoadmapItem
                icon={<Smartphone className="h-6 w-6" />}
                title="MOBILE APP"
                status={{ label: "PLANNED", variant: "neutral" }}
                description="Bring Idleforest to iOS and Android so you can contribute on the go with smart, energy‑efficient usage."
              />

              <RoadmapItem
                icon={<Award className="h-6 w-6" />}
                title="CORPORATE IMPACT CERTIFICATION"
                status={{ label: "PLANNED", variant: "neutral" }}
                description="A verification program for companies to certify and showcase their environmental contributions powered by Idleforest."
              />
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="relative bg-brand-yellow text-black scroll-mt-24">
          <div className="container mx-auto px-6 py-20 md:py-24">
            <div className="text-center mb-12">
              <h2 className="font-rethink-sans text-[40px] sm:text-5xl md:text-6xl font-extrabold tracking-tight">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
                Got questions? We've got answers. Learn more about how IdleForest works and what to expect.
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-4">
              <FaqItem
                question="How do I install and use the extension?"
                answer={
                  <div className="w-full mt-4 aspect-video rounded-lg overflow-hidden">
                    <iframe
                      width="100%"
                      height="100%"
                      src="https://www.youtube.com/embed/U5eyP3zOMg0"
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
                question="Why does the extension ask for 'read and change all data on all pages' permission?"
                answer={
                  <>
                    <p className="mb-3">
                      We understand this permission sounds broader than expected. Here's what's actually happening: <strong>We don't read or access any data from the websites you visit.</strong>
                    </p>
                    <p className="mb-3">
                      Instead, the extension uses your unused bandwidth by fetching websites in a sessionless manner, ensuring no personal data is transmitted. This operates in complete isolation and doesn't have access to the page's content or your browsing data.
                    </p>
                    <p className="mb-3">
                      The reason we need this broad permission is a technical limitation of how browser extensions work. To enable this functionality on any page, we need the permission that allows content injection. Unfortunately, browsers don't offer a more granular permission option—it's bundled under the "read and change" category, even though we're only using the injection capability.
                    </p>
                    <p className="mb-3">
                      <strong>Your privacy and security are important to us.</strong> We're committed to only using the minimum functionality necessary to make the extension work.
                    </p>
                    <p>
                      The good news is that our code is open source, so you don't have to take our word for it. You can review the code yourself to verify our claims. Learn more about{" "}
                      <a
                        href="https://developer.mozilla.org/en-US/docs/Web/Security/IFrame_credentialless"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline hover:text-white"
                      >
                        credentialless iframes and their security
                      </a>.
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 0}
                onClick={() => setOpenFaqIndex(openFaqIndex === 0 ? null : 0)}
              />

              <FaqItem
                question="Is IdleForest safe to use?"
                answer={
                  <>
                    <p className="mb-3">
                      Yes! IdleForest is completely safe. We use industry-standard security practices and our code is open source for full transparency.
                    </p>
                    <p className="mb-3">
                      Your unused bandwidth is only used for approved research and content delivery purposes. We never access your personal data, browsing history, or any sensitive information.
                    </p>
                    <p>
                      For complete details about who uses your bandwidth and how we protect you legally, visit our{" "}
                      <Link href="/transparency" className="font-bold underline hover:text-white">
                        Transparency Page
                      </Link>.
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 1}
                onClick={() => setOpenFaqIndex(openFaqIndex === 1 ? null : 1)}
              />

              <FaqItem
                question="Will this slow down my internet?"
                answer={
                  <>
                    <p className="mb-3">
                      No. IdleForest only uses your <strong>idle</strong> bandwidth—the internet capacity you're not actively using.
                    </p>
                    <p>
                      Our extension is designed to have zero impact on your browsing experience. If you're streaming, gaming, or doing anything that requires bandwidth, IdleForest automatically scales back to ensure your activities aren't affected.
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 2}
                onClick={() => setOpenFaqIndex(openFaqIndex === 2 ? null : 2)}
              />

              <FaqItem
                question="How are trees actually planted?"
                answer={
                  <>
                    <p className="mb-3">
                      When you use IdleForest, your shared bandwidth generates revenue. We use 100% of this revenue to fund verified tree planting projects around the world.
                    </p>
                    <p>
                      We partner with established organizations like Trees for the Future and Tree-Nation to ensure every tree is planted, tracked, and contributes to real environmental impact. You can track your personal contribution in real-time through your dashboard.
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 3}
                onClick={() => setOpenFaqIndex(openFaqIndex === 3 ? null : 3)}
              />

              <FaqItem
                question="Do I need to keep my browser open?"
                answer={
                  <>
                    <p className="mb-3">
                      For the browser extension, yes—your browser needs to be open for IdleForest to work.
                    </p>
                    <p>
                      However, we also offer desktop applications for Windows and macOS that run in the background even when your browser is closed. This allows you to maximize your impact without changing your daily routine.
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 4}
                onClick={() => setOpenFaqIndex(openFaqIndex === 4 ? null : 4)}
              />

              <FaqItem
                question="I'm concerned about supporting AI companies. Why should I use IdleForest?"
                answer={
                  <>
                    <p className="mb-3">
                      We understand this concern. Here's the reality: AI companies will collect web data regardless—it's essential for training models and powering applications.
                    </p>
                    <p className="mb-3">
                      <strong>The question isn't whether data collection happens, but how.</strong> Traditional web scraping uses massive data centers that consume enormous amounts of electricity and water. These server farms are responsible for 1-2% of global electricity consumption.
                    </p>
                    <p className="mb-3">
                      Distributed networks like the one we use are <strong>80-90% more environmentally friendly</strong> than traditional data centers. They use existing devices and idle bandwidth instead of dedicated servers running 24/7 with intensive cooling systems.
                    </p>
                    <p>
                      By using IdleForest, you're not enabling something new—you're helping make an existing industry significantly greener while funding reforestation. It's harm reduction that creates positive environmental impact.{" "}
                      <Link href="/transparency" className="font-bold underline hover:text-white">
                        Learn more about the environmental benefits
                      </Link>
                    </p>
                  </>
                }
                isOpen={openFaqIndex === 5}
                onClick={() => setOpenFaqIndex(openFaqIndex === 5 ? null : 5)}
              />

              {/* Disambiguation note for GEO - helps AI engines distinguish from "Idle Forest" mobile game */}
              <p className="mt-6 text-center text-sm text-neutral-600 italic">
                IdleForest is a browser extension and desktop app for reforestation. Not associated with the "Idle Forest" mobile game.
              </p>
            </div>
          </div>
        </section>
      </main>
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
