'use client'

import { useEffect, useState } from 'react'
import { useLocale } from 'next-intl'
import { COURSE_LEVELS } from '@/lib/constants'
import { apiClient } from '@/lib/api-client'
import type { CourseCategoryDef } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'

interface CourseFiltersProps {
  selectedCategory: string
  selectedLevel: string
  onCategoryChange: (category: string) => void
  onLevelChange: (level: string) => void
}

export function CourseFilters({
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
}: CourseFiltersProps) {
  const locale = useLocale()
  const [categories, setCategories] = useState<CourseCategoryDef[]>([])

  useEffect(() => {
    apiClient.getCourseCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) setCategories(res.data)
    }).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      {/* Category Filter */}
      <Card className="p-6 shadow-sm bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">Category</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Checkbox
              id="category-all"
              checked={selectedCategory === 'all'}
              onCheckedChange={() => onCategoryChange('all')}
            />
            <Label htmlFor="category-all" className="cursor-pointer text-sm">
              All Categories
            </Label>
          </div>
          {categories.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-3">
              <Checkbox
                id={`category-${cat.slug}`}
                checked={selectedCategory === cat.slug}
                onCheckedChange={() => onCategoryChange(cat.slug)}
              />
              <Label
                htmlFor={`category-${cat.slug}`}
                className="cursor-pointer text-sm"
              >
                {locale === 'fr' ? cat.nameFr : cat.nameEn}
              </Label>
            </div>
          ))}
        </div>
      </Card>

      {/* Level Filter */}
      <Card className="p-6 shadow-sm bg-card border-border">
        <h3 className="font-semibold text-foreground mb-4">Level</h3>
        <div className="space-y-3">
          {['all', ...COURSE_LEVELS].map((level) => (
            <div key={level} className="flex items-center gap-3">
              <Checkbox
                id={`level-${level}`}
                checked={selectedLevel === level}
                onCheckedChange={() => onLevelChange(level)}
              />
              <Label
                htmlFor={`level-${level}`}
                className="cursor-pointer text-sm capitalize"
              >
                {level === 'all' ? 'All Levels' : level}
              </Label>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
