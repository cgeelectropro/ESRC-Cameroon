'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Pencil, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface Metric { id: string; label: string; value: number; icon: string; color: string; description?: string; order: number }

export default function AdminMetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string|null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const load = () => { setLoading(true); apiClient.getAdminMetrics().then(r => { if (r.success) setMetrics(r.data as unknown as Metric[]) }).finally(()=>setLoading(false)) }
  useEffect(()=>{ load() },[])

  const startEdit = (m: Metric) => { setEditId(m.id); setEditValue(String(m.value)) }

  const saveEdit = async () => {
    if (!editId) return
    setSaving(true)
    const r = await apiClient.updateAdminMetric(editId, { value: parseInt(editValue) })
    if (r.success) { toast.success('Metric updated'); setEditId(null); load() } else toast.error('Failed')
    setSaving(false)
  }

  return (
    <div className="p-8">
      <div className="mb-8"><h1 className="text-2xl font-bold">Impact Metrics</h1><p className="text-muted-foreground mt-1">Update the platform impact numbers shown on the homepage</p></div>
      {loading ? <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mt-20"/> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(m=>(
            <div key={m.id} className="bg-card border border-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{m.label}</p>
                  {editId===m.id ? (
                    <input type="number" value={editValue} onChange={e=>setEditValue(e.target.value)} className="mt-1 w-32 px-2 py-1 text-xl font-bold bg-background border border-primary rounded focus:outline-none"/>
                  ) : (
                    <p className="text-3xl font-bold text-foreground mt-1">{m.value.toLocaleString()}</p>
                  )}
                </div>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg" style={{backgroundColor: m.color+'20', color: m.color}}>{m.icon==='Users'?'👥':m.icon==='BookOpen'?'📚':m.icon==='Globe'?'🌍':m.icon==='Award'?'🏆':m.icon==='Briefcase'?'💼':'📊'}</div>
              </div>
              {m.description && <p className="text-xs text-muted-foreground mt-2">{m.description}</p>}
              <div className="flex gap-2 mt-4">
                {editId===m.id ? (
                  <>
                    <button onClick={()=>setEditId(null)} className="flex-1 py-1.5 text-xs border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-1"><X className="w-3 h-3"/>Cancel</button>
                    <button onClick={saveEdit} disabled={saving} className="flex-1 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-1"><Check className="w-3 h-3"/>{saving?'Saving...':'Save'}</button>
                  </>
                ) : (
                  <button onClick={()=>startEdit(m)} className="w-full py-1.5 text-xs border border-border rounded-lg hover:bg-accent transition-colors flex items-center justify-center gap-1 text-muted-foreground hover:text-foreground"><Pencil className="w-3 h-3"/>Edit Value</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
