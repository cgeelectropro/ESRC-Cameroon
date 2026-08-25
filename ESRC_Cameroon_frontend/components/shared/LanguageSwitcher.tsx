'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'

interface LanguageSwitcherProps {
  className?: string
  variant?: 'pill' | 'links'
}

export function LanguageSwitcher({ className = '', variant = 'pill' }: LanguageSwitcherProps) {
  const locale = useLocale()
  const pathname = usePathname() || '/'
  const router = useRouter()
  const t = useTranslations('nav')

  const switchTo = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale })
  }

  if (variant === 'links') {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button
          type="button"
          onClick={() => switchTo('en')}
          className={`text-sm font-medium transition-colors ${locale === 'en' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          aria-label={t('switchToEnglish')}
        >
          EN
        </button>
        <span className="text-muted-foreground/60">|</span>
        <button
          type="button"
          onClick={() => switchTo('fr')}
          className={`text-sm font-medium transition-colors ${locale === 'fr' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
          aria-label={t('switchToFrench')}
        >
          FR
        </button>
      </div>
    )
  }

  return (
    <div className={`flex gap-1 rounded-full bg-white/10 p-1 ${className}`}>
      <button
        type="button"
        onClick={() => switchTo('en')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${locale === 'en' ? 'bg-esrc-green-500 text-white' : 'text-white/70 hover:text-white'}`}
        aria-label={t('switchToEnglish')}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchTo('fr')}
        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${locale === 'fr' ? 'bg-esrc-green-500 text-white' : 'text-white/70 hover:text-white'}`}
        aria-label={t('switchToFrench')}
      >
        FR
      </button>
    </div>
  )
}
