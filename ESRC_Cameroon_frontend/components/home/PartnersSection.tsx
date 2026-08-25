'use client'

import { useTranslations } from 'next-intl'

const PARTNERS = [
  'African Development Bank',
  'AGRA',
  'GIZ Cameroon',
  'UNDP Cameroon',
  'World Bank Group',
  'Mastercard Foundation',
  'Tony Elumelu Foundation',
  'IFC',
  'UN Women',
  'Orange Cameroun',
  'MTN Cameroon',
  'Camtel',
]

export function PartnersSection() {
  const t = useTranslations('partners')

  return (
    <section className="section-padding bg-background overflow-hidden">
      <div className="container-width">
        <h2 className="font-display text-4xl font-bold text-foreground text-center mb-12">
          {t('trustedBy')}
        </h2>

        <div className="relative">
          <div className="flex animate-marquee gap-4 items-center py-4">
            {[...PARTNERS, ...PARTNERS].map((name, i) => (
              <div
                key={i}
                className="flex-shrink-0 bg-card border border-border rounded-full px-6 py-3 font-semibold text-foreground shadow-sm hover:border-primary hover:text-primary transition-colors whitespace-nowrap"
              >
                {name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
