'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import type { Course } from '@/lib/types'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { CourseGrid } from '@/components/courses/CourseGrid'
import { CourseFilters } from '@/components/courses/CourseFilters'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Search, SlidersHorizontal } from 'lucide-react'

export default function CoursesPage() {
  const t = useTranslations('courses')
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await apiClient.getCourses({ limit: '100' })
        if (res.success && res.data) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = res.data as any
          setCourses(Array.isArray(raw) ? raw : (raw?.items ?? []))
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [])

  const filteredCourses = courses.filter((course: Course) => {
    const matchCategory = selectedCategory === 'all' || course.category === selectedCategory
    const matchLevel = selectedLevel === 'all' || course.level === selectedLevel
    const matchSearch = !searchQuery || course.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCategory && matchLevel && matchSearch
  })

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <PageHero title={t('title')} subtitle={t('subtitle')} imageKey="courses">
          {/* Search Bar */}
          <div className="flex gap-2 max-w-md mt-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="btn-gold">
              {t('search')}
            </Button>
          </div>
      </PageHero>

      <main className="flex-grow section-padding">
        <div className="container-width grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - hidden on mobile, shown in bottom sheet */}
          <div className="hidden lg:block lg:col-span-1">
            <CourseFilters
              selectedCategory={selectedCategory}
              selectedLevel={selectedLevel}
              onCategoryChange={setSelectedCategory}
              onLevelChange={setSelectedLevel}
            />
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
<div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-muted-foreground">
                  {t('showing')} {filteredCourses.length} {filteredCourses.length === 1 ? t('course') : t('coursesCount')}
                </p>
                <Drawer direction="bottom">
                  <DrawerTrigger asChild>
                    <Button variant="outline" className="lg:hidden">
                      <SlidersHorizontal size={18} className="mr-2" />
                      {t('filters')}
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <DrawerHeader className="flex flex-row items-center justify-between">
                      <DrawerTitle>{t('filterCourses')}</DrawerTitle>
                      <DrawerClose asChild>
                        <Button variant="ghost" size="sm">{t('close')}</Button>
                      </DrawerClose>
                    </DrawerHeader>
                    <div className="px-4 pb-8 max-h-[70vh] overflow-y-auto">
                      <CourseFilters
                        selectedCategory={selectedCategory}
                        selectedLevel={selectedLevel}
                        onCategoryChange={setSelectedCategory}
                        onLevelChange={setSelectedLevel}
                      />
                    </div>
                  </DrawerContent>
                </Drawer>
              </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : filteredCourses.length > 0 ? (
              <CourseGrid courses={filteredCourses} />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">{t('noCoursesFound')}</p>
                <Button
                  onClick={() => {
                    setSelectedCategory('all')
                    setSelectedLevel('all')
                    setSearchQuery('')
                  }}
                  variant="outline"
                  className="mt-4"
                >
                  {t('resetFilters')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
