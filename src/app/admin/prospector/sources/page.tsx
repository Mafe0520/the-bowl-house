import { createServiceClient } from '@/lib/supabase/server'
import type { ProspectorSource } from '@/lib/prospector/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const subnav = [
  { href: '/admin/prospector/opportunities', label: 'Oportunidades' },
  { href: '/admin/prospector/leads',         label: 'Leads entrantes' },
  { href: '/admin/prospector/sources',       label: 'Fuentes' },
  { href: '/admin/prospector/history',       label: 'Historial' },
]

export default async function SourcesPage() {
  const db = await createServiceClient()
  const { data } = await db.from('prospector_sources').select('*').order('source_bonus', { ascending: false })
  const sources = (data ?? []) as ProspectorSource[]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>🔭 Prospector</h1>
      <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {subnav.map(n => (
          <Link key={n.href} href={n.href}
            style={{ fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: n.href.includes('sources') ? 'var(--rose-light)' : 'var(--bg)', color: n.href.includes('sources') ? 'var(--rose-dark)' : 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}>
            {n.label}
          </Link>
        ))}
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
        {sources.map(s => (
          <div key={s.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', opacity: s.is_active ? 1 : 0.5 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{s.name}</span>
              <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '6px', background: s.source_bonus > 0 ? '#d1fae5' : s.source_bonus < 0 ? 'var(--rose-light)' : 'var(--bg)', color: s.source_bonus > 0 ? '#065f46' : s.source_bonus < 0 ? 'var(--rose-dark)' : 'var(--text-secondary)' }}>
                {s.source_bonus > 0 ? `+${s.source_bonus}` : s.source_bonus} pts
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{s.domain}</div>
            {s.site_filter && <code style={{ fontSize: '11px', background: 'var(--bg)', borderRadius: '4px', padding: '1px 5px', marginTop: '4px', display: 'inline-block' }}>{s.site_filter}</code>}
            {!s.is_active && <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px' }}>⏸ Inactiva</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
