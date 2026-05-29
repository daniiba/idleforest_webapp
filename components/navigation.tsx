'use client'

import { Apple, ChevronDown, Chrome, LogOut, Menu, Monitor, X } from "lucide-react"
import { Link, usePathname, useRouter } from "@/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "./ui/button"
import TopTeamsBanner from "@/components/TopTeamsBanner"
import { LanguageSelector } from "./LanguageSelector"
import { useTranslations } from "next-intl"
import { useDeviceDetection } from "@/hooks/useDeviceDetection"

const chromeWebStoreUrl = "https://chromewebstore.google.com/detail/idle-forest-plant-trees-f/ofdclafhpmccdddnmfalihgkahgiomjk"

const downloadLinks = [
  { href: '/download/chrome', label: 'Chrome Extension' },
  { href: '/download/windows', label: 'Windows App' },
  { href: '/download/mac', label: 'Mac App' },
]

const moreLinks = [
  { href: '/teams', label: 'Rankings' },
  { href: '/map', label: 'Map' },
  { href: '/report', label: 'Report' },
  { href: '/business', label: 'Business' },
  { href: '/discord-bot', label: 'Discord Bot' },
]

interface NavigationProps {
  variant?: 'default' | 'dashboard'
  hideBanner?: boolean
}

export default function Navigation({ variant = 'default', hideBanner = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string>('/')
  const pathname = usePathname()
  const router = useRouter()
  const t = useTranslations('Navigation')
  const { isMobile, isChrome, isMac, isWindows } = useDeviceDetection()

  // Use centralized auth context
  const { user, signOut } = useAuth()

  // Fetch profile URL when user changes
  useEffect(() => {
    const fetchProfileUrl = async () => {
      if (!user) {
        setProfileUrl('/')
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single()

        if (profile?.display_name) {
          setProfileUrl(`/profile/${encodeURIComponent(profile.display_name)}`)
        }
      } catch (err) {
        console.error('Navigation fetchProfileUrl error:', err)
      }
    }

    fetchProfileUrl()
  }, [user])

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    await signOut()
    setProfileUrl('/')
    setIsMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const trackHeaderInstallClick = (itemId: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const analyticsWindow = window as Window & {
      gtag?: (command: string, eventName: string, params?: Record<string, string>) => void
    }

    analyticsWindow.gtag?.('event', 'select_content', {
      content_type: 'install_cta',
      item_id: itemId,
      source_page: pathname,
    })
  }

  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href)
  const hasActiveChild = (items: Array<{ href: string }>) => items.some(({ href }) => isActive(href))
  const desktopDownloadHref = isMac ? '/download/mac' : '/download/windows'
  const desktopDownloadLabel = isMac
    ? 'Download for Mac — It’s Free'
    : isWindows
      ? 'Download for Windows — It’s Free'
      : 'Download Desktop — It’s Free'
  const DesktopDownloadIcon = isMac ? Apple : Monitor

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/20 backdrop-blur-md shadow-sm transition-all">
      {!hideBanner && <TopTeamsBanner />}
      <div className="relative mx-auto px-4 h-24 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Link href='/' className="flex items-center gap-2 col-start-1 justify-self-start">
          <Image src="/logo.png" alt="IdleForest logo" width={121} height={33} className="w-[100px] md:w-[121px]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6 col-start-2 justify-self-center items-center whitespace-nowrap">
          <NavLink href="/how-it-works" label="How it Works" active={isActive('/how-it-works')} />
          <NavDropdown label="Download" active={hasActiveChild(downloadLinks)} items={downloadLinks} />
          <NavLink href="/transparency" label="Transparency" active={isActive('/transparency')} />
          <NavDropdown label="More" active={hasActiveChild(moreLinks)} items={moreLinks} />
        </nav>
        <div className="absolute z-[-100] top-0 left-0 bg-brand-gray opacity-50 h-full w-full"></div>

        {isMobile && isChrome && (
          <a
            href={chromeWebStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-source-page={pathname}
            onClick={() => trackHeaderInstallClick('add_to_chrome_header_mobile')}
            className="md:hidden col-start-2 justify-self-center inline-flex max-w-[190px] items-center justify-center gap-1.5 rounded-full bg-brand-yellow px-3 py-2 text-center text-xs font-bold leading-tight text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black"
          >
            <Chrome className="h-4 w-4 shrink-0" />
            Add to Chrome — It’s Free
          </a>
        )}

        {/* Desktop CTA / User */}
        <div className="hidden md:flex justify-self-end col-start-3 items-center gap-3">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-2">

              <Link href={profileUrl}>
                <Button className="bg-brand-yellow text-black border-2 border-black hover:bg-white hover:text-black font-bold font-candu uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 transition-all active:translate-y-1">
                  {t('profile')}
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 border-2 border-transparent hover:border-black rounded-md hover:bg-red-50 text-neutral-600 hover:text-red-600 transition-all"
                title="Log out"
              >
                <LogOut size={24} />
              </button>
            </div>
          ) : (
            <Link href="/auth/user/login">
              <Button className="bg-black text-white border-2 border-transparent hover:bg-brand-yellow hover:text-black hover:border-black font-bold font-candu uppercase text-lg shadow-none hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                {t('login')}
              </Button>
            </Link>
          )}
          <Link
            href={desktopDownloadHref}
            data-source-page={pathname}
            onClick={() => trackHeaderInstallClick(isMac ? 'download_mac_header' : 'download_windows_header')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-3 text-sm font-extrabold leading-none text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ring-2 ring-black transition-all hover:bg-white hover:shadow-none lg:px-5"
          >
            <DesktopDownloadIcon className="h-5 w-5 shrink-0" />
            <span>{desktopDownloadLabel}</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="md:hidden justify-self-end col-start-3 p-2 rounded-md hover:bg-black/10 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="text-black" size={28} /> : <Menu className="text-black" size={28} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden bg-brand-gray/95 backdrop-blur-xl border-t border-black/10 absolute w-full left-0 top-full shadow-xl">
          <div className="container mx-auto px-4 py-6 flex max-h-[calc(100vh-6rem)] flex-col gap-3 overflow-y-auto">
            <MobileLink href="/how-it-works" label="How it Works" active={isActive('/how-it-works')} onClick={() => setIsMenuOpen(false)} />

            <div className="rounded-lg border-2 border-black/10 bg-white/50 p-3">
              <p className="mb-2 text-center text-sm font-extrabold uppercase text-neutral-600">Download</p>
              <div className="flex flex-col gap-2">
                {downloadLinks.map(({ href, label }) => (
                  <MobileLink key={href} href={href} label={label} active={isActive(href)} onClick={() => setIsMenuOpen(false)} compact />
                ))}
              </div>
            </div>

            <MobileLink href="/transparency" label="Transparency" active={isActive('/transparency')} onClick={() => setIsMenuOpen(false)} />

            <div className="rounded-lg border-2 border-black/10 bg-white/50 p-3">
              <p className="mb-2 text-center text-sm font-extrabold uppercase text-neutral-600">More</p>
              <div className="flex flex-col gap-2">
                {moreLinks.map(({ href, label }) => (
                  <MobileLink key={href} href={href} label={label} active={isActive(href)} onClick={() => setIsMenuOpen(false)} compact />
                ))}
              </div>
            </div>

            {user ? (
              <div className="space-y-4">
                <Link href={profileUrl} onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-brand-yellow text-black border-2 border-black font-bold font-candu uppercase text-xl py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {t('go_to_profile')}
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 font-bold text-red-600 hover:bg-red-50 rounded-md"
                >
                  {t('log_out')}
                </button>
              </div>
            ) : (
              <Link href="/auth/user/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button className="w-full bg-black text-white font-bold font-candu uppercase text-xl py-6 border-2 border-transparent">
                  {t('login')}
                </Button>
              </Link>
            )}

            <LanguageSelector variant="mobile" />
          </div>
        </nav>
      )}
    </header>
  )
}

function NavLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`relative px-1 pb-1 pt-2 text-base lg:text-lg font-bold leading-none tracking-normal text-center transition-colors duration-150 text-black hover:text-brand-yellow ${active ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-brand-yellow after:content-[""]' : ''
        }`}
    >
      {label}
    </Link>
  )
}

function NavDropdown({
  label,
  active,
  items,
}: {
  label: string
  active: boolean
  items: Array<{ href: string; label: string }>
}) {
  return (
    <div className="group relative">
      <button
        type="button"
        className={`relative inline-flex items-center gap-1 px-1 pb-1 pt-2 text-base lg:text-lg font-bold leading-none tracking-normal text-black transition-colors duration-150 hover:text-brand-yellow ${active ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-brand-yellow after:content-[""]' : ''
          }`}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 mt-3 min-w-56 -translate-x-1/2 rounded-lg border-2 border-black bg-white p-2 opacity-0 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {items.map(({ href, label: itemLabel }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-md px-4 py-3 text-sm font-bold text-black hover:bg-brand-yellow"
          >
            {itemLabel}
          </Link>
        ))}
      </div>
    </div>
  )
}

function MobileLink({
  href,
  label,
  active,
  onClick,
  compact = false,
}: {
  href: string
  label: string
  active: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`${compact ? 'py-2 text-lg' : 'py-2 text-2xl'} text-center font-bold transition-colors ${active ? 'text-brand-yellow' : 'text-black hover:text-brand-yellow'}`}
    >
      {label}
    </Link>
  )
}
