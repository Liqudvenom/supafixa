import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import type { Plugin } from 'vite'

const BASE = 'https://londynek.net'
const LIST_PATH = '/jobs/view-ads'
const SECTOR_ID = 4
const USER_AGENT = 'TradeTrust-prototype/0.1 (private local test, low rate)'
const MAX_PAGES = 3
const PAGE_DELAY_MS = 3000
const COOLDOWN_MS = 10 * 60 * 1000

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

type Feed = {
  source: string
  listUrl: string
  fetchedAt: string | null
  items: FeedItem[]
}

const wait = (ms: number) => new Promise((done) => setTimeout(done, ms))

function decode(value: string) {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&pound;/g, '£')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&[lr]squo;/g, "'")
    .replace(/&[lrb]dquo;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/\s+/g, ' ')
    .trim()
}

function pick(chunk: string, pattern: RegExp) {
  const hit = pattern.exec(chunk)
  return hit ? decode(hit[1]) : ''
}

function listUrl(page: number) {
  return `${BASE}${LIST_PATH}?sector_id=${SECTOR_ID}&type_id=0&view=0&page=${page}`
}

export function parseList(html: string): FeedItem[] {
  const items: FeedItem[] = []
  for (const chunk of html.split('<div class="jd-cf-list-item jd-cf-list-item--').slice(1)) {
    const link = /<a href="([^"]*ad_id=(\d+)[^"]*)"/.exec(chunk)
    if (!link) continue
    const sector = pick(chunk, /jd-cf-list--primary-text">([\s\S]*?)<\/h3>/)
    if (sector && !/Budownictwo/i.test(sector)) continue
    items.push({
      id: link[2],
      url: new URL(link[1].replace(/&amp;/g, '&'), BASE).toString(),
      title: pick(chunk, /jd-cf-list--title">([\s\S]*?)<\/h2>/),
      location: pick(chunk, /jd-cf-list--secondary-text">([\s\S]*?)<\/h3>/),
      price: pick(chunk, /jd-cf--top-price-main">([\s\S]*?)<\/h3>/),
      added: pick(chunk, /<span>Dodano<\/span>([^<]*)/) || (chunk.includes('jd-cf--just-added') ? 'Nowo dodane' : ''),
      refreshed: pick(chunk, /<span>Od[śs]wie[żz]ono<\/span>([^<]*)/),
      tier: /^(\w+)/.exec(chunk)?.[1] ?? 'standard',
    })
  }
  return items
}

async function get(url: string) {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'text/html,text/plain' } })
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`)
  return response.text()
}

async function robotsAllow(path: string) {
  const robots = await get(`${BASE}/robots.txt`)
  let applies = false
  const rules: { allow: boolean; pattern: string }[] = []
  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, '').trim()
    const agent = /^user-agent:\s*(.+)$/i.exec(line)
    if (agent) {
      applies = agent[1].trim() === '*'
      continue
    }
    const rule = /^(allow|disallow):\s*(\S*)/i.exec(line)
    if (applies && rule?.[2]) rules.push({ allow: rule[1].toLowerCase() === 'allow', pattern: rule[2] })
  }
  const matches = (pattern: string) => {
    const source = pattern
      .replace(/[.+?^{}()|[\]\\]/g, '\\$&')
      .replace(/\*/g, '.*')
      .replace(/\\?\$$/, '$')
    return new RegExp(`^${source}`).test(path)
  }
  const winner = rules
    .filter((rule) => matches(rule.pattern))
    .sort((a, b) => b.pattern.length - a.pattern.length || Number(b.allow) - Number(a.allow))[0]
  return !winner || winner.allow
}

async function sync(): Promise<Feed> {
  if (!(await robotsAllow(LIST_PATH))) throw new Error('robots.txt disallows the job list')
  const items = new Map<string, FeedItem>()
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    if (page > 1) await wait(PAGE_DELAY_MS)
    const found = parseList(await get(listUrl(page)))
    if (!found.length) break
    for (const item of found) items.set(item.id, item)
  }
  return { source: 'londynek.net', listUrl: listUrl(1), fetchedAt: new Date().toISOString(), items: [...items.values()] }
}

export function londynekFeed(): Plugin {
  let cacheFile = ''
  let running: Promise<Feed> | null = null

  const load = async (): Promise<Feed> => {
    try {
      const feed = JSON.parse(await readFile(cacheFile, 'utf8')) as Feed
      const items = feed.items.map((item) => ({
        ...item,
        title: decode(item.title),
        location: decode(item.location),
        price: decode(item.price),
      }))
      return { ...feed, items }
    } catch {
      return { source: 'londynek.net', listUrl: listUrl(1), fetchedAt: null, items: [] }
    }
  }

  return {
    name: 'tradetrust-londynek-feed',
    apply: 'serve',
    configResolved(config) {
      cacheFile = resolve(config.root, '.cache/londynek-feed.json')
    },
    configureServer(server) {
      server.middlewares.use('/__dev/londynek', async (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(body))
        }
        try {
          const cached = await load()
          if (req.method !== 'POST') return send(200, { ...cached, cooldown: false })
          const age = cached.fetchedAt ? Date.now() - Date.parse(cached.fetchedAt) : Infinity
          if (age < COOLDOWN_MS) return send(200, { ...cached, cooldown: true })
          running ??= sync().finally(() => {
            running = null
          })
          const fresh = await running
          await mkdir(dirname(cacheFile), { recursive: true })
          await writeFile(cacheFile, JSON.stringify(fresh, null, 2))
          return send(200, { ...fresh, cooldown: false })
        } catch (error) {
          return send(502, { error: error instanceof Error ? error.message : String(error) })
        }
      })
    },
  }
}
