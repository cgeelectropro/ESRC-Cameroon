import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

/**
 * Converts a DOCX file (from S3/backend URL) to safe HTML server-side.
 * The real file URL is never exposed to the client.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  const NESTJS_URL = process.env.NESTJS_URL || 'http://localhost:4000'
  const allowed = [NESTJS_URL, 'amazonaws.com', 'cloudfront.net', 's3.']
  const isAllowed = allowed.some((domain) => url.includes(domain))
  if (!isAllowed) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const res = await fetch(url, { cache: 'no-store' })
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch document' }, { status: res.status })
    }

    const buffer = Buffer.from(await res.arrayBuffer())
    const result = await mammoth.convertToHtml({ buffer })

    return NextResponse.json({ html: result.value })
  } catch {
    return NextResponse.json({ error: 'Failed to convert document' }, { status: 500 })
  }
}
