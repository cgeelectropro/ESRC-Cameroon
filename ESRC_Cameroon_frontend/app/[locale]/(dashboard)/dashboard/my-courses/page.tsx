'use client'

import { useEffect, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { BookOpen } from 'lucide-react'

type Enrollment = { id: string; courseId: string; progress: number; progressPct: number; course: { id: string; title: string; thumbnail?: string }; totalLessons: number }

export default function MyCoursesPage() {
  const t = useTranslations('auth')
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        const res = await apiClient.getUserEnrollments()
        if (res.success && res.data) setEnrollments(Array.isArray(res.data) ? res.data : [])
      } catch {
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    fetchEnrollments()
  }, [])

  const courses = enrollments.map((e) => ({
    id: e.courseId,
    title: e.course?.title ?? 'Unknown Course',
    progress: Math.round(e.progressPct ?? e.progress ?? 0),
    status: (e.progressPct ?? e.progress ?? 0) >= 100 ? t('completed') : t('inProgress'),
  }))

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 pt-20">
        <Sidebar />

        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">
                {t('myCourses')}
              </h1>
              <p className="text-muted-foreground">
                {t('manageEnrolled')}
              </p>
            </div>

            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground mb-2">
                          {course.title}
                        </h3>
                        <div className="mb-4">
                          <ProgressBar value={course.progress} />
                          <p className="text-xs text-muted-foreground mt-2">{course.progress}{t('complete')}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <span className="text-xs font-semibold text-esrc-green-700 bg-esrc-green-50 px-3 py-1 rounded-full">
                          {course.status}
                        </span>
                        <Link href={`/dashboard/courses/${course.id}/learn`}>
                          <Button className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white">
                            {t('continueLearningBtn')}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">{t('noCoursesYet')}</p>
                <Link href="/courses">
                  <Button className="mt-4 bg-esrc-gold-500 hover:bg-esrc-gold-700 text-foreground">
                    {t('browseCourses')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
