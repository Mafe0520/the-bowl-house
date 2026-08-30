import type { SearchResult } from './types'

const APIFY_TOKEN = process.env.APIFY_API_KEY!
const BASE = 'https://api.apify.com/v2'

async function runActor(actorId: string, input: Record<string, unknown>): Promise<unknown[]> {
  const slug = actorId.replace('/', '~')
  const runRes = await fetch(`${BASE}/acts/${slug}/run-sync-get-dataset-items?token=${APIFY_TOKEN}&timeout=60`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!runRes.ok) throw new Error(`Apify actor ${actorId} failed: ${runRes.status}`)
  return runRes.json()
}

export async function searchInstagramHashtags(hashtags: string[], limit = 20): Promise<SearchResult[]> {
  const items = await runActor('apify/instagram-scraper', {
    directUrls: hashtags.map(h => `https://www.instagram.com/explore/tags/${h}/`),
    resultsType: 'posts',
    resultsLimit: limit,
  }) as Array<{
    id?: string
    url?: string
    caption?: string
    ownerUsername?: string
    ownerFullName?: string
    locationName?: string
    timestamp?: string
    type?: string
  }>

  return items
    .filter(item => item.caption && item.url)
    .map(item => ({
      title: String(`@${item.ownerUsername || 'unknown'} — Instagram`).slice(0, 200),
      snippet: String(item.caption || '').slice(0, 300),
      url: String(item.url || `https://instagram.com/p/${item.id}`),
      domain: 'instagram.com',
      date: item.timestamp ? String(item.timestamp) : null,
    }))
}

export async function searchFacebookGroups(queries: string[], limit = 20): Promise<SearchResult[]> {
  const items = await runActor('apify/facebook-groups-scraper', {
    startUrls: [],
    searchTerms: queries,
    maxPosts: limit,
  }) as Array<{
    postUrl?: string
    text?: string
    authorName?: string
    time?: string
  }>

  return items
    .filter(item => item.text && item.postUrl)
    .map(item => ({
      title: `${item.authorName || 'Facebook user'} — Facebook Groups`,
      snippet: (item.text || '').slice(0, 300),
      url: item.postUrl || '',
      domain: 'facebook.com',
      date: item.time || null,
    }))
}
