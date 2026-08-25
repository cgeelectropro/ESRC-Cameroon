import { proxyGet } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  const url = new URL(request.url)
  return proxyGet(`/community/admin/posts?${url.searchParams}`, request)
}
