'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Briefcase, Calendar } from 'lucide-react'
import type { Opportunity } from '@/lib/types'

interface OpportunityCardProps {
  opportunity: Opportunity
}

export function OpportunityCard({ opportunity }: OpportunityCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{opportunity.type}</Badge>
              <span className="text-sm text-muted-foreground">{opportunity.organization}</span>
            </div>
            <Link href={`/opportunities/${opportunity.id}`}>
              <h3 className="font-display text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2">
                {opportunity.title}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{opportunity.description}</p>
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
              {opportunity.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {opportunity.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Briefcase size={14} />
                {opportunity.type}
              </span>
              {opportunity.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
          <Link href={`/opportunities/${opportunity.id}`}>
            <Badge className="bg-primary hover:bg-primary/90 cursor-pointer text-primary-foreground">Apply</Badge>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
