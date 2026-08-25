import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Courses | NextGen',
  description: 'Explore 200+ courses in entrepreneurship, development policy, technology, agriculture, and more — taught by Africa\'s leading experts in English and French.',
  openGraph: {
    title: 'Explore Courses | NextGen',
    description: 'World-class courses from Africa\'s leading experts. Learn at your pace, earn certificates, and transform your career.',
    siteName: 'NextGen',
  },
}

import { AIAssistant } from '@/components/shared/AIAssistant'

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  )
}
