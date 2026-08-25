import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Advisory Services | NextGen',
  description: 'Get personalized 1-on-1 mentoring, business plan reviews, and group advisory sessions from NextGen\'s expert advisors across Africa.',
  openGraph: {
    title: 'Expert Advisory Services | NextGen',
    description: '1-on-1 mentoring, group clinics, and business plan reviews from Africa\'s top business mentors and development experts.',
    siteName: 'NextGen',
  },
}

import { AIAssistant } from '@/components/shared/AIAssistant'

export default function AdvisoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  )
}
