const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    text?: string
    language?: string
    style?: 'brief' | 'detailed' | 'bullets'
  }

  if (!body.text?.trim()) {
    return Response.json({ success: false, error: 'No text provided' }, { status: 400 })
  }

  const style = body.style || 'brief'
  const lang = body.language === 'fr' ? 'French' : 'English'
  const styleInstr =
    style === 'bullets' ? 'as a bullet-point list of key takeaways' :
    style === 'detailed' ? 'in a detailed paragraph covering all main points' :
    'in 2-3 concise sentences'

  const systemPrompt = `You are a professional content summarizer for African entrepreneurs and professionals. Summarize text ${styleInstr}. Respond in ${lang}. Be accurate and preserve key information.`

  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Summarize this:\n\n${body.text.slice(0, 3000)}` },
        ],
        max_tokens: 400,
        temperature: 0.4,
      }),
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HF ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) throw new Error('Empty response')
    return Response.json({ success: true, data: { summary, style, wordCount: body.text.split(' ').length } })
  } catch {
    return Response.json({ success: false, error: 'Summarization failed. Please try again.' }, { status: 503 })
  }
}
