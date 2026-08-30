import { NextRequest, NextResponse } from 'next/server'
import {
  orders, createOrder, nextOrderNumber,
  zones, dates, slots,
} from '@/lib/data/mock-store'
import { sendSMS, orderConfirmationSMS } from '@/lib/sms'
import { formatTime } from '@/lib/delivery-capacity'
import type { Lang } from '@/lib/i18n/translations'
import type { MockOrder, MockOrderItem } from '@/lib/data/mock-store'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    customer, items, fulfillment_type,
    delivery_date_id, delivery_slot_id, pickup_slot_id,
    street_address, apartment, city, state, zip_code,
    delivery_instructions, delivery_zone_id,
    subtotal, delivery_fee, total, payment_method,
    preferred_language = 'en',
  } = body

  // Resolve zone name
  let zoneName: string | null = null
  if (delivery_zone_id) {
    zoneName = zones.find(z => z.id === delivery_zone_id)?.name || null
  }

  const orderId = `ord-${Date.now()}`
  const orderNumber = nextOrderNumber()
  const nowStr = new Date().toISOString()

  // Build order items from cart
  const orderItems: MockOrderItem[] = (items || []).map((item: {
    product_id: string; product_name: string; product_price: number;
    quantity: number; item_total: number;
    toppings?: { topping_id: string; topping_name: string; topping_price: number; is_free: boolean }[]
  }, idx: number) => {
    const itemId = `${orderId}-i${idx}`
    const toppingsList = (item.toppings || []).map((t, ti) => ({
      id: `${itemId}-t${ti}`,
      order_item_id: itemId,
      topping_id: t.topping_id,
      topping_name: t.topping_name,
      topping_price: t.topping_price,
      is_free: t.is_free,
    }))
    return {
      id: itemId,
      order_id: orderId,
      product_id: item.product_id,
      product_name: item.product_name,
      product_price: item.product_price,
      quantity: item.quantity,
      item_total: item.item_total,
      toppings: toppingsList,
      order_item_toppings: toppingsList,
    }
  })

  const slot = delivery_slot_id ? slots.find(s => s.id === delivery_slot_id) || null : null
  const pickupSlot = pickup_slot_id ? slots.find(s => s.id === pickup_slot_id) || null : null
  const date = delivery_date_id ? dates.find(d => d.id === delivery_date_id) || null : null

  const newOrder: MockOrder = {
    id: orderId,
    order_number: orderNumber,
    customer_id: null,
    customer_first_name: customer.first_name,
    customer_last_name: customer.last_name,
    customer_phone: customer.phone,
    customer_email: customer.email || null,
    fulfillment_type,
    delivery_date_id,
    delivery_slot_id: delivery_slot_id || null,
    pickup_slot_id: pickup_slot_id || null,
    street_address: street_address || null,
    apartment: apartment || null,
    city: city || null,
    state: state || null,
    zip_code: zip_code || null,
    delivery_instructions: delivery_instructions || null,
    delivery_zone_id: delivery_zone_id || null,
    zone_name: zoneName,
    subtotal,
    delivery_fee: delivery_fee || 0,
    total,
    payment_method,
    payment_status: 'payment_due',
    payment_confirmed_at: null,
    payment_confirmed_by: null,
    payment_request_sent_at: null,
    payment_request_count: 0,
    last_payment_request_sent_at: null,
    order_status: 'new',
    delivered_at: null,
    picked_up_at: null,
    admin_notes: null,
    preferred_language,
    created_at: nowStr,
    updated_at: nowStr,
    items: orderItems,
    order_items: orderItems,
    delivery_slot: slot,
    pickup_slot: pickupSlot,
    delivery_date: date,
  }

  createOrder(newOrder)

  // Build SMS preview (no actual SMS sent in dev)
  const dateLabel = date
    ? new Date(date.date + 'T12:00:00').toLocaleDateString(
        preferred_language === 'es' ? 'es-US' : 'en-US',
        { weekday: 'long', month: 'long', day: 'numeric' }
      )
    : ''
  const slotForLabel = slot || pickupSlot
  const slotLabel = slotForLabel ? `${formatTime(slotForLabel.start_time)} – ${formatTime(slotForLabel.end_time)}` : ''
  const smsBody = orderConfirmationSMS(
    orderNumber, dateLabel, slotLabel, total.toFixed(2),
    payment_method, fulfillment_type, preferred_language as Lang
  )
  // SMS — fire and forget, no bloquea la respuesta
  sendSMS({ to: customer.phone, body: smsBody }).catch(() => {})
  const ownerPhone = process.env.TWILIO_OWNER_PHONE
  if (ownerPhone) {
    const itemsList = orderItems.map(i => `${i.product_name} x${i.quantity}`).join(', ')
    const ownerMsg = `🍨 Nuevo pedido #${orderNumber}\n👤 ${customer.first_name} ${customer.last_name} · ${customer.phone}\n📦 ${itemsList}\n💰 $${total.toFixed(2)} · ${payment_method === 'zelle' ? 'Zelle' : 'Efectivo'}\n📅 ${dateLabel} ${slotLabel}`
    sendSMS({ to: ownerPhone, body: ownerMsg }).catch(() => {})
  }

  return NextResponse.json({ order_number: orderNumber, order_id: orderId })
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const orderNumber = searchParams.get('order_number')

  if (orderNumber) {
    const o = orders.find(o => o.order_number === orderNumber) || null
    return NextResponse.json(o)
  }

  const dateFilter = searchParams.get('date_id')
  let result = orders.filter(o => o.order_status !== 'cancelled')
  if (dateFilter) result = result.filter(o => o.delivery_date_id === dateFilter)
  result = [...result].sort((a, b) => b.created_at.localeCompare(a.created_at))

  return NextResponse.json(result)
}
