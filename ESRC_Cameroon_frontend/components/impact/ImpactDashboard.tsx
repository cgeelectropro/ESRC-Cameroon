'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'
import { Users, Briefcase, DollarSign, BookOpen, Heart, TrendingUp } from 'lucide-react'
import { apiClient } from '@/lib/api-client'

const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users size={20} className="text-white" />,
  users: <Users size={20} className="text-white" />,
  Briefcase: <Briefcase size={20} className="text-white" />,
  briefcase: <Briefcase size={20} className="text-white" />,
  TrendingUp: <TrendingUp size={20} className="text-white" />,
  trendingUp: <TrendingUp size={20} className="text-white" />,
  DollarSign: <DollarSign size={20} className="text-white" />,
  dollarSign: <DollarSign size={20} className="text-white" />,
  BookOpen: <BookOpen size={20} className="text-white" />,
  bookOpen: <BookOpen size={20} className="text-white" />,
  Heart: <Heart size={20} className="text-white" />,
  heart: <Heart size={20} className="text-white" />,
}

interface AnimatedCounterProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: React.ReactNode
  color: string // Tailwind class (e.g. bg-esrc-green-700) or hex (e.g. #065f46)
}

function AnimatedCounter({ label, value, prefix = '', suffix = '', icon, color }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000
    const increment = value / (duration / 50)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 50)
    return () => clearInterval(timer)
  }, [value])

  const iconStyle = color.startsWith('#') ? { backgroundColor: color } : undefined
  const iconClass = color.startsWith('#') ? 'p-2 rounded-lg' : `p-2 rounded-lg ${color}`

  return (
    <Card className="shadow-sm hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
          <div className={iconClass} style={iconStyle}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-foreground">
          {prefix}
          {displayValue.toLocaleString()}
          {suffix}
        </p>
      </CardContent>
    </Card>
  )
}

interface SdgItem {
  id: string
  number: number
  title: string
  color: string
}

function SDGGrid({ sdgs }: { sdgs: SdgItem[] }) {
  if (!sdgs.length) return null
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">SDG Alignment</h3>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {sdgs.map((sdg) => (
          <div
            key={sdg.id}
            className="text-white p-3 rounded text-center font-bold cursor-pointer hover:opacity-80 transition-opacity"
            style={{ backgroundColor: sdg.color || 'var(--esrc-green-900)' }}
          >
            <p className="text-lg">SDG {sdg.number}</p>
            <p className="text-xs line-clamp-2">{sdg.title}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

interface MilestoneItem {
  id: string
  year: number
  event: string
}

function TimelineComponent({ milestones }: { milestones: MilestoneItem[] }) {
  if (!milestones.length) return null
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Our Journey</h3>
      <div className="relative space-y-4 pl-6 border-l-2 border-primary">
        {milestones.map((m) => (
          <div key={m.id} className="relative">
            <div className="absolute -left-4 w-2.5 h-2.5 bg-primary rounded-full mt-2" />
            <div>
              <p className="font-semibold text-primary">{m.year}</p>
              <p className="text-muted-foreground">{m.event}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface SuccessStoryItem {
  id: string
  name: string
  title: string
  impact: string
  quote: string
}

function SuccessStories({ stories }: { stories: SuccessStoryItem[] }) {
  if (!stories.length) return null
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Success Stories</h3>
      <Carousel opts={{ align: 'start', loop: true }}>
        <CarouselContent>
          {stories.map((story) => (
            <CarouselItem key={story.id} className="md:basis-1/2 lg:basis-1/3">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm">{story.name}</CardTitle>
                  <CardDescription>{story.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-xs font-semibold text-primary">{story.impact}</p>
                  <p className="text-sm italic text-muted-foreground">&quot;{story.quote}&quot;</p>
                </CardContent>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4" />
        <CarouselNext className="-right-4" />
      </Carousel>
    </div>
  )
}

interface RegionalImpactItem {
  id: string
  regionId: string
  name: string
  learners: number
  posX: number
  posY: number
}

function CameroonMap({ regions }: { regions: RegionalImpactItem[] }) {
  const [activeRegion, setActiveRegion] = useState<string | null>(null)
  if (!regions.length) return null
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg text-foreground">Impact Across Cameroon</h3>
      <div className="relative aspect-[4/3] max-w-lg mx-auto bg-accent rounded-lg border border-border overflow-hidden">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          aria-label="Map of Cameroon showing regional impact"
        >
          <path
            d="M 50 5 L 85 25 L 82 75 L 55 95 L 25 85 L 15 55 L 18 25 Z"
            fill="currentColor"
            className="text-primary/40 hover:text-primary/70 transition-colors cursor-pointer"
            aria-label="Cameroon"
          />
          {regions.map((r) => (
            <g key={r.id}>
              <circle
                cx={r.posX}
                cy={r.posY}
                r={6}
                fill={activeRegion === r.regionId ? 'var(--primary)' : 'var(--esrc-gold-500)'}
                className="cursor-pointer hover:opacity-80"
                onClick={() => setActiveRegion(activeRegion === r.regionId ? null : r.regionId)}
              />
              {activeRegion === r.regionId && (
                <text x={r.posX} y={r.posY - 10} textAnchor="middle" className="text-xs" style={{ fill: 'var(--foreground)' }}>
                  {r.name}: {r.learners.toLocaleString()} learners
                </text>
              )}
            </g>
          ))}
        </svg>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Click markers to see regional learner counts
        </p>
      </div>
    </div>
  )
}

interface ImpactMetricItem {
  id: string
  label: string
  value: number
  icon: string
  color: string
}

export function ImpactDashboard() {
  const [metrics, setMetrics] = useState<ImpactMetricItem[]>([])
  const [stories, setStories] = useState<SuccessStoryItem[]>([])
  const [regions, setRegions] = useState<RegionalImpactItem[]>([])
  const [milestones, setMilestones] = useState<{ id: string; year: number; event: string }[]>([])
  const [sdgs, setSdgs] = useState<{ id: string; number: number; title: string; color: string }[]>([])
  const [platformInfo, setPlatformInfo] = useState<Record<string, string>>({})
  const [stats, setStats] = useState<{
    totalLearners?: number
    coursesPublished?: number
    countriesReached?: number
    partnerOrganizations?: number
    entrepreneursSupported?: number
  }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      apiClient.getImpactMetrics(),
      apiClient.getImpactStats(),
      apiClient.getRegionalImpacts(),
      apiClient.getTimelineMilestones(),
      apiClient.getSdgs(),
      apiClient.getPlatformInfo(),
    ]).then(([metricsRes, statsRes, regionsRes, milestonesRes, sdgsRes, platformRes]) => {
      if (metricsRes.success && metricsRes.data) {
        const d = metricsRes.data as { metrics?: ImpactMetricItem[]; stories?: SuccessStoryItem[] }
        setMetrics(Array.isArray(d.metrics) ? d.metrics : [])
        setStories(
          Array.isArray(d.stories)
            ? (d.stories as { id: string; name: string; title: string; impact: string; quote: string }[]).map((s) => ({
                id: s.id,
                name: s.name,
                title: s.title,
                impact: s.impact,
                quote: s.quote,
              }))
            : []
        )
      }
      if (statsRes.success && statsRes.data) {
        const s = statsRes.data as unknown as Record<string, number>
        setStats({
          totalLearners: s.totalLearners,
          coursesPublished: s.coursesPublished,
          countriesReached: s.countriesReached,
          partnerOrganizations: s.partnerOrganizations,
          entrepreneursSupported: s.entrepreneursSupported,
        })
      }
      if (regionsRes.success && Array.isArray(regionsRes.data)) {
        setRegions(regionsRes.data as RegionalImpactItem[])
      }
      if (milestonesRes.success && Array.isArray(milestonesRes.data)) {
        setMilestones((milestonesRes.data as { id: string; year: number; event: string }[]))
      }
      if (sdgsRes.success && Array.isArray(sdgsRes.data)) {
        setSdgs(sdgsRes.data as { id: string; number: number; title: string; color: string }[])
      }
      if (platformRes.success && platformRes.data && typeof platformRes.data === 'object') {
        setPlatformInfo(platformRes.data as Record<string, string>)
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Loading impact data...
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Animated Counters */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {metrics.map((m) => (
            <AnimatedCounter
              key={m.id}
              label={m.label}
              value={m.value}
              icon={ICON_MAP[m.icon] ?? <Users size={20} className="text-white" />}
              color={m.color || 'bg-esrc-green-700'}
            />
          ))}
        </div>
        {metrics.length === 0 && (
          <p className="text-muted-foreground">No impact metrics available yet.</p>
        )}
      </div>

      {/* Cameroon Map */}
      {regions.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <CameroonMap regions={regions} />
        </div>
      )}

      {/* SDG Grid */}
      {sdgs.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <SDGGrid sdgs={sdgs} />
        </div>
      )}

      {/* Timeline & Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {milestones.length > 0 && (
          <div className="bg-card p-6 rounded-lg border border-border">
            <TimelineComponent milestones={milestones} />
          </div>
        )}
        <div className="bg-card p-6 rounded-lg border border-border">
          <h3 className="font-semibold text-lg mb-4 text-foreground">Quick Stats</h3>
          <div className="space-y-4">
            {platformInfo.foundedYear && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Founded</span>
                <span className="font-semibold">{platformInfo.foundedYear}</span>
              </div>
            )}
            {platformInfo.teamMembers && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Team Members</span>
                <span className="font-semibold">{platformInfo.teamMembers}</span>
              </div>
            )}
            {stats.countriesReached != null && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Countries Served</span>
                <span className="font-semibold">{stats.countriesReached}</span>
              </div>
            )}
            {stats.partnerOrganizations != null && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Partner Organizations</span>
                <span className="font-semibold">{stats.partnerOrganizations}</span>
              </div>
            )}
            {stats.coursesPublished != null && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Courses Available</span>
                <span className="font-semibold">{stats.coursesPublished}</span>
              </div>
            )}
            {stats.totalLearners != null && (
              <div className="flex justify-between pb-2 border-b">
                <span className="text-muted-foreground">Total Learners</span>
                <span className="font-semibold">{stats.totalLearners.toLocaleString()}</span>
              </div>
            )}
            {stats.entrepreneursSupported != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Entrepreneurs Supported</span>
                <span className="font-semibold">{stats.entrepreneursSupported.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      {stories.length > 0 && (
        <div className="bg-card p-6 rounded-lg border border-border">
          <SuccessStories stories={stories} />
        </div>
      )}
    </div>
  )
}
