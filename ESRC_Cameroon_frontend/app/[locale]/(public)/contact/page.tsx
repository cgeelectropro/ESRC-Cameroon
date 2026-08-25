'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Mail, Phone, MapPin } from 'lucide-react'

export default function ContactPage() {
  const t = useTranslations('contact')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // TODO: Connect to actual contact form endpoint
      console.log('Form submitted:', formData)
      setSuccess(true)
      setFormData({ name: '', email: '', subject: '', message: '' })
      setTimeout(() => setSuccess(false), 5000)
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        imageKey="contact"
      />

      <main className="flex-grow section-padding">
        <div className="container-width max-w-4xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              {[
                { icon: Mail, titleKey: 'email', content: 'info@esrccameroon.org' },
                { icon: Phone, titleKey: 'phone', content: '+237 677 948 904 / 677 775 535' },
                { icon: MapPin, titleKey: 'address', content: 'Entrepreneurship and Social Research Centre, UP-Station Bamenda; Opposite Tradex Nomayous, Yaoundé, Cameroon' },
              ].map((item, idx) => {
                const Icon = item.icon
                return (
                  <div key={idx}>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon size={24} className="text-primary" />
                      <h3 className="font-semibold text-foreground">{t(item.titleKey)}</h3>
                    </div>
                    <p className="text-muted-foreground ml-9">{item.content}</p>
                  </div>
                )
              })}
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="font-display">{t('sendMessage')}</CardTitle>
                  <CardDescription>{t('replyNote')}</CardDescription>
                </CardHeader>
                <CardContent>
                  {success && (
                    <div className="mb-4 p-3 bg-accent border border-primary/20 rounded-lg text-foreground text-sm">
                      {t('successMessage')}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">{t('name')}</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder={t('namePlaceholder')}
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t('email')}</Label>
                        <Input
                          id="email"
                          type="email"
                          name="email"
                          placeholder={t('emailPlaceholder')}
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">{t('subject')}</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder={t('subjectPlaceholder')}
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">{t('message')}</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder={t('messagePlaceholder')}
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        disabled={loading}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-lg py-3 font-medium"
                    >
                      {loading ? t('sending') : t('sendMessageBtn')}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
