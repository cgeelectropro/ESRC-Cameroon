'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar as CalendarIcon, User, CheckSquare, Plus, Video, X, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { apiClient } from '@/lib/api-client'

interface SessionDisplay {
  id: string
  mentor: string
  mentorAvatar?: string
  date: string
  status: 'Scheduled' | 'Completed' | 'Cancelled'
  meetingUrl?: string
  notes?: string
  type?: string
}

interface ActionItemDisplay {
  id: string
  text: string
  sessionId: string
  done: boolean
}

export default function AdvisoryDashboardPage() {
  const [sessions, setSessions] = useState<SessionDisplay[]>([])
  const [actionItems, setActionItems] = useState<ActionItemDisplay[]>([])
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([apiClient.getAdvisorySessions(), apiClient.getMentors()]).then(([sessRes, mentRes]) => {
      if (sessRes.success && sessRes.data && Array.isArray(sessRes.data)) {
        const raw = sessRes.data as { id: string; advisor?: { firstName?: string; lastName?: string }; scheduledAt: string; status: string }[]
        setSessions(raw.map((s) => ({
          id: s.id,
          mentor: s.advisor ? `${s.advisor.firstName || ''} ${s.advisor.lastName || ''}`.trim() : 'Advisor',
          mentorAvatar: (s as { advisor?: { avatar?: string } }).advisor?.avatar,
          date: s.scheduledAt,
          status: (s.status === 'SCHEDULED' ? 'Scheduled' : s.status === 'COMPLETED' ? 'Completed' : 'Cancelled') as SessionDisplay['status'],
          meetingUrl: (s as { meetingUrl?: string }).meetingUrl,
          notes: (s as { notes?: string }).notes,
          type: (s as { type?: string }).type,
        })))
        const items: ActionItemDisplay[] = []
        raw.forEach((s) => {
          const actionItemsList = (s as { actionItems?: string[] }).actionItems || []
          actionItemsList.forEach((text, i) => items.push({ id: `${s.id}-${i}`, text, sessionId: s.id, done: false }))
        })
        setActionItems(items)
      }
      if (mentRes.success && mentRes.data && Array.isArray(mentRes.data)) {
        setMentors((mentRes.data as { id: string; name: string }[]).map((m) => ({ id: m.id, name: m.name })))
      }
      setLoading(false)
    })
  }, [])
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState('')
  const [selectedMentor, setSelectedMentor] = useState('')
  const [newActionText, setNewActionText] = useState('')

  const timeSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']

  const handleBook = async () => {
    if (!selectedDate || !selectedTime || !selectedMentor) return
    const mentor = mentors.find((m) => m.id === selectedMentor || m.name === selectedMentor)
    const res = await apiClient.bookAdvisory({
      advisorId: mentor?.id || selectedMentor,
      type: 'ONE_ON_ONE',
      scheduledAt: new Date(`${format(selectedDate, 'yyyy-MM-dd')}T${selectedTime}:00`).toISOString(),
      duration: 60,
    })
    if (res.success) {
      setSessions((prev) => [
        ...prev,
        {
          id: `session-${Date.now()}`,
          mentor: mentor?.name || selectedMentor,
          date: format(selectedDate, 'yyyy-MM-dd'),
          status: 'Scheduled' as const,
        },
      ])
      setBookingOpen(false)
      setSelectedDate(undefined)
      setSelectedTime('')
      setSelectedMentor('')
    }
  }

  const handleCancel = async (sessionId: string) => {
    const res = await apiClient.cancelAdvisorySession(sessionId)
    if (res.success) {
      setSessions((prev) => prev.map((s) => s.id === sessionId ? { ...s, status: 'Cancelled' as const } : s))
      toast.success('Session cancelled')
    } else {
      toast.error('Could not cancel session')
    }
  }

  const toggleAction = (id: string) => {
    setActionItems((prev) =>
      prev.map((a) => (a.id === id ? { ...a, done: !a.done } : a))
    )
  }

  const addAction = () => {
    if (!newActionText.trim()) return
    setActionItems((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, text: newActionText, sessionId: '1', done: false },
    ])
    setNewActionText('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar />
        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">My Advisory Sessions</h1>
              <p className="text-muted-foreground">Manage your mentoring and advisory sessions</p>
            </div>

            {/* Calendar Scheduling */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarIcon size={20} /> Session History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {loading && <p className="text-sm text-muted-foreground">Loading sessions…</p>}
                  {!loading && sessions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No sessions yet. Book your first session below.</p>
                  )}
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-lg border space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          {session.mentorAvatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={session.mentorAvatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-esrc-green-100 flex items-center justify-center">
                              <User className="text-esrc-green-700" size={20} />
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-foreground">{session.mentor}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <CalendarIcon size={12} /> {new Date(session.date).toLocaleString()}
                              {session.type && <span className="ml-2 capitalize">· {session.type.replace('_', ' ').toLowerCase()}</span>}
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
                      {session.status === 'Scheduled' && (
                        <div className="flex items-center gap-2">
                          {session.meetingUrl && (
                            <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer">
                              <Button size="sm" className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-1.5">
                                <Video size={14} /> Join Meeting
                              </Button>
                            </a>
                          )}
                          <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-1.5"
                            onClick={() => handleCancel(session.id)}>
                            <X size={14} /> Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquare size={20} /> Action Items
                  </CardTitle>
                  <p className="text-sm text-gray-500">Track tasks from your advisory sessions</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add action item..."
                      value={newActionText}
                      onChange={(e) => setNewActionText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && addAction()}
                    />
                    <Button size="icon" variant="outline" onClick={addAction}>
                      <Plus size={18} />
                    </Button>
                  </div>
                  <ul className="space-y-2">
                    {actionItems.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded hover:bg-esrc-green-50/50"
                      >
                        <Checkbox
                          checked={item.done}
                          onCheckedChange={() => toggleAction(item.id)}
                          aria-label={`Mark "${item.text}" as done`}
                        />
                        <span
                          className={
                            item.done ? 'text-muted-foreground line-through' : 'text-foreground'
                          }
                        >
                          {item.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Book New Session - Calendar UI */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Book New Session</CardTitle>
                <CardDescription>Select a date, time, and mentor for your advisory session</CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white">
                      <CalendarIcon size={18} className="mr-2" />
                      Open Booking Calendar
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Schedule Advisory Session</DialogTitle>
                      <DialogDescription>
                        Pick a date, time slot, and mentor. We&apos;ll send a confirmation.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div>
                        <Label>Select Date</Label>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          disabled={(date) => date < new Date()}
                        />
                      </div>
                      <div>
                        <Label>Time Slot</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {timeSlots.map((t) => (
                            <Button
                              key={t}
                              type="button"
                              variant={selectedTime === t ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setSelectedTime(t)}
                            >
                              {t}
                            </Button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label>Mentor</Label>
                        <select
                          value={selectedMentor}
                          onChange={(e) => setSelectedMentor(e.target.value)}
                          className="w-full p-2 border rounded mt-2"
                        >
                          <option value="">Choose mentor</option>
                          {mentors.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Button
                      className="w-full bg-esrc-gold-500 hover:bg-esrc-gold-600 text-foreground"
                      onClick={handleBook}
                      disabled={!selectedDate || !selectedTime || !selectedMentor}
                    >
                      Confirm Booking
                    </Button>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
