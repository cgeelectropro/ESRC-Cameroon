'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useAuthOptional } from '@/contexts/AuthContext'
import { Shield } from 'lucide-react'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const auth = useAuthOptional()

  useEffect(() => {
    if (auth?.isLoading) return
    if (!auth?.isAuthenticated) {
      router.replace('/login')
      return
    }
    if (auth.user?.role !== 'admin' && auth.user?.role !== 'ADMIN') {
      router.replace('/dashboard')
    }
  }, [auth?.isAuthenticated, auth?.isLoading, auth?.user?.role, router])

  if (auth?.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    )
  }

  const role = auth?.user?.role
  if (!auth?.isAuthenticated || (role !== 'admin' && role !== 'ADMIN')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Access restricted</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
