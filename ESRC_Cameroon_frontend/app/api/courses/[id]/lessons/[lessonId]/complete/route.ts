import { proxyPost } from '@/lib/nest-proxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { id, lessonId } = await params
  return proxyPost(`/courses/${id}/lessons/${lessonId}/complete`, request)
}
