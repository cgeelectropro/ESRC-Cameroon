import { proxyGet, proxyPost } from '@/lib/nest-proxy'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  return proxyGet('/content/team', request)
}

export async function POST(request: Request) {
  return proxyPost('/content/admin/team', request)
}
