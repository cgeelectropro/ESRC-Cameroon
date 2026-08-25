import { proxyPatch, proxyDelete } from '@/lib/nest-proxy'
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyPatch(`/content/admin/team/${id}`, request)
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyDelete(`/content/admin/team/${id}`, request)
}
