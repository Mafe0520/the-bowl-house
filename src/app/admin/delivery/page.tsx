'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Plus, Pencil, X, Trash2 } from 'lucide-react'
import type { MockZone } from '@/lib/data/mock-store'

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<MockZone[]>([])
  const [editingZone, setEditingZone] = useState<Partial<MockZone> | null>(null)
  const [newCity, setNewCity] = useState('')
  const [newState, setNewState] = useState('NJ')
  const [newZip, setNewZip] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/zones')
    const data: MockZone[] = await res.json()
    setZones(data.sort((a, b) => a.name.localeCompare(b.name)))
  }, [])

  useEffect(() => { load() }, [load])

  async function saveZone() {
    if (!editingZone?.name) return
    setSaving(true)
    const method = editingZone.id ? 'PATCH' : 'POST'
    await fetch('/api/admin/zones', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingZone),
    })
    setSaving(false)
    setEditingZone(null)
    load()
  }

  async function addCity(zoneId: string) {
    if (!newCity) return
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    const newCities = [...zone.delivery_zone_cities, { id: `city-${Date.now()}`, zone_id: zoneId, city: newCity, state: newState }]
    await fetch('/api/admin/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zoneId, delivery_zone_cities: newCities }),
    })
    setNewCity('')
    load()
  }

  async function removeCity(zoneId: string, cityId: string) {
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    const newCities = zone.delivery_zone_cities.filter(c => c.id !== cityId)
    await fetch('/api/admin/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zoneId, delivery_zone_cities: newCities }),
    })
    load()
  }

  async function addZip(zoneId: string) {
    if (!newZip) return
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    const newZips = [...zone.delivery_zone_zip_codes, { id: `zip-${Date.now()}`, zone_id: zoneId, zip_code: newZip }]
    await fetch('/api/admin/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zoneId, delivery_zone_zip_codes: newZips }),
    })
    setNewZip('')
    load()
  }

  async function removeZip(zoneId: string, zipId: string) {
    const zone = zones.find(z => z.id === zoneId)
    if (!zone) return
    const newZips = zone.delivery_zone_zip_codes.filter(z => z.id !== zipId)
    await fetch('/api/admin/zones', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: zoneId, delivery_zone_zip_codes: newZips }),
    })
    load()
  }

  async function deleteZone(id: string) {
    if (!confirm('Delete this zone and all its cities/ZIP codes?')) return
    await fetch('/api/admin/zones', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="font-display font-bold" style={{ fontSize: 24, color: 'var(--chocolate)' }}>Zonas de entrega</h1>
        <button onClick={() => setEditingZone({ name: '', is_active: true, delivery_zone_cities: [], delivery_zone_zip_codes: [] })}
          className="font-body font-bold"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 20, fontSize: 13, background: 'var(--rose)', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Plus size={15} /> Agregar zona
        </button>
      </div>

      {editingZone && !editingZone.id && (
        <Card className="animate-pop-in" style={{ marginBottom: 16 }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--chocolate)', marginBottom: 12 }}>Nueva zona</h2>
          <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
            <Input label="Nombre de zona (interno)" value={editingZone.name || ''} onChange={e => setEditingZone(p => ({ ...p, name: e.target.value }))} />
            <Button size="sm" loading={saving} onClick={saveZone}>Guardar</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingZone(null)}>Cancelar</Button>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {zones.map(zone => (
          <Card key={zone.id}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h2 className="font-display font-bold" style={{ fontSize: 18, color: 'var(--chocolate)' }}>{zone.name}</h2>
                <span className="font-body font-bold" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: zone.is_active ? '#D1FAE5' : '#FEE2E2', color: zone.is_active ? '#065F46' : '#991B1B' }}>
                  {zone.is_active ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => setEditingZone(zone)} style={{ color: 'var(--rose)' }}><Pencil size={16} /></button>
                <button onClick={() => deleteZone(zone.id)} style={{ color: '#DC2626' }}><Trash2 size={16} /></button>
              </div>
            </div>

            {/* Cities */}
            <div style={{ marginBottom: 12 }}>
              <p className="font-body font-bold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>Ciudades</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {zone.delivery_zone_cities.map(c => (
                  <span key={c.id} className="font-body font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 16, fontSize: 13, background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--caramel)' }}>
                    {c.city}, {c.state}
                    <button onClick={() => removeCity(zone.id, c.id)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              {editingZone?.id === zone.id ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input value={newCity} onChange={e => setNewCity(e.target.value)} placeholder="Nombre de ciudad" />
                  <Input value={newState} onChange={e => setNewState(e.target.value)} placeholder="Estado" style={{ maxWidth: 70 }} />
                  <Button size="sm" onClick={() => addCity(zone.id)}>Agregar</Button>
                </div>
              ) : (
                <button className="font-body font-semibold" style={{ fontSize: 12, color: 'var(--rose)' }} onClick={() => setEditingZone(zone)}>
                  + Agregar ciudad
                </button>
              )}
            </div>

            {/* ZIP codes */}
            <div>
              <p className="font-body font-bold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>Códigos postales</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 8 }}>
                {zone.delivery_zone_zip_codes.map(z => (
                  <span key={z.id} className="font-body font-semibold" style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 16, fontSize: 13, background: 'var(--rose-light)', color: 'var(--rose-dark)' }}>
                    {z.zip_code}
                    <button onClick={() => removeZip(zone.id, z.id)}><X size={12} /></button>
                  </span>
                ))}
              </div>
              {editingZone?.id === zone.id && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Input value={newZip} onChange={e => setNewZip(e.target.value)} placeholder="Código postal" style={{ maxWidth: 140 }} />
                  <Button size="sm" onClick={() => addZip(zone.id)}>Agregar</Button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
