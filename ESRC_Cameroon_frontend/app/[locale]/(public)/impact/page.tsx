import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { ImpactDashboard } from '@/components/impact/ImpactDashboard'

export default function ImpactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title="Our Impact"
        subtitle="Measuring the positive change we're creating across Africa."
        imageKey="impact"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <ImpactDashboard />
        </div>
      </main>

      <Footer />
    </div>
  )
}
