'use client'

import { Target, BookOpen, Wrench, Rocket, ArrowRight } from 'lucide-react'
import { useTranslations } from 'next-intl'

const steps = [
  { icon: Target, number: '1', titleKey: 'step1Title', descKey: 'step1Desc' },
  { icon: BookOpen, number: '2', titleKey: 'step2Title', descKey: 'step2Desc' },
  { icon: Wrench, number: '3', titleKey: 'step3Title', descKey: 'step3Desc' },
  { icon: Rocket, number: '4', titleKey: 'step4Title', descKey: 'step4Desc' },
]

export function HowItWorks() {
  const t = useTranslations('howItWorks')
  return (
    <section className="section-padding bg-accent/50 dark:bg-background">
      <div className="container-width">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-4 gap-6 md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                {/* Card */}
                <div className="bg-card rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow h-full">
                  {/* Icon Circle */}
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Icon className="text-primary" size={32} />
                  </div>

                  {/* Number */}
                  <div className="text-4xl font-bold text-primary text-center mb-2">
                    {step.number}
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-semibold text-lg text-center text-foreground mb-3">
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-center text-muted-foreground text-sm leading-relaxed">
                    {t(step.descKey)}
                  </p>
                </div>

                {/* Arrow */}
                {index < steps.length - 1 && (
                  <div className="hidden md:flex absolute -right-4 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="text-primary" size={28} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
