'use client'

import { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  heading: string
  subtext: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, heading, subtext, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-esrc-green-50 dark:bg-esrc-green-900/30 rounded-full flex items-center justify-center mb-4">
          <Icon size={32} className="text-esrc-green-500" />
        </div>
      )}
      <h3 className="font-display text-xl font-semibold text-esrc-dark dark:text-esrc-light mb-2">{heading}</h3>
      <p className="text-esrc-mid max-w-md mb-6">{subtext}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark">
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
