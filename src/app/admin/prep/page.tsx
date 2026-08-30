'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { DeliveryDate } from '@/types'

interface OrderPrep {
  order_number: number
  customer_name: string
  items: { product_name: string; quantity: number; selections: string[] }[]
}

export default function AdminPrepPage() {
  const [dates, setDates] = useState<DeliveryDate[]>([])
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [orders, setOrders] = useState<OrderPrep[]>([])
  const [totals, setTotals] = useState({ orders: 0, bowls: 0 })
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState<'orders' | 'summary'>('orders')

  const loadDates = useCallback(async () => {
    const res = await fetch('/api/admin/dates')
    const data: DeliveryDate[] = await res.json()
    setDates(data)
    if (data.length > 0) setSelectedDate(data[0].id)
  }, [])

  const loadPrep = useCallback(async (dateId: string) => {
    setLoading(true)
    const res = await fetch(`/api/orders?date_id=${dateId}`)
    const raw = await res.json()

    let totalBowls = 0
    const parsed: OrderPrep[] = raw
      .filter((o: { order_status: string }) => o.order_status !== 'cancelled')
      .map((o: {
        order_number: number
        customer_first_name?: string
        customer_last_name?: string
        order_items?: { product_name: string; quantity: number; selections?: { option_name: string }[] }[]
        items?: { product_name: string; quantity: number; selections?: { option_name: string }[] }[]
      }) => {
        const items = (o.order_items || o.items || []).map(item => {
          totalBowls += item.quantity
          const sels = (item.selections || []).map((s: { option_name: string }) => s.option_name)
          return { product_name: item.product_name, quantity: item.quantity, selections: sels }
        })
        return {
          order_number: o.order_number,
          customer_name: `${o.customer_first_name || ''} ${o.customer_last_name || ''}`.trim(),
          items,
        }
      })

    setOrders(parsed)
    setTotals({ orders: parsed.length, bowls: totalBowls })
    setLoading(false)
  }, [])

  useEffect(() => { loadDates() }, [loadDates])
  useEffect(() => { if (selectedDate) loadPrep(selectedDate) }, [selectedDate, loadPrep])

  const selectedDateObj = dates.find(d => d.id === selectedDate)
  const dateLabel = selectedDateObj
    ? new Date(selectedDateObj.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''

  // Summary aggregation
  const bowlSummary: Record<string, number> = {}
  const ingredientSummary: Record<string, number> = {}
  for (const o of orders) {
    for (const item of o.items) {
      bowlSummary[item.product_name] = (bowlSummary[item.product_name] || 0) + item.quantity
      for (const sel of item.selections) {
        ingredientSummary[sel] = (ingredientSummary[sel] || 0) + item.quantity
      }
    }
  }

  return (
    <div>
      <h1 className="font-display font-bold" style={{ fontSize: 28, color: 'var(--chocolate)', marginBottom: 20 }}>
        Lista de preparación
      </h1>

      {/* Date selector */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {dates.map(date => {
          const label = new Date(date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'short', day: 'numeric', month: 'short' })
          const active = selectedDate === date.id
          return (
            <button key={date.id} onClick={() => setSelectedDate(date.id)}
              className="font-body font-semibold"
              style={{
                flexShrink: 0, padding: '8px 16px', borderRadius: 20, fontSize: 13,
                background: active ? 'var(--rose)' : 'var(--card)',
                color: active ? 'white' : 'var(--text-secondary)',
                border: `1.5px solid ${active ? 'var(--rose)' : 'var(--border)'}`,
              }}>
              {label}
            </button>
          )
        })}
      </div>

      {/* Totals */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, padding: '14px 16px', borderRadius: 20, background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <p className="font-body font-bold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>Pedidos</p>
          <p className="font-display font-bold" style={{ fontSize: 28, color: 'var(--rose)' }}>{totals.orders}</p>
        </div>
        <div style={{ flex: 1, padding: '14px 16px', borderRadius: 20, background: 'var(--card)', border: '1.5px solid var(--border)' }}>
          <p className="font-body font-bold" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>Total bowls</p>
          <p className="font-display font-bold" style={{ fontSize: 28, color: 'var(--chocolate)' }}>{totals.bowls}</p>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['orders', 'summary'] as const).map(v => (
          <button key={v} onClick={() => setView(v)} className="font-body font-semibold"
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 13,
              background: view === v ? 'var(--chocolate)' : 'var(--card)',
              color: view === v ? 'white' : 'var(--text-secondary)',
              border: `1.5px solid ${view === v ? 'var(--chocolate)' : 'var(--border)'}`,
            }}>
            {v === 'orders' ? 'Por pedido' : 'Resumen'}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-secondary)' }}>Cargando...</p>
      ) : view === 'orders' ? (
        // Per-order view
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {orders.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', paddingTop: 32 }}>No hay pedidos aún.</p>
          ) : orders.map(order => (
            <Card key={order.order_number}>
              {/* Order header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
                <span className="font-display font-bold" style={{ fontSize: 15, color: 'var(--rose)' }}>#{order.order_number}</span>
                <span className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)' }}>{order.customer_name}</span>
              </div>
              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {order.items.map((item, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: item.selections.length > 0 ? 6 : 0 }}>
                      <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>{item.product_name}</span>
                      <span className="font-display font-bold" style={{ fontSize: 18, color: 'var(--rose)' }}>×{item.quantity}</span>
                    </div>
                    {item.selections.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {item.selections.map((sel, j) => (
                          <span key={j} className="font-body font-semibold"
                            style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg)', color: 'var(--text-secondary)', border: '1px solid var(--border)' }}>
                            {sel}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        // Summary view
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <Card>
            <h2 className="font-display font-semibold" style={{ color: 'var(--chocolate)', fontSize: 15, marginBottom: 12 }}>Bowls</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(bowlSummary).sort((a,b) => b[1]-a[1]).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-body font-semibold" style={{ color: 'var(--chocolate)', fontSize: 13 }}>{name}</span>
                  <span className="font-display font-bold" style={{ fontSize: 20, color: 'var(--rose)' }}>{count}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="font-display font-semibold" style={{ color: 'var(--chocolate)', fontSize: 15, marginBottom: 12 }}>Ingredientes</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Object.entries(ingredientSummary).sort((a,b) => b[1]-a[1]).map(([name, count]) => (
                <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span className="font-body font-semibold" style={{ color: 'var(--chocolate)', fontSize: 13 }}>{name}</span>
                  <span className="font-display font-bold" style={{ fontSize: 20, color: 'var(--caramel)' }}>{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
