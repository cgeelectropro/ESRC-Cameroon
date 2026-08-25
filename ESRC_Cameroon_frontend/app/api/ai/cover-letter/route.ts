const HF_TOKEN = process.env.HUGGINGFACE_API_KEY || ''
const HF_URL = 'https://router.huggingface.co/v1/chat/completions'
const HF_MODEL = 'meta-llama/Llama-3.1-8B-Instruct'

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({})) as {
    jobTitle?: string
    company?: string
    skills?: string
    experience?: string
    tone?: 'formal' | 'confident' | 'creative'
    language?: string
  }

  if (!body.jobTitle?.trim()) {
    return Response.json({ success: false, error: 'Job title is required' }, { status: 400 })
  }

  const lang = body.language === 'fr' ? 'French' : 'English'
  const tone = body.tone || 'confident'
  const toneDesc = tone === 'formal' ? 'formal and professional' : tone === 'creative' ? 'creative and engaging' : 'confident and results-driven'

  const systemPrompt = `You are an expert career coach specializing in helping African professionals land jobs. Write a compelling cover letter in ${lang} with a ${toneDesc} tone. Structure it with: opening hook, relevant experience/skills, specific value proposition, and strong closing. Keep it under 300 words.`

  const userPrompt = `Write a cover letter for:
Position: ${body.jobTitle}
${body.company ? `Company: ${body.company}` : ''}
${body.skills ? `Key skills: ${body.skills}` : ''}
${body.experience ? `Experience: ${body.experience}` : ''}`

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
        max_tokens: 500,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(25000),
    })

    if (!res.ok) throw new Error(`HF ${res.status}`)
    const data = await res.json() as { choices?: { message?: { content?: string } }[] }
    const letter = data.choices?.[0]?.message?.content?.trim()

    if (!letter) throw new Error('Empty response')
    return Response.json({ success: true, data: { letter, jobTitle: body.jobTitle, company: body.company } })
  } catch {
    return Response.json({ success: false, error: 'Cover letter generation failed. Please try again.' }, { status: 503 })
  }
}
