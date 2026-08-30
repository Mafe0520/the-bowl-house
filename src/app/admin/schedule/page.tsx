'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { DeliveryDate, DeliverySlot } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, X } from 'lucide-react'
import { formatTime } from '@/lib/delivery-capacity'

const DAY_LABELS: Record<string, string> = {
  sunday: 'Domingo', monday: 'Lunes', tuesday: 'Martes',
  wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado',
}

export default function AdminSchedulePage() {
  const [dates, setDates] = useState<DeliveryDate[]>([])
  const [showNew, setShowNew] = useState(false)
  const [newDate, setNewDate] = useState({ date: '', day_of_week: 'sunday' as 'sunday' | 'wednesday', cutoff: '' })
  const [slots, setSlots] = useState<Record<string, DeliverySlot[]>>({})
  const [capacityView, setCapacidadView] = useState<string | null>(null)
  const [capacityData, setCapacidadData] = useState<{ slot: DeliverySlot; zones: Record<string, number>; rule: string; current: number; capacity: number }[]>([])

  const load = useCallback(async () => {
    const res = await fetch('/api/admin/dates')
    const datesData: DeliveryDate[] = await res.json()
    setDates(datesData)

    const allSlots: Record<string, DeliverySlot[]> = {}
    for (const d of datesData) {
      const sRes = await fetch(`/api/admin/slots?date_id=${d.id}`)
      const sData: DeliverySlot[] = await sRes.json()
      allSlots[d.id] = sData
    }
    setSlots(allSlots)
  }, [])

  useEffect(() => { load() }, [load])

  async function createDate() {
    if (!newDate.date || !newDate.day_of_week) return
    await fetch('/api/admin/dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: newDate.date,
        day_of_week: newDate.day_of_week,
        is_active: true,
        accepting_orders: true,
        cutoff_datetime: newDate.cutoff || null,
      }),
    })
    setShowNew(false)
    load()
  }

  async function toggleDate(date: DeliveryDate, field: 'is_active' | 'accepting_orders') {
    await fetch('/api/admin/dates', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: date.id, [field]: !date[field] }),
    })
    load()
  }

  async function deleteDate(id: string) {
    if (!confirm('Delete this delivery date?')) return
    await fetch('/api/admin/dates', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    load()
  }

  async function addSlot(dateId: string) {
    const existing = slots[dateId] || []
    await fetch('/api/admin/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        delivery_date_id: dateId,
        start_time: '14:00',
        end_time: '15:00',
        is_active: true,
        display_order: existing.length,
      }),
    })
    load()
  }

  async function removeSlot(slotId: string) {
    await fetch('/api/admin/slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slotId }),
    })
    load()
  }

  async function toggleSlot(slotId: string, field: 'is_active' | 'is_manually_closed', current: boolean) {
    await fetch('/api/admin/slots', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: slotId, [field]: !current }),
    })
    load()
  }

  async function loadCapacidad(dateId: string) {
    setCapacidadView(dateId)
    const dateSlots = slots[dateId] || []

    const settingsRes = await fetch('/api/admin/settings')
    const s = await settingsRes.json()
    const sameZone = parseInt(s.same_zone_capacity || '7')
    const twoZones = parseInt(s.two_zone_capacity || '5')
    const threePlus = parseInt(s.three_plus_zone_capacity || '4')

    const ordersRes = await fetch(`/api/orders?date_id=${dateId}`)
    const orders = await ordersRes.json()

    const result = dateSlots.map(slot => {
      const slotOrders = orders.filter((o: { delivery_slot_id: string; order_status: string }) =>
        o.delivery_slot_id === slot.id && o.order_status !== 'cancelled'
      )
      const zoneCount: Record<string, number> = {}
      for (const o of slotOrders) {
        const key = o.zone_name || o.delivery_zone_id || 'Unknown'
        zoneCount[key] = (zoneCount[key] || 0) + 1
      }
      const uniqueZones = Object.keys(zoneCount).length
      const capacity = uniqueZones <= 1 ? sameZone : uniqueZones === 2 ? twoZones : threePlus
      const rule = uniqueZones <= 1 ? 'Same zone' : uniqueZones === 2 ? '2 zones' : '3+ zones'
      return { slot, zones: zoneCount, rule, current: slotOrders.length, capacity }
    })
    setCapacidadData(result)
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 className="font-display font-bold" style={{ fontSize: 24, color: 'var(--chocolate)' }}>Fechas de entrega</h1>
        <button onClick={() => setShowNew(true)} className="font-body font-bold"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 20, fontSize: 13, background: 'var(--rose)', color: 'white', border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>
          <Plus size={15} /> Agregar fecha
        </button>
      </div>

      {showNew && (
        <Card className="animate-pop-in" style={{ marginBottom: 16 }}>
          <h2 className="font-display font-semibold" style={{ color: 'var(--chocolate)', marginBottom: 12 }}>Nueva fecha de entrega</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Input label="Fecha" type="date" value={newDate.date} onChange={e => setNewDate(p => ({ ...p, date: e.target.value }))} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label className="font-body font-semibold" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Día</label>
              <select value={newDate.day_of_week} onChange={e => setNewDate(p => ({ ...p, day_of_week: e.target.value as 'sunday' | 'wednesday' }))}
                style={{ borderRadius: 16, padding: '10px 16px', outline: 'none', background: 'var(--card)', border: '2px solid var(--border)', color: 'var(--text-primary)', fontFamily: 'Nunito, sans-serif', fontSize: 15 }}>
                <option value="sunday">Domingo</option>
                <option value="wednesday">Miércoles</option>
              </select>
            </div>
            <Input label="Corte de pedidos (opcional)" type="datetime-local" value={newDate.cutoff} onChange={e => setNewDate(p => ({ ...p, cutoff: e.target.value }))} />
            <div style={{ display: 'flex', gap: 8 }}>
              <Button onClick={createDate}>Crear</Button>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {dates.map(date => {
          const label = new Date(date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'long', day: 'numeric', month: 'long' })
          const dateSlots = slots[date.id] || []
          return (
            <Card key={date.id}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h2 className="font-display font-bold" style={{ fontSize: 18, color: 'var(--chocolate)' }}>{label}</h2>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap' }}>
                    <Badge variant={date.is_active ? 'green' : 'gray'}>{date.is_active ? 'Activo' : 'Inactivo'}</Badge>
                    <Badge variant={date.accepting_orders ? 'rose' : 'gray'}>{date.accepting_orders ? 'Abierto' : 'Cerrado'}</Badge>
                    <Badge variant="caramel">{DAY_LABELS[date.day_of_week] || date.day_of_week}</Badge>
                  </div>
                  {date.cutoff_datetime && (
                    <p style={{ fontSize: 11, marginTop: 4, color: 'var(--text-secondary)' }}>
                      Corte: {new Date(date.cutoff_datetime).toLocaleString()}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => toggleDate(date, 'accepting_orders')} className="font-body font-semibold" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--bg)', color: date.accepting_orders ? '#991B1B' : '#065F46', border: '1px solid var(--border)' }}>
                    {date.accepting_orders ? 'Cerrar' : 'Abrir'}
                  </button>
                  <button onClick={() => deleteDate(date.id)} style={{ color: '#DC2626' }}><X size={16} /></button>
                </div>
              </div>

              {/* Time slots */}
              <div style={{ marginBottom: 12 }}>
                <p className="font-body font-bold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 8 }}>Horarios</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {dateSlots.map(slot => (
                    <div key={slot.id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="font-body font-semibold" style={{ fontSize: 13, padding: '5px 12px', borderRadius: 16, background: 'var(--rose-light)', color: 'var(--rose-dark)' }}>
                        {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                      </span>
                      {slot.is_manually_closed && <Badge variant="red">Cerrado manualmente</Badge>}
                      <button onClick={() => toggleSlot(slot.id, 'is_manually_closed', slot.is_manually_closed)} className="font-body font-semibold" style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                        {slot.is_manually_closed ? 'Reabrir' : 'Cerrar'}
                      </button>
                      <button onClick={() => removeSlot(slot.id)} style={{ color: '#DC2626' }}><X size={14} /></button>
                    </div>
                  ))}
                </div>
                <button className="font-body font-semibold" style={{ fontSize: 12, marginTop: 8, color: 'var(--rose)' }} onClick={() => addSlot(date.id)}>
                  + Agregar horario
                </button>
              </div>

              {/* Capacidad view */}
              <button onClick={() => capacityView === date.id ? setCapacidadView(null) : loadCapacidad(date.id)}
                className="font-body font-bold"
                style={{ fontSize: 12, padding: '6px 14px', borderRadius: 16, background: 'var(--bg)', color: 'var(--caramel)', border: '1px solid var(--border)' }}>
                {capacityView === date.id ? 'Ocultar' : 'Ver'} capacidad
              </button>

              {capacityView === date.id && (
                <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {capacityData.map((row, i) => {
                    const pct = row.capacity > 0 ? row.current / row.capacity : 0
                    const isFull = row.current >= row.capacity
                    return (
                      <div key={i} style={{ borderRadius: 16, padding: 12, background: 'var(--bg)', border: '1.5px solid var(--border)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span className="font-display font-semibold">
                            {formatTime(row.slot.start_time)} – {formatTime(row.slot.end_time)}
                          </span>
                          <span className="font-body font-bold" style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: isFull ? '#FEE2E2' : '#D1FAE5', color: isFull ? '#991B1B' : '#065F46' }}>
                            {isFull ? 'FULL' : `${row.current} / ${row.capacity}`}
                          </span>
                        </div>
                        <p style={{ fontSize: 11, marginBottom: 4, color: 'var(--text-secondary)' }}>Regla: {row.rule}</p>
                        {Object.entries(row.zones).map(([zone, count]) => (
                          <p key={zone} style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                            {zone}: {count as number} pedidos
                          </p>
                        ))}
                        <div style={{ marginTop: 8, height: 6, borderRadius: 3, overflow: 'hidden', background: 'var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 3, width: `${Math.min(100, pct * 100)}%`, background: isFull ? '#DC2626' : 'var(--rose)' }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
