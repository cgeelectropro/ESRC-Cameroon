'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Download, ExternalLink, Search } from 'lucide-react'
import type { Publication } from '@/lib/types'

export default function ResearchPage() {
  const t = useTranslations('research')
  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchPublications = async () => {
      try {
        const res = await apiClient.getPublications()
        if (res.success && res.data) setPublications(Array.isArray(res.data) ? res.data : [])
      } catch (error) {
        console.error('Failed to fetch publications:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPublications()
  }, [])

  const filteredPublications = publications.filter((pub) => {
    const matchType = selectedType === 'all' || pub.type === selectedType
    const matchSearch =
      !searchQuery ||
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (Array.isArray(pub.authors) ? pub.authors : (pub.authors != null ? [String(pub.authors)] : [])).some((author: string) => author.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchType && matchSearch
  })

  const publicationTypes = ['all', 'policy_brief', 'working_paper', 'journal', 'report', 'dataset']

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        imageKey="research"
      >
          <div className="flex gap-2 max-w-md mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="btn-gold">
              {t('search')}
            </Button>
          </div>
      </PageHero>

      <main className="flex-grow section-padding">
        <div className="container-width">
          {/* Filter Tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {publicationTypes.map((type) => (
              <Button
                key={type}
                onClick={() => setSelectedType(type)}
                variant={selectedType === type ? 'default' : 'outline'}
                className={
                  selectedType === type
                    ? ''
                    : 'border-primary text-primary hover:bg-accent'
                }
              >
                {type === 'all'
                  ? t('allPublications')
                  : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
              </Button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : filteredPublications.length > 0 ? (
            <div className="space-y-4">
              {filteredPublications.map((publication) => (
                <Card key={publication.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{publication.type.replace('_', ' ')}</Badge>
                          {publication.doi && (
                            <span className="text-xs text-muted-foreground">DOI: {publication.doi}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {publication.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {t('by')} {publication.authors.join(', ')}
                        </p>
                        <p className="text-sm text-foreground mb-4 line-clamp-2">
                          {publication.abstract}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {publication.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {t('published')}: {new Date(publication.publishedAt).toLocaleDateString()} •{' '}
                          {publication.downloadCount} {t('downloads')}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          onClick={() => window.open(publication.downloadUrl, '_blank')}
                          size="sm"
                          className="gap-2"
                        >
                          <Download size={16} />
                          {t('download')}
                        </Button>
                        <Link href={`/research/${publication.id}`}>
                          <Button size="sm" variant="outline" className="gap-2">
                            <ExternalLink size={16} />
                            {t('view')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">{t('noPublications')}</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
