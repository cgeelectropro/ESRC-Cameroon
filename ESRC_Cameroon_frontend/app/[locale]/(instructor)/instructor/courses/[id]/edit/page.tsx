'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import Link from 'next/link'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  ArrowLeft, Plus, Trash2, Loader2, GripVertical, Save,
  Video, FileText, HelpCircle, ClipboardList, Award, Eye, BookOpen,
  PencilLine, CheckCircle2, Circle, Image, Paperclip, Clock, Upload
} from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { CourseCategoryDef } from '@/lib/types'
import { RichTextEditor } from '@/components/editor/RichTextEditor'

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = { id: string; title: string; summary?: string; order: number; lessons: Lesson[] }
type Lesson = {
  id: string; title: string; type: string
  videoUrl?: string | null; pdfUrl?: string | null
  content?: Record<string, unknown> | null
  duration?: number | null; order: number; isPreview: boolean
}
type CourseData = {
  id: string; title: string; titleFr: string; description: string; descriptionFr: string
  price: number; salePrice?: number; isFree: boolean; level: string; category: string
  language: string; thumbnail: string; previewVideo: string; status: string
  requirements: string[]; outcomes: string[]; tags: string[]; sections: Section[]
  totalDuration: number
  targetAudience: string[]; materialsIncluded: string[]
  instructor?: { user?: { firstName?: string; lastName?: string } }
}

// Quiz types
type QuizOption = { id: string; text: string; isCorrect: boolean }
type QuizQuestion = {
  id: string; text: string
  type: 'multiple_choice' | 'true_false' | 'short_answer'
  points: number; options: QuizOption[]; explanation: string
}
type QuizContent = {
  questions: QuizQuestion[]
  settings: { passingScore: number; timeLimit: number; randomize: boolean; showAnswers: boolean; attemptsAllowed: number }
}

// Assignment types
type AssignmentContent = {
  description: string
  attachmentUrl?: string
  settings: {
    totalPoints: number; passingPoints: number; timeLimitWeeks: number
    hasDeadline: boolean; deadline: string
    allowResubmission: boolean; maxResubmissions: number
    fileUploadLimit: number; maxFileSizeMB: number
  }
}

// Lesson editor state
type LessonEditorState = {
  title: string; type: string
  videoUrl: string; pdfUrl: string
  featuredImage: string; attachmentUrl: string; body: string
  durationH: number; durationM: number; durationS: number
  isPreview: boolean; uploading: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const LESSON_SUB_TYPES = ['VIDEO', 'PDF', 'TEXT']
const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']
const STATUSES = ['DRAFT', 'PENDING', 'PUBLISHED', 'PRIVATE', 'TRASH']
const LANGUAGES = ['EN', 'FR', 'BOTH']

const DEFAULT_QUIZ_CONTENT: QuizContent = {
  questions: [],
  settings: { passingScore: 70, timeLimit: 0, randomize: false, showAnswers: true, attemptsAllowed: 3 },
}
const DEFAULT_ASSIGNMENT_CONTENT: AssignmentContent = {
  description: '',
  attachmentUrl: '',
  settings: {
    totalPoints: 10, passingPoints: 5, timeLimitWeeks: 0,
    hasDeadline: false, deadline: '',
    allowResubmission: true, maxResubmissions: 5,
    fileUploadLimit: 1, maxFileSizeMB: 2,
  },
}

const lessonTypeIcon = (type: string) => {
  switch (type) {
    case 'VIDEO': return <Video className="w-4 h-4" />
    case 'PDF': return <FileText className="w-4 h-4" />
    case 'QUIZ': return <HelpCircle className="w-4 h-4" />
    case 'ASSIGNMENT': return <ClipboardList className="w-4 h-4" />
    case 'TEXT': return <BookOpen className="w-4 h-4" />
    default: return <FileText className="w-4 h-4" />
  }
}

// ─── Lesson Editor Dialog ──────────────────────────────────────────────────────

function LessonEditorDialog({
  open, onClose, lesson, onSave,
}: { open: boolean; onClose: () => void; lesson: Lesson; onSave: (patch: Partial<Lesson>) => void }) {
  const dur = lesson.duration ?? 0
  const [form, setForm] = useState<LessonEditorState>({
    title: lesson.title || '',
    type: lesson.type || 'VIDEO',
    videoUrl: lesson.videoUrl || '',
    pdfUrl: lesson.pdfUrl || '',
    featuredImage: (lesson.content as any)?.featuredImage || '',
    attachmentUrl: (lesson.content as any)?.attachmentUrl || '',
    body: (lesson.content as any)?.body || '',
    durationH: Math.floor(dur / 3600),
    durationM: Math.floor((dur % 3600) / 60),
    durationS: dur % 60,
    isPreview: lesson.isPreview,
    uploading: false,
  })
  const videoInputRef = useRef<HTMLInputElement>(null)
  const docInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const d = lesson.duration ?? 0
    setForm({
      title: lesson.title || '',
      type: lesson.type || 'VIDEO',
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      featuredImage: (lesson.content as any)?.featuredImage || '',
      attachmentUrl: (lesson.content as any)?.attachmentUrl || '',
      body: (lesson.content as any)?.body || '',
      durationH: Math.floor(d / 3600),
      durationM: Math.floor((d % 3600) / 60),
      durationS: d % 60,
      isPreview: lesson.isPreview,
      uploading: false,
    })
  }, [lesson])

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, uploading: true }))
    const res = await apiClient.uploadFile(file)
    if (res.success && (res as any).url) {
      setForm(f => ({ ...f, videoUrl: (res as any).url, uploading: false }))
    } else {
      alert((res as any).error || 'Upload failed')
      setForm(f => ({ ...f, uploading: false }))
    }
    e.target.value = ''
  }

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ext = file.name.split('.').pop()?.toLowerCase()
    setForm(f => ({ ...f, uploading: true }))
    if (ext === 'docx' || ext === 'doc') {
      try {
        const mammoth = await import('mammoth/mammoth.browser')
        const arrayBuffer = await file.arrayBuffer()
        // Use convertToHtml for rich formatting (headings, bold, lists preserved)
        const result = await mammoth.convertToHtml({ arrayBuffer })
        const html = result.value
        // Upload original as attachment
        const uploadRes = await apiClient.uploadFile(file)
        const attachmentUrl = uploadRes.success ? (uploadRes as any).url : ''
        setForm(f => ({
          ...f,
          body: html,
          type: 'TEXT',
          attachmentUrl,
          uploading: false,
        }))
      } catch {
        alert('Failed to extract text from Word document')
        setForm(f => ({ ...f, uploading: false }))
      }
    } else if (ext === 'pdf') {
      // Extract text from PDF and convert to article
      setForm(f => ({ ...f, uploading: true }))
      try {
        // First upload to get a URL
        const uploadRes = await apiClient.uploadFile(file)
        if (!uploadRes.success) {
          alert((uploadRes as any).error || 'Upload failed')
          setForm(f => ({ ...f, uploading: false }))
          e.target.value = ''
          return
        }
        const pdfUrl = (uploadRes as any).url as string
        // Extract text via our API route
        const extractRes = await fetch('/api/extract-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: pdfUrl }),
        })
        if (extractRes.ok) {
          const { html } = await extractRes.json()
          setForm(f => ({
            ...f,
            body: html,
            type: 'TEXT',
            attachmentUrl: pdfUrl,
            uploading: false,
          }))
        } else {
          // Fall back to storing as PDF viewer
          setForm(f => ({ ...f, pdfUrl, uploading: false }))
        }
      } catch {
        alert('Failed to extract text from PDF')
        setForm(f => ({ ...f, uploading: false }))
      }
    } else {
      const res = await apiClient.uploadFile(file)
      if (res.success && (res as any).url) {
        setForm(f => ({ ...f, pdfUrl: (res as any).url, uploading: false }))
      } else {
        alert((res as any).error || 'Upload failed')
        setForm(f => ({ ...f, uploading: false }))
      }
    }
    e.target.value = ''
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setForm(f => ({ ...f, uploading: true }))
    const res = await apiClient.uploadFile(file)
    if (res.success && (res as any).url) {
      setForm(f => ({ ...f, featuredImage: (res as any).url, uploading: false }))
    } else {
      alert((res as any).error || 'Upload failed')
      setForm(f => ({ ...f, uploading: false }))
    }
    e.target.value = ''
  }

  const handleSave = () => {
    const durationSecs = form.durationH * 3600 + form.durationM * 60 + form.durationS
    const content: Record<string, unknown> = {
      ...(lesson.content || {}),
      featuredImage: form.featuredImage || undefined,
      attachmentUrl: form.attachmentUrl || undefined,
    }
    if (form.type === 'TEXT') content.body = form.body
    onSave({
      title: form.title,
      type: form.type,
      videoUrl: form.type === 'VIDEO' ? form.videoUrl : undefined,
      pdfUrl: form.type === 'PDF' ? form.pdfUrl : undefined,
      duration: durationSecs || undefined,
      isPreview: form.isPreview,
      content,
    })
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {lessonTypeIcon(form.type)}
            <span>Edit Lesson</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-5 gap-6">
          {/* Left: content */}
          <div className="col-span-3 space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Lesson Name *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lesson title" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Type</Label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground"
              >
                {LESSON_SUB_TYPES.map(t => <option key={t} value={t}>{t === 'TEXT' ? 'Article' : t}</option>)}
              </select>
            </div>

            {form.type === 'VIDEO' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Video URL or Upload</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.videoUrl}
                    onChange={e => setForm(f => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="https://youtube.com/watch?v=... or paste URL"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={form.uploading}
                    onClick={() => videoInputRef.current?.click()}
                  >
                    {form.uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {form.uploading ? '' : 'Upload'}
                  </Button>
                </div>
                <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                {form.videoUrl && (
                  <div className="mt-2 aspect-video bg-muted rounded-lg flex items-center justify-center text-xs text-muted-foreground">
                    <Video className="w-6 h-6 mr-2" /> Video linked
                  </div>
                )}
              </div>
            )}

            {form.type === 'PDF' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">PDF / Document URL or Upload</Label>
                <div className="flex gap-2">
                  <Input
                    value={form.pdfUrl}
                    onChange={e => setForm(f => ({ ...f, pdfUrl: e.target.value }))}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0"
                    disabled={form.uploading}
                    onClick={() => docInputRef.current?.click()}
                  >
                    {form.uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                    {form.uploading ? '' : 'Upload'}
                  </Button>
                </div>
                <input ref={docInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDocUpload} />
                <p className="text-xs text-muted-foreground mt-1">
                  Upload .pdf to embed viewer — or switch type to &quot;Article&quot; after upload to extract text.
                  Upload .docx/.doc to auto-extract formatted text as article.
                </p>
              </div>
            )}

            {form.type === 'TEXT' && (
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Article Content</Label>
                <RichTextEditor
                  key={lesson.id}
                  value={form.body}
                  onChange={body => setForm(f => ({ ...f, body }))}
                  placeholder="Start writing your article content here… Use the toolbar above to format text."
                  minHeight={320}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use toolbar: headings, bold, italic, underline, lists, links, colours.
                  Upload a .docx or .pdf above to auto-populate this editor.
                </p>
              </div>
            )}
          </div>

          {/* Right: media & settings */}
          <div className="col-span-2 space-y-5">
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5" /> Featured Image
                </Label>
                {form.featuredImage && (
                  <img src={form.featuredImage} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />
                )}
                <div className="flex gap-1.5">
                  <Input
                    value={form.featuredImage}
                    onChange={e => setForm(f => ({ ...f, featuredImage: e.target.value }))}
                    placeholder="Image URL..."
                    className="text-xs flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="shrink-0 px-2"
                    disabled={form.uploading}
                    onClick={() => imageInputRef.current?.click()}
                  >
                    {form.uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  </Button>
                </div>
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" /> Video Playback Time
                </Label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <Input type="number" min={0} value={form.durationH} onChange={e => setForm(f => ({ ...f, durationH: Number(e.target.value) || 0 }))} className="text-xs text-center" />
                    <p className="text-xs text-center text-muted-foreground mt-0.5">h</p>
                  </div>
                  <span className="text-muted-foreground mb-4">:</span>
                  <div className="flex-1">
                    <Input type="number" min={0} max={59} value={form.durationM} onChange={e => setForm(f => ({ ...f, durationM: Number(e.target.value) || 0 }))} className="text-xs text-center" />
                    <p className="text-xs text-center text-muted-foreground mt-0.5">m</p>
                  </div>
                  <span className="text-muted-foreground mb-4">:</span>
                  <div className="flex-1">
                    <Input type="number" min={0} max={59} value={form.durationS} onChange={e => setForm(f => ({ ...f, durationS: Number(e.target.value) || 0 }))} className="text-xs text-center" />
                    <p className="text-xs text-center text-muted-foreground mt-0.5">s</p>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> Exercise File / Attachment URL
                </Label>
                <Input
                  value={form.attachmentUrl}
                  onChange={e => setForm(f => ({ ...f, attachmentUrl: e.target.value }))}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPreview}
                    onChange={e => setForm(f => ({ ...f, isPreview: e.target.checked }))}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="text-sm text-foreground">Free preview (visible without enrollment)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border mt-2">
          <Button variant="outline" onClick={onClose} disabled={form.uploading}>Cancel</Button>
          <Button onClick={handleSave} disabled={form.uploading} className="bg-primary text-primary-foreground">
            {form.uploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</> : 'Save Lesson'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Quiz Builder Dialog ───────────────────────────────────────────────────────

function QuizBuilderDialog({
  open, onClose, lesson, onSave,
}: { open: boolean; onClose: () => void; lesson: Lesson; onSave: (content: QuizContent) => void }) {
  const existing = lesson.content as QuizContent | null
  const [quiz, setQuiz] = useState<QuizContent>(existing?.questions ? existing as QuizContent : DEFAULT_QUIZ_CONTENT)
  const [tab, setTab] = useState<'questions' | 'settings'>('questions')
  const [addingQ, setAddingQ] = useState(false)
  const [editingQIdx, setEditingQIdx] = useState<number | null>(null)
  const [qForm, setQForm] = useState<QuizQuestion>({ id: '', text: '', type: 'multiple_choice', points: 1, options: [{ id: 'a', text: '', isCorrect: false }, { id: 'b', text: '', isCorrect: false }], explanation: '' })

  const resetQForm = () => setQForm({ id: '', text: '', type: 'multiple_choice', points: 1, options: [{ id: 'a', text: '', isCorrect: false }, { id: 'b', text: '', isCorrect: false }], explanation: '' })

  const openAddQ = () => { resetQForm(); setEditingQIdx(null); setAddingQ(true) }
  const openEditQ = (idx: number) => { setQForm({ ...quiz.questions[idx] }); setEditingQIdx(idx); setAddingQ(true) }

  const handleQTypeChange = (t: QuizQuestion['type']) => {
    if (t === 'true_false') {
      setQForm(q => ({ ...q, type: t, options: [{ id: 'true', text: 'True', isCorrect: false }, { id: 'false', text: 'False', isCorrect: false }] }))
    } else if (t === 'short_answer') {
      setQForm(q => ({ ...q, type: t, options: [] }))
    } else {
      setQForm(q => ({ ...q, type: t, options: q.options.length ? q.options : [{ id: 'a', text: '', isCorrect: false }, { id: 'b', text: '', isCorrect: false }] }))
    }
  }

  const setOptionCorrect = (optId: string) => {
    setQForm(q => ({ ...q, options: q.options.map(o => ({ ...o, isCorrect: o.id === optId })) }))
  }

  const saveQuestion = () => {
    if (!qForm.text.trim()) return
    const q = { ...qForm, id: qForm.id || `q${Date.now()}` }
    if (editingQIdx !== null) {
      setQuiz(qz => ({ ...qz, questions: qz.questions.map((x, i) => i === editingQIdx ? q : x) }))
    } else {
      setQuiz(qz => ({ ...qz, questions: [...qz.questions, q] }))
    }
    setAddingQ(false); resetQForm()
  }

  const deleteQuestion = (idx: number) => setQuiz(qz => ({ ...qz, questions: qz.questions.filter((_, i) => i !== idx) }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-amber-500" />
            Quiz Builder — {lesson.title}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex border-b border-border -mx-6 px-6">
          <button onClick={() => setTab('questions')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'questions' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            Questions ({quiz.questions.length})
          </button>
          <button onClick={() => setTab('settings')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'settings' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'}`}>
            Settings
          </button>
        </div>

        {tab === 'questions' && (
          <div className="space-y-3">
            {quiz.questions.length === 0 && !addingQ && (
              <div className="text-center py-10 text-muted-foreground text-sm border-2 border-dashed border-border rounded-xl">
                <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="font-medium mb-1">No questions yet</p>
                <p className="text-xs">Add your first question to get started</p>
              </div>
            )}
            {quiz.questions.map((q, idx) => (
              <div key={q.id} className="bg-muted/40 rounded-lg p-3 flex items-start gap-3">
                <span className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{idx + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{q.text}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground capitalize">{q.type.replace(/_/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">· {q.points} pt{q.points !== 1 ? 's' : ''}</span>
                    {q.type !== 'short_answer' && <span className="text-xs text-muted-foreground">· {q.options.filter(o => o.isCorrect).length} correct</span>}
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => openEditQ(idx)} className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"><PencilLine className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteQuestion(idx)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}

            {addingQ ? (
              <div className="border border-border rounded-lg p-4 space-y-3 bg-card">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Question Text *</Label>
                  <Textarea value={qForm.text} onChange={e => setQForm(q => ({ ...q, text: e.target.value }))} placeholder="Enter your question..." rows={2} className="text-sm" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Question Type</Label>
                    <select value={qForm.type} onChange={e => handleQTypeChange(e.target.value as QuizQuestion['type'])} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True / False</option>
                      <option value="short_answer">Short Answer</option>
                    </select>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Points</Label>
                    <Input type="number" min={1} value={qForm.points} onChange={e => setQForm(q => ({ ...q, points: Number(e.target.value) || 1 }))} className="text-sm" />
                  </div>
                </div>

                {(qForm.type === 'multiple_choice' || qForm.type === 'true_false') && (
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Answer Options (click circle to mark correct)</Label>
                    <div className="space-y-2">
                      {qForm.options.map((opt, oi) => (
                        <div key={opt.id} className="flex items-center gap-2">
                          <button type="button" onClick={() => setOptionCorrect(opt.id)} className="shrink-0">
                            {opt.isCorrect ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
                          </button>
                          <Input
                            value={opt.text}
                            onChange={e => setQForm(q => ({ ...q, options: q.options.map((o, i) => i === oi ? { ...o, text: e.target.value } : o) }))}
                            placeholder={`Option ${oi + 1}`}
                            className="text-sm h-8"
                            disabled={qForm.type === 'true_false'}
                          />
                          {qForm.type === 'multiple_choice' && (
                            <button onClick={() => setQForm(q => ({ ...q, options: q.options.filter((_, i) => i !== oi) }))} className="text-muted-foreground hover:text-destructive shrink-0">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                      {qForm.type === 'multiple_choice' && (
                        <button onClick={() => setQForm(q => ({ ...q, options: [...q.options, { id: `o${Date.now()}`, text: '', isCorrect: false }] }))} className="text-xs text-primary hover:underline flex items-center gap-1">
                          <Plus className="w-3 h-3" /> Add option
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Explanation (shown after answer)</Label>
                  <Input value={qForm.explanation} onChange={e => setQForm(q => ({ ...q, explanation: e.target.value }))} placeholder="Optional explanation..." className="text-sm" />
                </div>

                <div className="flex gap-2 pt-1">
                  <Button size="sm" onClick={saveQuestion} className="bg-primary text-primary-foreground">{editingQIdx !== null ? 'Update Question' : 'Add Question'}</Button>
                  <Button size="sm" variant="ghost" onClick={() => { setAddingQ(false); resetQForm() }}>Cancel</Button>
                </div>
              </div>
            ) : (
              <button onClick={openAddQ} className="w-full text-sm text-primary hover:underline flex items-center justify-center gap-1 py-2 border-2 border-dashed border-border rounded-lg hover:border-primary/40 transition-colors">
                <Plus className="w-4 h-4" /> Add Question
              </button>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Passing Score (%)</Label>
                <Input type="number" min={0} max={100} value={quiz.settings.passingScore} onChange={e => setQuiz(q => ({ ...q, settings: { ...q.settings, passingScore: Number(e.target.value) } }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Time Limit (minutes, 0 = unlimited)</Label>
                <Input type="number" min={0} value={quiz.settings.timeLimit} onChange={e => setQuiz(q => ({ ...q, settings: { ...q.settings, timeLimit: Number(e.target.value) } }))} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1 block">Attempts Allowed (0 = unlimited)</Label>
                <Input type="number" min={0} value={quiz.settings.attemptsAllowed} onChange={e => setQuiz(q => ({ ...q, settings: { ...q.settings, attemptsAllowed: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={quiz.settings.randomize} onChange={e => setQuiz(q => ({ ...q, settings: { ...q.settings, randomize: e.target.checked } }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Randomize question order</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={quiz.settings.showAnswers} onChange={e => setQuiz(q => ({ ...q, settings: { ...q.settings, showAnswers: e.target.checked } }))} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Show correct answers after submission</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(quiz); onClose() }} className="bg-primary text-primary-foreground">Save Quiz</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Assignment Builder Dialog (two-column) ────────────────────────────────────

function AssignmentBuilderDialog({
  open, onClose, lesson, onSave,
}: { open: boolean; onClose: () => void; lesson: Lesson; onSave: (content: AssignmentContent) => void }) {
  const existing = lesson.content as AssignmentContent | null
  const [asgn, setAsgn] = useState<AssignmentContent>(
    existing?.settings ? existing as AssignmentContent : DEFAULT_ASSIGNMENT_CONTENT
  )

  const set = <K extends keyof AssignmentContent['settings']>(key: K, val: AssignmentContent['settings'][K]) =>
    setAsgn(a => ({ ...a, settings: { ...a.settings, [key]: val } }))

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-500" />
            Assignment — {lesson.title}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: content */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Assignment Instructions (markdown supported)</Label>
              <Textarea
                value={asgn.description}
                onChange={e => setAsgn(a => ({ ...a, description: e.target.value }))}
                placeholder={'Describe the assignment task...\n\n## Objectives\n- Objective 1\n\n## Submission Requirements\n- Submit a PDF report'}
                rows={14}
                className="text-sm font-mono resize-y"
              />
            </div>
          </div>

          {/* Right: settings */}
          <div className="space-y-4">
            <div className="p-4 bg-muted/30 rounded-xl border border-border space-y-4">
              <div>
                <Label className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5" /> Attachment URL
                </Label>
                <Input
                  value={asgn.attachmentUrl || ''}
                  onChange={e => setAsgn(a => ({ ...a, attachmentUrl: e.target.value }))}
                  placeholder="https://..."
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Time Limit (weeks, 0 = none)</Label>
                  <Input type="number" min={0} value={asgn.settings.timeLimitWeeks} onChange={e => set('timeLimitWeeks', Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Total Points</Label>
                  <Input type="number" min={1} value={asgn.settings.totalPoints} onChange={e => set('totalPoints', Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Min Pass Points</Label>
                  <Input type="number" min={0} value={asgn.settings.passingPoints} onChange={e => set('passingPoints', Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">File Upload Limit</Label>
                  <Input type="number" min={1} value={asgn.settings.fileUploadLimit} onChange={e => set('fileUploadLimit', Number(e.target.value))} />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1 block">Max File Size (MB)</Label>
                  <Input type="number" min={1} value={asgn.settings.maxFileSizeMB} onChange={e => set('maxFileSizeMB', Number(e.target.value))} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={asgn.settings.hasDeadline} onChange={e => set('hasDeadline', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-foreground">Set Deadline</span>
                </label>
                {asgn.settings.hasDeadline && (
                  <div className="pl-7">
                    <Input type="date" value={asgn.settings.deadline} onChange={e => set('deadline', e.target.value)} className="text-sm" />
                  </div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={asgn.settings.allowResubmission} onChange={e => set('allowResubmission', e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-foreground">Allow Resubmission</span>
                </label>
                {asgn.settings.allowResubmission && (
                  <div className="pl-7">
                    <Label className="text-xs text-muted-foreground mb-1 block">Max Resubmissions</Label>
                    <Input type="number" min={1} value={asgn.settings.maxResubmissions} onChange={e => set('maxResubmissions', Number(e.target.value))} className="w-32" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => { onSave(asgn); onClose() }} className="bg-primary text-primary-foreground">Save Assignment</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function EditCoursePage() {
  const params = useParams()
  const locale = useLocale()
  const id = params.id as string

  const [activeTab, setActiveTab] = useState<'basics' | 'curriculum' | 'additional'>('basics')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])
  const [showCertPreview, setShowCertPreview] = useState(false)
  const [newItemSection, setNewItemSection] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ title: '', type: 'VIDEO' as string, itemKind: 'LESSON' as 'LESSON' | 'QUIZ' | 'ASSIGNMENT' })
  const [course, setCourse] = useState<CourseData | null>(null)
  const [thumbnailUploading, setThumbnailUploading] = useState(false)
  const thumbnailInputRef = useRef<HTMLInputElement>(null)
  const [lessonModal, setLessonModal] = useState<{ lesson: Lesson; sectionId: string } | null>(null)
  const [quizModal, setQuizModal] = useState<{ lesson: Lesson; sectionId: string } | null>(null)
  const [assignmentModal, setAssignmentModal] = useState<{ lesson: Lesson; sectionId: string } | null>(null)

  useEffect(() => {
    Promise.all([
      apiClient.getInstructorCourse(id),
      apiClient.getCourseCategories(),
    ]).then(([courseRes, catRes]) => {
      setLoading(false)
      if (courseRes.success && courseRes.data) {
        const c = courseRes.data as any
        setCourse({
          id: c.id,
          title: c.title || '',
          titleFr: c.titleFr || '',
          description: c.description || '',
          descriptionFr: c.descriptionFr || '',
          price: c.price ?? 0,
          salePrice: c.salePrice ?? undefined,
          isFree: c.isFree ?? false,
          level: c.level ?? 'BEGINNER',
          category: c.category ?? '',
          language: c.language ?? 'EN',
          thumbnail: c.thumbnail ?? '',
          previewVideo: c.previewVideo ?? '',
          status: c.status ?? 'DRAFT',
          requirements: c.requirements ?? [],
          outcomes: c.outcomes ?? [],
          tags: c.tags ?? [],
          targetAudience: c.targetAudience ?? [],
          materialsIncluded: c.materialsIncluded ?? [],
          sections: (c.sections ?? []).map((s: any) => ({ ...s, summary: s.summary || '' })),
          totalDuration: c.totalDuration ?? 0,
          instructor: c.instructor,
        })
      }
      if (catRes.success && Array.isArray(catRes.data)) {
        setCategories(catRes.data)
      }
    })
  }, [id])

  const saveBasics = useCallback(async () => {
    if (!course) return
    setSaving(true); setError(''); setSaveMsg('')
    const res = await apiClient.updateCourse(id, {
      title: course.title, titleFr: course.titleFr,
      description: course.description, descriptionFr: course.descriptionFr,
      price: course.price, salePrice: course.salePrice,
      isFree: course.isFree, level: course.level, category: course.category,
      language: course.language, thumbnail: course.thumbnail,
      previewVideo: course.previewVideo, status: course.status,
      tags: course.tags,
    })
    setSaving(false)
    if (res.success) { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000) }
    else setError((res as any).error || 'Failed to save')
  }, [course, id])

  const saveAdditional = useCallback(async () => {
    if (!course) return
    setSaving(true); setError(''); setSaveMsg('')
    const res = await apiClient.updateCourse(id, {
      requirements: course.requirements,
      outcomes: course.outcomes,
      targetAudience: course.targetAudience,
      materialsIncluded: course.materialsIncluded,
      totalDuration: course.totalDuration,
    })
    setSaving(false)
    if (res.success) { setSaveMsg('Saved!'); setTimeout(() => setSaveMsg(''), 2000) }
    else setError((res as any).error || 'Failed to save')
  }, [course, id])

  const addSection = async () => {
    const res = await apiClient.addSection(id, { title: 'New Topic', order: course?.sections.length ?? 0 })
    if (res.success && res.data && typeof res.data === 'object' && 'id' in res.data) {
      setCourse((c) => c ? { ...c, sections: [...c.sections, { id: (res.data as any).id, title: 'New Topic', summary: '', order: c.sections.length, lessons: [] }] } : c)
    }
  }

  const updateSectionTitle = (sId: string, title: string) =>
    setCourse((c) => c ? { ...c, sections: c.sections.map((s) => s.id === sId ? { ...s, title } : s) } : c)

  const updateSectionSummary = (sId: string, summary: string) =>
    setCourse((c) => c ? { ...c, sections: c.sections.map((s) => s.id === sId ? { ...s, summary } : s) } : c)

  const saveSectionTitle = (sId: string, title: string) => apiClient.updateSection(sId, { title })
  const saveSectionSummary = (sId: string, summary: string) => (apiClient.updateSection as any)(sId, { summary })

  const deleteSection = async (sId: string) => {
    await apiClient.deleteSection(sId)
    setCourse((c) => c ? { ...c, sections: c.sections.filter((s) => s.id !== sId) } : c)
  }

  const openAddItem = (sId: string, kind: 'LESSON' | 'QUIZ' | 'ASSIGNMENT') => {
    setNewItemSection(sId)
    const defaultType = kind === 'LESSON' ? 'VIDEO' : kind
    setNewItem({ title: '', type: defaultType, itemKind: kind })
  }

  const commitAddItem = async () => {
    if (!newItemSection || !newItem.title.trim()) return
    const section = course?.sections.find((s) => s.id === newItemSection)
    const order = section?.lessons.length ?? 0
    const lessonType = newItem.itemKind === 'QUIZ' ? 'QUIZ' : newItem.itemKind === 'ASSIGNMENT' ? 'ASSIGNMENT' : newItem.type
    const res = await apiClient.addLesson(newItemSection, { title: newItem.title, type: lessonType, order })
    if (res.success && res.data && typeof res.data === 'object' && 'id' in res.data) {
      setCourse((c) => {
        if (!c) return c
        return {
          ...c,
          sections: c.sections.map((s) =>
            s.id === newItemSection
              ? { ...s, lessons: [...s.lessons, { id: (res.data as any).id, title: newItem.title, type: lessonType, order, isPreview: false }] }
              : s
          ),
        }
      })
    }
    setNewItemSection(null)
    setNewItem({ title: '', type: 'VIDEO', itemKind: 'LESSON' })
  }

  const updateLessonLocal = (sId: string, lId: string, patch: Partial<Lesson>) =>
    setCourse((c) => c ? { ...c, sections: c.sections.map((s) => s.id === sId ? { ...s, lessons: s.lessons.map((l) => l.id === lId ? { ...l, ...patch } : l) } : s) } : c)

  const saveLesson = (lId: string, patch: Partial<Lesson>) =>
    apiClient.updateLesson(lId, { ...patch, videoUrl: patch.videoUrl ?? undefined, pdfUrl: patch.pdfUrl ?? undefined, duration: patch.duration ?? undefined, content: patch.content ?? undefined })

  const deleteLesson = async (sId: string, lId: string) => {
    await apiClient.deleteLesson(lId)
    setCourse((c) => c ? { ...c, sections: c.sections.map((s) => s.id === sId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lId) } : s) } : c)
  }

  const addDynItem = (field: 'requirements' | 'outcomes' | 'targetAudience' | 'materialsIncluded') =>
    setCourse((c) => c ? { ...c, [field]: [...c[field], ''] } : c)

  const updateDynItem = (field: 'requirements' | 'outcomes' | 'targetAudience' | 'materialsIncluded', idx: number, val: string) =>
    setCourse((c) => c ? { ...c, [field]: c[field].map((v, i) => i === idx ? val : v) } : c)

  const removeDynItem = (field: 'requirements' | 'outcomes' | 'targetAudience' | 'materialsIncluded', idx: number) =>
    setCourse((c) => c ? { ...c, [field]: c[field].filter((_, i) => i !== idx) } : c)

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setThumbnailUploading(true)
    const res = await apiClient.uploadFile(file)
    if (res.success && (res as any).url) {
      setCourse((c) => c ? { ...c, thumbnail: (res as any).url } : c)
    } else {
      alert((res as any).error || 'Upload failed')
    }
    setThumbnailUploading(false)
    e.target.value = ''
  }

  if (loading)
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
  if (!course)
    return <div className="min-h-screen flex items-center justify-center"><p className="text-foreground">Course not found</p></div>

  const instructorName = course.instructor?.user
    ? `${course.instructor.user.firstName || ''} ${course.instructor.user.lastName || ''}`.trim()
    : 'Instructor'

  const tabClass = (tab: string) =>
    `px-5 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`

  const statusColor: Record<string, string> = {
    PUBLISHED: 'bg-green-100 text-green-800',
    DRAFT: 'bg-muted text-muted-foreground',
    PENDING: 'bg-amber-100 text-amber-800',
    PRIVATE: 'bg-blue-100 text-blue-800',
    TRASH: 'bg-red-100 text-red-800',
  }

  const durH = Math.floor(course.totalDuration / 60)
  const durM = course.totalDuration % 60

  return (
    <div className="min-h-screen flex bg-background">
      <InstructorSidebar />
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="bg-card border-b px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <Link href={`/${locale}/instructor/courses`} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-semibold text-card-foreground text-lg leading-tight">{course.title || 'Untitled Course'}</h1>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[course.status] || 'bg-muted text-muted-foreground'}`}>{course.status}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saveMsg && <span className="text-sm text-green-600">{saveMsg}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
            <Button
              onClick={activeTab === 'additional' ? saveAdditional : saveBasics}
              disabled={saving}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border-b">
          <div className="flex">
            <button className={tabClass('basics')} onClick={() => setActiveTab('basics')}>Basics</button>
            <button className={tabClass('curriculum')} onClick={() => setActiveTab('curriculum')}>Curriculum</button>
            <button className={tabClass('additional')} onClick={() => setActiveTab('additional')}>Additional</button>
          </div>
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

            {/* ─── BASICS TAB ─── */}
            {activeTab === 'basics' && (
              <>
                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-card-foreground">Course Title</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Title (English)</Label>
                      <Input value={course.title} onChange={(e) => setCourse((c) => c ? { ...c, title: e.target.value } : c)} placeholder="Course title in English" />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Title (French)</Label>
                      <Input value={course.titleFr} onChange={(e) => setCourse((c) => c ? { ...c, titleFr: e.target.value } : c)} placeholder="Titre du cours en français" />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-card-foreground">Description</h2>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Description (English)</Label>
                    <Textarea value={course.description} onChange={(e) => setCourse((c) => c ? { ...c, description: e.target.value } : c)} rows={4} placeholder="Describe your course in English" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Description (French)</Label>
                    <Textarea value={course.descriptionFr} onChange={(e) => setCourse((c) => c ? { ...c, descriptionFr: e.target.value } : c)} rows={4} placeholder="Décrivez votre cours en français" />
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-semibold text-card-foreground mb-4">Course Settings</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
                      <select value={course.status} onChange={(e) => setCourse((c) => c ? { ...c, status: e.target.value } : c)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Level</Label>
                      <select value={course.level} onChange={(e) => setCourse((c) => c ? { ...c, level: e.target.value } : c)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                        {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">Language</Label>
                      <select value={course.language} onChange={(e) => setCourse((c) => c ? { ...c, language: e.target.value } : c)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                        {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Label className="text-xs text-muted-foreground mb-1 block">Category</Label>
                    <select value={course.category} onChange={(e) => setCourse((c) => c ? { ...c, category: e.target.value } : c)} className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground">
                      <option value="">-- Select a category --</option>
                      {categories.map((cat) => <option key={cat.slug} value={cat.slug}>{cat.nameEn}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-card-foreground">Media</h2>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Course Thumbnail</Label>
                    {course.thumbnail && <img src={course.thumbnail} alt="" className="w-40 h-24 object-cover rounded-lg mb-2" />}
                    <div className="flex gap-2">
                      <Input value={course.thumbnail} onChange={(e) => setCourse((c) => c ? { ...c, thumbnail: e.target.value } : c)} placeholder="https://..." className="flex-1" />
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="shrink-0"
                        disabled={thumbnailUploading}
                        onClick={() => thumbnailInputRef.current?.click()}
                      >
                        {thumbnailUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1" />}
                        {thumbnailUploading ? '' : 'Upload'}
                      </Button>
                    </div>
                    <input ref={thumbnailInputRef} type="file" accept="image/*" className="hidden" onChange={handleThumbnailUpload} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Intro Video URL</Label>
                    <Input value={course.previewVideo} onChange={(e) => setCourse((c) => c ? { ...c, previewVideo: e.target.value } : c)} placeholder="https://youtube.com/..." />
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-semibold text-card-foreground mb-4">Pricing</h2>
                  <div className="flex items-center gap-3 mb-4">
                    <input type="checkbox" id="isFree" checked={course.isFree} onChange={(e) => setCourse((c) => c ? { ...c, isFree: e.target.checked } : c)} className="w-4 h-4 accent-primary" />
                    <Label htmlFor="isFree" className="text-sm font-medium">Free course</Label>
                  </div>
                  {!course.isFree && (
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Regular Price (XAF)</Label>
                        <Input type="number" min={0} value={course.price || ''} onChange={(e) => setCourse((c) => c ? { ...c, price: Number(e.target.value) } : c)} />
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground mb-1 block">Sale Price (optional)</Label>
                        <Input type="number" min={0} value={course.salePrice || ''} onChange={(e) => setCourse((c) => c ? { ...c, salePrice: Number(e.target.value) || undefined } : c)} placeholder="0" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-xl border p-6 space-y-4">
                  <h2 className="font-semibold text-card-foreground">Tags &amp; Author</h2>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Tags (comma-separated)</Label>
                    <Input
                      value={course.tags.join(', ')}
                      onChange={(e) => setCourse((c) => c ? { ...c, tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) } : c)}
                      placeholder="entrepreneurship, africa, business"
                    />
                    {course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.tags.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-1 block">Author</Label>
                    <Input value={instructorName} readOnly className="bg-muted/50 text-muted-foreground" />
                  </div>
                </div>
              </>
            )}

            {/* ─── CURRICULUM TAB ─── */}
            {activeTab === 'curriculum' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-card-foreground">Course Curriculum</h2>
                    <p className="text-sm text-muted-foreground">{course.sections.length} topic{course.sections.length !== 1 ? 's' : ''} · {course.sections.reduce((n, s) => n + s.lessons.length, 0)} items</p>
                  </div>
                  <Button onClick={addSection} className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
                    <Plus className="w-4 h-4 mr-1" /> Add Topic
                  </Button>
                </div>

                {course.sections.length === 0 && (
                  <div className="bg-card border-2 border-dashed border-border rounded-xl p-12 text-center">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-40" />
                    <p className="text-muted-foreground mb-1 font-medium">No topics yet</p>
                    <p className="text-sm text-muted-foreground mb-4">Add your first topic to start building your curriculum.</p>
                    <Button onClick={addSection} variant="outline">
                      <Plus className="w-4 h-4 mr-1" /> Add Topic
                    </Button>
                  </div>
                )}

                {course.sections.map((section, sIdx) => (
                  <div key={section.id} className="bg-card rounded-xl border overflow-hidden">
                    {/* Section header */}
                    <div className="px-4 py-3 bg-muted/50 border-b">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                        <span className="text-xs font-medium text-muted-foreground w-6 shrink-0">T{sIdx + 1}</span>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                          onBlur={(e) => saveSectionTitle(section.id, e.target.value)}
                          className="font-medium flex-1 h-8 text-sm border-0 bg-transparent focus:bg-card focus:border"
                        />
                        <Button variant="ghost" size="sm" onClick={() => deleteSection(section.id)} className="text-destructive hover:text-destructive/80 h-8 w-8 p-0 shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="pl-10 mt-1">
                        <Input
                          value={section.summary || ''}
                          onChange={(e) => updateSectionSummary(section.id, e.target.value)}
                          onBlur={(e) => saveSectionSummary(section.id, e.target.value)}
                          placeholder="Add a brief summary (optional)"
                          className="h-7 text-xs text-muted-foreground border-0 bg-transparent focus:bg-card focus:border placeholder:text-muted-foreground/50"
                        />
                      </div>
                    </div>

                    {/* Lesson rows */}
                    <div className="divide-y divide-border">
                      {section.lessons.map((lesson, lIdx) => (
                        <div key={lesson.id} className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">{lIdx + 1}</span>
                            <div className="text-muted-foreground shrink-0">{lessonTypeIcon(lesson.type)}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium text-foreground truncate">{lesson.title || 'Untitled'}</span>
                                {lesson.type === 'QUIZ' && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium shrink-0">Quiz</span>
                                )}
                                {lesson.type === 'ASSIGNMENT' && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium shrink-0">Assignment</span>
                                )}
                                {(lesson.type === 'VIDEO' || lesson.type === 'PDF' || lesson.type === 'TEXT') && (
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium shrink-0">{lesson.type === 'TEXT' ? 'Article' : lesson.type}</span>
                                )}
                                {lesson.isPreview && <span className="text-xs text-primary font-medium">Free preview</span>}
                              </div>
                              {lesson.type === 'QUIZ' && (lesson.content as QuizContent)?.questions?.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-0.5">{(lesson.content as QuizContent).questions.length} question{(lesson.content as QuizContent).questions.length !== 1 ? 's' : ''}</p>
                              )}
                              {lesson.type === 'ASSIGNMENT' && (lesson.content as AssignmentContent)?.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-sm">{(lesson.content as AssignmentContent).description.slice(0, 60)}…</p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              {lesson.type === 'QUIZ' ? (
                                <button
                                  onClick={() => setQuizModal({ lesson, sectionId: section.id })}
                                  className="text-xs px-3 py-1 rounded-lg border border-amber-300 text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors flex items-center gap-1"
                                >
                                  <PencilLine className="w-3 h-3" /> Edit Quiz
                                </button>
                              ) : lesson.type === 'ASSIGNMENT' ? (
                                <button
                                  onClick={() => setAssignmentModal({ lesson, sectionId: section.id })}
                                  className="text-xs px-3 py-1 rounded-lg border border-blue-300 text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-1"
                                >
                                  <PencilLine className="w-3 h-3" /> Edit
                                </button>
                              ) : (
                                <button
                                  onClick={() => setLessonModal({ lesson, sectionId: section.id })}
                                  className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                  title="Edit lesson"
                                >
                                  <PencilLine className="w-4 h-4" />
                                </button>
                              )}
                              <Button variant="ghost" size="sm" onClick={() => deleteLesson(section.id, lesson.id)} className="text-muted-foreground hover:text-destructive h-8 w-8 p-0">
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Add item row */}
                      {newItemSection === section.id ? (
                        <div className="px-4 py-3 flex flex-wrap items-center gap-2 bg-primary/5">
                          <Input
                            value={newItem.title}
                            onChange={(e) => setNewItem((n) => ({ ...n, title: e.target.value }))}
                            placeholder={`${newItem.itemKind === 'QUIZ' ? 'Quiz' : newItem.itemKind === 'ASSIGNMENT' ? 'Assignment' : 'Lesson'} title`}
                            className="h-8 text-sm flex-1 min-w-[160px]"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && commitAddItem()}
                          />
                          {newItem.itemKind === 'LESSON' && (
                            <select
                              value={newItem.type}
                              onChange={(e) => setNewItem((n) => ({ ...n, type: e.target.value }))}
                              className="h-8 text-xs px-2 border border-border rounded-md bg-background text-foreground"
                            >
                              {LESSON_SUB_TYPES.map((t) => <option key={t} value={t}>{t === 'TEXT' ? 'Article' : t}</option>)}
                            </select>
                          )}
                          <Button size="sm" onClick={commitAddItem} className="bg-primary text-primary-foreground h-8">Add</Button>
                          <Button size="sm" variant="ghost" onClick={() => setNewItemSection(null)} className="h-8">Cancel</Button>
                        </div>
                      ) : (
                        <div className="px-4 py-2 flex items-center gap-3 bg-muted/20">
                          <button onClick={() => openAddItem(section.id, 'LESSON')} className="text-sm text-primary hover:underline flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Lesson
                          </button>
                          <span className="text-border">|</span>
                          <button onClick={() => openAddItem(section.id, 'QUIZ')} className="text-sm text-amber-600 hover:underline flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Quiz
                          </button>
                          <span className="text-border">|</span>
                          <button onClick={() => openAddItem(section.id, 'ASSIGNMENT')} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                            <Plus className="w-3.5 h-3.5" /> Assignment
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ─── ADDITIONAL TAB ─── */}
            {activeTab === 'additional' && (
              <>
                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-card-foreground">What Will Students Learn?</h2>
                    <Button variant="outline" size="sm" onClick={() => addDynItem('outcomes')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {course.outcomes.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={item} onChange={(e) => updateDynItem('outcomes', i, e.target.value)} placeholder="Learning outcome..." className="text-sm" />
                        <Button variant="ghost" size="sm" onClick={() => removeDynItem('outcomes', i)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {course.outcomes.length === 0 && <p className="text-sm text-muted-foreground">No learning outcomes yet.</p>}
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-card-foreground">Target Audience</h2>
                    <Button variant="outline" size="sm" onClick={() => addDynItem('targetAudience')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {course.targetAudience.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={item} onChange={(e) => updateDynItem('targetAudience', i, e.target.value)} placeholder="e.g. Entrepreneurs, Students, Professionals..." className="text-sm" />
                        <Button variant="ghost" size="sm" onClick={() => removeDynItem('targetAudience', i)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {course.targetAudience.length === 0 && <p className="text-sm text-muted-foreground">No target audience defined yet.</p>}
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-card-foreground">Requirements / Instructions</h2>
                    <Button variant="outline" size="sm" onClick={() => addDynItem('requirements')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {course.requirements.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={item} onChange={(e) => updateDynItem('requirements', i, e.target.value)} placeholder="Prerequisite or instruction..." className="text-sm" />
                        <Button variant="ghost" size="sm" onClick={() => removeDynItem('requirements', i)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {course.requirements.length === 0 && <p className="text-sm text-muted-foreground">No requirements yet.</p>}
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-card-foreground">Materials Included</h2>
                    <Button variant="outline" size="sm" onClick={() => addDynItem('materialsIncluded')}><Plus className="w-4 h-4 mr-1" /> Add</Button>
                  </div>
                  <div className="space-y-2">
                    {course.materialsIncluded.map((item, i) => (
                      <div key={i} className="flex gap-2">
                        <Input value={item} onChange={(e) => updateDynItem('materialsIncluded', i, e.target.value)} placeholder="e.g. Video lectures, PDF guides, Exercise files..." className="text-sm" />
                        <Button variant="ghost" size="sm" onClick={() => removeDynItem('materialsIncluded', i)} className="text-muted-foreground hover:text-destructive shrink-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {course.materialsIncluded.length === 0 && <p className="text-sm text-muted-foreground">No materials listed yet.</p>}
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <h2 className="font-semibold text-card-foreground mb-4">Total Course Duration</h2>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        value={durH || ''}
                        onChange={(e) => setCourse((c) => c ? { ...c, totalDuration: (Number(e.target.value) || 0) * 60 + durM } : c)}
                        placeholder="0"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">hours</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        max={59}
                        value={durM || ''}
                        onChange={(e) => setCourse((c) => c ? { ...c, totalDuration: durH * 60 + (Number(e.target.value) || 0) } : c)}
                        placeholder="0"
                        className="w-20"
                      />
                      <span className="text-sm text-muted-foreground">minutes</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="font-semibold text-card-foreground">Certificate of Completion</h2>
                        <p className="text-sm text-muted-foreground">Auto-issued when student reaches 100% progress</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setShowCertPreview(true)}>
                      <Eye className="w-4 h-4 mr-1" /> Preview Certificate
                    </Button>
                  </div>
                  <div className="mt-4 p-3 bg-primary/5 rounded-lg text-sm text-primary">
                    Certificate auto-issue is always enabled. Students who complete all lessons receive a verifiable PDF certificate.
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Certificate Preview Dialog */}
      <Dialog open={showCertPreview} onOpenChange={setShowCertPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Certificate Preview</DialogTitle>
          </DialogHeader>
          <div className="border-4 border-primary rounded-xl p-8 text-center bg-white dark:bg-card">
            <div className="text-primary font-serif text-sm tracking-widest uppercase mb-2">Entrepreneurship and Social Research Centre</div>
            <div className="text-2xl font-bold font-serif text-foreground mb-1">Certificate of Completion</div>
            <div className="text-muted-foreground text-sm mb-6">This is to certify that</div>
            <div className="text-2xl font-serif italic text-primary border-b border-primary inline-block px-8 pb-1 mb-4">[Student Name]</div>
            <div className="text-muted-foreground text-sm mb-2">has successfully completed the course</div>
            <div className="text-xl font-semibold text-foreground mb-6">{course.title || 'Course Title'}</div>
            <div className="flex justify-center gap-16 text-sm text-muted-foreground">
              <div><div className="font-medium text-foreground">Date</div>[Completion Date]</div>
              <div><div className="font-medium text-foreground">Verification Code</div>ESRC-XXXX-XXXX</div>
            </div>
            <div className="mt-6 text-xs text-muted-foreground">ESRC Cameroon · info@esrccameroon.org · esrccameroon.org</div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson Editor Modal */}
      {lessonModal && (
        <LessonEditorDialog
          open={!!lessonModal}
          onClose={() => setLessonModal(null)}
          lesson={lessonModal.lesson}
          onSave={(patch) => {
            updateLessonLocal(lessonModal.sectionId, lessonModal.lesson.id, patch)
            saveLesson(lessonModal.lesson.id, patch)
          }}
        />
      )}

      {/* Quiz Builder Modal */}
      {quizModal && (
        <QuizBuilderDialog
          open={!!quizModal}
          onClose={() => setQuizModal(null)}
          lesson={quizModal.lesson}
          onSave={(content) => {
            updateLessonLocal(quizModal.sectionId, quizModal.lesson.id, { content: content as unknown as Record<string, unknown> })
            saveLesson(quizModal.lesson.id, { content: content as unknown as Record<string, unknown> })
          }}
        />
      )}

      {/* Assignment Builder Modal */}
      {assignmentModal && (
        <AssignmentBuilderDialog
          open={!!assignmentModal}
          onClose={() => setAssignmentModal(null)}
          lesson={assignmentModal.lesson}
          onSave={(content) => {
            updateLessonLocal(assignmentModal.sectionId, assignmentModal.lesson.id, { content: content as unknown as Record<string, unknown> })
            saveLesson(assignmentModal.lesson.id, { content: content as unknown as Record<string, unknown> })
          }}
        />
      )}
    </div>
  )
}
