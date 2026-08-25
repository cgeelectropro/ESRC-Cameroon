import { proxyGet } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = `/opportunities?${url.searchParams}`
  return proxyGet(path, request)
}
