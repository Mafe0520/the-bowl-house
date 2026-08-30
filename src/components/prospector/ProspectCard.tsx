'use client'
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import ScoreBadge from './ScoreBadge'
import StatusSelect from './StatusSelect'
import ApproachModal from './ApproachModal'
import type { Prospect } from '@/lib/prospector/types'
import { INTENTION_LABELS, BUSINESS_TYPE_LABELS, WEBSITE_STATUS_LABELS, PAIN_TYPE_LABELS } from '@/lib/prospector/types'

function Pill({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{
      fontSize: '11px', fontWeight: 600, borderRadius: '6px', padding: '2px 7px',
      background: accent ? 'var(--rose-light)' : 'var(--bg)',
      color: accent ? 'var(--rose-dark)' : 'var(--text-secondary)',
      border: '1px solid var(--border)',
    }}>{children}</span>
  )
}

function FieldRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '8px', fontSize: '13px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', paddingTop: '2px' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  )
}

const DOMAIN_LABELS: Record<string, string> = {
  'linkedin.com': '💼 LinkedIn', 'reddit.com': '🔴 Reddit',
  'upwork.com': '💰 Upwork', 'youtube.com': '▶️ YouTube', 'quora.com': '❓ Quora',
}

export default function ProspectCard({ prospect: initial }: { prospect: Prospect }) {
  const [prospect, setProspect] = useState(initial)
  const [showModal, setShowModal] = useState(false)
  const [expanded,  setExpanded]  = useState(false)

  const isLow = prospect.score < 50 && !expanded

  if (!prospect.analyzed && !expanded) {
    return (
      <div onClick={() => setExpanded(true)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: 0.65 }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          ⏳ Sin analizar — {prospect.title || prospect.snippet || 'Sin título'}
        </span>
        {prospect.source_domain && <Pill>{prospect.source_domain}</Pill>}
      </div>
    )
  }

  if (isLow) {
    return (
      <div onClick={() => setExpanded(true)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', opacity: 0.6 }}>
        <ScoreBadge score={prospect.score} category={prospect.score_category} size="sm" />
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {prospect.title || prospect.snippet || 'Sin título'}
        </span>
        {prospect.source_domain && <Pill>{DOMAIN_LABELS[prospect.source_domain] ?? prospect.source_domain}</Pill>}
      </div>
    )
  }

  const borderColor = prospect.score_category === 'excellent' ? 'var(--rose)' : prospect.score_category === 'good' ? '#34d399' : 'var(--border)'

  return (
    <>
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${borderColor}` }}>
        {/* Top */}
        <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
          <ScoreBadge score={prospect.score} category={prospect.score_category} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {prospect.business_name || prospect.author_name || 'Negocio no identificado'}
            </div>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '5px' }}>
              {prospect.country && <Pill>{prospect.country}</Pill>}
              {prospect.source_domain && <Pill accent>{DOMAIN_LABELS[prospect.source_domain] ?? prospect.source_domain}</Pill>}
              {prospect.language && <Pill>{prospect.language === 'es' ? '🇪🇸 ES' : '🇺🇸 EN'}</Pill>}
              {prospect.business_type && <Pill>{BUSINESS_TYPE_LABELS[prospect.business_type]}</Pill>}
              {prospect.published_date && <Pill>{new Date(prospect.published_date).toLocaleDateString('es', { month: 'short', day: 'numeric', year: 'numeric' })}</Pill>}
            </div>
          </div>
          <StatusSelect id={prospect.id} value={prospect.status} type="prospect" onSave={v => setProspect(p => ({ ...p, status: v as any }))} />
        </div>

        {/* Snippet */}
        {prospect.snippet && (
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', fontSize: '13.5px', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.65 }}>
            "{prospect.snippet}"
          </div>
        )}

        {/* Fields */}
        <div style={{ padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
          <FieldRow label="Problema" value={prospect.pain_detected || (prospect.pain_type ? PAIN_TYPE_LABELS[prospect.pain_type] : null)} />
          <FieldRow label="Intención" value={prospect.intention_level ? INTENTION_LABELS[prospect.intention_level] : null} />
          <FieldRow label="Usa actualmente" value={prospect.current_system?.length ? prospect.current_system.join(' · ') : null} />
          <FieldRow label="Website" value={prospect.website_status && prospect.website_status !== 'unknown' ? WEBSITE_STATUS_LABELS[prospect.website_status] : null} />
          <FieldRow label="Contacto" value={
            prospect.author_url
              ? <a href={prospect.author_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--rose)', textDecoration: 'none', fontWeight: 600 }}>Ver perfil →</a>
              : `${prospect.contactability === 'high' ? '🟢' : prospect.contactability === 'medium' ? '🟠' : '🔴'} ${prospect.contactability}`
          } />
          {prospect.solution_suggestion && (
            <div style={{ marginTop: '8px', fontSize: '13px', color: 'var(--rose-dark)', background: 'var(--rose-light)', border: '1px solid var(--rose)', borderRadius: '8px', padding: '8px 12px' }}>
              💡 {prospect.solution_suggestion}
            </div>
          )}
          {prospect.insufficient_context && (
            <div style={{ marginTop: '6px', fontSize: '12px', color: '#92400e', background: '#fef3c7', borderRadius: '6px', padding: '5px 10px' }}>
              ⚠️ Contexto insuficiente — análisis poco confiable.
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '10px 18px', display: 'flex', gap: '8px' }}>
          <button onClick={() => window.open(prospect.source_url, '_blank')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, padding: '7px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <ExternalLink size={13} /> Ver publicación
          </button>
          <button onClick={() => setShowModal(true)}
            style={{ fontSize: '13px', fontWeight: 700, padding: '7px 14px', borderRadius: '8px', border: 'none', background: 'var(--rose)', color: '#fff', cursor: 'pointer' }}>
            ✨ Generar acercamiento
          </button>
        </div>
      </div>

      {showModal && <ApproachModal prospect={prospect} onClose={() => setShowModal(false)} />}
    </>
  )
}
