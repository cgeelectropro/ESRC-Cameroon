'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { useAuthOptional } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RatingStars } from '@/components/shared/RatingStars'
import { PaymentModal } from '@/components/shared/PaymentModal'
import { PlayCircle, Clock, Users, AlertCircle, Star } from 'lucide-react'

// Keeps recharts (a large dependency) out of this route's main bundle —
// it's only needed once the rating-breakdown card actually renders.
const RatingBreakdownChart = dynamic(
  () => import('@/components/shared/RatingBreakdownChart').then((m) => m.RatingBreakdownChart),
  { ssr: false, loading: () => <div className="h-48 w-full animate-pulse bg-muted rounded" /> }
)
import type { Course, Review, CourseCategoryDef } from '@/lib/types'

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const auth = useAuthOptional()
  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)
  const [enrollmentStatus, setEnrollmentStatus] = useState<{ isEnrolled: boolean; progress?: number } | null>(null)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await apiClient.getCourse(courseId)
        if (res.success && res.data) {
          const c = (res.data as { course?: Course }).course ?? (res.data as Course)
          setCourse(c)
        }
      } catch (error) {
        console.error('Failed to fetch course:', error)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
      apiClient.getCourseReviews(courseId).then((r) => {
        if (r.success && r.data) setReviews(r.data as Review[])
      })
      apiClient.getCourseCategories().then((r) => {
        if (r.success && Array.isArray(r.data)) {
          const map: Record<string, string> = {}
          ;(r.data as CourseCategoryDef[]).forEach((c) => { map[c.slug] = c.nameEn })
          setCategoryMap(map)
        }
      }).catch(() => {})
    }
  }, [courseId])

  useEffect(() => {
    const checkEnrollment = async () => {
      if (!auth?.isAuthenticated || !courseId) return
      try {
        const res = await apiClient.getCourseProgress(courseId)
        if (res.success && res.data) {
          setEnrollmentStatus({ isEnrolled: true, progress: (res.data as { progress?: number }).progress })
        } else {
          setEnrollmentStatus({ isEnrolled: false })
        }
      } catch {
        setEnrollmentStatus({ isEnrolled: false })
      }
    }
    checkEnrollment()
  }, [auth?.isAuthenticated, courseId])

  const doEnroll = async () => {
    setEnrolling(true)
    try {
      const res = await apiClient.enrollCourse(courseId)
      if (res.success) {
        setEnrollmentStatus({ isEnrolled: true, progress: 0 })
        router.push(`/dashboard/courses/${courseId}/learn`)
      } else {
        alert(res.error || 'Failed to enroll. Please try again.')
      }
    } catch (error) {
      console.error('Failed to enroll:', error)
      alert('Failed to enroll. Please try again.')
    } finally {
      setEnrolling(false)
    }
  }

  const handleEnroll = () => {
    if (!auth?.isAuthenticated) {
      router.push(`/login?redirect=/courses/${courseId}`)
      return
    }
    if (course?.isFree || course?.price === 0) {
      doEnroll()
    } else {
      setPaymentModalOpen(true)
    }
  }

  const handlePaymentSuccess = () => {
    doEnroll()
  }

  const goToLearn = () => {
    router.push(`/dashboard/courses/${courseId}/learn`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto text-muted-foreground mb-4" />
            <h1 className="text-2xl font-display text-foreground mb-2">Course Not Found</h1>
            <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-esrc-green-900 via-esrc-green-700 to-esrc-green-500 text-white py-12 dark:from-esrc-green-900 dark:via-esrc-green-800 dark:to-esrc-green-700">
          <div className="container-width section-padding">
            <Badge variant="outline" className="mb-4">
              {categoryMap[course.category] ?? course.category}
            </Badge>
            <h1 className="font-display text-4xl md:text-5xl mb-4 text-balance">
              {course.title}
            </h1>
            <p className="text-lg text-white/90 mb-6 max-w-2xl">
              {course.description}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <RatingStars rating={course.rating} />
                <span>({course.reviewCount} reviews)</span>
              </div>
              <div className="flex items-center gap-2">
                <Users size={18} />
                <span>{(course.students ?? 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} />
                <span>{course.duration}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="section-padding">
          <div className="container-width grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Rating Breakdown */}
              {course.ratingBreakdown && Object.keys(course.ratingBreakdown).length > 0 && (
                <Card className="shadow-sm bg-card border-0">
                  <CardHeader>
                    <CardTitle className="font-display">Rating Breakdown</CardTitle>
                    <CardDescription>Distribution of reviews by star rating</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RatingBreakdownChart ratingBreakdown={course.ratingBreakdown} />
                  </CardContent>
                </Card>
              )}

              {/* Instructor */}
              <Card className="shadow-sm bg-card border-0">
                <CardHeader>
                  <CardTitle className="font-display">Instructor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    <img
                      src={course.instructor.avatar || '/images/avatar-placeholder.png'}
                      alt={course.instructor.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.instructor.name)}&background=1B5E20&color=fff` }}
                    />
                    <div>
                      <h3 className="font-semibold text-foreground">{course.instructor.name}</h3>
                      <p className="text-sm text-gray-600">{course.instructor.title}</p>
                      {course.instructor.organization && (
                        <p className="text-sm text-gray-600">{course.instructor.organization}</p>
                      )}
                      <div className="mt-2 text-xs text-gray-500">
                        {course.instructor.rating} rating • {(course.instructor.students ?? 0).toLocaleString()} students •{' '}
                        {course.instructor.courses} courses
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What You'll Learn */}
              <Card className="shadow-sm bg-card border-0">
                <CardHeader>
                  <CardTitle className="font-display">What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.outcomes.map((outcome, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-esrc-green-500 font-bold">✓</span>
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Curriculum */}
              <Card className="shadow-sm bg-card border-0">
                <CardHeader>
                  <CardTitle className="font-display">Course Content</CardTitle>
                  <CardDescription>
                    {course.curriculum.length} sections
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {course.curriculum.map((section, sectionIdx) => (
                    <div key={sectionIdx}>
                      <h3 className="text-sm font-semibold text-foreground mb-2">{section.title}</h3>
                      <div className="space-y-1 ml-4">
                        {section.lessons.map((lesson, lessonIdx) => (
                          <div key={lessonIdx} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <PlayCircle size={16} className="text-esrc-green-500" />
                            <span>{lesson.title}</span>
                            {lesson.duration && <span className="text-xs text-muted-foreground">({lesson.duration})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Requirements */}
              <Card className="shadow-sm bg-card border-0">
                <CardHeader>
                  <CardTitle className="font-display">Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.requirements.map((req, idx) => (
                      <li key={idx} className="flex gap-3 text-sm">
                        <span className="text-muted-foreground">•</span>
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              {/* Student Reviews */}
              {reviews.length > 0 && (
                <Card className="shadow-sm bg-card border-0">
                  <CardHeader>
                    <CardTitle className="font-display">Student Reviews</CardTitle>
                    <CardDescription>
                      {reviews.length} review{reviews.length !== 1 ? 's' : ''} • Average{' '}
                      {(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)} / 5
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {reviews.slice(0, 6).map((review) => (
                      <div key={review.id} className="flex gap-3">
                        <div className="w-9 h-9 rounded-full bg-esrc-green-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                          {review.user.firstName[0]}{review.user.lastName[0]}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm text-foreground">
                              {review.user.firstName} {review.user.lastName}
                            </span>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map((s) => (
                                <Star key={s} size={13} className={s <= review.rating ? 'fill-esrc-gold-500 text-esrc-gold-500' : 'text-muted-foreground'} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {review.comment && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="shadow-lg sticky top-24 bg-card border-0">
                <CardContent className="pt-6">
                  <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                    <PlayCircle size={48} className="text-muted-foreground" />
                  </div>

                  <div className="space-y-4">
                    {course.isFree ? (
                      <Badge className="w-full justify-center bg-esrc-green-500 text-white">
                        FREE COURSE
                      </Badge>
                    ) : (
                      <div className="text-3xl font-bold text-esrc-green-900">
                        {(course.price ?? 0).toLocaleString()} {course.currency}
                      </div>
                    )}

                    {enrollmentStatus?.isEnrolled ? (
                      <Link href={`/dashboard/courses/${courseId}/learn`}>
                        <Button
                          className="w-full bg-esrc-green-700 hover:bg-esrc-green-900 text-white font-bold rounded-lg py-3"
                        >
                          Continue Learning
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={handleEnroll}
                        disabled={enrolling}
                        className="w-full bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark font-bold rounded-lg py-3"
                      >
                        {enrolling ? 'Enrolling...' : 'Enroll Now'}
                      </Button>
                    )}

                    <div className="space-y-3 pt-4 border-t">
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-2">Level</p>
                        <Badge variant="outline">{course.level}</Badge>
                      </div>
                      <div className="text-sm">
                        <p className="text-muted-foreground mb-2">Language</p>
                        <Badge variant="outline">{course.language}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {course && (
        <PaymentModal
          open={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          course={course}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}
