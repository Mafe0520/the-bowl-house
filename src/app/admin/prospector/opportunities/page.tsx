import { createServiceClient } from '@/lib/supabase/server'
import type { Prospect } from '@/lib/prospector/types'
import ProspectorNav from '@/components/prospector/ProspectorNav'
import ProspectCard  from '@/components/prospector/ProspectCard'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OpportunitiesPage() {
  const db = await createServiceClient()
  const { data } = await db
    .from('prospector_prospects')
    .select('*')
    .order('score', { ascending: false })

  const prospects = (data ?? []) as Prospect[]
  const total     = prospects.length
  const excellent = prospects.filter(p => p.score >= 85).length
  const good      = prospects.filter(p => p.score >= 70 && p.score < 85).length
  const pending   = prospects.filter(p => !p.analyzed).length

  const subnav = [
    { href: '/admin/prospector/opportunities', label: 'Oportunidades' },
    { href: '/admin/prospector/leads',         label: 'Leads entrantes' },
    { href: '/admin/prospector/sources',       label: 'Fuentes' },
    { href: '/admin/prospector/history',       label: 'Historial' },
  ]

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>🔭 Prospector</h1>
        <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {subnav.map(n => (
            <Link key={n.href} href={n.href}
              style={{ fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: n.href.includes('opportunities') ? 'var(--rose-light)' : 'var(--bg)', color: n.href.includes('opportunities') ? 'var(--rose-dark)' : 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}>
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {[
            { label: 'Total', value: total },
            { label: '🔥 Excelentes', value: excellent },
            { label: '🟢 Buenos',     value: good },
            { label: '⏳ Sin analizar', value: pending },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 16px', minWidth: '90px' }}>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{s.value}</div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <ProspectorNav />
      </div>

      {prospects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)' }}>
          <p style={{ marginBottom: '8px' }}>No hay oportunidades todavía.</p>
          <p style={{ fontSize: '13px' }}>Usa <strong>🔍 Escanear</strong> para buscar leads y luego <strong>🧠 Analizar</strong> para puntuarlos.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {prospects.map(p => <ProspectCard key={p.id} prospect={p} />)}
        </div>
      )}
    </div>
  )
}
