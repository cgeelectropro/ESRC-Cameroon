import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Research & Publications | NextGen',
  description: 'Explore cutting-edge research on development, entrepreneurship, and social innovation across Africa. Open-access policy briefs, reports, and datasets.',
  openGraph: {
    title: 'Research & Publications | NextGen',
    description: 'Policy briefs, working papers, datasets, and journal articles driving evidence-based development in Africa.',
    siteName: 'NextGen',
  },
}

import { AIAssistant } from '@/components/shared/AIAssistant'

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIAssistant />
    </>
  )
}
