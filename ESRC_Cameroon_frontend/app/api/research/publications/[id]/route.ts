import { proxyGet } from '@/lib/nest-proxy'

const transformPublicationResponse = (res: { data?: unknown }) => {
  if (res.data) return { success: true, publication: res.data }
  return res
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  return proxyGet(`/research/publications/${id}`, request, {
    transformResponse: transformPublicationResponse as (d: unknown) => unknown,
  })
}
