import { useTranslations } from 'next-intl'
import { AIHubInteractive } from './interactive'

export default function AIHubPage() {
  const t = useTranslations('ai.hub')
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold font-playfair text-foreground">{t('title')}</h1>
              <p className="text-muted-foreground text-sm">{t('subtitle')}</p>
            </div>
          </div>
        </div>
        <AIHubInteractive />
      </div>
    </div>
  )
}
