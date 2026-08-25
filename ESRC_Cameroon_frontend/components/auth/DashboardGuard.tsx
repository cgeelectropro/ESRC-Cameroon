'use client'

import { useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useAuthOptional } from '@/contexts/AuthContext'

function roleHome(role?: string | null) {
  const normalized = role?.toUpperCase()
  if (normalized === 'ADMIN') return '/admin/dashboard'
  if (normalized === 'INSTRUCTOR') return '/instructor/dashboard'
  return '/dashboard'
}

export function DashboardGuard({
  children,
  allowedRoles,
  blockedRoles,
}: {
  children: React.ReactNode
  /** Only these roles (case-insensitive) may access this route; others are redirected to their own dashboard. */
  allowedRoles?: string[]
  /** These roles (case-insensitive) are redirected away; everyone else is allowed. Ignored if allowedRoles is set. */
  blockedRoles?: string[]
}) {
  const router = useRouter()
  const auth = useAuthOptional()
  const role = auth?.user?.role?.toUpperCase()
  const normalizedAllowed = allowedRoles?.map((r) => r.toUpperCase())
  const normalizedBlocked = blockedRoles?.map((r) => r.toUpperCase())
  const isRoleAllowed = normalizedAllowed
    ? !!role && normalizedAllowed.includes(role)
    : !normalizedBlocked || !role || !normalizedBlocked.includes(role)

  useEffect(() => {
    if (auth?.isLoading) return
    if (!auth?.isAuthenticated) {
      router.replace('/login')
      return
    }
    if (!isRoleAllowed) {
      router.replace(roleHome(auth.user?.role))
    }
  }, [auth?.isAuthenticated, auth?.isLoading, auth?.user?.role, isRoleAllowed, router])

  if (auth?.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-esrc-light dark:bg-esrc-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700" />
      </div>
    )
  }

  if (!auth?.isAuthenticated || !isRoleAllowed) {
    return null
  }

  return <>{children}</>
}
