'use client'

import { Link } from '@/i18n/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, ExternalLink } from 'lucide-react'
import type { Publication } from '@/lib/types'

interface PublicationCardProps {
  publication: Publication
}

export function PublicationCard({ publication }: PublicationCardProps) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-6">
        <Badge variant="outline" className="mb-3">{publication.type.replace('_', ' ')}</Badge>
        <Link href={`/research/${publication.id}`}>
          <h3 className="font-display text-base font-semibold text-foreground hover:text-primary transition-colors mb-2">
            {publication.title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{publication.abstract}</p>
        <p className="text-xs text-muted-foreground mb-4">
          {Array.isArray(publication.authors) ? publication.authors.join(', ') : publication.authors}
        </p>
        <div className="flex gap-2">
          <Link href={`/research/${publication.id}`}>
            <Button variant="outline" size="sm" className="rounded-lg">
              <ExternalLink size={16} className="mr-1" />
              Read
            </Button>
          </Link>
          <a href={publication.downloadUrl} download>
            <Button variant="outline" size="sm" className="rounded-lg">
              <Download size={16} className="mr-1" />
              Download
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
