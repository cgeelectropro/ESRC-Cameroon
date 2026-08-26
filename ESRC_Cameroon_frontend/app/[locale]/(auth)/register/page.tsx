'use client'

import { useState, useEffect } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations, useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { GraduationCap, Users, BookOpen, Handshake, CheckCircle, BadgeCheck, Check } from 'lucide-react'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholders'
import { apiClient } from '@/lib/api-client'

const countries = ['Cameroon', 'DRC', 'Chad', 'Gabon', 'Equatorial Guinea', 'CAR', 'Other']

type CategoryOption = { label: string; value: string }

const mapRole = (role: string) => {
  const r = role?.toLowerCase() ?? 'learner'
  if (r === 'researcher') return 'FELLOW'
  return r.toUpperCase()
}

const mapLanguage = (lang: string) => (lang === 'fr' ? 'FR' : 'EN')

export default function RegisterPage() {
  const router = useRouter()
  const { register: doRegister, isAuthenticated, isLoading } = useAuth()
  const t = useTranslations('auth')
  const locale = useLocale()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: '',
    city: '',
    preferredLanguage: 'en',
    role: '',
    interests: [] as string[],
    goals: '',
    // Instructor-specific fields
    instructorTitle: '',
    organization: '',
    expertise: [] as string[],
    phone: '',
    linkedinUrl: '',
    motivation: '',
  })

  const isInstructor = formData.role === 'instructor'
  const totalSteps = isInstructor ? 4 : 3

  const ROLE_CARDS = [
    { id: 'learner', label: t('roles.learner'), icon: GraduationCap, desc: t('roles.learnerDesc') },
    { id: 'instructor', label: t('roles.instructor'), icon: BookOpen, desc: t('roles.instructorDesc') },
    { id: 'researcher', label: t('roles.researcher'), icon: Users, desc: t('roles.researcherDesc') },
    { id: 'partner', label: t('roles.partner'), icon: Handshake, desc: t('roles.partnerDesc') },
  ]

  // Fetch interest categories from the backend (same categories admins manage)
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

  const mapInterests = (interests: string[]) => interests.filter(Boolean)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
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
    if (step === 2) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
        setError(t('fillRequired')); return
      }
      if (formData.password !== formData.confirmPassword) { setError(t('passwordMismatch')); return }
    }
    setError('')
    setStep((s) => Math.min(s + 1, totalSteps))
  }

  const prevStep = () => setStep((s) => Math.max(s - 1, 1))

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (formData.password !== formData.confirmPassword) { setError(t('passwordMismatch')); return }
    setLoading(true)
    try {
      const payload: Record<string, any> = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        country: formData.country,
        city: formData.city,
        role: mapRole(formData.role),
        preferredLanguage: mapLanguage(formData.preferredLanguage),
        interests: mapInterests(formData.interests),
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = await doRegister(payload as any)
      if (!res.success) { setError(res.error || t('registrationFailed')); return }
      // Pending instructors go to the wait page
      if (isInstructor || res.pendingInstructorApproval) {
        router.push('/pending-approval')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / totalSteps) * 100
  const stepLabels: Record<number, string> = {
    1: t('stepChooseRole'),
    2: t('stepPersonalInfo'),
    3: isInstructor ? t('stepProfessionalProfile') : t('stepInterestsGoals'),
    4: t('stepInterestsGoals'),
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Green brand panel - 40% */}
      <div
        className="hidden md:flex md:w-2/5 text-white flex-col justify-center p-12 relative"
        style={{
          backgroundImage: `url(${PLACEHOLDER_IMAGES.auth})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-esrc-green-900/75 via-esrc-green-800/60 to-esrc-green-700/55" />
        <div className="relative z-10">
          <h2 className="font-display text-3xl font-bold mb-4">{t('unlockingHuman')}</h2>
          <p className="text-white/90 text-lg mb-10">{t('educationResearch')}</p>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <GraduationCap size={28} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">50K+</p>
                <p className="text-sm text-white/90">{t('learners')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <BookOpen size={28} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">200+</p>
                <p className="text-sm text-white/90">{t('courses')}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/25 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/20">
                <Users size={28} />
              </div>
              <div>
                <p className="font-display text-2xl font-bold">500+</p>
                <p className="text-sm text-white/90">{t('mentors')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Registration form - 60% */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background overflow-y-auto">
      <div className="w-full max-w-2xl py-8">
        <div className="md:hidden text-center mb-8">
          <h1 className="font-display text-2xl font-bold text-primary">NextGen</h1>
        </div>
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">{t('joinNextGen')}</h1>
          <p className="text-muted-foreground">{t('createAccountDesc')}</p>
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

        {/* ── Step 1: Role selection ── */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="font-semibold text-lg text-foreground">{t('chooseRole')}</h2>
            <div className="grid grid-cols-2 gap-4">
              {ROLE_CARDS.map((r) => {
                const Icon = r.icon
                const selected = formData.role === r.id
                return (
                  <button key={r.id} type="button" onClick={() => setFormData((prev) => ({ ...prev, role: r.id }))}
                    className={`p-5 rounded-lg border-2 text-left transition-all relative ${selected ? 'border-esrc-green-700 bg-esrc-green-700/10 ring-2 ring-esrc-green-700/30' : 'border-border hover:border-esrc-green-700/50 hover:bg-muted/50'}`}>
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
            <Button onClick={nextStep} className="w-full rounded-lg py-3 bg-esrc-green-700 hover:bg-esrc-green-900 text-white" disabled={!formData.role}>
              {formData.role ? t('continueAs', { role: ROLE_CARDS.find(r => r.id === formData.role)?.label ?? '' }) : t('selectRoleToContinue')}
            </Button>
          </div>
        )}

        {/* ── Step 2: Personal info ── */}
        {step === 2 && (
          <form onSubmit={(e) => { e.preventDefault(); nextStep() }} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">{t('firstName')} *</Label>
                <Input id="firstName" name="firstName" placeholder="John" value={formData.firstName} onChange={handleChange} required className="rounded-lg" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">{t('lastName')} *</Label>
                <Input id="lastName" name="lastName" placeholder="Doe" value={formData.lastName} onChange={handleChange} required className="rounded-lg" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('email')} *</Label>
              <Input id="email" type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('password')} *</Label>
              <Input id="password" type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required className="rounded-lg" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('confirmPassword')} *</Label>
              <Input id="confirmPassword" type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleChange} required className="rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('country')}</Label>
                <Select value={formData.country} onValueChange={(v) => handleSelectChange('country', v)}>
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
              <Select value={formData.preferredLanguage} onValueChange={(v) => handleSelectChange('preferredLanguage', v)}>
                <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">{t('back')}</Button>
              <Button type="submit" className="flex-1 rounded-lg">{t('continue')}</Button>
            </div>
          </form>
        )}

        {/* ── Step 3 (instructor only): Professional profile ── */}
        {step === 3 && isInstructor && (
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

        {/* ── Last step: Interests & goals (step 3 for non-instructors, step 4 for instructors) ── */}
        {((step === 3 && !isInstructor) || (step === 4 && isInstructor)) && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="font-semibold text-lg text-foreground mb-3">What interests you?</h2>
              <p className="text-sm text-muted-foreground mb-4">{t('interestsDesc')}</p>
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
              <Textarea id="goals" name="goals" placeholder={t('goalsPlaceholder')} value={formData.goals} onChange={handleChange} rows={4} className="rounded-lg" />
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={prevStep} className="rounded-lg">{t('back')}</Button>
              <Button type="submit" disabled={loading} className="flex-1 rounded-lg bg-esrc-green-700 hover:bg-esrc-green-900">
                {loading ? t('creatingAccount') : isInstructor ? t('submitApplication') : t('createAccountBtn')}
              </Button>
            </div>
          </form>
        )}

        <p className="mt-8 text-center text-sm text-muted-foreground">
          {t('alreadyHaveAccount')}{' '}
          <Link href="/login" className="text-primary hover:text-primary/90 font-medium">{t('signInLink')}</Link>
        </p>
      </div>
      </div>
    </div>
  )
}
