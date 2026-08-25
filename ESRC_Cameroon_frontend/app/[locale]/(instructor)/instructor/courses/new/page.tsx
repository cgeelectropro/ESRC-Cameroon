'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { apiClient } from '@/lib/api-client'
import type { CourseCategoryDef } from '@/lib/types'

const LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED']

export default function NewCoursePage() {
  const locale = useLocale()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    isFree: true,
    level: 'BEGINNER',
    category: '',
    language: 'EN',
    thumbnail: '',
    requirements: '',
    outcomes: '',
  })

  useEffect(() => {
    apiClient.getCourseCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data)
        if (res.data.length > 0) {
          setForm((f) => ({ ...f, category: res.data![0].slug }))
        }
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const requirements = form.requirements.split('\n').filter(Boolean)
    const outcomes = form.outcomes.split('\n').filter(Boolean)
    const res = await apiClient.createCourse({
      title: form.title,
      description: form.description,
      price: form.price,
      isFree: form.isFree,
      level: form.level,
      category: form.category,
      language: form.language,
      thumbnail: form.thumbnail || undefined,
      requirements,
      outcomes,
    })
    setLoading(false)
    if (res.success && res.data && typeof res.data === 'object' && 'id' in res.data) {
      router.push(`/${locale}/instructor/courses/${(res.data as { id: string }).id}/edit`)
    } else {
      setError((res as { error?: string }).error || 'Failed to create course')
    }
  }

  return (
    <div className="min-h-screen flex bg-background">
      <InstructorSidebar />
      <main className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <Link href={`/${locale}/instructor/courses`} className="inline-flex items-center gap-2 text-esrc-green-700 mb-8 text-sm hover:underline">
            <ArrowLeft size={18} />
            Back to Courses
          </Link>

          <Card>
            <CardHeader>
              <CardTitle>Create New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Enter course title"
                    required
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe your course"
                    required
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="level">Level *</Label>
                    <select
                      id="level"
                      value={form.level}
                      onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 border border-border rounded-md text-sm bg-input text-foreground"
                    >
                      {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <select
                      id="category"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full mt-2 px-3 py-2 border border-border rounded-md text-sm bg-input text-foreground"
                    >
                      {categories.map((c) => <option key={c.slug} value={c.slug}>{c.nameEn}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isFree"
                    checked={form.isFree}
                    onChange={(e) => setForm((f) => ({ ...f, isFree: e.target.checked }))}
                  />
                  <Label htmlFor="isFree">Free course</Label>
                </div>
                {!form.isFree && (
                  <div>
                    <Label htmlFor="price">Price (XAF)</Label>
                    <Input
                      id="price"
                      type="number"
                      min={0}
                      value={form.price || ''}
                      onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                      className="mt-2"
                    />
                  </div>
                )}
                <div>
                  <Label htmlFor="thumbnail">Thumbnail URL (optional)</Label>
                  <Input
                    id="thumbnail"
                    value={form.thumbnail}
                    onChange={(e) => setForm((f) => ({ ...f, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    value={form.requirements}
                    onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                    placeholder="Prerequisite 1&#10;Prerequisite 2"
                    rows={2}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="outcomes">Learning outcomes (one per line)</Label>
                  <Textarea
                    id="outcomes"
                    value={form.outcomes}
                    onChange={(e) => setForm((f) => ({ ...f, outcomes: e.target.value }))}
                    placeholder="What students will learn..."
                    rows={3}
                    className="mt-2"
                  />
                </div>
                {error && <p className="text-red-600 text-sm">{error}</p>}
                <Button
                  type="submit"
                  className="bg-[#F9A825] hover:bg-[#e69800] text-gray-900"
                  disabled={loading}
                >
                  {loading ? <Loader2 size={18} className="animate-spin mr-2" /> : null}
                  {loading ? 'Creating...' : 'Create Course & Add Content'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
