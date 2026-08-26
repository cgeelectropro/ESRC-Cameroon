'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar as CalendarIcon, User, Video, FileText, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface SessionDisplay {
  id: string
  learner: string
  learnerAvatar?: string
  learnerEmail?: string
  date: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  meetingUrl?: string
  notes?: string
  type?: string
}

export default function InstructorSessionsPage() {
  const [sessions, setSessions] = useState<SessionDisplay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getMyAdvisorySessions().then((res) => {
      setLoading(false)
      if (res.success && res.data && Array.isArray(res.data)) {
        const raw = res.data as {
          id: string
          user?: { firstName?: string; lastName?: string; avatar?: string; email?: string }
          scheduledAt: string
          status: string
          meetingUrl?: string
          notes?: string
          type?: string
        }[]
        setSessions(raw.map((s) => ({
          id: s.id,
          learner: s.user ? `${s.user.firstName || ''} ${s.user.lastName || ''}`.trim() : 'Learner',
          learnerAvatar: s.user?.avatar,
          learnerEmail: s.user?.email,
          date: s.scheduledAt,
          status: (s.status === 'SCHEDULED' ? 'Scheduled' : s.status === 'COMPLETED' ? 'Completed' : 'Cancelled') as SessionDisplay['status'],
          meetingUrl: s.meetingUrl,
          notes: s.notes,
          type: s.type,
        })))
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <InstructorSidebar />
        <main className="flex-1 section-padding">
          <div className="container-width">
            <div className="mb-8">
              <h1 className="font-display text-4xl text-foreground mb-2">My Sessions</h1>
              <p className="text-muted-foreground">Advisory sessions learners have booked with you</p>
            </div>

            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon size={20} /> Session Requests
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loading && (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-esrc-green-600" />
                  </div>
                )}
                {!loading && sessions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No sessions booked with you yet.
                  </p>
                )}
                {sessions.map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {session.learnerAvatar ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={session.learnerAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-esrc-green-100 flex items-center justify-center">
                            <User className="text-esrc-green-700" size={20} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground">{session.learner}</h3>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <CalendarIcon size={12} /> {new Date(session.date).toLocaleString()}
                            {session.type && <span className="ml-2 capitalize">· {session.type.replace(/_/g, ' ').toLowerCase()}</span>}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        session.status === 'Scheduled' ? 'bg-esrc-green-50 text-esrc-green-700' :
                        session.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                        'bg-muted text-muted-foreground line-through'
                      }`}>{session.status}</span>
                    </div>
                    {session.notes && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 rounded p-2">
                        <FileText size={14} className="mt-0.5 shrink-0" />
                        <p>{session.notes}</p>
                      </div>
                    )}
                    {session.status === 'Scheduled' && session.meetingUrl && (
                      <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-1.5">
                          <Video size={14} /> Join Meeting
                        </Button>
                      </a>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
