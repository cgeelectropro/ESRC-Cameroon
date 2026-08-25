'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'

export default function PaymentCallbackPage() {
  const searchParams = useSearchParams()
  const locale = useLocale()
  const router = useRouter()

  const status = searchParams.get('status')
  const txRef = searchParams.get('tx_ref')
  const transactionId = searchParams.get('transaction_id')

  const [verifying, setVerifying] = useState(true)
  const [result, setResult] = useState<'success' | 'failed' | 'cancelled' | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!txRef) { setVerifying(false); setResult('failed'); return }

    if (status === 'cancelled') {
      setVerifying(false); setResult('cancelled'); return
    }

    // Verify with backend
    apiClient.verifyFlutterwave(txRef, transactionId ?? '').then(res => {
      if (res.success && res.data?.status === 'COMPLETED') {
        setResult('success')
      } else {
        setResult('failed')
        setError(res.error ?? 'Payment verification failed')
      }
    }).catch(() => {
      setResult('failed')
      setError('Could not verify payment. Please contact support.')
    }).finally(() => setVerifying(false))
  }, [txRef, transactionId, status])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-card border border-border rounded-2xl p-10 max-w-md w-full text-center shadow-sm">
          {verifying ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
              <h2 className="font-display text-2xl text-foreground mb-2">Verifying Payment…</h2>
              <p className="text-muted-foreground text-sm">Please wait while we confirm your payment.</p>
            </>
          ) : result === 'success' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Payment Successful!</h2>
              <p className="text-muted-foreground text-sm mb-6">Your payment has been confirmed and you are now enrolled. Check your email for a confirmation receipt.</p>
              <div className="flex flex-col gap-3">
                <Button asChild className="w-full">
                  <Link href={`/${locale}/dashboard`}>Go to My Dashboard</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${locale}/courses`}>Browse More Courses</Link>
                </Button>
              </div>
            </>
          ) : result === 'cancelled' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Payment Cancelled</h2>
              <p className="text-muted-foreground text-sm mb-6">You cancelled the payment. No charge was made.</p>
              <Button onClick={() => router.back()} className="w-full">Go Back</Button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
              </div>
              <h2 className="font-display text-2xl text-foreground mb-2">Payment Failed</h2>
              <p className="text-muted-foreground text-sm mb-2">{error ?? 'Your payment could not be processed.'}</p>
              <p className="text-xs text-muted-foreground mb-6">If you were charged, please contact us at support@nextgen-en.com with your reference: <strong>{txRef}</strong></p>
              <div className="flex flex-col gap-3">
                <Button onClick={() => router.back()} className="w-full">Try Again</Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href={`/${locale}/contact`}>Contact Support</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
