'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { BookOpen, Star, Users, Clock, Target, ArrowRight, Loader2, Sparkles } from 'lucide-react'
import type { Course } from '@/lib/types'

export default function LearningPathPage() {
  const [recommendations, setRecommendations] = useState<Course[]>([])
  const [enrollments, setEnrollments] = useState<{ id: string; title: string; progress: number; courseId: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.getAIRecommendations(),
      apiClient.getUserEnrollments(),
    ]).then(([recRes, enrollRes]) => {
      setLoading(false)
      if (recRes.success && recRes.data) {
        const arr = Array.isArray(recRes.data) ? recRes.data : []
        setRecommendations(arr as Course[])
      }
      if (enrollRes.success && enrollRes.data && Array.isArray(enrollRes.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setEnrollments((enrollRes.data as any[]).map((e) => ({
          id: String(e.id ?? ''),
          courseId: String(e.course?.id ?? e.courseId ?? ''),
          title: String(e.course?.title ?? e.title ?? 'Course'),
          progress: Number(e.progressPct ?? e.progress ?? 0),
        })))
      }
    })
  }, [])

  const inProgress = enrollments.filter((e) => e.progress > 0 && e.progress < 100)
  const completed = enrollments.filter((e) => e.progress >= 100)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar />
        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">Your Learning Path</h1>
              <p className="text-muted-foreground">Personalized recommendations powered by AI, based on your interests and goals</p>
            </div>

            {loading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 size={32} className="animate-spin text-esrc-green-600" />
              </div>
            )}

            {!loading && (
              <>
                {/* Current Progress */}
                {inProgress.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Target size={18} className="text-esrc-green-700" /> Continue Learning
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inProgress.map((e) => (
                        <Card key={e.id} className="border shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="pt-5">
                            <h3 className="font-semibold text-foreground mb-3 line-clamp-1">{e.title}</h3>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>Progress</span>
                                <span className="font-medium text-foreground">{Math.round(e.progress)}%</span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="bg-esrc-green-700 h-2 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, e.progress)}%` }}
                                />
                              </div>
                            </div>
                            <Link href={`/dashboard/courses/${e.courseId}/learn`}>
                              <Button size="sm" className="mt-3 bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-1.5">
                                Continue <ArrowRight size={14} />
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Completed */}
                {completed.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
                      <BookOpen size={18} className="text-blue-600" /> Completed ({completed.length})
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {completed.map((e) => (
                        <Badge key={e.id} className="bg-blue-50 text-blue-700 border border-blue-200 text-sm py-1 px-3">
                          ✓ {e.title}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Recommendations */}
                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-esrc-gold-500" /> Recommended For You
                  </h2>

                  {recommendations.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="pt-8 pb-8 text-center">
                        <Sparkles size={40} className="mx-auto text-muted-foreground/30 mb-3" />
                        <p className="text-muted-foreground font-medium mb-2">No personalized recommendations yet</p>
                        <p className="text-sm text-muted-foreground mb-4">
                          Select your interests during registration or update them in your profile to get AI-powered course recommendations.
                        </p>
                        <Link href="/dashboard/profile">
                          <Button variant="outline" size="sm" className="gap-1.5">
                            Update Interests <ArrowRight size={14} />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}

                  {recommendations.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recommendations.map((course) => (
                        <Card key={course.id} className="overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                          {course.thumbnail && (
                            <div className="relative h-36 bg-muted overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={course.thumbnail}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              {course.isFree && (
                                <Badge className="absolute top-2 right-2 bg-esrc-green-700 text-white text-xs">Free</Badge>
                              )}
                            </div>
                          )}
                          <CardContent className="pt-4 space-y-3">
                            <div>
                              <Badge variant="outline" className="text-xs mb-2">{course.category || 'Course'}</Badge>
                              <h3 className="font-semibold text-foreground line-clamp-2 leading-snug">{course.title}</h3>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              {course.avgRating != null && (
                                <span className="flex items-center gap-1">
                                  <Star size={12} className="text-esrc-gold-500 fill-esrc-gold-500" />
                                  {Number(course.avgRating).toFixed(1)}
                                </span>
                              )}
                              {course.studentCount != null && (
                                <span className="flex items-center gap-1">
                                  <Users size={12} /> {course.studentCount}
                                </span>
                              )}
                              {course.level && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} /> {course.level}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-1">
                              <span className="font-bold text-esrc-green-700">
                                {course.isFree ? 'Free' : `${(course.price ?? 0).toLocaleString()} XAF`}
                              </span>
                              <Link href={`/courses/${course.id}`}>
                                <Button size="sm" className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white gap-1">
                                  Enroll <ArrowRight size={13} />
                                </Button>
                              </Link>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                {/* Explore All Courses CTA */}
                <div className="text-center py-4">
                  <Link href="/courses">
                    <Button variant="outline" className="gap-2">
                      <BookOpen size={16} /> Browse All Courses
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
