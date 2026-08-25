'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

export function useEnrollment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enrollCourse = useCallback(async (courseId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.enrollCourse(courseId)
      if (!res.success) {
        setError(res.error || 'Enrollment failed')
        return { success: false }
      }
      return { success: true }
    } catch (err) {
      setError('An error occurred. Please try again.')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const registerEvent = useCallback(async (eventId: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.registerEvent(eventId)
      if (!res.success) {
        setError(res.error || 'Registration failed')
        return { success: false }
      }
      return { success: true }
    } catch (err) {
      setError('An error occurred. Please try again.')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  return { enrollCourse, registerEvent, loading, error }
}
