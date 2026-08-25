'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Search, Check, Trash2, PencilLine, Plus, X, Square, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface PubRow { id: string; title: string; type: string; authors: string[]; isApproved: boolean; downloadCount: number; createdAt: string; abstract?: string; fileUrl?: string; tags?: string[]; doi?: string; publishedAt?: string }
type PageData = { items: PubRow[]; total: number; pages: number }

const PUB_TYPES = ['REPORT', 'POLICY_BRIEF', 'WORKING_PAPER', 'JOURNAL_ARTICLE', 'DATASET']

const DEFAULT_FORM = { title: '', abstract: '', type: 'REPORT', authors: '', fileUrl: '', doi: '', tags: '', publishedAt: '' }

export default function AdminPublicationsPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [modal, setModal] = useState<{ open: boolean; editing: PubRow | null }>({ open: false, editing: null })
  const [form, setForm] = useState(DEFAULT_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const pubItems = data?.items ?? []
  const allSelected = pubItems.length > 0 && pubItems.every(p => selected.has(p.id))
  const someSelected = pubItems.some(p => selected.has(p.id))
  const toggleAll = () => { if (allSelected) { const n = new Set(selected); pubItems.forEach(p => n.delete(p.id)); setSelected(n) } else { const n = new Set(selected); pubItems.forEach(p => n.add(p.id)); setSelected(n) } }
  const toggleOne = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} publication(s)?`)) return
    setBulkDeleting(true)
    for (const id of selected) await apiClient.deleteAdminPublication(id)
    setBulkDeleting(false); toast.success(`${selected.size} deleted`); setSelected(new Set()); load()
  }

  const load = () => {
    setSelected(new Set())
    setLoading(true)
    const params: Record<string, string> = { page: String(page), limit: '20' }
    if (search) params.search = search
    if (filter === 'pending') params.isApproved = 'false'
    if (filter === 'approved') params.isApproved = 'true'
    apiClient.getAdminPublications(params).then(r => { if (r.success) setData(r.data as unknown as PageData) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page, filter])
  useEffect(() => { const t = setTimeout(() => { setPage(1); load() }, 400); return () => clearTimeout(t) }, [search])

  const openAdd = () => {
    setForm(DEFAULT_FORM)
    setModal({ open: true, editing: null })
  }
  const openEdit = (p: PubRow) => {
    setForm({
      title: p.title || '',
      abstract: p.abstract || '',
      type: p.type || 'REPORT',
      authors: (p.authors || []).join(', '),
      fileUrl: p.fileUrl || '',
      doi: p.doi || '',
      tags: (p.tags || []).join(', '),
      publishedAt: p.publishedAt ? p.publishedAt.slice(0, 10) : '',
    })
    setModal({ open: true, editing: p })
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.abstract.trim() || !form.fileUrl.trim()) {
      toast.error('Title, abstract, and file URL are required')
      return
    }
    setSubmitting(true)
    const payload: Record<string, unknown> = {
      title: form.title,
      abstract: form.abstract,
      type: form.type,
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      fileUrl: form.fileUrl,
      doi: form.doi || undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      publishedAt: form.publishedAt || undefined,
    }
    let r
    if (modal.editing) {
      r = await apiClient.updateAdminPublication(modal.editing.id, payload)
    } else {
      r = await apiClient.createAdminPublication(payload)
    }
    setSubmitting(false)
    if (r.success) {
      toast.success(modal.editing ? 'Publication updated' : 'Publication created')
      setModal({ open: false, editing: null })
      load()
    } else {
      toast.error((r as any).error || 'Failed')
    }
  }

  const approve = async (id: string) => {
    const r = await apiClient.updateAdminPublication(id, { isApproved: true })
    if (r.success) { toast.success('Publication approved'); load() } else toast.error('Failed')
  }
  const del = async (p: PubRow) => {
    if (!confirm(`Delete "${p.title}"?`)) return
    const r = await apiClient.deleteAdminPublication(p.id)
    if (r.success) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  const typeColor: Record<string, string> = { REPORT: 'bg-orange-100 text-orange-700', POLICY_BRIEF: 'bg-blue-100 text-blue-700', WORKING_PAPER: 'bg-green-100 text-green-700', JOURNAL_ARTICLE: 'bg-purple-100 text-purple-700', DATASET: 'bg-pink-100 text-pink-700' }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Publications</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} total</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <Button onClick={handleBulkDelete} disabled={bulkDeleting} className="bg-destructive text-destructive-foreground hover:opacity-90 flex items-center gap-2"><Trash2 className="w-4 h-4"/>{bulkDeleting?'Deleting…':`Delete ${selected.size}`}</Button>}
          <Button onClick={openAdd} className="bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2"><Plus className="w-4 h-4" /> Add New Publication</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search publications..." className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground" />
        </div>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1) }} className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground">
          <option value="all">All</option><option value="pending">Pending</option><option value="approved">Approved</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 w-10"><button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">{allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}</button></th>
                {['Title', 'Type', 'Authors', 'Downloads', 'Status', 'Actions'].map(h => (
                  <th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h === 'Actions' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? [...Array(5)].map((_, i) => (
                <tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-4 bg-muted animate-pulse rounded" /></td></tr>
              )) : pubItems.map(p => (
                <tr key={p.id} className={`hover:bg-accent/30 transition-colors ${selected.has(p.id)?'bg-primary/5':''}`}>
                  <td className="py-3 px-4"><button onClick={()=>toggleOne(p.id)} className="text-muted-foreground hover:text-foreground">{selected.has(p.id)?<CheckSquare className="w-4 h-4 text-primary"/>:<Square className="w-4 h-4"/>}</button></td>
                  <td className="py-3 px-4 font-medium max-w-xs"><div className="line-clamp-2 text-foreground">{p.title}</div></td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[p.type] || 'bg-muted text-muted-foreground'}`}>{p.type.replace(/_/g, ' ')}</span></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{(p.authors ?? []).slice(0, 2).join(', ')}{(p.authors ?? []).length > 2 ? ' ...' : ''}</td>
                  <td className="py-3 px-4 text-muted-foreground">{p.downloadCount}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                        <PencilLine className="w-4 h-4" />
                      </button>
                      {!p.isApproved && (
                        <button onClick={() => approve(p.id)} className="p-1.5 rounded-lg hover:bg-accent text-green-500 transition-colors" title="Approve">
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => del(p)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !data?.items?.length && <p className="text-center text-muted-foreground py-10">No publications found.</p>}
      </div>

      {(data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 text-sm bg-card border border-border rounded-lg disabled:opacity-50 text-foreground">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {data?.pages}</span>
          <button onClick={() => setPage(p => Math.min(data?.pages ?? 1, p + 1))} disabled={page === data?.pages} className="px-4 py-2 text-sm bg-card border border-border rounded-lg disabled:opacity-50 text-foreground">Next</button>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modal.open} onOpenChange={open => !open && setModal({ open: false, editing: null })}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{modal.editing ? 'Edit Publication' : 'Add New Publication'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Publication title" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Abstract *</Label>
              <Textarea value={form.abstract} onChange={e => setForm(f => ({ ...f, abstract: e.target.value }))} placeholder="Brief abstract or description..." rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Type *</Label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                  {PUB_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Published Date</Label>
                <Input type="date" value={form.publishedAt} onChange={e => setForm(f => ({ ...f, publishedAt: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Authors (comma-separated) *</Label>
              <Input value={form.authors} onChange={e => setForm(f => ({ ...f, authors: e.target.value }))} placeholder="John Doe, Jane Smith" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">File URL *</Label>
              <Input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))} placeholder="https://..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">DOI (optional)</Label>
                <Input value={form.doi} onChange={e => setForm(f => ({ ...f, doi: e.target.value }))} placeholder="10.xxxx/..." />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</Label>
                <Input value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} placeholder="policy, africa, education" />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={() => setModal({ open: false, editing: null })}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting} className="bg-primary text-primary-foreground">
              {submitting ? 'Saving...' : modal.editing ? 'Save Changes' : 'Create Publication'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
