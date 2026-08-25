'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Award, Download, Loader2, ExternalLink, Share2 } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'

type Certificate = { id: string; courseName: string; issuedAt: string; verificationCode: string; pdfUrl?: string }

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    apiClient.getCertificates().then((res) => {
      setLoading(false)
      if (res.success && res.data) setCertificates(Array.isArray(res.data) ? res.data as Certificate[] : [])
    })
  }, [])

  const handleDownload = async (cert: Certificate) => {
    // If pdfUrl is already on the cert object, open directly
    if (cert.pdfUrl) {
      window.open(cert.pdfUrl, '_blank', 'noopener,noreferrer')
      return
    }
    setDownloading(cert.id)
    const res = await apiClient.getCertificateDownloadUrl(cert.id)
    setDownloading(null)
    if (res.success && 'url' in res && res.url) {
      window.open(res.url as string, '_blank', 'noopener,noreferrer')
    } else {
      // Fallback: open the public verification page
      window.open(`/en/certificates/verify/${cert.verificationCode}`, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 pt-20">
        <Sidebar />

        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">
                Your Certificates
              </h1>
              <p className="text-muted-foreground">
                Download and verify your earned certificates
              </p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-esrc-green-600" />
              </div>
            )}

            {!loading && certificates.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {certificates.map((cert) => (
                  <Card key={cert.id} className="bg-gradient-to-br from-esrc-green-50 to-esrc-gold-100 border-esrc-green-200 shadow-sm hover:shadow-lg transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <Award size={32} className="text-esrc-green-700" />
                        <Badge className="bg-esrc-green-500 text-white">Verified</Badge>
                      </div>

                      <h3 className="font-display text-xl text-foreground mb-2">
                        {cert.courseName}
                      </h3>

                      <p className="text-sm text-muted-foreground mb-4">
                        Earned {new Date(cert.issuedAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>

                      <div className="mb-4">
                        <p className="text-xs text-muted-foreground mb-1">Verification Code</p>
                        <p className="font-mono text-sm text-foreground">{cert.verificationCode}</p>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-2"
                          onClick={() => handleDownload(cert)}
                          disabled={!!downloading}
                        >
                          {downloading === cert.id ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Download size={16} />
                          )}
                          Download
                        </Button>
                        <Link href={`/certificates/verify/${cert.verificationCode}`} target="_blank">
                          <Button variant="outline" size="icon" title="Verify certificate">
                            <ExternalLink size={16} />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="icon"
                          title="Copy verification link"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/en/certificates/verify/${cert.verificationCode}`)
                          }}
                        >
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {!loading && certificates.length === 0 && (
              <div className="text-center py-12">
                <Award size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">No certificates yet</p>
                <p className="text-muted-foreground text-sm mt-2">Complete courses to earn certificates</p>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
