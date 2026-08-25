'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Plus, Pencil, Trash2, X, Check, Square, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

interface EventRow { id: string; title: string; type: string; location?: string; isOnline: boolean; isFree: boolean; price: number; startDate: string; _count?: { registrations: number } }
type PageData = { items: EventRow[]; total: number; pages: number }

const EVENT_TYPES = ['CONFERENCE','WORKSHOP','WEBINAR','TRAINING','NETWORKING']
const emptyForm = { title: '', description: '', type: 'CONFERENCE', location: '', isOnline: false, isFree: true, price: 0, currency: 'XAF', capacity: '', startDate: '', endDate: '', registrationDeadline: '' }

export default function AdminEventsPage() {
  const [data, setData] = useState<PageData|null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const items = data?.items ?? []
  const allSelected = items.length > 0 && items.every(e => selected.has(e.id))
  const someSelected = items.some(e => selected.has(e.id))
  const toggleAll = () => { if (allSelected) { const n = new Set(selected); items.forEach(e => n.delete(e.id)); setSelected(n) } else { const n = new Set(selected); items.forEach(e => n.add(e.id)); setSelected(n) } }
  const toggleOne = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} event(s)?`)) return
    setBulkDeleting(true)
    for (const id of selected) await apiClient.deleteAdminEvent(id)
    setBulkDeleting(false); toast.success(`${selected.size} event(s) deleted`); setSelected(new Set()); load()
  }

  const load = () => {
    setSelected(new Set())
    setLoading(true)
    apiClient.getAdminEvents({ page: String(page), limit: '20' }).then(r => { if (r.success) setData(r.data as unknown as PageData) }).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [page])

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (e: EventRow) => {
    setForm({ title: e.title, description: '', type: e.type, location: e.location||'', isOnline: e.isOnline, isFree: e.isFree, price: e.price, currency: 'XAF', capacity: '', startDate: e.startDate?.slice(0,10)||'', endDate: '', registrationDeadline: '' })
    setEditId(e.id); setShowForm(true)
  }

  const handleSave = async () => {
    setSaving(true)
    const payload: Record<string,unknown> = { ...form, price: Number(form.price), capacity: form.capacity ? Number(form.capacity) : undefined }
    const r = editId ? await apiClient.updateAdminEvent(editId, payload) : await apiClient.createAdminEvent(payload)
    if (r.success) { toast.success(editId ? 'Event updated' : 'Event created'); setShowForm(false); load() }
    else toast.error('Failed to save event')
    setSaving(false)
  }

  const handleDelete = async (e: EventRow) => {
    if (!confirm(`Delete "${e.title}"?`)) return
    const r = await apiClient.deleteAdminEvent(e.id)
    if (r.success) { toast.success('Event deleted'); load() }
    else toast.error('Failed')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">{data?.total??0} total events</p>
        </div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50">
              <Trash2 className="w-4 h-4"/>{bulkDeleting ? 'Deleting…' : `Delete ${selected.size}`}
            </button>
          )}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            <Plus className="w-4 h-4"/>New Event
          </button>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 w-10"><button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">{allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}</button></th>
                {['Title','Type','Location','Registrations','Date','Actions'].map(h=><th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-4 bg-muted animate-pulse rounded"/></td></tr>)
              : items.map(e=>(
                <tr key={e.id} className={`hover:bg-accent/30 transition-colors ${selected.has(e.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-3 px-4"><button onClick={()=>toggleOne(e.id)} className="text-muted-foreground hover:text-foreground">{selected.has(e.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}</button></td>
                  <td className="py-3 px-4 font-medium">{e.title}</td>
                  <td className="py-3 px-4"><span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">{e.type}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{e.isOnline ? 'Online' : e.location||'—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{e._count?.registrations ?? 0}</td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(e.startDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>openEdit(e)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4"/></button>
                      <button onClick={()=>handleDelete(e)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !data?.items?.length && <p className="text-center text-muted-foreground py-10">No events found.</p>}
      </div>

      {(data?.pages??0) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-4 py-2 text-sm bg-card border border-border rounded-lg disabled:opacity-50">Previous</button>
          <span className="text-sm text-muted-foreground">Page {page} of {data?.pages}</span>
          <button onClick={()=>setPage(p=>Math.min(data?.pages??1,p+1))} disabled={page===data?.pages} className="px-4 py-2 text-sm bg-card border border-border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto py-8">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-lg mx-4 my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-lg">{editId ? 'Edit Event' : 'New Event'}</h3>
              <button onClick={()=>setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              {[{k:'title',l:'Title',t:'text'},{k:'description',l:'Description',t:'textarea'},{k:'location',l:'Location',t:'text'},{k:'startDate',l:'Start Date',t:'date'},{k:'endDate',l:'End Date',t:'date'},{k:'registrationDeadline',l:'Registration Deadline',t:'date'},{k:'capacity',l:'Capacity',t:'number'},{k:'price',l:'Price (XAF)',t:'number'}].map(({k,l,t})=>(
                <div key={k}>
                  <label className="block text-sm font-medium mb-1">{l}</label>
                  {t==='textarea' ? <textarea value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={3} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/> : <input type={t} value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"/>}
                </div>
              ))}
              <div><label className="block text-sm font-medium mb-1">Type</label>
                <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {EVENT_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isOnline} onChange={e=>setForm(f=>({...f,isOnline:e.target.checked}))} className="rounded"/>Online Event</label>
                <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isFree} onChange={e=>setForm(f=>({...f,isFree:e.target.checked}))} className="rounded"/>Free Event</label>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.title||!form.startDate} className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"><Check className="w-4 h-4"/>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
