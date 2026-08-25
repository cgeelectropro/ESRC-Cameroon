import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav'
import { DashboardGuard } from '@/components/auth/DashboardGuard'
import { AIAssistant } from '@/components/shared/AIAssistant'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard blockedRoles={['INSTRUCTOR']}>
      <div className="pb-20 lg:pb-0">{children}</div>
      <DashboardBottomNav />
      <AIAssistant />
    </DashboardGuard>
  )
}
