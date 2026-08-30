'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const SETTINGS_CONFIG = [
  { key: 'delivery_fee', label: 'Costo de envío ($)', type: 'number', group: 'Entrega' },
  { key: 'delivery_enabled', label: 'Entrega a domicilio activada', type: 'boolean', group: 'Entrega' },
  { key: 'pickup_enabled', label: 'Recogida activada', type: 'boolean', group: 'Entrega' },
  { key: 'same_zone_capacity', label: 'Capacidad — misma zona', type: 'number', group: 'Capacidad' },
  { key: 'two_zone_capacity', label: 'Capacidad — 2 zonas', type: 'number', group: 'Capacidad' },
  { key: 'three_plus_zone_capacity', label: 'Capacidad — 3+ zonas', type: 'number', group: 'Capacidad' },
  { key: 'zelle_recipient_name', label: 'Nombre del destinatario Zelle', type: 'text', group: 'Zelle' },
  { key: 'zelle_phone_email', label: 'Teléfono / Email Zelle', type: 'text', group: 'Zelle' },
  { key: 'zelle_payment_url', label: 'URL de pago Zelle (opcional)', type: 'text', group: 'Zelle' },
  { key: 'slot_reservation_minutes', label: 'Reserva de horario (minutos)', type: 'number', group: 'Avanzado' },
  { key: 'pickup_capacity', label: 'Capacidad de recogida por horario', type: 'number', group: 'Avanzado' },
]

const GROUPS = ['Entrega', 'Capacidad', 'Zelle', 'Avanzado']

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/settings')
    const data: Record<string, string> = await res.json()
    setValues(data)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="font-display text-3xl font-bold" style={{ color: 'var(--chocolate)' }}>Configuración</h1>
        <button onClick={save} disabled={saving} className="font-body font-bold"
          style={{ padding: '9px 18px', borderRadius: 20, fontSize: 13, background: saved ? '#16A34A' : 'var(--rose)', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', opacity: saving ? 0.7 : 1 }}>
          {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GROUPS.map(group => {
          const items = SETTINGS_CONFIG.filter(s => s.group === group)
          return (
            <Card key={group}>
              <h2 className="font-display font-semibold" style={{ color: 'var(--chocolate)', fontSize: 17, marginBottom: 12 }}>{group}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {items.map(setting => (
                  <div key={setting.key}>
                    {setting.type === 'boolean' ? (
                      <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                        <div
                          style={{ position: 'relative', width: 48, height: 24, borderRadius: 12, background: values[setting.key] === 'true' ? 'var(--rose)' : 'var(--border)', transition: 'background 0.2s', flexShrink: 0 }}
                          onClick={() => setValues(v => ({ ...v, [setting.key]: v[setting.key] === 'true' ? 'false' : 'true' }))}
                        >
                          <div
                            style={{ position: 'absolute', top: 4, width: 16, height: 16, borderRadius: 8, background: 'white', transition: 'left 0.2s', left: values[setting.key] === 'true' ? 28 : 4 }}
                          />
                        </div>
                        <span className="font-semibold" style={{ color: 'var(--chocolate)' }}>{setting.label}</span>
                      </label>
                    ) : (
                      <Input
                        label={setting.label}
                        type={setting.type === 'number' ? 'number' : 'text'}
                        value={values[setting.key] || ''}
                        onChange={e => setValues(v => ({ ...v, [setting.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
