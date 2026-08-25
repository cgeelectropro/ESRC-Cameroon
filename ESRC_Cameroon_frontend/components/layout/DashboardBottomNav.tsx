'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Sparkles,
  Users,
  Award,
  GraduationCap,
} from 'lucide-react'

export function DashboardBottomNav() {
  const pathname = usePathname()
  const t = useTranslations('sidebar.bottomNav')
  const { user } = useAuth()
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'instructor'

  const navItems = [
    { icon: LayoutDashboard, label: t('home'), href: '/dashboard' },
    { icon: BookOpen, label: t('courses'), href: '/dashboard/my-courses' },
    { icon: Sparkles, label: t('ai'), href: '/dashboard/ai-hub' },
    { icon: Users, label: t('advisory'), href: '/dashboard/advisory' },
    isInstructor
      ? { icon: GraduationCap, label: t('instructor'), href: '/instructor/dashboard' }
      : { icon: Award, label: t('certs'), href: '/dashboard/certificates' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-card border-t border-border safe-area-pb"
      aria-label="Dashboard navigation"
    >
      <div className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-4 py-2 rounded-lg transition-colors min-w-[64px]',
                active ? 'text-primary bg-accent dark:bg-accent' : 'text-muted-foreground hover:text-primary'
              )}
              aria-current={active ? 'page' : undefined}
            >
              <Icon size={22} aria-hidden />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
