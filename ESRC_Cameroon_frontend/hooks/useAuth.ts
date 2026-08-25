'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { User } from '@/lib/types'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchSession = useCallback(async () => {
    try {
      const res = await apiClient.getSession()
      if (res.success && res.data) {
        setUser(res.data as User)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSession()
  }, [fetchSession])

  const login = async (email: string, password: string) => {
    const res = await apiClient.login(email, password)
    if (res.success && res.data) {
      setUser((res as { user?: User }).user ?? null)
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  const logout = async () => {
    await apiClient.logout()
    setUser(null)
  }

  const register = async (data: object) => {
    const res = await apiClient.register(data)
    if (res.success && res.data) {
      setUser((res as { user?: User }).user ?? null)
      return { success: true }
    }
    return { success: false, error: res.error }
  }

  return { user, loading, login, logout, register, refetch: fetchSession }
}
