'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'

interface EventItem {
  startDate?: string | Date
  id: string
  title: string
  description?: string
  date: string | Date
  location?: string
  type?: string
  capacity?: number
  registered?: number
}

export default function EventDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const id = params.id as string
  const [event, setEvent] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)

  useEffect(() => {
    apiClient
      .getEvents()
      .then((res) => {
        const list = res.success && res.data ? (Array.isArray(res.data) ? res.data : []) : []
        const found = list.find((e: EventItem) => e.id === id)
        setEvent(found || null)
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleRegister = async () => {
    setRegistering(true)
    try {
      const res = await apiClient.registerEvent(id)
      if (res.success) alert('Successfully registered for this event!')
      else alert(res.error || 'Registration failed')
    } catch {
      alert('Registration failed')
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700" />
        </main>
        <Footer />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display text-foreground mb-2">Event Not Found</h1>
            <Link href={`/${locale}/events`}>
              <Button variant="outline">Back to Events</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const rawDate = event.startDate ?? event.date
  const date = rawDate ? (typeof rawDate === 'string' ? new Date(rawDate) : rawDate) : null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-3xl">
          <Link
            href={`/${locale}/events`}
            className="inline-flex items-center gap-2 text-esrc-green-700 hover:text-esrc-green-900 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Events
          </Link>

          <Card className="shadow-lg overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-esrc-green-400 to-esrc-green-600" />
            <CardContent className="pt-8 pb-8">
              <Badge className="mb-4">{event.type || 'Event'}</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                {event.title}
              </h1>

              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar size={20} className="text-esrc-green-700" />
                  <span>{date ? date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'TBA'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={20} className="text-esrc-green-700" />
                  <span>{event.location || 'TBA'}</span>
                </div>
                {event.capacity != null && (
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-esrc-green-700" />
                    <span>{event.registered ?? 0} / {event.capacity} registered</span>
                    <div className="flex-1 mx-2">
                      <div className="w-full h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-full bg-esrc-green-500 transition-all"
                          style={{
                            width: `${Math.min(100, ((event.registered ?? 0) / event.capacity) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* QR Registration Token (mock) */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg border inline-block">
                <p className="text-xs font-medium text-gray-600 mb-2">Registration QR Token</p>
                <div className="flex items-center gap-4">
                  <svg width="80" height="80" viewBox="0 0 80 80" className="bg-white p-1 rounded">
                    {/* Mock QR pattern */}
                    <rect width="80" height="80" fill="white" />
                    {Array.from({ length: 9 }).map((_, i) => (
                      <rect key={i} x={(i % 3) * 26 + 2} y={Math.floor(i / 3) * 26 + 2} width="22" height="22" fill={i % 2 === 0 ? 'black' : 'white'} stroke="black" strokeWidth="1" />
                    ))}
                    <rect x="8" y="8" width="10" height="10" fill="black" />
                    <rect x="62" y="8" width="10" height="10" fill="black" />
                    <rect x="8" y="62" width="10" height="10" fill="black" />
                  </svg>
                  <div className="text-xs text-gray-500">
                    <p>Token: REG-{event.id.slice(-8).toUpperCase()}</p>
                    <p>Scan at event check-in</p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="prose max-w-none mb-8">
                  <p className="text-foreground leading-relaxed">{event.description}</p>
                </div>
              )}

              <Button
                onClick={handleRegister}
                disabled={registering}
                className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-bold py-3"
              >
                {registering ? 'Registering...' : 'Register for Event'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
