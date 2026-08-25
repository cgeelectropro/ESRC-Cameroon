'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { ImpactStats } from '@/lib/types'

interface ImpactStatsBarProps {
  stats?: ImpactStats
}

function CountUpNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * value))

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setCount(value)
      }
    }

    requestAnimationFrame(animate)
  }, [isVisible, value, duration])

  return <span ref={ref}>{count.toLocaleString()}</span>
}

export function ImpactStatsBar({ stats }: ImpactStatsBarProps) {
  const t = useTranslations('impact')
  const defaultStats = {
    totalLearners: 12,
    coursesPublished: 8,
    countriesReached: 1,
    entrepreneursSupported: 300,
    certificatesIssued: 450,
  }

  const displayStats = stats || defaultStats

  return (
    <section className="w-full bg-accent/50 dark:bg-muted border-y border-border py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
          {/* Learners */}
          <div className="text-center md:border-r md:border-border md:pr-4 lg:pr-8">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <CountUpNumber value={displayStats.totalLearners} />
              <span className="text-xl">+</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{t('learners')}</p>
          </div>

          {/* Courses */}
          <div className="text-center md:border-r md:border-border md:pr-4 lg:pr-8">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <CountUpNumber value={displayStats.coursesPublished} />
              <span className="text-xl">+</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{t('courses')}</p>
          </div>

          {/* Countries */}
          <div className="text-center md:border-r md:border-border md:pr-4 lg:pr-8">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <CountUpNumber value={displayStats.countriesReached} />
              <span className="text-xl">+</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{t('countries')}</p>
          </div>

          {/* Entrepreneurs */}
          <div className="text-center md:border-r md:border-border md:pr-4 lg:pr-8">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
              <CountUpNumber value={displayStats.entrepreneursSupported} />
              <span className="text-xl">+</span>
            </div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{t('entrepreneurs')}</p>
          </div>

          {/* Founded */}
          <div className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2019</div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{t('founded')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
