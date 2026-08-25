import { proxyGet } from '@/lib/nest-proxy'

const transformMetricsResponse = (res: { data?: { metrics?: unknown[]; stories?: unknown[] } }) => {
  if (res.data) return { success: true, data: { metrics: res.data.metrics ?? [], stories: res.data.stories ?? [] } }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/content/impact-metrics', request, {
    transformResponse: transformMetricsResponse as (d: unknown) => unknown,
    forwardAuth: false,
  })
}
