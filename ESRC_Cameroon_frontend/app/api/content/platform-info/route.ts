import { proxyGet } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  return proxyGet('/content/platform-info', request, { forwardAuth: false, cache: { maxAge: 60, staleWhileRevalidate: 600 } })
}
