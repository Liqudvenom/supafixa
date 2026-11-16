import { TODAY, readPost } from './importer'
import type { PostDraft } from './importer'
import type { Kind } from './types'

export const SUPAFIXA_OFFERS_URL = 'https://supafixa.com/oferty/'

export type OfferItem = {
  id: string
  url: string
  trade: string
  location: string
  price: string
  notes: string
  line: string
}

export type OfferFeed = {
  source: string
  listUrl: string
  fetchedAt: string | null
  updated: string
  items: OfferItem[]
  cooldown?: boolean
  error?: string
}

function offerText(item: OfferItem) {
  return [item.trade, item.line, item.location, item.price, item.url].filter(Boolean).join('\n')
}

export function offerDraft(
  item: OfferItem,
  marker: string,
  summary: string,
  titleFor: (kind: Kind, trade: string) => string,
): PostDraft {
  const draft = readPost(offerText(item), marker, titleFor)
  const title = [item.trade, item.location].filter(Boolean).join(' · ')
  return {
    ...draft,
    kind: 'job',
    title: title || titleFor('job', draft.trade),
    summary: `${summary}\n\n${item.line}`,
    contactsRemoved: 0,
    sourceUrl: item.url,
    postedHours: 6,
    start: draft.start || TODAY,
  }
}

export async function loadSupafixaFeed(): Promise<OfferFeed> {
  const paths = import.meta.env.DEV
    ? ['/__dev/supafixa']
    : [`${import.meta.env.BASE_URL}supafixa-feed.json`]
  let last = 'No feed'
  for (const path of paths) {
    try {
      const response = await fetch(path)
      const body = (await response.json()) as OfferFeed
      if (!response.ok) throw new Error(body.error ?? `HTTP ${response.status}`)
      return body
    } catch (error) {
      last = error instanceof Error ? error.message : String(error)
    }
  }
  throw new Error(last)
}
