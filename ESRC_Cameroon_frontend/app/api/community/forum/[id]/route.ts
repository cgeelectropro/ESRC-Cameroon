import { proxyGet, proxyPost } from '@/lib/nest-proxy'

const transformForumResponse = (res: { data?: { post?: unknown; replies?: unknown[] } }) => {
  if (res.data) {
    const data = res.data as { post?: unknown; replies?: unknown[] }
    return { success: true, data: { post: data.post, replies: data.replies || [] } }
  }
  return res
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyGet(`/community/forum/${id}`, request, {
    transformResponse: transformForumResponse as (d: unknown) => unknown,
  })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyPost(`/community/forum/${id}/reply`, request)
}
