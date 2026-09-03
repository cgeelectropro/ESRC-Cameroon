import { proxyGet, proxyPost } from '@/lib/nest-proxy'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return proxyGet('/content/about-stats', request, { cache: { maxAge: 60, staleWhileRevalidate: 600 } })
}

export async function POST(request: Request) {
  return proxyPost('/content/admin/about-stats', request)
}
