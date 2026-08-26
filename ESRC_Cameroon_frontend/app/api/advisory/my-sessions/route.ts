import { proxyGet } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  return proxyGet('/advisory/my-sessions', request)
}
