'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Award, CheckCircle, XCircle, Loader2, Shield } from 'lucide-react'

type CertData = {
  id: string
  courseName: string
  verificationCode: string
  issuedAt: string
  user?: { firstName: string; lastName: string }
}

export default function CertificateVerifyPage() {
  const params = useParams()
  const code = params.code as string
  const [cert, setCert] = useState<CertData | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!code) return
    fetch(`/api/certificates/verify/${code}`)
      .then((r) => r.json())
      .then((json) => {
        const data = json.data ?? json
        if (data && (data.id || data.verificationCode)) {
          setCert(data)
        } else {
          setNotFound(true)
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [code])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow flex items-center justify-center section-padding">
        <div className="container-width max-w-lg mx-auto text-center">
          {loading && (
            <div className="space-y-4">
              <Loader2 size={48} className="animate-spin text-esrc-green-700 mx-auto" />
              <p className="text-muted-foreground">Verifying certificate...</p>
            </div>
          )}

          {!loading && notFound && (
            <div className="space-y-4">
              <XCircle size={64} className="text-red-500 mx-auto" />
              <h1 className="text-2xl font-bold text-foreground font-display">Certificate Not Found</h1>
              <p className="text-muted-foreground">
                The verification code <code className="bg-muted px-2 py-0.5 rounded font-mono text-sm">{code}</code> does not match any certificate in our system.
              </p>
              <p className="text-sm text-muted-foreground">
                If you believe this is an error, please contact{' '}
                <a href="mailto:info@esrccameroon.org" className="text-esrc-green-700 hover:underline">info@esrccameroon.org</a>.
              </p>
            </div>
          )}

          {!loading && cert && (
            <div className="space-y-6">
              {/* Verified badge */}
              <div className="flex items-center justify-center gap-2 text-esrc-green-700">
                <Shield size={20} className="fill-esrc-green-100" />
                <span className="font-semibold text-sm uppercase tracking-wide">Verified Certificate</span>
                <CheckCircle size={20} className="fill-esrc-green-700 text-white" />
              </div>

              {/* Certificate card */}
              <div className="bg-gradient-to-br from-esrc-green-900 to-esrc-green-700 text-white rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-esrc-gold-500/10" />

                <div className="relative">
                  <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-esrc-gold-500/20 flex items-center justify-center">
                      <Award size={40} className="text-esrc-gold-400" />
                    </div>
                  </div>

                  <p className="text-esrc-gold-400 text-xs font-bold uppercase tracking-widest mb-2">
                    NextGen — ESRC Cameroon
                  </p>
                  <p className="text-white/70 text-sm mb-4">Certificate of Completion</p>

                  {cert.user && (
                    <h2 className="text-3xl font-display font-bold text-white mb-3">
                      {cert.user.firstName} {cert.user.lastName}
                    </h2>
                  )}

                  <p className="text-white/80 text-sm mb-1">has successfully completed</p>
                  <h3 className="text-xl font-bold text-esrc-gold-300 mb-6">{cert.courseName}</h3>

                  <div className="pt-4 border-t border-white/20 grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Issued</p>
                      <p className="text-sm text-white font-medium">
                        {new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase tracking-wide mb-1">Verification Code</p>
                      <p className="text-xs text-white/80 font-mono">{cert.verificationCode}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                This certificate was issued by NextGen (ESRC Cameroon) and is verified as authentic.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
