'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { getStoredToken } from '@/lib/auth-storage'

export interface AppNotification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  createdAt: string
  data?: Record<string, unknown>
}

const BACKEND_WS_URL = process.env.NEXT_PUBLIC_NESTJS_WS_URL || 'https://esrc-cameroon-backend.onrender.com'
const POLL_INTERVAL = 60_000 // 60s fallback polling

export function useNotifications(isAuthenticated: boolean) {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const socketRef = useRef<import('socket.io-client').Socket | null>(null)
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const wsConnected = useRef(false)

  const authFetch = useCallback((url: string, init: RequestInit = {}) => {
    const token = typeof window !== 'undefined' ? getStoredToken() : null
    const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init.headers as Record<string, string> || {}) }
    if (token) headers['Authorization'] = `Bearer ${token}`
    return fetch(url, { ...init, headers })
  }, [])

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await authFetch('/api/notifications?limit=20')
      if (!res.ok) return
      const json = await res.json()
      const list: AppNotification[] = Array.isArray(json.data) ? json.data : []
      setNotifications(list)
      setUnreadCount(list.filter((n) => !n.isRead).length)
    } catch {
      // Silently ignore fetch errors
    }
  }, [authFetch])

  const markRead = useCallback(async (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    setUnreadCount((c) => Math.max(0, c - 1))
    try {
      await authFetch(`/api/notifications/${id}/read`, { method: 'PATCH' })
    } catch { /* ignore */ }
  }, [authFetch])

  const markAllRead = useCallback(async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await authFetch('/api/notifications/read-all', { method: 'PATCH' })
    } catch { /* ignore */ }
  }, [authFetch])

  useEffect(() => {
    if (!isAuthenticated) return

    // Initial fetch
    fetchNotifications()

    // Try WebSocket connection
    const connectWS = async () => {
      try {
        const token = getStoredToken()
        if (!token) return

        const { io } = await import('socket.io-client')
        const socket = io(BACKEND_WS_URL, {
          path: '/socket.io',
          transports: ['websocket', 'polling'],
          auth: { token: `Bearer ${token}` },
          reconnection: true,
          reconnectionDelay: 2000,
          reconnectionAttempts: 5,
          timeout: 10000,
        })

        socket.on('connect', () => {
          wsConnected.current = true
          // Clear polling when WS is connected
          if (pollTimerRef.current) {
            clearInterval(pollTimerRef.current)
            pollTimerRef.current = null
          }
        })

        socket.on('notification', (data: AppNotification) => {
          setNotifications((prev) => [data, ...prev])
          setUnreadCount((c) => c + 1)
          toast.info(data.title, {
            description: data.body,
            duration: 5000,
          })
        })

        socket.on('disconnect', () => {
          wsConnected.current = false
          // Fall back to polling when WS disconnects
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(fetchNotifications, POLL_INTERVAL)
          }
        })

        socket.on('connect_error', () => {
          wsConnected.current = false
          // Start polling as fallback
          if (!pollTimerRef.current) {
            pollTimerRef.current = setInterval(fetchNotifications, POLL_INTERVAL)
          }
        })

        socketRef.current = socket
      } catch {
        // socket.io-client unavailable or connection failed — fall back to polling
        if (!pollTimerRef.current) {
          pollTimerRef.current = setInterval(fetchNotifications, POLL_INTERVAL)
        }
      }
    }

    connectWS()

    return () => {
      socketRef.current?.disconnect()
      socketRef.current = null
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }
  }, [isAuthenticated, fetchNotifications])

  return { notifications, unreadCount, markRead, markAllRead, refetch: fetchNotifications }
}
