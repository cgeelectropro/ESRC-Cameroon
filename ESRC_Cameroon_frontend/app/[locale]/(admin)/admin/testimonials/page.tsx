'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Testimonial { id: string; name: string; quote: string; title?: string; location?: string; order: number }
const emptyForm = { name: '', quote: '', title: '', location: '', order: 0, avatar: '' }

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); apiClient.getAdminTestimonials().then(r => { if (r.success) setItems(r.data as unknown as Testimonial[]) }).finally(()=>setLoading(false)) }
  useEffect(()=>{ load() },[])

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (t: Testimonial) => { setForm({ name:t.name, quote:t.quote, title:t.title||'', location:t.location||'', order:t.order, avatar:'' }); setEditId(t.id); setShowForm(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, order: Number(form.order) }
    const r = editId ? await apiClient.updateAdminTestimonial(editId, payload) : await apiClient.createAdminTestimonial(payload)
    if (r.success) { toast.success(editId?'Updated':'Created'); setShowForm(false); load() } else toast.error('Failed')
    setSaving(false)
  }

  const del = async (t: Testimonial) => {
    if (!confirm(`Delete testimonial from "${t.name}"?`)) return
    const r = await apiClient.deleteAdminTestimonial(t.id)
    if (r.success) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Testimonials</h1><p className="text-muted-foreground mt-1">{items.length} testimonials</p></div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4"/>Add Testimonial</button>
      </div>

      {loading ? <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mt-20"/> : (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className="bg-card border border-border rounded-xl p-5 flex gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">{t.name}</span>
                  {t.title && <span className="text-xs text-muted-foreground">· {t.title}</span>}
                  {t.location && <span className="text-xs text-muted-foreground">· {t.location}</span>}
                  <span className="text-xs text-muted-foreground ml-auto">Order: {t.order}</span>
                </div>
                <p className="text-sm text-muted-foreground italic">&ldquo;{t.quote}&rdquo;</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={()=>openEdit(t)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4"/></button>
                <button onClick={()=>del(t)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          ))}
          {!items.length && <div className="text-center text-muted-foreground py-10">No testimonials yet.</div>}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-5"><h3 className="font-semibold">{editId?'Edit':'Add'} Testimonial</h3><button onClick={()=>setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button></div>
            <div className="space-y-4">
              {[{k:'name',l:'Full Name'},{k:'title',l:'Title / Role'},{k:'location',l:'Location'},{k:'avatar',l:'Avatar URL (optional)'}].map(({k,l})=>(
                <div key={k}><label className="block text-sm font-medium mb-1">{l}</label><input value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
              ))}
              <div><label className="block text-sm font-medium mb-1">Quote</label><textarea value={form.quote} onChange={e=>setForm(f=>({...f,quote:e.target.value}))} rows={3} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/></div>
              <div><label className="block text-sm font-medium mb-1">Display Order</label><input type="number" value={form.order} onChange={e=>setForm(f=>({...f,order:parseInt(e.target.value)||0}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.name||!form.quote} className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"><Check className="w-4 h-4"/>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
