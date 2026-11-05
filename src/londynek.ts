import { TODAY, readPost, stripContacts } from './importer'
import { fold } from './model'
import type { PostDraft } from './importer'
import type { Kind } from './types'

export const LONDYNEK_CONSTRUCTION_URL = 'https://londynek.net/jobs/view-ads?sector_id=4&type_id=0'

export type FeedItem = {
  id: string
  url: string
  title: string
  location: string
  price: string
  added: string
  refreshed: string
  tier: string
}

export type Feed = {
  source: string
  listUrl: string
  fetchedAt: string | null
  items: FeedItem[]
  cooldown?: boolean
  error?: string
}

const MONTHS = ['stycz', 'lut', 'marc', 'kwiet', 'maj', 'czerw', 'lip', 'sierp', 'wrze', 'pazdz', 'listop', 'grud']

export function agoHours(label: string) {
  const text = fold(label)
  if (!text || text.includes('nowo')) return 6
  if (text.includes('wczoraj')) return 24
  const count = /(\d+)\s*(min|godz|dni|dzien|tyg|miesi|lat|rok)/.exec(text)
  if (count) {
    const n = Number(count[1])
    const unit = count[2]
    if (unit === 'min') return 1
    if (unit === 'godz') return n
    if (unit === 'tyg') return n * 168
    if (unit === 'miesi') return n * 720
    if (unit === 'lat' || unit === 'rok') return n * 8760
    return n * 24
  }
  if (/\brok\b/.test(text)) return 8760
  const date = /(\d{1,2})\s+([a-z]+)/.exec(text)
  const month = date ? MONTHS.findIndex((prefix) => date[2].startsWith(prefix)) : -1
  if (date && month >= 0) {
    const today = Date.parse(`${TODAY}T12:00:00Z`)
    const year = month > 10 ? 2025 : 2026
    const posted = Date.UTC(year, month, Number(date[1]), 12)
    return Math.max(1, Math.round((today - posted) / 3_600_000))
  }
  return 72
}

function tidyTitle(raw: string, marker: string) {
  const title = stripContacts(raw.replace(/[*!]{2,}/g, ' '), marker).text.replace(/\s+/g, ' ').trim()
  const letters = title.replace(/[^\p{L}]/gu, '')
  if (letters.length > 6 && letters === letters.toUpperCase()) {
    const lower = title.toLocaleLowerCase('pl')
    return lower.charAt(0).toLocaleUpperCase('pl') + lower.slice(1)
  }
  return title
}

export function feedText(item: FeedItem) {
  return [item.title, item.location, item.price, item.url].filter(Boolean).join('\n')
}

export function feedDraft(
  item: FeedItem,
  marker: string,
  summary: string,
  titleFor: (kind: Kind, trade: string) => string,
): PostDraft {
  const draft = readPost(feedText(item), marker, titleFor)
  return {
    ...draft,
    kind: 'job',
    title: tidyTitle(item.title, marker) || titleFor('job', draft.trade),
    summary: `${summary}\n\n${[item.location, item.price].filter(Boolean).join(' · ')}`,
    contactsRemoved: 0,
    sourceUrl: item.url,
    postedHours: agoHours(item.refreshed || item.added),
  }
}

export async function loadFeed(sync: boolean): Promise<Feed> {
  const response = await fetch('/__dev/londynek', { method: sync ? 'POST' : 'GET' })
  const body = (await response.json()) as Feed
  if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
  return body
}
