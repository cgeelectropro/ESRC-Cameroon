import { proxyGet } from '@/lib/nest-proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const url = new URL(request.url)
  const query = url.searchParams.toString()
  const path = `/certificates/${id}/download${query ? `?${query}` : ''}`
  return proxyGet(path, request)
}
