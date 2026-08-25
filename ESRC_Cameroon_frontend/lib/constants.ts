// Site Configuration
export const SITE_NAME = 'ESRC Cameroon'
export const SITE_DESCRIPTION = 'Unlocking Human Potential Across Africa'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://esrccameroon.org'

// Contact Information
export const CONTACT_EMAIL = 'info@esrccameroon.org'
export const CONTACT_PHONE = '+237 677 948 904 / 677 775 535'
export const CONTACT_ADDRESS = 'UP-Station Bamenda; Opposite Tradex Nomayous, Yaoundé, Cameroon'

// Social Media
export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/nextgenafrica',
  facebook: 'https://facebook.com/nextgenafrica',
  linkedin: 'https://linkedin.com/company/nextgen-africa',
  instagram: 'https://instagram.com/nextgenafrica',
}

// Course Status
export const COURSE_STATUS_LABELS: Record<string, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  PENDING: 'Pending Review',
  PRIVATE: 'Private',
  TRASH: 'Trash',
}

export const COURSE_STATUS_COLORS: Record<string, string> = {
  PUBLISHED: 'bg-green-100 text-green-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-amber-100 text-amber-800',
  PRIVATE: 'bg-blue-100 text-blue-800',
  TRASH: 'bg-red-100 text-red-800',
}

// Course Levels
export const COURSE_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const

// Pricing
export const CURRENCIES = {
  XAF: { symbol: 'FCFA', name: 'Central African CFA Franc' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '€', name: 'Euro' },
} as const

// Payment Methods Available in Africa
export const PAYMENT_METHODS = {
  mtn_momo: 'MTN Mobile Money',
  orange_money: 'Orange Money',
  stripe: 'Stripe',
  paypal: 'PayPal',
} as const

// Event Types
export const EVENT_TYPES = [
  'conference',
  'workshop',
  'webinar',
  'study_tour',
  'training',
] as const

// User Roles
export const USER_ROLES = [
  'learner',
  'instructor',
  'fellow',
  'partner',
  'admin',
] as const

// Learning Levels
export const LEARNING_LEVELS = [
  'Beginner',
  'Intermediate',
  'Advanced',
] as const

// Opportunity Types
export const OPPORTUNITY_TYPES = [
  'job',
  'internship',
  'fellowship',
  'grant',
  'competition',
] as const

// Publication Types
export const PUBLICATION_TYPES = [
  'policy_brief',
  'working_paper',
  'journal',
  'report',
  'dataset',
] as const

// Routes
export const ROUTES = {
  HOME: '/',
  COURSES: '/courses',
  COURSE_DETAIL: (id: string) => `/courses/${id}`,
  RESEARCH: '/research',
  EVENTS: '/events',
  ADVISORY: '/advisory',
  COMMUNITY: '/community',
  OPPORTUNITIES: '/opportunities',
  IMPACT: '/impact',
  BLOG: '/blog',
  ABOUT: '/about',
  CONTACT: '/contact',
  PARTNERS: '/partners',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  DASHBOARD: '/dashboard',
  MY_COURSES: '/dashboard/my-courses',
  LEARNING_PATH: '/dashboard/learning-path',
  CERTIFICATES: '/dashboard/certificates',
  PROFILE: '/dashboard/profile',
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
} as const

// API Endpoints
export const API_ENDPOINTS = {
  COURSES: '/api/courses',
  EVENTS: '/api/events',
  RESEARCH: '/api/research/publications',
  OPPORTUNITIES: '/api/opportunities',
  IMPACT_STATS: '/api/impact/stats',
  AUTH_LOGIN: '/api/auth/login',
  AUTH_REGISTER: '/api/auth/register',
  AUTH_LOGOUT: '/api/auth/logout',
  AUTH_SESSION: '/api/auth/session',
  USER_PROFILE: '/api/user/profile',
  USER_DASHBOARD: '/api/user/dashboard',
} as const

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  COURSE_LIMIT: 6,
  EVENT_LIMIT: 3,
} as const

// Feature Flags
export const FEATURES = {
  BILINGUAL: true,
  DARK_MODE: true,
  LIVE_CHAT: false, // Coming soon
  AI_ASSISTANT: true,
  PAYMENTS: true,
  CERTIFICATES: true,
} as const

// Theme Colors
export const THEME_COLORS = {
  primary: 'esrc-green-700',
  secondary: 'esrc-gold-500',
  success: 'green-500',
  warning: 'yellow-500',
  danger: 'red-500',
  info: 'blue-500',
} as const
