import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About NextGen',
  description: 'Learn about NextGen\'s mission to unlock human potential across Africa through education, research, and entrepreneurship support. Founded in 2019.',
  openGraph: {
    title: 'About NextGen — Unlocking Human Potential Across Africa',
    description: 'Democratizing access to world-class education for learners, entrepreneurs, and researchers across Cameroon and Central Africa.',
    siteName: 'NextGen',
  },
}

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
