# ESRC Cameroon - Production Component Implementation Guide

**Purpose**: Step-by-step implementation of production-grade components  
**Status**: Ready to Deploy  
**Last Updated**: March 6, 2026

---

## Quick Start: Top 5 Priority Implementations

### 1. Create Design System Tokens File

**File**: `lib/design-system.ts`

This is the single source of truth for all design values. Use in components via TypeScript imports.

```typescript
/**
 * ESRC Cameroon Design System Tokens
 * Single source of truth for all design values
 * Import and use in components
 */

export const COLORS = {
  // Primary Brand Colors
  brand: {
    900: '#1B5E20',   // Dark green
    800: '#166534',
    700: '#2E7D32',   // Primary button color
    600: '#388E3C',
    500: '#4CAF50',   // Accent green
    100: '#E8F5E9',
    50: '#F1F8E9',
  },

  // Call-to-Action Gold
  accent: {
    900: '#F57F17',
    700: '#F57F17',   // Gold hover
    600: '#F67C0F',
    500: '#F9A825',   // Primary gold
    400: '#FBC02D',
    100: '#FFFDE7',
  },

  // Earth/Brown (Trust)
  earth: {
    900: '#6D4C41',
    700: '#795548',
    500: '#A1887F',
    100: '#EFEBE9',
  },

  // Semantic Colors
  semantic: {
    success: '#4CAF50',      // Green
    warning: '#FF9800',      // Orange
    danger: '#F44336',       // Red
    error: '#DC2626',        // Deep red
    info: '#2196F3',         // Blue
  },

  // Neutral Grays
  neutral: {
    900: '#1A1A1A',   // Dark text
    800: '#2E2E2E',
    700: '#404040',   // Body text
    600: '#555555',   // Secondary text (mid)
    500: '#757575',
    400: '#9E9E9E',
    300: '#BDBDBD',   // Light borders
    200: '#E0E0E0',   // Lighter borders
    100: '#F5F5F5',   // Light backgrounds
    50: '#FAFAFA',    // Very light
  },

  // Legacy (backward compatibility)
  dark: '#1A1A1A',
  mid: '#555555',
  light: '#F5F5F5',
} as const

export const TYPOGRAPHY = {
  fonts: {
    display: 'var(--font-display), serif',    // Playfair Display
    body: 'var(--font-body), sans-serif',     // DM Sans
  },

  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
  },

  weights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const

export const SPACING = {
  0: '0px',
  1: '0.25rem',    // 4px
  2: '0.5rem',     // 8px
  3: '0.75rem',    // 12px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  8: '2rem',       // 32px
  10: '2.5rem',    // 40px
  12: '3rem',      // 48px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  32: '8rem',      // 128px

  section: '3rem',      // Between sections (48px)
  container: '2rem',    // Inside containers (32px)
  component: '1rem',    // Inside components (16px)
  gap: '1rem',          // Gap between items (16px)
} as const

export const RADIUS = {
  none: '0px',
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '0.75rem',    // 12px
  lg: '1rem',       // 16px
  xl: '1.5rem',     // 24px
  full: '9999px',   // Pill/circle
} as const

export const SHADOWS = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.15)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',

  brand: {
    light: '0 2px 8px rgba(27, 94, 32, 0.12)',
    medium: '0 4px 12px rgba(27, 94, 32, 0.15)',
    dark: '0 8px 24px rgba(27, 94, 32, 0.2)',
  },
} as const

export const TRANSITIONS = {
  fast: '150ms',
  base: '200ms',
  slow: '300ms',
  slowest: '500ms',

  easing: {
    linear: 'linear',
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
} as const
```

### 2. Update CourseCard Component (Production-Grade)

**File**: `components/courses/CourseCard.tsx`

```typescript
'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { Clock, Users, Star } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import type { Course } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { COLORS, SPACING, RADIUS, SHADOWS, TRANSITIONS } from '@/lib/design-system'

interface CourseCardProps {
  course: Course
  isLoading?: boolean
  onEnroll?: (courseId: string) => void | Promise<void>
}

export function CourseCard({
  course,
  isLoading = false,
  onEnroll,
}: CourseCardProps) {
  const t = useTranslations('courses')

  if (isLoading) {
    return <CourseCardSkeleton />
  }

  const instructorName =
    typeof course.instructor === 'string'
      ? course.instructor
      : course.instructor.name

  return (
    <article
      className={cn(
        // Base styles
        'bg-card rounded-[0.75rem] overflow-hidden',
        'border border-[#E5E7EB] dark:border-[#404040]',
        // Hover state
        'hover:shadow-lg transition-shadow duration-200',
        // Flex layout
        'flex flex-col h-full',
        // Cursor
        'cursor-pointer'
      )}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-video bg-neutral-100 dark:bg-neutral-800 overflow-hidden group">
        <Image
          src={course.thumbnail || '/images/placeholders/course-default.svg'}
          alt={course.title}
          fill
          className={cn(
            'object-cover',
            'group-hover:scale-105',
            'transition-transform duration-300'
          )}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={false}
          onError={(e) => {
            e.currentTarget.src = '/images/placeholders/course-default.svg'
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              'inline-block px-3 py-1 rounded-full',
              'text-xs font-semibold',
              'bg-esrc-green-700 text-white'
            )}
          >
            {course.category}
          </span>
        </div>

        {/* Free Badge */}
        {course.isFree && (
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'inline-block px-2 py-1',
                'text-xs font-bold rounded',
                'bg-esrc-gold-500 text-esrc-dark'
              )}
            >
              {t('free')}
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow space-y-3">
        {/* Header */}
        <div>
          <h3
            className={cn(
              'font-display font-semibold text-lg',
              'line-clamp-2 text-foreground'
            )}
          >
            {course.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {instructorName}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={cn(
                  i < Math.round(course.rating)
                    ? 'fill-esrc-gold-500 text-esrc-gold-500'
                    : 'text-muted-foreground'
                )}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-foreground">
            {course.rating.toFixed(1)}
          </span>
          <span className="text-xs text-muted-foreground">
            ({course.reviewCount})
          </span>
        </div>

        {/* Metadata */}
        <div className="flex gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={14} />
            <span>{course.students.toLocaleString()}</span>
          </div>
        </div>

        {/* Level Badge */}
        <div>
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded inline-block',
              course.level === 'Beginner' && 'bg-green-100 text-green-800',
              course.level === 'Intermediate' && 'bg-yellow-100 text-yellow-800',
              course.level === 'Advanced' && 'bg-red-100 text-red-800'
            )}
          >
            {course.level}
          </span>
        </div>

        {/* Price */}
        <div className="text-lg font-bold text-esrc-green-700 dark:text-esrc-green-500 mt-auto">
          {course.isFree ? 'Free' : `$${course.price}`}
        </div>

        {/* CTA Button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onEnroll?.(course.id)
          }}
          className={cn(
            'w-full px-4 py-2.5 rounded-md',
            'font-medium text-sm',
            'bg-esrc-green-700 text-white',
            'hover:bg-esrc-green-800',
            'active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-esrc-gold-500',
            'transition-all duration-200'
          )}
          aria-label={`Enroll in ${course.title}`}
        >
          Enroll Now
        </button>
      </div>
    </article>
  )
}

// Loading Skeleton
function CourseCardSkeleton() {
  return (
    <div className="bg-card rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
      <Skeleton className="w-full aspect-video" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  )
}
```

### 3. Create Error Boundary Component

**File**: `components/ErrorBoundary.tsx`

```typescript
'use client'

import { Component, ReactNode } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, retry: () => void) => ReactNode
  onError?: (error: Error) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
    console.error('Error boundary caught:', error)
  }

  retry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback?.(this.state.error!, this.retry) || (
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
                Something went wrong
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
```

### 4. Create Skeleton Loader Component

**File**: `components/ui/skeleton.tsx`

```typescript
import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md',
        'bg-neutral-200 dark:bg-neutral-700',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }

// Usage example
export function CourseGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}
```

### 5. Create Image Service

**File**: `lib/image-service.ts`

```typescript
/**
 * Image Service - Centralized image handling
 * Replaces hardcoded Unsplash URLs with production image system
 */

export const IMAGE_PATHS = {
  // Placeholders (local SVGs)
  placeholders: {
    course: '/images/placeholders/course-default.svg',
    avatar: '/images/placeholders/avatar-default.svg',
    event: '/images/placeholders/event-default.svg',
    error: '/images/placeholders/error-default.svg',
  },

  // Backgrounds
  backgrounds: {
    hero: '/images/backgrounds/hero-gradient.svg',
    section: '/images/backgrounds/section-pattern.svg',
    footer: '/images/backgrounds/footer-bg.svg',
  },

  // Icons
  icons: {
    logo: '/images/icons/logo.svg',
    logoDark: '/images/icons/logo-dark.svg',
    logoLight: '/images/icons/logo-light.svg',
  },

  // Uploaded content
  uploads: {
    courses: (courseId: string) => `/images/uploads/courses/${courseId}.webp`,
    avatars: (userId: string) => `/images/uploads/avatars/${userId}.webp`,
    events: (eventId: string) => `/images/uploads/events/${eventId}.webp`,
  },
} as const

export interface ImageSource {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  blurPlaceholder?: string
}

export function getCourseImage(
  courseId: string,
  thumbnail?: string,
  fallback = IMAGE_PATHS.placeholders.course
): ImageSource {
  return {
    src: thumbnail || fallback,
    alt: 'Course thumbnail',
    width: 400,
    height: 300,
    priority: false,
    blurPlaceholder: fallback,
  }
}

export function getAvatarImage(
  userId: string,
  avatar?: string,
  fallback = IMAGE_PATHS.placeholders.avatar
): ImageSource {
  return {
    src: avatar || fallback,
    alt: 'User avatar',
    width: 96,
    height: 96,
    blurPlaceholder: fallback,
  }
}

export function getEventImage(
  eventId: string,
  thumbnail?: string,
  fallback = IMAGE_PATHS.placeholders.event
): ImageSource {
  return {
    src: thumbnail || fallback,
    alt: 'Event image',
    width: 600,
    height: 300,
    blurPlaceholder: fallback,
  }
}
```

---

## Component Implementation Checklist

For each component, ensure:

- [ ] **States**: default, hover, focus, disabled, loading, error
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Responsive**: works on 320px, 768px, 1024px, 1440px
- [ ] **Dark mode**: has dark mode color variants
- [ ] **Loading states**: shows skeleton or spinner
- [ ] **Error states**: handles errors gracefully
- [ ] **Types**: full TypeScript coverage, no `any`
- [ ] **Docs**: clear prop documentation
- [ ] **Tests**: unit tests for logic
- [ ] **Performance**: optimized renders, proper memoization

---

## Next Steps

1. ✅ Create `lib/design-system.ts`
2. ✅ Update `components/courses/CourseCard.tsx`
3. ✅ Add `ErrorBoundary.tsx`
4. ✅ Create `lib/image-service.ts`
5. ⏳ Apply to all other components
6. ⏳ Add Storybook stories (optional)
7. ⏳ Performance audit
8. ⏳ A11y testing
9. ⏳ Production deployment

---

**Ready to implement?** Start with Step 1 and reference this guide for each component.
