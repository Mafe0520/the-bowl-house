import { NextRequest, NextResponse } from 'next/server'
import { orders } from '@/lib/data/mock-store'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const dateId = searchParams.get('date_id')

  const filtered = orders.filter(
    o => o.order_status !== 'cancelled' && (!dateId || o.delivery_date_id === dateId)
  )

  const stats = {
    total_orders: filtered.length,
    total_bowls: filtered.reduce((sum, o) => {
      const items = o.order_items || o.items || []
      return sum + items.reduce((s2, i) => s2 + (i.quantity || 0), 0)
    }, 0),
    revenue: filtered.reduce((sum, o) => sum + o.total, 0),
    paid: filtered.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
    zelle_pending: filtered.filter(o => o.payment_method === 'zelle' && o.payment_status === 'payment_due').length,
    cash_pending: filtered.filter(o => o.payment_method === 'cash' && o.payment_status === 'payment_due').length,
    delivery: filtered.filter(o => o.fulfillment_type === 'delivery').length,
    pickup: filtered.filter(o => o.fulfillment_type === 'pickup').length,
    delivered: filtered.filter(o => ['delivered', 'picked_up'].includes(o.order_status)).length,
    remaining: filtered.filter(o => !['delivered', 'picked_up', 'cancelled'].includes(o.order_status)).length,
    collected: filtered.filter(o => o.payment_status === 'paid').reduce((sum, o) => sum + o.total, 0),
    still_to_collect: filtered.filter(o => o.payment_status !== 'paid').reduce((sum, o) => sum + o.total, 0),
  }

  return NextResponse.json(stats)
}
