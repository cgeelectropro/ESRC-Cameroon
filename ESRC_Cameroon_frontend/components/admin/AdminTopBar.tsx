'use client'

import { useEffect, useState } from 'react'
import { Globe, Moon, Sun } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import { NotificationBell } from '@/components/shared/NotificationBell'

export function AdminTopBar() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  const locale = useLocale()
  const otherLocale = locale === 'en' ? 'fr' : 'en'
  const t = useTranslations('nav')
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  return (
    <div className="flex items-center justify-end gap-2 px-6 py-3 border-b border-border bg-card">
      <button
        type="button"
        onClick={() => router.replace(pathname, { locale: otherLocale })}
        className="flex items-center gap-1 px-2 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
        title={t('switchLanguage')}
        aria-label={otherLocale === 'fr' ? t('switchToFrench') : t('switchToEnglish')}
      >
        <Globe size={20} />
        <span className="text-xs font-medium">{otherLocale.toUpperCase()}</span>
      </button>

      <button
        type="button"
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors"
        title={t('toggleDarkMode')}
        aria-label={t('toggleDarkMode')}
      >
        {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      </button>

      <NotificationBell />
    </div>
  )
}
