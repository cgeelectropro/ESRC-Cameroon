import { proxyGet, proxyPatch } from '@/lib/nest-proxy'

const transform = (res: { data?: { sections?: unknown[]; [k: string]: unknown } }) => {
  if (res.data) {
    const course = res.data as Record<string, unknown>
    return {
      success: true,
      course: {
        ...course,
        curriculum: course.sections ?? course.curriculum ?? [],
      },
    }
  }
  return res
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyGet(`/courses/${id}`, request, {
    transformResponse: transform as (d: unknown) => unknown,
    cache: { maxAge: 60, staleWhileRevalidate: 600 },
  })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyPatch(`/courses/${id}`, request)
}
