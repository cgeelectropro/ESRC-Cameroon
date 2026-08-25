'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  Linkedin,
  Globe,
  User,
  Building,
  BookOpen,
  ChevronDown,
  Loader2,
  Search,
  RefreshCw,
} from 'lucide-react'

type Status = 'PENDING' | 'APPROVED' | 'REJECTED'

interface ApplicantUser {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  country: string
  city?: string
  createdAt: string
}

interface InstructorRequest {
  id: string
  status: Status
  title: string
  organization?: string
  expertise: string[]
  bio?: string
  phone?: string
  linkedinUrl?: string
  portfolioUrl?: string
  motivation?: string
  rejectionReason?: string
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
  user: ApplicantUser
}

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  icon: Clock,         color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  APPROVED: { label: 'Approved', icon: CheckCircle2,  color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  REJECTED: { label: 'Rejected', icon: XCircle,       color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
}

export default function AdminInstructorRequestsPage() {
  const [requests, setRequests] = useState<InstructorRequest[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Status | 'ALL'>('PENDING')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<InstructorRequest | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const fetchRequests = useCallback(async () => {
    try {
      const res = await apiClient.getAdminInstructorRequests(filter === 'ALL' ? undefined : filter)
      if (res.success && res.data) {
        setRequests((res.data.requests ?? []) as unknown as InstructorRequest[])
        setTotal(res.data.total as number)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [filter])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  const handleRefresh = () => { setRefreshing(true); fetchRequests() }

  const openDetail = (req: InstructorRequest) => {
    setSelected(req)
    setDetailOpen(true)
  }

  const openReview = (req: InstructorRequest, action: 'APPROVE' | 'REJECT') => {
    setSelected(req)
    setReviewAction(action)
    setAdminNotes('')
    setRejectionReason('')
    setDetailOpen(false)
    setReviewOpen(true)
  }

  const submitReview = async () => {
    if (!selected || !reviewAction) return
    setSubmitting(true)
    try {
      const res = await apiClient.reviewInstructorRequest(selected.id, {
        action: reviewAction,
        adminNotes: adminNotes || undefined,
        rejectionReason: reviewAction === 'REJECT' ? rejectionReason : undefined,
      })
      if (res.success) {
        setReviewOpen(false)
        fetchRequests()
      }
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  const filtered = requests.filter((r) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      r.user.firstName.toLowerCase().includes(q) ||
      r.user.lastName.toLowerCase().includes(q) ||
      r.user.email.toLowerCase().includes(q) ||
      r.title.toLowerCase().includes(q) ||
      r.organization?.toLowerCase().includes(q)
    )
  })

  const pendingCount = requests.filter((r) => r.status === 'PENDING').length

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Instructor Applications</h1>
          <p className="text-muted-foreground mt-1">
            {pendingCount > 0 ? (
              <span className="text-amber-600 font-medium">{pendingCount} pending review{pendingCount !== 1 ? 's' : ''}</span>
            ) : (
              'No pending applications'
            )}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, title..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-lg" />
        </div>
        <div className="flex gap-2">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-accent'}`}>
              {s === 'ALL' ? `All (${total})` : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No applications found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const cfg = STATUS_CONFIG[req.status]
            const StatusIcon = cfg.icon
            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetail(req)}>
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      {req.user.avatar ? (
                        <img src={req.user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="font-display text-primary font-bold text-lg">
                          {req.user.firstName[0]}{req.user.lastName[0]}
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-foreground truncate">
                          {req.user.firstName} {req.user.lastName}
                        </p>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${cfg.color}`}>
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{req.user.email}</p>
                      <p className="text-sm text-foreground mt-1 truncate">
                        <span className="font-medium">{req.title}</span>
                        {req.organization && <span className="text-muted-foreground"> · {req.organization}</span>}
                      </p>
                    </div>

                    {/* Expertise tags */}
                    <div className="hidden md:flex flex-wrap gap-1 max-w-[200px]">
                      {req.expertise.slice(0, 3).map((e) => (
                        <span key={e} className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">{e}</span>
                      ))}
                      {req.expertise.length > 3 && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full">+{req.expertise.length - 3}</span>
                      )}
                    </div>

                    {/* Date + action */}
                    <div className="text-right shrink-0">
                      <p className="text-xs text-muted-foreground mb-2">
                        {new Date(req.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                      {req.status === 'PENDING' && (
                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 h-7 px-3 text-xs" onClick={() => openReview(req, 'REJECT')}>
                            Reject
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 h-7 px-3 text-xs" onClick={() => openReview(req, 'APPROVE')}>
                            Approve
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* ── Detail Dialog ── */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl">
                  {selected.user.firstName} {selected.user.lastName}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-2">
                {/* Status badge */}
                <div className="flex items-center gap-2">
                  {(() => { const cfg = STATUS_CONFIG[selected.status]; const Icon = cfg.icon; return (
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${cfg.color}`}>
                      <Icon className="w-4 h-4" />
                      {cfg.label}
                    </span>
                  )})()}
                  <span className="text-sm text-muted-foreground">
                    Applied {new Date(selected.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Contact info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-xl">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-primary shrink-0" />
                    <a href={`mailto:${selected.user.email}`} className="text-primary hover:underline truncate">{selected.user.email}</a>
                  </div>
                  {selected.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-primary shrink-0" />
                      <a href={`tel:${selected.phone}`} className="hover:underline">{selected.phone}</a>
                    </div>
                  )}
                  {selected.linkedinUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Linkedin className="w-4 h-4 text-primary shrink-0" />
                      <a href={selected.linkedinUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">LinkedIn</a>
                    </div>
                  )}
                  {selected.portfolioUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="w-4 h-4 text-primary shrink-0" />
                      <a href={selected.portfolioUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">Portfolio</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">{selected.user.country}{selected.user.city ? `, ${selected.user.city}` : ''}</span>
                  </div>
                </div>

                {/* Professional info */}
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Professional Title</p>
                    <p className="font-semibold text-foreground">{selected.title}</p>
                  </div>
                  {selected.organization && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Organization</p>
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        <p className="text-foreground">{selected.organization}</p>
                      </div>
                    </div>
                  )}
                  {selected.expertise.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Areas of Expertise</p>
                      <div className="flex flex-wrap gap-1.5">
                        {selected.expertise.map((e) => (
                          <span key={e} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium">{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selected.motivation && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Motivation / Teaching Goals</p>
                      <p className="text-foreground text-sm leading-relaxed bg-muted/50 rounded-lg p-3">{selected.motivation}</p>
                    </div>
                  )}
                  {selected.bio && (
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Bio</p>
                      <p className="text-foreground text-sm leading-relaxed">{selected.bio}</p>
                    </div>
                  )}
                </div>

                {/* Rejection reason if rejected */}
                {selected.status === 'REJECTED' && selected.rejectionReason && (
                  <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-red-700 dark:text-red-400 uppercase mb-1">Rejection Reason</p>
                    <p className="text-sm text-red-800 dark:text-red-300">{selected.rejectionReason}</p>
                  </div>
                )}
                {selected.adminNotes && (
                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase mb-1">Admin Notes</p>
                    <p className="text-sm text-blue-800 dark:text-blue-300">{selected.adminNotes}</p>
                  </div>
                )}
              </div>

              {selected.status === 'PENDING' && (
                <DialogFooter className="mt-6 gap-2">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openReview(selected, 'REJECT')}>
                    <XCircle className="w-4 h-4 mr-2" /> Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={() => openReview(selected, 'APPROVE')}>
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Review Dialog ── */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className={`font-display text-xl ${reviewAction === 'APPROVE' ? 'text-green-700' : 'text-red-700'}`}>
              {reviewAction === 'APPROVE' ? '✅ Approve Instructor' : '❌ Reject Application'}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-5 mt-2">
              <p className="text-sm text-muted-foreground">
                You are about to <strong>{reviewAction === 'APPROVE' ? 'approve' : 'reject'}</strong> the application from{' '}
                <strong>{selected.user.firstName} {selected.user.lastName}</strong>.
                They will receive a notification immediately.
              </p>

              <div className="space-y-2">
                <Label htmlFor="adminNotes">
                  {reviewAction === 'APPROVE' ? 'Welcome message / notes for instructor (optional)' : 'Internal admin notes (optional)'}
                </Label>
                <Textarea id="adminNotes" placeholder={reviewAction === 'APPROVE' ? 'e.g. Welcome aboard! Looking forward to your courses on entrepreneurship.' : 'Internal notes only, not shown to applicant'} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="rounded-lg" />
              </div>

              {reviewAction === 'REJECT' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason">
                    Reason for rejection <span className="text-red-500">*</span>
                    <span className="text-xs text-muted-foreground ml-1">(sent to applicant)</span>
                  </Label>
                  <Textarea id="rejectionReason" placeholder="e.g. Insufficient professional experience. We recommend gaining at least 3 years of teaching experience before reapplying." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} rows={4} className="rounded-lg" required />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setReviewOpen(false)} disabled={submitting}>Cancel</Button>
            <Button
              disabled={submitting || (reviewAction === 'REJECT' && !rejectionReason.trim())}
              className={reviewAction === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              onClick={submitReview}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {submitting ? 'Submitting...' : reviewAction === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
