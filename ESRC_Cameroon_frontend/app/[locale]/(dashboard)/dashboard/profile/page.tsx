'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api-client'
import { useAuth } from '@/contexts/AuthContext'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { Sidebar } from '@/components/layout/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Award, Calendar, User } from 'lucide-react'
// ProfileData uses a loose record type since API response may vary from strict User type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ProfileData = Record<string, any> & {
  id?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: string
  avatar?: string
  bio?: string
  country?: string
  city?: string
  phone?: string
  preferredLanguage?: string
  enrolledCourses?: string[]
  completedCourses?: string[]
  certificates?: Array<{ id: string; courseTitle: string; issuedAt: string }>
  createdAt?: string
}

export default function ProfilePage() {
  const t = useTranslations('profile')
  const { user: authUser, refreshSession } = useAuth()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    city: '',
    phone: '',
    preferredLanguage: 'en',
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await apiClient.getProfile()
        if (res.success && res.data) {
          const p = res.data as ProfileData
          setProfile(p)
          setFormData({
            firstName: p.firstName ?? '',
            lastName: p.lastName ?? '',
            bio: p.bio ?? '',
            city: p.city ?? '',
            phone: p.phone ?? '',
            preferredLanguage: p.preferredLanguage ?? 'en',
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMessage(null)
    try {
      const res = await apiClient.updateProfile(formData)
      if (res.success) {
        setSaveMessage({ type: 'success', text: t('saveSuccess') })
        await refreshSession()
        const updated = await apiClient.getProfile()
        if (updated.success && updated.data) setProfile(updated.data as ProfileData)
      } else {
        setSaveMessage({ type: 'error', text: res.error || t('saveFailed') })
      }
    } catch {
      setSaveMessage({ type: 'error', text: t('saveFailed') })
    } finally {
      setSaving(false)
      setTimeout(() => setSaveMessage(null), 4000)
    }
  }

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage({ type: 'error', text: t('passwordMismatch') })
      return
    }
    setUpdatingPassword(true)
    setPasswordMessage(null)
    try {
      const res = await apiClient.updateProfile({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      if (res.success) {
        setPasswordMessage({ type: 'success', text: t('passwordSuccess') })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setPasswordMessage({ type: 'error', text: res.error || t('passwordFailed') })
      }
    } catch {
      setPasswordMessage({ type: 'error', text: t('passwordFailed') })
    } finally {
      setUpdatingPassword(false)
      setTimeout(() => setPasswordMessage(null), 4000)
    }
  }

  const memberSince = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    : '—'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex flex-1 pt-20">
        <Sidebar />

        <main className="flex-1 section-padding">
          <div className="container-width max-w-2xl space-y-8">
            <div>
              <h1 className="font-display text-4xl text-foreground mb-2">{t('title')}</h1>
              <p className="text-muted-foreground">{t('subtitle')}</p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-esrc-green-700" />
                <span className="ml-4 text-muted-foreground">{t('loading')}</span>
              </div>
            ) : (
              <>
                {/* Stats */}
                {profile && (
                  <div className="grid grid-cols-3 gap-4">
                    <Card className="text-center p-4 shadow-sm">
                      <BookOpen size={24} className="mx-auto mb-1 text-esrc-green-700" />
                      <p className="text-2xl font-bold text-foreground">{profile.enrolledCourses?.length ?? 0}</p>
                      <p className="text-xs text-muted-foreground">{t('coursesEnrolled')}</p>
                    </Card>
                    <Card className="text-center p-4 shadow-sm">
                      <Award size={24} className="mx-auto mb-1 text-esrc-gold-500" />
                      <p className="text-2xl font-bold text-foreground">{profile.certificates?.length ?? 0}</p>
                      <p className="text-xs text-muted-foreground">{t('certificates')}</p>
                    </Card>
                    <Card className="text-center p-4 shadow-sm">
                      <Calendar size={24} className="mx-auto mb-1 text-muted-foreground" />
                      <p className="text-sm font-semibold text-foreground">{memberSince}</p>
                      <p className="text-xs text-muted-foreground">{t('memberSince')}</p>
                    </Card>
                  </div>
                )}

                {/* Avatar + role */}
                {profile && (
                  <Card className="shadow-sm">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-esrc-green-100 dark:bg-esrc-green-900/30 flex items-center justify-center overflow-hidden">
                          {profile.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={profile.avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover" />
                          ) : (
                            <User size={32} className="text-esrc-green-700" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-foreground">
                            {profile.firstName} {profile.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{profile.email}</p>
                          <Badge variant="outline" className="mt-1 text-xs capitalize">
                            {profile.role?.toLowerCase() ?? 'learner'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Personal Info Form */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display">{t('personalInfo')}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">{t('firstName')}</Label>
                          <Input
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="lastName">{t('lastName')}</Label>
                          <Input
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email ?? authUser?.email ?? ''}
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">{t('emailNote')}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">{t('city')}</Label>
                          <Input
                            id="city"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            disabled={saving}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">{t('phone')}</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={saving}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">{t('bio')}</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          rows={4}
                          placeholder={t('bioPlaceholder')}
                          disabled={saving}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="preferredLanguage">{t('preferredLanguage')}</Label>
                        <select
                          id="preferredLanguage"
                          name="preferredLanguage"
                          value={formData.preferredLanguage}
                          onChange={handleChange}
                          disabled={saving}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="en">English</option>
                          <option value="fr">Français</option>
                        </select>
                      </div>

                      {saveMessage && (
                        <p className={`text-sm ${saveMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                          {saveMessage.text}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
                      >
                        {saving ? t('saving') : t('saveChanges')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Password Change */}
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="font-display">{t('changePassword')}</CardTitle>
                    <CardDescription>{t('changePasswordDesc')}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handlePasswordUpdate} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">{t('currentPassword')}</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.currentPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                          disabled={updatingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newPassword">{t('newPassword')}</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.newPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                          disabled={updatingPassword}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">{t('confirmPassword')}</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="••••••••"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                          disabled={updatingPassword}
                        />
                      </div>

                      {passwordMessage && (
                        <p className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>
                          {passwordMessage.text}
                        </p>
                      )}

                      <Button
                        type="submit"
                        disabled={updatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                        className="w-full bg-esrc-green-700 hover:bg-esrc-green-900 text-white"
                      >
                        {updatingPassword ? t('updating') : t('updatePassword')}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
