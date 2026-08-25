'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { Users, BookOpen, Calendar, FileText, Briefcase, TrendingUp, AlertCircle, DollarSign } from 'lucide-react'

interface DashboardStats { totalUsers: number; totalCourses: number; totalEvents: number; totalPublications: number; totalOpportunities: number; totalEnrollments: number; totalRevenue: number; pendingModeration: number }
interface DashboardData { stats: DashboardStats; recentUsers: Array<{ id: string; firstName: string; lastName: string; email: string; role: string }>; recentEnrollments: Array<{ id: string; user: { firstName: string; lastName: string }; course: { title: string } }> }

export default function AdminDashboardPage() {
  const locale = useLocale()
  const t = useTranslations('admin')
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getAdminDashboard().then(r => { if (r.success) setData(r.data as unknown as DashboardData); setLoading(false) })
  }, [])

  if (loading) return <div className="p-8"><div className="grid grid-cols-4 gap-4">{[...Array(8)].map((_,i)=><div key={i} className="h-24 bg-muted animate-pulse rounded-xl"/>)}</div></div>

  const s = data?.stats
  const CARDS = [
    { label: t('totalUsers'), value: s?.totalUsers??0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', href: '/admin/users' },
    { label: t('courses'), value: s?.totalCourses??0, icon: BookOpen, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950', href: '/admin/courses' },
    { label: t('events'), value: s?.totalEvents??0, icon: Calendar, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950', href: '/admin/events' },
    { label: t('publications'), value: s?.totalPublications??0, icon: FileText, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', href: '/admin/publications' },
    { label: t('opportunities'), value: s?.totalOpportunities??0, icon: Briefcase, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-950', href: '/admin/opportunities' },
    { label: t('enrollments'), value: s?.totalEnrollments??0, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950', href: '/admin/courses' },
    { label: t('revenue'), value: (s?.totalRevenue??0).toLocaleString(), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950', href: '/admin/analytics' },
    { label: t('pendingReview'), value: s?.pendingModeration??0, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', href: '/admin/moderation' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">{t('dashboard')}</h1>
        <p className="text-muted-foreground mt-1">{t('overview')}</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {CARDS.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={`/${locale}${href}`}>
            <div className="admin-card p-5 hover:border-primary/50 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground">{label}</span>
                <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-4 h-4 ${color}`}/></div>
              </div>
              <p className="text-2xl font-bold text-foreground">{value}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="admin-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{t('recentUsers')}</h2>
            <Link href={`/${locale}/admin/users`} className="text-xs text-primary hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="divide-y divide-border">
            {(data?.recentUsers??[]).map(u=>(
              <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role==='ADMIN'?'bg-red-100 text-red-700':u.role==='INSTRUCTOR'?'bg-blue-100 text-blue-700':'bg-muted text-muted-foreground'}`}>{u.role}</span>
              </div>
            ))}
            {!data?.recentUsers?.length && <p className="px-5 py-4 text-sm text-muted-foreground">{t('noUsers')}</p>}
          </div>
        </div>

        <div className="admin-card overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold">{t('recentEnrollments')}</h2>
            <Link href={`/${locale}/admin/courses`} className="text-xs text-primary hover:underline">{t('viewAll')}</Link>
          </div>
          <div className="divide-y divide-border">
            {(data?.recentEnrollments??[]).map(e=>(
              <div key={e.id} className="px-5 py-3">
                <p className="text-sm font-medium">{e.user.firstName} {e.user.lastName}</p>
                <p className="text-xs text-muted-foreground">{e.course.title}</p>
              </div>
            ))}
            {!data?.recentEnrollments?.length && <p className="px-5 py-4 text-sm text-muted-foreground">{t('noEnrollments')}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
