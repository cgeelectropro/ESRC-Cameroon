'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calculator, TrendingUp, CheckCircle2, Download, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react'
import { FundingDirectory } from '@/components/toolkit/FundingDirectory'
import { apiClient } from '@/lib/api-client'
import { toast } from 'sonner'

export function BusinessModelCanvas() {
  const t = useTranslations('toolkit.canvas')
  const [canvas, setCanvas] = useState({
    keyPartners: '',
    keyActivities: '',
    valueProposition: '',
    customerRelations: '',
    channels: '',
    customerSegments: '',
    keyResources: '',
    costStructure: '',
    revenueStreams: '',
  })

  return (
    <div className="grid grid-cols-3 gap-4 bg-card p-6 rounded-lg border">
      <div className="col-span-1 space-y-4">
        <div>
          <label className="text-sm font-medium">{t('keyPartners')}</label>
          <textarea
            value={canvas.keyPartners}
            onChange={(e) => setCanvas({ ...canvas, keyPartners: e.target.value })}
            className="w-full h-24 p-2 border rounded text-sm"
            placeholder={t('keyPartnersPlaceholder')}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('keyResources')}</label>
          <textarea
            value={canvas.keyResources}
            onChange={(e) => setCanvas({ ...canvas, keyResources: e.target.value })}
            className="w-full h-24 p-2 border rounded text-sm"
            placeholder={t('keyResourcesPlaceholder')}
          />
        </div>
      </div>
      <div className="col-span-1 space-y-4">
        <div className="border-2 border-esrc-green-300 p-4 rounded bg-esrc-green-50">
          <label className="text-sm font-bold">{t('valueProposition')}</label>
          <textarea
            value={canvas.valueProposition}
            onChange={(e) => setCanvas({ ...canvas, valueProposition: e.target.value })}
            className="w-full h-32 p-2 border rounded text-sm mt-2"
            placeholder={t('valuePropositionPlaceholder')}
          />
        </div>
      </div>
      <div className="col-span-1 space-y-4">
        <div>
          <label className="text-sm font-medium">{t('customerSegments')}</label>
          <textarea
            value={canvas.customerSegments}
            onChange={(e) => setCanvas({ ...canvas, customerSegments: e.target.value })}
            className="w-full h-24 p-2 border rounded text-sm"
            placeholder={t('customerSegmentsPlaceholder')}
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('channels')}</label>
          <textarea
            value={canvas.channels}
            onChange={(e) => setCanvas({ ...canvas, channels: e.target.value })}
            className="w-full h-24 p-2 border rounded text-sm"
            placeholder={t('channelsPlaceholder')}
          />
        </div>
      </div>
    </div>
  )
}

export function FinancialCalculator() {
  const t = useTranslations('toolkit.financial')
  const [startup, setStartup] = useState(5000000)
  const [monthlyOps, setMonthlyOps] = useState(500000)
  const [monthlyRevenue, setMonthlyRevenue] = useState(1500000)

  const months = 12
  const totalOps = monthlyOps * months
  const totalRevenue = monthlyRevenue * months
  const netProfit = totalRevenue - startup - totalOps
  const breakeven = startup / (monthlyRevenue - monthlyOps)

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium">{t('startupCost')}</label>
          <Input
            type="number"
            value={startup}
            onChange={(e) => setStartup(Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('monthlyOpCost')}</label>
          <Input
            type="number"
            value={monthlyOps}
            onChange={(e) => setMonthlyOps(Number(e.target.value))}
            className="mt-2"
          />
        </div>
        <div>
          <label className="text-sm font-medium">{t('monthlyRevenue')}</label>
          <Input
            type="number"
            value={monthlyRevenue}
            onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('revenue12m')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-esrc-green-700">{(totalRevenue / 1000000).toFixed(1)}M XAF</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('netProfitY1')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(netProfit / 1000000).toFixed(1)}M XAF
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('breakevenMonths')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-esrc-gold-500">{breakeven.toFixed(1)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LoanReadinessScore() {
  const t = useTranslations('toolkit.loan')
  const criteria = [
    { name: t('businessPlan'), weight: 20 },
    { name: t('financialProjections'), weight: 20 },
    { name: t('collateral'), weight: 15 },
    { name: t('creditHistory'), weight: 25 },
    { name: t('industryExperience'), weight: 20 },
  ]
  const [scores, setScores] = useState([8, 7, 6, 8, 7])
  const weightedSum = criteria.reduce((acc, c, i) => acc + (scores[i] ?? 0) * c.weight, 0)
  const overall = weightedSum / 100

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div className="space-y-4">
        {criteria.map((c, i) => (
          <div key={i}>
            <div className="flex justify-between mb-2">
              <Label className="text-sm font-medium">{c.name} ({t('weightLabel', { weight: c.weight })})</Label>
              <span className="text-sm font-bold text-esrc-green-700">{scores[i] ?? 0}/10</span>
            </div>
            <Slider
              value={[scores[i] ?? 0]}
              onValueChange={(v) => setScores((prev) => prev.map((s, j) => (j === i ? (v[0] ?? s) : s)))}
              min={0}
              max={10}
              step={1}
            />
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-esrc-green-50 to-esrc-gold-50 p-4 rounded">
        <p className="text-sm text-muted-foreground mb-2">{t('readinessScore')}</p>
        <p className="text-4xl font-bold text-esrc-green-700">{overall.toFixed(1)}/10</p>
        <p className="text-sm mt-2">
          {overall >= 8 ? t('excellent') : overall >= 6 ? t('good') : t('needsImprovement')}
        </p>
      </div>
    </div>
  )
}

export function MarketSizingCalculator() {
  const t = useTranslations('toolkit.market')
  const [totalPop, setTotalPop] = useState(50000000)
  const [targetPct, setTargetPct] = useState(10)
  const [penetration, setPenetration] = useState(5)
  const tam = totalPop * (targetPct / 100)
  const sam = tam * (penetration / 100)
  const som = sam * 0.2 // addressable segment

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>{t('totalPopulation')}</Label>
          <Input
            type="number"
            value={totalPop}
            onChange={(e) => setTotalPop(Number(e.target.value) || 0)}
            className="mt-2"
          />
        </div>
        <div>
          <Label>{t('targetPercent')}</Label>
          <Input
            type="number"
            value={targetPct}
            onChange={(e) => setTargetPct(Number(e.target.value) || 0)}
            className="mt-2"
          />
        </div>
        <div>
          <Label>{t('realisticPenetration')}</Label>
          <Input
            type="number"
            value={penetration}
            onChange={(e) => setPenetration(Number(e.target.value) || 0)}
            className="mt-2"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('tam')}</CardTitle>
            <CardDescription>{t('tamDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-esrc-green-700">{tam.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('sam')}</CardTitle>
            <CardDescription>{t('samDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-esrc-gold-600">{sam.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{t('som')}</CardTitle>
            <CardDescription>{t('somDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold text-esrc-green-800">{Math.round(som).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

type AIValidationResult = {
  marketFit: number
  feasibility: number
  strengths: string[]
  risks: string[]
  suggestions: string[]
  nextSteps: string[]
  verdict: string
}

export function AIIdeaValidator() {
  const t = useTranslations('toolkit.ai')
  const [idea, setIdea] = useState('')
  const [result, setResult] = useState<AIValidationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const validate = async () => {
    if (!idea.trim() || idea.trim().split(/\s+/).length < 5) {
      toast.error(t('emptyIdeaError'))
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await apiClient.validateBusinessIdea(idea)
      if (res.success && res.data) {
        setResult(res.data as AIValidationResult)
      } else {
        toast.error(t('validationFailed'))
      }
    } catch {
      toast.error(t('serviceUnreachable'))
    } finally {
      setLoading(false)
    }
  }

  const avgScore = result ? Math.round(((result.marketFit + result.feasibility) / 2) * 10) : 0
  const scoreColor = avgScore >= 70 ? 'text-green-600' : avgScore >= 50 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = avgScore >= 70 ? 'bg-green-50 border-green-200 dark:bg-green-950/30' : avgScore >= 50 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/30' : 'bg-red-50 border-red-200 dark:bg-red-950/30'

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div>
        <Label className="text-sm font-medium">{t('describeIdea')}</Label>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder={t('ideaPlaceholder')}
          className="w-full h-32 p-3 border rounded-lg mt-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-esrc-green-600"
        />
      </div>
      <Button onClick={validate} disabled={loading || !idea.trim()} className="bg-esrc-green-600 hover:bg-esrc-green-700">
        {loading ? t('analysing') : t('validate')}
      </Button>
      {result && (
        <div className="space-y-4">
          {/* Scores */}
          <div className={`grid grid-cols-3 gap-4 p-4 rounded-lg border ${scoreBg}`}>
            <div className="text-center">
              <p className={`text-3xl font-extrabold ${scoreColor}`}>{avgScore}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
              <p className="text-xs text-muted-foreground mt-1">{t('overallScore')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-esrc-green-700">{result.marketFit}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
              <p className="text-xs text-muted-foreground mt-1">{t('marketFit')}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-extrabold text-esrc-gold-600">{result.feasibility}<span className="text-sm font-normal text-muted-foreground">/10</span></p>
              <p className="text-xs text-muted-foreground mt-1">{t('feasibility')}</p>
            </div>
          </div>
          {/* Verdict */}
          {result.verdict && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm font-medium text-foreground">{result.verdict}</p>
            </div>
          )}
          {/* Strengths */}
          {result.strengths?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-green-700 flex items-center gap-1 mb-2"><CheckCircle size={14} /> {t('strengths')}</p>
              <ul className="space-y-1">{result.strengths.map((s, i) => <li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}</ul>
            </div>
          )}
          {/* Risks */}
          {result.risks?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-red-700 flex items-center gap-1 mb-2"><AlertTriangle size={14} /> {t('risks')}</p>
              <ul className="space-y-1">{result.risks.map((r, i) => <li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>{r}</li>)}</ul>
            </div>
          )}
          {/* Suggestions */}
          {result.suggestions?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-blue-700 flex items-center gap-1 mb-2"><Lightbulb size={14} /> {t('suggestions')}</p>
              <ul className="space-y-1">{result.suggestions.map((s, i) => <li key={i} className="text-sm text-foreground flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>{s}</li>)}</ul>
            </div>
          )}
          {/* Next Steps */}
          {result.nextSteps?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-purple-700 flex items-center gap-1 mb-2"><TrendingUp size={14} /> {t('nextSteps')}</p>
              <ol className="space-y-1 list-decimal list-inside">{result.nextSteps.map((s, i) => <li key={i} className="text-sm text-foreground">{s}</li>)}</ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PitchDeckBuilder() {
  const t = useTranslations('toolkit.pitch')
  const PITCH_STEPS = ['problem', 'solution', 'market', 'traction', 'ask'] as const
  const [step, setStep] = useState(0)
  const [data, setData] = useState({
    problem: '',
    solution: '',
    market: '',
    traction: '',
    ask: '',
  })

  const currentKey = PITCH_STEPS[step]
  const setCurrent = (v: string) => setData((prev) => ({ ...prev, [currentKey]: v }))

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {PITCH_STEPS.map((s, i) => (
          <Button
            key={s}
            variant={step === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep(i)}
            className="shrink-0"
          >
            {i + 1}. {t(`steps.${s}`)}
          </Button>
        ))}
      </div>
      <div>
        <Label>{t('stepLabel', { n: step + 1, name: t(`steps.${PITCH_STEPS[step]}`) })}</Label>
        <textarea
          value={data[currentKey]}
          onChange={(e) => setCurrent(e.target.value)}
          placeholder={t('describePlaceholder', { field: t(`steps.${PITCH_STEPS[step]}`).toLowerCase() })}
          className="w-full h-40 p-3 border rounded mt-2"
        />
      </div>
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            {t('previous')}
          </Button>
        )}
        {step < PITCH_STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>{t('next')}</Button>
        ) : (
          <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-600 gap-2" onClick={() => {
            const text = PITCH_STEPS.map((s, i) => `${t(`steps.${s}`).toUpperCase()}\n${Object.values(data)[i] || '—'}`).join('\n\n')
            localStorage.setItem('esrc_pitch_deck', JSON.stringify(data))
            const blob = new Blob([text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'pitch-deck.txt'; a.click()
            URL.revokeObjectURL(url)
            toast.success(t('exported'))
          }}>
            <Download size={16} /> {t('exportPitch')}
          </Button>
        )}
      </div>
    </div>
  )
}

export function BusinessRegistrationWizard() {
  const t = useTranslations('toolkit.reg')
  const REG_STEPS = ['name', 'sector', 'legalForm', 'contact', 'confirm'] as const
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    name: '',
    sector: '',
    legalForm: '',
    email: '',
    phone: '',
  })

  const fieldKeys = ['name', 'sector', 'legalForm', 'email', 'phone'] as const
  const currentFieldKey = fieldKeys[step]
  const setCurrent = (v: string) => currentFieldKey && setForm((prev) => ({ ...prev, [currentFieldKey]: v }))

  return (
    <div className="bg-card p-6 rounded-lg border space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {REG_STEPS.map((s, i) => (
          <Button
            key={s}
            variant={step === i ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStep(i)}
            className="shrink-0"
          >
            {i + 1}. {t(`steps.${s}`)}
          </Button>
        ))}
      </div>
      {currentFieldKey && (
        <div>
          <Label>{t(`fields.${currentFieldKey}.label`)}</Label>
          <Input
            value={form[currentFieldKey]}
            onChange={(e) => setCurrent(e.target.value)}
            placeholder={t(`fields.${currentFieldKey}.placeholder`)}
            className="mt-2"
          />
        </div>
      )}
      <div className="flex gap-2">
        {step > 0 && (
          <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
            {t('previous')}
          </Button>
        )}
        {step < REG_STEPS.length - 1 ? (
          <Button onClick={() => setStep((s) => s + 1)}>{t('next')}</Button>
        ) : (
          <Button className="bg-esrc-gold-500 hover:bg-esrc-gold-600 gap-2" onClick={() => {
            localStorage.setItem('esrc_business_reg', JSON.stringify(form))
            const text = `BUSINESS REGISTRATION CHECKLIST\n\nBusiness Name: ${form.name}\nSector: ${form.sector}\nLegal Form: ${form.legalForm}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nNext steps:\n1. Visit the nearest Centre de Formalités de Création d'Entreprise (CFCE)\n2. Bring 2 passport photos, national ID, and this form\n3. Pay registration fees (approx. 45,000 XAF for SARL)`
            const blob = new Blob([text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = 'business-registration-checklist.txt'; a.click()
            URL.revokeObjectURL(url)
            toast.success(t('exportedToast'))
          }}>
            <Download size={16} /> {t('exportChecklist')}
          </Button>
        )}
      </div>
    </div>
  )
}

export function InteractiveToolkit() {
  const t = useTranslations('toolkit')
  return (
    <Tabs defaultValue="canvas" className="w-full">
      <TabsList className="flex flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="canvas" className="gap-1 shrink-0">{t('tabs.canvas')}</TabsTrigger>
        <TabsTrigger value="financial" className="gap-1 shrink-0">{t('tabs.financial')}</TabsTrigger>
        <TabsTrigger value="loan" className="gap-1 shrink-0">{t('tabs.loan')}</TabsTrigger>
        <TabsTrigger value="market" className="gap-1 shrink-0">{t('tabs.market')}</TabsTrigger>
        <TabsTrigger value="ai" className="gap-1 shrink-0">{t('tabs.ai')}</TabsTrigger>
        <TabsTrigger value="pitch" className="gap-1 shrink-0">{t('tabs.pitch')}</TabsTrigger>
        <TabsTrigger value="reg" className="gap-1 shrink-0">{t('tabs.reg')}</TabsTrigger>
        <TabsTrigger value="funding" className="gap-1 shrink-0">{t('tabs.funding')}</TabsTrigger>
      </TabsList>

      <TabsContent value="canvas" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.canvas')}</h3>
        <BusinessModelCanvas />
      </TabsContent>

      <TabsContent value="financial" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.financial')}</h3>
        <FinancialCalculator />
      </TabsContent>

      <TabsContent value="loan" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.loan')}</h3>
        <LoanReadinessScore />
      </TabsContent>

      <TabsContent value="market" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.market')}</h3>
        <MarketSizingCalculator />
      </TabsContent>

      <TabsContent value="ai" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.ai')}</h3>
        <AIIdeaValidator />
      </TabsContent>

      <TabsContent value="pitch" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.pitch')}</h3>
        <PitchDeckBuilder />
      </TabsContent>

      <TabsContent value="reg" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.reg')}</h3>
        <BusinessRegistrationWizard />
      </TabsContent>

      <TabsContent value="funding" className="mt-6">
        <h3 className="text-lg font-semibold mb-4">{t('sectionTitles.funding')}</h3>
        <FundingDirectory />
      </TabsContent>
    </Tabs>
  )
}
