import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { sendLeadNotification } from '@/lib/prospector/telegram'
import type { ContactLead } from '@/lib/prospector/types'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, phone, email, business_name, what_sells, current_methods, wants_to_improve, more_info } = body

  if (!name || !what_sells) {
    return NextResponse.json({ error: 'Nombre y "qué vendes" son obligatorios' }, { status: 400 })
  }

  const db = await createServiceClient()
  const { data, error } = await db
    .from('prospector_contact_leads')
    .insert({ name, phone, email, business_name, what_sells, current_methods, wants_to_improve, more_info })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Non-blocking Telegram notification
  sendLeadNotification(data as ContactLead)

  return NextResponse.json({ ok: true })
}
