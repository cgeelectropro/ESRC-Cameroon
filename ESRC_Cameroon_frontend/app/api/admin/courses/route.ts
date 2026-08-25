import { proxyGet } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  const url = new URL(request.url)
  return proxyGet(`/admin/courses?${url.searchParams}`, request)
}
