/**
 * Proxy utility to forward Next.js API routes to NestJS backend.
 * Base URL: process.env.NESTJS_URL (e.g. http://localhost:4000/api/v1)
 */

const getBaseUrl = () => {
  const url = process.env.NESTJS_URL || 'http://localhost:4000'
  return url.replace(/\/$/, '') + '/api/v1'
}

export type ProxyOptions = {
  transformResponse?: (data: unknown) => unknown
  forwardAuth?: boolean
  // Only set this for endpoints that are public and NOT personalized per
  // user (course/event/content listings, etc.) — it lets Vercel's CDN and
  // browsers cache the response, so repeat visits skip the Render backend
  // entirely instead of waking a cold instance. Never set it alongside
  // forwardAuth, and never on a route whose response varies by requester.
  cache?: { maxAge: number; staleWhileRevalidate?: number }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ProxyOptionsLoose = { transformResponse?: (data: any) => any; forwardAuth?: boolean; cache?: { maxAge: number; staleWhileRevalidate?: number } }

export async function proxyToNest(
  method: string,
  path: string,
  request: Request,
  options: ProxyOptions = {}
): Promise<Response> {
  const baseUrl = getBaseUrl()
  const fullPath = path.startsWith('/') ? path : `/${path}`
  const url = new URL(baseUrl + fullPath)

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (options.forwardAuth !== false) {
    const auth = request.headers.get('Authorization')
    if (auth) headers['Authorization'] = auth
    const cookie = request.headers.get('Cookie')
    if (cookie) headers['Cookie'] = cookie
  }

  const init: RequestInit = {
    method,
    headers,
  }

  if (method !== 'GET' && method !== 'HEAD') {
    try {
      const body = await request.text()
      if (body) init.body = body
    } catch {
      // No body
    }
  }

  const searchParams = new URL(request.url).searchParams
  searchParams.forEach((value, key) => {
    url.searchParams.set(key, value)
  })

  let res: Response
  try {
    res = await fetch(url.toString(), init)
  } catch (err) {
    const cause = err instanceof Error ? (err.cause as { code?: string; errors?: { code?: string }[] } | undefined) : undefined
    const code =
      cause?.code ??
      cause?.errors?.[0]?.code ??
      (err as { code?: string })?.code
    const msg = err instanceof Error ? err.message : String(err)
    const isConnectionRefused =
      code === 'ECONNREFUSED' || code === 'ECONNRESET' || msg.includes('ECONNREFUSED')
    return Response.json(
      {
        success: false,
        error: isConnectionRefused
          ? 'Backend unavailable. Start the NestJS server (see LAUNCH_MANUAL.md).'
          : 'Failed to reach backend.',
      },
      { status: 503 }
    )
  }

  let data = await res.json().catch(() => ({}))

  if (options.transformResponse) {
    data = options.transformResponse(data)
  }

  const responseHeaders: Record<string, string> = { 'Content-Type': 'application/json' }
  if (options.cache && method === 'GET' && res.ok) {
    const swr = options.cache.staleWhileRevalidate ?? options.cache.maxAge
    responseHeaders['Cache-Control'] = `public, s-maxage=${options.cache.maxAge}, stale-while-revalidate=${swr}`
  }

  return Response.json(data, {
    status: res.status,
    headers: responseHeaders,
  })
}

export async function proxyGet(path: string, request: Request, options?: ProxyOptions) {
  return proxyToNest('GET', path, request, options)
}

export async function proxyPost(path: string, request: Request, options?: ProxyOptions) {
  return proxyToNest('POST', path, request, options)
}

export async function proxyPut(path: string, request: Request, options?: ProxyOptions) {
  return proxyToNest('PUT', path, request, options)
}

export async function proxyPatch(path: string, request: Request, options?: ProxyOptions) {
  return proxyToNest('PATCH', path, request, options)
}

export async function proxyDelete(path: string, request: Request, options?: ProxyOptions) {
  return proxyToNest('DELETE', path, request, options)
}
