import { proxyGet, proxyPost } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  return proxyGet('/content/admin/timeline', request)
}
export async function POST(request: Request) {
  return proxyPost('/content/admin/timeline', request)
}
