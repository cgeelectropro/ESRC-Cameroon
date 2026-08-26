'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check, CheckCheck, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuth } from '@/contexts/AuthContext'

const TYPE_COLORS: Record<string, string> = {
  course_update: 'bg-blue-500',
  certificate: 'bg-esrc-gold-500',
  INSTRUCTOR_APPROVED: 'bg-green-500',
  INSTRUCTOR_REJECTED: 'bg-red-500',
  NEW_INSTRUCTOR_REQUEST: 'bg-purple-500',
  event_registration: 'bg-cyan-500',
  advisory_booking: 'bg-indigo-500',
  payment_confirmed: 'bg-green-600',
  forum_reply: 'bg-orange-500',
  course_review: 'bg-yellow-500',
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export function NotificationBell({ overHero = false, openDirection = 'down' }: { overHero?: boolean; openDirection?: 'down' | 'up' }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const isAuthenticated = !!user

  const { notifications, unreadCount, markRead, markAllRead } = useNotifications(isAuthenticated)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const handleMarkAllRead = async () => {
    setLoading(true)
    await markAllRead()
    setLoading(false)
  }

  const iconClass = overHero ? 'text-white' : 'text-foreground'
  const hoverClass = overHero ? 'hover:bg-white/10' : 'hover:bg-accent'

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn('relative p-2 rounded-lg transition-colors', hoverClass)}
        aria-label="Notifications"
      >
        <Bell size={20} className={iconClass} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            'absolute right-0 w-[360px] max-w-[calc(100vw-32px)] bg-popover text-popover-foreground rounded-xl shadow-2xl border border-border z-50 overflow-hidden animate-in fade-in duration-150',
            openDirection === 'up' ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'top-full mt-2 slide-in-from-top-2',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-primary" />
              <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors px-2 py-1 rounded hover:bg-accent"
                  title="Mark all as read"
                >
                  <CheckCheck size={13} />
                  <span>All read</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell size={32} className="mx-auto text-muted-foreground/40 mb-3" />
                <p className="text-sm text-muted-foreground">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'flex gap-3 px-4 py-3 transition-colors hover:bg-accent/50 cursor-default',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  {/* Color dot */}
                  <div className="mt-1 shrink-0">
                    <span
                      className={cn(
                        'inline-block w-2 h-2 rounded-full',
                        TYPE_COLORS[n.type] || 'bg-primary',
                        n.isRead && 'opacity-40'
                      )}
                    />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={cn('text-sm font-medium leading-snug', n.isRead ? 'text-muted-foreground' : 'text-foreground')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug line-clamp-2">{n.body}</p>
                    <p className="text-[11px] text-muted-foreground/60 mt-1">{timeAgo(n.createdAt)}</p>
                  </div>
                  {/* Mark read */}
                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markRead(n.id)}
                      className="shrink-0 mt-1 p-1 rounded hover:bg-accent text-primary/60 hover:text-primary transition-colors"
                      title="Mark as read"
                    >
                      <Check size={13} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
