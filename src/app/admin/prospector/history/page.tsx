import { createServiceClient } from '@/lib/supabase/server'
import type { ScanRun } from '@/lib/prospector/types'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const subnav = [
  { href: '/admin/prospector/opportunities', label: 'Oportunidades' },
  { href: '/admin/prospector/leads',         label: 'Leads entrantes' },
  { href: '/admin/prospector/sources',       label: 'Fuentes' },
  { href: '/admin/prospector/history',       label: 'Historial' },
]

export default async function HistoryPage() {
  const db = await createServiceClient()
  const { data } = await db
    .from('prospector_scan_runs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(50)

  const runs = (data ?? []) as ScanRun[]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>🔭 Prospector</h1>
      <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {subnav.map(n => (
          <Link key={n.href} href={n.href}
            style={{ fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: n.href.includes('history') ? 'var(--rose-light)' : 'var(--bg)', color: n.href.includes('history') ? 'var(--rose-dark)' : 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}>
            {n.label}
          </Link>
        ))}
      </nav>

      {runs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Aún no hay escaneos. Usa el botón <strong>🔍 Escanear</strong> en la página de Oportunidades.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {runs.map(run => {
            const started  = new Date(run.started_at)
            const finished = run.completed_at ? new Date(run.completed_at) : null
            const duration = finished ? Math.round((finished.getTime() - started.getTime()) / 1000) : null
            return (
              <div key={run.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                  {started.toLocaleString('es', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                  <span>🔍 {run.queries_generated ?? 0} consultas</span>
                  <span>📄 {run.results_fetched ?? 0} resultados</span>
                  <span>🗑 {run.pre_filtered_out ?? 0} filtrados</span>
                  <span>✅ {run.saved_count ?? 0} guardados</span>
                  {duration != null && <span>⏱ {duration}s</span>}
                  {!finished && <span style={{ color: 'var(--rose)' }}>⏳ En progreso</span>}
                  {run.error && <span style={{ color: 'var(--rose-dark)' }}>⚠️ {run.error}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
