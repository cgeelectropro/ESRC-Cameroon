'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Pencil, Trash2, Star, DollarSign, Clock, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────
type SuccessStory = { id: string; name: string; title: string; story: string; impact?: string; image?: string; quote?: string; year?: number; order: number }
type FundingSource = { id: string; name: string; description?: string; type?: string; url?: string; deadline?: string; amount?: string; eligibility?: string[]; order: number }
type TimelineMilestone = { id: string; year: number; event: string; order: number }
type RegionalImpact = { id: string; regionId?: string; name: string; learners: number; posX?: number; posY?: number; order: number }

type TabKey = 'stories' | 'funding' | 'timeline' | 'regional'

// ─────────────────────────────────────────────────────────────────────────────
// Generic confirm + delete helper
// ─────────────────────────────────────────────────────────────────────────────
function useItems<T extends { id: string }>(
  loadFn: () => Promise<{ success: boolean; data?: unknown }>,
  deleteFn: (id: string) => Promise<unknown>
) {
  const [items, setItems] = useState<T[]>([])
  const [loading, setLoading] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await loadFn()
    if (res.success && res.data) setItems(res.data as T[])
    setLoading(false)
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this item?')) return
    await deleteFn(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  return { items, setItems, loading, load, remove }
}

// ─────────────────────────────────────────────────────────────────────────────
// Modal helper
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminImpactContentPage() {
  const [tab, setTab] = useState<TabKey>('stories')

  const stories = useItems<SuccessStory>(
    apiClient.getAdminSuccessStories,
    apiClient.deleteAdminSuccessStory
  )
  const funding = useItems<FundingSource>(
    apiClient.getAdminFundingSources,
    apiClient.deleteAdminFundingSource
  )
  const timeline = useItems<TimelineMilestone>(
    apiClient.getAdminTimeline,
    apiClient.deleteAdminTimelineMilestone
  )
  const regional = useItems<RegionalImpact>(
    apiClient.getAdminRegionalImpacts,
    apiClient.deleteAdminRegionalImpact
  )

  useEffect(() => {
    if (tab === 'stories') stories.load()
    else if (tab === 'funding') funding.load()
    else if (tab === 'timeline') timeline.load()
    else regional.load()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  // ── Modal state ────────────────────────────────────────────────────────────
  const [modal, setModal] = useState<{ open: boolean; editing: unknown | null }>({ open: false, editing: null })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, unknown>>({})

  const openCreate = () => { setForm({}); setModal({ open: true, editing: null }) }
  const openEdit = (item: unknown) => { setForm(item as Record<string, unknown>); setModal({ open: true, editing: item }) }
  const closeModal = () => setModal({ open: false, editing: null })

  const set = (key: string, value: unknown) => setForm((prev) => ({ ...prev, [key]: value }))

  const save = async () => {
    setSaving(true)
    try {
      const id = (modal.editing as { id?: string })?.id
      if (tab === 'stories') {
        if (id) { await apiClient.updateAdminSuccessStory(id, form); stories.setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...form } as SuccessStory : i)) }
        else { const res = await apiClient.createAdminSuccessStory(form); if (res.success) stories.load() }
      } else if (tab === 'funding') {
        const data = { ...form, eligibility: typeof form.eligibility === 'string' ? (form.eligibility as string).split(',').map((s) => s.trim()).filter(Boolean) : form.eligibility }
        if (id) { await apiClient.updateAdminFundingSource(id, data); funding.setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...data } as FundingSource : i)) }
        else { const res = await apiClient.createAdminFundingSource(data); if (res.success) funding.load() }
      } else if (tab === 'timeline') {
        const data = { ...form, year: Number(form.year), order: Number(form.order || 0) }
        if (id) { await apiClient.updateAdminTimelineMilestone(id, data); timeline.setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...data } as TimelineMilestone : i)) }
        else { const res = await apiClient.createAdminTimelineMilestone(data); if (res.success) timeline.load() }
      } else {
        const data = { ...form, learners: Number(form.learners), posX: form.posX !== undefined ? Number(form.posX) : undefined, posY: form.posY !== undefined ? Number(form.posY) : undefined, order: Number(form.order || 0) }
        if (id) { await apiClient.updateAdminRegionalImpact(id, data); regional.setItems((prev) => prev.map((i) => i.id === id ? { ...i, ...data } as RegionalImpact : i)) }
        else { const res = await apiClient.createAdminRegionalImpact(data); if (res.success) regional.load() }
      }
      closeModal()
    } finally {
      setSaving(false)
    }
  }

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'stories', label: 'Success Stories', icon: <Star className="w-4 h-4" /> },
    { key: 'funding', label: 'Funding Sources', icon: <DollarSign className="w-4 h-4" /> },
    { key: 'timeline', label: 'Timeline', icon: <Clock className="w-4 h-4" /> },
    { key: 'regional', label: 'Regional Impact', icon: <Globe className="w-4 h-4" /> },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Impact Content</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage success stories, funding, timeline, and regional data</p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />Add New
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              tab === t.key
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* Success Stories */}
      {tab === 'stories' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Story (preview)</TableHead>
                <TableHead className="text-center">Year</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.loading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                : stories.items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No success stories yet</TableCell></TableRow>
                : stories.items.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.title}</TableCell>
                    <TableCell className="text-sm max-w-xs"><p className="truncate">{s.story}</p></TableCell>
                    <TableCell className="text-center">{s.year || '—'}</TableCell>
                    <TableCell className="text-center">{s.order}</TableCell>
                    <TableCell><ActionBtns onEdit={() => openEdit(s)} onDelete={() => stories.remove(s.id)} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Funding Sources */}
      {tab === 'funding' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {funding.loading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                : funding.items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No funding sources yet</TableCell></TableRow>
                : funding.items.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.name}</TableCell>
                    <TableCell><span className="text-xs px-2 py-0.5 rounded bg-muted text-muted-foreground">{f.type || '—'}</span></TableCell>
                    <TableCell className="text-sm">{f.deadline ? new Date(f.deadline).toLocaleDateString() : '—'}</TableCell>
                    <TableCell className="text-sm">{f.amount || '—'}</TableCell>
                    <TableCell className="text-center">{f.order}</TableCell>
                    <TableCell><ActionBtns onEdit={() => openEdit(f)} onDelete={() => funding.remove(f.id)} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Timeline */}
      {tab === 'timeline' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-center">Year</TableHead>
                <TableHead>Event</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeline.loading ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                : timeline.items.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No timeline events yet</TableCell></TableRow>
                : timeline.items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="text-center font-bold text-primary">{t.year}</TableCell>
                    <TableCell>{t.event}</TableCell>
                    <TableCell className="text-center">{t.order}</TableCell>
                    <TableCell><ActionBtns onEdit={() => openEdit(t)} onDelete={() => timeline.remove(t.id)} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Regional Impact */}
      {tab === 'regional' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Region Name</TableHead>
                <TableHead className="text-center">Learners</TableHead>
                <TableHead className="text-center">Pos X</TableHead>
                <TableHead className="text-center">Pos Y</TableHead>
                <TableHead className="text-center">Order</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {regional.loading ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading…</TableCell></TableRow>
                : regional.items.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No regional data yet</TableCell></TableRow>
                : regional.items.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.name}</TableCell>
                    <TableCell className="text-center">{r.learners.toLocaleString()}</TableCell>
                    <TableCell className="text-center">{r.posX ?? '—'}</TableCell>
                    <TableCell className="text-center">{r.posY ?? '—'}</TableCell>
                    <TableCell className="text-center">{r.order}</TableCell>
                    <TableCell><ActionBtns onEdit={() => openEdit(r)} onDelete={() => regional.remove(r.id)} /></TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal */}
      <Dialog open={modal.open} onOpenChange={(o) => !o && closeModal()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{modal.editing ? 'Edit' : 'Add'} {tabs.find((t) => t.key === tab)?.label.replace(/s$/, '')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto pr-1">
            {tab === 'stories' && (
              <>
                <Field label="Name *"><Input value={(form.name as string) || ''} onChange={(e) => set('name', e.target.value)} /></Field>
                <Field label="Title"><Input value={(form.title as string) || ''} onChange={(e) => set('title', e.target.value)} /></Field>
                <Field label="Story *"><Textarea rows={5} value={(form.story as string) || ''} onChange={(e) => set('story', e.target.value)} /></Field>
                <Field label="Impact"><Textarea rows={3} value={(form.impact as string) || ''} onChange={(e) => set('impact', e.target.value)} /></Field>
                <Field label="Image URL"><Input value={(form.image as string) || ''} onChange={(e) => set('image', e.target.value)} /></Field>
                <Field label="Quote"><Input value={(form.quote as string) || ''} onChange={(e) => set('quote', e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Year"><Input type="number" value={(form.year as number) || ''} onChange={(e) => set('year', e.target.value)} /></Field>
                  <Field label="Order"><Input type="number" value={(form.order as number) ?? 0} onChange={(e) => set('order', e.target.value)} /></Field>
                </div>
              </>
            )}
            {tab === 'funding' && (
              <>
                <Field label="Name *"><Input value={(form.name as string) || ''} onChange={(e) => set('name', e.target.value)} /></Field>
                <Field label="Description"><Textarea rows={3} value={(form.description as string) || ''} onChange={(e) => set('description', e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Type"><Input value={(form.type as string) || ''} onChange={(e) => set('type', e.target.value)} /></Field>
                  <Field label="Amount"><Input value={(form.amount as string) || ''} onChange={(e) => set('amount', e.target.value)} /></Field>
                </div>
                <Field label="URL"><Input value={(form.url as string) || ''} onChange={(e) => set('url', e.target.value)} /></Field>
                <Field label="Deadline"><Input type="date" value={(form.deadline as string) || ''} onChange={(e) => set('deadline', e.target.value)} /></Field>
                <Field label="Eligibility (comma-separated)">
                  <Input
                    value={Array.isArray(form.eligibility) ? (form.eligibility as string[]).join(', ') : (form.eligibility as string) || ''}
                    onChange={(e) => set('eligibility', e.target.value)}
                  />
                </Field>
                <Field label="Order"><Input type="number" value={(form.order as number) ?? 0} onChange={(e) => set('order', e.target.value)} /></Field>
              </>
            )}
            {tab === 'timeline' && (
              <>
                <Field label="Year *"><Input type="number" value={(form.year as number) || ''} onChange={(e) => set('year', e.target.value)} /></Field>
                <Field label="Event *"><Textarea rows={3} value={(form.event as string) || ''} onChange={(e) => set('event', e.target.value)} /></Field>
                <Field label="Order"><Input type="number" value={(form.order as number) ?? 0} onChange={(e) => set('order', e.target.value)} /></Field>
              </>
            )}
            {tab === 'regional' && (
              <>
                <Field label="Region ID"><Input value={(form.regionId as string) || ''} onChange={(e) => set('regionId', e.target.value)} /></Field>
                <Field label="Name *"><Input value={(form.name as string) || ''} onChange={(e) => set('name', e.target.value)} /></Field>
                <Field label="Learners *"><Input type="number" value={(form.learners as number) || ''} onChange={(e) => set('learners', e.target.value)} /></Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Position X (%)"><Input type="number" step="0.1" value={(form.posX as number) ?? ''} onChange={(e) => set('posX', e.target.value)} /></Field>
                  <Field label="Position Y (%)"><Input type="number" step="0.1" value={(form.posY as number) ?? ''} onChange={(e) => set('posY', e.target.value)} /></Field>
                </div>
                <Field label="Order"><Input type="number" value={(form.order as number) ?? 0} onChange={(e) => set('order', e.target.value)} /></Field>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ActionBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onEdit}>
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <Button variant="ghost" size="sm" className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={onDelete}>
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </div>
  )
}
