/**
 * POST /api/extract-pdf
 * Body: { url: string }
 * Fetches a PDF from the given URL, extracts text using pdf-parse,
 * and returns it as { html: string } — formatted for the rich text editor.
 */
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Missing url' }, { status: 400 })
    }

    // Fetch the PDF
    const pdfRes = await fetch(url)
    if (!pdfRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 400 })
    }
    const buffer = Buffer.from(await pdfRes.arrayBuffer())

    // Dynamically import pdf-parse (CommonJS)
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)

    const rawText: string = data.text || ''

    // Convert plain text to HTML paragraphs
    // Split on double-newlines → paragraphs, single newlines → <br>
    const html = rawText
      .split(/\n{2,}/)
      .map(para => {
        const trimmed = para.trim()
        if (!trimmed) return ''
        // Detect lines that look like headings (ALL CAPS, short, no period at end)
        const lines = trimmed.split('\n')
        if (lines.length === 1 && trimmed.length < 80 && trimmed === trimmed.toUpperCase() && !/[.,:;]$/.test(trimmed)) {
          return `<h2>${escapeHtml(trimmed)}</h2>`
        }
        // Regular paragraph
        const content = lines.map(l => escapeHtml(l)).join('<br>')
        return `<p>${content}</p>`
      })
      .filter(Boolean)
      .join('\n')

    return NextResponse.json({ html, pages: data.numpages })
  } catch (err) {
    console.error('PDF extraction error:', err)
    return NextResponse.json({ error: 'PDF extraction failed' }, { status: 500 })
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
