'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
  level?: 'page' | 'section' | 'component'
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorCount: number
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null, errorCount: 0 }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    this.setState(prev => ({ errorCount: prev.errorCount + 1 }))
    this.props.onError?.(error)
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Error boundary caught:', error)
      // TODO: Send to error tracking service (Sentry, etc.)
    }
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError && this.state.error) {
      // Too many errors - show critical error
      if (this.state.errorCount > 3) {
        return (
          <div className={cn(
            'flex items-start gap-4 p-6',
            'bg-red-50 dark:bg-red-950',
            'border border-red-200 dark:border-red-800',
            'rounded-lg'
          )}>
            <AlertCircle
              className="text-red-600 dark:text-red-400 mt-1 flex-shrink-0"
              size={24}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                Critical Error
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                Multiple errors detected. Please refresh the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  'mt-3 px-4 py-2 text-sm font-medium',
                  'bg-red-600 text-white rounded-md',
                  'hover:bg-red-700 active:scale-95',
                  'transition-all duration-200',
                  'flex items-center gap-2'
                )}
              >
                <RotateCw size={16} />
                Refresh Page
              </button>
            </div>
          </div>
        )
      }

      return (
        this.props.fallback?.(this.state.error, this.retry) || (
          <div className={cn(
            'flex items-start gap-4 p-6',
            'bg-red-50 dark:bg-red-950',
            'border border-red-200 dark:border-red-800',
            'rounded-lg',
            this.props.level === 'page' && 'max-w-md mx-auto mt-12',
            this.props.level === 'section' && 'my-6',
          )}>
            <AlertCircle
              className="text-red-600 dark:text-red-400 mt-1 flex-shrink-0"
              size={24}
            />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                {this.props.level === 'page' ? 'Page Error' : 'Something went wrong'}
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={this.retry}
                className={cn(
                  'mt-3 px-4 py-2 text-sm font-medium',
                  'bg-red-600 text-white rounded-md',
                  'hover:bg-red-700 active:scale-95',
                  'transition-all duration-200',
                  'flex items-center gap-2'
                )}
              >
                <RotateCw size={16} />
                Try again
              </button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
