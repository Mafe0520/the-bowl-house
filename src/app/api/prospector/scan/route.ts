import { NextResponse } from 'next/server'
import { runScan } from '@/lib/prospector/scanner/scanner'

export async function POST() {
  try {
    const stats = await runScan(20)
    return NextResponse.json({
      message: `Escaneo completo: ${stats.savedCount} leads guardados (${stats.resultsFetched} encontrados, ${stats.preFilteredOut} filtrados)`,
      stats,
    })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
