'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { toast } from 'sonner'
import { apiClient } from '@/lib/api-client'
import { setAuth, type StoredUser } from '@/lib/auth-storage'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Users, BookOpen, Handshake, CheckCircle, BadgeCheck, Check } from 'lucide-react'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholders'

const countries = ['Cameroon', 'DRC', 'Chad', 'Gabon', 'Equatorial Guinea', 'CAR', 'Other']

type CategoryOption = { label: string; value: string }

type GoogleProfile = {
  googleId: string
  email: string
  firstName: string
  lastName: string
  avatar: string | null
}

const mapRole = (role: string) => {
  const r = role?.toLowerCase() ?? 'learner'
  if (r === 'researcher') return 'FELLOW'
  return r.toUpperCase()
}

export default function CompleteProfilePage() {
  const router = useRouter()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [googleProfile, setGoogleProfile] = useState<GoogleProfile | null>(null)
  const [categories, setCategories] = useState<CategoryOption[]>([])

  const [formData, setFormData] = useState({
    role: '',
    country: '',
    city: '',
    preferredLanguage: 'en',
    interests: [] as string[],
    goals: '',
    // Instructor-specific
    instructorTitle: '',
    organization: '',
    expertise: [] as string[],
    phone: '',
    linkedinUrl: '',
    motivation: '',
  })

  const isInstructor = formData.role === 'instructor'
  const totalSteps = isInstructor ? 3 : 2

  const ROLE_CARDS = [
    { id: 'learner', label: t('roles.learner'), icon: GraduationCap, desc: t('roles.learnerDesc') },
    { id: 'instructor', label: t('roles.instructor'), icon: BookOpen, desc: t('roles.instructorDesc') },
    { id: 'researcher', label: t('roles.researcher'), icon: Users, desc: t('roles.researcherDesc') },
    { id: 'partner', label: t('roles.partner'), icon: Handshake, desc: t('roles.partnerDesc') },
  ]

  useEffect(() => {
    apiClient.getCourseCategories().then((res) => {
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data.map((c: { slug: string; nameEn: string; nameFr: string }) => ({
          label: locale === 'fr' ? c.nameFr : c.nameEn,
          value: c.slug,
        })))
      }
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const stored = sessionStorage.getItem('esrc_google_profile')
    if (!stored) {
      router.push('/login')
      return
    }
    try {
      setGoogleProfile(JSON.parse(stored) as GoogleProfile)
    } catch {
      router.push('/login')
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleInterest = (cat: string) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(cat)
        ? prev.interests.filter((i) => i !== cat)
        : [...prev.interests, cat],
    }))
  }

  const toggleExpertise = (area: string) => {
    setFormData((prev) => ({
      ...prev,
      expertise: prev.expertise.includes(area)
        ? prev.expertise.filter((e) => e !== area)
        : [...prev.expertise, area],
    }))
  }

  const nextStep = () => {
    if (step === 1 && !formData.role) { setError(t('selectRole')); return }
    setError('')
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!googleProfile) return
    setLoading(true)
    setError('')
    try {
      const payload: Record<string, unknown> = {
        googleId: googleProfile.googleId,
        email: googleProfile.email,
        firstName: googleProfile.firstName,
        lastName: googleProfile.lastName,
        country: formData.country,
        city: formData.city,
        role: mapRole(formData.role),
        preferredLanguage: formData.preferredLanguage === 'fr' ? 'FR' : 'EN',
        interests: formData.interests.filter(Boolean),
        goals: formData.goals,
      }
      if (isInstructor) {
        payload.instructorTitle = formData.instructorTitle
        payload.organization = formData.organization
        payload.expertise = formData.expertise
        payload.phone = formData.phone
        payload.linkedinUrl = formData.linkedinUrl
        payload.motivation = formData.motivation
      }

      const res = await apiClient.completeGoogleProfile(payload)
      if (!res.success) {
        const message = res.error || 'Registration failed'
        setError(message)
        toast.error(message)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }

      const data = res.data as { user: StoredUser; token: string; refreshToken?: string | null; pendingInstructorApproval?: boolean }
      setAuth(data.token, data.user, data.refreshToken ?? null)
      sessionStorage.removeItem('esrc_google_profile')

      if (isInstructor || data.pendingInstructorApproval) {
        toast.success(t('applicationSubmitted'))
        router.push('/pending-approval')
      } else {
        toast.success(t('accountCreated'))
        router.push('/dashboard')
      }
    } catch {
      const message = 'An error occurred. Please try again.'
      setError(message)
      toast.error(message)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / totalSteps) * 100
  const stepLabels: Record<number, string> = {
    1: t('stepChooseRole'),
    2: isInstructor ? t('stepProfessionalProfile') : t('stepLocationInterests'),
    3: t('stepLocationInterests'),
  }

  if (!googleProfile) return null

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8 relative"
      style={{ backgroundImage: `url(${PLACEHOLDER_IMAGES.auth})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="absolute inset-0 bg-background/75 backdrop-blur-3xl pointer-events-none" style={{backdropFilter:'blur(40px) saturate(180%)'}} />
      <div className="relative z-10 w-full max-w-2xl glass-overlay rounded-2xl p-8 shadow-2xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {googleProfile.avatar && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={googleProfile.avatar} alt="" className="w-12 h-12 rounded-full border-2 border-esrc-green-700" referrerPolicy="no-referrer" />
            )}
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">{t('almostThere', { name: googleProfile.firstName })}</h1>
              <p className="text-sm text-muted-foreground">{googleProfile.email}</p>
            </div>
          </div>
          <p className="text-muted-foreground text-sm">{t('fewMoreDetails')}</p>
          <div className="mt-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Step {step} of {totalSteps}</span>
              <span>{stepLabels[step]}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">{error}</div>
        )}

        {/* Step 1: Role selection */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-foreground">{t('chooseRole')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {ROLE_CARDS.map((r) => {
                const Icon = r.icon
                const selected = formData.role === r.id
                return (
                  <button key={r.id} type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, role: r.id }))}
                    className={`p-5 rounded-lg border-2 text-left transition-all relative ${selected ? 'border-esrc-green-700 bg-esrc-green-700/10 ring-2 ring-esrc-green-700/30' : 'border-border hover:border-esrc-green-700/50 hover:bg-muted/50'}`}
                  >
                    {selected && <CheckCircle size={18} className="absolute top-3 right-3 text-esrc-green-700" fill="currentColor" />}
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${selected ? 'bg-esrc-green-700 text-white' : 'bg-muted text-muted-foreground'}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${selected ? 'text-esrc-green-700' : 'text-foreground'}`}>{r.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
            {formData.role === 'instructor' && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <BadgeCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t('approvalRequired')}</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                    {t('approvalDesc')}
                  </p>
                </div>
              </div>
            )}
            <Button
              onClick={nextStep}
              className="w-full rounded-lg py-3 bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
              disabled={!formData.role}
            >
              {formData.role ? t('continueAs', { role: ROLE_CARDS.find((r) => r.id === formData.role)?.label ?? '' }) : t('selectRoleToContinue')}
            </Button>
          </div>
        )}

        {/* Step 2 (instructor only): Professional profile */}
        {step === 2 && isInstructor && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-5">
            <div>
              <h2 className="font-semibold text-lg text-foreground mb-1">{t('professionalProfile')}</h2>
              <p className="text-sm text-muted-foreground">{t('professionalProfileDesc')}</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instructorTitle">{t('professionalTitle')}</Label>
              <Input id="instructorTitle" name="instructorTitle" placeholder={t('professionalTitlePlaceholder')} value={formData.instructorTitle} onChange={handleChange} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="organization">{t('organization')}</Label>
              <Input id="organization" name="organization" placeholder={t('organizationPlaceholder')} value={formData.organization} onChange={handleChange} className="rounded-lg" />
            </div>
            <div>
              <Label className="mb-2 block">{t('areasOfExpertise')}</Label>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Loading categories…</p>
                )}
                {categories.map((area) => {
                  const sel = formData.expertise.includes(area.value)
                  return (
                    <button key={area.value} type="button" onClick={() => toggleExpertise(area.value)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border-2 transition-all select-none
                        ${sel
                          ? 'border-esrc-green-700 bg-esrc-green-700 text-white shadow-sm'
                          : 'border-border bg-muted text-foreground hover:border-esrc-green-700/60 hover:bg-muted/80'
                        }`}>
                      {sel && <Check size={13} strokeWidth={3} />}
                      {area.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t('contactPhone')}</Label>
              <Input id="phone" name="phone" placeholder="+237 6XX XXX XXX" value={formData.phone} onChange={handleChange} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">{t('linkedinUrl')}</Label>
              <Input id="linkedinUrl" name="linkedinUrl" placeholder={t('linkedinPlaceholder')} value={formData.linkedinUrl} onChange={handleChange} className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="motivation">{t('motivationLabel')}</Label>
              <Textarea id="motivation" name="motivation" placeholder={t('motivationPlaceholder')} value={formData.motivation} onChange={handleChange} rows={4} required className="rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">{t('back')}</Button>
              <Button type="submit" className="flex-1 rounded-lg">{t('continue')}</Button>
            </div>
          </form>
        )}

        {/* Last step: Location, language & interests */}
        {((step === 2 && !isInstructor) || (step === 3 && isInstructor)) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('country')}</Label>
                <Select value={formData.country} onValueChange={(v) => setFormData((prev) => ({ ...prev, country: v }))}>
                  <SelectTrigger className="rounded-lg"><SelectValue placeholder={t('selectCountry')} /></SelectTrigger>
                  <SelectContent>{countries.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('city')}</Label>
                <Input id="city" name="city" placeholder="Yaoundé" value={formData.city} onChange={handleChange} className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{t('preferredLanguage')}</Label>
              <Select value={formData.preferredLanguage} onValueChange={(v) => setFormData((prev) => ({ ...prev, preferredLanguage: v }))}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <h3 className="font-semibold text-base text-foreground mb-2">What interests you?</h3>
              <p className="text-sm text-muted-foreground mb-3">{t('interestsDesc')}</p>
              <div className="flex flex-wrap gap-2">
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">Loading categories…</p>
                )}
                {categories.map((cat) => {
                  const sel = formData.interests.includes(cat.value)
                  return (
                    <button key={cat.value} type="button" onClick={() => toggleInterest(cat.value)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all select-none
                        ${sel
                          ? 'border-esrc-green-700 bg-esrc-green-700 text-white shadow-sm'
                          : 'border-border bg-muted text-foreground hover:border-esrc-green-700/60 hover:bg-muted/80'
                        }`}>
                      {sel && <Check size={13} strokeWidth={3} />}
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="goals">{t('goals')}</Label>
              <Textarea id="goals" name="goals" placeholder={t('goalsPlaceholder')} value={formData.goals} onChange={handleChange} rows={3} className="rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">{t('back')}</Button>
              <Button type="submit" disabled={loading} className="flex-1 rounded-lg bg-esrc-green-700 hover:bg-esrc-green-900 text-white">
                {loading ? t('creatingAccount') : isInstructor ? t('submitApplication') : t('completeSetup')}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
