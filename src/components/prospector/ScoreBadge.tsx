import type { ScoreCategory } from '@/lib/prospector/types'

const CONFIG: Record<ScoreCategory, { emoji: string; label: string; bg: string; text: string; border: string }> = {
  excellent: { emoji: '🔥', label: 'Excelente', bg: 'var(--rose-light)',    text: 'var(--rose-dark)',    border: 'var(--rose)' },
  good:      { emoji: '🟢', label: 'Bueno',     bg: '#d1fae5',              text: '#065f46',             border: '#34d399' },
  possible:  { emoji: '🟠', label: 'Posible',   bg: '#fef3c7',              text: '#92400e',             border: '#fbbf24' },
  low:       { emoji: '⚪', label: 'Bajo',       bg: 'var(--bg)',            text: 'var(--text-secondary)',border: 'var(--border)' },
}

interface Props {
  score:    number
  category: ScoreCategory
  size?:    'sm' | 'md'
}

export default function ScoreBadge({ score, category, size = 'md' }: Props) {
  const c       = CONFIG[category]
  const numSize = size === 'md' ? '26px' : '18px'
  const pad     = size === 'md' ? '8px 12px' : '4px 8px'

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '8px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '10px', padding: pad, flexShrink: 0,
    }}>
      <span style={{ fontFamily: 'var(--font-display, Fredoka)', fontSize: numSize, fontWeight: 700, color: c.text, lineHeight: 1 }}>
        {score}
      </span>
      <div>
        <div style={{ fontSize: '14px', lineHeight: 1 }}>{c.emoji}</div>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.text, marginTop: '1px' }}>
          {c.label}
        </div>
      </div>
    </div>
  )
}
