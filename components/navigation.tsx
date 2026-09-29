'use client'

import { ChevronDown, Chrome, LogOut, Menu, X } from "lucide-react"
import { OsLogo } from "@/components/icons/os-logos"
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
  { href: '/download/linux', label: 'Linux App' },
]

const moreLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/values', label: 'Values' },
  { href: '/teams', label: 'Rankings' },
  { href: '/map', label: 'Map' },
  { href: '/report', label: 'Report' },
  { href: '/business', label: 'Partner Funding' },
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
  const { isMobile, isChrome, isMac, isLinux } = useDeviceDetection()

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
  const pathSuggestsMac = pathname.startsWith('/download/mac')
  const pathSuggestsLinux = pathname.startsWith('/download/linux')
  const headerCtaPlatform = isLinux || pathSuggestsLinux ? 'linux' : isMac || pathSuggestsMac ? 'mac' : 'windows'
  const headerCtaPlatformLabel = headerCtaPlatform === 'mac' ? 'Mac' : headerCtaPlatform === 'linux' ? 'Linux' : 'Windows'
  const desktopDownloadActionHref = `/download/${headerCtaPlatform}/installer`
  const desktopDownloadLabel = `Download for ${headerCtaPlatformLabel} — It’s Free`
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/85 backdrop-blur-md transition-all">
      {!hideBanner && <TopTeamsBanner />}
      <div className="relative mx-auto max-w-7xl px-4 h-20 grid grid-cols-[auto_1fr_auto] items-center gap-3">
        <Link href='/' className="flex items-center gap-2 col-start-1 justify-self-start">
          <Image src="/logo.png" alt="IdleForest logo" width={121} height={33} className="w-[100px] md:w-[121px]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-4 lg:gap-6 col-start-2 justify-self-center items-center whitespace-nowrap">
          <NavLink href="/how-it-works" label="How it Works" active={isActive('/how-it-works')} />
          <NavLink href="/partners" label="Partners" active={isActive('/partners')} />
          <NavDropdown label="Download" active={hasActiveChild(downloadLinks)} items={downloadLinks} />
          <NavLink href="/transparency" label="Transparency" active={isActive('/transparency')} />
          <NavDropdown label="More" active={hasActiveChild(moreLinks)} items={moreLinks} />
        </nav>

        {isMobile && isChrome && (
          <a
            href={chromeWebStoreUrl}
            target="_blank"
            rel="noopener noreferrer"
            data-source-page={pathname}
            onClick={() => trackHeaderInstallClick('add_to_chrome_header_mobile')}
            className="lg:hidden col-start-2 justify-self-center inline-flex max-w-[190px] items-center justify-center gap-1.5 rounded-full bg-brand-yellow px-3 py-2 text-center text-xs font-bold leading-tight text-brand-navy"
          >
            <Chrome className="h-4 w-4 shrink-0" />
            Add to Chrome — It’s Free
          </a>
        )}

        {/* Desktop CTA / User */}
        <div className="hidden lg:flex justify-self-end col-start-3 items-center gap-3">
          <LanguageSelector />
          {user ? (
            <div className="flex items-center gap-2">

              <Link href={profileUrl}>
                <Button className="rounded-full bg-brand-navy px-5 text-sm font-bold text-white hover:bg-black">
                  {t('profile')}
                </Button>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 text-neutral-500 hover:text-red-600 transition-colors"
                title="Log out"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link href="/auth/user/login">
              <Button variant="ghost" className="rounded-full px-5 text-sm font-bold text-brand-navy hover:bg-neutral-100">
                {t('login')}
              </Button>
            </Link>
          )}
          <a
            href={desktopDownloadActionHref}
            data-source-page={pathname}
            onClick={() => trackHeaderInstallClick(`download_${headerCtaPlatform}_header`)}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-yellow px-4 py-3 text-sm font-bold leading-none text-brand-navy transition-all hover:brightness-95 lg:px-5"
          >
            <OsLogo os={headerCtaPlatform} className="h-5 w-5 shrink-0" />
            <span>{desktopDownloadLabel}</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button
          aria-label="Toggle menu"
          aria-expanded={isMenuOpen}
          className="lg:hidden justify-self-end col-start-3 p-2 rounded-full hover:bg-neutral-100 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X className="text-brand-navy" size={26} /> : <Menu className="text-brand-navy" size={26} />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="lg:hidden bg-white border-t border-neutral-200 absolute w-full left-0 top-full shadow-xl">
          <div className="container mx-auto px-4 py-6 flex max-h-[calc(100vh-5rem)] flex-col gap-3 overflow-y-auto">
            <MobileLink href="/how-it-works" label="How it Works" active={isActive('/how-it-works')} onClick={() => setIsMenuOpen(false)} />
            <MobileLink href="/partners" label="Partners" active={isActive('/partners')} onClick={() => setIsMenuOpen(false)} />

            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="mb-2 text-center text-xs font-semibold text-neutral-500">Download</p>
              <div className="flex flex-col gap-2">
                {downloadLinks.map(({ href, label }) => (
                  <MobileLink key={href} href={href} label={label} active={isActive(href)} onClick={() => setIsMenuOpen(false)} compact />
                ))}
              </div>
            </div>

            <MobileLink href="/transparency" label="Transparency" active={isActive('/transparency')} onClick={() => setIsMenuOpen(false)} />

            <div className="rounded-2xl bg-neutral-50 p-3">
              <p className="mb-2 text-center text-xs font-semibold text-neutral-500">More</p>
              <div className="flex flex-col gap-2">
                {moreLinks.map(({ href, label }) => (
                  <MobileLink key={href} href={href} label={label} active={isActive(href)} onClick={() => setIsMenuOpen(false)} compact />
                ))}
              </div>
            </div>

            {user ? (
              <div className="space-y-4">
                <Link href={profileUrl} onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full rounded-full bg-brand-navy py-6 text-base font-bold text-white hover:bg-black">
                    {t('go_to_profile')}
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 font-bold text-red-600 hover:bg-red-50 rounded-full"
                >
                  {t('log_out')}
                </button>
              </div>
            ) : (
              <Link href="/auth/user/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button className="w-full rounded-full bg-brand-navy py-6 text-base font-bold text-white hover:bg-black">
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
      className={`rounded-full px-3.5 py-2 text-sm lg:text-base font-semibold leading-none text-center transition-colors duration-150 hover:bg-neutral-100 ${active ? 'bg-neutral-100 text-brand-navy' : 'text-neutral-700 hover:text-brand-navy'}`}
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
        className={`inline-flex items-center gap-1 rounded-full px-3.5 py-2 text-sm lg:text-base font-semibold leading-none transition-colors duration-150 hover:bg-neutral-100 ${active ? 'bg-neutral-100 text-brand-navy' : 'text-neutral-700 hover:text-brand-navy'}`}
      >
        {label}
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 mt-3 min-w-56 -translate-x-1/2 rounded-2xl border border-neutral-200 bg-white p-2 opacity-0 shadow-lg transition-all duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
        {items.map(({ href, label: itemLabel }) => (
          <Link
            key={href}
            href={href}
            className="block rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-navy hover:bg-neutral-100"
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
      className={`${compact ? 'py-2 text-lg' : 'py-2 text-2xl'} text-center font-bold transition-colors ${active ? 'text-brand-navy underline decoration-brand-yellow decoration-4 underline-offset-4' : 'text-neutral-700 hover:text-brand-navy'}`}
    >
      {label}
    </Link>
  )
}
