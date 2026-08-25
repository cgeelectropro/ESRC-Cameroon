import { proxyPost } from '@/lib/nest-proxy'
export async function POST(request: Request) {
  return proxyPost('/admin/moderation/reject', request)
}
