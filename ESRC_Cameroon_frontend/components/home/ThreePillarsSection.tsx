'use client'

import { BookOpen, FlaskConical, Briefcase, ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'

const pillarKeys = [
  { icon: BookOpen, titleKey: 'learningPlatform', descKey: 'learningPlatformDesc', href: '/courses' },
  { icon: FlaskConical, titleKey: 'researchHub', descKey: 'researchHubDesc', href: '/research' },
  { icon: Briefcase, titleKey: 'entrepreneurEcosystem', descKey: 'entrepreneurEcosystemDesc', href: '/advisory' },
]

export function ThreePillarsSection() {
  const t = useTranslations('pillars')
  return (
    <section className="section-padding bg-esrc-green-900 text-white">
      <div className="container-width">
        <div className="grid md:grid-cols-3 gap-8">
          {pillarKeys.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="rounded-xl p-8 border border-esrc-green-700 hover:border-esrc-gold-500 transition-all duration-200"
              >
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-6">
                  <Icon className="text-white" size={28} />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{t(pillar.titleKey)}</h3>
                <p className="text-white/90 text-sm mb-6 leading-relaxed">
                  {t(pillar.descKey)}
                </p>
                <Link
                  href={pillar.href}
                  className="inline-flex items-center gap-2 text-esrc-gold-100 font-semibold hover:text-white transition-colors"
                >
                  {t('explore')} <ArrowRight size={18} />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
