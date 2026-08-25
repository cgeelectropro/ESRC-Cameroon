'use client'

import { useState, useCallback } from 'react'
import { apiClient } from '@/lib/api-client'

interface PaymentData {
  courseId: string
  amount: number
  currency: string
  method: string
  phoneNumber?: string
}

export function usePayment() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const initiatePayment = useCallback(async (data: PaymentData) => {
    setLoading(true)
    setError(null)
    try {
      const res = await apiClient.initiatePayment(data)
      if (!res.success) {
        setError(res.error || 'Payment failed')
        return { success: false }
      }
      return { success: true, data: res.data }
    } catch (err) {
      setError('An error occurred. Please try again.')
      return { success: false }
    } finally {
      setLoading(false)
    }
  }, [])

  const openModal = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  return { initiatePayment, openModal, closeModal, isModalOpen, setIsModalOpen, loading, error }
}
