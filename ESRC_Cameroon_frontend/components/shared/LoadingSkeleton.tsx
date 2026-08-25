'use client'

export function CourseCardSkeleton() {
  return (
    <div className="rounded-xl bg-card overflow-hidden animate-pulse">
      <div className="h-48 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-6 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="h-4 bg-muted rounded w-full" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  )
}

export function EventCardSkeleton() {
  return (
    <div className="rounded-xl bg-card overflow-hidden animate-pulse">
      <div className="h-40 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-muted rounded w-1/4" />
        <div className="h-5 bg-muted rounded w-2/3" />
        <div className="h-4 bg-muted rounded w-full" />
      </div>
    </div>
  )
}

export function PublicationCardSkeleton() {
  return (
    <div className="rounded-xl bg-card p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/5 mb-4" />
      <div className="h-6 bg-muted rounded w-4/5 mb-2" />
      <div className="h-4 bg-muted rounded w-2/5 mb-4" />
      <div className="h-20 bg-muted rounded w-full" />
    </div>
  )
}

export function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
      ))}
    </div>
  )
}
