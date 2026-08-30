import type { SearchProvider, SearchResult } from './types'
import { extractDomain } from './types'

interface SerperOrganic {
  title:    string
  link:     string
  snippet?: string
  date?:    string
  position: number
}

export class SerperProvider implements SearchProvider {
  constructor(private apiKey: string) {}

  async search(query: string, numResults = 10): Promise<SearchResult[]> {
    const res = await fetch('https://google.serper.dev/search', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY':    this.apiKey,
      },
      body: JSON.stringify({ q: query, num: numResults, gl: 'us' }),
    })

    if (!res.ok) throw new Error(`Serper error ${res.status}`)

    const data = await res.json() as { organic?: SerperOrganic[] }

    return (data.organic ?? []).map(r => ({
      url:      r.link,
      title:    r.title,
      snippet:  r.snippet ?? '',
      date:     r.date,
      position: r.position,
      domain:   extractDomain(r.link),
    }))
  }
}
