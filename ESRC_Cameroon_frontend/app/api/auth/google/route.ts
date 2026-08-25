import { proxyPost } from '@/lib/nest-proxy'

const transformGoogleResponse = (res: Record<string, unknown>) => {
  const data = (res as { data?: Record<string, unknown> }).data ?? res

  // Existing/linked user — normalize accessToken → token like the login route
  if (data.accessToken && data.user) {
    return {
      success: true,
      data: {
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken ?? null,
      },
    }
  }

  // New user — pass through so frontend can redirect to complete-profile
  if (data.needsProfileCompletion) {
    return { success: true, data }
  }

  return res
}

export async function POST(request: Request) {
  return proxyPost('/auth/google', request, {
    transformResponse: transformGoogleResponse as (d: unknown) => unknown,
    forwardAuth: false,
  })
}
