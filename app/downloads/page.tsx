import Navigation from "@/components/navigation";
import {
  ChromeStoreButton,
  EdgeStoreButton
} from "@/components/browser-buttons";
import Head from 'next/head';
import Footer from "@/components/Footer";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Monitor, Download } from "lucide-react";

const DownloadsPage = () => {
  return (
    <div className="min-h-screen bg-brand-gray text-white">
      <Head>
        <title>Downloads - IdleForest</title>
        <meta name="description" content="Download IdleForest for your desktop or browser. Start planting trees today!" />
      </Head>
      <Navigation />
      <main className="min-h-screen">

        {/* Header Section */}
        <section className="relative overflow-hidden pt-10 pb-20">
          {/* Decorative wavy background */}
          <Image
            src="/Vector (Stroke).svg"
            alt=""
            fill
            priority
            sizes="150vw"
            className="absolute top-[100px] right-[100px] object-cover pointer-events-none select-none opacity-50"
          />
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="font-candu text-black uppercase text-[38px] sm:text-5xl md:text-6xl leading-[1.05] mb-6">
              <span className="font-extrabold">DOWNLOAD IDLEFOREST</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
              Get started with IdleForest on your preferred platform. Choose from our desktop applications for an enhanced experience or our lightweight browser extensions.
            </p>
          </div>
        </section>

        {/* Desktop Applications Section (Replicated from Landing Page) */}
        <section id="desktop-apps" className="relative bg-brand-gray text-black scroll-mt-24 pb-20">
          <div className="container mx-auto px-6">


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

        {/* Browser Extensions Section */}
        <section className="pb-24">
          <div className="container mx-auto px-6 text-black">
            <div className="text-center mb-10">
              <h2 className="font-rethink-sans text-[30px] sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                Browser Extensions
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-800 max-w-2xl mx-auto">
                Lightweight and easy to install in your favorite browser.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-8 flex-wrap">
              <ChromeStoreButton />
              <EdgeStoreButton />
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default DownloadsPage;
