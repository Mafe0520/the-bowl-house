'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Order, OrderStatus } from '@/types'
import { formatTime } from '@/lib/delivery-capacity'
import { ChevronLeft, X, User, MapPin, Clock, CreditCard, Zap, Printer } from 'lucide-react'

function orderStatusLabel(s: string) {
  const map: Record<string, string> = {
    new: 'Nuevo', confirmed: 'Confirmado', preparing: 'Preparando', ready: 'Listo',
    out_for_delivery: 'En camino', delivered: 'Entregado', picked_up: 'Recogido', cancelled: 'Cancelado',
  }
  return map[s] || s
}

const STATUS_COLORS: Record<string, string> = {
  new: '#6B7280', confirmed: '#D97706', preparing: '#D97706',
  ready: 'var(--rose)', out_for_delivery: 'var(--rose)',
  delivered: '#16A34A', picked_up: '#16A34A', cancelled: '#DC2626',
}

const ORDER_STATUSES_DELIVERY: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
const ORDER_STATUSES_PICKUP: OrderStatus[] = ['new', 'confirmed', 'preparing', 'ready', 'picked_up', 'cancelled']

interface SmsPreview { to: string; body: string }

// Reusable section card
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12, borderRadius: 20, overflow: 'hidden', background: 'var(--card)', border: '1.5px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}>
        <span style={{ color: 'var(--rose)' }}>{icon}</span>
        <p className="font-display font-bold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>{title}</p>
      </div>
      <div style={{ padding: '14px 16px' }}>
        {children}
      </div>
    </div>
  )
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [smsPreview, setSmsPreview] = useState<SmsPreview | null>(null)

  const loadOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${id}`)
    setOrder(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { loadOrder() }, [loadOrder])

  async function doAction(action: string) {
    setActionLoading(action)
    setMessage('')
    setSmsPreview(null)
    const res = await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const data = await res.json()
    if (data.success) {
      await loadOrder()
      setMessage('¡Acción completada!')
      if (data.sms_preview) setSmsPreview(data.sms_preview)
    } else {
      setMessage(data.error || 'Algo salió mal.')
    }
    setActionLoading(null)
  }

  async function updateStatus(status: OrderStatus) {
    setActionLoading('status')
    await fetch(`/api/orders/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_status: status }),
    })
    await loadOrder()
    setActionLoading(null)
  }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Cargando...</div>
  if (!order) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-secondary)' }}>Pedido no encontrado.</div>

  const slot = order.delivery_slot || order.pickup_slot
  const slotLabel = slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : ''
  const dateLabel = order.delivery_date
    ? new Date(order.delivery_date.date + 'T12:00:00').toLocaleDateString('es-US', { weekday: 'long', day: 'numeric', month: 'long' })
    : ''
  const statuses = order.fulfillment_type === 'delivery' ? ORDER_STATUSES_DELIVERY : ORDER_STATUSES_PICKUP
  const isPaid = order.payment_status === 'paid'
  const statusColor = STATUS_COLORS[order.order_status] || 'var(--text-secondary)'

  return (
    <div>
      {/* Back */}
      <button onClick={() => router.back()}
        style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 20, color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}>
        <ChevronLeft size={16} /> Pedidos
      </button>

      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="font-display font-bold" style={{ fontSize: 32, color: 'var(--chocolate)' }}>#{order.order_number}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.open(`/admin/orders/${id}/label`, '_blank')}
              className="font-body font-semibold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, fontSize: 13, background: 'var(--card)', color: 'var(--text-secondary)', border: '1.5px solid var(--border)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <Printer size={14} /> Label
            </button>
            <span className="font-body font-bold" style={{
              fontSize: 12, padding: '4px 12px', borderRadius: 20,
              background: isPaid ? '#DCFCE7' : '#FEF9C3',
              color: isPaid ? '#15803D' : '#92400E',
            }}>
              {isPaid ? '✓ Pagado' : '⏳ Pago pendiente'}
            </span>
            <span className="font-body font-bold" style={{
              fontSize: 12, padding: '4px 12px', borderRadius: 20,
              background: 'var(--bg)', border: `1.5px solid ${statusColor}`, color: statusColor,
            }}>
              {orderStatusLabel(order.order_status)}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
          {new Date(order.created_at).toLocaleString('es-US', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      {/* SMS modal */}
      {smsPreview && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, background: 'rgba(60,26,12,0.5)' }}>
          <div style={{ width: '100%', maxWidth: 360, background: 'var(--card)', borderRadius: 24, padding: 20, border: '1.5px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <p className="font-display font-bold" style={{ color: 'var(--chocolate)' }}>SMS enviado</p>
              <button onClick={() => setSmsPreview(null)} style={{ color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>Para: {smsPreview.to}</p>
            <div style={{ borderRadius: 14, padding: 12, fontSize: 13, whiteSpace: 'pre-wrap', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text-primary)', lineHeight: 1.5 }}>
              {smsPreview.body}
            </div>
          </div>
        </div>
      )}

      {/* Customer + Delivery 2-col */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div style={{ borderRadius: 20, background: 'var(--card)', border: '1.5px solid var(--border)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <User size={14} color="var(--rose)" />
            <p className="font-display font-bold" style={{ fontSize: 13, color: 'var(--chocolate)' }}>Cliente</p>
          </div>
          <p className="font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)', marginBottom: 2 }}>{order.customer_first_name} {order.customer_last_name}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.customer_phone}</p>
          {order.customer_email && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{order.customer_email}</p>}
        </div>

        <div style={{ borderRadius: 20, background: 'var(--card)', border: '1.5px solid var(--border)', padding: '14px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            {order.fulfillment_type === 'delivery' ? <MapPin size={14} color="var(--rose)" /> : <Clock size={14} color="var(--rose)" />}
            <p className="font-display font-bold" style={{ fontSize: 13, color: 'var(--chocolate)' }}>
              {order.fulfillment_type === 'delivery' ? 'Entrega' : 'Recogida'}
            </p>
          </div>
          <p className="font-semibold" style={{ fontSize: 13, color: 'var(--chocolate)', marginBottom: 2 }}>{dateLabel}</p>
          <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{slotLabel}</p>
          {order.fulfillment_type === 'delivery' && (
            <>
              <p style={{ fontSize: 12, marginTop: 6, color: 'var(--text-secondary)' }}>
                {order.street_address}{order.apartment ? `, ${order.apartment}` : ''}
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{order.city}, {order.state}</p>
              {order.zone_name && (
                <p className="font-body font-bold" style={{ fontSize: 11, marginTop: 4, color: 'var(--caramel)' }}>📍 {order.zone_name}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Products */}
      <Section title="Productos" icon={<Zap size={14} />}>
        {order.items?.map((item, i) => (
          <div key={item.id} style={{
            paddingBottom: i < (order.items?.length ?? 0) - 1 ? 12 : 0,
            marginBottom: i < (order.items?.length ?? 0) - 1 ? 12 : 0,
            borderBottom: i < (order.items?.length ?? 0) - 1 ? '1px solid var(--border)' : 'none',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p className="font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>
                  {item.product_name} <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}>× {item.quantity}</span>
                </p>
                {item.toppings && item.toppings.length > 0 && (
                  <p style={{ fontSize: 12, marginTop: 2, color: 'var(--text-secondary)' }}>
                    {item.toppings.map(t => t.topping_name).join(', ')}
                  </p>
                )}
              </div>
              <p className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)', flexShrink: 0 }}>
                ${item.item_total.toFixed(2)}
              </p>
            </div>
          </div>
        ))}
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1.5px solid var(--border)' }}>
          {order.delivery_fee > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6, color: 'var(--text-secondary)' }}>
              <span>Envío</span>
              <span>${order.delivery_fee.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p className="font-display font-bold" style={{ fontSize: 16, color: 'var(--chocolate)' }}>Total</p>
            <p className="font-display font-bold" style={{ fontSize: 20, color: 'var(--rose)' }}>${order.total.toFixed(2)}</p>
          </div>
        </div>
      </Section>

      {/* Payment */}
      <Section title="Pago" icon={<CreditCard size={14} />}>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>Método</p>
            <p className="font-semibold" style={{ fontSize: 15, color: 'var(--chocolate)' }}>{order.payment_method === 'zelle' ? 'Zelle' : 'Efectivo'}</p>
          </div>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-secondary)', marginBottom: 4 }}>Estado</p>
            <p className="font-semibold" style={{ fontSize: 15, color: isPaid ? '#16A34A' : '#D97706' }}>
              {isPaid ? 'Pagado ✓' : 'Pendiente'}
            </p>
          </div>
        </div>
        {order.payment_request_count > 0 && (
          <p style={{ fontSize: 12, marginTop: 10, color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--bg)', borderRadius: 10 }}>
            Solicitud enviada {order.payment_request_count}× — última: {order.last_payment_request_sent_at
              ? new Date(order.last_payment_request_sent_at).toLocaleString('es-US', { dateStyle: 'short', timeStyle: 'short' })
              : 'N/A'}
          </p>
        )}
      </Section>

      {/* Actions */}
      {message && (
        <div style={{ marginBottom: 12, padding: '10px 16px', borderRadius: 16, background: 'var(--rose-light)', color: 'var(--rose-dark)', fontSize: 13, fontWeight: 600 }}>
          {message}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
        {order.fulfillment_type === 'delivery' && order.order_status !== 'delivered' && (
          <>
            {order.payment_method === 'zelle' ? (
              <Button fullWidth loading={actionLoading === 'mark_delivered_send_payment'} onClick={() => doAction('mark_delivered_send_payment')}>
                Entregado — Solicitar pago Zelle
              </Button>
            ) : (
              <Button fullWidth loading={actionLoading === 'delivered_and_paid'} onClick={() => doAction('delivered_and_paid')}>
                Entregado y pagado (efectivo)
              </Button>
            )}
            <Button fullWidth variant="secondary" loading={actionLoading === 'mark_delivered'} onClick={() => doAction('mark_delivered')}>
              Solo marcar entregado
            </Button>
          </>
        )}
        {order.fulfillment_type === 'pickup' && order.order_status !== 'picked_up' && (
          <>
            <Button fullWidth loading={actionLoading === 'picked_up_send_payment'} onClick={() => doAction('picked_up_send_payment')}>
              Recogido — Solicitar pago Zelle
            </Button>
            {order.payment_method === 'cash' && (
              <Button fullWidth variant="secondary" loading={actionLoading === 'delivered_and_paid'} onClick={() => doAction('delivered_and_paid')}>
                Recogido y pagado (efectivo)
              </Button>
            )}
          </>
        )}
        {order.payment_method === 'zelle' && !isPaid && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button fullWidth variant="secondary" loading={actionLoading === 'confirm_payment'} onClick={() => doAction('confirm_payment')}>
              Confirmar pago Zelle
            </Button>
            <Button fullWidth variant="ghost" loading={actionLoading === 'resend_payment_request'} onClick={() => doAction('resend_payment_request')}>
              Reenviar
            </Button>
          </div>
        )}
      </div>

      {/* Status pills */}
      <div style={{ borderRadius: 20, background: 'var(--card)', border: '1.5px solid var(--border)', padding: '14px 16px' }}>
        <p className="font-display font-bold" style={{ fontSize: 13, color: 'var(--chocolate)', marginBottom: 10 }}>Cambiar estado</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {statuses.map(status => {
            const active = order.order_status === status
            const c = STATUS_COLORS[status] || 'var(--text-secondary)'
            return (
              <button key={status} onClick={() => updateStatus(status)}
                disabled={actionLoading === 'status' || active}
                className="font-body font-bold"
                style={{
                  padding: '7px 14px', borderRadius: 20, fontSize: 12,
                  background: active ? c : 'var(--bg)',
                  color: active ? 'white' : c,
                  border: `1.5px solid ${c}`,
                  opacity: actionLoading === 'status' ? 0.5 : 1,
                  cursor: active ? 'default' : 'pointer',
                }}>
                {orderStatusLabel(status)}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
