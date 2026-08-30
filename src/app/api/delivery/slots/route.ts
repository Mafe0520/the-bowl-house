import { NextRequest, NextResponse } from 'next/server'
import { getSlotsForDate, calcSlotCapacity } from '@/lib/data/mock-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateId = searchParams.get('date_id')
  const zoneId = searchParams.get('zone_id') || null

  if (!dateId) return NextResponse.json({ slots: [] })

  const dateSlots = getSlotsForDate(dateId)

  const results = dateSlots.map(slot => {
    const avail = calcSlotCapacity(slot.id, zoneId)
    return {
      slot,
      available: avail.available,
      currentCount: avail.current,
      capacity: avail.capacity,
      zonesPresent: avail.zonesPresent,
      reason: avail.available ? undefined : 'Slot full',
    }
  })

  return NextResponse.json({ slots: results })
}
