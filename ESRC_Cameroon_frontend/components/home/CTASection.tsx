'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'
import { GraduationCap, Building2, CheckCircle2 } from 'lucide-react'

export function CTASection() {
  const t = useTranslations('cta')
  const points = t.raw('forLearnersPoints') as string[]

  return (
    <section className="section-padding bg-esrc-green-900 text-white relative overflow-hidden">
      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-esrc-gold-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-esrc-gold-500/10 rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="container-width relative z-10">
        <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-12">
          {t('title')}
        </h2>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white/8 rounded-2xl p-8 border border-esrc-green-600">
            <GraduationCap className="text-esrc-gold-500 mb-4" size={40} />
            <h3 className="font-display text-xl font-bold mb-3">{t('forLearners')}</h3>
            <p className="text-white/90 mb-4">
              {t('forLearnersDesc')}
            </p>
            <ul className="space-y-2 mb-6">
              {points.map((point, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 text-sm">
                  <CheckCircle2 className="text-esrc-gold-500 shrink-0 mt-0.5" size={16} />
                  <span className="text-white/90">{point}</span>
                </li>
              ))}
            </ul>
            <Link href="/courses">
              <Button className="w-full btn-gold">
                {t('exploreCourses')}
              </Button>
            </Link>
          </div>

          <div className="bg-white/8 rounded-2xl p-8 border border-esrc-green-600">
            <Building2 className="text-esrc-gold-500 mb-4" size={40} />
            <h3 className="font-display text-xl font-bold mb-3">{t('forOrgs')}</h3>
            <p className="text-white/90 mb-6">
              {t('forOrgsDesc')}
            </p>
            <Link href="/contact">
              <Button variant="outline" className="w-full border-2 border-white text-white hover:bg-white/10 hover:text-white">
                {t('getInTouch')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
