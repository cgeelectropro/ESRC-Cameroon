import { proxyGet } from '@/lib/nest-proxy'

const transformEventsResponse = (res: { data?: unknown }) => {
  if (Array.isArray(res.data)) {
    return { success: true, data: res.data, message: `Found ${res.data.length} events` }
  }
  if (res.data && typeof res.data === 'object' && 'items' in res.data) {
    const items = (res.data as { items: unknown[] }).items
    return { success: true, data: items, message: `Found ${items.length} events` }
  }
  return res
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const path = `/events?${url.searchParams}`
  return proxyGet(path, request, { transformResponse: transformEventsResponse as (d: unknown) => unknown })
}
