import { NextRequest, NextResponse } from 'next/server'
import { validateZone } from '@/lib/data/mock-store'

export async function POST(req: NextRequest) {
  const { city, zip_code } = await req.json()
  const zone = validateZone(city || '', zip_code || '')

  if (!zone) {
    return NextResponse.json({ valid: false })
  }

  return NextResponse.json({ valid: true, zone_id: zone.id, zone_name: zone.name })
}
