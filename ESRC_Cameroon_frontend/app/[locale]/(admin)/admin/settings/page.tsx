'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Save, Settings, Mail, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type PlatformInfoRow = { id: string; key: string; value: string }

function isLongValue(value: string) {
  return value.length > 80 || value.includes('\n')
}

export default function AdminSettingsPage() {
  const [rows, setRows] = useState<PlatformInfoRow[]>([])
  const [loading, setLoading] = useState(false)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const [savedKey, setSavedKey] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newValue, setNewValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const [emailConfigured, setEmailConfigured] = useState<boolean | null>(null)
  const [testEmailTo, setTestEmailTo] = useState('goodnessemma05@gmail.com')
  const [sendingTest, setSendingTest] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const res = await apiClient.getAdminPlatformInfo()
    if (res.success && res.data) setRows(res.data as PlatformInfoRow[])
    setLoading(false)
  }

  useEffect(() => {
    load()
    apiClient.getEmailStatus().then((res) => {
      if (res.success && res.data) setEmailConfigured(res.data.configured)
    })
  }, [])

  const updateValue = (key: string, value: string) => {
    setRows((prev) => prev.map((r) => r.key === key ? { ...r, value } : r))
  }

  const save = async (key: string, value: string) => {
    setSavingKey(key)
    await apiClient.upsertAdminPlatformInfo(key, value)
    setSavingKey(null)
    setSavedKey(key)
    setTimeout(() => setSavedKey(null), 1500)
  }

  const sendTest = async () => {
    setSendingTest(true)
    setTestResult(null)
    const res = await apiClient.sendTestEmail(testEmailTo || undefined)
    if (res.success && res.data) setTestResult(res.data)
    else setTestResult({ success: false, message: res.error ?? 'Unknown error' })
    setSendingTest(false)
  }

  const addNew = async () => {
    if (!newKey.trim()) return
    setAdding(true)
    await apiClient.upsertAdminPlatformInfo(newKey.trim(), newValue)
    await load()
    setNewKey('')
    setNewValue('')
    setShowAdd(false)
    setAdding(false)
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />Site Settings
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Platform info key-value pairs displayed across the website</p>
        </div>
        <Button variant="outline" onClick={() => setShowAdd(!showAdd)} className="gap-2">
          <Plus className="w-4 h-4" />Add New
        </Button>
      </div>

      {/* Add new row */}
      {showAdd && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-3">
          <p className="text-sm font-semibold text-foreground">New Platform Info Entry</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Key</Label>
              <Input
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. founded_year"
                className="font-mono text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Value</Label>
              <Input
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="e.g. 2020"
                className="text-sm"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={addNew} disabled={adding || !newKey.trim()}>
              {adding ? 'Adding…' : 'Add Entry'}
            </Button>
            <Button size="sm" variant="outline" onClick={() => { setShowAdd(false); setNewKey(''); setNewValue('') }}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Email SMTP status + test */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            <p className="font-semibold text-foreground">Email / SMTP</p>
          </div>
          {emailConfigured === null ? (
            <span className="text-xs text-muted-foreground">Checking…</span>
          ) : emailConfigured ? (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle className="w-3.5 h-3.5" />Configured
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-destructive font-medium">
              <XCircle className="w-3.5 h-3.5" />Not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS
            </span>
          )}
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Send test to</Label>
            <Input
              value={testEmailTo}
              onChange={(e) => setTestEmailTo(e.target.value)}
              placeholder="email@example.com"
              className="text-sm"
            />
          </div>
          <Button size="sm" onClick={sendTest} disabled={sendingTest || !emailConfigured} className="gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {sendingTest ? 'Sending…' : 'Send Test'}
          </Button>
        </div>
        {testResult && (
          <div className={cn('rounded-lg px-3 py-2 text-sm', testResult.success ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200')}>
            {testResult.success ? '✓ ' : '✗ '}{testResult.message}
          </div>
        )}
      </div>

      {/* Existing entries */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">No platform info configured yet</div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div key={row.key} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-48">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Key</Label>
                  <p className="font-mono text-sm font-medium text-foreground mt-0.5 break-all">{row.key}</p>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wide">Value</Label>
                  {isLongValue(row.value) ? (
                    <Textarea
                      value={row.value}
                      onChange={(e) => updateValue(row.key, e.target.value)}
                      rows={3}
                      className="text-sm resize-none"
                    />
                  ) : (
                    <Input
                      value={row.value}
                      onChange={(e) => updateValue(row.key, e.target.value)}
                      className="text-sm"
                    />
                  )}
                </div>
                <div className="flex-shrink-0 pt-5">
                  <Button
                    size="sm"
                    variant={savedKey === row.key ? 'default' : 'outline'}
                    className={cn('h-8 gap-1.5 transition-all', savedKey === row.key && 'bg-green-600 hover:bg-green-600 text-white border-green-600')}
                    onClick={() => save(row.key, row.value)}
                    disabled={savingKey === row.key}
                  >
                    <Save className="w-3.5 h-3.5" />
                    {savingKey === row.key ? 'Saving…' : savedKey === row.key ? 'Saved!' : 'Save'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
