'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Send, Users, CheckCircle, XCircle, Mail } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_OPTIONS = [
  { value: '', label: 'All active users' },
  { value: 'STUDENT', label: 'Students only' },
  { value: 'INSTRUCTOR', label: 'Instructors only' },
  { value: 'ADMIN', label: 'Admins only' },
]

export default function AdminMessagesPage() {
  const [role, setRole] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [preview, setPreview] = useState<{ count: number; role: string } | null>(null)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; sent?: number; failed?: number; total?: number; error?: string } | null>(null)

  useEffect(() => {
    apiClient.getBroadcastPreview(role || undefined).then((res) => {
      if (res.success && res.data) setPreview(res.data)
      else setPreview(null)
    })
  }, [role])

  const send = async () => {
    if (!subject.trim() || !message.trim()) return
    setSending(true)
    setResult(null)
    const res = await apiClient.sendBroadcastEmail({ subject, message, role: role || undefined })
    if (res.success && res.data) {
      setResult({ success: true, ...res.data })
      if (res.data.sent > 0) { setSubject(''); setMessage('') }
    } else {
      setResult({ success: false, error: res.error ?? 'Failed to send' })
    }
    setSending(false)
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Mail className="w-6 h-6 text-primary" />Send Message to Users
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Send an email broadcast to active platform users</p>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        {/* Audience */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Audience</Label>
          <div className="flex flex-wrap gap-2">
            {ROLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setRole(opt.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm border transition-colors',
                  role === opt.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {preview && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Users className="w-3.5 h-3.5" />
              This will reach <strong className="text-foreground">{preview.count}</strong> active user{preview.count !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="subject" className="text-sm font-medium">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Important update from NextGen Platform"
            className="text-sm"
          />
        </div>

        {/* Message */}
        <div className="space-y-1.5">
          <Label htmlFor="message" className="text-sm font-medium">Message</Label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={8}
            placeholder="Write your message here. Plain text — line breaks are preserved."
            className="text-sm resize-none"
          />
          <p className="text-xs text-muted-foreground">Recipients will be greeted by name. Avoid HTML — plain text only.</p>
        </div>

        <Button
          onClick={send}
          disabled={sending || !subject.trim() || !message.trim() || !preview?.count}
          className="gap-2 bg-primary hover:bg-primary/90"
        >
          <Send className="w-4 h-4" />
          {sending ? `Sending to ${preview?.count ?? '…'} users…` : `Send to ${preview?.count ?? '…'} users`}
        </Button>

        {result && (
          <div className={cn(
            'rounded-lg px-4 py-3 text-sm flex items-start gap-2',
            result.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
          )}>
            {result.success
              ? <CheckCircle className="w-4 h-4 mt-0.5 shrink-0" />
              : <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
            }
            <div>
              {result.success
                ? <>Sent <strong>{result.sent}</strong> emails successfully{result.failed ? `, ${result.failed} failed` : ''}.</>
                : result.error
              }
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
