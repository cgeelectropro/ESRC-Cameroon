'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Calendar, MapPin, List, CalendarDays } from 'lucide-react'

interface EventItem {
  id: string
  title: string
  date?: string | Date
  startDate?: string | Date
  location?: string
  type?: string
  price?: number
  currency?: string
  isFree?: boolean
  isOnline?: boolean
  capacity?: number
  registered?: number
}

export default function EventsPage() {
  const t = useTranslations('events')
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await apiClient.getEvents()
        if (res.success && res.data) setEvents(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error('Failed to fetch events:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [])

  const formatDate = (d: string | Date | undefined) => {
    if (!d) return 'TBA'
    const date = new Date(d)
    if (isNaN(date.getTime())) return 'TBA'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('pageTitle')}
        subtitle={t('pageSubtitle')}
        imageKey="events"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <Tabs defaultValue="list" className="mb-6">
            <TabsList>
              <TabsTrigger value="list" className="gap-2">
                <List size={18} />
                {t('listView')}
              </TabsTrigger>
              <TabsTrigger value="calendar" className="gap-2">
                <CalendarDays size={18} />
                {t('calendarView')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="mt-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700 mx-auto"></div>
                </div>
              ) : events.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event) => (
                    <Card key={event.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all card-hover">
                      <div className="aspect-video bg-gradient-to-br from-esrc-green-400 to-esrc-green-600 flex items-center justify-center">
                        <Calendar size={48} className="text-white opacity-30" />
                      </div>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <Badge className="bg-esrc-green-500">{event.type?.replace('_', ' ') || t('event')}</Badge>
                          {event.isFree || event.price == null || event.price === 0 ? (
                            <Badge variant="outline" className="bg-esrc-green-50 text-esrc-green-700">
                              {t('free')}
                            </Badge>
                          ) : (
                            <Badge variant="outline">{event.price} {event.currency}</Badge>
                          )}
                        </div>

                        <h3 className="font-semibold text-lg text-foreground mb-3 line-clamp-2">
                          {event.title}
                        </h3>

                        <div className="space-y-2 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-2">
                            <Calendar size={16} />
                            <span>{formatDate(event.startDate ?? event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} />
                            <span>{event.isOnline ? t('onlineEvent') : event.location}</span>
                          </div>
                          {event.capacity != null && (
                            <div>
                              <div className="flex justify-between text-xs mb-1">
                                <span>{t('capacity')}</span>
                                <span>{event.registered ?? 0}/{event.capacity}</span>
                              </div>
                              <div className="w-full h-2 bg-muted rounded overflow-hidden">
                                <div
                                  className="h-full bg-esrc-green-500 transition-all"
                                  style={{ width: `${Math.min(100, ((event.registered ?? 0) / event.capacity) * 100)}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <Link href={`/events/${event.id}`}>
                          <Button className="w-full bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-medium">
                            {t('register')}
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground text-lg">{t('empty')}</p>
                </div>
              )}
            </TabsContent>
            <TabsContent value="calendar" className="mt-4">
              <div className="bg-card p-6 rounded-lg border min-h-[400px]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {events.slice(0, 6).map((ev) => (
                    <Link key={ev.id} href={`/events/${ev.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="pt-4">
                          <p className="text-sm text-esrc-green-700 font-semibold">
                            {formatDate(ev.startDate ?? ev.date)}
                          </p>
                          <p className="font-medium line-clamp-2">{ev.title}</p>
                          <p className="text-xs text-muted-foreground mt-1">{ev.type}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  )
}
