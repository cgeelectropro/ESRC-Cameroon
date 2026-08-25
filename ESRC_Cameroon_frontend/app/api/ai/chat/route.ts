import { proxyPost } from '@/lib/nest-proxy'

const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'

const SYSTEM_PROMPT =
  'You are the NextGen Assistant for ESRC Cameroon — a bilingual learning and entrepreneurship hub ' +
  'for African professionals and entrepreneurs. Help users find courses, explore opportunities, ' +
  'validate business ideas, connect with mentors, and navigate the platform. ' +
  'Be warm, practical, and Africa-focused. Keep replies concise (2–4 sentences) unless asked for detail.'

// NestJS global ResponseInterceptor wraps: { success: true, data: { message, source }, timestamp }
const transformAiResponse = (res: unknown) => {
  const r = res as { success?: boolean; data?: { message?: string; source?: string } }
  const msg = r?.data?.message
  if (msg) {
    return { success: true, data: { message: msg, reply: msg, source: r.data?.source } }
  }
  return res
}

async function callHuggingFaceDirectly(
  messages: { role: string; content: string }[],
): Promise<string | null> {
  if (!HF_TOKEN) return null
  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages.map((m) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content,
          })),
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] }
    return data.choices?.[0]?.message?.content ?? null
  } catch {
    return null
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    message?: string
    history?: { role: string; content: string }[]
  }

  const messages: { role: string; content: string }[] = [
    ...(Array.isArray(body.history) ? body.history : []),
    ...(body.message ? [{ role: 'user' as const, content: body.message }] : []),
  ]

  // 1. Try NestJS backend (Railway in prod, localhost:4000 in dev)
  try {
    const proxyRequest = new Request(request.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    })
    const backendRes = await proxyPost('/ai/chat', proxyRequest, {
      transformResponse: transformAiResponse as (d: unknown) => unknown,
    })
    const backendData = await backendRes.json() as {
      success?: boolean
      data?: { reply?: string; message?: string }
      error?: string
    }
    // Use backend response only if it's a real AI reply (not a fallback/hardcoded response)
    const backendMsg = backendData?.data?.reply || backendData?.data?.message
    const backendSource = (backendData?.data as { source?: string } | undefined)?.source ?? ''
    const isFallback = backendSource.includes('fallback') || backendSource.includes('error')
    if (backendData?.success && backendMsg && !isFallback) {
      return Response.json(backendData)
    }
  } catch {
    // Backend unreachable — fall through
  }

  // 2. Direct HuggingFace call from Next.js server (works even if backend is down)
  const hfReply = await callHuggingFaceDirectly(messages)
  if (hfReply) {
    return Response.json({
      success: true,
      data: { message: hfReply, reply: hfReply, source: 'huggingface-direct' },
    })
  }

  // 3. All providers failed
  return Response.json(
    { success: false, error: 'AI service temporarily unavailable. Please try again.' },
    { status: 503 },
  )
}
