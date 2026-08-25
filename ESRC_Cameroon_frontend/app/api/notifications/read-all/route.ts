import { proxyToNest } from '@/lib/nest-proxy'

export async function PATCH(request: Request) {
  return proxyToNest('PATCH', '/notifications/read-all', request)
}
