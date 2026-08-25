'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { useLocale } from 'next-intl'
import { apiClient } from '@/lib/api-client'

interface BlogPost {
  id: string
  slug: string
  title: string
  excerpt: string
  content?: string
  author: string
  publishedAt: string
}

export default function BlogPostPage() {
  const params = useParams()
  const locale = useLocale()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        const p = data.data ?? data
        setPost(p ? { ...p, publishedAt: p.publishedAt || p.publishedAt } : null)
      })
      .catch(() => setPost(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-display text-foreground mb-2">Post Not Found</h1>
            <Link href={`/${locale}/blog`}>
              <Button variant="outline">Back to Blog</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const publishedAt = typeof post.publishedAt === 'string' ? post.publishedAt : (post.publishedAt != null ? String(post.publishedAt) : '')

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-2xl">
          <Link
            href={`/${locale}/blog`}
            className="inline-flex items-center gap-2 text-esrc-green-700 hover:text-esrc-green-900 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Blog
          </Link>

          <Card className="shadow-lg">
            <CardContent className="pt-8 pb-8">
              <p className="text-sm text-muted-foreground mb-4">
                {new Date(publishedAt).toLocaleDateString()} • {post.author}
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-6">
                {post.title}
              </h1>
              <div className="prose max-w-none text-foreground leading-relaxed">
                <p>{post.content || post.excerpt}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
