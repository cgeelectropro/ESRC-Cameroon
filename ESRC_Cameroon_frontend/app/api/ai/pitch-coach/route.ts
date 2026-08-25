const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    businessName?: string
    problem?: string
    solution?: string
    targetMarket?: string
    revenueModel?: string
    askAmount?: string
    language?: string
    mode?: 'feedback' | 'elevator' | 'investor'
  }

  if (!body.problem?.trim() || !body.solution?.trim()) {
    return Response.json({ success: false, error: 'Problem and solution are required' }, { status: 400 })
  }

  const lang = body.language === 'fr' ? 'French' : 'English'
  const mode = body.mode || 'elevator'

  let systemPrompt = ''
  let userPrompt = ''

  if (mode === 'feedback') {
    systemPrompt = `You are an expert pitch coach and investor for African startups. Analyze the pitch and return ONLY valid JSON:
{"score":number,"strengths":["..."],"weaknesses":["..."],"improvements":["..."],"investorQuestions":["..."],"overallFeedback":"..."}`
    userPrompt = `Analyze this startup pitch:
Business: ${body.businessName || 'Startup'}
Problem: ${body.problem}
Solution: ${body.solution}
${body.targetMarket ? `Market: ${body.targetMarket}` : ''}
${body.revenueModel ? `Revenue: ${body.revenueModel}` : ''}
${body.askAmount ? `Ask: ${body.askAmount}` : ''}`
  } else if (mode === 'investor') {
    systemPrompt = `You are a pitch writing expert for African entrepreneurs. Write a compelling 2-minute investor pitch in ${lang}. Include hook, problem/solution, market size, traction, team credibility, and clear ask.`
    userPrompt = `Write an investor pitch for:
Business: ${body.businessName || 'Our startup'}
Problem: ${body.problem}
Solution: ${body.solution}
${body.targetMarket ? `Market: ${body.targetMarket}` : ''}
${body.revenueModel ? `Revenue model: ${body.revenueModel}` : ''}
${body.askAmount ? `Investment ask: ${body.askAmount}` : ''}`
  } else {
    systemPrompt = `You are a pitch coach for African entrepreneurs. Write a punchy 60-second elevator pitch in ${lang}. Make it memorable, clear, and compelling.`
    userPrompt = `Create an elevator pitch:
Business: ${body.businessName || 'Our startup'}
Problem solved: ${body.problem}
Solution: ${body.solution}
${body.targetMarket ? `For: ${body.targetMarket}` : ''}`
  }

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
        max_tokens: mode === 'feedback' ? 600 : 500,
        temperature: mode === 'feedback' ? 0.3 : 0.7,
      }),
      signal: AbortSignal.timeout(25000),
    })

    if (!res.ok) throw new Error(`HF ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const raw = data.choices?.[0]?.message?.content?.trim() || ''

    if (mode === 'feedback') {
      try {
        const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
        const feedback = JSON.parse(cleaned)
        return Response.json({ success: true, data: { feedback, mode } })
      } catch {
        return Response.json({ success: true, data: { feedback: { overallFeedback: raw, score: 70, strengths: [], weaknesses: [], improvements: [], investorQuestions: [] }, mode } })
      }
    }

    return Response.json({ success: true, data: { pitch: raw, mode } })
  } catch {
    return Response.json({ success: false, error: 'Pitch generation failed. Please try again.' }, { status: 503 })
  }
}
