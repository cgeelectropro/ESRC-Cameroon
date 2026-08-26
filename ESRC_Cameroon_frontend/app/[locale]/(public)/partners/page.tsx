'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Handshake } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { Button } from '@/components/ui/button'

const PARTNERS = [
  { name: 'Ministry of Small Business, Cameroon', area: 'Government' },
  { name: 'African Development Bank', area: 'Finance' },
  { name: 'UNDP Cameroon', area: 'Development' },
  { name: 'GIZ', area: 'International Cooperation' },
]

export default function PartnersPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title="Our Partners"
        subtitle="We work with leading organizations across Africa and globally to unlock human potential."
        imageKey="partners"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {PARTNERS.map((p) => (
              <Card key={p.name} className="shadow-sm">
                <CardContent className="pt-6 flex items-start gap-4">
                  <div className="w-12 h-12 bg-esrc-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Handshake className="text-esrc-green-700" size={24} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{p.name}</h3>
                    <p className="text-sm text-muted-foreground">{p.area}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-esrc-green-50 border-esrc-green-200">
            <CardContent className="pt-8 pb-8 text-center">
              <h3 className="font-display text-xl font-bold text-esrc-dark mb-4">Become a Partner</h3>
              <p className="text-esrc-mid mb-6 max-w-xl mx-auto">
                Partner with ESRC to train teams, access research, host events, or support entrepreneurship across Africa.
              </p>
              <Link href="/contact">
                <Button variant="gold">Get in Touch</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
