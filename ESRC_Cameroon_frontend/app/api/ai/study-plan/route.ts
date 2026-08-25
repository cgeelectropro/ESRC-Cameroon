const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    topic?: string
    goal?: string
    durationWeeks?: number
    hoursPerWeek?: number
    currentLevel?: 'beginner' | 'intermediate' | 'advanced'
    language?: string
  }

  if (!body.topic?.trim()) {
    return Response.json({ success: false, error: 'Topic is required' }, { status: 400 })
  }

  const lang = body.language === 'fr' ? 'French' : 'English'
  const weeks = Math.min(body.durationWeeks || 4, 12)
  const hours = body.hoursPerWeek || 5
  const level = body.currentLevel || 'beginner'

  const systemPrompt = `You are an expert learning coach for African entrepreneurs and professionals. Create structured, actionable study plans. Respond in ${lang}. Return ONLY valid JSON matching exactly:
{"title":"...","overview":"...","weeks":[{"week":1,"theme":"...","objectives":["..."],"activities":["..."],"resources":["..."]}],"tips":["..."]}`

  const userPrompt = `Create a ${weeks}-week study plan for:
Topic: ${body.topic}
${body.goal ? `Goal: ${body.goal}` : ''}
Current level: ${level}
Available time: ${hours} hours/week`

  try {
    const res = await fetch(HF_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${HF_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 800,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(25000),
    })

    if (!res.ok) throw new Error(`HF ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const raw = data.choices?.[0]?.message?.content?.trim() || ''

    // Try to parse JSON from response
    let plan
    try {
      const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      plan = JSON.parse(cleaned)
    } catch {
      // Return as raw text if JSON fails
      plan = { title: `${weeks}-Week ${body.topic} Plan`, overview: raw, weeks: [], tips: [] }
    }

    return Response.json({ success: true, data: { plan, weeks, hoursPerWeek: hours } })
  } catch {
    return Response.json({ success: false, error: 'Study plan generation failed. Please try again.' }, { status: 503 })
  }
}
