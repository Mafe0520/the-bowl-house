import { DeliverySlot, DeliveryZone, SlotAvailability } from '@/types'

interface OrderInSlot {
  delivery_zone_id: string | null
  zip_code: string | null
  city: string | null
}

interface CapacityRules {
  sameZone: number
  twoZones: number
  threePlusZones: number
}

export function calcSlotAvailability(
  slot: DeliverySlot,
  existingOrders: OrderInSlot[],
  reservations: { delivery_zone_id: string | null }[],
  incomingZoneId: string | null,
  rules: CapacityRules
): SlotAvailability {
  if (slot.is_manually_closed) {
    return { slot, available: false, reason: 'Slot closed', currentCount: existingOrders.length, capacity: 0, zonesPresent: 0 }
  }

  // Combine real orders + active reservations
  const allZoneIds = [
    ...existingOrders.map(o => o.delivery_zone_id).filter(Boolean),
    ...reservations.map(r => r.delivery_zone_id).filter(Boolean),
  ] as string[]

  // Simulate adding the new order
  const hypotheticalZones = incomingZoneId
    ? [...allZoneIds, incomingZoneId]
    : allZoneIds

  const uniqueZones = new Set(hypotheticalZones.filter(Boolean))
  const zoneCount = uniqueZones.size

  let capacity: number
  if (zoneCount <= 1) capacity = rules.sameZone
  else if (zoneCount === 2) capacity = rules.twoZones
  else capacity = rules.threePlusZones

  const currentCount = allZoneIds.length
  const available = currentCount < capacity

  return {
    slot,
    available,
    currentCount,
    capacity,
    zonesPresent: zoneCount,
  }
}

export function resolveZoneFromAddress(
  city: string,
  zipCode: string,
  zones: DeliveryZone[]
): DeliveryZone | null {
  const normalCity = city.trim().toLowerCase()
  const normalZip = zipCode.trim()

  for (const zone of zones) {
    const zipMatch = zone.zip_codes?.some(z => z.zip_code === normalZip)
    if (zipMatch) return zone
    const cityMatch = zone.cities?.some(c => c.city.toLowerCase() === normalCity)
    if (cityMatch) return zone
  }

  return null
}

export function formatTime(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour = h % 12 || 12
  return m === 0 ? `${hour}:00 ${period}` : `${hour}:${m.toString().padStart(2, '0')} ${period}`
}

export function formatSlot(slot: DeliverySlot): string {
  return `${formatTime(slot.start_time)} – ${formatTime(slot.end_time)}`
}
