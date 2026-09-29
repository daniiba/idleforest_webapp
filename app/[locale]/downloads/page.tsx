'use client'

import Navigation from "@/components/navigation";
import {
  ChromeStoreButton,
  EdgeStoreButton
} from "@/components/browser-buttons";
import { Link } from "@/navigation";
import { Button } from "@/components/ui/button";
import { Monitor, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { WindowsLogo, AppleLogo, LinuxLogo, OsLogo } from "@/components/icons/os-logos";

const DownloadsPage = () => {
  const t = useTranslations('Downloads');

  return (
    <div className="min-h-screen bg-[#F7F7F2] text-brand-navy">
      <Navigation />
      <main className="min-h-screen">

        {/* Header Section */}
        <section className="relative overflow-hidden pt-10 pb-20">
          <div className="container mx-auto px-6 relative z-10 text-center">
            <h1 className="text-brand-navy text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight mb-4 lowercase first-letter:uppercase">
              <span className="font-extrabold">{t('title')}</span>
            </h1>
            <p className="text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>
        </section>

        {/* Desktop Applications Section */}
        <section id="desktop-apps" className="relative bg-[#F7F7F2] text-brand-navy scroll-mt-24 pb-20">
          <div className="container mx-auto px-6">
            <div className="grid gap-6 md:grid-cols-3 max-w-7xl mx-auto">
              {/* Windows Card */}
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-brand-navy flex items-center justify-center mb-6 rounded-xl">
                  <WindowsLogo className="h-6 w-6 text-brand-yellow" />
                </div>
                <h3 className="text-2xl font-extrabold mb-3">
                  Windows
                </h3>
                <p className="text-neutral-600 mb-8 max-w-sm">
                  {t('windows_desc')}
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
                  >
                    <Download className="h-5 w-5" />
                    {t('download_windows')}
                  </Link>
                </Button>
              </div>

              {/* Linux Card */}
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-brand-navy flex items-center justify-center mb-6 rounded-xl">
                  <LinuxLogo className="h-6 w-6 text-brand-yellow" />
                </div>
                <h3 className="text-2xl font-extrabold mb-3">
                  Linux
                </h3>
                <p className="text-neutral-600 mb-8 max-w-sm">
                  {t('linux_desc')}
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
                  >
                    <Download className="h-5 w-5" />
                    {t('download_linux')}
                  </Link>
                </Button>
              </div>

              {/* Mac OS Card */}
              <div className="bg-white rounded-3xl border border-neutral-200 shadow-sm p-8 flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-brand-navy flex items-center justify-center mb-6 rounded-xl">
                  <AppleLogo className="h-6 w-6 text-brand-yellow" />
                </div>
                <h3 className="text-2xl font-extrabold mb-3">
                  macOS
                </h3>
                <p className="text-neutral-600 mb-8 max-w-sm">
                  {t('mac_desc')}
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
                  >
                    <Download className="h-5 w-5" />
                    {t('download_mac')}
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
              <h2 className="text-[30px] sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                {t('browser_heading')}
              </h2>
              <p className="mt-4 text-base md:text-lg text-neutral-600 max-w-2xl mx-auto">
                {t('browser_desc')}
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
