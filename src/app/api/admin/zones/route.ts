import { NextRequest, NextResponse } from 'next/server'
import { zones } from '@/lib/data/mock-store'
import type { MockZone } from '@/lib/data/mock-store'

export async function GET() {
  return NextResponse.json(zones)
}

export async function POST(req: NextRequest) {
  const body: Partial<MockZone> = await req.json()
  const newZone: MockZone = {
    id: `zone-${Date.now()}`,
    name: body.name || '',
    is_active: body.is_active ?? true,
    delivery_zone_cities: body.delivery_zone_cities || [],
    delivery_zone_zip_codes: body.delivery_zone_zip_codes || [],
  }
  zones.push(newZone)
  return NextResponse.json(newZone, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const body: Partial<MockZone> & { id: string } = await req.json()
  const { id, ...fields } = body
  const idx = zones.findIndex(z => z.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  zones[idx] = { ...zones[idx], ...fields }
  return NextResponse.json(zones[idx])
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const idx = zones.findIndex(z => z.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  zones.splice(idx, 1)
  return NextResponse.json({ success: true })
}
