'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import type { CourseCategoryDef } from '@/lib/types'

const emptyForm = { slug: '', nameEn: '', nameFr: '', order: 0, isActive: true }

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CourseCategoryDef | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [confirmDelete, setConfirmDelete] = useState<CourseCategoryDef | null>(null)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    const res = await apiClient.getAdminCategories()
    setLoading(false)
    if (res.success && Array.isArray(res.data)) setCategories(res.data)
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditing(null)
    setForm(emptyForm)
    setError('')
    setShowModal(true)
  }

  const openEdit = (cat: CourseCategoryDef) => {
    setEditing(cat)
    setForm({ slug: cat.slug, nameEn: cat.nameEn, nameFr: cat.nameFr, order: cat.order, isActive: cat.isActive })
    setError('')
    setShowModal(true)
  }

  const save = async () => {
    if (!form.slug || !form.nameEn || !form.nameFr) { setError('Slug, English name, and French name are required.'); return }
    setActionLoading(true); setError('')
    if (editing) {
      await apiClient.updateAdminCategory(editing.id, form)
    } else {
      await apiClient.createAdminCategory(form)
    }
    setActionLoading(false)
    setShowModal(false)
    load()
  }

  const doDelete = async () => {
    if (!confirmDelete) return
    const toDelete = confirmDelete
    setConfirmDelete(null)
    setActionLoading(true)
    const r = await apiClient.deleteAdminCategory(toDelete.id)
    setActionLoading(false)
    if (r.success) { toast.success('Category deleted'); load() }
    else toast.error('Failed to delete category')
  }

  return (
    <div className="p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Categories</h1>
            <p className="text-muted-foreground mt-1">{categories.length} categories · Used for courses and user interest selection during onboarding</p>
          </div>
          <Button onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" /> Add Category
          </Button>
        </div>

        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-16">
              <Tag className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No categories yet</p>
              <Button onClick={openAdd} variant="outline" className="mt-3"><Plus className="w-4 h-4 mr-1" /> Add first category</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  {['Order','English Name','French Name','Slug','Status','Actions'].map(h => (
                    <th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-accent/30 transition-colors">
                    <td className="py-3 px-4 text-muted-foreground">{cat.order}</td>
                    <td className="py-3 px-4 font-medium">{cat.nameEn}</td>
                    <td className="py-3 px-4 text-muted-foreground">{cat.nameFr}</td>
                    <td className="py-3 px-4">
                      <code className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground">{cat.slug}</code>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cat.isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(cat)} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => setConfirmDelete(cat)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>

        {/* Add/Edit modal */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Slug *</Label>
                <Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} placeholder="business-entrepreneurship" disabled={!!editing} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Name (English) *</Label>
                <Input value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} placeholder="Business & Entrepreneurship" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Name (French) *</Label>
                <Input value={form.nameFr} onChange={(e) => setForm((f) => ({ ...f, nameFr: e.target.value }))} placeholder="Affaires et Entrepreneuriat" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Display Order</Label>
                  <Input type="number" min={0} value={form.order} onChange={(e) => setForm((f) => ({ ...f, order: Number(e.target.value) }))} />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 rounded" />
                  <Label htmlFor="isActive" className="text-sm cursor-pointer">Active</Label>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={save} disabled={actionLoading}>
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editing ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirm */}
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Delete Category?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              Delete &quot;{confirmDelete?.nameEn}&quot;? Existing courses using this category will keep their category value.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button onClick={doDelete} disabled={actionLoading} variant="destructive">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
