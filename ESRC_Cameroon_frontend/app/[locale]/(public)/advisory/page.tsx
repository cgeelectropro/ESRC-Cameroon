'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Users, Award, TrendingUp } from 'lucide-react'
import { MentorCard } from '@/components/advisory/MentorCard'
import { apiClient } from '@/lib/api-client'
import type { Mentor } from '@/lib/types'

const ADVISOR_TYPES = [
  { id: '1on1', label: '1-on-1', icon: Users },
  { id: 'group', label: 'Group Clinic', icon: Users },
  { id: 'business', label: 'Business Plan Review', icon: Award },
]

export default function AdvisoryPage() {
  const t = useTranslations('advisory')
  const [advisorType, setAdvisorType] = useState('1on1')
  const [booking, setBooking] = useState<string | null>(null)
  const [mentors, setMentors] = useState<Mentor[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getMentors().then((res) => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setMentors(res.data as Mentor[])
      }
      setLoading(false)
    })
  }, [])

  const handleBook = async (mentorId: string) => {
    setBooking(mentorId)
    try {
      const res = await apiClient.bookAdvisory({
        mentorId,
        type: advisorType,
        date: new Date().toISOString(),
      })
      if (res.success) {
        toast.success(t('sessionBooked'))
      } else {
        toast.error(res.error || t('bookingFailed'))
      }
    } catch {
      toast.error(t('bookingFailed'))
    } finally {
      setBooking(null)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('title')}
        subtitle="Get personalized guidance from industry experts and business mentors."
        imageKey="advisory"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { icon: Users, title: '1-on-1 Mentoring', desc: 'One-on-one sessions with expert mentors' },
              { icon: Award, title: 'Business Plan Review', desc: 'Comprehensive business model reviews' },
              { icon: TrendingUp, title: 'Group Clinic', desc: 'Strategic guidance for scaling your venture' },
            ].map((item, idx) => {
              const Icon = item.icon
              return (
                <Card key={idx} className="shadow-sm">
                  <CardContent className="pt-6">
                    <Icon size={32} className="text-esrc-green-700 mb-4" />
                    <h3 className="font-semibold text-lg text-foreground mb-2">{item.title}</h3>
                    <p className="text-muted-foreground text-sm">{item.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="mb-8">
            <h2 className="font-display text-2xl font-bold text-foreground mb-4">{t('advisorsTitle')}</h2>
            <Tabs value={advisorType} onValueChange={setAdvisorType}>
              <TabsList className="mb-6">
                {ADVISOR_TYPES.map((type) => {
                  const Icon = type.icon
                  return (
                    <TabsTrigger key={type.id} value={type.id} className="gap-2 rounded-lg">
                      <Icon size={18} />
                      {type.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              <TabsContent value="1on1" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <p className="text-muted-foreground">{t('loadingAdvisors')}</p>
                  ) : mentors.length === 0 ? (
                    <p className="text-muted-foreground">{t('noAdvisors')}</p>
                  ) : (
                    mentors.map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} onBook={handleBook} />
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="group" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <p className="text-muted-foreground">{t('loadingAdvisors')}</p>
                  ) : (
                    mentors.filter((m) => m.availability === 'Available').map((mentor) => (
                      <MentorCard key={mentor.id} mentor={mentor} onBook={handleBook} />
                    ))
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-4">{t('groupClinicNote')}</p>
              </TabsContent>
              <TabsContent value="business" className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {loading ? (
                    <p className="text-muted-foreground">{t('loadingAdvisors')}</p>
                  ) : (
                    <>
                      {mentors.filter((m) => m.specialization?.toLowerCase().includes('business') || m.specialization?.toLowerCase().includes('strategy')).map((mentor) => (
                        <MentorCard key={mentor.id} mentor={mentor} onBook={handleBook} />
                      ))}
                      {mentors.filter((m) => m.specialization?.toLowerCase().includes('business') || m.specialization?.toLowerCase().includes('strategy')).length === 0 &&
                        mentors.map((mentor) => (
                          <MentorCard key={mentor.id} mentor={mentor} onBook={handleBook} />
                        ))}
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="text-center">
            <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-bold rounded-lg" disabled={!!booking}>
              {t('bookSession')}
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
