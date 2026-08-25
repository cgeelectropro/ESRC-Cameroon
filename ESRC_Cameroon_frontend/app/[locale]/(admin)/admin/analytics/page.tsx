'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Users, BookOpen, TrendingUp, Star } from 'lucide-react'

interface AnalyticsData {
  usersByRole: Array<{ role: string; _count: number }>
  coursesByCategory: Array<{ category: string; _count: number }>
  topCourses: Array<{ id: string; title: string; studentCount: number; avgRating: number; category: string }>
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient.getAdminAnalytics().then(r => { if (r.success) setData(r.data as unknown as AnalyticsData) }).finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Insights into platform usage and growth</p>
      </div>

      {loading ? <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mt-20" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500"/><h2 className="font-semibold">Users by Role</h2>
            </div>
            <div className="p-5 space-y-3">
              {(data?.usersByRole ?? []).map(r => {
                const total = data?.usersByRole.reduce((s,x)=>s+(x._count||0),0) || 1
                const pct = Math.round(((r._count||0)/total)*100)
                return (
                  <div key={r.role}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{r.role}</span>
                      <span className="text-muted-foreground">{r._count} ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Courses by Category */}
          <div className="bg-card border border-border rounded-xl">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-green-500"/><h2 className="font-semibold">Courses by Category</h2>
            </div>
            <div className="p-5 space-y-3">
              {(data?.coursesByCategory ?? []).map(c => {
                const total = data?.coursesByCategory.reduce((s,x)=>s+(x._count||0),0) || 1
                const pct = Math.round(((c._count||0)/total)*100)
                return (
                  <div key={c.category}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{c.category.replace(/_/g,' ')}</span>
                      <span className="text-muted-foreground">{c._count} courses ({pct}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full transition-all" style={{width:`${pct}%`}}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Top Courses */}
          <div className="bg-card border border-border rounded-xl lg:col-span-2">
            <div className="p-5 border-b border-border flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500"/><h2 className="font-semibold">Top Courses by Enrollment</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    {['#','Course','Category','Students','Rating'].map(h=><th key={h} className="py-3 px-4 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(data?.topCourses??[]).map((c,i)=>(
                    <tr key={c.id} className="hover:bg-accent/30 transition-colors">
                      <td className="py-3 px-4 text-muted-foreground font-medium">#{i+1}</td>
                      <td className="py-3 px-4 font-medium">{c.title}</td>
                      <td className="py-3 px-4 text-muted-foreground">{c.category.replace(/_/g,' ')}</td>
                      <td className="py-3 px-4 text-muted-foreground">{(c.studentCount||0).toLocaleString()}</td>
                      <td className="py-3 px-4 text-muted-foreground flex items-center gap-1"><Star className="w-3 h-3 text-yellow-500 fill-yellow-500"/>{c.avgRating != null ? c.avgRating.toFixed(1) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
