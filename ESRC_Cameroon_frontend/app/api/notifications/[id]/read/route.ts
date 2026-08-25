import { proxyToNest } from '@/lib/nest-proxy'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyToNest('PATCH', `/notifications/${id}/read`, request)
}
