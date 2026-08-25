'use client'

import { useState } from 'react'
import { Shield, X, ExternalLink, Award, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const ATTESTATION_URL = '/attestation-entreprise.pdf'
const ATTESTATION_SUPABASE_URL = 'https://rohatzmiqhczybfbgjhj.supabase.co/storage/v1/object/public/media/legal/attestation-creation-entreprise.pdf'

interface LegalBadgeProps {
  variant?: 'full' | 'compact' | 'footer'
  className?: string
}

export function LegalBadge({ variant = 'compact', className }: LegalBadgeProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'footer') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'flex items-center gap-1.5 text-xs text-white/50 hover:text-white/80 transition-colors group',
            className
          )}
        >
          <Shield size={12} className="text-esrc-gold-400 group-hover:text-esrc-gold-300" />
          <span>Legally registered · CFCE Yaoundé · Jan 2026</span>
        </button>
        {open && <AttestationModal onClose={() => setOpen(false)} />}
      </>
    )
  }

  if (variant === 'compact') {
    return (
      <>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-esrc-gold-400/40 bg-esrc-gold-400/10 hover:bg-esrc-gold-400/20 transition-colors group',
            className
          )}
        >
          <Shield size={14} className="text-esrc-gold-600 dark:text-esrc-gold-400" />
          <span className="text-xs font-medium text-esrc-gold-700 dark:text-esrc-gold-400">
            Legally Registered Enterprise
          </span>
          <ExternalLink size={11} className="text-esrc-gold-500 opacity-60 group-hover:opacity-100" />
        </button>
        {open && <AttestationModal onClose={() => setOpen(false)} />}
      </>
    )
  }

  // full variant — used in About page section
  return (
    <>
      <div className={cn('rounded-2xl border border-esrc-gold-400/30 bg-esrc-gold-400/5 p-8', className)}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Icon */}
          <div className="shrink-0 w-16 h-16 rounded-2xl bg-esrc-gold-400/20 flex items-center justify-center">
            <Shield size={32} className="text-esrc-gold-600 dark:text-esrc-gold-400" />
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display text-lg font-bold text-foreground">
                Officially Registered Enterprise
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-full bg-esrc-gold-400/20 text-esrc-gold-700 dark:text-esrc-gold-400">
                Verified
              </span>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-1.5">
                <Building2 size={13} className="text-primary" />
                <span><strong className="text-foreground">NEXTGEN ENTREPRENEURSHIP DEVELOPMENT LTD</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <Award size={13} className="text-primary" />
                <span>Registered: <strong className="text-foreground">CM-NSI-01-2026-B12-00001</strong> · 02 January 2026</span>
              </p>
              <p className="text-xs">
                NIU: M012618290427F · Capital: 975,000 FCFA · CFCE Yaoundé, Cameroon
              </p>
            </div>
          </div>

          {/* View button */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-esrc-gold-500 hover:bg-esrc-gold-400 text-esrc-dark font-semibold text-sm transition-colors"
          >
            <Shield size={15} />
            View Certificate
          </button>
        </div>
      </div>
      {open && <AttestationModal onClose={() => setOpen(false)} />}
    </>
  )
}

function AttestationModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-background rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-esrc-gold-400/20 flex items-center justify-center">
              <Shield size={16} className="text-esrc-gold-600 dark:text-esrc-gold-400" />
            </div>
            <div>
              <p className="font-semibold text-sm text-foreground">Attestation de Création d&apos;Entreprise</p>
              <p className="text-xs text-muted-foreground">CFCE Yaoundé · N°2026/0892 · 03 January 2026</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={ATTESTATION_SUPABASE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-primary hover:underline px-3 py-1.5 rounded-lg hover:bg-accent transition-colors"
            >
              <ExternalLink size={12} />
              Open in new tab
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* PDF viewer */}
        <div className="flex-1 overflow-hidden bg-muted min-h-[500px]">
          <iframe
            src={`${ATTESTATION_URL}#toolbar=1&navpanes=0`}
            className="w-full h-full min-h-[500px]"
            style={{ border: 'none' }}
            title="Attestation de Création d'Entreprise - NextGen"
          />
        </div>

        {/* Footer bar */}
        <div className="px-5 py-3 border-t border-border bg-card shrink-0 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Issued by the Small and Medium-Sized Enterprises Promotion Agency (APME), Cameroon
          </p>
          <span className="text-xs font-medium text-esrc-gold-600 dark:text-esrc-gold-400 flex items-center gap-1">
            <Shield size={11} /> Official Document
          </span>
        </div>
      </div>
    </div>
  )
}
