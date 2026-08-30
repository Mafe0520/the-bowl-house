import { createServiceClient } from '@/lib/supabase/server'
import { SerperProvider }      from '../search/serper'
import { generateQueries }     from './query-generator'
import { preFilter }           from './pre-filter'
import type { SearchResult }   from '../search/types'

interface ScanResult {
  queriesGenerated: number
  resultsFetched:   number
  preFilteredOut:   number
  savedCount:       number
  errors:           string[]
}

export async function runScan(maxQueries = 30): Promise<ScanResult> {
  const db       = await createServiceClient()
  const provider = new SerperProvider(process.env.SERPER_API_KEY!)

  const { data: runRow } = await db
    .from('prospector_scan_runs')
    .insert({ queries_generated: 0 })
    .select('id')
    .single()
  const runId = runRow?.id

  const stats: ScanResult = {
    queriesGenerated: 0, resultsFetched: 0,
    preFilteredOut: 0,  savedCount: 0, errors: [],
  }

  try {
    const queries = await generateQueries(maxQueries)
    stats.queriesGenerated = queries.length
    if (!queries.length) return stats

    const { data: existing } = await db.from('prospector_prospects').select('source_url')
    const existingUrls = new Set<string>(
      (existing ?? []).map((r: { source_url: string }) => r.source_url)
    )

    const allResults: Array<SearchResult & { sourceBonus: number; sourceDomain: string }> = []

    for (const q of queries) {
      try {
        const results = await provider.search(q.query, 10)
        stats.resultsFetched += results.length
        allResults.push(...results.map(r => ({
          ...r,
          sourceBonus:  q.sourceBonus,
          sourceDomain: r.domain || q.sourceDomain,
        })))
      } catch (err) {
        stats.errors.push(`"${q.query}": ${(err as Error).message}`)
      }
    }

    const { kept, discarded } = preFilter(allResults, existingUrls)
    stats.preFilteredOut = discarded

    if (kept.length > 0) {
      const rows = kept.map(r => ({
        source_type:    'serper',
        source_domain:  r.sourceDomain,
        source_url:     r.url,
        title:          r.title,
        snippet:        r.snippet,
        full_text:      null,
        published_date: r.date ? (() => { try { return new Date(r.date!).toISOString() } catch { return null } })() : null,
        author_name:    null,
        author_url:     null,
        analyzed:       false,
        status:         'new',
        source_bonus:   r.sourceBonus ?? 0,
      }))

      const CHUNK = 50
      for (let i = 0; i < rows.length; i += CHUNK) {
        const { error } = await db
          .from('prospector_prospects')
          .upsert(rows.slice(i, i + CHUNK), { onConflict: 'source_url', ignoreDuplicates: true })
        if (!error) stats.savedCount += Math.min(CHUNK, rows.length - i)
      }
    }

    if (runId) {
      await db.from('prospector_scan_runs').update({
        queries_generated: stats.queriesGenerated,
        results_fetched:   stats.resultsFetched,
        pre_filtered_out:  stats.preFilteredOut,
        saved_count:       stats.savedCount,
        error:             stats.errors.length ? stats.errors.join('; ') : null,
        completed_at:      new Date().toISOString(),
      }).eq('id', runId)
    }
  } catch (err) {
    if (runId) {
      await db.from('prospector_scan_runs').update({
        error: (err as Error).message, completed_at: new Date().toISOString(),
      }).eq('id', runId)
    }
    throw err
  }

  return stats
}
