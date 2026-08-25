'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Sparkles, FileText, Languages, Mail, BookOpen,
  Mic2, Lightbulb, Copy, Check, Download, RefreshCw,
  ChevronRight, Star, TrendingUp, AlertTriangle, ArrowRight,
} from 'lucide-react'

type Tool = 'summarize' | 'translate' | 'cover-letter' | 'study-plan' | 'pitch-coach' | 'idea-validator'

interface ToolCard {
  id: Tool
  icon: React.ReactNode
  color: string
  bgColor: string
}

const TOOLS: ToolCard[] = [
  { id: 'summarize', icon: <FileText size={22} />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-950/30' },
  { id: 'translate', icon: <Languages size={22} />, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-950/30' },
  { id: 'cover-letter', icon: <Mail size={22} />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-950/30' },
  { id: 'study-plan', icon: <BookOpen size={22} />, color: 'text-orange-600', bgColor: 'bg-orange-50 dark:bg-orange-950/30' },
  { id: 'pitch-coach', icon: <Mic2 size={22} />, color: 'text-pink-600', bgColor: 'bg-pink-50 dark:bg-pink-950/30' },
  { id: 'idea-validator', icon: <Lightbulb size={22} />, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-950/30' },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const t = useTranslations('ai.hub')
  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button onClick={copy} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted">
      {copied ? <><Check size={13} className="text-green-500" />{t('copied')}</> : <><Copy size={13} />{t('copy')}</>}
    </button>
  )
}

function DownloadButton({ text, filename }: { text: string; filename: string }) {
  const t = useTranslations('ai.hub')
  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <button onClick={download} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-lg hover:bg-muted">
      <Download size={13} />{t('download')}
    </button>
  )
}

function ResultBox({ text, filename, children }: { text: string; filename?: string; children?: React.ReactNode }) {
  const t = useTranslations('ai.hub')
  return (
    <div className="mt-4 rounded-xl border border-border bg-muted/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Sparkles size={12} className="text-primary" />{t('resultReady')}
        </span>
        <div className="flex items-center gap-1">
          <CopyButton text={text} />
          {filename && <DownloadButton text={text} filename={filename} />}
        </div>
      </div>
      <div className="p-4">
        {children || <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>}
      </div>
    </div>
  )
}

// ── Summarizer ────────────────────────────────────────────────────────────────
function SummarizerTool() {
  const t = useTranslations('ai.hub')
  const locale = useLocale()
  const [text, setText] = useState('')
  const [style, setStyle] = useState<'brief' | 'detailed' | 'bullets'>('brief')
  const [result, setResult] = useState<{ summary: string; wordCount: number } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult(null)
    const res = await apiClient.summarize(text, style, locale)
    setLoading(false)
    if (res.success && res.data) setResult(res.data as { summary: string; wordCount: number })
    else setError((res as { error?: string }).error || 'Failed')
  }

  return (
    <div className="space-y-4">
      <Textarea
        placeholder={t('inputPlaceholder')}
        value={text}
        onChange={e => setText(e.target.value)}
        rows={5}
        className="resize-none"
        maxLength={3000}
      />
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-muted-foreground">{t('style')}:</span>
        {(['brief', 'detailed', 'bullets'] as const).map(s => (
          <button key={s} onClick={() => setStyle(s)}
            className={cn("text-xs px-3 py-1.5 rounded-full border transition-colors",
              style === s ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
            {t(`style${s.charAt(0).toUpperCase() + s.slice(1)}` as 'styleBrief')}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{text.length}/3000</span>
      </div>
      <Button onClick={run} disabled={loading || !text.trim()} className="w-full">
        {loading ? <><RefreshCw size={14} className="animate-spin mr-2" />{t('processing')}</> : <><Sparkles size={14} className="mr-2" />{t('generate')}</>}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <ResultBox text={result.summary} filename="summary.txt">
          {style === 'bullets' ? (
            <ul className="space-y-1.5">
              {result.summary.split('\n').filter(l => l.trim()).map((line, i) => (
                <li key={i} className="flex gap-2 text-sm"><span className="text-primary mt-0.5">•</span><span>{line.replace(/^[-*•]\s*/, '')}</span></li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{result.summary}</p>
          )}
          <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">Original: {result.wordCount} words</p>
        </ResultBox>
      )}
    </div>
  )
}

// ── Translator ────────────────────────────────────────────────────────────────
function TranslatorTool() {
  const t = useTranslations('ai.hub')
  const locale = useLocale()
  const [text, setText] = useState('')
  const [targetLang, setTargetLang] = useState(locale === 'fr' ? 'en' : 'fr')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!text.trim()) return
    setLoading(true); setError(''); setResult('')
    const res = await apiClient.translateText(text, targetLang)
    setLoading(false)
    if (res.success && res.data) setResult((res.data as { translation: string }).translation)
    else setError((res as { error?: string }).error || 'Failed')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-border bg-muted/20">
          <p className="text-xs font-medium text-muted-foreground mb-2">{locale === 'fr' ? 'Français' : 'English'}</p>
          <Textarea placeholder={t('inputPlaceholder')} value={text} onChange={e => setText(e.target.value)} rows={4} className="resize-none border-0 bg-transparent p-0 text-sm focus-visible:ring-0" maxLength={3000} />
        </div>
        <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 relative">
          <p className="text-xs font-medium text-primary mb-2">{targetLang === 'fr' ? 'Français' : 'English'}</p>
          {result ? <p className="text-sm leading-relaxed">{result}</p> : <p className="text-sm text-muted-foreground italic">{loading ? t('processing') : 'Translation will appear here...'}</p>}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <select value={targetLang} onChange={e => setTargetLang(e.target.value)}
          className="flex-1 text-sm border border-border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/30">
          <option value="fr">→ Français</option>
          <option value="en">→ English</option>
          <option value="Portuguese">→ Portuguese</option>
          <option value="Arabic">→ Arabic</option>
          <option value="Swahili">→ Swahili</option>
        </select>
        <Button onClick={run} disabled={loading || !text.trim()} className="flex-1">
          {loading ? <RefreshCw size={14} className="animate-spin mr-2" /> : <Languages size={14} className="mr-2" />}
          Translate
        </Button>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && (
        <div className="flex items-center gap-2 justify-end">
          <CopyButton text={result} />
          <DownloadButton text={result} filename="translation.txt" />
        </div>
      )}
    </div>
  )
}

// ── Cover Letter ──────────────────────────────────────────────────────────────
function CoverLetterTool() {
  const t = useTranslations('ai.hub')
  const locale = useLocale()
  const [form, setForm] = useState<{ jobTitle: string; company: string; skills: string; experience: string; tone: 'formal' | 'confident' | 'creative' }>({ jobTitle: '', company: '', skills: '', experience: '', tone: 'confident' })
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!form.jobTitle.trim()) return
    setLoading(true); setError(''); setResult('')
    const res = await apiClient.generateCoverLetter({ ...form, language: locale })
    setLoading(false)
    if (res.success && res.data) setResult((res.data as { letter: string }).letter)
    else setError((res as { error?: string }).error || 'Failed')
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('jobTitle')} *</label>
          <Input value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} className="mt-1" placeholder="e.g. Marketing Manager" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('company')}</label>
          <Input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} className="mt-1" placeholder="e.g. Acme Corp" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('skills')}</label>
        <Input value={form.skills} onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} className="mt-1" placeholder="e.g. Digital marketing, SEO, data analysis" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('experience')}</label>
        <Textarea value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} rows={3} className="mt-1 resize-none" placeholder="e.g. 3 years in B2B marketing, led campaigns for 5 startups" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-2 block">{t('tone')}</label>
        <div className="flex gap-2">
          {(['formal', 'confident', 'creative'] as const).map(tone => (
            <button key={tone} onClick={() => setForm(f => ({ ...f, tone }))}
              className={cn("flex-1 text-xs py-2 rounded-lg border transition-colors",
                form.tone === tone ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted")}>
              {t(`tone${tone.charAt(0).toUpperCase() + tone.slice(1)}` as 'toneFormal')}
            </button>
          ))}
        </div>
      </div>
      <Button onClick={run} disabled={loading || !form.jobTitle.trim()} className="w-full">
        {loading ? <><RefreshCw size={14} className="animate-spin mr-2" />{t('processing')}</> : <><Mail size={14} className="mr-2" />{t('generate')}</>}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result && <ResultBox text={result} filename="cover-letter.txt" />}
    </div>
  )
}

// ── Study Plan ────────────────────────────────────────────────────────────────
function StudyPlanTool() {
  const t = useTranslations('ai.hub')
  const locale = useLocale()
  const [form, setForm] = useState({ topic: '', goal: '', durationWeeks: 4, hoursPerWeek: 5, currentLevel: 'beginner' as const })
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!form.topic.trim()) return
    setLoading(true); setError(''); setResult(null)
    const res = await apiClient.generateStudyPlan({ ...form, language: locale })
    setLoading(false)
    if (res.success && res.data) setResult((res.data as { plan: Record<string, unknown> }).plan)
    else setError((res as { error?: string }).error || 'Failed')
  }

  const plan = result as { title?: string; overview?: string; weeks?: { week: number; theme: string; objectives: string[]; activities: string[]; resources: string[] }[]; tips?: string[] } | null

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('studyTopic')} *</label>
        <Input value={form.topic} onChange={e => setForm(f => ({ ...f, topic: e.target.value }))} className="mt-1" placeholder="e.g. Digital Marketing, Python, Finance" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('studyGoal')}</label>
        <Input value={form.goal} onChange={e => setForm(f => ({ ...f, goal: e.target.value }))} className="mt-1" placeholder="e.g. Get a job as a social media manager" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('studyWeeks')}</label>
          <Input type="number" min={1} max={12} value={form.durationWeeks} onChange={e => setForm(f => ({ ...f, durationWeeks: +e.target.value }))} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('studyHours')}</label>
          <Input type="number" min={1} max={40} value={form.hoursPerWeek} onChange={e => setForm(f => ({ ...f, hoursPerWeek: +e.target.value }))} className="mt-1" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('studyLevel')}</label>
          <select value={form.currentLevel} onChange={e => setForm(f => ({ ...f, currentLevel: e.target.value as 'beginner' }))}
            className="mt-1 w-full text-sm border border-border rounded-lg px-3 py-2 bg-background focus:ring-2 focus:ring-primary/30">
            <option value="beginner">{t('levelBeginner')}</option>
            <option value="intermediate">{t('levelIntermediate')}</option>
            <option value="advanced">{t('levelAdvanced')}</option>
          </select>
        </div>
      </div>
      <Button onClick={run} disabled={loading || !form.topic.trim()} className="w-full">
        {loading ? <><RefreshCw size={14} className="animate-spin mr-2" />{t('processing')}</> : <><BookOpen size={14} className="mr-2" />{t('generate')}</>}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {plan && (
        <div className="mt-4 rounded-xl border border-border overflow-hidden">
          <div className="bg-primary/10 px-4 py-3 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">{plan.title}</h3>
              {plan.overview && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{plan.overview}</p>}
            </div>
            <CopyButton text={JSON.stringify(plan, null, 2)} />
          </div>
          {plan.weeks && plan.weeks.length > 0 && (
            <div className="divide-y divide-border">
              {plan.weeks.map((w) => (
                <div key={w.week} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">{w.week}</span>
                    <span className="font-medium text-sm">{w.theme}</span>
                  </div>
                  {w.objectives?.length > 0 && (
                    <div className="mb-2">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Objectives</p>
                      <ul className="space-y-0.5">{w.objectives.map((o, i) => <li key={i} className="text-xs flex gap-1.5"><ChevronRight size={10} className="text-primary mt-0.5 shrink-0" />{o}</li>)}</ul>
                    </div>
                  )}
                  {w.activities?.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Activities</p>
                      <ul className="space-y-0.5">{w.activities.map((a, i) => <li key={i} className="text-xs flex gap-1.5"><ArrowRight size={10} className="text-muted-foreground mt-0.5 shrink-0" />{a}</li>)}</ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
          {plan.tips && plan.tips.length > 0 && (
            <div className="px-4 py-3 bg-muted/30 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground mb-2">💡 Tips</p>
              <ul className="space-y-1">{plan.tips.map((tip, i) => <li key={i} className="text-xs text-muted-foreground">{tip}</li>)}</ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Pitch Coach ───────────────────────────────────────────────────────────────
function PitchCoachTool() {
  const t = useTranslations('ai.hub')
  const locale = useLocale()
  const [form, setForm] = useState({ businessName: '', problem: '', solution: '', targetMarket: '', revenueModel: '', askAmount: '', mode: 'elevator' as 'elevator' | 'investor' | 'feedback' })
  const [result, setResult] = useState<{ pitch?: string; feedback?: Record<string, unknown>; mode: string } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (!form.problem.trim() || !form.solution.trim()) return
    setLoading(true); setError(''); setResult(null)
    const res = await apiClient.pitchCoach({ ...form, language: locale })
    setLoading(false)
    if (res.success && res.data) setResult(res.data as { pitch?: string; feedback?: Record<string, unknown>; mode: string })
    else setError((res as { error?: string }).error || 'Failed')
  }

  const feedback = result?.feedback as { score?: number; strengths?: string[]; weaknesses?: string[]; improvements?: string[]; investorQuestions?: string[]; overallFeedback?: string } | undefined

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
        {(['elevator', 'investor', 'feedback'] as const).map(mode => (
          <button key={mode} onClick={() => setForm(f => ({ ...f, mode }))}
            className={cn("flex-1 text-xs py-2 rounded-lg transition-colors",
              form.mode === mode ? "bg-card shadow-sm font-medium text-primary" : "text-muted-foreground hover:text-foreground")}>
            {t(`pitch${mode.charAt(0).toUpperCase() + mode.slice(1)}` as 'pitchElevator')}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('pitchBusiness')}</label>
          <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} className="mt-1" placeholder="e.g. AgriTech Solutions" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('pitchMarket')}</label>
          <Input value={form.targetMarket} onChange={e => setForm(f => ({ ...f, targetMarket: e.target.value }))} className="mt-1" placeholder="e.g. Small-scale farmers in Cameroon" />
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('pitchProblem')} *</label>
        <Textarea value={form.problem} onChange={e => setForm(f => ({ ...f, problem: e.target.value }))} rows={2} className="mt-1 resize-none" placeholder="e.g. Farmers lose 30% of crops due to lack of market access" />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground">{t('pitchSolution')} *</label>
        <Textarea value={form.solution} onChange={e => setForm(f => ({ ...f, solution: e.target.value }))} rows={2} className="mt-1 resize-none" placeholder="e.g. A mobile marketplace connecting farmers directly to buyers" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('pitchRevenue')}</label>
          <Input value={form.revenueModel} onChange={e => setForm(f => ({ ...f, revenueModel: e.target.value }))} className="mt-1" placeholder="e.g. 5% transaction fee" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground">{t('pitchAsk')}</label>
          <Input value={form.askAmount} onChange={e => setForm(f => ({ ...f, askAmount: e.target.value }))} className="mt-1" placeholder="e.g. $50,000 seed" />
        </div>
      </div>
      <Button onClick={run} disabled={loading || !form.problem.trim() || !form.solution.trim()} className="w-full">
        {loading ? <><RefreshCw size={14} className="animate-spin mr-2" />{t('processing')}</> : <><Mic2 size={14} className="mr-2" />{t('generate')}</>}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {result?.pitch && <ResultBox text={result.pitch} filename="pitch.txt" />}
      {feedback && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card">
            <span className="font-semibold">{t('score')}</span>
            <div className="flex items-center gap-2">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={16} className={s <= Math.round((feedback.score || 70) / 20) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"} />)}
              </div>
              <span className="font-bold text-lg">{feedback.score || 70}/100</span>
            </div>
          </div>
          {feedback.overallFeedback && (
            <div className="p-4 rounded-xl border border-border bg-muted/20">
              <p className="text-sm leading-relaxed">{feedback.overallFeedback}</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            {feedback.strengths && feedback.strengths.length > 0 && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1"><TrendingUp size={12} />{t('strengths')}</p>
                <ul className="space-y-1">{feedback.strengths.map((s, i) => <li key={i} className="text-xs text-green-800 dark:text-green-300 flex gap-1"><span>✓</span>{s}</li>)}</ul>
              </div>
            )}
            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1"><AlertTriangle size={12} />{t('weaknesses')}</p>
                <ul className="space-y-1">{feedback.weaknesses.map((w, i) => <li key={i} className="text-xs text-red-800 dark:text-red-300 flex gap-1"><span>✗</span>{w}</li>)}</ul>
              </div>
            )}
          </div>
          {feedback.improvements && feedback.improvements.length > 0 && (
            <div className="p-3 rounded-xl border border-border bg-blue-50/50 dark:bg-blue-950/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">{t('improvements')}</p>
              <ul className="space-y-1">{feedback.improvements.map((imp, i) => <li key={i} className="text-xs flex gap-1.5"><ChevronRight size={10} className="text-blue-500 mt-0.5 shrink-0" />{imp}</li>)}</ul>
            </div>
          )}
          {feedback.investorQuestions && feedback.investorQuestions.length > 0 && (
            <div className="p-3 rounded-xl border border-border bg-purple-50/50 dark:bg-purple-950/20">
              <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">{t('investorQuestions')}</p>
              <ul className="space-y-1">{feedback.investorQuestions.map((q, i) => <li key={i} className="text-xs flex gap-1.5"><span className="text-purple-500 shrink-0">Q{i+1}.</span>{q}</li>)}</ul>
            </div>
          )}
          <div className="flex justify-end">
            <CopyButton text={JSON.stringify(feedback, null, 2)} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Idea Validator ────────────────────────────────────────────────────────────
function IdeaValidatorTool() {
  const t = useTranslations('ai.hub')
  const [idea, setIdea] = useState('')
  const [result, setResult] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const run = async () => {
    if (idea.trim().split(' ').length < 5) { setError('Please describe your idea in at least 5 words'); return }
    setLoading(true); setError(''); setResult(null)
    const res = await apiClient.validateBusinessIdea(idea)
    setLoading(false)
    if (res.success && res.data) setResult(res.data as Record<string, unknown>)
    else setError((res as { error?: string }).error || 'Failed')
  }

  const r = result as { marketFit?: number; feasibility?: number; strengths?: string[]; risks?: string[]; suggestions?: string[]; nextSteps?: string[]; verdict?: string } | null
  const overallScore = r ? Math.round(((r.marketFit || 0) + (r.feasibility || 0)) / 2 * 10) : 0
  const scoreColor = overallScore >= 70 ? 'text-green-600' : overallScore >= 50 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = overallScore >= 70 ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900' : overallScore >= 50 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900' : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900'

  return (
    <div className="space-y-4">
      <Textarea placeholder="Describe your business idea in detail. E.g. 'An app that connects small-scale farmers in Cameroon with urban buyers, reducing post-harvest losses...'" value={idea} onChange={e => setIdea(e.target.value)} rows={4} className="resize-none" />
      <Button onClick={run} disabled={loading || !idea.trim()} className="w-full">
        {loading ? <><RefreshCw size={14} className="animate-spin mr-2" />{t('processing')}</> : <><Lightbulb size={14} className="mr-2" />{t('generate')}</>}
      </Button>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {r && (
        <div className="space-y-3">
          <div className={cn("p-4 rounded-xl border flex items-center justify-between", scoreBg)}>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
              <p className={cn("text-3xl font-bold", scoreColor)}>{overallScore}<span className="text-base font-normal">/100</span></p>
            </div>
            <div className="text-right space-y-1">
              <div className="text-xs"><span className="text-muted-foreground">Market Fit: </span><span className="font-semibold">{r.marketFit}/10</span></div>
              <div className="text-xs"><span className="text-muted-foreground">Feasibility: </span><span className="font-semibold">{r.feasibility}/10</span></div>
            </div>
          </div>
          {r.verdict && <div className="p-3 rounded-xl bg-muted/30 border border-border"><p className="text-sm font-medium">{r.verdict}</p></div>}
          <div className="grid grid-cols-2 gap-3">
            {r.strengths && r.strengths.length > 0 && (
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900">
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-2">✅ Strengths</p>
                <ul className="space-y-1">{r.strengths.map((s, i) => <li key={i} className="text-xs text-green-800 dark:text-green-300">{s}</li>)}</ul>
              </div>
            )}
            {r.risks && r.risks.length > 0 && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 mb-2">⚠️ Risks</p>
                <ul className="space-y-1">{r.risks.map((risk, i) => <li key={i} className="text-xs text-red-800 dark:text-red-300">{risk}</li>)}</ul>
              </div>
            )}
          </div>
          {r.suggestions && r.suggestions.length > 0 && (
            <div className="p-3 rounded-xl border border-border bg-blue-50/50 dark:bg-blue-950/20">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Suggestions</p>
              <ul className="space-y-1">{r.suggestions.map((s, i) => <li key={i} className="text-xs flex gap-1.5"><ChevronRight size={10} className="text-blue-500 mt-0.5 shrink-0" />{s}</li>)}</ul>
            </div>
          )}
          {r.nextSteps && r.nextSteps.length > 0 && (
            <div className="p-3 rounded-xl border border-border">
              <p className="text-xs font-semibold text-muted-foreground mb-2">🚀 Next Steps</p>
              <ol className="space-y-1">{r.nextSteps.map((step, i) => <li key={i} className="text-xs flex gap-2"><span className="text-primary font-semibold shrink-0">{i + 1}.</span>{step}</li>)}</ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Tool Components Map ───────────────────────────────────────────────────────
const TOOL_COMPONENTS: Record<Tool, React.ComponentType> = {
  'summarize': SummarizerTool,
  'translate': TranslatorTool,
  'cover-letter': CoverLetterTool,
  'study-plan': StudyPlanTool,
  'pitch-coach': PitchCoachTool,
  'idea-validator': IdeaValidatorTool,
}

// ── Main Hub ──────────────────────────────────────────────────────────────────
export function AIHubInteractive() {
  const t = useTranslations('ai.hub')
  const [activeTool, setActiveTool] = useState<Tool | null>(null)

  const ActiveComponent = activeTool ? TOOL_COMPONENTS[activeTool] : null

  const toolKey = (id: Tool) => {
    const map: Record<Tool, string> = {
      'summarize': 'summarize',
      'translate': 'translate',
      'cover-letter': 'coverLetter',
      'study-plan': 'studyPlan',
      'pitch-coach': 'pitchCoach',
      'idea-validator': 'ideaValidator',
    }
    return map[id]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6">
      {/* Tool Grid */}
      <div className="space-y-2">
        {TOOLS.map(tool => (
          <button
            key={tool.id}
            onClick={() => setActiveTool(tool.id)}
            className={cn(
              "w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
              activeTool === tool.id
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/40"
            )}
          >
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center shrink-0", tool.bgColor, tool.color)}>
              {tool.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn("font-semibold text-sm", activeTool === tool.id ? "text-primary" : "text-foreground")}>
                {t(toolKey(tool.id) as 'summarize')}
              </p>
              <p className="text-xs text-muted-foreground line-clamp-1">{t(`${toolKey(tool.id)}Desc` as 'summarizeDesc')}</p>
            </div>
            <ChevronRight size={16} className={cn("shrink-0 transition-transform", activeTool === tool.id ? "text-primary rotate-90" : "text-muted-foreground group-hover:translate-x-0.5")} />
          </button>
        ))}
      </div>

      {/* Active Tool Panel */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        {!activeTool ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Sparkles size={28} className="text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Select an AI Tool</h3>
            <p className="text-muted-foreground text-sm max-w-xs">Choose any tool from the list to get started. All tools are powered by AI and work instantly.</p>
          </div>
        ) : (
          <>
            {/* Panel Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-muted/20">
              {(() => { const tool = TOOLS.find(t => t.id === activeTool)!; return (
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", tool.bgColor, tool.color)}>
                  {tool.icon}
                </div>
              )})()}
              <div>
                <h2 className="font-semibold text-base">{t(toolKey(activeTool) as 'summarize')}</h2>
                <p className="text-xs text-muted-foreground">{t(`${toolKey(activeTool)}Desc` as 'summarizeDesc')}</p>
              </div>
            </div>
            {/* Panel Body */}
            <div className="p-6 overflow-y-auto max-h-[calc(100vh-240px)]">
              {ActiveComponent && <ActiveComponent />}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
