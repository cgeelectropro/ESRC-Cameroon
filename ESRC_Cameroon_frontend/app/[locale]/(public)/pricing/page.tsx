'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Link } from '@/i18n/navigation'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '0',
    currency: 'XAF',
    description: 'Start learning with no commitment.',
    cta: 'Get Started',
    href: '/register',
    highlight: false,
    features: [
      'Access to all free courses',
      'Community forum access',
      'Browse research publications',
      'Event announcements',
      'Bilingual (EN / FR)',
    ],
  },
  {
    name: 'Learner',
    price: '5,000',
    currency: 'XAF / month',
    description: 'For individuals who want to grow faster.',
    cta: 'Enroll Now',
    href: '/courses',
    highlight: true,
    features: [
      'Everything in Free',
      'Unlimited paid course access',
      'Digital certificates',
      'Progress tracking & learning paths',
      'Advisory session (1/month)',
      'Priority support',
    ],
  },
  {
    name: 'Institution',
    price: 'Custom',
    currency: '',
    description: 'For organizations, NGOs, and universities.',
    cta: 'Contact Us',
    href: '/contact',
    highlight: false,
    features: [
      'Everything in Learner',
      'Bulk seat management',
      'Custom branding',
      'Dedicated account manager',
      'Analytics dashboard',
      'API access',
    ],
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageHero title="Pricing" subtitle="Flexible plans for individuals, teams, and institutions across Africa." imageKey="about" />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  plan.highlight
                    ? 'bg-esrc-green-900 text-white border-esrc-green-700 shadow-xl scale-105'
                    : 'bg-card border-border'
                }`}
              >
                <div className="mb-6">
                  <p className={`text-sm font-semibold uppercase tracking-wide mb-1 ${plan.highlight ? 'text-esrc-gold-400' : 'text-esrc-green-700'}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-bold ${plan.highlight ? 'text-white' : 'text-foreground'}`}>
                      {plan.price === 'Custom' ? 'Custom' : plan.price}
                    </span>
                    {plan.currency && (
                      <span className={`text-sm ${plan.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                        {plan.currency}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm mt-2 ${plan.highlight ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 flex-grow mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check size={16} className={`mt-0.5 shrink-0 ${plan.highlight ? 'text-esrc-gold-400' : 'text-esrc-green-600'}`} />
                      <span className={plan.highlight ? 'text-white/90' : 'text-foreground'}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={`block text-center font-bold py-3 rounded-lg transition-colors ${
                    plan.highlight
                      ? 'bg-esrc-gold-500 text-esrc-dark hover:bg-esrc-gold-400'
                      : 'bg-esrc-green-700 text-white hover:bg-esrc-green-900'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center text-sm text-muted-foreground max-w-xl mx-auto">
            <p>
              All prices are in Central African CFA Franc (XAF). Mobile money payments (MTN MoMo, Orange Money), cards (Stripe), and PayPal are accepted.
              Need a custom quote?{' '}
              <Link href="/contact" className="text-esrc-green-700 hover:underline">
                Contact our team
              </Link>.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
