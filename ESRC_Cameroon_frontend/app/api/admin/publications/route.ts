import { proxyGet, proxyPost } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  const url = new URL(request.url)
  return proxyGet(`/admin/publications?${url.searchParams}`, request)
}
export async function POST(request: Request) {
  return proxyPost('/research/publications', request)
}
