import { createServiceClient } from '@/lib/supabase/server'
import type { ContactLead } from '@/lib/prospector/types'
import StatusSelect from '@/components/prospector/StatusSelect'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const subnav = [
  { href: '/admin/prospector/opportunities', label: 'Oportunidades' },
  { href: '/admin/prospector/leads',         label: 'Leads entrantes' },
  { href: '/admin/prospector/sources',       label: 'Fuentes' },
  { href: '/admin/prospector/history',       label: 'Historial' },
]

export default async function LeadsPage() {
  const db = await createServiceClient()
  const { data } = await db
    .from('prospector_contact_leads')
    .select('*')
    .order('created_at', { ascending: false })

  const leads = (data ?? []) as ContactLead[]

  return (
    <div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px' }}>🔭 Prospector</h1>
      <nav style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {subnav.map(n => (
          <Link key={n.href} href={n.href}
            style={{ fontSize: '13px', fontWeight: 600, padding: '5px 12px', borderRadius: '8px', background: n.href.includes('leads') ? 'var(--rose-light)' : 'var(--bg)', color: n.href.includes('leads') ? 'var(--rose-dark)' : 'var(--text-secondary)', border: '1px solid var(--border)', textDecoration: 'none' }}>
            {n.label}
          </Link>
        ))}
      </nav>

      {leads.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
          Aún no hay leads. Cuando alguien llene el formulario de contacto, aparecerá aquí.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {leads.map(lead => (
            <div key={lead.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '17px', fontWeight: 700 }}>{lead.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {lead.business_name && `${lead.business_name} · `}
                    {new Date(lead.created_at).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
                <StatusSelect id={lead.id} value={lead.status} type="lead" />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {lead.what_sells        && <Row label="Vende"          value={lead.what_sells} />}
                {lead.current_methods?.length > 0  && <Row label="Método actual" value={lead.current_methods.join(', ')} />}
                {lead.wants_to_improve?.length > 0 && <Row label="Quiere mejorar" value={lead.wants_to_improve.join(', ')} />}
                {lead.phone && <Row label="Teléfono" value={lead.phone} />}
                {lead.email && <Row label="Email"    value={lead.email} />}
              </div>

              {lead.more_info && (
                <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)', background: 'var(--bg)', borderRadius: '8px', padding: '10px 14px', fontStyle: 'italic' }}>
                  "{lead.more_info}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '8px', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', paddingTop: '2px' }}>{label}</span>
      <span>{value}</span>
    </div>
  )
}
