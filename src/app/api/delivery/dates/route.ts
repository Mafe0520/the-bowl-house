import { NextResponse } from 'next/server'
import { dates, settings } from '@/lib/data/mock-store'

export async function GET() {
  const today = new Date().toISOString().split('T')[0]
  const activeDates = dates.filter(
    d => d.is_active && d.accepting_orders && d.date >= today
  )

  return NextResponse.json({
    dates: activeDates,
    delivery_fee: settings.delivery_fee || '3.00',
  })
}
