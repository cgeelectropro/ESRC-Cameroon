'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, CreditCard, Smartphone, Shield, Lock, CheckCircle } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface CourseInfo {
  id: string
  title: string
  price: number
  currency: string
  thumbnailUrl?: string
}

const PAYMENT_METHODS = [
  {
    id: 'flutterwave',
    label: 'Card / Mobile Money',
    sublabel: 'Visa, Mastercard, MTN MoMo, Orange Money & more',
    icon: '🌍',
    description: 'Powered by Flutterwave — supports 30+ payment methods across Africa',
    recommended: true,
  },
  {
    id: 'mtn_momo',
    label: 'MTN Mobile Money',
    sublabel: 'XAF — Cameroon only',
    icon: '📱',
    description: 'Pay directly with your MTN MoMo account',
    recommended: false,
  },
  {
    id: 'orange_money',
    label: 'Orange Money',
    sublabel: 'XAF — Cameroon only',
    icon: '🟠',
    description: 'Pay directly with your Orange Money account',
    recommended: false,
  },
]

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const locale = useLocale()

  const courseId = searchParams.get('courseId')
  const [course, setCourse] = useState<CourseInfo | null>(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [method, setMethod] = useState('flutterwave')
  const [phone, setPhone] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!courseId) { setLoadingCourse(false); return }
    apiClient.getCourse(courseId).then(res => {
      if (res.success && res.data) {
        const c = res.data as any
        setCourse({ id: c.id, title: c.title, price: c.price, currency: c.currency ?? 'XAF', thumbnailUrl: c.thumbnailUrl })
      }
    }).finally(() => setLoadingCourse(false))
  }, [courseId])

  const handlePay = async () => {
    if (!courseId || !course) return
    setError(null)
    setProcessing(true)

    try {
      if (method === 'flutterwave') {
        const res = await apiClient.initiateFlutterwave({ courseId, phoneNumber: phone || undefined })
        if (res.success && res.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl
        } else {
          setError(res.error ?? 'Failed to initiate payment. Please try again.')
        }
      } else {
        // MTN / Orange — direct initiate (sandbox)
        const res = await apiClient.initiatePayment({ courseId, method, amount: course!.price, currency: course!.currency, phoneNumber: phone || undefined })
        if (res.success && (res.data as any)?.status === 'COMPLETED') {
          router.push(`/${locale}/payment/callback?status=successful&tx_ref=${(res.data as any).referenceCode}&transaction_id=sandbox`)
        } else {
          setError(res.error ?? 'Payment failed. Please try again.')
        }
      }
    } catch {
      setError('Unexpected error. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (!courseId) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No course selected.</p>
            <Button asChild><Link href={`/${locale}/courses`}>Browse Courses</Link></Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="font-display text-3xl text-primary mb-1">Checkout</h1>
            <p className="text-muted-foreground text-sm">Complete your enrollment securely</p>
          </div>

          {/* Course Summary */}
          <div className="rounded-xl border border-border bg-card p-5 flex items-center gap-4">
            {loadingCourse ? (
              <div className="flex-1 space-y-2 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            ) : course ? (
              <>
                {course.thumbnailUrl && (
                  <img src={course.thumbnailUrl} alt={course.title} className="w-16 h-16 rounded-lg object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">{course.title}</p>
                  <p className="text-sm text-muted-foreground">Full course access</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-display text-xl text-primary font-bold">
                    {course.price.toLocaleString()} {course.currency}
                  </p>
                  <p className="text-xs text-muted-foreground">One-time payment</p>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Course not found.</p>
            )}
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-3">
            <h2 className="font-semibold text-foreground">Payment Method</h2>
            {PAYMENT_METHODS.map(pm => (
              <button
                key={pm.id}
                type="button"
                onClick={() => setMethod(pm.id)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all',
                  method === pm.id
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border bg-card hover:border-primary/40'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{pm.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{pm.label}</span>
                      {pm.recommended && (
                        <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{pm.sublabel}</p>
                  </div>
                  <div className={cn(
                    'w-4 h-4 rounded-full border-2 shrink-0 transition-colors',
                    method === pm.id ? 'border-primary bg-primary' : 'border-border'
                  )} />
                </div>
                {method === pm.id && (
                  <p className="text-xs text-muted-foreground mt-2 ml-9">{pm.description}</p>
                )}
              </button>
            ))}
          </div>

          {/* Phone number — for mobile money */}
          {(method === 'mtn_momo' || method === 'orange_money') && (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Mobile Money Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+237 6XX XXX XXX"
                className="text-sm"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Pay Button */}
          <Button
            onClick={handlePay}
            disabled={processing || loadingCourse || !course}
            className="w-full h-12 text-base gap-2 bg-primary hover:bg-primary/90"
          >
            {processing ? (
              <><Loader2 className="w-4 h-4 animate-spin" />Processing…</>
            ) : method === 'flutterwave' ? (
              <><CreditCard className="w-4 h-4" />Pay {course ? `${course.price.toLocaleString()} ${course.currency}` : ''} with Flutterwave</>
            ) : (
              <><Smartphone className="w-4 h-4" />Pay with {method === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}</>
            )}
          </Button>

          {/* Security note */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Lock className="w-3 h-3" />SSL Encrypted</span>
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" />Secure Checkout</span>
            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" />Instant Enrollment</span>
          </div>

          {method === 'flutterwave' && (
            <p className="text-center text-xs text-muted-foreground">
              You will be redirected to Flutterwave&apos;s secure payment page. After payment, you&apos;ll return here automatically.
            </p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
