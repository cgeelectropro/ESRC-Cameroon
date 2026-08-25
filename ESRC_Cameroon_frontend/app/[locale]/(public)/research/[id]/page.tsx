'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Download, FileText, ArrowLeft, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import type { Publication } from '@/lib/types'

function formatApa(pub: Publication & { doi?: string; publishedAt?: string }): string {
  const authors = Array.isArray(pub.authors) ? pub.authors : (pub.authors != null ? [String(pub.authors)] : [])
  const year = pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : new Date().getFullYear()
  const auth = authors.length <= 7
    ? authors.map((a, i) => {
        const parts = a.trim().split(/\s+/)
        const last = parts.pop() ?? ''
        const initials = parts.map((p) => p[0] + '.').join(' ')
        return `${last}, ${initials}`
      }).join(', ')
    : `${authors[0].trim().split(/\s+/).pop()}, ${authors[0].trim().split(/\s+/).slice(0, -1).map((p) => p[0] + '.').join(' ')}. et al.`
  let out = `${auth} (${year}). ${pub.title}.`
  if (pub.doi) out += ` https://doi.org/${pub.doi}`
  return out
}

function formatMla(pub: Publication & { doi?: string; publishedAt?: string }): string {
  const authors = Array.isArray(pub.authors) ? pub.authors : (pub.authors != null ? [String(pub.authors)] : [])
  const year = pub.publishedAt ? new Date(pub.publishedAt).getFullYear() : new Date().getFullYear()
  const auth = authors.join(', ')
  let out = `${auth}. "${pub.title}." ${year}.`
  if (pub.doi) out += ` https://doi.org/${pub.doi}`
  return out
}

function CitationPopover({
  pub,
  copied,
  onCopy,
}: {
  pub: Publication & { doi?: string; publishedAt?: string }
  copied: 'apa' | 'mla' | null
  onCopy: (text: string, format: 'apa' | 'mla') => void
}) {
  const apa = formatApa(pub)
  const mla = formatMla(pub)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <FileText size={18} className="mr-2" />
          Cite
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[420px]" align="start">
        <div className="space-y-4">
          <h4 className="font-semibold">Citation (APA)</h4>
          <p className="text-sm text-muted-foreground break-words">{apa}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(apa, 'apa')}
          >
            {copied === 'apa' ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {copied === 'apa' ? 'Copied!' : 'Copy APA'}
          </Button>
          <h4 className="font-semibold pt-2">Citation (MLA)</h4>
          <p className="text-sm text-muted-foreground break-words">{mla}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onCopy(mla, 'mla')}
          >
            {copied === 'mla' ? <Check size={14} className="mr-1" /> : <Copy size={14} className="mr-1" />}
            {copied === 'mla' ? 'Copied!' : 'Copy MLA'}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default function PublicationDetailPage() {
  const params = useParams()
  const locale = useLocale()
  const id = params.id as string
  const [pub, setPub] = useState<Publication | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<'apa' | 'mla' | null>(null)

  const copyCitation = (text: string, format: 'apa' | 'mla') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(format)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  useEffect(() => {
    apiClient
      .getPublication(id)
      .then((res) => {
        if (res.success && res.data) {
          const p = (res.data as { publication?: Publication }).publication ?? (res.data as Publication)
          setPub(p)
        }
      })
      .finally(() => setLoading(false))
  }, [id])

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

  if (!pub) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display text-esrc-dark mb-2">Publication Not Found</h1>
            <Link href={`/${locale}/research`}>
              <Button variant="outline">Back to Research</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const authors = Array.isArray(pub.authors) ? pub.authors : (pub.authors != null ? [String(pub.authors)] : [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-3xl">
          <Link
            href={`/${locale}/research`}
            className="inline-flex items-center gap-2 text-esrc-green-700 hover:text-esrc-green-900 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Research
          </Link>

          <Card className="shadow-lg">
            <CardContent className="pt-8 pb-8">
              <Badge className="mb-4">{(pub as { type?: string }).type?.replace('_', ' ') || 'Publication'}</Badge>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-esrc-dark mb-4">
                {pub.title}
              </h1>
              <p className="text-esrc-mid mb-4">
                {authors.join(', ')}
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Published {(pub as { publishedAt?: string }).publishedAt}
                {(pub as { doi?: string }).doi && ` • DOI: ${(pub as { doi?: string }).doi}`}
              </p>

              <div className="prose max-w-none mb-8">
                <h3 className="font-display text-lg font-semibold mb-2">Abstract</h3>
                <p className="text-esrc-dark leading-relaxed">{pub.abstract}</p>
              </div>

              <div className="flex flex-wrap gap-2 mb-8">
                {(pub as { tags?: string[] }).tags?.map((tag) => (
                  <Badge key={tag} variant="outline">{tag}</Badge>
                ))}
              </div>

              <div className="flex gap-4">
                <a href={(pub as { downloadUrl?: string }).downloadUrl} download>
                  <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark">
                    <Download size={18} className="mr-2" />
                    Download
                  </Button>
                </a>
                <CitationPopover pub={pub} copied={copied} onCopy={copyCitation} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
