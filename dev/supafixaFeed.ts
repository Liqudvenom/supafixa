import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const PAGE_URL = 'https://supafixa.com/oferty/'
const USER_AGENT = 'TradeTrust-prototype/0.1 (Supafixa oferty, low rate)'
const COOLDOWN_MS = 10 * 60 * 1000

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
}

function decode(value: string) {
  return value
    .replace(/&pound;/g, '£')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

function splitLine(raw: string) {
  const line = decode(raw).replace(/^[–—-]\s*/, '').trim()
  if (!line || /brak ofert/i.test(line) || /nic nie znalazles/i.test(line)) return null
  const pay = /(min\s*)?£[\s\S]*?(?=\s*\(|\s+start\b|$)/i.exec(line)
  const location = (pay ? line.slice(0, pay.index) : line).replace(/\s+/g, ' ').trim()
  const price = pay ? pay[0].replace(/\s+/g, ' ').trim() : ''
  const notes = (pay ? line.slice(pay.index + pay[0].length) : '')
    .replace(/^\s*\(|\)$/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return { line, location: location || line, price, notes }
}

export function parseOffers(html: string): { updated: string; items: OfferItem[] } {
  const updated = decode(/oferty byly aktualizowane\s*([^\]<]+)/i.exec(html)?.[1] ?? '')
  const start = html.search(/<strong>\s*POMOCNIK/i)
  const end = html.search(/Jesli jestes zainteresowany/i)
  const slice = html.slice(start >= 0 ? start : 0, end > start ? end : undefined)
  const items: OfferItem[] = []
  const seen = new Set<string>()
  for (const match of slice.matchAll(/<strong>([^<]+)<\/strong>([\s\S]*?)(?=<strong>|$)/gi)) {
    const trade = decode(match[1])
    if (!trade || trade.length > 48) continue
    const body = match[2].replace(/<br\s*\/?>/gi, '\n')
    for (const row of body.split('\n')) {
      const parsed = splitLine(row)
      if (!parsed) continue
      const id = slug(`${trade}-${parsed.location}-${parsed.price}`) || `sf-${items.length + 1}`
      if (seen.has(id)) continue
      seen.add(id)
      items.push({
        id,
        url: `${PAGE_URL}#${id}`,
        trade,
        location: parsed.location,
        price: parsed.price,
        notes: parsed.notes,
        line: parsed.line,
      })
    }
  }
  return { updated, items }
}

async function sync(): Promise<OfferFeed> {
  const response = await fetch(PAGE_URL, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html' } })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${PAGE_URL}`)
  const { updated, items } = parseOffers(await response.text())
  return { source: 'supafixa.com', listUrl: PAGE_URL, fetchedAt: new Date().toISOString(), updated, items }
}

export function supafixaFeed(): Plugin {
  let cacheFile = ''
  let running: Promise<OfferFeed> | null = null

  const load = async (): Promise<OfferFeed> => {
    try {
      return JSON.parse(await readFile(cacheFile, 'utf8')) as OfferFeed
    } catch {
      return { source: 'supafixa.com', listUrl: PAGE_URL, fetchedAt: null, updated: '', items: [] }
    }
  }

  const fresh = async () => {
    running ??= sync().finally(() => {
      running = null
    })
    const feed = await running
    await mkdir(dirname(cacheFile), { recursive: true })
    await writeFile(cacheFile, JSON.stringify(feed, null, 2))
    return feed
  }

  const sendFeed = async (req: { method?: string }, res: { statusCode: number; setHeader: (k: string, v: string) => void; end: (s: string) => void }) => {
    const send = (status: number, body: unknown) => {
      res.statusCode = status
      res.setHeader('Content-Type', 'application/json; charset=utf-8')
      res.end(JSON.stringify(body))
    }
    try {
      const cached = await load()
      if (req.method !== 'POST') {
        return send(200, cached.items.length ? cached : await fresh())
      }
      const age = cached.fetchedAt ? Date.now() - Date.parse(cached.fetchedAt) : Infinity
      if (age < COOLDOWN_MS) return send(200, { ...cached, cooldown: true })
      return send(200, await fresh())
    } catch (error) {
      return send(502, { error: error instanceof Error ? error.message : String(error) })
    }
  }

  return {
    name: 'tradetrust-supafixa-feed',
    configResolved(config) {
      cacheFile = resolve(config.root, '.cache/supafixa-feed.json')
    },
    configureServer(server) {
      server.middlewares.use('/__dev/supafixa', (req, res) => {
        void sendFeed(req, res)
      })
    },
    async generateBundle() {
      try {
        const feed = await sync()
        this.emitFile({ type: 'asset', fileName: 'supafixa-feed.json', source: JSON.stringify(feed) })
      } catch {
        this.emitFile({
          type: 'asset',
          fileName: 'supafixa-feed.json',
          source: JSON.stringify({ source: 'supafixa.com', listUrl: PAGE_URL, fetchedAt: null, updated: '', items: [] }),
        })
      }
    },
  }
}
