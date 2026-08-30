import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { generateApproach } from '@/lib/prospector/analysis/analyze'
import type { Prospect } from '@/lib/prospector/types'

export async function POST(req: NextRequest) {
  const { prospectId } = await req.json()
  if (!prospectId) return NextResponse.json({ error: 'prospectId requerido' }, { status: 400 })

  const db = await createServiceClient()
  const { data } = await db.from('prospector_prospects').select('*').eq('id', prospectId).single()
  if (!data) return NextResponse.json({ error: 'Lead no encontrado' }, { status: 404 })

  const approach = await generateApproach(data as Prospect)
  return NextResponse.json({ approach })
}
