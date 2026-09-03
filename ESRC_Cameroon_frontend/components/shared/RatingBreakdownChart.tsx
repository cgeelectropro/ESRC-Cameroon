'use client'

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts'

export function RatingBreakdownChart({ ratingBreakdown }: { ratingBreakdown?: Record<number, number> }) {
  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={[5, 4, 3, 2, 1]
            .filter((r) => (ratingBreakdown ?? {})[r] != null)
            .map((stars) => ({
              stars: `${stars} ★`,
              count: (ratingBreakdown ?? {})[stars] ?? 0,
              fill: 'var(--esrc-green-800)',
            }))}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 60, bottom: 0 }}
        >
          <XAxis type="number" />
          <YAxis type="category" dataKey="stars" width={50} />
          <Bar dataKey="count" fill="var(--esrc-green-800)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
