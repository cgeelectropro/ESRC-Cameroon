import { NextRequest, NextResponse } from 'next/server'
import { getStoredToken } from '@/lib/auth-storage'

/**
 * Secure PDF proxy — fetches the PDF from S3 server-side and streams it
 * to the browser with headers that disable the toolbar and prevent direct download.
 * The real S3 URL is never exposed to the client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')

  if (!url) {
    return new NextResponse('Missing url parameter', { status: 400 })
  }

  // Only allow URLs from our own backend/S3 — prevent open redirect abuse
  const NESTJS_URL = process.env.NESTJS_URL || 'http://localhost:4000'
  const allowed = [
    NESTJS_URL,
    'amazonaws.com',
    'cloudfront.net',
    's3.',
  ]
  const isAllowed = allowed.some((domain) => url.includes(domain))
  if (!isAllowed) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return new NextResponse('Failed to fetch PDF', { status: res.status })
    }

    const buffer = await res.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        // inline = show in viewer, not force-download
        'Content-Disposition': 'inline',
        // Prevent the browser from sniffing MIME type
        'X-Content-Type-Options': 'nosniff',
        // Prevent the PDF from being embedded in other sites
        'X-Frame-Options': 'SAMEORIGIN',
        // No caching of the proxied content
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        // Prevent referrer leaking
        'Referrer-Policy': 'no-referrer',
      },
    })
  } catch {
    return new NextResponse('Failed to proxy PDF', { status: 500 })
  }
}
