'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

type InstructorCourse = { id: string; title: string; sections: Array<{ id: string; lessons: unknown[] }>; isPublished?: boolean }

export default function InstructorCoursesPage() {
  const locale = useLocale()
  const t = useTranslations('instructorCourses')
  const [courses, setCourses] = useState<InstructorCourse[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getInstructorCourses().then((res) => {
      setLoading(false)
      if (res.success && Array.isArray(res.data)) setCourses(res.data as InstructorCourse[])
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <InstructorSidebar />
        <main className="flex-1 section-padding pb-28">
          <div className="container-width">
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-display text-4xl text-esrc-green-900">{t('title')}</h1>
              <Link href={`/${locale}/instructor/courses/new`}>
                <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark">
                  <Plus size={18} className="mr-2" />
                  {t('createCourse')}
                </Button>
              </Link>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={32} className="animate-spin text-esrc-green-600" />
              </div>
            )}
            {!loading && (
              <div className="space-y-4">
                {courses.map((c) => {
                  const lessonCount = c.sections?.reduce((sum, s) => sum + (s.lessons?.length ?? 0), 0) ?? 0
                  return (
                    <Card key={c.id}>
                      <CardContent className="pt-6 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-foreground">{c.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {c.sections?.length ?? 0} {t('sections')} • {lessonCount} {t('lessons')}
                            {' • '}{c.isPublished ? t('published') : t('draft')}
                          </p>
                        </div>
                        <Link href={`/${locale}/instructor/courses/${c.id}/edit`}>
                          <Button variant="outline">{t('edit')}</Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
            {!loading && courses.length === 0 && (
              <p className="text-center text-muted-foreground py-8">{t('noCoursesYet')}</p>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
