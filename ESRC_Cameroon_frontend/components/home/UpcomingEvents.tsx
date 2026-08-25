'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin } from 'lucide-react'

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
}

function formatDate(d: string | Date | undefined, locale: string) {
  if (!d) return { day: '?', month: '?', full: 'TBA' }
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return { day: '?', month: '?', full: 'TBA' }
  const localeTag = locale === 'fr' ? 'fr-FR' : 'en-US'
  return {
    day: date.getDate(),
    month: date.toLocaleString(locale, { month: 'short' }),
    full: date.toLocaleDateString(localeTag, { month: 'short', day: 'numeric', year: 'numeric' }),
  }
}

export function UpcomingEvents() {
  const t = useTranslations('events')
  const locale = useLocale()
  const [events, setEvents] = useState<EventItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .getEvents()
      .then((res) => {
        const list = res.success && res.data && Array.isArray(res.data) ? res.data : []
        setEvents(list.slice(0, 3) as EventItem[])
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <section className="section-padding bg-background">
        <div className="container-width">
          <h2 className="font-display text-4xl font-bold text-foreground mb-8">{t('title')}</h2>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-padding bg-background">
      <div className="container-width">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-4xl font-bold text-foreground">{t('title')}</h2>
          <Link href="/events">
            <Button variant="outline" className="border-primary text-primary">
              {t('viewAll')}
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {events.map((event) => {
            const fd = formatDate(event.startDate ?? event.date, locale)
            return (
              <Card key={event.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all bg-card border-border">
                <CardContent className="p-0">
                  <div className="flex">
                    <div className="w-20 bg-primary text-primary-foreground flex flex-col items-center justify-center p-2">
                      <span className="text-2xl font-bold leading-none">{fd.day}</span>
                      <span className="text-xs uppercase">{fd.month}</span>
                    </div>
                    <div className="flex-1 p-4">
                      <Badge variant="outline" className="mb-2">
                        {event.type || t('event')}
                      </Badge>
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <MapPin size={14} />
                        <span>{event.location || t('tba')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        {event.isFree || (event.price === 0) ? (
                          <Badge className="bg-primary text-primary-foreground">{t('free')}</Badge>
                        ) : (
                          <span className="text-sm font-semibold text-primary">
                            {event.price?.toLocaleString()} {event.currency || 'XAF'}
                          </span>
                        )}
                        <Link href={`/events/${event.id}`}>
                          <Button size="sm" className="btn-gold">
                            {t('register')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {events.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            {t('empty')}
          </div>
        )}
      </div>
    </section>
  )
}
