'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Calendar, MapPin, Users } from 'lucide-react'

interface EventCardProps {
  event: {
    id: string
    title: string
    date: string | Date
    location?: string
    type?: string
    price?: number
    currency?: string
    isFree?: boolean
    isOnline?: boolean
    capacity?: number
    registered?: number
  }
  formatDate: (d: string | Date) => string
  onRegister?: (eventId: string) => void
}

export function EventCard({ event, formatDate, onRegister }: EventCardProps) {
  return (
    <Card className="overflow-hidden shadow-sm hover:shadow-lg transition-all card-hover">
      <div className="aspect-video bg-gradient-to-br from-esrc-green-400 to-esrc-green-600 flex items-center justify-center">
        <Calendar size={48} className="text-white opacity-30" />
      </div>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-2 mb-3">
          <Badge variant="outline">{event.type || 'Event'}</Badge>
          {event.isFree && <Badge className="bg-primary text-primary-foreground">Free</Badge>}
        </div>
        <Link href={`/events/${event.id}`}>
          <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2">
            {event.title}
          </h3>
        </Link>
        <div className="space-y-1 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={16} />
            <span>{formatDate(event.date)}</span>
          </div>
          {event.location && (
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              <span>{event.location}</span>
            </div>
          )}
          {(event.capacity != null || event.registered != null) && (
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{event.registered ?? 0} / {event.capacity ?? 0} registered</span>
            </div>
          )}
        </div>
        <Link href={`/events/${event.id}`}>
          <Button className="w-full rounded-lg" variant="outline">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
