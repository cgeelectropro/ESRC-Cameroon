import { proxyGet } from '@/lib/nest-proxy'

const transformSessionResponse = (res: { data?: { user?: unknown } }) => {
  if (res.data?.user) {
    return { success: true, data: res.data.user }
  }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/auth/session', request, {
    transformResponse: transformSessionResponse as (d: unknown) => unknown,
  })
}
