import { proxyGet, proxyPost } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  return proxyGet('/content/admin/success-stories', request)
}
export async function POST(request: Request) {
  return proxyPost('/content/admin/success-stories', request)
}
