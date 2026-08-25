'use client'

import { Link } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher'
import { LegalBadge } from '@/components/shared/LegalBadge'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import { SOCIAL_LINKS } from '@/lib/constants'

export function Footer() {
  const t = useTranslations('footer')
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-esrc-dark text-white [&_a]:!text-white/70 [&_a:hover]:!text-white">
      {/* Main Footer */}
      <div className="section-padding border-b border-white/20">
        <div className="container-width">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            {/* About */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/logo.png"
                  alt="NextGen"
                  width={40}
                  height={40}
                  className="object-contain"
                />
                <span className="font-display font-bold text-lg">{t('brandName')}</span>
              </div>
              <p className="text-sm text-white/70 mb-4">
                {t('tagline')}
              </p>
              <div className="flex gap-3">
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-esrc-green-500 rounded-full flex items-center justify-center transition-colors" aria-label="Facebook">
                  <Facebook size={16} />
                </a>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-esrc-green-500 rounded-full flex items-center justify-center transition-colors" aria-label="Twitter">
                  <Twitter size={16} />
                </a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-esrc-green-500 rounded-full flex items-center justify-center transition-colors" aria-label="LinkedIn">
                  <Linkedin size={16} />
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-white/10 hover:bg-esrc-green-500 rounded-full flex items-center justify-center transition-colors" aria-label="Instagram">
                  <Instagram size={16} />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold font-display text-base mb-4">{t('platform')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/courses" className="text-white/70 hover:text-white transition-colors">{t('links.courses')}</Link></li>
                <li><Link href="/research" className="text-white/70 hover:text-white transition-colors">{t('links.research')}</Link></li>
                <li><Link href="/events" className="text-white/70 hover:text-white transition-colors">{t('links.events')}</Link></li>
                <li><Link href="/advisory" className="text-white/70 hover:text-white transition-colors">{t('links.advisory')}</Link></li>
                <li><Link href="/community" className="text-white/70 hover:text-white transition-colors">{t('links.community')}</Link></li>
              </ul>
            </div>

            {/* Organization */}
            <div>
              <h4 className="font-semibold font-display text-base mb-4">{t('organization')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-white/70 hover:text-white transition-colors">{t('links.about')}</Link></li>
                <li><Link href="/partners" className="text-white/70 hover:text-white transition-colors">{t('links.partners')}</Link></li>
                <li><Link href="/impact" className="text-white/70 hover:text-white transition-colors">{t('links.impact')}</Link></li>
                <li><Link href="/blog" className="text-white/70 hover:text-white transition-colors">{t('links.blog')}</Link></li>
                <li><Link href="/contact" className="text-white/70 hover:text-white transition-colors">{t('links.contact')}</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold font-display text-base mb-4">{t('support')}</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/faq" className="text-white/70 hover:text-white transition-colors">{t('links.faq')}</Link></li>
                <li><Link href="/help" className="text-white/70 hover:text-white transition-colors">{t('links.helpCenter')}</Link></li>
                <li><Link href="/pricing" className="text-white/70 hover:text-white transition-colors">{t('links.pricing')}</Link></li>
                <li><Link href="/privacy" className="text-white/70 hover:text-white transition-colors">{t('links.privacy')}</Link></li>
                <li><Link href="/terms" className="text-white/70 hover:text-white transition-colors">{t('links.terms')}</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold font-display text-base mb-4">{t('getInTouch')}</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Phone size={16} className="mt-0.5 flex-shrink-0 text-esrc-gold-500" />
                  <a href="tel:+237677948904" className="text-white/70 hover:text-white transition-colors">+237 677 948 904 / 677 775 535</a>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={16} className="mt-0.5 flex-shrink-0 text-esrc-gold-500" />
                  <a href="mailto:info@esrccameroon.org" className="text-white/70 hover:text-white transition-colors">info@esrccameroon.org</a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={16} className="mt-0.5 flex-shrink-0 text-esrc-gold-500" />
                  <span className="text-white/70">UP-Station Bamenda; Opposite Tradex Nomayous, Yaoundé, Cameroon</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="py-6 px-4 md:px-8 lg:px-12">
        <div className="container-width">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/60">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
              <p>{t('copyright', { year: currentYear })}{t('rights')}</p>
              <span className="hidden sm:inline text-white/40">|</span>
              <p className="text-esrc-gold-500 font-medium">{t('builtForAfrica')}</p>
            </div>
            <div className="flex items-center gap-4">
              <LegalBadge variant="footer" />
              <Link href="/privacy" className="hover:text-white transition-colors">{t('links.privacy')}</Link>
              <Link href="/terms" className="hover:text-white transition-colors">{t('links.terms')}</Link>
              <LanguageSwitcher variant="pill" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
