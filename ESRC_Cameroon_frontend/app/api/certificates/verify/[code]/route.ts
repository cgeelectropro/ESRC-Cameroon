import { proxyGet } from '@/lib/nest-proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params
  return proxyGet(`/certificates/verify/${code}`, request)
}
