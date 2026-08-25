'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, Calendar } from 'lucide-react'
import type { Opportunity } from '@/lib/types'

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await apiClient.getOpportunities()
        if (res.success && res.data) setOpportunities(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error('Failed to fetch opportunities:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOpportunities()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title="Jobs & Opportunities"
        subtitle="Discover job openings, internships, fellowships, and funding opportunities for entrepreneurs."
        imageKey="opportunities"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700 mx-auto"></div>
            </div>
          ) : opportunities.length > 0 ? (
            <div className="space-y-4">
              {opportunities.map((opp) => (
                <Card key={opp.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-esrc-green-500">
                            {opp.type.replace('_', ' ')}
                          </Badge>
                          {opp.isRemote && (
                            <Badge variant="outline">Remote</Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {opp.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {opp.organization}
                        </p>
                        <p className="text-sm text-foreground mb-4 line-clamp-2">
                          {opp.description}
                        </p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <MapPin size={16} />
                            <span>{opp.location}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={16} />
                            <span>Due: {new Date(opp.deadline).toLocaleDateString()}</span>
                          </div>
                          {opp.salary && (
                            <div className="flex items-center gap-1">
                              <Briefcase size={16} />
                              <span>{opp.salary}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {opp.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => window.open(opp.applicationUrl, '_blank')}
                        className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-bold whitespace-nowrap"
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">No opportunities found. Check back soon!</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
