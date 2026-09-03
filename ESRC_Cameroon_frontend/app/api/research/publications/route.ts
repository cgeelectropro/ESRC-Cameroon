import { proxyGet } from '@/lib/nest-proxy'

const transformPublicationsResponse = (res: { data?: { items?: unknown[] } }) => {
  if (res.data?.items) {
    return { success: true, data: res.data.items, publications: res.data.items }
  }
  return res
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = `/research/publications?${url.searchParams}`
  return proxyGet(path, request, {
    transformResponse: transformPublicationsResponse as (d: unknown) => unknown,
    cache: { maxAge: 60, staleWhileRevalidate: 600 },
  })
}
