'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { formatTime } from '@/lib/delivery-capacity'
import { Order, DeliveryDate } from '@/types'

type PaymentFilter = 'all' | 'payment_due' | 'zelle_due' | 'cash_due' | 'paid'

function orderStatusLabel(s: string) {
  const map: Record<string, string> = {
    new: 'Nuevo', confirmed: 'Confirmado', preparing: 'Preparando',
    ready: 'Listo', out_for_delivery: 'En camino',
    delivered: 'Entregado', picked_up: 'Recogido', cancelled: 'Cancelado',
  }
  return map[s] || s
}

const statusColors: Record<string, 'rose' | 'caramel' | 'green' | 'red' | 'gray'> = {
  new: 'gray', confirmed: 'caramel', preparing: 'caramel', ready: 'rose',
  out_for_delivery: 'rose', delivered: 'green', picked_up: 'green', cancelled: 'red',
}

const FILTERS: [PaymentFilter, string][] = [
  ['all', 'Todos'],
  ['payment_due', 'Pago pendiente'],
  ['zelle_due', 'Zelle pendiente'],
  ['cash_due', 'Efectivo'],
  ['paid', 'Pagado'],
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [dates, setDates] = useState<DeliveryDate[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const loadDates = useCallback(async () => {
    const res = await fetch('/api/admin/dates')
    const data: DeliveryDate[] = await res.json()
    setDates(data)
    if (data.length > 0) setSelectedDate(data[0].id)
  }, [])

  const loadOrders = useCallback(async (dateId: string) => {
    setLoading(true)
    const res = await fetch(`/api/orders?date_id=${dateId}`)
    setOrders(await res.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadDates() }, [loadDates])
  useEffect(() => { if (selectedDate) loadOrders(selectedDate) }, [selectedDate, loadOrders])

  function filteredOrders() {
    return orders.filter(o => {
      if (paymentFilter === 'payment_due') return o.payment_status === 'payment_due'
      if (paymentFilter === 'zelle_due') return o.payment_method === 'zelle' && o.payment_status === 'payment_due'
      if (paymentFilter === 'cash_due') return o.payment_method === 'cash' && o.payment_status === 'payment_due'
      if (paymentFilter === 'paid') return o.payment_status === 'paid'
      return true
    }).filter(o => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        o.order_number?.toString().includes(q) ||
        o.customer_first_name?.toLowerCase().includes(q) ||
        o.customer_last_name?.toLowerCase().includes(q) ||
        o.customer_phone?.includes(q)
      )
    })
  }

  const shown = filteredOrders()

  async function handleDelete(e: React.MouseEvent, orderId: string, orderNumber: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`¿Borrar el pedido #${orderNumber}? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/orders/${orderId}`, { method: 'DELETE' })
    setOrders(prev => prev.filter(o => o.id !== orderId))
  }

  return (
    <div>
      {/* Sticky filter header */}
      <div style={{
        position: 'sticky', top: -20, zIndex: 10,
        background: 'var(--bg)', marginBottom: 12,
        paddingTop: 4, paddingBottom: 8,
        marginLeft: -16, marginRight: -16, paddingLeft: 16, paddingRight: 16,
      }}>
        {/* Date selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {dates.map(date => {
            const label = new Date(date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'short', day: 'numeric', month: 'short' })
            const active = selectedDate === date.id
            return (
              <button key={date.id} onClick={() => setSelectedDate(date.id)}
                className="font-body font-semibold"
                style={{
                  flexShrink: 0, padding: '7px 16px', borderRadius: 20, fontSize: 13,
                  background: active ? 'var(--rose)' : 'var(--card)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${active ? 'var(--rose)' : 'var(--border)'}`,
                }}
              >{label}</button>
            )
          })}
        </div>

        {/* Payment filter chips */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, overflowX: 'auto', paddingBottom: 2 }}>
          {FILTERS.map(([key, label]) => {
            const active = paymentFilter === key
            return (
              <button key={key} onClick={() => setPaymentFilter(key)}
                className="font-body font-semibold"
                style={{
                  flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 13,
                  background: active ? 'var(--chocolate)' : 'var(--card)',
                  color: active ? 'white' : 'var(--text-secondary)',
                  border: `1.5px solid ${active ? 'var(--chocolate)' : 'var(--border)'}`,
                }}
              >{label}</button>
            )
          })}
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15, opacity: 0.4 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar pedido, cliente o teléfono..."
            className="font-body"
            style={{
              width: '100%', padding: '10px 16px 10px 40px', borderRadius: 20, fontSize: 14,
              background: 'var(--card)', border: '1.5px solid var(--border)',
              color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>Cargando pedidos...</p>
      ) : shown.length === 0 ? (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 40 }}>No se encontraron pedidos.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {shown.map(order => {
            const slot = order.delivery_slot || order.pickup_slot
            const slotLabel = slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : ''
            const isZelle = order.payment_method === 'zelle'
            const isPaid = order.payment_status === 'paid'
            return (
              <Link key={order.id} href={`/admin/orders/${order.id}`} style={{ display: 'block' }}>
                <Card style={{ cursor: 'pointer' }}>
                  {/* Top row: order# + payment badge + total */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span className="font-display font-bold" style={{ color: 'var(--rose)', fontSize: 16 }}>
                        #{order.order_number}
                      </span>
                      {!isPaid && (
                        <span className="font-body font-bold" style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 20,
                          background: '#FEF3C7', color: '#92400E',
                        }}>
                          {isZelle ? 'Zelle pendiente' : 'Efectivo'}
                        </span>
                      )}
                      {isPaid && (
                        <span className="font-body font-bold" style={{
                          fontSize: 11, padding: '2px 8px', borderRadius: 20,
                          background: '#D1FAE5', color: '#065F46',
                        }}>Pagado</span>
                      )}
                      <Badge variant={statusColors[order.order_status] || 'gray'}>
                        {orderStatusLabel(order.order_status)}
                      </Badge>
                    </div>
                    <span className="font-display font-bold" style={{ color: 'var(--rose)', fontSize: 16, flexShrink: 0 }}>
                      ${order.total.toFixed(2)}
                    </span>
                  </div>

                  {/* Customer name */}
                  <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)', marginBottom: 2 }}>
                    {order.customer_first_name} {order.customer_last_name}
                  </p>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>
                    {order.customer_phone}
                  </p>

                  {/* Slot + zone + type */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    {slotLabel && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        🕐 {slotLabel}
                      </span>
                    )}
                    {order.zone_name && (
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        📍 {order.zone_name}
                      </span>
                    )}
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {order.fulfillment_type === 'delivery' ? '🛵' : '🏠'}
                    </span>
                  </div>

                  {/* Footer: created time + buttons */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
                    <p style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                      Creado: {new Date(order.created_at).toLocaleTimeString('es-US', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        onClick={e => handleDelete(e, order.id, order.order_number)}
                        className="font-body font-bold"
                        style={{
                          fontSize: 12, padding: '5px 12px', borderRadius: 20,
                          border: '1.5px solid #f87171', color: '#ef4444', background: 'transparent',
                          cursor: 'pointer',
                        }}>
                        Borrar
                      </button>
                      <span className="font-body font-bold" style={{
                        fontSize: 12, padding: '5px 14px', borderRadius: 20,
                        border: '1.5px solid var(--rose)', color: 'var(--rose)',
                      }}>
                        Ver detalles
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
