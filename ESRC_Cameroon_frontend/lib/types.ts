export type UserRole = 'learner' | 'instructor' | 'fellow' | 'partner' | 'admin'
export type Language = 'en' | 'fr'
export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
export type Currency = 'XAF' | 'USD' | 'EUR'
export type PaymentMethod = 'mtn_momo' | 'orange_money' | 'stripe' | 'paypal'
export type OpportunityType = 'job' | 'internship' | 'fellowship' | 'grant' | 'competition'
export type PublicationType = 'policy_brief' | 'working_paper' | 'journal' | 'report' | 'dataset'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  avatar?: string
  bio?: string
  country: string
  city?: string
  preferredLanguage: Language
  enrolledCourses: string[]
  completedCourses: string[]
  certificates: Certificate[]
  createdAt: string
}

export interface Course {
  id: string
  title: string
  titleFr?: string
  description: string
  descriptionFr?: string
  instructor: Instructor & { user?: { firstName: string; lastName: string; email?: string } }
  price: number
  salePrice?: number
  currency: Currency
  isFree: boolean
  rating: number
  avgRating?: number
  reviewCount: number
  studentCount?: number
  students: number
  duration: string
  totalDuration?: number
  level: CourseLevel
  category: CourseCategory
  thumbnail: string
  previewVideo?: string
  language: Language | 'both'
  tags: string[]
  curriculum: Section[]
  sections?: Section[]
  requirements: string[]
  outcomes: string[]
  isPublished?: boolean
  status: CourseStatus
  isFeatured: boolean
  publishedAt?: string | null
  createdAt: string
  updatedAt: string
  ratingBreakdown?: Record<number, number>
}

export type CourseCategory = string

export type CourseStatus = 'PUBLISHED' | 'DRAFT' | 'PENDING' | 'PRIVATE' | 'TRASH'

export interface CourseCategoryDef {
  id: string
  slug: string
  nameEn: string
  nameFr: string
  order: number
  isActive: boolean
}

export interface Section {
  id: string
  title: string
  lessons: Lesson[]
}

export interface LessonContent {
  body?: string
  resources?: Array<{ type: 'link' | 'pdf' | 'video'; label: string; url: string }>
  estimatedReadTime?: number
}

export interface Lesson {
  id: string
  title: string
  type: 'VIDEO' | 'PDF' | 'QUIZ' | 'ASSIGNMENT' | 'LIVE' | 'video' | 'pdf' | 'quiz' | 'assignment' | 'live'
  duration?: string | number | null
  isPreview: boolean
  isCompleted?: boolean
  videoUrl?: string | null
  pdfUrl?: string | null
  content?: LessonContent | null
}

export interface Review {
  id: string
  rating: number
  comment?: string | null
  createdAt: string
  user: { firstName: string; lastName: string; avatar?: string | null }
}

export interface Instructor {
  id: string
  name: string
  avatar: string
  bio: string
  title: string
  organization?: string
  rating: number
  students: number
  courses: number
}

export interface Certificate {
  id: string
  courseId: string
  courseTitle: string
  issuedAt: string
  verificationCode: string
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  completedLessons: string[]
  enrolledAt: string
  completedAt?: string
}

export interface Publication {
  id: string
  title: string
  titleFr?: string
  abstract: string
  authors: string[]
  type: PublicationType
  publishedAt: string
  downloadUrl: string
  downloadCount: number
  tags: string[]
  doi?: string
}

export interface Event {
  id: string
  title: string
  titleFr?: string
  description: string
  type: 'conference' | 'workshop' | 'webinar' | 'study_tour' | 'training'
  date: string
  endDate?: string
  location: string
  isOnline: boolean
  meetingUrl?: string
  price: number
  currency: Currency
  isFree: boolean
  capacity: number
  registered: number
  thumbnail: string
  tags: string[]
}

export interface Opportunity {
  id: string
  title: string
  organization: string
  type: OpportunityType
  description: string
  deadline: string
  location: string
  isRemote: boolean
  salary?: string
  requirements: string[]
  applicationUrl: string
  tags: string[]
  postedAt: string
}

export interface AdvisorySession {
  id: string
  advisorId: string
  advisorName: string
  advisorAvatar: string
  advisorTitle: string
  type: '1on1' | 'group' | 'business_review'
  date: string
  duration: number
  price: number
  currency: Currency
  status: 'scheduled' | 'completed' | 'cancelled'
  notes?: string
  actionItems?: string[]
}

export interface ImpactStats {
  totalLearners: number
  coursesPublished: number
  countriesReached: number
  certificatesIssued: number
  researchPublications: number
  advisorySessions: number
  eventsHosted: number
  fellowsHosted: number
  partnerOrganizations: number
  entrepreneursSupported: number
}

export interface ForumPost {
  id: string
  title: string
  content: string
  author: Pick<User, 'id' | 'firstName' | 'lastName' | 'avatar' | 'role'>
  category: string
  replies: number
  views: number
  likes: number
  isLiked: boolean
  isPinned: boolean
  createdAt: string
  lastActivity: string
}

export interface PaymentIntent {
  id: string
  amount: number
  currency: Currency
  method: PaymentMethod
  status: 'pending' | 'processing' | 'completed' | 'failed'
  referenceCode?: string
  phoneNumber?: string
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  success: boolean
  pendingInstructorApproval?: boolean
}

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface InstructorApprovalRequest {
  id: string
  userId: string
  status: ApprovalStatus
  title: string
  organization?: string
  expertise: string[]
  bio?: string
  phone?: string
  linkedinUrl?: string
  portfolioUrl?: string
  motivation?: string
  rejectionReason?: string
  adminNotes?: string
  createdAt: string
  reviewedAt?: string
}

export interface Testimonial {
  id: string
  quote: string
  name: string
  title: string
  location: string
  avatar: string
}

export interface Mentor {
  id: string
  name: string
  title: string
  specialization: string
  image: string
  availability: string
  bio: string
  sessions: number
}

export interface SuccessStory {
  id: string
  name: string
  title: string
  story: string
  impact: string
  image: string
  quote: string
  year: number
}

export interface ImpactMetric {
  id: string
  label: string
  value: number
  icon: string
  color: string
  sdg: number[]
}

// Extended types for mock data (API transforms to Event/Publication when needed)
export interface EventMockItem {
  id: string
  title: string
  description?: string
  date: Date | string
  startTime?: string
  endTime?: string
  location?: string
  capacity?: number
  registered?: number
  type?: string
  image?: string
  featured?: boolean
}

export interface PublicationMockItem {
  id: string
  title: string
  authors: string | string[]
  year?: number
  journal?: string
  doi?: string
  type?: string
  abstract?: string
  downloads?: number
  citations?: number
}

export interface OpportunityMockItem {
  id: string
  title: string
  type?: string
  organization?: string
  location?: string
  salary?: string
  deadline?: Date | string
  featured?: boolean
  description?: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  bio?: string
  photo?: string
  email?: string
  linkedin?: string
  order: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface AboutStat {
  id: string
  number: string
  labelEn: string
  labelFr: string
  order: number
  createdAt?: string
  updatedAt?: string
}
