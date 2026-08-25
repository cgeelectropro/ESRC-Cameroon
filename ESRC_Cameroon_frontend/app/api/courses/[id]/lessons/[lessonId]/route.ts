import { proxyGet } from '@/lib/nest-proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { id, lessonId } = await params
  return proxyGet(`/courses/${id}/lessons/${lessonId}`, request)
}
