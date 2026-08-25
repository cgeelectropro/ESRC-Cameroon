import { proxyPatch } from '@/lib/nest-proxy'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyPatch(`/admin/metrics/${id}`, request)
}
