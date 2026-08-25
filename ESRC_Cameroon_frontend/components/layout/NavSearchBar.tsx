'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Search, X, BookOpen, Calendar, FileText, Briefcase, Loader2 } from 'lucide-react'

interface SearchResult {
  id: string
  title: string
  description?: string
  abstract?: string
  category?: string
  type?: string
  startDate?: string
  deadline?: string
  avgRating?: number
  studentCount?: number
}

interface SearchResults {
  courses?: SearchResult[]
  events?: SearchResult[]
  publications?: SearchResult[]
  opportunities?: SearchResult[]
}

const CATEGORY_META = {
  courses:       { icon: BookOpen,  href: (id: string) => `/courses/${id}` },
  events:        { icon: Calendar,  href: (id: string) => `/events/${id}` },
  publications:  { icon: FileText,  href: (id: string) => `/research/${id}` },
  opportunities: { icon: Briefcase, href: (id: string) => `/opportunities` },
} as const

type Category = keyof typeof CATEGORY_META

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface NavSearchBarProps {
  overHero: boolean
}

export function NavSearchBar({ overHero }: NavSearchBarProps) {
  const t = useTranslations('nav')
  const router = useRouter()
  const locale = useLocale()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Flatten all results into a single navigable list
  const flatResults: { item: SearchResult; category: Category }[] = []
  if (results) {
    for (const cat of Object.keys(CATEGORY_META) as Category[]) {
      for (const item of results[cat] ?? []) {
        flatResults.push({ item, category: cat })
      }
    }
  }

  const totalResults = flatResults.length

  // Fetch results when debounced query changes
  useEffect(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      setResults(null)
      setOpen(false)
      return
    }

    let cancelled = false
    setLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((json) => {
        if (cancelled) return
        const data: SearchResults = json?.data ?? json
        setResults(data)
        setOpen(true)
        setActiveIndex(-1)
      })
      .catch(() => {
        if (!cancelled) setResults(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [debouncedQuery])

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const navigate = useCallback((item: SearchResult, category: Category) => {
    const href = CATEGORY_META[category].href(item.id)
    setOpen(false)
    setQuery('')
    router.push(href as Parameters<typeof router.push>[0])
  }, [router])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, totalResults - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (activeIndex >= 0 && flatResults[activeIndex]) {
        const { item, category } = flatResults[activeIndex]
        navigate(item, category)
      } else if (query.trim()) {
        // Navigate to courses page with search param as fallback
        setOpen(false)
        router.push(`/courses?q=${encodeURIComponent(query)}` as Parameters<typeof router.push>[0])
        setQuery('')
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
      inputRef.current?.blur()
    }
  }

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setOpen(false)
    inputRef.current?.focus()
  }

  // Compute flat index for a given category + local index
  const getFlatIndex = (category: Category, localIdx: number) => {
    let offset = 0
    for (const cat of Object.keys(CATEGORY_META) as Category[]) {
      if (cat === category) return offset + localIdx
      offset += results?.[cat]?.length ?? 0
    }
    return -1
  }

  const inputBg = overHero
    ? 'bg-white/15 border-white/30 text-white placeholder-white/60 focus:bg-white/25 focus:border-white/60'
    : 'bg-muted border-border text-foreground placeholder-muted-foreground focus:bg-background focus:border-primary'

  const iconColor = overHero ? 'text-white/70' : 'text-muted-foreground'

  return (
    <div ref={containerRef} className="relative w-full max-w-xs lg:max-w-sm xl:max-w-md">
      {/* Input */}
      <div className="relative flex items-center">
        <Search size={16} className={`absolute left-3 pointer-events-none ${iconColor}`} />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (results && query.length >= 2) setOpen(true) }}
          placeholder={t('searchPlaceholder')}
          aria-label={t('searchLabel')}
          autoComplete="off"
          className={`w-full pl-9 pr-8 py-2 text-sm rounded-lg border outline-none transition-all duration-200 ${inputBg}`}
        />
        {loading && (
          <Loader2 size={14} className={`absolute right-3 animate-spin ${iconColor}`} />
        )}
        {!loading && query && (
          <button
            onClick={handleClear}
            className={`absolute right-3 ${iconColor} hover:opacity-100 opacity-70 transition-opacity`}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl shadow-2xl z-[60] overflow-hidden max-h-[480px] overflow-y-auto">
          {totalResults === 0 && !loading ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t('searchNoResults')} &ldquo;{query}&rdquo;
            </div>
          ) : (
            <>
              {(Object.keys(CATEGORY_META) as Category[]).map((cat) => {
                const items = results?.[cat]
                if (!items?.length) return null
                const Icon = CATEGORY_META[cat].icon
                return (
                  <div key={cat}>
                    {/* Category header */}
                    <div className="px-4 py-2 flex items-center gap-2 bg-muted/50 border-b border-border">
                      <Icon size={13} className="text-primary" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        {t(`searchCategories.${cat}`)}
                      </span>
                      <span className="ml-auto text-xs text-muted-foreground">{items.length}</span>
                    </div>
                    {/* Items */}
                    {items.map((item, localIdx) => {
                      const flatIdx = getFlatIndex(cat, localIdx)
                      const isActive = flatIdx === activeIndex
                      const subtitle = item.category ?? item.type ?? item.startDate?.split('T')[0] ?? item.deadline?.split('T')[0]
                      return (
                        <button
                          key={item.id}
                          onMouseDown={(e) => { e.preventDefault(); navigate(item, cat) }}
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors ${
                            isActive ? 'bg-accent' : 'hover:bg-accent/60'
                          }`}
                        >
                          <Icon size={16} className="mt-0.5 shrink-0 text-primary/70" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate leading-tight">
                              {item.title}
                            </p>
                            {subtitle && (
                              <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                                {subtitle.replace(/_/g, ' ').toLowerCase()}
                              </p>
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )
              })}

              {/* See all results footer */}
              <div className="border-t border-border">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault()
                    setOpen(false)
                    router.push(`/courses?q=${encodeURIComponent(query)}` as Parameters<typeof router.push>[0])
                    setQuery('')
                  }}
                  className="w-full px-4 py-3 text-sm text-primary font-medium hover:bg-accent/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Search size={14} />
                  {t('searchSeeAll')} &ldquo;{query}&rdquo;
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
