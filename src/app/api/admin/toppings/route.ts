import { NextRequest, NextResponse } from 'next/server'
import { toppings } from '@/lib/data/mock-store'
import type { Topping } from '@/types'

export async function GET() {
  return NextResponse.json(toppings)
}

export async function POST(req: NextRequest) {
  const body: Partial<Topping> = await req.json()
  const newTopping: Topping = {
    id: `t-${Date.now()}`,
    name: body.name || '',
    price: body.price ?? 0,
    image_url: body.image_url || null,
    is_available: body.is_available ?? true,
    display_order: body.display_order ?? 0,
    name_en: body.name_en || null,
    name_es: body.name_es || null,
  }
  toppings.push(newTopping)
  return NextResponse.json(newTopping, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body: Partial<Topping> & { id: string } = await req.json()
  const { id, ...fields } = body
  const idx = toppings.findIndex(t => t.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  toppings[idx] = { ...toppings[idx], ...fields }
  return NextResponse.json(toppings[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const idx = toppings.findIndex(t => t.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  toppings.splice(idx, 1)
  return NextResponse.json({ success: true })
}
