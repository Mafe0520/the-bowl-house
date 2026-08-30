import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const allowed: Record<string, unknown> = {}
  if (body.status !== undefined) allowed.status = body.status
  if (body.notes  !== undefined) allowed.notes  = body.notes

  if (!Object.keys(allowed).length) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const db = await createServiceClient()
  const { error } = await db.from('prospector_prospects').update(allowed).eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
