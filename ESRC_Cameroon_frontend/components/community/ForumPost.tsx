'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, ThumbsUp, PinIcon, Eye } from 'lucide-react'

interface ForumPostProps {
  post: {
    id: string
    title: string
    author: string
    category: string
    content: string
    views: number
    replies: number
    likes: number
    pinned: boolean
    createdAt: Date | string
  }
  locale?: string
  isLiked?: boolean
  displayLikes?: number
  onLike?: (e: React.MouseEvent, postId: string) => void
}

export function ForumPost({
  post,
  isLiked = false,
  displayLikes,
  onLike,
}: ForumPostProps) {
  const t = useTranslations('community')
  const likes = displayLikes ?? post.likes

  return (
    <Link href={`/community/${post.id}`}>
      <Card className="shadow-sm hover:shadow-lg transition-shadow cursor-pointer group">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {post.pinned && (
                  <PinIcon size={16} className="text-primary" aria-label="Pinned discussion" />
                )}
                <span className="inline-block bg-accent text-primary text-xs font-semibold px-3 py-1 rounded-full">
                  {post.category}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{post.content}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>{t('post.by')} {post.author}</span>
                <span>
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <div className="flex flex-col gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{(post.views ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle size={14} />
                  <span>{post.replies ?? 0}</span>
                </div>
                {onLike ? (
                  <button
                    type="button"
                    onClick={(e) => onLike(e, post.id)}
                    className={`flex items-center gap-1 transition-colors ${
                      isLiked ? 'text-primary font-semibold' : 'hover:text-primary/80'
                    }`}
                    aria-label={isLiked ? 'Unlike' : 'Like'}
                  >
                    <ThumbsUp size={14} fill={isLiked ? 'currentColor' : 'none'} />
                    <span>{likes}</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1">
                    <ThumbsUp size={14} />
                    <span>{likes}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
