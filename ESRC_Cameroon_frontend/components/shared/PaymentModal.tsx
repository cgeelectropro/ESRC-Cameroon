'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { apiClient } from '@/lib/api-client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Smartphone, CreditCard, Globe, Loader2 } from 'lucide-react'
import type { Course } from '@/lib/types'

interface PaymentModalProps {
  open: boolean
  onClose: () => void
  course: Course
  onSuccess: () => void
}

type PaymentMethod = 'flutterwave' | 'mtn_momo' | 'orange_money' | 'stripe' | 'paypal'

export function PaymentModal({ open, onClose, course, onSuccess }: PaymentModalProps) {
  const t = useTranslations('payment')
  const [method, setMethod] = useState<PaymentMethod>('flutterwave')
  const [phone, setPhone] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async () => {
    setError(null)
    setProcessing(true)
    try {
      if (method === 'flutterwave') {
        // Redirect to Flutterwave hosted checkout
        const res = await apiClient.initiateFlutterwave({
          courseId: course.id,
          amount: course.price,
          currency: course.currency,
          phoneNumber: phone || undefined,
        })
        if (res.success && res.data?.paymentUrl) {
          window.location.href = res.data.paymentUrl
          return
        }
        setError(res.error ?? 'Failed to initiate payment')
      } else {
        const res = await apiClient.initiatePayment({
          courseId: course.id,
          amount: course.price,
          currency: course.currency,
          method,
          phoneNumber: (method === 'mtn_momo' || method === 'orange_money') ? phone : undefined,
        })
        if (res.success) {
          await apiClient.enrollCourse(course.id)
          onSuccess()
          onClose()
        } else {
          setError(res.error ?? 'Payment failed')
        }
      }
    } catch (err) {
      setError('Unexpected error. Please try again.')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const thumbnail = course.thumbnail || (course as { image?: string }).image

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Summary */}
          <div className="flex gap-4 p-3 bg-accent/50 rounded-lg">
            <div className="relative w-24 h-16 flex-shrink-0 rounded overflow-hidden">
              <Image
                src={thumbnail || 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop'}
                alt={course.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-semibold text-foreground line-clamp-1">{course.title}</h4>
              <p className="text-lg font-bold text-primary">
                {course.isFree ? 'Free' : `${course.price.toLocaleString()} ${course.currency}`}
              </p>
            </div>
          </div>

          {/* Payment Methods */}
          <div>
            <Label className="mb-3 block">{t('paymentMethod')}</Label>
            <div className="space-y-2">
              {/* Flutterwave — recommended */}
              <button
                onClick={() => setMethod('flutterwave')}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all text-left ${
                  method === 'flutterwave' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
                }`}
              >
                <span className="text-xl">🌍</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">Card / Mobile Money</span>
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">Recommended</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Visa, Mastercard, MTN, Orange & more via Flutterwave</p>
                </div>
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMethod('mtn_momo')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    method === 'mtn_momo' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Smartphone className="text-yellow-600" size={20} />
                  <span className="font-medium text-sm">MTN MoMo</span>
                </button>
                <button
                  onClick={() => setMethod('orange_money')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    method === 'orange_money' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Smartphone className="text-orange-600" size={20} />
                  <span className="font-medium text-sm">Orange Money</span>
                </button>
                <button
                  onClick={() => setMethod('stripe')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    method === 'stripe' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <CreditCard size={20} className="text-blue-600" />
                  <span className="font-medium text-sm">Card (Stripe)</span>
                </button>
                <button
                  onClick={() => setMethod('paypal')}
                  className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-all ${
                    method === 'paypal' ? 'border-primary bg-accent/50' : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Globe size={20} className="text-blue-600" />
                  <span className="font-medium text-sm">PayPal</span>
                </button>
              </div>
            </div>
          </div>

          {/* Phone for Mobile Money */}
          {(method === 'mtn_momo' || method === 'orange_money') && (
            <div>
              <Label htmlFor="phone">{t('phone')}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="237 6XX XXX XXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">{error}</div>
          )}

          <Button
            onClick={handleComplete}
            disabled={processing || ((method === 'mtn_momo' || method === 'orange_money') && !phone)}
            className="w-full btn-gold py-3 gap-2"
          >
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            {processing
              ? (method === 'flutterwave' ? 'Redirecting to Flutterwave…' : t('processing'))
              : method === 'flutterwave'
                ? `Pay with Flutterwave →`
                : t('complete')}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {t('secure')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
