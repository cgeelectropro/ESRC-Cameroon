'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Search, Edit, Trash2, RotateCcw, AlertTriangle, Loader2, BookOpen, Square, CheckSquare } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'
import type { CourseCategoryDef } from '@/lib/types'

type CourseRow = {
  id: string
  title: string
  category: string
  price: number
  isFree: boolean
  status: string
  thumbnail?: string
  isFeatured: boolean
  createdAt: string
  instructor?: { user?: { firstName?: string; lastName?: string } }
  _count?: { enrollments?: number }
}

const STATUS_TABS = ['ALL', 'PUBLISHED', 'DRAFT', 'PENDING', 'PRIVATE', 'TRASH']

const statusBadge = (s: string) => {
  const map: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-gray-100 text-gray-700',
    PENDING: 'bg-amber-100 text-amber-800',
    PRIVATE: 'bg-blue-100 text-blue-800',
    TRASH: 'bg-red-100 text-red-800',
  }
  return map[s] || 'bg-gray-100 text-gray-600'
}

export default function AdminCoursesPage() {
  const locale = useLocale()
  const [courses, setCourses] = useState<CourseRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const PAGE_SIZE = 20
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])
  const [confirmDelete, setConfirmDelete] = useState<CourseRow | null>(null)
  const [confirmPermDelete, setConfirmPermDelete] = useState<CourseRow | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.nameEn]))

  const allSelected = courses.length > 0 && courses.every(c => selected.has(c.id))
  const someSelected = courses.some(c => selected.has(c.id))
  const toggleAll = () => { if (allSelected) { const n = new Set(selected); courses.forEach(c => n.delete(c.id)); setSelected(n) } else { const n = new Set(selected); courses.forEach(c => n.add(c.id)); setSelected(n) } }
  const toggleOne = (id: string) => { const n = new Set(selected); n.has(id) ? n.delete(id) : n.add(id); setSelected(n) }
  // Mutations update local state directly instead of re-fetching the whole
  // list, so the table doesn't flash a full loading spinner for a single
  // row change.
  const removeLocalCourse = (id: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
    setTotal((prev) => Math.max(0, prev - 1))
  }

  const applyLocalStatus = (id: string, status: string) => {
    if (activeTab !== 'ALL' && activeTab !== status) {
      removeLocalCourse(id)
      return
    }
    setCourses((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)))
  }

  const handleBulkTrash = async () => {
    if (!confirm(`Move ${selected.size} course(s) to trash?`)) return
    setBulkDeleting(true)
    for (const id of selected) {
      await apiClient.deleteAdminCourse(id)
      applyLocalStatus(id, 'TRASH')
    }
    setBulkDeleting(false); toast.success(`${selected.size} course(s) moved to trash`); setSelected(new Set())
  }

  const load = async () => {
    setLoading(true)
    setSelected(new Set())
    const params: Record<string, string> = { page: String(page), limit: String(PAGE_SIZE) }
    if (search) params.search = search
    if (activeTab !== 'ALL') params.status = activeTab
    const res = await apiClient.getAdminCourses(params)
    setLoading(false)
    if (res.success && res.data && typeof res.data === 'object') {
      const d = res.data as any
      setCourses(Array.isArray(d) ? d : d.items || [])
      setTotal(d.total ?? 0)
      setPages(d.pages ?? 1)
    }
  }

  useEffect(() => {
    apiClient.getAdminCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) setCategories(res.data)
    })
  }, [])

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput), 400)
    return () => clearTimeout(id)
  }, [searchInput])

  useEffect(() => { setPage(1) }, [activeTab, search])
  useEffect(() => { load() }, [activeTab, search, page])

  const quickStatus = async (id: string, status: string) => {
    await apiClient.updateAdminCourse(id, { status })
    applyLocalStatus(id, status)
  }

  const trashCourse = async (course: CourseRow) => {
    setConfirmDelete(null)
    setActionLoading(true)
    await apiClient.deleteAdminCourse(course.id)
    setActionLoading(false)
    applyLocalStatus(course.id, 'TRASH')
  }

  const restoreCourse = async (id: string) => {
    await apiClient.updateAdminCourse(id, { status: 'DRAFT' })
    applyLocalStatus(id, 'DRAFT')
  }

  const permanentDelete = async (course: CourseRow) => {
    setConfirmPermDelete(null)
    setActionLoading(true)
    await apiClient.permanentDeleteAdminCourse(course.id)
    setActionLoading(false)
    removeLocalCourse(course.id)
  }

  return (
    <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Courses</h1>
            <p className="text-muted-foreground mt-1">{total} course{total !== 1 ? 's' : ''} total</p>
          </div>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <Button onClick={handleBulkTrash} disabled={bulkDeleting} className="bg-destructive text-destructive-foreground hover:opacity-90 text-sm">
                {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}Trash {selected.size}
              </Button>
            )}
            <Link href={`/${locale}/instructor/courses/new`}>
              <Button className="bg-primary text-primary-foreground hover:opacity-90">+ New Course</Button>
            </Link>
          </div>
        </div>

        {/* Status tabs */}
        <div className="flex gap-1 mb-4 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-accent'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search courses..."
            className="pl-9 h-9"
          />
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-16">
              <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No courses found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <button onClick={toggleAll} className="text-muted-foreground hover:text-foreground">
                        {allSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : someSelected ? <CheckSquare className="w-4 h-4 text-primary/50" /> : <Square className="w-4 h-4" />}
                      </button>
                    </th>
                    {['Course','Category','Author','Price','Status','Enrolled','Actions'].map(h => (
                      <th key={h} className={`py-3 px-4 font-semibold text-muted-foreground text-xs uppercase tracking-wide ${h==='Actions'?'text-right':'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {courses.map((course) => (
                    <tr key={course.id} className={`hover:bg-accent/30 transition-colors ${selected.has(course.id) ? 'bg-primary/5' : ''}`}>
                      <td className="py-3 px-4">
                        <button onClick={() => toggleOne(course.id)} className="text-muted-foreground hover:text-foreground">
                          {selected.has(course.id) ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {course.thumbnail
                            ? <img src={course.thumbnail} alt="" className="w-12 h-8 object-cover rounded shrink-0" />
                            : <div className="w-12 h-8 bg-muted rounded shrink-0 flex items-center justify-center"><BookOpen className="w-4 h-4 text-muted-foreground" /></div>
                          }
                          <div>
                            <p className="font-medium line-clamp-1">{course.title}</p>
                            <p className="text-xs text-muted-foreground">{new Date(course.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{catMap[course.category] || course.category || '—'}</td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">
                        {course.instructor?.user
                          ? `${course.instructor.user.firstName || ''} ${course.instructor.user.lastName || ''}`.trim()
                          : '—'}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{course.isFree ? 'Free' : `${(course.price ?? 0).toLocaleString()} XAF`}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge(course.status)}`}>{course.status}</span>
                          <select
                            value={course.status}
                            onChange={(e) => quickStatus(course.id, e.target.value)}
                            className="text-xs px-1 py-0.5 border border-border rounded text-muted-foreground bg-background"
                            title="Change status"
                          >
                            {['PUBLISHED', 'DRAFT', 'PENDING', 'PRIVATE', 'TRASH'].map((s) => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-xs">{course._count?.enrollments ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Link href={`/${locale}/instructor/courses/${course.id}/edit`} title="Edit">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800">
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </Link>
                          {course.status === 'TRASH' ? (
                            <>
                              <Button variant="ghost" size="sm" onClick={() => restoreCourse(course.id)} className="h-8 w-8 p-0 text-green-600 hover:text-green-800" title="Restore">
                                <RotateCcw className="w-3.5 h-3.5" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => setConfirmPermDelete(course)} className="h-8 w-8 p-0 text-red-600 hover:text-red-800" title="Delete permanently">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          ) : (
                            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(course)} className="h-8 w-8 p-0 text-red-500 hover:text-red-700" title="Move to trash">
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {!loading && pages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Trash confirm */}
        <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle>Move to Trash?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              &quot;{confirmDelete?.title}&quot; will be moved to trash. You can restore it later from the Trash tab.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button onClick={() => confirmDelete && trashCourse(confirmDelete)} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Move to Trash'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Permanent delete confirm */}
        <Dialog open={!!confirmPermDelete} onOpenChange={() => setConfirmPermDelete(null)}>
          <DialogContent>
            <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /> Permanently Delete?</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground">
              &quot;{confirmPermDelete?.title}&quot; will be <strong>permanently deleted</strong> and cannot be recovered. This will also remove all enrollments and sections.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmPermDelete(null)}>Cancel</Button>
              <Button onClick={() => confirmPermDelete && permanentDelete(confirmPermDelete)} disabled={actionLoading} className="bg-red-600 hover:bg-red-700 text-white">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Permanently'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  )
}
