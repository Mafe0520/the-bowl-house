import { NextRequest, NextResponse } from 'next/server'
import { addSubscription, removeSubscription } from '@/lib/data/push-store'

export async function POST(req: NextRequest) {
  const { subscription } = await req.json()
  if (!subscription?.endpoint || !subscription?.keys) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }
  addSubscription({ endpoint: subscription.endpoint, keys: subscription.keys })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const { endpoint } = await req.json()
  if (endpoint) removeSubscription(endpoint)
  return NextResponse.json({ ok: true })
}
