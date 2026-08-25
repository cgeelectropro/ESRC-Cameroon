import { proxyGet } from '@/lib/nest-proxy'

const transformDashboardResponse = (res: { data?: unknown }) => {
  if (res.data) return { success: true, data: res.data, dashboard: res.data }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/user/dashboard', request, {
    transformResponse: transformDashboardResponse as (d: unknown) => unknown,
  })
}
