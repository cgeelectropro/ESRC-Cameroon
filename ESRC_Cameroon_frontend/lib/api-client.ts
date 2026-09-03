import type { ApiResponse, Course, Event, ImpactStats, Opportunity, Publication, User, TeamMember, AboutStat } from './types'
import { getStoredToken, getStoredRefreshToken, setAuth, clearAuth } from './auth-storage'

const BASE = '/api'

async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    return {
      success: false,
      error: (err as { error?: string }).error || `HTTP ${response.status}`,
    }
  }
  const json = await response.json()
  return {
    success: true,
    data: (json.data ?? json) as T,
    ...json,
  }
}

/** Build headers for authenticated requests */
function authHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? getStoredToken() : null
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

/** Fetch with auth, retry once on 401 after refresh */
async function authFetch(
  url: string,
  init: RequestInit = {},
  retried = false
): Promise<Response> {
  const isFormData = init.body instanceof FormData
  const ah = authHeaders()
  const headers = isFormData ? (ah.Authorization ? { Authorization: ah.Authorization } : {}) : ah
  const mergedHeaders = { ...headers, ...(init.headers as Record<string, string>) }
  if (isFormData) delete (mergedHeaders as Record<string, string>)['Content-Type']
  const res = await fetch(url, {
    ...init,
    headers: mergedHeaders,
  })
  if (res.status === 401 && !retried) {
    const refresh = typeof window !== 'undefined' ? getStoredRefreshToken() : null
    if (refresh) {
      const refreshRes = await fetch(`${BASE}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refresh }),
      })
      const refreshJson = await refreshRes.json().catch(() => ({}))
      const data = refreshJson.data ?? refreshJson
      if (data?.token && data?.user) {
        setAuth(data.token, data.user, data.refreshToken ?? null)
        return authFetch(url, init, true)
      }
    }
    clearAuth()
  }
  return res
}

export const apiClient = {
  // Courses
  getCourses: async (params?: Record<string, string>) => {
    const response = await fetch(`${BASE}/courses?${new URLSearchParams(params || {})}`)
    return handleResponse<Course[]>(response)
  },

  createCourse: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ id: string }>(response)
  },

  updateCourse: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/courses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return handleResponse<unknown>(response)
  },

  getCourse: async (id: string) => {
    const response = await fetch(`${BASE}/courses/${id}`)
    const result = await handleResponse<Course | { course: Course }>(response)
    if (result.success && result.data) {
      const course = Array.isArray(result.data) ? undefined : (result.data as { course?: Course }).course ?? (result.data as Course)
      return course ? { ...result, data: course } : result
    }
    return result
  },

  getCoursePreview: async (id: string) => {
    const response = await authFetch(`${BASE}/courses/preview/${id}`, {})
    const result = await handleResponse<Course | { course: Course }>(response)
    if (result.success && result.data) {
      const course = Array.isArray(result.data) ? undefined : (result.data as { course?: Course }).course ?? (result.data as Course)
      return course ? { ...result, data: course } : result
    }
    return result
  },

  enrollCourse: async (courseId: string) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/enroll`, { method: 'POST' })
    return handleResponse<{ enrollmentId: string }>(response)
  },

  getCourseProgress: async (courseId: string) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/progress`, {})
    return handleResponse<{ progress: number; completed: number; total: number; enrollment: unknown; completions: unknown[] }>(response)
  },

  completeLesson: async (courseId: string, lessonId: string) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/lessons/${lessonId}/complete`, { method: 'POST' })
    return handleResponse<{ progress: number; completed: number; total: number }>(response)
  },

  getLesson: async (courseId: string, lessonId: string) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/lessons/${lessonId}`, {})
    return handleResponse<{ id: string; title: string; type: string; videoUrl?: string | null; pdfUrl?: string | null; duration?: number | null; content?: Record<string, unknown> | null }>(response)
  },

  getCourseReviews: async (courseId: string) => {
    const response = await fetch(`${BASE}/courses/${courseId}/reviews`)
    return handleResponse<Array<{ id: string; rating: number; comment?: string | null; createdAt: string; user: { firstName: string; lastName: string; avatar?: string | null } }>>(response)
  },

  addReview: async (courseId: string, data: { rating: number; comment?: string }) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ id: string }>(response)
  },

  getUserEnrollments: async () => {
    const response = await authFetch(`${BASE}/user/enrollments`, {})
    return handleResponse<Array<{ id: string; courseId: string; progress: number; progressPct: number; course: { id: string; title: string; thumbnail?: string }; totalLessons: number }>>(response)
  },

  getCertificates: async () => {
    const response = await authFetch(`${BASE}/certificates`, {})
    return handleResponse<Array<{ id: string; courseId: string; courseName: string; issuedAt: string; verificationCode: string; pdfUrl?: string | null }>>(response)
  },

  verifyCertificate: async (code: string) => {
    const response = await fetch(`${BASE}/certificates/verify/${code}`)
    return handleResponse<{ id: string; courseName: string; verificationCode: string; issuedAt: string; user?: { firstName: string; lastName: string } }>(response)
  },

  getCertificateDownloadUrl: async (id: string) => {
    const response = await authFetch(`${BASE}/certificates/${id}/download?url=1`, {})
    const json = await response.json()
    if (json.success && json.url) return { success: true, url: json.url }
    return { success: false, error: json.error || 'Failed to get download URL' }
  },

  // Auth
  login: async (email: string, password: string) => {
    try {
      const response = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        headers: { 'Content-Type': 'application/json' },
      })
      return handleResponse<{ user: User; token: string; refreshToken?: string | null }>(response)
    } catch {
      return { success: false as const, error: 'Unable to connect. Please try again.' }
    }
  },

  register: async (data: object) => {
    const response = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ user: User; token: string; refreshToken?: string | null }>(response)
  },

  refreshToken: async () => {
    const refresh = typeof window !== 'undefined' ? getStoredRefreshToken() : null
    if (!refresh) return { success: false, error: 'No refresh token' }
    const response = await fetch(`${BASE}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refresh }),
    })
    return handleResponse<{ user: User; token: string; refreshToken?: string | null }>(response)
  },

  logout: async () => {
    const response = await authFetch(`${BASE}/auth/logout`, { method: 'POST' })
    return handleResponse<void>(response)
  },

  getSession: async () => {
    const response = await authFetch(`${BASE}/auth/session`, {})
    return handleResponse<User>(response)
  },

  // Advisory / Mentors
  getMentors: async () => {
    const response = await fetch(`${BASE}/mentors`)
    return handleResponse<unknown[]>(response)
  },

  getAdvisorySessions: async () => {
    const response = await authFetch(`${BASE}/advisory/sessions`, {})
    return handleResponse<unknown[]>(response)
  },

  getMyAdvisorySessions: async () => {
    const response = await authFetch(`${BASE}/advisory/my-sessions`, {})
    return handleResponse<unknown[]>(response)
  },

  bookAdvisory: async (data: object) => {
    const response = await authFetch(`${BASE}/advisory/book`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    })
    return handleResponse<{ sessionId: string }>(response)
  },

  // Research
  getPublications: async (params?: Record<string, string>) => {
    const response = await fetch(`${BASE}/research/publications?${new URLSearchParams(params || {})}`)
    const result = await handleResponse<Publication[] | { publications?: Publication[] }>(response)
    if (result.success && result.data == null) {
      const pubs = (result as unknown as { publications?: Publication[] }).publications
      if (pubs) return { ...result, data: pubs }
    }
    return result
  },

  // Events
  getEvents: async () => {
    const response = await fetch(`${BASE}/events`)
    return handleResponse<Event[]>(response)
  },

  registerEvent: async (eventId: string) => {
    const response = await authFetch(`${BASE}/events/${eventId}/register`, { method: 'POST' })
    return handleResponse<{ registrationId: string }>(response)
  },

  // Opportunities
  getOpportunities: async (params?: Record<string, string>) => {
    const response = await fetch(`${BASE}/opportunities?${new URLSearchParams(params || {})}`)
    return handleResponse<Opportunity[]>(response)
  },

  // Impact
  getTestimonials: async () => {
    const response = await fetch(`${BASE}/testimonials`)
    return handleResponse<unknown[]>(response)
  },

  getImpactMetrics: async () => {
    const response = await fetch(`${BASE}/impact/metrics`)
    return handleResponse<{ metrics: unknown[]; stories: unknown[] }>(response)
  },

  getFundingSources: async () => {
    const response = await fetch(`${BASE}/funding`)
    return handleResponse<unknown[]>(response)
  },

  getRegionalImpacts: async () => {
    const response = await fetch(`${BASE}/content/regional-impacts`)
    return handleResponse<unknown[]>(response)
  },

  getTimelineMilestones: async () => {
    const response = await fetch(`${BASE}/content/timeline-milestones`)
    return handleResponse<unknown[]>(response)
  },

  getSdgs: async () => {
    const response = await fetch(`${BASE}/content/sdgs`)
    return handleResponse<unknown[]>(response)
  },

  getPlatformInfo: async () => {
    const response = await fetch(`${BASE}/content/platform-info`)
    return handleResponse<Record<string, string>>(response)
  },

  getImpactStats: async () => {
    const response = await fetch(`${BASE}/impact/stats`)
    return handleResponse<ImpactStats>(response)
  },

  // User
  getProfile: async () => {
    const response = await authFetch(`${BASE}/user/profile`, {})
    return handleResponse<User>(response)
  },

  updateProfile: async (data: object) => {
    const response = await authFetch(`${BASE}/user/profile`, {
      method: 'PUT',
      body: JSON.stringify(data),
      headers: authHeaders(),
    })
    return handleResponse<User>(response)
  },

  getDashboard: async () => {
    const response = await authFetch(`${BASE}/user/dashboard`, {})
    const result = await handleResponse<Record<string, unknown>>(response)
    if (result.success && result.data) {
      const d = result.data as { stats?: Record<string, unknown> }
      if (d.stats) return { ...result, data: d.stats }
    }
    return result
  },

  // Payments
  initiatePayment: async (data: {
    courseId: string
    amount: number
    currency: string
    method: string
    phoneNumber?: string
    sandbox?: boolean
  }) => {
    const isDev = typeof process !== 'undefined' && (process as { env?: { NODE_ENV?: string } }).env?.NODE_ENV === 'development'
    const payload = { ...data, sandbox: data.sandbox ?? isDev }
    const response = await authFetch(`${BASE}/payments/initiate`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    return handleResponse<{ paymentIntentId: string; referenceCode: string }>(response)
  },

  // Community / Forum
  getForumPosts: async (params?: Record<string, string>) => {
    const response = await fetch(`${BASE}/community/forum?${new URLSearchParams(params || {})}`)
    return handleResponse<unknown[]>(response)
  },

  getForumPost: async (id: string) => {
    const response = await fetch(`${BASE}/community/forum/${id}`)
    return handleResponse<{ post: unknown; replies: unknown[] }>(response)
  },

  createForumPost: async (data: { title: string; content: string; category: string }) => {
    const response = await authFetch(`${BASE}/community/forum`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ id: string }>(response)
  },

  replyToPost: async (postId: string, content: string) => {
    const response = await authFetch(`${BASE}/community/forum/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
    return handleResponse<{ id: string }>(response)
  },

  // Research
  getPublication: async (id: string) => {
    const response = await fetch(`${BASE}/research/publications/${id}`)
    const result = await handleResponse<Publication | { publication?: Publication }>(response)
    const pub = (result as { publication?: Publication }).publication ?? (result.data && (result.data as { publication?: Publication }).publication)
    if (result.success && pub) return { ...result, data: pub }
    return result
  },

  // Blog
  getBlogPosts: async () => {
    const response = await fetch(`${BASE}/blog`)
    const result = await handleResponse<unknown[]>(response)
    const posts = (result as { posts?: unknown[] }).posts ?? (result.data && (result.data as { posts?: unknown[] }).posts)
    if (result.success && Array.isArray(posts)) return { ...result, data: posts }
    return result
  },

  // Auth
  forgotPassword: async (email: string) => {
    const response = await fetch(`${BASE}/auth/forgot-password`, {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ message: string }>(response)
  },

  loginWithGoogle: async (idToken: string) => {
    const response = await fetch(`${BASE}/auth/google`, {
      method: 'POST',
      body: JSON.stringify({ idToken }),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<
      | { user: User; token: string; refreshToken?: string | null }
      | { needsProfileCompletion: true; googleProfile: { googleId: string; email: string; firstName: string; lastName: string; avatar: string | null } }
    >(response)
  },

  completeGoogleProfile: async (data: object) => {
    const response = await fetch(`${BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ user: User; token: string; refreshToken?: string | null; pendingInstructorApproval?: boolean }>(response)
  },

  // ─── Admin ────────────────────────────────────────────────────────────────
  getAdminDashboard: async () => {
    const response = await authFetch(`${BASE}/admin/dashboard`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  getAdminAnalytics: async () => {
    const response = await authFetch(`${BASE}/admin/analytics`, {})
    return handleResponse<object>(response)
  },
  // Users
  getAdminUsers: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/users?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  getAdminUser: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/users/${id}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminUser: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminUser: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/users/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  bulkDeleteAdminUsers: async (ids: string[]) => {
    const response = await authFetch(`${BASE}/admin/users`, { method: 'POST', body: JSON.stringify({ ids }) })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Categories
  getCourseCategories: async () => {
    const response = await fetch(`${BASE}/courses/categories`)
    return handleResponse<any[]>(response)
  },
  getAdminCategories: async () => {
    const response = await authFetch(`${BASE}/admin/categories`, {})
    return handleResponse<any[]>(response)
  },
  createAdminCategory: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/categories`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminCategory: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminCategory: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/categories/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Courses
  getAdminCourses: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/courses?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminCourse: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/courses/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminCourse: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/courses/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Events
  getAdminEvents: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/events?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  createAdminEvent: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/events`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminEvent: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminEvent: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/events/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Publications
  getAdminPublications: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/publications?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  createAdminPublication: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/publications`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminPublication: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/publications/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminPublication: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/publications/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Opportunities
  getAdminOpportunities: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/opportunities?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  createAdminOpportunity: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/opportunities`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminOpportunity: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/opportunities/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminOpportunity: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/opportunities/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Testimonials
  getAdminTestimonials: async () => {
    const response = await authFetch(`${BASE}/admin/testimonials`, {})
    return handleResponse<unknown[]>(response)
  },
  createAdminTestimonial: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/testimonials`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminTestimonial: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/testimonials/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminTestimonial: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/testimonials/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Moderation
  getAdminModeration: async () => {
    const response = await authFetch(`${BASE}/admin/moderation`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  approveAdminItem: async (type: string, id: string) => {
    const response = await authFetch(`${BASE}/admin/moderation/approve`, { method: 'POST', body: JSON.stringify({ type, id }) })
    return handleResponse<Record<string, unknown>>(response)
  },
  rejectAdminItem: async (type: string, id: string) => {
    const response = await authFetch(`${BASE}/admin/moderation/reject`, { method: 'POST', body: JSON.stringify({ type, id }) })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Blog
  getAdminBlog: async (params?: Record<string, string>) => {
    const response = await authFetch(`${BASE}/admin/blog?${new URLSearchParams(params || {})}`, {})
    return handleResponse<Record<string, unknown>>(response)
  },
  createAdminBlogPost: async (data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/blog`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  updateAdminBlogPost: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/blog/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },
  deleteAdminBlogPost: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/blog/${id}`, { method: 'DELETE' })
    return handleResponse<Record<string, unknown>>(response)
  },
  // Metrics
  getAdminMetrics: async () => {
    const response = await authFetch(`${BASE}/admin/metrics`, {})
    return handleResponse<unknown[]>(response)
  },
  updateAdminMetric: async (id: string, data: Record<string, unknown>) => {
    const response = await authFetch(`${BASE}/admin/metrics/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<Record<string, unknown>>(response)
  },

  // Instructor
  getInstructorCourses: async () => {
    const response = await authFetch(`${BASE}/instructor/courses`)
    return handleResponse<Array<{ id: string; title: string; sections: Array<{ id: string; title: string; lessons: unknown[] }> }>>(response)
  },

  getInstructorCourse: async (id: string) => {
    const response = await authFetch(`${BASE}/instructor/courses/${id}`)
    return handleResponse<{ id: string; title: string; description: string; sections: Array<{ id: string; title: string; order: number; lessons: unknown[] }> }>(response)
  },

  addSection: async (courseId: string, data: { title: string; order?: number }) => {
    const response = await authFetch(`${BASE}/courses/${courseId}/sections`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ id: string }>(response)
  },

  updateSection: async (sectionId: string, data: { title?: string; order?: number }) => {
    const response = await authFetch(`${BASE}/sections/${sectionId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return handleResponse<unknown>(response)
  },

  deleteSection: async (sectionId: string) => {
    const response = await authFetch(`${BASE}/sections/${sectionId}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  addLesson: async (sectionId: string, data: { title: string; type: string; videoUrl?: string; pdfUrl?: string; duration?: number; order?: number; isPreview?: boolean }) => {
    const response = await authFetch(`${BASE}/sections/${sectionId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ id: string }>(response)
  },

  updateLesson: async (lessonId: string, data: { title?: string; type?: string; videoUrl?: string; pdfUrl?: string; duration?: number; order?: number; isPreview?: boolean; content?: Record<string, unknown> }) => {
    const response = await authFetch(`${BASE}/lessons/${lessonId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return handleResponse<unknown>(response)
  },

  deleteLesson: async (lessonId: string) => {
    const response = await authFetch(`${BASE}/lessons/${lessonId}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  uploadFile: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const token = typeof window !== 'undefined' ? getStoredToken() : null
    const headers: Record<string, string> = {}
    if (token) headers['Authorization'] = `Bearer ${token}`
    const response = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers,
      body: formData,
    })
    const json = await response.json()
    // Proxy normalizes to { success, url }; handle any nesting as fallback
    const url: string | undefined = json.url ?? json.data?.url ?? json.data?.data?.url
    if (json.success && url) return { success: true, url }
    return { success: false, error: (json as { error?: string }).error || 'Upload failed' }
  },

  // ── Instructor Approval ──────────────────────────────────────────────────
  getInstructorRequestStatus: async () => {
    const response = await authFetch(`${BASE}/instructor-approval/status`)
    return handleResponse<{ id: string; status: string; title: string; rejectionReason?: string; adminNotes?: string; createdAt: string; reviewedAt?: string }>(response)
  },

  getAdminInstructorRequests: async (status?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams()
    if (status) params.set('status', status)
    params.set('page', String(page))
    params.set('limit', String(limit))
    const response = await authFetch(`${BASE}/instructor-approval/admin/list?${params}`)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return handleResponse<{ requests: any[]; total: number; page: number; limit: number }>(response)
  },

  getInstructorPendingCount: async () => {
    const response = await authFetch(`${BASE}/instructor-approval/admin/pending-count`)
    return handleResponse<{ count: number }>(response)
  },

  reviewInstructorRequest: async (id: string, dto: { action: 'APPROVE' | 'REJECT'; adminNotes?: string; rejectionReason?: string }) => {
    const response = await authFetch(`${BASE}/instructor-approval/admin/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    })
    return handleResponse<{ success: boolean; action: string }>(response)
  },

  getInstructorRevenue: async () => {
    const response = await authFetch(`${BASE}/instructor/revenue`, {})
    const result = await handleResponse<{ data?: unknown[]; totalRevenue?: number; avgRevenue?: number }>(response)
    if (result.success && result.data && (result.data as { data?: unknown[] }).data) {
      return { ...result, data: (result.data as { data: unknown[] }).data }
    }
    return result
  },

  // ── Admin: Advisory ──────────────────────────────────────────────────────
  getAdminAdvisors: async () => {
    const response = await authFetch(`${BASE}/admin/advisory/advisors`)
    return handleResponse<unknown[]>(response)
  },

  updateAdminAdvisor: async (id: string, data: { title?: string; organization?: string; expertise?: string[]; bio?: string }) => {
    const response = await authFetch(`${BASE}/admin/advisory/advisors/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },

  removeAdminAdvisor: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/advisory/advisors/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  getAdminAdvisorySessions: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    const response = await authFetch(`${BASE}/admin/advisory/sessions${qs}`)
    return handleResponse<{ sessions: unknown[]; total: number; page: number; limit: number }>(response)
  },

  updateAdminAdvisorySession: async (id: string, data: { status?: string; notes?: string }) => {
    const response = await authFetch(`${BASE}/admin/advisory/sessions/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
    return handleResponse<unknown>(response)
  },

  deleteAdminAdvisorySession: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/advisory/sessions/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  createAdminAdvisorySession: async (data: {
    userId: string; advisorId: string; type: string
    scheduledAt: string; duration?: number; notes?: string
  }) => {
    const response = await authFetch(`${BASE}/admin/advisory/sessions`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Success Stories ────────────────────────────────────────────────
  getAdminSuccessStories: async () => {
    const response = await authFetch(`${BASE}/admin/content/success-stories`)
    return handleResponse<unknown[]>(response)
  },
  createAdminSuccessStory: async (data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/success-stories`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  updateAdminSuccessStory: async (id: string, data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/success-stories/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  deleteAdminSuccessStory: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/success-stories/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Funding Sources ────────────────────────────────────────────────
  getAdminFundingSources: async () => {
    const response = await authFetch(`${BASE}/admin/content/funding-sources`)
    return handleResponse<unknown[]>(response)
  },
  createAdminFundingSource: async (data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/funding-sources`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  updateAdminFundingSource: async (id: string, data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/funding-sources/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  deleteAdminFundingSource: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/funding-sources/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Timeline ───────────────────────────────────────────────────────
  getAdminTimeline: async () => {
    const response = await authFetch(`${BASE}/admin/content/timeline`)
    return handleResponse<unknown[]>(response)
  },
  createAdminTimelineMilestone: async (data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/timeline`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  updateAdminTimelineMilestone: async (id: string, data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/timeline/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  deleteAdminTimelineMilestone: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/timeline/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Regional Impacts ───────────────────────────────────────────────
  getAdminRegionalImpacts: async () => {
    const response = await authFetch(`${BASE}/admin/content/regional-impacts`)
    return handleResponse<unknown[]>(response)
  },
  createAdminRegionalImpact: async (data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/regional-impacts`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  updateAdminRegionalImpact: async (id: string, data: unknown) => {
    const response = await authFetch(`${BASE}/admin/content/regional-impacts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  deleteAdminRegionalImpact: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/regional-impacts/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Platform Info ──────────────────────────────────────────────────
  getAdminPlatformInfo: async () => {
    const response = await authFetch(`${BASE}/admin/content/platform-info`)
    return handleResponse<unknown[]>(response)
  },
  upsertAdminPlatformInfo: async (key: string, value: string) => {
    const response = await authFetch(`${BASE}/admin/content/platform-info`, { method: 'POST', body: JSON.stringify({ key, value }) })
    return handleResponse<unknown>(response)
  },

  // ── Admin: Community ─────────────────────────────────────────────────────
  getAdminForumPosts: async (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params)}` : ''
    const response = await authFetch(`${BASE}/admin/community/posts${qs}`)
    return handleResponse<{ items: unknown[]; total: number; page: number; limit: number }>(response)
  },
  updateAdminForumPost: async (id: string, data: { isPinned?: boolean; category?: string }) => {
    const response = await authFetch(`${BASE}/admin/community/posts/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<unknown>(response)
  },
  deleteAdminForumPost: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/community/posts/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },
  deleteAdminForumReply: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/community/replies/${id}`, { method: 'DELETE' })
    return handleResponse<unknown>(response)
  },

  // Email / SMTP
  getEmailStatus: async () => {
    const response = await authFetch(`${BASE}/admin/email/status`)
    return handleResponse<{ configured: boolean }>(response)
  },
  sendTestEmail: async (to?: string) => {
    const response = await authFetch(`${BASE}/admin/email/test`, {
      method: 'POST',
      body: JSON.stringify({ to }),
    })
    return handleResponse<{ success: boolean; message: string; configured: boolean }>(response)
  },
  getBroadcastPreview: async (role?: string) => {
    const url = role ? `${BASE}/admin/email/broadcast?role=${role}` : `${BASE}/admin/email/broadcast`
    const response = await authFetch(url)
    return handleResponse<{ count: number; role: string }>(response)
  },
  sendBroadcastEmail: async (data: { subject: string; message: string; role?: string }) => {
    const response = await authFetch(`${BASE}/admin/email/broadcast`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
    return handleResponse<{ sent: number; failed: number; total: number }>(response)
  },

  // AI
  validateBusinessIdea: async (idea: string) => {
    const response = await authFetch(`${BASE}/ai/validate-idea`, {
      method: 'POST',
      body: JSON.stringify({ idea }),
    })
    return handleResponse<{ marketFit: number; feasibility: number; strengths: string[]; risks: string[]; suggestions: string[]; nextSteps: string[]; verdict: string }>(response)
  },
  getAIRecommendations: async () => {
    const response = await authFetch(`${BASE}/ai/recommendations`, {})
    return handleResponse<unknown[]>(response)
  },
  generateQuiz: async (lessonContent: string, numQuestions = 5) => {
    const response = await authFetch(`${BASE}/ai/generate-quiz`, {
      method: 'POST',
      body: JSON.stringify({ lessonContent, numQuestions }),
    })
    return handleResponse<{ questions: { question: string; options: string[]; correctIndex: number; explanation: string }[] }>(response)
  },
  // Advisory session cancel (user-facing)
  cancelAdvisorySession: async (id: string) => {
    const response = await authFetch(`${BASE}/advisory/sessions/${id}/cancel`, { method: 'PATCH' })
    return handleResponse<Record<string, unknown>>(response)
  },
  aiChat: async (message: string, history?: { role: string; content: string }[]) => {
    const response = await fetch(`${BASE}/ai/chat`, {
      method: 'POST',
      body: JSON.stringify({ message, history }),
      headers: { 'Content-Type': 'application/json' },
    })
    const result = await handleResponse<{ message?: string; reply?: string }>(response)
    if (result.success && result.data) {
      const msg = (result.data as { message?: string }).message ?? (result.data as { reply?: string }).reply
      if (msg) return { ...result, data: { reply: msg } }
    }
    return result
  },

  summarize: async (text: string, style: 'brief' | 'detailed' | 'bullets' = 'brief', language = 'en') => {
    const response = await fetch(`${BASE}/ai/summarize`, {
      method: 'POST',
      body: JSON.stringify({ text, style, language }),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ summary: string; style: string; wordCount: number }>(response)
  },

  translateText: async (text: string, targetLanguage: string, context?: string) => {
    const response = await fetch(`${BASE}/ai/translate`, {
      method: 'POST',
      body: JSON.stringify({ text, targetLanguage, context }),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ translation: string; targetLanguage: string; originalLength: number }>(response)
  },

  generateCoverLetter: async (params: {
    jobTitle: string
    company?: string
    skills?: string
    experience?: string
    tone?: 'formal' | 'confident' | 'creative'
    language?: string
  }) => {
    const response = await fetch(`${BASE}/ai/cover-letter`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ letter: string; jobTitle: string; company?: string }>(response)
  },

  generateStudyPlan: async (params: {
    topic: string
    goal?: string
    durationWeeks?: number
    hoursPerWeek?: number
    currentLevel?: 'beginner' | 'intermediate' | 'advanced'
    language?: string
  }) => {
    const response = await fetch(`${BASE}/ai/study-plan`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ plan: Record<string, unknown>; weeks: number; hoursPerWeek: number }>(response)
  },

  pitchCoach: async (params: {
    businessName?: string
    problem: string
    solution: string
    targetMarket?: string
    revenueModel?: string
    askAmount?: string
    language?: string
    mode?: 'feedback' | 'elevator' | 'investor'
  }) => {
    const response = await fetch(`${BASE}/ai/pitch-coach`, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: { 'Content-Type': 'application/json' },
    })
    return handleResponse<{ pitch?: string; feedback?: Record<string, unknown>; mode: string }>(response)
  },

  // ── Team Members (public) ─────────────────────────────────────────────────
  getTeamMembers: async () => {
    const response = await fetch(`${BASE}/content/team`)
    return handleResponse<TeamMember[]>(response)
  },

  // ── About Stats (public) ──────────────────────────────────────────────────
  getAboutStats: async () => {
    const response = await fetch(`${BASE}/content/about-stats`)
    return handleResponse<AboutStat[]>(response)
  },

  // ── Admin: Team Members ───────────────────────────────────────────────────
  adminGetTeamMembers: async () => {
    const response = await authFetch(`${BASE}/admin/content/team`)
    return handleResponse<TeamMember[]>(response)
  },
  adminCreateTeamMember: async (data: Partial<TeamMember>) => {
    const response = await authFetch(`${BASE}/admin/content/team`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<TeamMember>(response)
  },
  adminUpdateTeamMember: async (id: string, data: Partial<TeamMember>) => {
    const response = await authFetch(`${BASE}/admin/content/team/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<TeamMember>(response)
  },
  adminDeleteTeamMember: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/team/${id}`, { method: 'DELETE' })
    return handleResponse<{ id: string }>(response)
  },

  // ── Admin: About Stats ────────────────────────────────────────────────────
  adminGetAboutStats: async () => {
    const response = await authFetch(`${BASE}/admin/content/about-stats`)
    return handleResponse<AboutStat[]>(response)
  },
  adminCreateAboutStat: async (data: Partial<AboutStat>) => {
    const response = await authFetch(`${BASE}/admin/content/about-stats`, { method: 'POST', body: JSON.stringify(data) })
    return handleResponse<AboutStat>(response)
  },
  adminUpdateAboutStat: async (id: string, data: Partial<AboutStat>) => {
    const response = await authFetch(`${BASE}/admin/content/about-stats/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
    return handleResponse<AboutStat>(response)
  },
  adminDeleteAboutStat: async (id: string) => {
    const response = await authFetch(`${BASE}/admin/content/about-stats/${id}`, { method: 'DELETE' })
    return handleResponse<{ id: string }>(response)
  },

  // ── Flutterwave Payments ──────────────────────────────────────────────────
  initiateFlutterwave: async (data: { courseId: string; amount?: number; currency?: string; phoneNumber?: string }) => {
    const response = await authFetch(`${BASE}/payments/flutterwave/initiate`, { method: 'POST', body: JSON.stringify({ ...data, method: 'flutterwave' }) })
    return handleResponse<{ paymentId: string; txRef: string; paymentUrl: string; amount: number; currency: string; status: string }>(response)
  },
  verifyFlutterwave: async (txRef: string, transactionId: string) => {
    const response = await authFetch(`${BASE}/payments/flutterwave/verify?tx_ref=${encodeURIComponent(txRef)}&transaction_id=${encodeURIComponent(transactionId)}`)
    return handleResponse<{ status: string; paymentId: string; alreadyProcessed?: boolean }>(response)
  },
}
