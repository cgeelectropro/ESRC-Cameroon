'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, ExternalLink } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

interface FundingSource {
  id: string
  name: string
  description: string
  type: string
  url?: string
  deadline?: string
  amount?: string
  eligibility?: string[]
}

export function FundingDirectory() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sources, setSources] = useState<FundingSource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getFundingSources().then((res) => {
      if (res.success && res.data && Array.isArray(res.data)) {
        setSources(res.data as FundingSource[])
      }
      setLoading(false)
    })
  }, [])

  const filtered = sources.filter((f) => {
    const matchSearch = !search || f.name.toLowerCase().includes(search.toLowerCase()) || (f.description || '').toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'all' || f.type.toLowerCase() === typeFilter.toLowerCase()
    return matchSearch && matchType
  })

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="font-display text-lg font-semibold text-foreground">Funding Directory</h3>
          <ExternalLink size={18} className="text-primary" />
        </div>
        <p className="text-sm text-muted-foreground mb-4">Find grants, loans, and competitions for your business.</p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or focus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'Grant', 'Loan', 'Competition'].map((t) => (
              <Button
                key={t}
                variant={typeFilter === t ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTypeFilter(t)}
                className="rounded-lg"
              >
                {t === 'all' ? 'All' : t}
              </Button>
            ))}
          </div>
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {loading ? (
            <p className="text-muted-foreground py-4">Loading...</p>
          ) : (
            filtered.map((f) => (
              <a
                key={f.id}
                href={f.url || '#'}
                target={f.url ? '_blank' : undefined}
                rel={f.url ? 'noopener noreferrer' : undefined}
                className="block p-3 rounded-lg border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-foreground">{f.name}</p>
                    <p className="text-xs text-muted-foreground">{f.type} • {f.eligibility?.join(', ') || f.description?.slice(0, 50)}</p>
                  </div>
                  {f.deadline && <span className="text-xs text-primary">Deadline: {f.deadline}</span>}
                </div>
              </a>
            ))
          )}
          {!loading && filtered.length === 0 && <p className="text-muted-foreground py-4">No funding sources found.</p>}
        </div>
      </CardContent>
    </Card>
  )
}
