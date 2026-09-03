import { proxyGet } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  return proxyGet('/mentors', request, { cache: { maxAge: 60, staleWhileRevalidate: 600 } })
}
