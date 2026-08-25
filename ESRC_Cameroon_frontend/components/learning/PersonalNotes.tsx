'use client'

import { useState, useEffect, useCallback } from 'react'
import { StickyNote, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  courseId: string
  lessonId: string
}

const STORAGE_KEY = (courseId: string, lessonId: string) => `ng_notes_${courseId}_${lessonId}`

export function PersonalNotes({ courseId, lessonId }: Props) {
  const [notes, setNotes] = useState('')
  const [saved, setSaved] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load notes for this lesson
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(STORAGE_KEY(courseId, lessonId))
    setNotes(stored ?? '')
    setSaved(true)
  }, [courseId, lessonId])

  // Auto-save after 2s of no typing
  useEffect(() => {
    if (saved) return
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY(courseId, lessonId), notes)
      setSaved(true)
      setLastSaved(new Date())
    }, 2000)
    return () => clearTimeout(timer)
  }, [notes, saved, courseId, lessonId])

  const handleChange = (val: string) => {
    setNotes(val)
    setSaved(false)
  }

  const handleSave = useCallback(() => {
    localStorage.setItem(STORAGE_KEY(courseId, lessonId), notes)
    setSaved(true)
    setLastSaved(new Date())
  }, [courseId, lessonId, notes])

  const handleClear = () => {
    if (!confirm('Clear notes for this lesson?')) return
    setNotes('')
    localStorage.removeItem(STORAGE_KEY(courseId, lessonId))
    setSaved(true)
    setLastSaved(null)
  }

  // Get all notes for this course
  const getAllNotes = () => {
    if (typeof window === 'undefined') return []
    const results: { lessonId: string; text: string }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`ng_notes_${courseId}_`)) {
        const lid = key.replace(`ng_notes_${courseId}_`, '')
        const text = localStorage.getItem(key) ?? ''
        if (text) results.push({ lessonId: lid, text })
      }
    }
    return results
  }

  const allNotes = getAllNotes()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StickyNote size={18} className="text-esrc-gold-500" />
          <h3 className="font-semibold text-foreground">My Notes</h3>
          <span className="text-xs text-muted-foreground">
            {saved ? (lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : 'All changes saved') : 'Unsaved changes...'}
          </span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSave} disabled={saved}>
            <Save size={14} className="mr-1" /> Save
          </Button>
          {notes && (
            <Button size="sm" variant="ghost" onClick={handleClear} className="text-destructive hover:text-destructive">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      </div>

      <textarea
        value={notes}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Take notes for this lesson... (auto-saved)"
        className="w-full min-h-[200px] p-4 text-sm bg-card border border-border rounded-xl resize-y text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-esrc-green-500/50 font-mono leading-relaxed"
      />

      <p className="text-xs text-muted-foreground">
        Notes are saved locally in your browser. They persist between sessions.
      </p>

      {allNotes.length > 1 && (
        <details className="mt-4">
          <summary className="text-sm font-medium text-muted-foreground cursor-pointer hover:text-foreground">
            View all notes for this course ({allNotes.length} lessons)
          </summary>
          <div className="mt-3 space-y-3 pl-4 border-l-2 border-border">
            {allNotes.map((n) => (
              <div key={n.lessonId} className="text-xs">
                <p className="font-mono text-muted-foreground mb-1">Lesson {n.lessonId.slice(-8)}</p>
                <p className="text-foreground line-clamp-3 bg-muted p-2 rounded">{n.text}</p>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
