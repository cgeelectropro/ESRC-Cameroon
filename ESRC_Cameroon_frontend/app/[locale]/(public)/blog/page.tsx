'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api-client'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Card, CardContent } from '@/components/ui/card'
import { useLocale } from 'next-intl'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  publishedAt: string
  author: string
}

export default function BlogPage() {
  const locale = useLocale()
  const [posts, setPosts] = useState<BlogPost[]>([])

  useEffect(() => {
    apiClient.getBlogPosts().then((res) => {
      if (res.success && res.data) setPosts(Array.isArray(res.data) ? res.data as BlogPost[] : [])
    })
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title="Blog & News"
        subtitle="Insights, stories, and updates from the ESRC community."
        imageKey="blog"
      />

      <main className="flex-grow section-padding">
        <div className="container-width">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Link key={post.id} href={`/${locale}/blog/${post.slug}`}>
                <Card className="h-full shadow-sm hover:shadow-lg transition-all card-hover">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-2">
                      {new Date(post.publishedAt).toLocaleDateString()} • {post.author}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-foreground mb-2 line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
