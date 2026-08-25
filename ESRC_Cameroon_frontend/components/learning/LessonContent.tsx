'use client'

import { useState, useEffect, useRef } from 'react'
import { FileText, PlayCircle, ExternalLink, Clock, BookOpen, CheckCircle2, Circle, AlertCircle, ClipboardList, CheckCheck, FileWarning, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { LessonContent as LessonContentType } from '@/lib/types'

interface Props {
  lessonId: string
  title: string
  type: string
  videoUrl?: string | null
  pdfUrl?: string | null
  duration?: string | number | null
  content?: LessonContentType | null
  onComplete?: () => void
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz types (content JSON shape from quiz builder)
// ─────────────────────────────────────────────────────────────────────────────
type QuizOption = { id: string; text: string; isCorrect: boolean }
type QuizQuestion = { id: string; question: string; type: 'SINGLE' | 'MULTIPLE' | 'TRUE_FALSE'; options: QuizOption[]; explanation?: string }
type QuizContent = { questions: QuizQuestion[]; settings?: { passingScore?: number; randomize?: boolean; showExplanations?: boolean } }

// ─────────────────────────────────────────────────────────────────────────────
// Assignment types
// ─────────────────────────────────────────────────────────────────────────────
type AssignmentContent = { instructions?: string; settings?: { totalPoints?: number; passingPoints?: number; timeLimitWeeks?: number; maxFiles?: number; maxFileSizeMb?: number; allowResubmission?: boolean } }

/**
 * Renders article body HTML (produced by the WYSIWYG editor or extracted from PDF/Word).
 * Falls back to legacy markdown-to-HTML conversion for old content stored as markdown.
 * Copy/selection is blocked to protect content.
 */
function RichText({ body }: { body: string }) {
  // Detect if body is HTML (produced by new editor) or legacy markdown
  const isHtml = /^<[a-z][\s\S]*>/i.test(body.trimStart())

  const html = isHtml
    ? body
    : body
        .replace(/^### (.+)$/gm, '<h3>$1</h3>')
        .replace(/^## (.+)$/gm, '<h2>$1</h2>')
        .replace(/^# (.+)$/gm, '<h1>$1</h1>')
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>')
        .replace(/`(.+?)`/g, '<code>$1</code>')
        .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
        .replace(/^- (.+)$/gm, '<li>$1</li>')
        .replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>')
        .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')

  const content = isHtml ? html : `<p>${html}</p>`

  return (
    <div
      className={[
        'prose prose-sm prose-neutral dark:prose-invert max-w-none leading-relaxed break-words overflow-hidden',
        // Heading sizes — kept modest so extracted PDF/Word headings don't dominate
        'prose-h1:text-xl prose-h1:font-bold prose-h1:mt-6 prose-h1:mb-3',
        'prose-h2:text-lg prose-h2:font-bold prose-h2:mt-5 prose-h2:mb-2',
        'prose-h3:text-base prose-h3:font-semibold prose-h3:mt-4 prose-h3:mb-1.5',
        'prose-blockquote:border-l-4 prose-blockquote:border-esrc-green-500 prose-blockquote:italic prose-blockquote:text-muted-foreground',
        'prose-a:text-esrc-green-700 prose-a:underline',
        'prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-esrc-green-700',
        // Content protection
        'select-none',
      ].join(' ')}
      style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none' }}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      onContextMenu={(e) => e.preventDefault()}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Quiz renderer
// ─────────────────────────────────────────────────────────────────────────────
function QuizRenderer({ quiz, onComplete }: { quiz: QuizContent; onComplete?: () => void }) {
  const questions = quiz.questions || []
  const passingScore = quiz.settings?.passingScore ?? 70
  const showExplanations = quiz.settings?.showExplanations ?? true

  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileText size={40} className="mb-3 text-esrc-gold-500" />
        <p className="font-medium">Quiz has no questions yet</p>
      </div>
    )
  }

  const toggleAnswer = (qId: string, optId: string, isMultiple: boolean) => {
    if (submitted) return
    setAnswers((prev) => {
      const current = prev[qId] || []
      if (isMultiple) {
        return { ...prev, [qId]: current.includes(optId) ? current.filter((id) => id !== optId) : [...current, optId] }
      }
      return { ...prev, [qId]: [optId] }
    })
  }

  const handleSubmit = () => {
    let correct = 0
    questions.forEach((q) => {
      const selected = answers[q.id] || []
      const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id)
      const isCorrect = selected.length === correctIds.length && correctIds.every((id) => selected.includes(id))
      if (isCorrect) correct++
    })
    const pct = Math.round((correct / questions.length) * 100)
    setScore(pct)
    setSubmitted(true)
    if (pct >= passingScore && onComplete) onComplete()
  }

  const passed = submitted && score >= passingScore

  return (
    <div className="space-y-6">
      {/* Score banner */}
      {submitted && (
        <div className={cn(
          'rounded-xl p-4 flex items-center gap-4',
          passed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
        )}>
          {passed
            ? <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
            : <AlertCircle className="w-8 h-8 text-red-500 flex-shrink-0" />}
          <div>
            <p className={cn('font-bold text-lg', passed ? 'text-green-700 dark:text-green-300' : 'text-red-600 dark:text-red-400')}>
              {passed ? 'Passed!' : 'Not passed'} — {score}%
            </p>
            <p className="text-sm text-muted-foreground">
              Passing score: {passingScore}% — {Math.round((score / 100) * questions.length)}/{questions.length} correct
            </p>
          </div>
          {!passed && (
            <Button variant="outline" size="sm" className="ml-auto" onClick={() => { setAnswers({}); setSubmitted(false) }}>
              Retry
            </Button>
          )}
        </div>
      )}

      {/* Questions */}
      {questions.map((q, qi) => {
        const isMultiple = q.type === 'MULTIPLE'
        const selected = answers[q.id] || []
        const correctIds = q.options.filter((o) => o.isCorrect).map((o) => o.id)
        const isCorrect = submitted && selected.length === correctIds.length && correctIds.every((id) => selected.includes(id))

        return (
          <div key={q.id} className={cn(
            'rounded-xl border p-5 space-y-4',
            submitted
              ? isCorrect ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10' : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-900/10'
              : 'border-border bg-card'
          )}>
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-bold flex items-center justify-center">
                {qi + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium text-foreground">{q.question}</p>
                {isMultiple && <p className="text-xs text-muted-foreground mt-0.5">Select all that apply</p>}
              </div>
              {submitted && (isCorrect
                ? <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                : <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />)}
            </div>

            <div className="space-y-2 ml-10">
              {q.options.map((opt) => {
                const isSelected = selected.includes(opt.id)
                const isCorrectOpt = opt.isCorrect
                let optStyle = 'border-border bg-background hover:bg-accent'
                if (submitted) {
                  if (isCorrectOpt) optStyle = 'border-green-400 bg-green-50 dark:bg-green-900/20'
                  else if (isSelected && !isCorrectOpt) optStyle = 'border-red-400 bg-red-50 dark:bg-red-900/20'
                } else if (isSelected) {
                  optStyle = 'border-primary bg-primary/5'
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => toggleAnswer(q.id, opt.id, isMultiple)}
                    disabled={submitted}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-colors text-sm',
                      optStyle,
                      !submitted && 'cursor-pointer'
                    )}
                  >
                    {isMultiple
                      ? <span className={cn('w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center', isSelected ? 'bg-primary border-primary' : 'border-muted-foreground')}>
                          {isSelected && <CheckCheck className="w-3 h-3 text-white" />}
                        </span>
                      : <span className={cn('w-4 h-4 rounded-full border flex-shrink-0', isSelected ? 'border-primary bg-primary' : 'border-muted-foreground')} />}
                    <span className="flex-1 text-foreground">{opt.text}</span>
                    {submitted && isCorrectOpt && <span className="text-xs text-green-600 font-medium">Correct</span>}
                  </button>
                )
              })}
            </div>

            {submitted && showExplanations && q.explanation && (
              <div className="ml-10 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300"><strong>Explanation:</strong> {q.explanation}</p>
              </div>
            )}
          </div>
        )
      })}

      {!submitted && (
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length === 0}
            className="gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit Quiz ({Object.keys(answers).length}/{questions.length} answered)
          </Button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Assignment renderer
// ─────────────────────────────────────────────────────────────────────────────
function AssignmentRenderer({ assignment, onComplete }: { assignment: AssignmentContent; onComplete?: () => void }) {
  const [submitted, setSubmitted] = useState(false)
  const settings = assignment.settings || {}

  const handleSubmit = () => {
    setSubmitted(true)
    if (onComplete) onComplete()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="w-10 h-10 rounded-lg bg-esrc-gold-100 dark:bg-esrc-gold-900/30 flex items-center justify-center">
          <ClipboardList size={20} className="text-esrc-gold-600" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-esrc-gold-600">Assignment</p>
          <p className="text-sm text-muted-foreground">
            {settings.totalPoints ? `${settings.totalPoints} points` : ''}
            {settings.timeLimitWeeks ? ` · ${settings.timeLimitWeeks} week${settings.timeLimitWeeks > 1 ? 's' : ''} to complete` : ''}
          </p>
        </div>
      </div>

      {/* Instructions */}
      {assignment.instructions ? (
        <div className="bg-card rounded-xl p-6 border border-border">
          <RichText body={assignment.instructions} />
        </div>
      ) : (
        <div className="bg-muted rounded-xl p-6 text-center text-muted-foreground">
          <ClipboardList size={32} className="mx-auto mb-2" />
          <p>No instructions provided for this assignment</p>
        </div>
      )}

      {/* Settings info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {settings.totalPoints && (
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{settings.totalPoints}</p>
            <p className="text-xs text-muted-foreground">Total Points</p>
          </div>
        )}
        {settings.passingPoints && (
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{settings.passingPoints}</p>
            <p className="text-xs text-muted-foreground">Passing Points</p>
          </div>
        )}
        {settings.maxFiles && (
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <p className="text-lg font-bold text-foreground">{settings.maxFiles}</p>
            <p className="text-xs text-muted-foreground">Max Files</p>
          </div>
        )}
        {settings.allowResubmission && (
          <div className="rounded-lg border border-border bg-card p-3 text-center">
            <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-green-600" />
            <p className="text-xs text-muted-foreground">Resubmission OK</p>
          </div>
        )}
      </div>

      {/* Submit / Done */}
      {submitted ? (
        <div className="rounded-xl p-4 flex items-center gap-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <p className="text-green-700 dark:text-green-300 font-medium">Assignment marked as submitted. Your instructor will review and grade it.</p>
        </div>
      ) : (
        <Button onClick={handleSubmit} className="gap-2" variant="default">
          <Circle className="w-4 h-4" />
          Mark as Submitted
        </Button>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Secure PDF viewer — proxies through /api/content/pdf-proxy, hides toolbar
// ─────────────────────────────────────────────────────────────────────────────
function SecurePdfViewer({ pdfUrl, lessonId, title }: { pdfUrl: string; lessonId: string; title: string }) {
  // Route through our server-side proxy so the real S3 URL is never exposed
  const proxied = `/api/content/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`
  // Append viewer params to disable browser PDF toolbar, download button, and nav panes
  const src = `${proxied}#toolbar=0&navpanes=0&scrollbar=1&statusbar=0&messages=0&download=0&print=0`
  const overlayRef = useRef<HTMLDivElement>(null)

  return (
    <div className="mb-6 rounded-xl overflow-hidden border border-border shadow" style={{ position: 'relative' }}>
      {/* Transparent overlay blocks right-click and drag-select on the iframe */}
      <div
        ref={overlayRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          // Allow scrolling through, but intercept context menu and selection
          pointerEvents: 'none',
        }}
        onContextMenu={(e) => e.preventDefault()}
      />
      {/* Outer container intercepts right-clicks at the div level */}
      <div
        onContextMenu={(e) => e.preventDefault()}
        style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
      >
        <iframe
          key={lessonId}
          src={src}
          className="w-full"
          style={{ height: '75vh', border: 'none', display: 'block' }}
          title={title}
          sandbox="allow-scripts allow-same-origin"
          // Prevent the iframe from navigating top-level page
          referrerPolicy="no-referrer"
        />
      </div>
      {/* Watermark bar at the bottom */}
      <div className="px-4 py-2 bg-muted/80 border-t border-border flex items-center gap-2 text-xs text-muted-foreground select-none">
        <FileText size={12} />
        <span>This content is protected. Downloading or sharing is not permitted.</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DOCX viewer — converts Word document to HTML server-side via /api/content/docx-render
// ─────────────────────────────────────────────────────────────────────────────
function DocxViewer({ docxUrl, lessonId }: { docxUrl: string; lessonId: string }) {
  const [html, setHtml] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setHtml(null)
    fetch(`/api/content/docx-render?url=${encodeURIComponent(docxUrl)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.html) setHtml(data.html)
        else setError(true)
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [docxUrl, lessonId])

  if (loading) {
    return (
      <div className="mb-6 flex items-center justify-center py-20 rounded-xl border border-border bg-muted">
        <Loader2 size={28} className="animate-spin text-esrc-green-700 mr-3" />
        <span className="text-muted-foreground text-sm">Loading document…</span>
      </div>
    )
  }

  if (error || !html) {
    return (
      <div className="mb-6 flex flex-col items-center justify-center py-16 rounded-xl border border-border bg-muted text-muted-foreground">
        <FileWarning size={36} className="mb-3" />
        <p className="font-medium">Could not load document</p>
        <p className="text-sm mt-1">Please try refreshing the page</p>
      </div>
    )
  }

  return (
    <div
      className="mb-6 rounded-xl border border-border overflow-hidden"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div
        className="bg-card px-6 md:px-10 py-8 prose prose-sm prose-neutral dark:prose-invert max-w-none select-none overflow-auto"
        style={{ maxHeight: '75vh', WebkitUserSelect: 'none', userSelect: 'none' }}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div className="px-4 py-2 bg-muted/80 border-t border-border flex items-center gap-2 text-xs text-muted-foreground select-none">
        <FileText size={12} />
        <span>This content is protected. Downloading or sharing is not permitted.</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
export function LessonContent({ lessonId, title, type, videoUrl, pdfUrl, duration, content, onComplete }: Props) {
  const normalType = type?.toUpperCase()
  const hasVideo = normalType === 'VIDEO' && videoUrl
  const isDocx = pdfUrl ? /\.docx?$/i.test(pdfUrl) : false
  const hasPdf = normalType === 'PDF' && pdfUrl && !isDocx
  const hasDocx = normalType === 'PDF' && pdfUrl && isDocx
  const hasTextContent = content?.body && content.body.trim().length > 0
  const readTime = content?.estimatedReadTime
  const resources = content?.resources ?? []

  // Extract quiz/assignment data from content JSON (stored under additional keys)
  const rawContent = content as unknown as Record<string, unknown>
  const quizData = (rawContent?.questions ? rawContent : rawContent?.quiz) as QuizContent | undefined
  const assignmentData = (rawContent?.instructions !== undefined || rawContent?.settings !== undefined ? rawContent : rawContent?.assignment) as AssignmentContent | undefined

  const isQuiz = normalType === 'QUIZ'
  const isAssignment = normalType === 'ASSIGNMENT'

  return (
    <div className="w-full">
      {/* ── Video player ── */}
      {hasVideo && !(videoUrl!.includes('youtube.com') || videoUrl!.includes('youtu.be') || videoUrl!.includes('vimeo.com')) && (
        <div className="rounded-xl overflow-hidden bg-black mb-6 shadow-lg">
          <video key={lessonId} src={videoUrl!} controls className="w-full aspect-video" playsInline />
        </div>
      )}

      {/* ── YouTube / Vimeo embed ── */}
      {hasVideo && (videoUrl!.includes('youtube.com') || videoUrl!.includes('youtu.be') || videoUrl!.includes('vimeo.com')) && (
        <div className="rounded-xl overflow-hidden bg-black mb-6 shadow-lg aspect-video">
          <iframe
            key={lessonId}
            src={videoUrl!.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* ── Secure PDF viewer ── */}
      {hasPdf && <SecurePdfViewer pdfUrl={pdfUrl!} lessonId={lessonId} title={title} />}

      {/* ── DOCX viewer ── */}
      {hasDocx && <DocxViewer docxUrl={pdfUrl!} lessonId={lessonId} />}

      {/* ── Article / Text lesson ── */}
      {hasTextContent && !isQuiz && !isAssignment && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-lg bg-esrc-green-100 dark:bg-esrc-green-900/30 flex items-center justify-center">
              <BookOpen size={20} className="text-esrc-green-700" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-esrc-green-700">Article</p>
              {readTime && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock size={12} /> {readTime} min read
                </p>
              )}
            </div>
          </div>
          <div
            className="bg-card rounded-xl p-6 md:p-8 border border-border overflow-hidden select-none"
            style={{ WebkitUserSelect: 'none', MozUserSelect: 'none', userSelect: 'none' }}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
          >
            <RichText body={content!.body!} />
          </div>
        </div>
      )}

      {/* ── Quiz renderer ── */}
      {isQuiz && (
        <div className="mb-6">
          {quizData && quizData.questions && quizData.questions.length > 0
            ? <QuizRenderer quiz={quizData} onComplete={onComplete} />
            : (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted rounded-xl border border-dashed border-border">
                <FileText size={40} className="mb-3 text-esrc-gold-500" />
                <p className="font-medium">Quiz has no questions yet</p>
                <p className="text-sm mt-1">The instructor has not added questions to this quiz</p>
              </div>
            )}
        </div>
      )}

      {/* ── Assignment renderer ── */}
      {isAssignment && (
        <div className="mb-6">
          <AssignmentRenderer assignment={assignmentData || {}} onComplete={onComplete} />
        </div>
      )}

      {/* ── Live session placeholder ── */}
      {normalType === 'LIVE' && (
        <div className="mb-6 aspect-video flex items-center justify-center bg-muted rounded-xl border border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <PlayCircle size={40} className="mx-auto mb-2 text-esrc-green-600" />
            <p className="font-medium">Live Session</p>
            <p className="text-sm mt-1">Join the live session when it starts</p>
          </div>
        </div>
      )}

      {/* ── Generic fallback ── */}
      {!hasVideo && !hasPdf && !hasDocx && !hasTextContent && !isQuiz && !isAssignment && normalType !== 'LIVE' && (
        <div className="mb-6 aspect-video flex items-center justify-center bg-muted rounded-xl border border-dashed border-border">
          <div className="text-center text-muted-foreground">
            <FileText size={40} className="mx-auto mb-2" />
            <p className="font-medium">No media for this lesson</p>
            <p className="text-sm mt-1">Read the overview and mark as complete</p>
          </div>
        </div>
      )}

      {/* ── Resources ── */}
      {resources.length > 0 && (
        <div className="mt-6 p-5 bg-accent/50 rounded-xl border border-border">
          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <FileText size={16} className="text-esrc-green-700" />Resources
          </h4>
          <ul className="space-y-2">
            {resources.map((r, i) => (
              <li key={i}>
                {r.type === 'pdf' ? (
                  // PDFs open in secure viewer, not direct link
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText size={14} className="text-esrc-green-700" />
                    {r.label}
                  </span>
                ) : (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-esrc-green-700 hover:underline">
                    <ExternalLink size={14} />
                    {r.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
