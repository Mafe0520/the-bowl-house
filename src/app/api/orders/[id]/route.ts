import { NextRequest, NextResponse } from 'next/server'
import {
  getOrderById, updateOrder, deleteOrder, settings,
} from '@/lib/data/mock-store'
import {
  sendSMS, zellePaymentRequestSMS, paymentReceivedSMS,
} from '@/lib/sms'
import type { Lang } from '@/lib/i18n/translations'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const { action, ...updates } = body

  const order = getOrderById(id)
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

  const lang: Lang = (order.preferred_language || 'en') as Lang
  const now = new Date().toISOString()

  function zellePreview() {
    if (order!.payment_method !== 'zelle') return null
    const body = zellePaymentRequestSMS(
      order!.order_number, order!.total.toFixed(2),
      settings.zelle_recipient_name || 'The Bowl House',
      settings.zelle_phone_email || '',
      settings.zelle_payment_url || undefined,
      lang
    )
    return { to: order!.customer_phone, body }
  }

  if (action === 'mark_delivered') {
    updateOrder(id, { order_status: 'delivered', delivered_at: now })
    return NextResponse.json({ success: true })
  }

  if (action === 'mark_delivered_send_payment') {
    updateOrder(id, {
      order_status: 'delivered', delivered_at: now,
      payment_request_sent_at: now,
      payment_request_count: (order.payment_request_count || 0) + 1,
      last_payment_request_sent_at: now,
    })
    const sms_preview = zellePreview()
    if (sms_preview) sendSMS({ to: sms_preview.to, body: sms_preview.body }).catch(() => {})
    return NextResponse.json({ success: true, sms_preview })
  }

  if (action === 'delivered_and_paid') {
    updateOrder(id, {
      order_status: 'delivered', delivered_at: now,
      payment_status: 'paid', payment_confirmed_at: now,
    })
    return NextResponse.json({ success: true })
  }

  if (action === 'picked_up_send_payment') {
    updateOrder(id, {
      order_status: 'picked_up', picked_up_at: now,
      payment_request_sent_at: now,
      payment_request_count: (order.payment_request_count || 0) + 1,
      last_payment_request_sent_at: now,
    })
    const sms_preview = zellePreview()
    if (sms_preview) sendSMS({ to: sms_preview.to, body: sms_preview.body }).catch(() => {})
    return NextResponse.json({ success: true, sms_preview })
  }

  if (action === 'confirm_payment') {
    updateOrder(id, {
      payment_status: 'paid',
      payment_confirmed_at: now,
      payment_confirmed_by: updates.confirmed_by || 'admin',
    })
    const smsBody = paymentReceivedSMS(order.order_number, lang)
    const sms_preview = { to: order.customer_phone, body: smsBody }
    sendSMS({ to: order.customer_phone, body: smsBody }).catch(() => {})
    return NextResponse.json({ success: true, sms_preview })
  }

  if (action === 'resend_payment_request') {
    updateOrder(id, {
      payment_request_count: (order.payment_request_count || 0) + 1,
      last_payment_request_sent_at: now,
    })
    const sms_preview = zellePreview()
    if (sms_preview) sendSMS({ to: sms_preview.to, body: sms_preview.body }).catch(() => {})
    return NextResponse.json({ success: true, sms_preview })
  }

  if (action === 'move_slot') {
    const { new_slot_id } = updates
    if (!new_slot_id) return NextResponse.json({ error: 'new_slot_id required' }, { status: 400 })
    updateOrder(id, { delivery_slot_id: new_slot_id })
    return NextResponse.json({ success: true })
  }

  // Generic update
  updateOrder(id, updates)
  return NextResponse.json({ success: true })
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = getOrderById(id)
  if (!order) return NextResponse.json(null, { status: 404 })
  return NextResponse.json(order)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteOrder(id)
  if (!ok) return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
