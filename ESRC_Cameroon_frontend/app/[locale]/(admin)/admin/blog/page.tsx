'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Plus, Pencil, Trash2, X, Check, Eye, EyeOff, Square, CheckSquare } from 'lucide-react'
import { toast } from 'sonner'

interface BlogRow { id: string; title: string; slug: string; author: string; isPublished: boolean; tags: string[]; createdAt: string }
type PageData = { items: BlogRow[]; total: number; pages: number }
const emptyForm = { title: '', titleFr: '', content: '', contentFr: '', excerpt: '', author: '', coverImage: '', tags: '', isPublished: false }

export default function AdminBlogPage() {
  const [data, setData] = useState<PageData|null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string|null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const blogItems = data?.items ?? []
  const allSelected = blogItems.length > 0 && blogItems.every(b => selected.has(b.id))
  const someSelected = blogItems.some(b => selected.has(b.id))
  const toggleAll = () => { if (allSelected) { const n = new Set(selected); blogItems.forEach(b => n.delete(b.id)); setSelected(n) } else { const n = new Set(selected); blogItems.forEach(b => n.add(b.id)); setSelected(n) } }
  const toggleOne = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }
  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} post(s)?`)) return
    setBulkDeleting(true)
    for (const id of selected) await apiClient.deleteAdminBlogPost(id)
    setBulkDeleting(false); toast.success(`${selected.size} post(s) deleted`); setSelected(new Set()); load()
  }

  const load = () => { setLoading(true); setSelected(new Set()); apiClient.getAdminBlog({ page: String(page), limit: '20' }).then(r => { if (r.success) setData(r.data as unknown as PageData) }).finally(()=>setLoading(false)) }
  useEffect(()=>{ load() },[page])

  const openCreate = () => { setForm(emptyForm); setEditId(null); setShowForm(true) }
  const openEdit = (b: BlogRow) => { setForm({ title:b.title, titleFr:'', content:'', contentFr:'', excerpt:'', author:b.author, coverImage:'', tags:(b.tags??[]).join(', '), isPublished:b.isPublished }); setEditId(b.id); setShowForm(true) }

  const handleSave = async () => {
    setSaving(true)
    const payload = { ...form, tags: form.tags ? form.tags.split(',').map(t=>t.trim()) : [] }
    const r = editId ? await apiClient.updateAdminBlogPost(editId, payload) : await apiClient.createAdminBlogPost(payload)
    if (r.success) { toast.success(editId?'Updated':'Created'); setShowForm(false); load() } else toast.error('Failed')
    setSaving(false)
  }

  const togglePublish = async (b: BlogRow) => {
    const r = await apiClient.updateAdminBlogPost(b.id, { isPublished: !b.isPublished })
    if (r.success) { toast.success(b.isPublished?'Unpublished':'Published'); load() } else toast.error('Failed')
  }

  const del = async (b: BlogRow) => {
    if (!confirm(`Delete "${b.title}"?`)) return
    const r = await apiClient.deleteAdminBlogPost(b.id)
    if (r.success) { toast.success('Deleted'); load() } else toast.error('Failed')
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold">Blog Posts</h1><p className="text-muted-foreground mt-1">{data?.total??0} posts</p></div>
        <div className="flex items-center gap-2">
          {selected.size > 0 && <button onClick={handleBulkDelete} disabled={bulkDeleting} className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50"><Trash2 className="w-4 h-4"/>{bulkDeleting?'Deleting…':`Delete ${selected.size}`}</button>}
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"><Plus className="w-4 h-4"/>New Post</button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="py-3 px-4 w-10"><button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">{allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}</button></th>
              {['Title','Author','Status','Date','Actions'].map(h=><th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>)}
            </tr></thead>
            <tbody className="divide-y divide-border">
              {loading ? [...Array(5)].map((_,i)=><tr key={i}><td colSpan={6} className="py-4 px-4"><div className="h-4 bg-muted animate-pulse rounded"/></td></tr>)
              : blogItems.map(b=>(
                <tr key={b.id} className={`hover:bg-accent/30 transition-colors ${selected.has(b.id)?'bg-primary/5':''}`}>
                  <td className="py-3 px-4"><button onClick={()=>toggleOne(b.id)} className="text-muted-foreground hover:text-foreground">{selected.has(b.id)?<CheckSquare className="w-4 h-4 text-primary"/>:<Square className="w-4 h-4"/>}</button></td>
                  <td className="py-3 px-4 font-medium max-w-xs"><div className="line-clamp-1">{b.title}</div><div className="text-xs text-muted-foreground">{b.slug}</div></td>
                  <td className="py-3 px-4 text-muted-foreground">{b.author}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${b.isPublished?'bg-green-100 text-green-700':'bg-muted text-muted-foreground'}`}>{b.isPublished?'Published':'Draft'}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>openEdit(b)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><Pencil className="w-4 h-4"/></button>
                      <button onClick={()=>togglePublish(b)} className={`p-1.5 rounded-lg hover:bg-accent transition-colors ${b.isPublished?'text-orange-500':'text-green-500'}`}>{b.isPublished?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button>
                      <button onClick={()=>del(b)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !data?.items?.length && <p className="text-center text-muted-foreground py-10">No blog posts yet.</p>}
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
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-2xl mx-4 my-auto">
            <div className="flex items-center justify-between mb-5"><h3 className="font-semibold text-lg">{editId?'Edit':'New'} Blog Post</h3><button onClick={()=>setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button></div>
            <div className="grid grid-cols-2 gap-4">
              {[{k:'title',l:'Title (EN)',col:2},{k:'titleFr',l:'Title (FR)',col:2},{k:'author',l:'Author',col:1},{k:'coverImage',l:'Cover Image URL',col:1},{k:'tags',l:'Tags (comma-separated)',col:2},{k:'excerpt',l:'Excerpt',col:2,ta:true},{k:'content',l:'Content (EN)',col:2,ta:true,rows:6},{k:'contentFr',l:'Content (FR)',col:2,ta:true,rows:6}].map(({k,l,col,ta,rows})=>(
                <div key={k} className={col===2?'col-span-2':''}>
                  <label className="block text-sm font-medium mb-1">{l}</label>
                  {ta ? <textarea value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} rows={rows||3} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/> : <input value={(form as Record<string,unknown>)[k] as string} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"/>}
                </div>
              ))}
              <div className="col-span-2"><label className="flex items-center gap-2 text-sm cursor-pointer"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm(f=>({...f,isPublished:e.target.checked}))} className="rounded"/>Publish immediately</label></div>
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={()=>setShowForm(false)} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving||!form.title||!form.author} className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"><Check className="w-4 h-4"/>{saving?'Saving...':'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
