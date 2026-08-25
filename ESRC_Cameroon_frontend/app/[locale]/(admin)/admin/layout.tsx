import { AdminGuard } from '@/components/auth/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AIAssistant } from '@/components/shared/AIAssistant'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
      <AIAssistant />
    </AdminGuard>
  )
}
