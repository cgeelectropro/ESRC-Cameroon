import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Events & Workshops | NextGen',
  description: 'Join conferences, workshops, webinars, and networking events across Africa. Connect with entrepreneurs, researchers, and development professionals.',
  openGraph: {
    title: 'Events & Workshops | NextGen',
    description: 'Upcoming conferences, workshops, and webinars across Africa. Register today.',
    siteName: 'NextGen',
  },
}

import { AIAssistant } from '@/components/shared/AIAssistant'

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  )
}
