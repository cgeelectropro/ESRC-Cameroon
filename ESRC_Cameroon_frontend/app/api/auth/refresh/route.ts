import { proxyPost } from '@/lib/nest-proxy'

const transformAuthResponse = (res: { data?: { accessToken?: string; refreshToken?: string; user?: unknown } }) => {
  if (res.data?.accessToken && res.data?.user) {
    return { success: true, data: { user: res.data.user, token: res.data.accessToken, refreshToken: res.data.refreshToken } }
  }
  return res
}

export async function POST(request: Request) {
  return proxyPost('/auth/refresh', request, {
    transformResponse: transformAuthResponse as (d: unknown) => unknown,
    forwardAuth: false,
  })
}
