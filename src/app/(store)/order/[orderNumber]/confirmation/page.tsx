import { notFound } from 'next/navigation'
import { getOrderByNumber, slots } from '@/lib/data/mock-store'
import { formatTime } from '@/lib/delivery-capacity'
import Link from 'next/link'
import { translations, Lang } from '@/lib/i18n/translations'

export default async function ConfirmationPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const order = getOrderByNumber(orderNumber)
  if (!order) notFound()

  const lang: Lang = (order.preferred_language === 'es' ? 'es' : 'en') as Lang
  const t = translations[lang]
  const dateLocale = lang === 'es' ? 'es-US' : 'en-US'

  const deliverySlot = order.delivery_slot_id
    ? slots.find(s => s.id === order.delivery_slot_id) || null
    : null
  const pickupSlot = order.pickup_slot_id
    ? slots.find(s => s.id === order.pickup_slot_id) || null
    : null
  const slot = order.fulfillment_type === 'delivery' ? deliverySlot : pickupSlot

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
      {/* Heading */}
      <h1
        className="font-display font-bold"
        style={{ fontSize: 30, color: 'var(--chocolate)', textAlign: 'center', marginBottom: 8 }}
      >
        {t.orderConfirmed}
      </h1>

      {/* Order number pill */}
      <div className="flex justify-center mb-6">
        <span
          className="font-display font-bold"
          style={{
            display: 'inline-block',
            background: 'var(--rose)',
            color: 'white',
            fontSize: 16,
            borderRadius: 9999,
            padding: '6px 16px',
          }}
        >
          {t.orderNumber(order.order_number)}
        </span>
      </div>

      {/* Date + time */}
      {(dateLabel || slotLabel) && (
        <p className="font-body text-center mb-6" style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
          {dateLabel}{dateLabel && slotLabel ? ' · ' : ''}{slotLabel}
        </p>
      )}

      {/* Summary card */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: '16px', marginBottom: 16 }}>
        <p className="font-display font-bold" style={{ fontSize: 15, color: 'var(--chocolate)', marginBottom: 12 }}>
          {lang === 'es' ? 'Tu pedido' : 'Your order'}
        </p>
        {items.map(item => (
          <div key={item.id} style={{ marginBottom: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="font-body font-semibold" style={{ fontSize: 14, color: 'var(--chocolate)' }}>
                {item.product_name} × {item.quantity}
              </span>
              <span className="font-body font-bold" style={{ fontSize: 14, color: 'var(--rose)' }}>
                ${item.item_total.toFixed(2)}
              </span>
            </div>
            {((item.toppings ?? item.order_item_toppings ?? []).length > 0) && (
              <div style={{ marginTop: 4, paddingLeft: 8 }}>
                {(item.toppings ?? item.order_item_toppings ?? []).map((tp: { topping_name: string; topping_price: number; is_free: boolean }) => (
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
        ))}
        {order.delivery_fee > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <span className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{lang === 'es' ? 'Envío' : 'Delivery'}</span>
            <span className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>${order.delivery_fee.toFixed(2)}</span>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, marginTop: 6, borderTop: '1px solid var(--border)' }}>
          <span className="font-display font-bold" style={{ color: 'var(--chocolate)' }}>{t.total}</span>
          <span className="font-display font-bold" style={{ fontSize: 16, color: 'var(--rose)' }}>
            ${order.total.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Payment info box */}
      <div style={{ background: 'var(--rose-light)', borderRadius: 20, padding: '12px 16px', marginBottom: 24 }}>
        <p className="font-body" style={{ fontSize: 14, color: 'var(--rose-dark)' }}>
          {paymentNote}
        </p>
      </div>

      {/* Phone confirmation */}
      <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 24 }}>
        {t.confirmationSub(order.customer_phone)}
      </p>

      {/* CTA */}
      <Link href="/menu">
        <div
          className="font-display font-bold"
          style={{
            height: 50,
            fontSize: 16,
            border: '2px solid var(--rose)',
            color: 'var(--rose)',
            background: 'transparent',
            borderRadius: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {t.backToMenu}
        </div>
      </Link>
    </div>
  )
}
