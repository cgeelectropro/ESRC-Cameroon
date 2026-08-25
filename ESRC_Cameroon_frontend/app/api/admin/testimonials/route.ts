import { proxyGet, proxyPost } from '@/lib/nest-proxy'
export async function GET(request: Request) {
  return proxyGet('/admin/testimonials', request)
}
export async function POST(request: Request) {
  return proxyPost('/admin/testimonials', request)
}
