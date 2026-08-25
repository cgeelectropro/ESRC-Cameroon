const SB = 'https://rohatzmiqhczybfbgjhj.supabase.co/storage/v1/object/public/media'

export const PLACEHOLDER_IMAGES = {
  hero: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM.jpeg`,
  courses: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-1.jpeg`,
  events: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.40-PM.jpeg`,
  research: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-2.jpeg`,
  community: `${SB}/WhatsApp-Image-2025-07-16-at-7.55.53-PM.jpeg`,
  advisory: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-3.jpeg`,
  opportunities: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-4.jpeg`,
  impact: `${SB}/WhatsApp-Image-2024-10-20-at-3.24.29-PM.jpeg`,
  about: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.47-PM-3.jpeg`,
  auth: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-3-1.jpeg`,
  blog: `${SB}/WhatsApp-Image-2024-10-20-at-3.24.29-PM-1.jpeg`,
  partners: `${SB}/WhatsApp-Image-2024-10-20-at-3.24.29-PM-2.jpeg`,
  contact: `${SB}/WhatsApp-Image-2025-09-19-at-7.18.47-PM-2.jpeg`,
} as const

/** Hero slideshow images — rotates on the homepage */
export const HERO_SLIDES = [
  `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM.jpeg`,
  `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-1.jpeg`,
  `${SB}/WhatsApp-Image-2025-09-19-at-7.18.46-PM-3.jpeg`,
  `${SB}/WhatsApp-Image-2025-09-19-at-7.18.47-PM-3.jpeg`,
  `${SB}/WhatsApp-Image-2025-09-19-at-7.18.40-PM.jpeg`,
  `${SB}/hero8.jpg`,
  `${SB}/3.jpg`,
]

export type PlaceholderImageKey = keyof typeof PLACEHOLDER_IMAGES
