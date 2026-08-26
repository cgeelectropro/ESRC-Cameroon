import { AdminGuard } from '@/components/auth/AdminGuard'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopBar } from '@/components/admin/AdminTopBar'
import { AIAssistant } from '@/components/shared/AIAssistant'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-auto">
          <AdminTopBar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
      <AIAssistant />
    </AdminGuard>
  )
}
