'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { useAuthOptional } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, ThumbsUp, PinIcon, ArrowLeft } from 'lucide-react'

interface ForumPost {
  id: string
  title: string
  author?: string
  category: string
  content: string
  views: number
  replies: number
  likes: number
  pinned: boolean
  createdAt: string | Date
  user?: { firstName: string; lastName: string }
}

interface Reply {
  id: string
  postId: string
  author?: string
  content: string
  createdAt: string | Date
  likes: number
  user?: { firstName: string; lastName: string }
}

export default function DiscussionPage() {
  const params = useParams()
  const locale = useLocale()
  const t = useTranslations('community')
  const auth = useAuthOptional()
  const isAuthenticated = auth?.isAuthenticated ?? false
  const id = params.id as string

  const [post, setPost] = useState<ForumPost | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyText, setReplyText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  useEffect(() => {
    Promise.all([
      apiClient.getForumPosts(),
      apiClient.getForumPost(id),
    ])
      .then(([listRes, detailRes]) => {
        const list = (listRes.success && listRes.data
          ? Array.isArray(listRes.data) ? listRes.data : []
          : []) as ForumPost[]
        const found = list.find((p) => p.id === id)
        if (found) {
          const author = found.author ?? (found.user ? `${found.user.firstName} ${found.user.lastName}` : 'Anonymous')
          setPost({ ...found, author })
          setLikeCount(found.likes ?? 0)
        }
        const d = detailRes.success && detailRes.data ? detailRes.data : null
        const rawReplies = Array.isArray((d as { replies?: Reply[] })?.replies)
          ? (d as { replies: Reply[] }).replies
          : []
        setReplies(rawReplies.map((r) => ({
          ...r,
          author: r.author ?? (r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'),
        })))
      })
      .finally(() => setLoading(false))
  }, [id])

  const handleLike = () => {
    setLiked((prev) => !prev)
    setLikeCount((c) => (liked ? c - 1 : c + 1))
  }

  const handleReply = async () => {
    if (!replyText.trim()) return
    setSubmitting(true)
    try {
      if (isAuthenticated) {
        await apiClient.replyToPost(id, replyText)
        const detailRes = await apiClient.getForumPost(id)
        if (detailRes.success && detailRes.data) {
          const d = detailRes.data as { replies?: Reply[] }
          if (Array.isArray(d.replies)) {
            setReplies(d.replies.map((r) => ({
              ...r,
              author: r.author ?? (r.user ? `${r.user.firstName} ${r.user.lastName}` : 'Anonymous'),
            })))
          }
        }
      } else {
        const newReply: Reply = {
          id: `r-${Date.now()}`,
          postId: id,
          author: 'You',
          content: replyText,
          createdAt: new Date().toISOString(),
          likes: 0,
        }
        setReplies((prev) => [...prev, newReply])
      }
      setReplyText('')
      if (post) setPost((p) => (p ? { ...p, replies: p.replies + 1 } : null))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-esrc-green-700" />
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
            <h1 className="text-2xl font-display text-foreground mb-4">{t('post.notFound')}</h1>
            <Link href={`/${locale}/community`}>
              <Button variant="outline">{t('post.backToCommunity')}</Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const created = typeof post.createdAt === 'string' ? new Date(post.createdAt) : post.createdAt

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-3xl">
          <Link
            href={`/${locale}/community`}
            className="inline-flex items-center gap-2 text-esrc-green-700 hover:text-esrc-green-900 mb-8"
          >
            <ArrowLeft size={20} />
            {t('post.backToCommunity')}
          </Link>

          <Card className="shadow-lg overflow-hidden">
            <CardContent className="pt-6 pb-6">
              <div className="flex items-center gap-2 mb-4">
                {post.pinned && (
                  <span title={t('post.pinned')}>
                    <PinIcon size={16} className="text-esrc-green-700" />
                  </span>
                )}
                <span className="bg-esrc-green-100 text-esrc-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>

              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                {post.title}
              </h1>
              <p className="text-muted-foreground mb-6 whitespace-pre-wrap">{post.content}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground pb-4 border-b">
                <span>{t('post.by')} {post.author}</span>
                <span>
                  {created.toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </span>
                <span>{(post.views ?? 0).toLocaleString()} {t('post.views')}</span>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`flex items-center gap-1 transition-colors ${
                      liked ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <ThumbsUp size={18} fill={liked ? 'currentColor' : 'none'} />
                    <span>{likeCount}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={18} />
                    {replies.length}
                  </span>
                </div>
              </div>

              {/* Reply form */}
              <div className="mt-6">
                <h3 className="font-semibold text-foreground mb-3">{t('post.addReply')}</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder={t('post.replyPlaceholder')}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  />
                  <Button
                    onClick={handleReply}
                    disabled={submitting || !replyText.trim()}
                    className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
                  >
                    {submitting ? t('post.posting') : t('post.reply')}
                  </Button>
                </div>
              </div>

              {/* Replies */}
              <div className="mt-8 space-y-4">
                <h3 className="font-semibold text-foreground">
                  {t('post.replies')} ({replies.length})
                </h3>
                {replies.length === 0 ? (
                  <p className="text-muted-foreground text-sm">{t('post.noReplies')}</p>
                ) : (
                  replies.map((r) => (
                    <div key={r.id} className="p-4 rounded-lg border bg-muted/50">
                      <p className="text-sm font-medium text-foreground mb-1">{r.author}</p>
                      <p className="text-muted-foreground text-sm">{r.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(r.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
