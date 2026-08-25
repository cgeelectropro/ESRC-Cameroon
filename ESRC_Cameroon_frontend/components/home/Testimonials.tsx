'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { Testimonial } from '@/lib/types'

export function Testimonials() {
  const t = useTranslations('common')
  const [index, setIndex] = useState(0)
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getTestimonials().then((res) => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setTestimonials(res.data as Testimonial[])
      }
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (testimonials.length <= 1) return
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  if (loading || testimonials.length === 0) {
    return (
      <section className="section-padding bg-accent/50 dark:bg-background">
        <div className="container-width">
          <h2 className="font-display text-4xl font-bold text-foreground text-center mb-12">
            {t('testimonialsTitle')}
          </h2>
          <div className="max-w-3xl mx-auto py-12 text-center text-muted-foreground">
            {loading ? t('loading') : t('noTestimonials')}
          </div>
        </div>
      </section>
    )
  }

  const testimonial = testimonials[index]

  return (
    <section className="section-padding bg-accent/50 dark:bg-background">
      <div className="container-width">
        <h2 className="font-display text-4xl font-bold text-foreground text-center mb-12">
          {t('testimonialsTitle')}
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-2xl shadow-lg p-8 md:p-12 relative">
            <Quote className="absolute top-6 left-6 text-primary opacity-40" size={48} />
            <p className="text-lg text-foreground leading-relaxed mb-8 relative z-10">
              &ldquo;{testimonial.quote}&rdquo;
            </p>
            <div className="flex items-center gap-4">
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-border"
              />
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.title}</p>
                <p className="text-xs text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setIndex((i) => (i - 1 + testimonials.length) % testimonials.length)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft size={24} className="text-primary" />
            </button>
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === index ? 'bg-primary scale-125' : 'bg-muted hover:bg-accent'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
            <button
              onClick={() => setIndex((i) => (i + 1) % testimonials.length)}
              className="p-2 rounded-full hover:bg-accent transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight size={24} className="text-primary" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
