import { NextRequest, NextResponse } from 'next/server'
import { dates } from '@/lib/data/mock-store'
import type { DeliveryDate } from '@/types'

export async function GET() {
  return NextResponse.json([...dates].sort((a, b) => b.date.localeCompare(a.date)))
}

export async function POST(req: NextRequest) {
  const body: Partial<DeliveryDate> = await req.json()
  const newDate: DeliveryDate = {
    id: `date-${Date.now()}`,
    date: body.date || '',
    day_of_week: body.day_of_week || 'sunday',
    is_active: body.is_active ?? true,
    accepting_orders: body.accepting_orders ?? true,
    cutoff_datetime: body.cutoff_datetime || null,
  }
  dates.push(newDate)
  return NextResponse.json(newDate, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body: Partial<DeliveryDate> & { id: string } = await req.json()
  const { id, ...fields } = body
  const idx = dates.findIndex(d => d.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  dates[idx] = { ...dates[idx], ...fields }
  return NextResponse.json(dates[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const idx = dates.findIndex(d => d.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  dates.splice(idx, 1)
  return NextResponse.json({ success: true })
}
