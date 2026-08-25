'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { apiClient } from '@/lib/api-client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Newspaper } from 'lucide-react'
import { EmptyState } from '@/components/shared/EmptyState'

interface NewsItem {
  id: string
  slug?: string
  title: string
  excerpt?: string
  publishedAt: string
  author?: string
}

export function NewsSection() {
  const t = useTranslations('news')
  const tCommon = useTranslations('common')
  const [posts, setPosts] = useState<NewsItem[]>([])

  useEffect(() => {
    apiClient.getBlogPosts().then((res) => {
      if (res.success && res.data) {
        const arr = Array.isArray(res.data) ? res.data : []
        setPosts(arr.slice(0, 4) as NewsItem[])
      }
    }).catch(() => setPosts([]))
  }, [])

  return (
    <section className="section-padding bg-background">
      <div className="container-width">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-4xl font-bold text-foreground">{t('title')}</h2>
          <Link href="/blog">
            <Button variant="outline" className="rounded-lg">{t('viewAll')}</Button>
          </Link>
        </div>
        {posts.length === 0 && (
          <EmptyState heading={t('noNews')} subtext="" />
        )}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug || post.id}`}>
              <Card className="h-full shadow-sm hover:shadow-lg transition-all card-hover bg-card border-border">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                    <Newspaper size={24} className="text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(post.publishedAt).toLocaleDateString()} {post.author && `• ${post.author}`}
                  </p>
                  <h3 className="font-display font-semibold text-foreground mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                  )}
                  <span className="text-sm text-primary font-medium mt-2 inline-block hover:underline">
                    {tCommon('readMore')} →
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
