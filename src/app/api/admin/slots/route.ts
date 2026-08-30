import { NextRequest, NextResponse } from 'next/server'
import { slots } from '@/lib/data/mock-store'
import type { DeliverySlot } from '@/types'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateId = searchParams.get('date_id')
  const result = dateId ? slots.filter(s => s.delivery_date_id === dateId) : slots
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  const body: Partial<DeliverySlot> = await req.json()
  const newSlot: DeliverySlot = {
    id: `slot-${Date.now()}`,
    delivery_date_id: body.delivery_date_id || '',
    start_time: body.start_time || '12:00',
    end_time: body.end_time || '14:00',
    is_active: body.is_active ?? true,
    is_manually_closed: body.is_manually_closed ?? false,
    display_order: body.display_order ?? 0,
  }
  slots.push(newSlot)
  return NextResponse.json(newSlot, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body: Partial<DeliverySlot> & { id: string } = await req.json()
  const { id, ...fields } = body
  const idx = slots.findIndex(s => s.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  slots[idx] = { ...slots[idx], ...fields }
  return NextResponse.json(slots[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const idx = slots.findIndex(s => s.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  slots.splice(idx, 1)
  return NextResponse.json({ success: true })
}
