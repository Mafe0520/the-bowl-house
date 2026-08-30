'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { DeliveryDate, DeliverySlot } from '@/types'
import { formatTime } from '@/lib/delivery-capacity'
import { ShoppingBag, Layers, DollarSign, Clock, Truck, AlertCircle } from 'lucide-react'

interface Stats {
  total_orders: number
  total_bowls: number
  revenue: number
  paid: number
  zelle_pending: number
  cash_pending: number
  delivery: number
  pickup: number
  delivered: number
  remaining: number
  collected: number
  still_to_collect: number
}

interface SlotCapacity {
  slot: DeliverySlot
  current: number
  capacity: number
  zones: string[]
}

export default function AdminDashboard() {
  const [accepting, setAccepting] = useState<boolean | null>(null)
  const [dates, setDates] = useState<DeliveryDate[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)
  const [slotCapacity, setSlotCapacity] = useState<SlotCapacity[]>([])
  const [toggling, setToggling] = useState(false)

  const loadSettings = useCallback(async () => {
    const res = await fetch('/api/admin/settings')
    const data = await res.json()
    setAccepting(data.accepting_orders === 'true')
  }, [])

  const loadDates = useCallback(async () => {
    const res = await fetch('/api/admin/dates')
    const data: DeliveryDate[] = await res.json()
    setDates(data)
    if (data.length > 0 && !selectedDate) setSelectedDate(data[0].id)
  }, [selectedDate])

  const loadStats = useCallback(async (dateId: string) => {
    const res = await fetch(`/api/admin/stats?date_id=${dateId}`)
    setStats(await res.json())
  }, [])

  const loadSlotCapacity = useCallback(async (dateId: string) => {
    const [slotsRes, settingsRes, ordersRes] = await Promise.all([
      fetch(`/api/admin/slots?date_id=${dateId}`),
      fetch('/api/admin/settings'),
      fetch(`/api/orders?date_id=${dateId}`),
    ])
    const slots: DeliverySlot[] = await slotsRes.json()
    const s = await settingsRes.json()
    const orders = await ordersRes.json()

    const sameZone = parseInt(s.same_zone_capacity || '7')
    const twoZones = parseInt(s.two_zone_capacity || '5')
    const threePlus = parseInt(s.three_plus_zone_capacity || '4')

    const result: SlotCapacity[] = slots.map(slot => {
      const slotOrders = orders.filter((o: { delivery_slot_id: string; order_status: string }) =>
        o.delivery_slot_id === slot.id && o.order_status !== 'cancelled'
      )
      const zoneSet = new Set<string>(slotOrders.map((o: { zone_name?: string }) => o.zone_name || 'Sin zona'))
      const uniqueZones = zoneSet.size
      const capacity = uniqueZones <= 1 ? sameZone : uniqueZones === 2 ? twoZones : threePlus
      return { slot, current: slotOrders.length, capacity, zones: Array.from(zoneSet) }
    })
    setSlotCapacity(result)
  }, [])

  useEffect(() => { loadSettings(); loadDates() }, [loadSettings, loadDates])
  useEffect(() => {
    if (selectedDate) { loadStats(selectedDate); loadSlotCapacity(selectedDate) }
  }, [selectedDate, loadStats, loadSlotCapacity])

  async function toggleAcceptingOrders() {
    setToggling(true)
    const newValue = !accepting
    await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accepting_orders: newValue ? 'true' : 'false' }),
    })
    setAccepting(newValue)
    setToggling(false)
  }

  const selectedDateObj = dates.find(d => d.id === selectedDate)
  const dateLabel = selectedDateObj
    ? new Date(selectedDateObj.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  return (
    <div>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="font-display font-bold" style={{ fontSize: 26, color: 'var(--chocolate)' }}>¡Hola, Admin! 👋</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>Todo se ve delicioso por aquí.</p>
      </div>

      {/* Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16,
        padding: '14px 16px', borderRadius: 20,
        background: 'var(--card)', border: '1.5px solid var(--border)',
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
          background: accepting ? '#DCFCE7' : '#FEE2E2',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: accepting ? '#16A34A' : '#DC2626' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p className="font-display font-bold" style={{ fontSize: 15, color: accepting ? '#15803D' : '#DC2626' }}>
            {accepting ? 'Pedidos abiertos' : 'Pedidos cerrados'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {accepting ? 'La tienda está abierta.' : 'Los clientes ven un mensaje de cierre.'}
          </p>
        </div>
        <button onClick={toggleAcceptingOrders} disabled={toggling}
          className="font-body font-bold"
          style={{
            flexShrink: 0, padding: '9px 20px', borderRadius: 20, fontSize: 13,
            background: accepting ? '#DC2626' : 'var(--rose)', color: 'white',
            border: 'none', cursor: 'pointer', opacity: toggling ? 0.7 : 1,
          }}>
          {accepting ? 'Cerrar' : 'Abrir'}
        </button>
      </div>

      {/* Date selector */}
      {dates.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflowX: 'auto', paddingBottom: 2 }}>
          {dates.map(date => {
            const label = new Date(date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'short', day: 'numeric', month: 'short' })
            const active = selectedDate === date.id
            return (
              <button key={date.id} onClick={() => setSelectedDate(date.id)}
                className="font-body font-semibold"
                style={{
                  flexShrink: 0, padding: '8px 18px', borderRadius: 20, fontSize: 13,
                  background: active ? 'var(--rose)' : 'var(--card)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${active ? 'var(--rose)' : 'var(--border)'}`,
                }}>
                {label}
              </button>
            )
          })}
        </div>
      )}

      {stats && (
        <>
          {dateLabel && (
            <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)', marginBottom: 14 }}>
              Resumen del día
            </p>
          )}

          {/* Stat grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 24 }}>
            <Link href="/admin/orders" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<ShoppingBag size={16} />} label="Pedidos" value={stats.total_orders} color="var(--rose)" />
            </Link>
            <Link href="/admin/prep" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<Layers size={16} />} label="Bowls" value={stats.total_bowls} color="var(--chocolate)" />
            </Link>
            <Link href="/admin/orders" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<DollarSign size={16} />} label="Ingresos" value={`$${stats.revenue.toFixed(2)}`} color="var(--rose)" accent />
            </Link>
            <Link href="/admin/orders?filter=payment_due" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<AlertCircle size={16} />} label="Por cobrar" value={`$${stats.still_to_collect.toFixed(2)}`} color={stats.still_to_collect > 0 ? 'var(--rose)' : 'var(--chocolate)'} warn={stats.still_to_collect > 0} />
            </Link>
            <Link href="/admin/orders" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<Truck size={16} />} label="Entregados" value={`${stats.delivered}/${stats.total_orders}`} color="var(--chocolate)" />
            </Link>
            <Link href="/admin/orders" style={{ display: 'block', textDecoration: 'none' }}>
              <StatCard icon={<Clock size={16} />} label="Restantes" value={stats.remaining} color="var(--chocolate)" />
            </Link>
          </div>

          {/* Slot capacity */}
          {slotCapacity.length > 0 && (
            <>
              <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)', marginBottom: 14 }}>
                Entregas por horario
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {slotCapacity.map((row, i) => {
                  const pct = row.capacity > 0 ? Math.min(1, row.current / row.capacity) : 0
                  const isFull = row.current >= row.capacity
                  return (
                    <div key={i} style={{
                      padding: '14px 16px', borderRadius: 20,
                      background: 'var(--card)', border: '1.5px solid var(--border)',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: row.zones.length > 0 ? 4 : 10 }}>
                        <p className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)' }}>
                          {formatTime(row.slot.start_time)} – {formatTime(row.slot.end_time)}
                        </p>
                        <span className="font-body font-bold" style={{ fontSize: 13, color: isFull ? '#DC2626' : 'var(--rose)' }}>
                          {row.current} / {row.capacity} pedidos
                        </span>
                      </div>
                      {row.zones.length > 0 && (
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>
                          📍 {row.zones.join(', ')}
                        </p>
                      )}
                      <div style={{ height: 6, borderRadius: 3, background: 'var(--border)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          width: `${pct * 100}%`,
                          background: isFull ? '#DC2626' : 'var(--rose)',
                        }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color, accent, warn }: {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  accent?: boolean
  warn?: boolean
}) {
  return (
    <div style={{
      padding: '14px 12px', borderRadius: 20,
      background: warn ? 'var(--rose-light)' : 'var(--card)',
      border: `1.5px solid ${warn ? 'var(--rose)' : 'var(--border)'}`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 10, marginBottom: 8,
        background: accent || warn ? 'var(--rose-light)' : 'var(--bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: accent || warn ? 'var(--rose)' : 'var(--text-secondary)',
      }}>
        {icon}
      </div>
      <p className="font-body font-semibold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: 2 }}>
        {label}
      </p>
      <p className="font-display font-bold" style={{ fontSize: 20, lineHeight: 1.1, color, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </p>
    </div>
  )
}
