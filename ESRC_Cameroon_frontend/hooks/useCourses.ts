'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'
import type { Course } from '@/lib/types'

export function useCourses(params?: Record<string, string>) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const res = await apiClient.getCourses(params)
      if (res.success) {
        const data = res.data
        setCourses(Array.isArray(data) ? data : (res as { courses?: Course[] }).courses ?? [])
      }
    } catch {
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [params?.category, params?.level, params?.search])

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  return { courses, loading, refetch: fetchCourses }
}
