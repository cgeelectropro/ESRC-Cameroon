'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Mentor } from '@/lib/types'

interface MentorCardProps {
  mentor: Mentor
  onBook?: (mentorId: string) => void
}

export function MentorCard({ mentor, onBook }: MentorCardProps) {
  const expertise = mentor.specialization ? mentor.specialization.split(',').map((s) => s.trim()) : []

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-esrc-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {mentor.image ? (
              <img src={mentor.image} alt={mentor.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-bold text-primary">
                {mentor.name.charAt(0)}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-semibold text-foreground">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground mb-2">{mentor.title}</p>
            <div className="flex flex-wrap gap-1 mb-2">
              {expertise.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mb-3">{mentor.availability} • {mentor.sessions} sessions</p>
            {onBook && mentor.availability === 'Available' && (
              <Button size="sm" className="rounded-lg" onClick={() => onBook(mentor.id)}>
                Book Session
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
