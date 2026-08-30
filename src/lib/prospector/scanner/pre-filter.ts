import type { SearchResult } from '../search/types'

const BLOCKED_DOMAINS = new Set([
  'yelp.com', 'yellowpages.com', 'bbb.org', 'angi.com', 'angieslist.com',
  'houzz.com', 'thumbtack.com', 'bark.com', 'homeadvisor.com',
  'wikipedia.org', 'wikihow.com', 'businessinsider.com', 'forbes.com',
  'techcrunch.com', 'entrepreneur.com', 'inc.com', 'bloomberg.com',
  'shopify.com', 'squarespace.com', 'wix.com', 'wordpress.com',
  'medium.com', 'substack.com', 'amazon.com', 'ebay.com', 'etsy.com',
  'glassdoor.com', 'indeed.com', 'ziprecruiter.com',
])

const BLOCKED_URL_PATTERNS = [
  /\/category\//i, /\/categories\//i, /\/blog\/\d{4}\//i, /\/tag\//i,
  /\/author\//i, /\/page\/\d+/i, /\/search\?/i, /\?q=/i,
]

const BLOCKED_TITLE_PATTERNS = [
  /\b(top \d+|best \d+|\d+ best|\d+ top)\b/i,
  /\b(review|reviews|ranking|guide|tutorial|how to make money)\b/i,
  /\b(breaking news|press release|announces|launches)\b/i,
  /\b(for sale|buy now|shop now|discount|% off)\b/i,
]

export interface PreFilterResult<T extends SearchResult = SearchResult> {
  kept:      T[]
  discarded: number
  reasons:   Record<string, number>
}

export function preFilter<T extends SearchResult>(
  results: T[],
  existingUrls: Set<string>
): PreFilterResult<T> {
  const reasons: Record<string, number> = {
    duplicate: 0, blocked_domain: 0, blocked_url: 0,
    blocked_title: 0, no_snippet: 0, snippet_short: 0,
  }
  const kept: T[] = []
  const seenUrls  = new Set<string>()

  for (const r of results) {
    if (existingUrls.has(r.url) || seenUrls.has(r.url)) { reasons.duplicate++; continue }
    if (BLOCKED_DOMAINS.has(r.domain)) { reasons.blocked_domain++; continue }
    if (BLOCKED_URL_PATTERNS.some(p => p.test(r.url))) { reasons.blocked_url++; continue }
    if (r.title && BLOCKED_TITLE_PATTERNS.some(p => p.test(r.title))) { reasons.blocked_title++; continue }
    if (!r.snippet) { reasons.no_snippet++; continue }
    if (r.snippet.length < 40) { reasons.snippet_short++; continue }

    seenUrls.add(r.url)
    kept.push(r)
  }

  return { kept, discarded: results.length - kept.length, reasons }
}
