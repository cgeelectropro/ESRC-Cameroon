import { proxyGet } from '@/lib/nest-proxy'

const transformRevenueResponse = (res: { data?: { data?: unknown[]; totalRevenue?: number; avgRevenue?: number } }) => {
  if (res.data) {
    return {
      success: true,
      data: (res.data as { data?: unknown[] }).data,
      totalRevenue: (res.data as { totalRevenue?: number }).totalRevenue,
      avgRevenue: (res.data as { avgRevenue?: number }).avgRevenue,
    }
  }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/instructor/revenue', request, {
    transformResponse: transformRevenueResponse as (d: unknown) => unknown,
  })
}
