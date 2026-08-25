'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import type { TeamMember, AboutStat } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Users, BarChart3, Plus, Pencil, Trash2, Save, X, CheckCircle, GripVertical, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

const SUPABASE_MEDIA = 'https://rohatzmiqhczybfbgjhj.supabase.co/storage/v1/object/public/media/'

// ─── Team Member Form ─────────────────────────────────────────────────────────
function TeamForm({ initial, onSave, onCancel }: {
  initial?: Partial<TeamMember>
  onSave: (data: Partial<TeamMember>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<TeamMember>>({
    name: '', role: '', bio: '', photo: '', email: '', linkedin: '', order: 0, isActive: true,
    ...initial,
  })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    if (!form.name?.trim() || !form.role?.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Full Name *</Label>
          <Input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Dr. Jane Doe" className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Role / Title *</Label>
          <Input value={form.role ?? ''} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Executive Director" className="text-sm" />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label className="text-xs">Bio</Label>
          <Textarea value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={2} placeholder="Short bio..." className="text-sm resize-none" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Photo filename (Supabase media bucket)</Label>
          <Input value={form.photo ?? ''} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} placeholder="Team-1-300x300.jpg" className="text-sm" />
          {form.photo && (
            <img src={`${SUPABASE_MEDIA}${form.photo}`} alt="preview" className="w-16 h-16 rounded-full object-cover mt-1" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          )}
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Email</Label>
          <Input value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="jane@nextgen-en.com" className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">LinkedIn URL</Label>
          <Input value={form.linkedin ?? ''} onChange={e => setForm(f => ({ ...f, linkedin: e.target.value }))} placeholder="https://linkedin.com/in/..." className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Display Order</Label>
          <Input type="number" value={form.order ?? 0} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="text-sm" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.isActive ?? true} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-primary" />
          <span className="text-sm">Active (visible on About page)</span>
        </label>
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={saving || !form.name?.trim() || !form.role?.trim()} className="gap-1.5">
          <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
      </div>
    </div>
  )
}

// ─── Stat Form ────────────────────────────────────────────────────────────────
function StatForm({ initial, onSave, onCancel }: {
  initial?: Partial<AboutStat>
  onSave: (data: Partial<AboutStat>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState<Partial<AboutStat>>({ number: '', labelEn: '', labelFr: '', order: 0, ...initial })
  const [saving, setSaving] = useState(false)
  const submit = async () => {
    if (!form.number?.trim() || !form.labelEn?.trim()) return
    setSaving(true)
    await onSave(form)
    setSaving(false)
  }
  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Number *</Label>
          <Input value={form.number ?? ''} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} placeholder="10,000+" className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Label (EN) *</Label>
          <Input value={form.labelEn ?? ''} onChange={e => setForm(f => ({ ...f, labelEn: e.target.value }))} placeholder="Active Learners" className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Label (FR)</Label>
          <Input value={form.labelFr ?? ''} onChange={e => setForm(f => ({ ...f, labelFr: e.target.value }))} placeholder="Apprenants Actifs" className="text-sm" />
        </div>
      </div>
      <div className="space-y-1 w-24">
        <Label className="text-xs">Order</Label>
        <Input type="number" value={form.order ?? 0} onChange={e => setForm(f => ({ ...f, order: parseInt(e.target.value) || 0 }))} className="text-sm" />
      </div>
      <div className="flex gap-2">
        <Button size="sm" onClick={submit} disabled={saving || !form.number?.trim() || !form.labelEn?.trim()} className="gap-1.5">
          <Save className="w-3.5 h-3.5" />{saving ? 'Saving…' : 'Save'}
        </Button>
        <Button size="sm" variant="outline" onClick={onCancel}><X className="w-3.5 h-3.5 mr-1" />Cancel</Button>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminAboutPage() {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<AboutStat[]>([])
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [loadingStats, setLoadingStats] = useState(true)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [addingMember, setAddingMember] = useState(false)
  const [editingStat, setEditingStat] = useState<AboutStat | null>(null)
  const [addingStat, setAddingStat] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  const flash = (key: string) => { setSaved(key); setTimeout(() => setSaved(null), 2000) }

  const loadTeam = async () => {
    setLoadingTeam(true)
    const res = await apiClient.adminGetTeamMembers()
    if (res.success && res.data) setTeam(res.data)
    setLoadingTeam(false)
  }
  const loadStats = async () => {
    setLoadingStats(true)
    const res = await apiClient.adminGetAboutStats()
    if (res.success && res.data) setStats(res.data)
    setLoadingStats(false)
  }

  useEffect(() => { loadTeam(); loadStats() }, [])

  // Team CRUD
  const createMember = async (data: Partial<TeamMember>) => {
    await apiClient.adminCreateTeamMember(data)
    setAddingMember(false); flash('team-new'); await loadTeam()
  }
  const updateMember = async (id: string, data: Partial<TeamMember>) => {
    await apiClient.adminUpdateTeamMember(id, data)
    setEditingMember(null); flash(`team-${id}`); await loadTeam()
  }
  const deleteMember = async (id: string) => {
    if (!confirm('Delete this team member?')) return
    await apiClient.adminDeleteTeamMember(id); await loadTeam()
  }
  const toggleActive = async (member: TeamMember) => {
    await apiClient.adminUpdateTeamMember(member.id, { isActive: !member.isActive })
    flash(`active-${member.id}`); await loadTeam()
  }

  // Stats CRUD
  const createStat = async (data: Partial<AboutStat>) => {
    await apiClient.adminCreateAboutStat(data)
    setAddingStat(false); flash('stat-new'); await loadStats()
  }
  const updateStat = async (id: string, data: Partial<AboutStat>) => {
    await apiClient.adminUpdateAboutStat(id, data)
    setEditingStat(null); flash(`stat-${id}`); await loadStats()
  }
  const deleteStat = async (id: string) => {
    if (!confirm('Delete this stat?')) return
    await apiClient.adminDeleteAboutStat(id); await loadStats()
  }

  return (
    <div className="p-6 space-y-10 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">About Page Management</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage team members and impact stats displayed on the About page</p>
      </div>

      {/* ── Team Members ───────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />Team Members
          </h2>
          <Button size="sm" onClick={() => { setAddingMember(true); setEditingMember(null) }} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Member
          </Button>
        </div>

        {addingMember && (
          <TeamForm onSave={createMember} onCancel={() => setAddingMember(false)} />
        )}

        {loadingTeam ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : team.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">No team members yet. Add one above.</p>
        ) : (
          <div className="space-y-3">
            {team.map(member => (
              <div key={member.id}>
                {editingMember?.id === member.id ? (
                  <TeamForm initial={member} onSave={d => updateMember(member.id, d)} onCancel={() => setEditingMember(null)} />
                ) : (
                  <div className={cn('rounded-xl border border-border bg-card p-4 flex items-center gap-4', !member.isActive && 'opacity-60')}>
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 shrink-0">
                      {member.photo ? (
                        <img src={`${SUPABASE_MEDIA}${member.photo}`} alt={member.name} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-lg">{member.name[0]}</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                      {member.bio && <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.bio}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {saved === `active-${member.id}` && <CheckCircle className="w-4 h-4 text-green-500" />}
                      <button onClick={() => toggleActive(member)} title={member.isActive ? 'Hide' : 'Show'} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        {member.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => { setEditingMember(member); setAddingMember(false) }} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteMember(member.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── About Stats ────────────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />Impact Stats
          </h2>
          <Button size="sm" onClick={() => { setAddingStat(true); setEditingStat(null) }} className="gap-1.5">
            <Plus className="w-3.5 h-3.5" />Add Stat
          </Button>
        </div>

        {addingStat && (
          <StatForm onSave={createStat} onCancel={() => setAddingStat(false)} />
        )}

        {loadingStats ? (
          <p className="text-sm text-muted-foreground py-4">Loading…</p>
        ) : stats.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center border border-dashed border-border rounded-xl">No stats yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map(stat => (
              <div key={stat.id}>
                {editingStat?.id === stat.id ? (
                  <StatForm initial={stat} onSave={d => updateStat(stat.id, d)} onCancel={() => setEditingStat(null)} />
                ) : (
                  <div className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-display text-2xl text-primary font-bold">{stat.number}</p>
                        <p className="text-sm text-foreground mt-0.5">{stat.labelEn}</p>
                        <p className="text-xs text-muted-foreground">{stat.labelFr}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {saved === `stat-${stat.id}` && <CheckCircle className="w-4 h-4 text-green-500" />}
                        <button onClick={() => { setEditingStat(stat); setAddingStat(false) }} className="p-1 rounded hover:bg-accent text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteStat(stat.id)} className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-destructive transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Order: {stat.order}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
