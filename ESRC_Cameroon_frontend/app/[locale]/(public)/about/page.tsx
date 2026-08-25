'use client'

import { useEffect, useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { PageHero } from '@/components/shared/PageHero'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Award, Users, Globe, Zap, Target, BookOpen, Lightbulb, Linkedin, Mail as MailIcon } from 'lucide-react'
import { LegalBadge } from '@/components/shared/LegalBadge'
import type { TeamMember, AboutStat } from '@/lib/types'

const SUPABASE_MEDIA = 'https://rohatzmiqhczybfbgjhj.supabase.co/storage/v1/object/public/media/'

export default function AboutPage() {
  const t = useTranslations('about')
  const locale = useLocale()

  const [team, setTeam] = useState<TeamMember[]>([])
  const [stats, setStats] = useState<AboutStat[]>([])

  useEffect(() => {
    fetch('/api/content/team').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data)) setTeam(d.data)
    }).catch(() => null)
    fetch('/api/content/about-stats').then(r => r.json()).then(d => {
      if (d.success && Array.isArray(d.data)) setStats(d.data)
    }).catch(() => null)
  }, [])

  const values = [
    { icon: Globe, titleKey: 'inclusivity', descKey: 'inclusivityDesc' },
    { icon: Zap, titleKey: 'excellence', descKey: 'excellenceDesc' },
    { icon: Award, titleKey: 'impact', descKey: 'impactDesc' },
    { icon: Users, titleKey: 'collaboration', descKey: 'collaborationDesc' },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <PageHero
        title={t('title')}
        subtitle={t('subtitle')}
        imageKey="about"
      />

      <main className="flex-grow section-padding">
        <div className="container-width space-y-20">

          {/* Who We Are */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-display text-4xl mb-6 text-primary">{t('historyTitle')}</h2>
                <p className="text-lg text-foreground mb-6 leading-relaxed">
                  {t('historyP1')}
                </p>
                <p className="text-lg text-foreground leading-relaxed">
                  {t('historyP2')}
                </p>
              </div>
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t('activitiesTitle')}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{t('activitiesText')}</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Vision */}
          <section className="bg-primary rounded-2xl p-12 text-primary-foreground">
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="font-display text-4xl mb-6">{t('visionTitle')}</h2>
              <p className="text-lg leading-relaxed opacity-90">
                {t('visionText')}
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section>
            <h2 className="font-display text-4xl mb-12 text-primary text-center">
              {t('valuesTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, idx) => {
                const Icon = value.icon
                return (
                  <Card key={idx} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <Icon size={32} className="text-primary mb-4" />
                      <h3 className="font-semibold text-lg text-foreground mb-2">
                        {t(value.titleKey)}
                      </h3>
                      <p className="text-muted-foreground text-sm">{t(value.descKey)}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>

          {/* Three Pillars */}
          <section className="bg-accent rounded-2xl p-12">
            <h2 className="font-display text-4xl mb-12 text-primary text-center">
              {t('pillarsTitle')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl text-primary mb-3">{t('learningPlatform')}</h3>
                <p className="text-foreground text-sm leading-relaxed">{t('learningPlatformDesc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl text-primary mb-3">{t('researchHub')}</h3>
                <p className="text-foreground text-sm leading-relaxed">{t('researchHubDesc')}</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display text-xl text-primary mb-3">{t('entrepreneurEcosystem')}</h3>
                <p className="text-foreground text-sm leading-relaxed">{t('entrepreneurEcosystemDesc')}</p>
              </div>
            </div>
          </section>

          {/* Impact Stats — dynamic from DB */}
          {stats.length > 0 && (
            <section>
              <h2 className="font-display text-4xl mb-12 text-primary text-center">
                {t('impactTitle')}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
                {stats.map((stat) => (
                  <div key={stat.id} className="bg-card border border-border rounded-xl p-6">
                    <div className="font-display text-3xl text-primary mb-2">{stat.number}</div>
                    <p className="text-sm text-muted-foreground">
                      {locale === 'fr' ? stat.labelFr : stat.labelEn}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Team — dynamic from DB */}
          <section className="text-center">
            <h2 className="font-display text-4xl mb-4 text-primary">{t('teamTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">{t('teamSubtitle')}</p>
            {team.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {team.map((member) => (
                  <div key={member.id} className="bg-card border border-border rounded-xl p-6 flex flex-col items-center gap-3">
                    <div className="w-20 h-20 rounded-full overflow-hidden bg-primary/10">
                      {member.photo ? (
                        <img
                          src={`${SUPABASE_MEDIA}${member.photo}`}
                          alt={member.name}
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary font-bold text-2xl">
                          {member.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{member.role}</p>
                      {member.bio && <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{member.bio}</p>}
                    </div>
                    {(member.linkedin || member.email) && (
                      <div className="flex gap-2">
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                            <Linkedin className="w-3.5 h-3.5" />
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="p-1.5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors">
                            <MailIcon className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1,2,3,4].map(i => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-muted mx-auto mb-3" />
                    <div className="h-3 bg-muted rounded w-3/4 mx-auto mb-1.5" />
                    <div className="h-2.5 bg-muted rounded w-1/2 mx-auto" />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Legal Registration */}
          <section>
            <h2 className="font-display text-4xl mb-6 text-primary text-center">Legal Registration</h2>
            <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
              NextGen is an officially registered enterprise in Cameroon, certified by the Centre de Formalités de Création d&apos;Entreprises (CFCE) of Yaoundé.
            </p>
            <LegalBadge variant="full" />
          </section>

          {/* CTA */}
          <section className="text-center bg-[#F9A825]/10 border border-[#F9A825]/30 rounded-2xl p-16">
            <h2 className="font-display text-4xl mb-4 text-primary">{t('ctaTitle')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">{t('ctaText')}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="btn-gold px-8 py-3 text-base">
                <Link href={`/${locale}/contact`}>{t('contactUs')}</Link>
              </Button>
              <Button asChild variant="outline" className="px-8 py-3 text-base border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                <Link href={`/${locale}/courses`}>{t('exploreCourses')}</Link>
              </Button>
            </div>
          </section>

          {/* Copyright */}
          <section className="text-center pb-4">
            <p className="text-sm text-muted-foreground">{t('copyright')}</p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  )
}
