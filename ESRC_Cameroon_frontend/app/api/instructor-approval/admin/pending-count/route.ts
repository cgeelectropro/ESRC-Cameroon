import { proxyGet } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  return proxyGet('/instructor-approval/admin/pending-count', request)
}
