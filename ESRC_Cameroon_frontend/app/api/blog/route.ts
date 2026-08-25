import { proxyGet } from '@/lib/nest-proxy'

const transformBlogResponse = (res: { data?: unknown[] }) => {
  if (res.data) return { success: true, posts: res.data, data: res.data }
  return res
}

export async function GET(request: Request) {
  return proxyGet('/blog', request, {
    transformResponse: transformBlogResponse as (d: unknown) => unknown,
  })
}
