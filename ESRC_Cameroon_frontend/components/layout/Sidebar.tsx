'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/shared/NotificationBell'
import {
  LayoutDashboard,
  BookOpen,
  Map,
  Award,
  Briefcase,
  Users,
  BarChart3,
  Settings,
  LogOut,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react'

export function Sidebar() {
  const pathname = usePathname()
  const { logout, user } = useAuth()
  const t = useTranslations('sidebar')
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'admin'
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'instructor'

  const menuItems = [
    { icon: LayoutDashboard, label: t('home'), href: '/dashboard' },
    { icon: BookOpen, label: t('courses'), href: '/dashboard/my-courses' },
    { icon: Map, label: t('learningPath'), href: '/dashboard/learning-path' },
    { icon: Award, label: t('certificates'), href: '/dashboard/certificates' },
    { icon: Briefcase, label: t('toolkit'), href: '/dashboard/toolkit' },
    { icon: Users, label: t('advisory'), href: '/dashboard/advisory' },
    { icon: Users, label: t('community'), href: '/dashboard/community' },
    { icon: BarChart3, label: t('opportunities'), href: '/dashboard/opportunities' },
  ]

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + '/')

  return (
    <aside className="hidden lg:block w-64 bg-card sidebar-panel shrink-0">
      <div className="sticky top-20 flex flex-col h-[calc(100vh-5rem)]">
        {/* Admin back-link */}
        {isAdmin && (
          <div className="px-4 pt-4">
            <Link href="/admin/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-2.5 rounded-lg bg-esrc-green-700/10 text-esrc-green-700 hover:bg-esrc-green-700/20 border border-esrc-green-700/30"
              >
                <ShieldCheck size={18} />
                <span className="font-medium text-sm">{t('adminPanel')}</span>
              </Button>
            </Link>
            <div className="border-b border-border mt-4" />
          </div>
        )}
        {/* Instructor back-link */}
        {isInstructor && (
          <div className="px-4 pt-4">
            <Link href="/instructor/dashboard">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 px-4 py-2.5 rounded-lg bg-esrc-gold-500/10 text-esrc-green-700 hover:bg-esrc-gold-500/20 border border-esrc-gold-500/30"
              >
                <GraduationCap size={18} />
                <span className="font-medium text-sm">{t('instructorPanel')}</span>
              </Button>
            </Link>
            <div className="border-b border-border mt-4" />
          </div>
        )}
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 px-4 py-2.5 rounded-lg transition-all duration-200',
                    active
                      ? 'bg-accent text-primary border-l-4 border-primary dark:bg-accent dark:text-primary'
                      : 'text-muted-foreground hover:bg-accent dark:hover:bg-accent/50'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="border-t border-border p-6 space-y-2">
          {/* Notifications row */}
          <div className="flex items-center justify-between px-4 py-2 rounded-lg text-muted-foreground hover:bg-accent transition-colors">
            <span className="font-medium text-sm flex items-center gap-3">
              <span>Notifications</span>
            </span>
            <NotificationBell />
          </div>
          <Link href="/dashboard/profile">
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:bg-accent dark:hover:bg-accent/50">
              <Settings size={20} />
              <span className="font-medium">{t('settings')}</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            onClick={() => logout()}
            className="w-full justify-start gap-3 text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20"
          >
            <LogOut size={20} />
            <span className="font-medium">{t('logout')}</span>
          </Button>
        </div>
      </div>
    </aside>
  )
}
