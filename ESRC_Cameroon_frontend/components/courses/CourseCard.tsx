'use client'

import { useTranslations } from 'next-intl'
import { Clock, Users } from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import type { Course } from '@/lib/types'
import { RatingStars } from '@/components/shared/RatingStars'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getCourseImage, getImageSizes, handleImageError } from '@/lib/image-service'

interface CourseCardProps {
  course: Course
}

export function CourseCard({ course }: CourseCardProps) {
  const t = useTranslations('courses')
  const thumbnail = course.thumbnail || (course as { image?: string }).image
  const instructorName = typeof course.instructor === 'string' ? course.instructor : course.instructor?.name ?? ''
  const reviewCount = course.reviewCount ?? (course as { reviews?: number }).reviews ?? 0
  const students = course.students ?? (course as { studentCount?: number }).studentCount ?? 0
  const rating = course.rating ?? (course as { avgRating?: number }).avgRating ?? 0
  const duration = course.duration ?? (course as { totalDuration?: number }).totalDuration
  const imageData = getCourseImage(course.id, thumbnail)

  return (
    <Link href={`/courses/${course.id}`}>
      <div className="card-hover rounded-xl bg-card overflow-hidden h-full flex flex-col cursor-pointer">
        {/* Thumbnail */}
        <div className="relative w-full h-48 bg-muted overflow-hidden">
          <Image
            src={imageData.src}
            alt={imageData.alt}
            fill
            sizes={getImageSizes('course')}
            className="object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => handleImageError(e, imageData.blurPlaceholder)}
          />
          <div className="absolute top-3 left-3">
            <div className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
              {course.category}
            </div>
          </div>
          {(course.isFree ?? course.price === 0) && (
            <div className="absolute top-3 right-3">
              <div className="bg-esrc-gold-500 text-esrc-dark text-xs font-bold px-2 py-1 rounded">
                {t('free')}
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Title */}
          <h3 className="font-display font-semibold text-base mb-2 line-clamp-2 text-foreground">
            {course.title}
          </h3>

          {/* Instructor */}
          <div className="mb-3 pb-3 border-b border-border">
            <p className="text-xs font-medium text-foreground line-clamp-1">{instructorName}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-3">
            <RatingStars rating={rating} size={14} />
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>

          {/* Duration & Level */}
          <div className="flex gap-3 mb-4 text-xs text-muted-foreground">
            {duration != null && (
              <div className="flex items-center gap-1">
                <Clock size={14} />
                <span>{typeof duration === 'number' ? `${duration} min` : duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{students.toLocaleString()}</span>
            </div>
          </div>

          {/* Level Badge */}
          <div className="mb-4">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              course.level === 'Beginner' || course.level === 'BEGINNER'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : course.level === 'Intermediate' || course.level === 'INTERMEDIATE'
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
            }`}>
              {course.level?.charAt(0) + (course.level?.slice(1).toLowerCase() ?? '')}
            </span>
          </div>

          {/* Footer */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-border">
            <div>
              {!course.isFree && course.price > 0 && (
                <p className="text-lg font-bold text-primary">
                  {course.price.toLocaleString()} <span className="text-xs">{course.currency}</span>
                </p>
              )}
            </div>
            <span className={cn(buttonVariants({ variant: 'primary' }), 'text-sm py-2 px-3 inline-block')}>
              {t('enroll')}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
