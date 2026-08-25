'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useRouter, Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { LessonContent } from '@/components/learning/LessonContent'
import { PersonalNotes } from '@/components/learning/PersonalNotes'
import { CourseReviews } from '@/components/learning/CourseReviews'
import type { LessonContent as LessonContentType } from '@/lib/types'
import {
  PlayCircle, FileText, CheckCircle, ChevronLeft, ChevronRight,
  ChevronDown, ChevronUp, Menu, X, BookOpen, StickyNote,
  MessageSquare, Star, Award, Clock, Loader2,
} from 'lucide-react'

type LessonRow = {
  id: string
  title: string
  type: string
  videoUrl?: string | null
  pdfUrl?: string | null
  duration?: number | null
  isPreview?: boolean
  content?: LessonContentType | null
}
type SectionRow = { id: string; title: string; lessons: LessonRow[] }
type ProgressData = {
  progress: number
  completed: number
  total: number
  enrollment?: {
    course?: { title?: string; sections?: SectionRow[] }
    completions?: { lessonId: string }[]
  }
  completions?: { lessonId: string }[]
}
type Tab = 'overview' | 'notes' | 'reviews'

export default function CourseLearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string

  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null)
  const [lessonDetail, setLessonDetail] = useState<LessonRow | null>(null)
  const [loadingLesson, setLoadingLesson] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set())
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  // Load progress + pick starting lesson
  useEffect(() => {
    if (!courseId) return
    apiClient.getCourseProgress(courseId)
      .then((res) => {
        if (res.success && res.data) {
          const data = res.data as {
            progress?: number
            completed?: number
            total?: number
            enrollment?: { course?: { title?: string; sections?: SectionRow[] }; completions?: { lessonId: string }[] }
          }
          const completions = data.enrollment?.completions ?? []
          const pd: ProgressData = {
            progress: data.progress ?? 0,
            completed: data.completed ?? 0,
            total: data.total ?? 0,
            enrollment: data.enrollment,
            completions,
          }
          setProgressData(pd)
          const storedLesson = typeof window !== 'undefined' ? localStorage.getItem(`ng_last_${courseId}`) : null
          const sections = data.enrollment?.course?.sections ?? []
          const allL = sections.flatMap((s) => s.lessons)
          const doneIds = new Set(completions.map((c) => c.lessonId))
          let start: string | null = null
          if (storedLesson && allL.find((l) => l.id === storedLesson)) {
            start = storedLesson
          } else {
            start = allL.find((l) => !doneIds.has(l.id))?.id ?? allL[0]?.id ?? null
          }
          setCurrentLessonId(start)
        }
      })
      .catch(() => router.replace('/courses'))
      .finally(() => setLoading(false))
  }, [courseId, router])

  // Fetch full lesson detail (includes content JSON) whenever lesson changes
  useEffect(() => {
    if (!currentLessonId || !courseId) return
    if (typeof window !== 'undefined') localStorage.setItem(`ng_last_${courseId}`, currentLessonId)
    const sections = progressData?.enrollment?.course?.sections ?? []
    const basic = sections.flatMap((s) => s.lessons).find((l) => l.id === currentLessonId)
    setLoadingLesson(true)
    apiClient.getLesson(courseId, currentLessonId)
      .then((res) => {
        if (res.success && res.data) {
          setLessonDetail(res.data as LessonRow)
        } else if (basic) {
          setLessonDetail(basic)
        }
      })
      .catch(() => { if (basic) setLessonDetail(basic) })
      .finally(() => setLoadingLesson(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLessonId, courseId])

  const handleComplete = useCallback(async () => {
    if (!currentLessonId || completing || !progressData) return
    setCompleting(true)
    try {
      const res = await apiClient.completeLesson(courseId, currentLessonId)
      if (res.success && res.data) {
        const d = res.data as { progress?: number; completed?: number; total?: number }
        const newCompletions = [...(progressData.completions ?? []), { lessonId: currentLessonId }]
        setProgressData((p) =>
          p
            ? {
                ...p,
                progress: d.progress ?? p.progress,
                completed: d.completed ?? p.completed,
                total: d.total ?? p.total,
                completions: newCompletions,
              }
            : p
        )
        const allL = (progressData.enrollment?.course?.sections ?? []).flatMap((s) => s.lessons)
        const doneIds = new Set(newCompletions.map((c) => c.lessonId))
        const next = allL.find((l) => !doneIds.has(l.id))
        if (next) setCurrentLessonId(next.id)
      }
    } finally {
      setCompleting(false)
    }
  }, [currentLessonId, completing, progressData, courseId])

  const allLessons = progressData?.enrollment?.course?.sections?.flatMap((s) => s.lessons) ?? []
  const currentIdx = allLessons.findIndex((l) => l.id === currentLessonId)
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null
  const completedIds = new Set(progressData?.completions?.map((c) => c.lessonId) ?? [])
  const isCurrentComplete = currentLessonId ? completedIds.has(currentLessonId) : false
  const sections = progressData?.enrollment?.course?.sections ?? []
  const courseTitle = progressData?.enrollment?.course?.title ?? 'Course'
  const allDone = (progressData?.total ?? 0) > 0 && (progressData?.completed ?? 0) >= (progressData?.total ?? 1)

  const toggleSection = (id: string) =>
    setCollapsedSections((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const getLessonIcon = (lesson: LessonRow, done: boolean) => {
    if (done) return <CheckCircle size={15} className="text-esrc-green-600 flex-shrink-0" />
    const t = lesson.type?.toUpperCase()
    if (t === 'VIDEO') return <PlayCircle size={15} className="text-muted-foreground flex-shrink-0" />
    if (t === 'PDF') return <FileText size={15} className="text-muted-foreground flex-shrink-0" />
    if (t === 'QUIZ') return <Star size={15} className="text-muted-foreground flex-shrink-0" />
    return <BookOpen size={15} className="text-muted-foreground flex-shrink-0" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="animate-spin text-esrc-green-700" size={40} />
      </div>
    )
  }
  if (!progressData) return null

  const tabs: { key: Tab; Icon: React.ElementType; label: string }[] = [
    { key: 'overview', Icon: BookOpen, label: 'Overview' },
    { key: 'notes', Icon: StickyNote, label: 'My Notes' },
    { key: 'reviews', Icon: MessageSquare, label: 'Reviews' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* ── Top bar ── */}
      <header className="h-14 flex items-center px-4 gap-3 border-b border-border bg-card sticky top-0 z-30">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <Link
          href={`/courses/${courseId}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline truncate max-w-xs">{courseTitle}</span>
        </Link>
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-3 text-sm text-muted-foreground">
          <span>{progressData.completed}/{progressData.total} lessons</span>
          <div className="w-32">
            <ProgressBar value={Math.round(progressData.progress)} showLabel />
          </div>
        </div>
        {allDone && (
          <Link href="/dashboard/certificates">
            <Button size="sm" className="bg-esrc-gold-500 hover:bg-esrc-gold-600 text-esrc-dark font-bold gap-1.5">
              <Award size={14} /> Certificate
            </Button>
          </Link>
        )}
      </header>

      <div className="flex flex-1 pt-20">

        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside className="w-72 lg:w-80 flex-shrink-0 border-r border-border bg-card overflow-y-auto h-[calc(100vh-3.5rem)] sticky top-14">
            <div className="p-4 border-b border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Course Content</p>
              <ProgressBar value={Math.round(progressData.progress)} showLabel />
              <p className="text-xs text-muted-foreground mt-1.5">{progressData.completed} of {progressData.total} complete</p>
            </div>
            <nav className="py-1">
              {sections.map((section, si) => {
                const collapsed = collapsedSections.has(section.id)
                const sectionDone = section.lessons.every((l) => completedIds.has(l.id))
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border/40"
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0 ${sectionDone ? 'border-esrc-green-600 bg-esrc-green-600 text-white' : 'border-border text-muted-foreground'}`}>
                        {sectionDone ? '✓' : si + 1}
                      </span>
                      <span className="flex-1 text-sm font-semibold text-foreground truncate">{section.title}</span>
                      {collapsed
                        ? <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
                        : <ChevronUp size={14} className="text-muted-foreground flex-shrink-0" />}
                    </button>
                    {!collapsed && (
                      <div>
                        {section.lessons.map((lesson) => {
                          const done = completedIds.has(lesson.id)
                          const active = lesson.id === currentLessonId
                          const dur = lesson.duration ? Math.round((lesson.duration as number) / 60) : null
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setCurrentLessonId(lesson.id)}
                              className={`w-full text-left px-4 py-2.5 flex items-start gap-2.5 text-sm border-b border-border/20 transition-colors ${
                                active
                                  ? 'bg-esrc-green-50 dark:bg-esrc-green-900/30 border-l-2 border-l-esrc-green-600'
                                  : 'hover:bg-muted/50'
                              }`}
                            >
                              <span className="mt-0.5">{getLessonIcon(lesson, done)}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`truncate leading-snug ${
                                  active ? 'font-medium text-esrc-green-800 dark:text-esrc-green-200'
                                  : done ? 'text-muted-foreground' : 'text-foreground'
                                }`}>
                                  {lesson.title}
                                </p>
                                {dur && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Clock size={10} /> {dur} min
                                  </p>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </nav>
          </aside>
        )}

        {/* ── Main ── */}
        <main className="flex-1 overflow-y-auto h-[calc(100vh-3.5rem)]">

          {/* Completion banner */}
          {allDone && (
            <div className="bg-esrc-green-900 text-white px-6 py-4 flex items-center gap-4">
              <Award size={28} className="text-esrc-gold-400 flex-shrink-0" />
              <div>
                <p className="font-bold text-lg">Congratulations! Course completed.</p>
                <p className="text-white/80 text-sm">Your certificate has been issued and is ready to download.</p>
              </div>
              <Link href="/dashboard/certificates" className="ml-auto flex-shrink-0">
                <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-400 text-esrc-dark font-bold">
                  View Certificate
                </Button>
              </Link>
            </div>
          )}

          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

            {/* Lesson title */}
            {lessonDetail && !loadingLesson && (
              <div className="mb-5">
                <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                  <span className="font-semibold uppercase tracking-wide bg-muted px-2 py-0.5 rounded text-foreground">
                    {lessonDetail.type?.toUpperCase()}
                  </span>
                  {lessonDetail.duration != null && (
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {Math.round((lessonDetail.duration as number) / 60)} min
                    </span>
                  )}
                  {isCurrentComplete && (
                    <span className="flex items-center gap-1 text-esrc-green-600 font-medium">
                      <CheckCircle size={11} /> Completed
                    </span>
                  )}
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground font-display leading-tight">
                  {lessonDetail.title}
                </h1>
              </div>
            )}

            {/* Lesson content */}
            {loadingLesson ? (
              <div className="aspect-video flex items-center justify-center bg-muted rounded-xl mb-6">
                <Loader2 className="animate-spin text-esrc-green-700" size={32} />
              </div>
            ) : lessonDetail ? (
              <LessonContent
                lessonId={lessonDetail.id}
                title={lessonDetail.title}
                type={lessonDetail.type}
                videoUrl={lessonDetail.videoUrl}
                pdfUrl={lessonDetail.pdfUrl}
                duration={lessonDetail.duration}
                content={lessonDetail.content}
                onComplete={handleComplete}
              />
            ) : null}

            {/* Prev / Complete / Next */}
            {lessonDetail && !loadingLesson && (
              <div className="flex items-center justify-between gap-3 mt-6 pt-6 border-t border-border">
                <Button
                  variant="outline"
                  onClick={() => prevLesson && setCurrentLessonId(prevLesson.id)}
                  disabled={!prevLesson}
                  className="gap-1.5"
                >
                  <ChevronLeft size={16} /> Previous
                </Button>

                <Button
                  onClick={handleComplete}
                  disabled={isCurrentComplete || completing}
                  className={`px-8 font-bold gap-2 ${
                    isCurrentComplete
                      ? 'bg-esrc-green-100 dark:bg-esrc-green-900/30 text-esrc-green-700 cursor-default border border-esrc-green-300 dark:border-esrc-green-700'
                      : 'bg-esrc-green-700 hover:bg-esrc-green-900 text-white'
                  }`}
                >
                  {completing
                    ? <><Loader2 size={16} className="animate-spin" /> Marking...</>
                    : isCurrentComplete
                      ? <><CheckCircle size={16} /> Completed</>
                      : 'Mark as Complete'
                  }
                </Button>

                <Button
                  variant="outline"
                  onClick={() => nextLesson && setCurrentLessonId(nextLesson.id)}
                  disabled={!nextLesson}
                  className="gap-1.5"
                >
                  Next <ChevronRight size={16} />
                </Button>
              </div>
            )}

            {/* Tabs */}
            {lessonDetail && !loadingLesson && (
              <div className="mt-10">
                <div className="flex border-b border-border gap-0">
                  {tabs.map(({ key, Icon, label }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={`flex items-center gap-1.5 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === key
                          ? 'border-esrc-green-700 text-esrc-green-700'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Icon size={15} /> {label}
                    </button>
                  ))}
                </div>

                <div className="py-6">
                  {activeTab === 'overview' && (
                    <div className="space-y-5">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {[
                          { label: 'Total', value: progressData.total, color: 'text-foreground' },
                          { label: 'Completed', value: progressData.completed, color: 'text-esrc-green-700' },
                          { label: 'Progress', value: `${Math.round(progressData.progress)}%`, color: 'text-foreground' },
                          { label: 'Remaining', value: progressData.total - progressData.completed, color: 'text-esrc-gold-500' },
                        ].map((s) => (
                          <div key={s.label} className="bg-card border border-border rounded-xl p-5 text-center">
                            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {!allDone && (
                        <p className="text-sm text-muted-foreground text-center">
                          Complete all {progressData.total} lessons to earn your certificate.
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === 'notes' && currentLessonId && (
                    <PersonalNotes courseId={courseId} lessonId={currentLessonId} />
                  )}

                  {activeTab === 'reviews' && (
                    <CourseReviews courseId={courseId} progressPct={progressData.progress} />
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
