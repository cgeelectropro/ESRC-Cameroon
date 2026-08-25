import { proxyGet, proxyPost } from '@/lib/nest-proxy'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const role = request.nextUrl.searchParams.get('role') ?? undefined
  const url = role ? `/admin/email/broadcast/preview?role=${role}` : '/admin/email/broadcast/preview'
  return proxyGet(url, request)
}

export async function POST(request: Request) {
  return proxyPost('/admin/email/broadcast', request)
}
