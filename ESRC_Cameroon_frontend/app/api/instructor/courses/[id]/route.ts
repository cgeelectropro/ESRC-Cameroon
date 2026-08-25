import { proxyGet } from '@/lib/nest-proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyGet(`/instructor/courses/${id}`, request)
}
