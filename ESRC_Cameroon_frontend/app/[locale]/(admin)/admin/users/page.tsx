'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Search, UserCheck, UserX, Shield, Trash2, X, Check, Square, CheckSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'

interface UserRow { id: string; email: string; firstName: string; lastName: string; role: string; country?: string; city?: string; isActive: boolean; createdAt: string; _count?: { enrollments: number } }
type PageData = { items: UserRow[]; total: number; pages: number }

const ROLES = ['LEARNER','INSTRUCTOR','FELLOW','PARTNER','ADMIN']
const roleColor: Record<string, string> = { ADMIN:'bg-red-100 text-red-700', INSTRUCTOR:'bg-blue-100 text-blue-700', FELLOW:'bg-purple-100 text-purple-700', PARTNER:'bg-orange-100 text-orange-700', LEARNER:'bg-muted text-muted-foreground' }

export default function AdminUsersPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [roleFilter, setRoleFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [editRole, setEditRole] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const load = () => {
    setLoading(true)
    setSelected(new Set())
    const params: Record<string,string> = { page: String(page), limit: '20' }
    if (roleFilter !== 'all') params.role = roleFilter
    if (search) params.search = search
    apiClient.getAdminUsers(params).then(r => { if (r.success) setData(r.data as unknown as PageData) }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [roleFilter, page])
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); load() }, 400)
    return () => clearTimeout(t)
  }, [search])

  const handleRoleChange = async () => {
    if (!editUser) return
    const r = await apiClient.updateAdminUser(editUser.id, { role: editRole })
    if (r.success) { toast.success('Role updated'); setEditUser(null); load() }
    else toast.error('Failed to update role')
  }

  const handleToggleActive = async (u: UserRow) => {
    const r = await apiClient.updateAdminUser(u.id, { isActive: !u.isActive })
    if (r.success) { toast.success(u.isActive ? 'User deactivated' : 'User activated'); load() }
    else toast.error('Failed')
  }

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`Permanently delete ${u.firstName} ${u.lastName}? This cannot be undone.`)) return
    const r = await apiClient.deleteAdminUser(u.id)
    if (r.success) { toast.success('User deleted'); load() }
    else toast.error((r as { error?: string }).error || 'Failed to delete user')
  }

  const handleBulkDelete = async () => {
    if (selected.size === 0) return
    if (!confirm(`Permanently delete ${selected.size} user(s)? This cannot be undone.`)) return
    setBulkDeleting(true)
    const r = await apiClient.bulkDeleteAdminUsers(Array.from(selected))
    setBulkDeleting(false)
    if (r.success) { toast.success(`${selected.size} user(s) deleted`); load() }
    else toast.error((r as { error?: string }).error || 'Bulk delete failed')
  }

  const items = data?.items ?? []
  const allSelected = items.length > 0 && items.every(u => selected.has(u.id))
  const someSelected = items.some(u => selected.has(u.id))

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selected)
      items.forEach(u => next.delete(u.id))
      setSelected(next)
    } else {
      const next = new Set(selected)
      items.forEach(u => next.add(u.id))
      setSelected(next)
    }
  }

  const toggleOne = (id: string) => {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">{data?.total ?? 0} total users</p>
        </div>
        {selected.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Trash2 className="w-4 h-4" />
            {bulkDeleting ? 'Deleting…' : `Delete ${selected.size} selected`}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email..." className="w-full pl-9 pr-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <select value={roleFilter} onChange={e=>{setRoleFilter(e.target.value);setPage(1)}} className="px-3 py-2 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30">
          <option value="all">All Roles</option>
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="py-3 px-4 w-10">
                  <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                    {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}
                  </button>
                </th>
                {['User','Email','Role','Location','Enrolled','Status','Actions'].map(h=>(
                  <th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i}><td colSpan={8} className="py-4 px-4"><div className="h-4 bg-muted animate-pulse rounded"/></td></tr>
              )) : items.map(u=>(
                <tr key={u.id} className={`hover:bg-accent/30 transition-colors ${selected.has(u.id) ? 'bg-primary/5' : ''}`}>
                  <td className="py-3 px-4">
                    <button onClick={()=>toggleOne(u.id)} className="text-muted-foreground hover:text-foreground">
                      {selected.has(u.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u.email}</td>
                  <td className="py-3 px-4"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleColor[u.role]||'bg-muted text-muted-foreground'}`}>{u.role}</span></td>
                  <td className="py-3 px-4 text-muted-foreground">{[u.city, u.country].filter(Boolean).join(', ')||'—'}</td>
                  <td className="py-3 px-4 text-muted-foreground">{u._count?.enrollments ?? 0}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{u.isActive?'Active':'Inactive'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={()=>{setEditUser(u);setEditRole(u.role)}} className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors" title="Change role"><Shield className="w-4 h-4"/></button>
                      <button onClick={()=>handleToggleActive(u)} className={`p-1.5 rounded-lg hover:bg-accent transition-colors ${u.isActive?'text-orange-500':'text-green-500'}`} title={u.isActive?'Deactivate':'Activate'}>{u.isActive?<UserX className="w-4 h-4"/>:<UserCheck className="w-4 h-4"/>}</button>
                      <button onClick={()=>handleDelete(u)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition-colors" title="Permanently delete"><Trash2 className="w-4 h-4"/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && !items.length && <p className="text-center text-muted-foreground py-10">No users found.</p>}
      </div>

      {/* Pagination */}
      {(data?.pages ?? 0) > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="p-2 bg-card border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"><ChevronLeft className="w-4 h-4"/></button>
          <span className="text-sm text-muted-foreground">Page {page} of {data?.pages}</span>
          <button onClick={()=>setPage(p=>Math.min(data?.pages??1,p+1))} disabled={page===data?.pages} className="p-2 bg-card border border-border rounded-lg disabled:opacity-50 hover:bg-accent transition-colors"><ChevronRight className="w-4 h-4"/></button>
        </div>
      )}

      {/* Role Edit Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-full max-w-sm mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Change Role</h3>
              <button onClick={()=>setEditUser(null)} className="text-muted-foreground hover:text-foreground"><X className="w-5 h-5"/></button>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{editUser.firstName} {editUser.lastName} · {editUser.email}</p>
            <select value={editRole} onChange={e=>setEditRole(e.target.value)} className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-primary/30">
              {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
            </select>
            <div className="flex gap-2">
              <button onClick={()=>setEditUser(null)} className="flex-1 py-2 text-sm border border-border rounded-lg hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleRoleChange} className="flex-1 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1"><Check className="w-4 h-4"/>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
