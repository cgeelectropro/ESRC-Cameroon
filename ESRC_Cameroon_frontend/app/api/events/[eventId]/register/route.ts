import { proxyPost } from '@/lib/nest-proxy'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params
  return proxyPost(`/events/${eventId}/register`, request)
}
