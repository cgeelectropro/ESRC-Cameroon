'use client'

import { useState, useEffect } from 'react'
import { Star, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { apiClient } from '@/lib/api-client'
import { useAuthOptional } from '@/contexts/AuthContext'
import type { Review } from '@/lib/types'

interface Props {
  courseId: string
  progressPct: number
}

function StarRating({ value, onChange }: { value: number; onChange?: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHovered(star)}
          onMouseLeave={() => onChange && setHovered(0)}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
          disabled={!onChange}
        >
          <Star
            size={onChange ? 24 : 16}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-esrc-gold-500 text-esrc-gold-500'
                : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function ReviewAvatar({ user }: { user: { firstName: string; lastName: string; avatar?: string | null } }) {
  const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={`${user.firstName} ${user.lastName}`}
        className="w-9 h-9 rounded-full object-cover"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none'
        }}
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-esrc-green-700 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
      {initials}
    </div>
  )
}

export function CourseReviews({ courseId, progressPct }: Props) {
  const auth = useAuthOptional()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const canReview = auth?.isAuthenticated && progressPct >= 50

  useEffect(() => {
    apiClient.getCourseReviews(courseId).then((res) => {
      if (res.success && res.data) setReviews(res.data as Review[])
      setLoading(false)
    })
  }, [courseId])

  const handleSubmit = async () => {
    if (!rating || submitting) return
    setSubmitting(true)
    try {
      const res = await apiClient.addReview(courseId, { rating, comment: comment.trim() || undefined })
      if (res.success) {
        setSubmitted(true)
        // Reload reviews
        const r = await apiClient.getCourseReviews(courseId)
        if (r.success && r.data) setReviews(r.data as Review[])
      }
    } finally {
      setSubmitting(false)
    }
  }

  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null

  return (
    <div className="space-y-6">
      {/* Summary */}
      {reviews.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-xl">
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground">{avgRating}</p>
            <StarRating value={Math.round(Number(avgRating))} />
            <p className="text-xs text-muted-foreground mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex-1 space-y-1">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = reviews.filter((r) => r.rating === star).length
              const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0
              return (
                <div key={star} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="w-3">{star}</span>
                  <Star size={10} className="fill-esrc-gold-500 text-esrc-gold-500" />
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-esrc-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Write review */}
      {canReview && !submitted && (
        <div className="border border-border rounded-xl p-5 space-y-3 bg-card">
          <h4 className="font-semibold text-foreground">Rate this course</h4>
          <StarRating value={rating} onChange={setRating} />
          <Textarea
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <Button
            onClick={handleSubmit}
            disabled={!rating || submitting}
            className="bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
            size="sm"
          >
            <Send size={14} className="mr-2" />
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      )}

      {submitted && (
        <div className="p-4 bg-esrc-green-50 dark:bg-esrc-green-900/20 border border-esrc-green-200 dark:border-esrc-green-800 rounded-xl text-sm text-esrc-green-700 dark:text-esrc-green-300">
          Thank you for your review!
        </div>
      )}

      {!canReview && auth?.isAuthenticated && progressPct < 50 && (
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          Complete at least 50% of the course to leave a review ({Math.round(progressPct)}% done).
        </p>
      )}

      {!auth?.isAuthenticated && (
        <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          Log in to leave a review.
        </p>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-muted flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-muted rounded w-32" />
                <div className="h-3 bg-muted rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No reviews yet. Be the first!</p>
      ) : (
        <div className="space-y-5">
          {reviews.map((review) => (
            <div key={review.id} className="flex gap-3">
              <ReviewAvatar user={review.user} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-foreground">
                    {review.user.firstName} {review.user.lastName}
                  </span>
                  <StarRating value={review.rating} />
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-sm text-foreground leading-relaxed">{review.comment}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
