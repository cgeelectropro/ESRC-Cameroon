'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { HERO_SLIDES } from '@/lib/placeholders'
import { ArrowRight, Globe, Users, TrendingUp, Award, Radio } from 'lucide-react'
import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'

type HeroStats = {
  totalLearners: number
  certificatesIssued: number
  eventsHosted: number
  coursesPublished: number
}

function formatStat(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}K+`
  return `${n}+`
}

export function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [stats, setStats] = useState<HeroStats | null>(null)
  const t = useTranslations('hero')

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)
    }, 5000)

    // Fetch real platform stats
    apiClient.getImpactStats().then((res) => {
      if (res.success && res.data) {
        const d = res.data as HeroStats
        setStats(d)
      }
    })

    return () => clearInterval(interval)
  }, [])

  const learners = stats ? formatStat(stats.totalLearners) : '10K+'
  const certs = stats ? formatStat(stats.certificatesIssued) : '3K+'
  const events = stats ? formatStat(stats.eventsHosted) : '50+'
  const courses = stats ? formatStat(stats.coursesPublished) : '200+'

  return (
    <section className="relative min-h-screen pt-24 pb-12 md:pb-20 overflow-hidden">
      {/* Slideshow backgrounds */}
      {HERO_SLIDES.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${src})`,
            opacity: currentSlide === i ? 1 : 0,
          }}
          aria-hidden
        />
      ))}
      {/* Strong overlay so text is always readable regardless of image */}
      <div className="absolute inset-0 bg-gradient-to-r from-esrc-green-900/90 via-esrc-green-900/70 to-esrc-green-900/40" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />

      {/* Slide dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-white w-6' : 'bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-width px-4 md:px-8 lg:px-12">
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Column */}
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 mb-6 bg-white/15 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 text-white text-sm font-medium">
              <Globe size={16} />
              <span>{t('badge')}</span>
            </div>

            {/* H1 */}
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight text-balance">
              {t('title')}
            </h1>

            {/* Subheading */}
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed max-w-lg text-balance">
              {t('subtitle')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link
                href="/courses"
                className="btn-gold inline-flex items-center justify-center gap-2 text-lg font-bold"
              >
                {t('cta1')} <ArrowRight size={20} />
              </Link>
              <Link
                href="/about"
                className="btn-outline inline-flex items-center justify-center gap-2 text-white border-white hover:bg-white/10"
              >
                {t('cta2')} <ArrowRight size={20} />
              </Link>
            </div>

            {/* Trust Row */}
            <div className="flex flex-col sm:flex-row gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-esrc-gold-500 font-bold">✓</span>
                <span>{t('trust1')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-esrc-gold-500 font-bold">✓</span>
                <span>{t('trust2')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-esrc-gold-500 font-bold">✓</span>
                <span>{t('trust3')}</span>
              </div>
            </div>
          </div>

          {/* Right Column - Floating Stats Cards */}
          <div className="hidden md:block relative h-96">
            <div className={`absolute inset-0 transition-all duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>

              {/* Card 1 – Learners */}
              <div
                className="absolute top-0 right-0 w-60 rounded-2xl shadow-2xl p-5 animate-fade-in-up"
                style={{
                  animationDelay: '0.1s',
                  background: 'rgba(255,255,255,0.97)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-esrc-green-700/10 flex items-center justify-center">
                    <Users size={20} className="text-esrc-green-700" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500">{t('cards.learning')}</p>
                    <p className="text-2xl font-extrabold text-esrc-green-700 leading-none">{learners}</p>
                  </div>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-1.5 mb-1.5">
                  <div className="bg-esrc-green-700 h-1.5 rounded-full w-4/5 transition-all duration-1000" />
                </div>
                <p className="text-xs text-gray-500">{t('cards.progress')}</p>
              </div>

              {/* Card 2 – Certificate */}
              <div
                className="absolute top-36 right-10 w-56 rounded-2xl shadow-2xl p-5 animate-fade-in-up"
                style={{
                  animationDelay: '0.3s',
                  background: 'rgba(255,255,255,0.97)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                    <Award size={20} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">{t('cards.certificateEarned')}</p>
                    <p className="text-2xl font-extrabold text-gray-800 leading-none">{certs}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <TrendingUp size={13} className="text-green-600" />
                  <p className="text-xs text-gray-500">{courses} {t('cards.courseDemo')}</p>
                </div>
              </div>

              {/* Card 3 – Live / Events */}
              <div
                className="absolute bottom-4 right-20 w-56 rounded-2xl shadow-2xl p-5 animate-fade-in-up"
                style={{
                  animationDelay: '0.5s',
                  background: 'rgba(255,255,255,0.97)',
                  border: '1px solid rgba(255,255,255,0.6)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="relative">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                    <div className="absolute inset-0 w-2.5 h-2.5 bg-red-400 rounded-full animate-ping opacity-75" />
                  </div>
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wide">{t('cards.liveNow')}</span>
                </div>
                <p className="text-sm font-bold text-gray-800 mb-2">{t('cards.workshopDemo')}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <Radio size={13} className="text-red-500" />
                    <span>{events} {t('cards.attending')}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
