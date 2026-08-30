'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { formatTime } from '@/lib/delivery-capacity'
import Link from 'next/link'
import { translations, Lang } from '@/lib/i18n/translations'

interface OrderData {
  order_number: string
  customer_phone: string
  preferred_language: string
  fulfillment_type: string
  payment_method: string
  delivery_fee: number
  total: number
  delivery_date?: { date: string } | null
  delivery_slot?: { start_time: string; end_time: string } | null
  pickup_slot?: { start_time: string; end_time: string } | null
  items?: { id: string; product_name: string; quantity: number; item_total: number; toppings?: { topping_name: string; topping_price: number; is_free: boolean }[] }[]
  order_items?: { id: string; product_name: string; quantity: number; item_total: number; order_item_toppings?: { topping_name: string; topping_price: number; is_free: boolean }[] }[]
}

export default function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = use(params)
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    fetch(`/api/orders?order_number=${orderNumber}`)
      .then(r => r.json())
      .then(data => {
        if (!data) { setNotFound(true); return }
        setOrder(data)
      })
      .catch(() => setNotFound(true))
  }, [orderNumber])

  if (notFound) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 18, color: 'var(--chocolate)', fontWeight: 700, marginBottom: 16 }}>Pedido no encontrado</p>
        <Link href="/menu" style={{ color: 'var(--rose)', fontWeight: 600 }}>Volver al menú</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Cargando confirmación...</p>
      </div>
    )
  }

  const lang: Lang = (order.preferred_language === 'es' ? 'es' : 'en') as Lang
  const t = translations[lang]
  const dateLocale = lang === 'es' ? 'es-US' : 'en-US'

  const slot = order.fulfillment_type === 'delivery' ? order.delivery_slot : order.pickup_slot
  const dateLabel = order.delivery_date
    ? new Date(order.delivery_date.date + 'T12:00:00').toLocaleDateString(dateLocale, { weekday: 'long', month: 'long', day: 'numeric' })
    : ''
  const slotLabel = slot ? `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}` : ''
  const paymentNote = order.payment_method === 'zelle'
    ? t.zellePayNote(order.fulfillment_type)
    : t.cashPayNote(order.fulfillment_type)

  const items = order.items || order.order_items || []

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: '40px 20px' }}>
      <h1 className="font-display font-bold"
        style={{ fontSize: 30, color: 'var(--chocolate)', textAlign: 'center', marginBottom: 8 }}>
        {t.orderConfirmed}
      </h1>

      <div className="flex justify-center mb-6">
        <span className="font-display font-bold"
          style={{ display: 'inline-block', background: 'var(--rose)', color: 'white', fontSize: 16, borderRadius: 9999, padding: '6px 16px' }}>
          {t.orderNumber(order.order_number)}
        </span>
      </div>

      {(dateLabel || slotLabel) && (
        <p className="font-body text-center mb-6" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {dateLabel}{dateLabel && slotLabel ? ' · ' : ''}{slotLabel}
        </p>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
        <p className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)', marginBottom: 12 }}>
          {lang === 'es' ? 'Tu pedido' : 'Your order'}
        </p>
        {items.map((item, i) => {
          const toppings = (item as { toppings?: { topping_name: string; topping_price: number; is_free: boolean }[] }).toppings
            || (item as { order_item_toppings?: { topping_name: string; topping_price: number; is_free: boolean }[] }).order_item_toppings
            || []
          return (
            <div key={item.id || i} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-body font-bold" style={{ fontSize: 14, color: 'var(--rose)' }}>
                  ${item.item_total.toFixed(2)}
                </span>
              </div>
              {toppings.length > 0 && (
                <div style={{ marginTop: 4, paddingLeft: 8 }}>
                  {toppings.map((tp) => (
                    <div key={tp.topping_name} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="font-body" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>+ {tp.topping_name}</span>
                      {tp.topping_price > 0 && !tp.is_free && (
                        <span className="font-body" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>+${tp.topping_price.toFixed(2)}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        {order.delivery_fee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <span className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lang === 'es' ? 'Envío' : 'Delivery'}</span>
            <span className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${order.delivery_fee.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--border)' }}>
          <span className="font-display font-bold" style={{ color: 'var(--chocolate)' }}>{t.total}</span>
          <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose)' }}>${order.total.toFixed(2)}</span>
        </div>
      </div>

      <div style={{ background: 'var(--rose-light)', borderRadius: 20, padding: '12px 16px', marginBottom: 24 }}>
        <p className="font-body" style={{ fontSize: 14, color: 'var(--rose-dark)' }}>{paymentNote}</p>
      </div>

      <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24 }}>
        {t.confirmationSub(order.customer_phone)}
      </p>

      <Link href="/menu">
        <div className="font-display font-bold"
          style={{ height: 50, fontSize: 16, border: '2px solid var(--rose)', color: 'var(--rose)', background: 'transparent', borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {t.backToMenu}
        </div>
      </Link>
    </div>
  )
}
