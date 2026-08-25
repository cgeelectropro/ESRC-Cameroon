import { proxyGet } from '@/lib/nest-proxy'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  return proxyGet(`/blog/${slug}`, request)
}
