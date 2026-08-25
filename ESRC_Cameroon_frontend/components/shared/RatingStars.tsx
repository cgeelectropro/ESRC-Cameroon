import { Star } from 'lucide-react'

interface RatingStarsProps {
  rating: number
  size?: number
  showLabel?: boolean
}

export function RatingStars({ rating, size = 16, showLabel = false }: RatingStarsProps) {
  const fullStars = Math.floor(rating)
  const hasHalfStar = rating % 1 !== 0

  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative">
            <Star
              size={size}
              className="text-muted fill-muted"
            />
            {i < fullStars && (
              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '100%' }}>
                <Star
                  size={size}
                  className="text-esrc-gold-500 fill-esrc-gold-500"
                />
              </div>
            )}
            {i === fullStars && hasHalfStar && (
              <div className="absolute top-0 left-0 overflow-hidden" style={{ width: '50%' }}>
                <Star
                  size={size}
                  className="text-esrc-gold-500 fill-esrc-gold-500"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      {showLabel && <span className="text-sm font-medium text-esrc-mid">{rating}</span>}
    </div>
  )
}
