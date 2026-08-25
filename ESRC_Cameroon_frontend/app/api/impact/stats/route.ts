import { proxyGet } from '@/lib/nest-proxy'

const transformImpactResponse = (res: { data?: unknown }) => {
  if (res.data) return { success: true, data: res.data }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/impact/stats', request, {
    transformResponse: transformImpactResponse as (d: unknown) => unknown,
    forwardAuth: false,
  })
}
