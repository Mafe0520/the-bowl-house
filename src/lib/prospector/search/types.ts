export interface SearchResult {
  url:      string
  title:    string
  snippet:  string
  date?:    string
  position: number
  domain:   string
}

export interface SearchProvider {
  search(query: string, numResults?: number): Promise<SearchResult[]>
}

export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
