/**
 * Image Service - Centralized image handling
 * Replaces hardcoded Unsplash URLs with production image system
 * 
 * NEVER use hardcoded image URLs in components
 * Always use this service to get image paths
 */

export const IMAGE_PATHS = {
  // Local SVG Placeholders (fallbacks for missing images)
  placeholders: {
    course: '/images/placeholders/course-default.svg',
    avatar: '/images/placeholders/avatar-default.svg',
    event: '/images/placeholders/event-default.svg',
    error: '/images/placeholders/error-default.svg',
    thumbnail: '/images/placeholders/thumbnail-default.svg',
    profile: '/images/placeholders/profile-default.svg',
  },

  // Background images
  backgrounds: {
    hero: '/images/backgrounds/hero-gradient.svg',
    section: '/images/backgrounds/section-pattern.svg',
    footer: '/images/backgrounds/footer-bg.svg',
  },

  // Brand assets
  icons: {
    logo: '/images/icons/logo.svg',
    logoDark: '/images/icons/logo-dark.svg',
    logoLight: '/images/icons/logo-light.svg',
    favicon: '/favicon.ico',
  },

  // User-uploaded content paths (these come from storage service)
  uploads: {
    courses: (courseId: string) => `/uploads/courses/${courseId}`,
    avatars: (userId: string) => `/uploads/avatars/${userId}`,
    events: (eventId: string) => `/uploads/events/${eventId}`,
    documents: (docId: string) => `/uploads/documents/${docId}`,
  },
} as const

/**
 * Image source object for type-safe image handling
 */
export interface ImageSource {
  src: string
  alt: string
  width?: number
  height?: number
  priority?: boolean
  blurPlaceholder?: string
  aspectRatio?: 'square' | 'video' | 'thumbnail' | number
}

/**
 * Get course image with fallback
 * @param courseId - Course ID
 * @param thumbnail - Course thumbnail URL (if available)
 * @param fallback - Fallback placeholder
 * @returns ImageSource object ready for Next.js Image component
 */
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
    aspectRatio: 'video',
  }
}

/**
 * Get user avatar with fallback
 * @param userId - User ID
 * @param avatar - User avatar URL (if available)
 * @param fallback - Fallback placeholder
 * @returns ImageSource object ready for Next.js Image component
 */
export function getAvatarImage(
  userId: string,
  avatar?: string,
  name?: string,
  fallback = IMAGE_PATHS.placeholders.avatar
): ImageSource {
  return {
    src: avatar || fallback,
    alt: name ? `${name}'s avatar` : 'User avatar',
    width: 96,
    height: 96,
    priority: false,
    blurPlaceholder: fallback,
    aspectRatio: 'square',
  }
}

/**
 * Get event image with fallback
 * @param eventId - Event ID
 * @param thumbnail - Event thumbnail URL (if available)
 * @param fallback - Fallback placeholder
 * @returns ImageSource object ready for Next.js Image component
 */
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
    priority: false,
    blurPlaceholder: fallback,
    aspectRatio: 'video',
  }
}

/**
 * Get small thumbnail image (16:9)
 * @param src - Image source URL
 * @param alt - Alt text
 * @param fallback - Fallback placeholder
 * @returns ImageSource object
 */
export function getThumbnailImage(
  src?: string,
  alt = 'Thumbnail',
  fallback = IMAGE_PATHS.placeholders.thumbnail
): ImageSource {
  return {
    src: src || fallback,
    alt,
    width: 320,
    height: 180,
    priority: false,
    blurPlaceholder: fallback,
    aspectRatio: 'video',
  }
}

/**
 * Get profile/cover image (full width)
 * @param src - Image source URL
 * @param alt - Alt text
 * @param fallback - Fallback placeholder
 * @returns ImageSource object
 */
export function getProfileImage(
  src?: string,
  alt = 'Profile image',
  fallback = IMAGE_PATHS.placeholders.profile
): ImageSource {
  return {
    src: src || fallback,
    alt,
    width: 1200,
    height: 600,
    priority: false,
    blurPlaceholder: fallback,
    aspectRatio: 'video',
  }
}

/**
 * Validate image URL is not a placeholder
 * @param url - Image URL to validate
 * @returns true if URL is a real image (not a placeholder)
 */
export function isRealImage(url?: string): boolean {
  if (!url) return false
  const isPlaceholder = 
    url.includes('placeholders/') ||
    url.includes('backgrounds/') ||
    url.includes('icons/')
  return !isPlaceholder
}

/**
 * Get image optimization sizes for responsive images
 * @param variant - Image variant type
 * @returns sizes attribute string for Next.js Image component
 */
export function getImageSizes(variant: 'course' | 'avatar' | 'event' | 'thumbnail' | 'profile'): string {
  const sizes: Record<string, string> = {
    course: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    avatar: '(max-width: 640px) 64px, 96px',
    event: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 600px',
    thumbnail: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px',
    profile: '100vw',
  }
  return sizes[variant] || '100vw'
}

/**
 * CRITICAL: Image error handler
 * Call this in Image component's onError handler
 * @param event - Error event from img element
 * @param fallback - Fallback image path
 */
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  fallback?: string
) {
  const img = event.currentTarget
  const fallbackSrc = fallback || IMAGE_PATHS.placeholders.thumbnail
  if (img.src !== fallbackSrc) {
    img.src = fallbackSrc
  }
}

/**
 * Recommended usage in components:
 * 
 * import Image from 'next/image'
 * import { getCourseImage, getImageSizes, handleImageError } from '@/lib/image-service'
 * 
 * export function CourseCard({ course }: { course: Course }) {
 *   const image = getCourseImage(course.id, course.thumbnail)
 *   return (
 *     <Image
 *       src={image.src}
 *       alt={image.alt}
 *       width={image.width}
 *       height={image.height}
 *       sizes={getImageSizes('course')}
 *       onError={(e) => handleImageError(e, image.blurPlaceholder)}
 *     />
 *   )
 * }
 */
