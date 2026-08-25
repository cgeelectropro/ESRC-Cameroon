'use client'

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { InstructorSidebar } from '@/components/layout/InstructorSidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function InstructorRevenuePage() {
  const [data, setData] = useState<{ month: string; revenue: number }[]>([])

  useEffect(() => {
    apiClient.getInstructorRevenue().then((res) => {
      if (res.success && res.data) setData(Array.isArray(res.data) ? res.data as { month: string; revenue: number }[] : [])
    })
  }, [])

  const total = data.reduce((s, i) => s + i.revenue, 0)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <InstructorSidebar />
        <main className="flex-1 section-padding">
          <div className="container-width">
            <h1 className="font-display text-4xl text-esrc-green-900 mb-8">Revenue</h1>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Total Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-esrc-gold-500">{total.toLocaleString()} XAF</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.map((row) => (
                    <div key={row.month} className="flex justify-between py-2 border-b last:border-0">
                      <span>{row.month}</span>
                      <span className="font-semibold">{row.revenue.toLocaleString()} XAF</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
