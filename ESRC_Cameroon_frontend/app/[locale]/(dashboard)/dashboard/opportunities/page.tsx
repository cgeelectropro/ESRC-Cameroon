import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock } from 'lucide-react'

export default function OpportunitiesDashboardPage() {
  const applications = [
    {
      id: '1',
      title: 'Tech Startup Fellowship',
      status: 'Applied',
      date: '2024-01-15',
      statusColor: 'bg-blue-50 text-blue-700',
    },
    {
      id: '2',
      title: 'Women in Business Grant',
      status: 'Accepted',
      date: '2024-01-10',
      statusColor: 'bg-green-50 text-green-700',
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="flex flex-1 pt-20">
        <Sidebar />
        <main className="flex-1 section-padding">
          <div className="container-width space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">My Applications</h1>
              <p className="text-muted-foreground">Track your job, internship, and opportunity applications</p>
            </div>
            <div className="space-y-4">
              {applications.map((app) => (
                <Card key={app.id} className="shadow-sm">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-esrc-dark mb-1">
                          {app.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Applied {new Date(app.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge className={app.statusColor}>
                          {app.status === 'Applied' ? (
                            <Clock size={14} className="mr-1" />
                          ) : (
                            <CheckCircle size={14} className="mr-1" />
                          )}
                          {app.status}
                        </Badge>
                        <Button variant="outline">View Details</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-700 text-foreground">
              Browse More Opportunities
            </Button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
