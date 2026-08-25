'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
  {
    category: 'Getting Started',
    items: [
      {
        q: 'What is NextGen?',
        a: 'NextGen is a bilingual (English/French) learning and entrepreneurship platform for Africa. We offer courses, research publications, advisory services, events, and community features to support learners and entrepreneurs across the continent.',
      },
      {
        q: 'Is NextGen free to use?',
        a: 'We offer both free and paid courses. You can browse the platform and access free content without an account. Creating an account unlocks additional features including tracking progress, earning certificates, and joining the community.',
      },
      {
        q: 'How do I create an account?',
        a: 'Click "Register" in the top navigation. Fill in your name, email, and password. You can start learning immediately after registering.',
      },
    ],
  },
  {
    category: 'Courses & Learning',
    items: [
      {
        q: 'What types of courses are available?',
        a: 'We offer courses across Entrepreneurship, Development Policy, Social Research, Finance & Investment, Agriculture, Technology & Innovation, Women in Business, Youth Empowerment, Public Health, and Environment & Climate.',
      },
      {
        q: 'How do I enroll in a course?',
        a: 'Navigate to the Courses page, select a course, and click "Enroll Now". Free courses are immediately accessible. For paid courses, you will be guided through a secure payment process.',
      },
      {
        q: 'Will I receive a certificate upon completion?',
        a: 'Yes. After completing all lessons in a course, you will receive a digital certificate that you can download and share on your professional profiles.',
      },
      {
        q: 'Can I learn in French?',
        a: 'Yes. The platform is fully bilingual. Switch between English and French using the language selector in the navigation bar.',
      },
    ],
  },
  {
    category: 'Payments',
    items: [
      {
        q: 'What payment methods are accepted?',
        a: 'We accept MTN Mobile Money, Orange Money, Stripe (credit/debit cards), and PayPal. All prices are displayed in XAF (Central African CFA Franc) by default.',
      },
      {
        q: 'Is my payment information secure?',
        a: 'Yes. All payments are processed through secure, encrypted gateways. We do not store your card details on our servers.',
      },
      {
        q: 'Can I get a refund?',
        a: 'Refund requests can be submitted within 7 days of purchase if you have not completed more than 20% of the course. Contact us at info@esrccameroon.org for assistance.',
      },
    ],
  },
  {
    category: 'Account & Profile',
    items: [
      {
        q: 'How do I reset my password?',
        a: 'Click "Forgot Password" on the login page. Enter your email address and we will send you a reset link within a few minutes.',
      },
      {
        q: 'Can I become an instructor?',
        a: 'Yes. If you have expertise to share, apply to become an instructor through the platform. Our team reviews applications and will reach out within 5–7 business days.',
      },
    ],
  },
]

export default function FAQPage() {
  const [open, setOpen] = useState<string | null>(null)

  const toggle = (key: string) => setOpen(open === key ? null : key)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <PageHero title="Frequently Asked Questions" subtitle="Find answers to common questions about NextGen." imageKey="about" />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-3xl mx-auto space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="font-display text-xl font-semibold text-esrc-green-900 mb-4">{section.category}</h2>
              <div className="space-y-3">
                {section.items.map((item, idx) => {
                  const key = `${section.category}-${idx}`
                  const isOpen = open === key
                  return (
                    <div key={key} className="border border-border rounded-lg overflow-hidden bg-card">
                      <button
                        onClick={() => toggle(key)}
                        className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-foreground hover:bg-muted/50 transition-colors"
                      >
                        <span>{item.q}</span>
                        {isOpen ? <ChevronUp size={18} className="text-esrc-green-700 shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
                          {item.a}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          <p className="text-sm text-muted-foreground text-center pt-4">
            Still have questions?{' '}
            <a href="mailto:info@esrccameroon.org" className="text-esrc-green-700 hover:underline">
              Contact us
            </a>
          </p>
        </div>
      </main>

      <Footer />
    </div>
  )
}
