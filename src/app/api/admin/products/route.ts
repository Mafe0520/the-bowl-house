import { NextRequest, NextResponse } from 'next/server'
import { products, getProductsWithToppings } from '@/lib/data/mock-store'
import type { Product } from '@/types'

export async function GET() {
  return NextResponse.json(getProductsWithToppings())
}

export async function POST(req: NextRequest) {
  const body: Partial<Product> & { topping_ids?: string[] } = await req.json()
  const { topping_ids: _tids, ...fields } = body
  const nowStr = new Date().toISOString()
  const newProduct: Product = {
    id: `prod-${Date.now()}`,
    name: fields.name || '',
    slug: fields.slug || '',
    description: fields.description || null,
    price: fields.price || 0,
    image_url: fields.image_url || null,
    is_active: fields.is_active ?? true,
    is_sold_out: fields.is_sold_out ?? false,
    is_featured: fields.is_featured ?? false,
    is_customizable: fields.is_customizable ?? false,
    free_toppings_limit: fields.free_toppings_limit ?? 0,
    display_order: fields.display_order ?? 0,
    created_at: nowStr,
    updated_at: nowStr,
    name_en: fields.name_en || null,
    name_es: fields.name_es || null,
    description_en: fields.description_en || null,
    description_es: fields.description_es || null,
  }
  products.push(newProduct)
  return NextResponse.json(newProduct, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body: Partial<Product> & { id: string } = await req.json()
  const { id, ...fields } = body
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  products[idx] = { ...products[idx], ...fields, updated_at: new Date().toISOString() }
  return NextResponse.json(products[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const idx = products.findIndex(p => p.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  products.splice(idx, 1)
  return NextResponse.json({ success: true })
}
