'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { GraduationCap, Users, BookOpen } from 'lucide-react'
import { PLACEHOLDER_IMAGES } from '@/lib/placeholders'
import { GoogleLogin } from '@react-oauth/google'

function roleHome(role?: string | null) {
  if (role === 'ADMIN' || role === 'admin') return '/admin/dashboard'
  if (role === 'INSTRUCTOR' || role === 'instructor') return '/instructor/dashboard'
  return '/dashboard'
}

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')
  const { login, loginWithGoogle, isAuthenticated, isLoading, user } = useAuth()
  const t = useTranslations('auth')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo || roleHome(user?.role))
    }
  }, [isAuthenticated, isLoading, user?.role, router, redirectTo])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await login(formData.email, formData.password)

      if (!res.success) {
        setError(res.error || 'Login failed')
        return
      }

      router.push(redirectTo || roleHome(res.role))
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credential: string) => {
    setGoogleLoading(true)
    setError('')
    try {
      const res = await loginWithGoogle(credential)
      if (!res.success) {
        setError((res as { success: false; error: string }).error || 'Google sign-in failed')
        return
      }
      if ('needsProfileCompletion' in res && res.needsProfileCompletion) {
        sessionStorage.setItem('esrc_google_profile', JSON.stringify(res.googleProfile))
        router.push('/complete-profile')
        return
      }
      router.push(redirectTo || roleHome((res as { role?: string }).role))
    } catch {
      setError('Google sign-in failed. Please try again.')
    } finally {
      setGoogleLoading(false)
    }
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
          <h2 className="font-display text-3xl font-bold mb-4">
            {t('unlockingHuman')}
          </h2>
          <p className="text-white/90 text-lg mb-10">
            {t('educationResearch')}
          </p>
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

      {/* Right: Login form - 60% */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <div className="md:hidden text-center mb-8">
            <h1 className="font-display text-2xl font-bold text-primary">NextGen</h1>
            <p className="text-muted-foreground text-sm mt-1">{t('unlockingHuman')}</p>
          </div>
          <h2 className="font-display text-2xl font-bold text-foreground mb-1">{t('welcomeBack')}</h2>
          <p className="text-muted-foreground mb-6">{t('signIn')}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-lg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(v) => setRememberMe(!!v)}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                  {t('rememberMe')}
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/90 transition-colors"
              >
                {t('forgotPassword')}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-esrc-green-700 hover:bg-esrc-green-900 text-white rounded-lg py-3 font-medium"
            >
              {loading ? t('signingIn') : t('signInButton')}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-background text-muted-foreground">{t('or')}</span>
              </div>
            </div>

            <div className="w-full">
              {googleLoading ? (
                <Button type="button" variant="outline" disabled className="w-full border-2 border-border rounded-lg py-3">
                  <svg className="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  {t('signingInGoogle')}
                </Button>
              ) : (
                <GoogleLogin
                  onSuccess={({ credential }) => {
                    if (credential) handleGoogleSuccess(credential)
                  }}
                  onError={() => setError('Google sign-in failed or was cancelled')}
                  width="100%"
                  text="signin_with"
                  shape="rectangular"
                  logo_alignment="left"
                />
              )}
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t('newToESRC')}{' '}
              <Link href="/register" className="text-primary hover:text-primary/90 font-medium">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
