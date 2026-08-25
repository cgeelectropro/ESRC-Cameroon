'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard, Users, BookOpen, Calendar, FileText,
  Briefcase, AlertCircle, BarChart3, MessageSquare, Star,
  TrendingUp, LogOut, ChevronRight, Shield, GraduationCap, Tag,
  Users2, MessageCircle, Layers, Settings, Mail, Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'
import { apiClient } from '@/lib/api-client'

const NAV = [
  { label: 'Dashboard',            href: '/admin/dashboard',            icon: LayoutDashboard },
  { label: 'Analytics',            href: '/admin/analytics',            icon: BarChart3 },
  { label: 'Users',                href: '/admin/users',                icon: Users },
  { label: 'Courses',              href: '/admin/courses',              icon: BookOpen },
  { label: 'Categories',           href: '/admin/categories',           icon: Tag },
  { label: 'Instructor Requests',  href: '/admin/instructor-requests',  icon: GraduationCap, badge: true },
  { label: 'Advisory',             href: '/admin/advisory',             icon: Users2 },
  { label: 'Events',               href: '/admin/events',               icon: Calendar },
  { label: 'Publications',         href: '/admin/publications',         icon: FileText },
  { label: 'Opportunities',        href: '/admin/opportunities',        icon: Briefcase },
  { label: 'Moderation',          href: '/admin/moderation',           icon: AlertCircle },
  { label: 'Blog',                 href: '/admin/blog',                 icon: MessageSquare },
  { label: 'Community',            href: '/admin/community',            icon: MessageCircle },
  { label: 'Testimonials',         href: '/admin/testimonials',         icon: Star },
  { label: 'Metrics',              href: '/admin/metrics',              icon: TrendingUp },
  { label: 'Impact Content',       href: '/admin/impact-content',       icon: Layers },
  { label: 'About Page',           href: '/admin/about',                icon: Info },
  { label: 'Send Message',          href: '/admin/messages',             icon: Mail },
  { label: 'Site Settings',        href: '/admin/settings',             icon: Settings },
] as const

export function AdminSidebar() {
  const pathname = usePathname()
  const params = useParams()
  const locale = params?.locale || 'en'
  const { logout, user } = useAuth()
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const load = () =>
      apiClient.getInstructorPendingCount()
        .then((res) => { if (res.success && res.data) setPendingCount(res.data.count) })
        .catch(() => {})
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  return (
    <aside className="w-64 min-h-screen bg-card sidebar-panel flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" />
          <div>
            <p className="font-bold text-foreground text-sm">ESRC Admin</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon, ...rest }) => {
          const fullHref = `/${locale}${href}`
          const active = pathname === fullHref || pathname.startsWith(fullHref + '/')
          const showBadge = 'badge' in rest && rest.badge && pendingCount > 0
          return (
            <Link
              key={href}
              href={fullHref}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {showBadge && (
                <span className={cn(
                  'min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold flex items-center justify-center',
                  active ? 'bg-white/25 text-white' : 'bg-amber-500 text-white'
                )}>
                  {pendingCount > 99 ? '99+' : pendingCount}
                </span>
              )}
              {active && !showBadge && <ChevronRight className="w-3 h-3" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border space-y-1">
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <LayoutDashboard className="w-4 h-4" />
          User Dashboard
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
