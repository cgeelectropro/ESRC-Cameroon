'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  RefreshCw,
  BookOpen,
  ArrowRight,
  Loader2,
} from 'lucide-react'

type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | null

interface ApprovalRequest {
  id: string
  status: RequestStatus
  title: string
  rejectionReason?: string
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
}

export default function PendingApprovalPage() {
  const { user, isLoading: authLoading, logout } = useAuth()
  const router = useRouter()
  const [request, setRequest] = useState<ApprovalRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await apiClient.getInstructorRequestStatus()
      if (res.success && res.data) {
        setRequest(res.data as ApprovalRequest)
        // If approved, redirect to dashboard after brief pause
        if (res.data.status === 'APPROVED') {
          setTimeout(() => router.push('/dashboard'), 3000)
        }
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
      return
    }
    if (!authLoading) {
      fetchStatus()
    }
  }, [authLoading, user, fetchStatus, router])

  // Poll every 30s while pending
  useEffect(() => {
    if (request?.status !== 'PENDING') return
    const interval = setInterval(fetchStatus, 30_000)
    return () => clearInterval(interval)
  }, [request?.status, fetchStatus])

  const handleRefresh = () => {
    setRefreshing(true)
    fetchStatus()
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const status = request?.status ?? 'PENDING'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg">

          {/* ── PENDING ── */}
          {status === 'PENDING' && (
            <div className="text-center space-y-8">
              {/* Animated clock badge */}
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/30 animate-pulse" />
                <div className="absolute inset-3 rounded-full bg-amber-200 dark:bg-amber-800/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Clock className="w-14 h-14 text-amber-500" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Application Under Review
                </h1>
                <p className="text-lg text-muted-foreground">
                  Thank you, <span className="font-semibold text-foreground">{user?.firstName}</span>!<br />
                  Your instructor application has been received.
                </p>
              </div>

              {/* Timeline */}
              <div className="bg-card border border-border rounded-2xl p-6 text-left space-y-4">
                <h3 className="font-semibold text-foreground mb-2">What happens next?</h3>
                {[
                  { icon: '✅', label: 'Application submitted', done: true },
                  { icon: '🔍', label: 'Admin review (24–48 hours)', done: false, active: true },
                  { icon: '📧', label: 'You receive an approval notification', done: false },
                  { icon: '🎓', label: 'Access your instructor dashboard', done: false },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 ${item.done ? 'opacity-100' : item.active ? 'opacity-100' : 'opacity-40'}`}>
                    <span className="text-lg">{item.icon}</span>
                    <span className={`text-sm ${item.active ? 'font-semibold text-primary' : 'text-foreground'}`}>
                      {item.label}
                    </span>
                    {item.active && (
                      <span className="ml-auto text-xs bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-medium">
                        In progress
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* Contact info */}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-left space-y-2">
                <p className="font-medium text-foreground">Questions? Contact us:</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href="mailto:info@esrccameroon.org" className="hover:text-primary transition-colors">info@esrccameroon.org</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+237 677 948 904 / 677 775 535</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" onClick={handleRefresh} disabled={refreshing} className="gap-2">
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  {refreshing ? 'Checking...' : 'Check Status'}
                </Button>
                <Button variant="ghost" onClick={logout} className="text-muted-foreground">
                  Sign Out
                </Button>
              </div>

              {request?.createdAt && (
                <p className="text-xs text-muted-foreground">
                  Submitted {new Date(request.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
          )}

          {/* ── APPROVED ── */}
          {status === 'APPROVED' && (
            <div className="text-center space-y-8">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse" />
                <div className="absolute inset-3 rounded-full bg-green-200 dark:bg-green-800/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <CheckCircle2 className="w-14 h-14 text-green-500" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  You&apos;re Approved!
                </h1>
                <p className="text-lg text-muted-foreground">
                  Congratulations, <span className="font-semibold text-foreground">{user?.firstName}</span>!<br />
                  Your instructor account is now active.
                </p>
              </div>

              {request?.adminNotes && (
                <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-xl p-4 text-sm text-left">
                  <p className="font-medium text-green-800 dark:text-green-300 mb-1">Message from admin:</p>
                  <p className="text-green-700 dark:text-green-400">{request.adminNotes}</p>
                </div>
              )}

              <p className="text-sm text-muted-foreground">Redirecting you to your dashboard...</p>

              <Button onClick={() => router.push('/dashboard')} className="gap-2 bg-esrc-green-700 hover:bg-esrc-green-900">
                Go to Instructor Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── REJECTED ── */}
          {status === 'REJECTED' && (
            <div className="text-center space-y-8">
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full bg-red-100 dark:bg-red-900/30" />
                <div className="absolute inset-3 rounded-full bg-red-200 dark:bg-red-800/40" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <XCircle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-3">
                <h1 className="font-display text-3xl font-bold text-foreground">
                  Application Not Approved
                </h1>
                <p className="text-muted-foreground">
                  Unfortunately your application was not approved at this time.
                </p>
              </div>

              {request?.rejectionReason && (
                <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm text-left">
                  <p className="font-medium text-red-800 dark:text-red-300 mb-1">Reason:</p>
                  <p className="text-red-700 dark:text-red-400">{request.rejectionReason}</p>
                </div>
              )}

              <div className="bg-card border border-border rounded-xl p-4 text-sm text-left space-y-2">
                <p className="font-medium text-foreground">You may:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Address the feedback above and reapply</li>
                  <li>Contact us for clarification</li>
                  <li>Continue as a learner in the meantime</li>
                </ul>
              </div>

              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-left space-y-2">
                <p className="font-medium text-foreground">Contact us:</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  <a href="mailto:info@esrccameroon.org" className="hover:text-primary transition-colors">info@esrccameroon.org</a>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+237 677 948 904 / 677 775 535</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={() => router.push('/dashboard')} variant="outline" className="gap-2">
                  <BookOpen className="w-4 h-4" />
                  Continue as Learner
                </Button>
                <Button variant="ghost" onClick={logout} className="text-muted-foreground">
                  Sign Out
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  )
}
