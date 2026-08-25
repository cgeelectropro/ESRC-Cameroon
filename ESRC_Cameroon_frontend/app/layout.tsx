import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getLocale } from 'next-intl/server'
import { ThemeProvider } from '@/components/theme-provider'
import { GoogleProvider } from '@/components/providers/GoogleProvider'
import { Toaster } from 'sonner'
import './globals.css'

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NextGen — Unlocking Human Potential Across Africa',
  description: 'Join 10,000+ learners, entrepreneurs, and researchers accessing world-class education, tools, and networks in English and French.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
    shortcut: '/logo.png',
  },
  openGraph: {
    title: 'NextGen — Unlocking Human Potential Across Africa',
    description: 'Join 10,000+ learners, entrepreneurs, and researchers accessing world-class education, tools, and networks in English and French.',
    siteName: 'NextGen',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NextGen — Unlocking Human Potential Across Africa',
    description: 'World-class education for Africa. Bilingual EN/FR. MTN MoMo & Orange Money payments.',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()

  return (
    <html lang={locale} className={`${playfairDisplay.variable} ${dmSans.variable}`} suppressHydrationWarning>
      <body className="font-body bg-background text-foreground antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-esrc-gold-500 focus:text-esrc-dark focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-esrc-green-500"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GoogleProvider>
            {children}
            <Toaster richColors position="top-center" />
            <Analytics />
          </GoogleProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
