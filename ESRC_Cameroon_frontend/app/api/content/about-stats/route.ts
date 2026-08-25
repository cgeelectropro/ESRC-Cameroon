import { proxyGet, proxyPost } from '@/lib/nest-proxy'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return proxyGet('/content/about-stats', request)
}

export async function POST(request: Request) {
  return proxyPost('/content/admin/about-stats', request)
}
