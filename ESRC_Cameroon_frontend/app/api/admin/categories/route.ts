import { proxyGet, proxyPost } from '@/lib/nest-proxy'

export async function GET(request: Request) {
  return proxyGet('/admin/categories', request)
}

export async function POST(request: Request) {
  return proxyPost('/admin/categories', request)
}
