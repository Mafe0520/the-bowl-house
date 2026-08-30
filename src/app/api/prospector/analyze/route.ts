import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { analyzeBatch } from '@/lib/prospector/analysis/analyze'

export async function POST() {
  const db = await createServiceClient()

  const { data: rows } = await db
    .from('prospector_prospects')
    .select('id, title, snippet, source_url, source_domain, source_bonus')
    .eq('analyzed', false)
    .limit(15)

  if (!rows?.length) {
    return NextResponse.json({ message: 'No hay leads sin analizar' })
  }

  const results = await analyzeBatch(rows as any)
  let updated = 0

  for (const { id, result } of results) {
    if (!result) continue
    await db.from('prospector_prospects').update(result).eq('id', id)
    updated++
  }

  return NextResponse.json({
    message: `${updated} de ${rows.length} leads analizados`,
  })
}
