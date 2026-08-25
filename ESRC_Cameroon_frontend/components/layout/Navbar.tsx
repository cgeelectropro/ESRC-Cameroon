'use client'

import { Menu, X, Moon, Sun, Globe, ChevronDown, LayoutDashboard, User, LogOut, Search } from 'lucide-react'
import Image from 'next/image'
import { Link, usePathname, useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { useState, useEffect } from 'react'
import { useAuthOptional } from '@/contexts/AuthContext'
import { NavSearchBar } from './NavSearchBar'
import { NotificationBell } from '@/components/shared/NotificationBell'

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const otherLocale = locale === 'en' ? 'fr' : 'en'
  const t = useTranslations('nav')
  // usePathname from @/i18n/navigation returns path without locale prefix
  const pathname = usePathname() || '/'
  const router = useRouter()
  const auth = useAuthOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false
  const user = auth?.user

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { label: t('courses'), href: '/courses' },
    { label: t('research'), href: '/research' },
    { label: t('events'), href: '/events' },
    { label: t('advisory'), href: '/advisory' },
    { label: t('community'), href: '/community' },
    { label: t('impact'), href: '/impact' },
  ]

  // Pages that have a full-bleed green hero — navbar should be transparent with white text until scrolled
  const heroPages = ['/', '/research', '/events', '/advisory', '/community', '/impact', '/courses', '/about', '/opportunities', '/blog', '/contact']
  const isHeroPage = heroPages.some(p => p === pathname || (p !== '/' && pathname?.startsWith(p)))
  const overHero = isHeroPage && !isScrolled
  const navTextClass = overHero
    ? 'text-white hover:text-white/90'
    : 'text-foreground hover:text-primary'
  const navActiveClass = overHero ? 'text-white font-semibold' : 'text-primary font-semibold'
  const navIconClass = overHero ? 'text-white' : 'text-foreground'
  const navHoverClass = overHero ? 'hover:bg-white/10' : 'hover:bg-accent'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        overHero
          ? 'bg-transparent'
          : 'shadow-lg border-b border-border/60 bg-background/98 backdrop-blur-xl'
      }`}
    >
      <div className="container-width px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity mr-6">
            <Image
              src="/logo.png"
              alt="NextGen"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
            <span
              className={`font-display font-semibold text-lg hidden sm:inline ${
                overHero ? 'text-white' : 'text-foreground'
              }`}
            >
              {t('brandName')}
            </span>
          </Link>

          {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href))
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors ${
                    isActive ? navActiveClass : navTextClass
                  }`}
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-sm xl:max-w-md mx-4">
            <NavSearchBar overHero={overHero} />
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => router.replace(pathname, { locale: otherLocale })}
              className={`flex items-center gap-1 px-2 py-2 rounded-lg transition-colors ${navHoverClass}`}
              title={t('switchLanguage')}
              aria-label={otherLocale === 'fr' ? t('switchToFrench') : t('switchToEnglish')}
            >
              <Globe size={20} className={overHero ? 'text-white' : 'text-primary'} />
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  overHero ? 'text-white' : 'text-primary'
                }`}
              >
                {otherLocale.toUpperCase()}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`p-2 rounded-lg transition-colors ${navHoverClass}`}
              title={t('toggleDarkMode')}
              aria-label={t('toggleDarkMode')}
            >
              {mounted && theme === 'dark' ? (
                <Sun size={20} className={overHero ? 'text-esrc-gold-100' : 'text-esrc-gold-500'} />
              ) : (
                <Moon size={20} className={navIconClass} />
              )}
            </button>

            {/* Auth Buttons / User Menu - Desktop */}
            <div
              className={`hidden md:flex items-center gap-2 ml-4 pl-4 ${
                overHero ? 'border-l border-white/30' : 'border-l border-border'
              }`}
            >
              {/* Notification Bell — authenticated only */}
              {isAuthenticated && user && (
                <NotificationBell overHero={overHero} />
              )}
              {isAuthenticated && user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-colors ${navHoverClass}`}
                  >
                    <span
                      className={`font-medium truncate max-w-[120px] ${
                        overHero ? 'text-white' : 'text-foreground'
                      }`}
                    >
                      {user.firstName} {user.lastName}
                    </span>
                    <ChevronDown size={16} className={overHero ? 'text-white/80' : 'text-muted-foreground'} />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        aria-hidden
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 py-2 w-48 bg-popover text-popover-foreground rounded-lg shadow-lg border border-border z-50">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <LayoutDashboard size={18} />
                          {t('dashboard')}
                        </Link>
                        <Link
                          href="/dashboard/profile"
                          className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <User size={18} />
                          {t('profile')}
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setUserMenuOpen(false)
                            auth?.logout()
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 text-sm text-destructive hover:bg-destructive/10"
                        >
                          <LogOut size={18} />
                          {t('logout')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className={`text-sm py-2 px-4 rounded-lg font-medium transition-colors ${
                      overHero
                        ? 'border-2 border-white text-white hover:bg-white/10'
                        : 'btn-outline'
                    }`}
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    className={`text-sm py-2 px-4 rounded-lg font-bold transition-colors ${
                      overHero
                        ? 'bg-esrc-gold-500 text-esrc-dark hover:bg-esrc-gold-400'
                        : 'btn-gold'
                    }`}
                  >
                    {t('getStarted')}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Search Toggle */}
            <button
              onClick={() => { setMobileSearchOpen((v) => !v); setIsOpen(false) }}
              className={`lg:hidden p-2 rounded-lg transition-colors ${navHoverClass}`}
              aria-label={t('searchLabel')}
            >
              <Search size={20} className={navIconClass} />
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => { setIsOpen(!isOpen); setMobileSearchOpen(false) }}
              className={`md:hidden p-2 rounded-lg transition-colors ${navHoverClass}`}
            >
              {isOpen ? (
                <X size={24} className={navIconClass} />
              ) : (
                <Menu size={24} className={navIconClass} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Panel */}
        {mobileSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 border-t border-border/40 animate-slide-in">
            <NavSearchBar overHero={false} />
          </div>
        )}

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 pt-2 -mx-4 px-4 -mb-4 border-t border-border animate-slide-in bg-background/98 backdrop-blur-xl shadow-lg">
            {/* Mobile: Language & Theme */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <button
                type="button"
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground"
                onClick={() => { router.replace(pathname, { locale: otherLocale }); setIsOpen(false) }}
              >
                <Globe size={18} />
                <span className="text-sm font-medium">{otherLocale.toUpperCase()}</span>
              </button>
              <button
                onClick={() => {
                  setTheme(theme === 'dark' ? 'light' : 'dark')
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors text-foreground"
                aria-label={t('toggleDarkMode')}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-medium">{theme === 'dark' ? t('light') : t('dark')}</span>
              </button>
            </div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm font-medium text-foreground hover:bg-accent rounded transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="px-4 py-4 flex gap-2 border-t border-border mt-4 pt-4">
              {isAuthenticated && user ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex-1 btn-outline text-sm py-2 px-3 text-center"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false)
                      auth?.logout()
                    }}
                    className="flex-1 btn-outline text-sm py-2 px-3 text-center text-destructive border-destructive/30"
                  >
                    {t('logout')}
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex-1 btn-outline text-sm py-2 px-3 text-center">
                    {t('login')}
                  </Link>
                  <Link href="/register" className="flex-1 btn-gold text-sm py-2 px-3 text-center">
                    {t('getStarted')}
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
