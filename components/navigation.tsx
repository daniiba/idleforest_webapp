'use client'

import { Menu, X, LogOut } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { supabase } from "@/lib/supabase/client"
import { Button } from "./ui/button"

interface NavigationProps {
  variant?: 'default' | 'dashboard'
}

export default function Navigation({ variant = 'default' }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [profileUrl, setProfileUrl] = useState<string>('/')
  const pathname = usePathname()
  const router = useRouter()

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

  const handleLogout = async () => {
    await signOut()
    setProfileUrl('/')
    setIsMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  const navLinks = [
    { href: '/teams', label: 'Rankings' },
    { href: '/report', label: 'Report' },
    { href: '/transparency', label: 'Transparency' },
    { href: '/map', label: 'Map' },
    { href: '/business', label: 'Business' },
    { href: '/blog', label: 'Blog' },
  ]

  return (
    <header className={`fixed top-0 z-50 w-full border-b border-white/20 backdrop-blur-md shadow-sm transition-all`}>
      <div className="relative mx-auto px-4 h-24 grid grid-cols-3 items-center">
        <Link href='/' className="flex items-center gap-2 col-start-1 justify-self-start">
          <Image src="/logo.svg" alt="IdleForest logo" width={121} height={33} className="w-[100px] md:w-[121px]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4 lg:gap-6 col-start-2 justify-self-center items-center whitespace-nowrap">
          {navLinks.map(({ href, label }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={
                  `relative px-1 pb-1 pt-2 text-base lg:text-lg font-bold leading-none tracking-normal text-center transition-colors duration-150 text-black hover:text-brand-yellow ${isActive ? 'after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-brand-yellow after:content-[""]' : ''
                  }`
                }
              >
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="absolute z-[-100] top-0 left-0 bg-brand-gray opacity-50 h-full w-full"></div>

        {/* Desktop CTA / User */}
        <div className="hidden md:flex justify-self-end col-start-3 items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <Link href={profileUrl}>
                <Button className="bg-brand-yellow text-black border-2 border-black hover:bg-white hover:text-black font-bold font-candu uppercase text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-y-0 transition-all active:translate-y-1">
                  Profile
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
                Login
              </Button>
            </Link>
          )}
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
          <div className="container mx-auto px-4 py-6 flex flex-col gap-4">
            {navLinks.map(({ href, label }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMenuOpen(false)}
                  className={
                    `text-2xl font-bold text-center py-2 transition-colors ${isActive ? 'text-brand-yellow' : 'text-black hover:text-brand-yellow'}`
                  }
                >
                  {label}
                </Link>
              )
            })}
            <div className="h-px bg-black/10 my-2" />
            {user ? (
              <div className="space-y-4">
                <Link href={profileUrl} onClick={() => setIsMenuOpen(false)} className="w-full">
                  <Button className="w-full bg-brand-yellow text-black border-2 border-black font-bold font-candu uppercase text-xl py-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    Go to Profile
                  </Button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-center py-2 font-bold text-red-600 hover:bg-red-50 rounded-md"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <Link href="/auth/user/login" onClick={() => setIsMenuOpen(false)} className="w-full">
                <Button className="w-full bg-black text-white font-bold font-candu uppercase text-xl py-6 border-2 border-transparent">
                  Login
                </Button>
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  )
}
