import { proxyPost } from '@/lib/nest-proxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyPost(`/courses/${id}/sections`, request)
}
