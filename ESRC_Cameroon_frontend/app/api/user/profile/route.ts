import { proxyGet, proxyPut } from '@/lib/nest-proxy'

const transformProfileResponse = (res: { data?: unknown }) => {
  if (res.data) return { success: true, data: res.data }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/user/profile', request, {
    transformResponse: transformProfileResponse as (d: unknown) => unknown,
  })
}

export async function PUT(request: Request) {
  return proxyPut('/user/profile', request, {
    transformResponse: transformProfileResponse as (d: unknown) => unknown,
  })
}
