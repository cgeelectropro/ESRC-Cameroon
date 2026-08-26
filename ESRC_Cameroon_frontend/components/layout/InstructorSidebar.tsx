'use client'

import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { LayoutDashboard, BookOpen, BarChart3, DollarSign, CalendarClock, ArrowLeft } from 'lucide-react'

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/instructor/dashboard' },
  { icon: BookOpen, label: 'Courses', href: '/instructor/courses' },
  { icon: CalendarClock, label: 'Sessions', href: '/instructor/sessions' },
  { icon: BarChart3, label: 'Analytics', href: '/instructor/analytics' },
  { icon: DollarSign, label: 'Revenue', href: '/instructor/revenue' },
]

export function InstructorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:block w-64 bg-card sidebar-panel">
      <div className="sticky top-0 flex flex-col h-screen">
        <nav className="flex-1 overflow-y-auto p-6 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <ArrowLeft size={16} />
            Back to Learner
          </Link>
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    'w-full justify-start gap-3 px-4 py-2.5 rounded-lg',
                    active ? 'bg-accent text-primary dark:bg-accent dark:text-primary' : 'text-muted-foreground hover:bg-accent dark:hover:bg-accent/50'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Button>
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-border p-4">
          <div className="flex items-center justify-between px-2">
            <span className="text-sm text-muted-foreground font-medium">Notifications</span>
            <NotificationBell />
          </div>
        </div>
      </div>
    </aside>
  )
}
