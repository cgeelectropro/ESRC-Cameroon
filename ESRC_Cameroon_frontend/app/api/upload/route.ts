/**
 * Proxies file upload to NestJS backend.
 * Receives multipart form data and forwards to POST /api/v1/upload
 */
import { NextRequest } from 'next/server'

const getBaseUrl = () => {
  const url = process.env.NESTJS_URL || 'http://localhost:4000'
  return url.replace(/\/$/, '') + '/api/v1'
}

export async function POST(request: NextRequest) {
  const auth = request.headers.get('Authorization')
  if (!auth) {
    return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  if (!file) {
    return Response.json({ success: false, error: 'No file provided' }, { status: 400 })
  }

  const backendFormData = new FormData()
  backendFormData.append('file', file)

  const res = await fetch(`${getBaseUrl()}/upload`, {
    method: 'POST',
    headers: { Authorization: auth },
    body: backendFormData,
  })

  const data = await res.json().catch(() => ({}))

  // Unwrap NestJS double-wrapping: { success, data: { success, data: { url } } }
  // Normalize to { success, url } for the frontend api-client
  const url: string | undefined =
    data?.data?.data?.url ?? data?.data?.url ?? data?.url
  if (res.ok && url) {
    return Response.json({ success: true, url }, { status: 200 })
  }
  const error: string = data?.message ?? data?.error ?? data?.data?.message ?? 'Upload failed'
  return Response.json({ success: false, error }, { status: res.ok ? 400 : res.status })
}
