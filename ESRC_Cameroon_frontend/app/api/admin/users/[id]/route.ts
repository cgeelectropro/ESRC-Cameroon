import { proxyGet, proxyPatch, proxyDelete } from '@/lib/nest-proxy'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyGet(`/admin/users/${id}`, request)
}
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyPatch(`/admin/users/${id}`, request)
}
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return proxyDelete(`/admin/users/${id}`, request)
}
