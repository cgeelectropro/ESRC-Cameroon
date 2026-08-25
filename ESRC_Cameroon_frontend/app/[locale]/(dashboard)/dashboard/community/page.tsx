import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageCircle, ThumbsUp } from 'lucide-react'

export default function CommunityDashboardPage() {
  const posts = [
    {
      id: '1',
      title: 'How to start a tech business in Cameroon?',
      author: 'Amara',
      replies: 12,
      likes: 24,
    },
    {
      id: '2',
      title: 'Share your business success story',
      author: 'Jean',
      replies: 8,
      likes: 18,
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
              <h1 className="font-display text-4xl text-foreground mb-2">Community</h1>
              <p className="text-muted-foreground">Connect with other learners and entrepreneurs</p>
            </div>
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold text-lg text-foreground mb-2">{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">By {post.author}</p>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageCircle size={16} />
                        <span className="text-sm">{post.replies} replies</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ThumbsUp size={16} />
                        <span className="text-sm">{post.likes} likes</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Button className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white">
              Start Discussion
            </Button>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
