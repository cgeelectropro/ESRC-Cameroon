import { DashboardGuard } from '@/components/auth/DashboardGuard'
import { AIAssistant } from '@/components/shared/AIAssistant'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardGuard allowedRoles={['INSTRUCTOR']}>
      {children}
      <AIAssistant />
    </DashboardGuard>
  )
}
