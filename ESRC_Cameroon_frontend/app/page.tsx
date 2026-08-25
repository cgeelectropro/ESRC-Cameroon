import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/home/HeroSection'
import { ImpactStatsBar } from '@/components/home/ImpactStatsBar'
import { FeaturedCourses } from '@/components/home/FeaturedCourses'
import { HowItWorks } from '@/components/home/HowItWorks'
import { ThreePillarsSection } from '@/components/home/ThreePillarsSection'
import { UpcomingEvents } from '@/components/home/UpcomingEvents'
import { Testimonials } from '@/components/home/Testimonials'
import { PartnersSection } from '@/components/home/PartnersSection'
import { CTASection } from '@/components/home/CTASection'
import { AIAssistant } from '@/components/shared/AIAssistant'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main id="main-content" className="flex-grow">
        <HeroSection />
        <ImpactStatsBar />
        <FeaturedCourses />
        <HowItWorks />
        <ThreePillarsSection />
        <UpcomingEvents />
        <Testimonials />
        <PartnersSection />
        <CTASection />
      </main>
      <Footer />
      <AIAssistant />
    </div>
  )
}
