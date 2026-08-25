'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Plus, Pencil, Trash2, X, Check, Square, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

interface OppRow { id: string; title: string; type: string; organization: string; location?: string; isRemote: boolean; isApproved: boolean; deadline?: string; createdAt: string; _count?: { applications: number } }
type PageData = { items: OppRow[]; total: number; pages: number }

const OPP_TYPES = ['JOB','INTERNSHIP','FELLOWSHIP','GRANT','COMPETITION','VOLUNTEER']
const emptyForm = { title: '', description: '', type: 'JOB', organization: '', location: '', isRemote: false, requirements: '', benefits: '', applicationUrl: '', deadline: '', tags: '' }

export default function AdminOpportunitiesPage() {
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
  const allSelected = items.length > 0 && items.every(o => selected.has(o.id))
  const someSelected = items.some(o => selected.has(o.id))
  const toggleAll = () => { if (allSelected) { const n = new Set(selected); items.forEach(o => n.delete(o.id)); setSelected(n) } else { const n = new Set(selected); items.forEach(o => n.add(o.id)); setSelected(n) } }
  const toggleOne = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} opportunity(s)?`)) return
    setBulkDeleting(true)
    for (const id of selected) await apiClient.deleteAdminOpportunity(id)
    setBulkDeleting(false); toast.success(`${selected.size} deleted`); setSelected(new Set()); load()
  }

  const load = () => {
    setLoading(true)
    setSelected(new Set())
    apiClient.getAdminOpportunities({ page: String(page), limit: '20' }).then(r => { if (r.success) setData(r.data as unknown as PageData) }).finally(()=>setLoading(false))
  }
  useEffect(()=>{ load() },[page])

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (o: OppRow) => {
    setForm({ title:o.title, description:'', type:o.type, organization:o.organization, location:o.location||'', isRemote:o.isRemote, requirements:'', benefits:'', applicationUrl:'', deadline:o.deadline?.slice(0,10)||'', tags:'' })
    setEditId(o.id); setShowForm(true)
  }
  const handleSave = async () => {
    setSaving(true)
    const payload: Record<string,unknown> = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()) : [] }
    const r = editId ? await apiClient.updateAdminOpportunity(editId, payload) : await apiClient.createAdminOpportunity(payload)
    if (r.success) { toast.success(editId?'Updated':'Created'); setShowForm(false); load() } else toast.error('Failed')
    setSaving(false)
  }
  const toggleApprove = async (o: OppRow) => {
    const r = await apiClient.updateAdminOpportunity(o.id, { isApproved: !o.isApproved })
    if (r.success) { toast.success(o.isApproved?'Unapproved':'Approved'); load() } else toast.error('Failed')
  }
  const del = async (o: OppRow) => {
    if (!confirm(`Delete "${o.title}"?`)) return
    const r = await apiClient.deleteAdminOpportunity(o.id)
    if (r.success) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  const typeColor: Record<string,string> = { JOB:'bg-blue-100 text-blue-700', INTERNSHIP:'bg-purple-100 text-purple-700', FELLOWSHIP:'bg-orange-100 text-orange-700', GRANT:'bg-green-100 text-green-700', COMPETITION:'bg-pink-100 text-pink-700' }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Opportunities</h1><p className="text-muted-foreground mt-1">{data?.total??0} total</p></div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Trash2 className="w-4 h-4"/>{bulkDeleting?'Deleting…':`Delete ${selected.size}`}</button>}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4"/>New Opportunity</button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="py-3 px-4 w-10"><button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">{allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}</button></th>
              {['Title','Type','Organization','Applications','Status','Actions'].map(h=><th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan={7} className="py-4 px-4"><div className="h-4 bg-muted animate-pulse rounded"/></td></tr>)
              : items.map(o=>(
                <tr key={o.id} className={`hover:bg-accent/30 transition-colors ${selected.has(o.id)?'bg-primary/5':''}`}>
                  <td className="py-3 px-4"><button onClick={()=>toggleOne(o.id)} className="text-muted-foreground hover:text-foreground">{selected.has(o.id)?<CheckSquare className="w-4 h-4 text-primary"/>:<Square className="w-4 h-4"/>}</button></td>
                  <td className="py-3 px-4 font-medium">{o.title}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColor[o.type]||'bg-muted text-muted-foreground'}`}>{o.type}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{o.organization}</td>
                  <td className="py-3 px-4 text-muted-foreground">{o._count?.applications??0}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${o.isApproved?'bg-green-100 text-green-700':'bg-yellow-100 text-yellow-700'}`}>{o.isApproved?'Approved':'Pending'}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>openEdit(o)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4"/></button>
                      <button onClick={()=>toggleApprove(o)} className={`p-1.5 rounded-lg hover:bg-accent transition-colors ${o.isApproved?'text-orange-500':'text-green-500'}`}><Check className="w-4 h-4"/></button>
                      <button onClick={()=>del(o)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !data?.items?.length && <p className="text-center text-muted-foreground py-10">No opportunities found.</p>}
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
            <div className="flex items-center justify-between mb-5"><h3 className="font-semibold text-lg">{editId?'Edit':'New'} Opportunity</h3><button onClick={()=>setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button></div>
            <div className="space-y-4">
              {[{k:'title',l:'Title'},{k:'description',l:'Description',ta:true},{k:'organization',l:'Organization'},{k:'location',l:'Location'},{k:'applicationUrl',l:'Application URL'},{k:'requirements',l:'Requirements',ta:true},{k:'benefits',l:'Benefits',ta:true},{k:'deadline',l:'Deadline',t:'date'},{k:'tags',l:'Tags (comma-separated)'}].map(({k,l,ta,t})=>(
                <div key={k}><label className="block text-sm font-medium mb-1">{l}</label>
                  {ta ? <textarea value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={2} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/> : <input type={t||'text'} value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"/>}
                </div>
              ))}
              <div><label className="block text-sm font-medium mb-1">Type</label><select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">{OPP_TYPES.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isRemote} onChange={e=>setForm(f=>({...f,isRemote:e.target.checked}))} className="rounded"/>Remote</label>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.title||!form.organization} className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"><Check className="w-4 h-4"/>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
