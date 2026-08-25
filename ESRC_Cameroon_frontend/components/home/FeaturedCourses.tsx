'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { ArrowRight, Loader, BookOpen } from 'lucide-react'
import { CourseCard } from '@/components/courses/CourseCard'
import { apiClient } from '@/lib/api-client'
import type { Course, CourseCategoryDef } from '@/lib/types'

export function FeaturedCourses() {
  const t = useTranslations('featured')
  const locale = useLocale()
  const [courses, setCourses] = useState<Course[]>([])
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    Promise.all([
      apiClient.getCourses(),
      apiClient.getCourseCategories(),
    ]).then(([coursesRes, catsRes]) => {
      if (coursesRes.success && coursesRes.data) {
        const arr = Array.isArray(coursesRes.data) ? coursesRes.data : (coursesRes as { courses?: Course[] }).courses
        setCourses(arr || [])
      }
      if (catsRes.success && Array.isArray(catsRes.data)) {
        setCategories(catsRes.data as CourseCategoryDef[])
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const filteredCourses = selectedCategory === 'all'
    ? courses
    : courses.filter((course) => course.category === selectedCategory)

  const displayCourses = filteredCourses.slice(0, 6)

  return (
    <section className="section-padding bg-muted dark:bg-background">
      <div className="container-width">
        {/* Header */}
        <div className="mb-12">
          <div className="w-10 h-1 bg-esrc-gold-500 rounded-full mb-3" />
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('title')}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('subtitle')}
          </p>
        </div>

        {/* Category Filter — only show when there are courses */}
        {courses.length > 0 && categories.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                selectedCategory === 'all'
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-card border-2 border-border text-primary hover:border-primary'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap text-sm md:text-base ${
                  selectedCategory === cat.slug
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-card border-2 border-border text-primary hover:border-primary'
                }`}
              >
                {locale === 'fr' ? cat.nameFr : cat.nameEn}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader className="animate-spin text-primary" size={40} />
          </div>
        ) : displayCourses.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-medium">Courses coming soon</p>
            <p className="text-muted-foreground text-sm mt-1">Our instructors are preparing amazing content for you.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {displayCourses.map((course, index) => (
                <div
                  key={course.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                {t('viewAll')} <ArrowRight size={20} />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
