import { proxyPost } from '@/lib/nest-proxy'

export async function POST(request: Request) {
  return proxyPost('/auth/forgot-password', request, { forwardAuth: false })
}
