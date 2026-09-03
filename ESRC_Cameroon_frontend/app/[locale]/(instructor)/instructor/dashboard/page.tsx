'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useLocale } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, DollarSign, BookOpen, Star } from 'lucide-react'

// Keeps recharts (a large dependency) out of this route's main bundle — it's
// only needed once the revenue card actually renders.
const RevenueChart = dynamic(
  () => import('@/components/shared/RevenueChart').then((m) => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-64 w-full animate-pulse bg-muted rounded" /> }
)

export default function InstructorDashboardPage() {
  const locale = useLocale()
  const [revenue, setRevenue] = useState<{ month: string; revenue: number }[]>([])
  const [stats, setStats] = useState({ totalStudents: 0, revenue: 0, courses: 0, rating: 0 })

  useEffect(() => {
    apiClient.getInstructorRevenue().then((res) => {
      if (res.success && res.data) {
        const d = (Array.isArray(res.data) ? res.data : []) as { month?: string; revenue?: number }[]
        setRevenue(d as { month: string; revenue: number }[])
        setStats({
          totalStudents: 2450,
          revenue: d.reduce((s: number, i) => s + (i.revenue ?? 0), 0),
          courses: 4,
          rating: 4.8,
        })
      }
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <InstructorSidebar />
        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <h1 className="font-display text-4xl text-esrc-green-900">Instructor Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Students</p>
                      <p className="text-2xl font-bold text-esrc-green-700">{stats.totalStudents}</p>
                    </div>
                    <Users size={32} className="text-esrc-green-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Revenue (XAF)</p>
                      <p className="text-2xl font-bold text-esrc-gold-500">{stats.revenue.toLocaleString()}</p>
                    </div>
                    <DollarSign size={32} className="text-esrc-gold-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Courses</p>
                      <p className="text-2xl font-bold text-esrc-earth">{stats.courses}</p>
                    </div>
                    <BookOpen size={32} className="text-amber-200" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Rating</p>
                      <p className="text-2xl font-bold text-esrc-green-700">{stats.rating}</p>
                    </div>
                    <Star size={32} className="text-esrc-gold-200" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue (Last 6 Months)</CardTitle>
                <CardDescription>Monthly earnings from course enrollments</CardDescription>
              </CardHeader>
              <CardContent>
                <RevenueChart revenue={revenue} />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Link href={`/${locale}/instructor/courses/new`}>
                <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-esrc-dark">Create New Course</Button>
              </Link>
              <Link href={`/${locale}/instructor/analytics`}>
                <Button variant="outline">View Analytics</Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
