'use client'

import type { PlaceholderImageKey } from '@/lib/placeholders'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholders'

interface PageHeroProps {
  title: string
  subtitle?: string
  imageKey?: PlaceholderImageKey
  children?: React.ReactNode
}

export function PageHero({ title, subtitle, imageKey, children }: PageHeroProps) {
  const bgImage = imageKey ? PLACEHOLDER_IMAGES[imageKey] : undefined

  return (
    <div className="relative overflow-hidden">
      {/* Background image or gradient */}
      {bgImage ? (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${bgImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-esrc-green-900/80 via-esrc-green-700/60 to-esrc-green-500/40" />
        </>
      ) : (
        <div className="absolute inset-0 bg-gradient-to-r from-esrc-green-900 via-esrc-green-700 to-esrc-green-500" />
      )}

      {/* Content */}
      <div className="relative z-10 pt-24 md:pt-28 pb-16 md:pb-20">
        <div className="container-width section-padding">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-white mb-4 text-balance">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
