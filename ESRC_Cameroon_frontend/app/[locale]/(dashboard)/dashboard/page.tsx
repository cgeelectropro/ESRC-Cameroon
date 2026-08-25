'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { useAuthOptional } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { DashboardBottomNav } from '@/components/layout/DashboardBottomNav'
import { DashboardStatsSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BookOpen, Award, Target, TrendingUp, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import type { Event, Course } from '@/lib/types'

interface DashboardData {
  enrolledCourses?: number
  completedCourses?: number
  inProgressCourses?: number
  certificates?: number
  learningHours?: number
}

interface EnrolledCourse {
  id: string
  title: string
  progress: number
  courseId?: string
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const auth = useAuthOptional()
  const user = auth?.user

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [enrollments, setEnrollments] = useState<EnrolledCourse[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([])
  const [recommendedCourses, setRecommendedCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashRes, enrollRes, eventsRes] = await Promise.all([
          apiClient.getDashboard(),
          apiClient.getUserEnrollments(),
          apiClient.getEvents(),
        ])

        if (dashRes.success && dashRes.data) {
          setDashboardData(dashRes.data as DashboardData)
        }

        if (enrollRes.success && enrollRes.data) {
          const arr = Array.isArray(enrollRes.data) ? enrollRes.data : []
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setEnrollments(arr.slice(0, 3).map((e: any) => ({
            id: String(e.id ?? ''),
            courseId: String(e.course?.id ?? e.courseId ?? ''),
            title: String(e.course?.title ?? e.title ?? 'Course'),
            progress: Number(e.progressPct ?? e.progress ?? 0),
          })))
        }

        if (eventsRes.success && eventsRes.data) {
          const arr = Array.isArray(eventsRes.data) ? eventsRes.data : []
          setUpcomingEvents(arr.slice(0, 2) as Event[])
        }

        // Try AI recommendations first, fall back to top-rated courses
        try {
          const aiRecRes = await apiClient.getAIRecommendations()
          if (aiRecRes.success && Array.isArray(aiRecRes.data) && aiRecRes.data.length > 0) {
            setRecommendedCourses((aiRecRes.data as Course[]).slice(0, 3))
          } else {
            throw new Error('no AI recs')
          }
        } catch {
          const fallbackRes = await apiClient.getCourses({ limit: '3', sortBy: 'rating' })
          if (fallbackRes.success && fallbackRes.data) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const items: Course[] = (fallbackRes.data as any).items ?? (Array.isArray(fallbackRes.data) ? fallbackRes.data : [])
            setRecommendedCourses(items.slice(0, 3))
          }
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
  }, [])

  const stats = [
    {
      icon: BookOpen,
      title: t('coursesEnrolled'),
      value: loading ? '—' : String(dashboardData?.enrolledCourses ?? enrollments.length),
      color: 'text-esrc-green-700',
    },
    {
      icon: TrendingUp,
      title: t('inProgress'),
      value: loading ? '—' : String(dashboardData?.inProgressCourses ?? enrollments.filter(e => e.progress < 100).length),
      color: 'text-esrc-gold-500',
    },
    {
      icon: Award,
      title: t('certificates'),
      value: loading ? '—' : String(dashboardData?.certificates ?? 0),
      color: 'text-esrc-earth',
    },
    {
      icon: Target,
      title: t('learningHours'),
      value: loading ? '—' : String(dashboardData?.learningHours ?? 0),
      color: 'text-blue-500',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 pt-20">
        <Sidebar />

        <main className="flex-1 section-padding pb-24 lg:pb-12">
          <div className="container-width space-y-8">
            {/* Personalized greeting */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground mb-2">
                {user?.firstName ? t('greeting', { name: user.firstName }) : `${t('welcome')}!`}
              </h1>
              <p className="text-muted-foreground">{t('continueJourney')}</p>
            </div>

            {/* Stats Grid — skeleton while loading */}
            {loading ? (
              <DashboardStatsSkeleton />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <Card key={idx} className="shadow-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.title}</p>
                            <p className={`font-display text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                          </div>
                          <Icon size={28} className={`${stat.color} opacity-20`} />
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {/* Continue Learning */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="font-display">{t('continueLearning')}</CardTitle>
                <CardDescription>{t('resumeActiveCourses')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : enrollments.length > 0 ? (
                  <div className="space-y-5">
                    {enrollments.map((course) => (
                      <div key={course.id}>
                        <div className="flex items-center justify-between mb-2">
                          <Link
                            href={course.courseId ? `/dashboard/courses/${course.courseId}/learn` : '/dashboard/my-courses'}
                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
                          >
                            {course.title}
                          </Link>
                          <span className="text-sm text-muted-foreground ml-4 shrink-0">{course.progress}%</span>
                        </div>
                        <ProgressBar value={course.progress} />
                      </div>
                    ))}
                    <Link href="/dashboard/my-courses" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                      {t('viewAllCourses')} <ArrowRight size={16} />
                    </Link>
                  </div>
                ) : (
                  <EmptyState
                    heading={t('noEnrollments')}
                    subtext=""
                  />
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Upcoming Events */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display">{t('upcomingEvents')}</CardTitle>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2].map((i) => <div key={i} className="h-16 bg-muted rounded animate-pulse" />)}
                    </div>
                  ) : upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`}>
                          <div className="flex gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                            <div className="w-12 h-12 rounded-lg bg-esrc-green-100 dark:bg-esrc-green-900/30 flex flex-col items-center justify-center shrink-0">
                              <span className="text-xs font-bold text-primary">
                                {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-primary leading-none">
                                {new Date(event.date).getDate()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm line-clamp-1">{event.title}</p>
                              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                <MapPin size={12} />
                                <span className="truncate">{event.isOnline ? 'Online' : (event.location ?? '')}</span>
                              </div>
                            </div>
                            {event.isFree && (
                              <Badge className="bg-esrc-green-100 text-esrc-green-700 dark:bg-esrc-green-900/30 dark:text-esrc-green-500 shrink-0">Free</Badge>
                            )}
                          </div>
                        </Link>
                      ))}
                      <Link href="/events" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium transition-colors">
                        {t('viewAllEvents')} <ArrowRight size={16} />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">{t('noUpcomingEvents')}</p>
                  )}
                </CardContent>
              </Card>

              {/* Certificates */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display">{t('yourCertificates')}</CardTitle>
                  <CardDescription>{t('certificatesEarned')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {!loading && dashboardData?.certificates && dashboardData.certificates > 0 ? (
                    <Link href="/dashboard/certificates">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-esrc-green-50 dark:bg-esrc-green-900/20 border border-esrc-green-100 dark:border-esrc-green-900/40 hover:border-primary transition-colors">
                        <div className="flex items-center gap-3">
                          <Award className="text-esrc-green-700" size={20} />
                          <p className="font-semibold text-foreground text-sm">
                            {dashboardData.certificates !== 1 ? t('certificatesCountPlural', { count: dashboardData.certificates }) : t('certificatesCount', { count: dashboardData.certificates })}
                          </p>
                        </div>
                        <ArrowRight size={16} className="text-muted-foreground" />
                      </div>
                    </Link>
                  ) : (
                    <div className="text-center py-4">
                      <Award size={40} className="text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">{t('completeCoursesCerts')}</p>
                      <Link href="/courses">
                        <Button variant="outline" size="sm" className="mt-3">{t('exploreCourses')}</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Hub Banner */}
            <Link href="/dashboard/ai-hub">
              <div className="rounded-xl bg-gradient-to-r from-primary to-primary/70 text-primary-foreground p-5 flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="font-semibold">AI Tools Hub</p>
                    <p className="text-xs opacity-80">Summarize, translate, write cover letters, build pitches & more</p>
                  </div>
                </div>
                <ArrowRight size={20} className="opacity-80 shrink-0" />
              </div>
            </Link>

            {/* AI Recommended */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <Sparkles size={18} className="text-esrc-gold-500" />
                  {t('recommendedForYou')}
                </CardTitle>
                <CardDescription>{t('basedOnInterests')}</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}
                  </div>
                ) : recommendedCourses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {recommendedCourses.map((course) => (
                      <Link key={course.id} href={`/courses/${course.id}`}>
                        <div className="p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all cursor-pointer h-full">
                          <p className="font-semibold text-sm text-foreground line-clamp-2">{course.title}</p>
                          <div className="flex items-center gap-2 mt-2">
                            {course.level && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground capitalize">
                                {String(course.level).toLowerCase()}
                              </span>
                            )}
                            {course.isFree || course.price === 0 ? (
                              <span className="text-xs text-esrc-green-700 font-medium">Free</span>
                            ) : (
                              <span className="text-xs text-muted-foreground">{course.price} {course.currency ?? 'XAF'}</span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">{t('exploreCourses')}</p>
                    <Link href="/courses">
                      <Button variant="outline" size="sm" className="mt-3">{t('exploreCourses')}</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
      <DashboardBottomNav />
    </div>
  )
}
