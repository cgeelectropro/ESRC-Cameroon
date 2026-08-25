const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    text?: string
    targetLanguage?: string
    context?: string
  }

  if (!body.text?.trim()) {
    return Response.json({ success: false, error: 'No text provided' }, { status: 400 })
  }

  const target = body.targetLanguage === 'fr' ? 'French' : body.targetLanguage === 'en' ? 'English' : (body.targetLanguage || 'English')
  const contextNote = body.context ? ` Context: ${body.context}.` : ''

  const systemPrompt = `You are a professional translator specializing in business and entrepreneurship content for Africa.${contextNote} Translate the provided text to ${target} accurately, preserving tone and meaning. Return ONLY the translated text, nothing else.`

  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: body.text.slice(0, 3000) },
        ],
        max_tokens: 600,
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) throw new Error(`HF ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const translation = data.choices?.[0]?.message?.content?.trim()

    if (!translation) throw new Error('Empty response')
    return Response.json({ success: true, data: { translation, targetLanguage: target, originalLength: body.text.length } })
  } catch {
    return Response.json({ success: false, error: 'Translation failed. Please try again.' }, { status: 503 })
  }
}
