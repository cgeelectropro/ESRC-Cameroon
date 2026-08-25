import { proxyGet, proxyPost } from '@/lib/nest-proxy'

const SUPABASE_URL = 'https://rohatzmiqhczybfbgjhj.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvaGF0em1pcWhjenliZmJnamhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIzMjE4NjQsImV4cCI6MjA4Nzg5Nzg2NH0.onB1B6ihX9jkcxsKMekyCpaF8ZXICnqpiD6QxFdO9r4'

const transformCoursesResponse = (res: { data?: { items?: unknown[] } }) => {
  if (res.data?.items) {
    return { success: true, data: res.data.items, message: `Found ${res.data.items.length} courses` }
  }
  return res
}

/** Fallback: read courses directly from Supabase when NestJS is down */
async function fetchCoursesFromSupabase(): Promise<Response> {
  const url = `${SUPABASE_URL}/rest/v1/courses?select=id,title,description,thumbnail,category,level,price,currency,language,isPublished,isFeatured,instructorId,createdAt&isPublished=eq.true&order=createdAt.desc`
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  })

  if (!res.ok) {
    return Response.json({ success: false, error: 'Failed to load courses' }, { status: 503 })
  }

  const rows = await res.json()

  // Normalize to match the shape the frontend expects
  const courses = rows.map((r: Record<string, unknown>) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    thumbnail: r.thumbnail,
    category: r.category,
    level: r.level,
    price: r.price ?? 0,
    currency: r.currency ?? 'XAF',
    language: r.language,
    isPublished: r.isPublished,
    isFeatured: r.isFeatured,
    isFree: !r.price || r.price === 0,
    instructor: '',
    rating: 0,
    reviewCount: 0,
    students: 0,
  }))

  return Response.json({ success: true, data: courses })
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = `/courses?${url.searchParams}`
  const nestRes = await proxyGet(path, request, { transformResponse: transformCoursesResponse as (d: unknown) => unknown })

  // If NestJS is unreachable or returned an error, fall back to Supabase
  if (nestRes.status === 503 || nestRes.status >= 500) {
    return fetchCoursesFromSupabase()
  }

  // Also check body success flag
  const clone = nestRes.clone()
  const body = await clone.json().catch(() => ({ success: true }))
  if (!body.success && (!body.data || (Array.isArray(body.data) && body.data.length === 0))) {
    return fetchCoursesFromSupabase()
  }

  return nestRes
}

export async function POST(request: Request) {
  return proxyPost('/courses', request)
}
