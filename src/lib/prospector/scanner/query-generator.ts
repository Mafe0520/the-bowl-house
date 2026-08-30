import { createServiceClient } from '@/lib/supabase/server'
import type { ProspectorSource, SearchConfigItem } from '../types'

export interface GeneratedQuery {
  query:        string
  sourceId:     string
  sourceDomain: string
  siteFilter:   string
  sourceBonus:  number
  language:     string
}

const EN_LOCATIONS = ['USA', 'Florida', 'Texas', 'California', 'New York', 'Miami', 'Chicago', 'Houston', 'Atlanta']
const ES_LOCATIONS = ['México', 'Colombia', 'Venezuela', 'Chile', 'Argentina', 'Perú', 'Ecuador', 'Guatemala', 'Costa Rica', 'Miami']

const shuffle = <T>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5)

export async function generateQueries(maxQueries = 30): Promise<GeneratedQuery[]> {
  const db = await createServiceClient()

  const [{ data: sources }, { data: configs }] = await Promise.all([
    db.from('prospector_sources').select('*').eq('is_active', true),
    db.from('prospector_search_config').select('*').eq('is_active', true),
  ])

  if (!sources?.length || !configs?.length) return []

  const allConfigs  = configs as SearchConfigItem[]
  const intentions  = allConfigs.filter(c => c.config_type === 'keyword_intention')
  const industries  = allConfigs.filter(c => c.config_type === 'industry')

  const queries: GeneratedQuery[] = []

  for (const source of shuffle(sources as ProspectorSource[])) {
    for (const intent of shuffle(intentions)) {
      if (queries.length >= maxQueries) break

      const isEs = intent.language === 'es'

      const industry = shuffle(industries.filter(
        i => i.language === 'both' || i.language === intent.language
      ))[0]

      const hasSiteFilter = Boolean(source.site_filter)
      const location = shuffle(isEs ? ES_LOCATIONS : EN_LOCATIONS)[0]

      const now = new Date()
      const monthsAgo3 = new Date(now); monthsAgo3.setMonth(now.getMonth() - 3)
      const monthsAgo2 = new Date(now); monthsAgo2.setMonth(now.getMonth() - 2)
      const after  = monthsAgo3.toISOString().split('T')[0]
      const before = monthsAgo2.toISOString().split('T')[0]

      const parts = [
        source.site_filter || '',
        hasSiteFilter ? '' : location,
        industry ? `"${industry.text}"` : '',
        `"${intent.text}"`,
        `after:${after} before:${before}`,
      ].filter(Boolean)

      queries.push({
        query:        parts.join(' '),
        sourceId:     source.id,
        sourceDomain: source.domain,
        siteFilter:   source.site_filter,
        sourceBonus:  source.source_bonus,
        language:     isEs ? 'es' : 'en',
      })
    }
    if (queries.length >= maxQueries) break
  }

  return queries.slice(0, maxQueries)
}
