'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Link } from '@/i18n/navigation'
import { BookOpen, CreditCard, User, MessageCircle, Award, Globe } from 'lucide-react'

const sections = [
  {
    icon: BookOpen,
    title: 'Courses & Learning',
    links: [
      { label: 'How to enroll in a course', href: '/faq#courses' },
      { label: 'Tracking your progress', href: '/faq#courses' },
      { label: 'Downloading your certificate', href: '/faq#courses' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Payments & Billing',
    links: [
      { label: 'Accepted payment methods', href: '/faq#payments' },
      { label: 'Requesting a refund', href: '/faq#payments' },
      { label: 'Payment security', href: '/faq#payments' },
    ],
  },
  {
    icon: User,
    title: 'Account & Profile',
    links: [
      { label: 'Creating an account', href: '/faq#account' },
      { label: 'Resetting your password', href: '/faq#account' },
      { label: 'Updating your profile', href: '/faq#account' },
    ],
  },
  {
    icon: Globe,
    title: 'Language & Accessibility',
    links: [
      { label: 'Switching between English and French', href: '/faq#account' },
      { label: 'Accessibility features', href: '/faq' },
    ],
  },
  {
    icon: Award,
    title: 'Certificates',
    links: [
      { label: 'How certificates are issued', href: '/faq#courses' },
      { label: 'Sharing your certificate', href: '/faq#courses' },
    ],
  },
  {
    icon: MessageCircle,
    title: 'Community & Support',
    links: [
      { label: 'Joining the community forum', href: '/community' },
      { label: 'Reporting an issue', href: '/contact' },
    ],
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageHero title="Help Center" subtitle="Find guides, answers, and support for everything on NextGen." imageKey="about" />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {sections.map((s) => (
              <div key={s.title} className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-esrc-green-100 dark:bg-esrc-green-900/30 flex items-center justify-center">
                    <s.icon size={18} className="text-esrc-green-700" />
                  </div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                </div>
                <ul className="space-y-2">
                  {s.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-esrc-green-700 transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="bg-esrc-green-900 text-white rounded-2xl p-8 text-center">
            <h2 className="font-display text-2xl font-bold mb-2">Still need help?</h2>
            <p className="text-white/80 mb-6">Our support team is ready to assist you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:info@esrccameroon.org"
                className="bg-esrc-gold-500 text-esrc-dark font-bold px-6 py-3 rounded-lg hover:bg-esrc-gold-400 transition-colors"
              >
                Email Support
              </a>
              <Link
                href="/contact"
                className="border border-white/30 text-white font-medium px-6 py-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                Contact Form
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
