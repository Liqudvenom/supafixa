import { fold } from './model'
import { PLACES, placeByPostcode, placeByRegion } from './places'
import type { Place } from './places'
import type { Engagement, Kind, MarketplaceRecord } from './types'

export const TODAY = '2026-11-04'

export type PayUnit = 'day' | 'hour' | 'negotiable'

export type PostDraft = {
  kind: Kind
  title: string
  trade: string
  place: string
  payAmount: number | null
  payMax: number | null
  payUnit: PayUnit
  start: string
  duration: string
  urgent: boolean
  engagement: Engagement
  summary: string
  experience: string
  languages: string[]
  certifications: string[]
  contactsRemoved: number
  sourceUrl: string
  postedHours?: number
}

export const SOURCES = [{ name: 'londynek.net', host: /(^|\.)londynek\.net$/ }]

export function sourceOf(url: string) {
  try {
    const parsed = new URL(url)
    if (!/^https?:$/.test(parsed.protocol)) return null
    const known = SOURCES.find((source) => source.host.test(parsed.hostname))
    return { name: known?.name ?? parsed.hostname.replace(/^www\./, ''), url: parsed.toString() }
  } catch {
    return null
  }
}

const TRADE_KEYS: [string, string[]][] = [
  ['Drylining', ['regips', 'karton gips', 'karton-gips', 'suche zabudow', 'dryline', 'drylin', 'plyt gk', 'plyty gk']],
  ['Plumbing', ['hydraulik', 'plumb', 'instalacj wod']],
  ['Electrical', ['elektryk', 'electric', 'sparky']],
  ['Painting & decorating', ['malarz', 'malark', 'malowan', 'painter', 'decorat', 'dekorat']],
  ['Tiling', ['glazurni', 'plytk', 'kafelk', 'kafelkarz', 'tiler', 'tiling']],
  ['Plastering', ['tynk', 'gladz', 'plaster', 'skim']],
  ['Roofing', ['dekarz', 'dekarsk', 'dachu', 'dachy', 'roof']],
  ['Groundworks', ['ziemn', 'wykop', 'groundwork', 'drenaz', 'kanalizac']],
  ['Cleaning', ['sprzata', 'clean']],
  ['Transport', ['kierowc', 'driver', 'transport', 'przeprowadz', 'z busem', 'busem']],
  ['Carpentry', ['stolarz', 'stolark', 'ciesl', 'carpent', 'joiner']],
  ['Brickwork', ['murarz', 'murowan', 'bricklay', 'brickwork', 'cegl']],
  ['Renovation', ['remont', 'wykonczen', 'renovat', 'refurb', 'ekipa', 'ekipe']],
  ['Labour', ['pomocnik', 'pomocnic', 'labour', 'labor', 'pomoc na budow', 'pomocy na budow', 'general builder']],
  ['Construction', ['ogolnobudowl', 'budowlaniec', 'handyman', 'multi trad', 'multitrad', 'kierownik budowy', 'site manager']],
]

const WORKER_CUES = [
  'szukam pracy',
  'szukam zlecen',
  'szukam zlecenia',
  'przyjme zlecen',
  'przyjme prace',
  'wolne terminy',
  'jestem ',
  'mam doswiadczenie',
  'looking for work',
  'available for work',
  "i'm a ",
  'i am a ',
]

const COMPANY_CUES = ['podwykonawc', 'subcontractor', 'nasza firma', 'firma szuka', 'firma zatrudni', 'we are a company']

const URGENT_CUES = ['pilnie', 'pilne', 'pilny', 'od zaraz', 'na juz', 'na wczoraj', 'asap', 'urgent', 'od dzis', 'dzisiaj']

const WEEKDAYS: [string[], number][] = [
  [['niedziel', 'sunday'], 0],
  [['poniedzial', 'monday'], 1],
  [['wtor', 'tuesday'], 2],
  [['srod', 'wednesday'], 3],
  [['czwart', 'thursday'], 4],
  [['piat', 'friday'], 5],
  [['sobot', 'saturday'], 6],
]

function addDays(iso: string, days: number) {
  const [y, m, d] = iso.split('-').map(Number)
  const date = new Date(Date.UTC(y, m - 1, d + days))
  return date.toISOString().slice(0, 10)
}

function weekday(iso: string) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay()
}

export function stripContacts(text: string, marker: string) {
  let removed = 0
  const swap = () => {
    removed += 1
    return marker
  }
  const cleaned = text
    .replace(/https?:\/\/\S+|www\.\S+/gi, swap)
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, swap)
    .replace(/(?:\+|00)?\s?44\s?\(?0?\)?\s?7\d{3}[\s.-]?\d{3}[\s.-]?\d{3}/g, swap)
    .replace(/\b0\s?7\d{3}[\s.-]?\d{3}[\s.-]?\d{3}\b/g, swap)
    .replace(/\b\d[\d\s-]{8,}\d\b/g, swap)
  return { text: cleaned.replace(/[ \t]{2,}/g, ' ').trim(), removed }
}

function earliest(folded: string, keys: [string, string[]][]) {
  let best: { value: string; at: number } | null = null
  for (const [value, words] of keys) {
    for (const word of words) {
      const at = folded.indexOf(word)
      if (at >= 0 && (!best || at < best.at)) best = { value, at }
    }
  }
  return best?.value ?? null
}

function findPlace(folded: string): Place | null {
  let best: { place: Place; at: number; length: number } | null = null
  for (const place of PLACES) {
    for (const name of [place.name, ...(place.aliases ?? [])]) {
      const key = fold(name).replace(/'/g, '')
      const match = new RegExp(`(^|[^a-z])${key.replace(/ /g, '\\s+')}`).exec(folded.replace(/'/g, ''))
      if (!match) continue
      const at = match.index
      if (!best || at < best.at || (at === best.at && key.length > best.length)) {
        best = { place, at, length: key.length }
      }
    }
  }
  return best?.place ?? null
}

const UNIT = '(dzien|dniowk|day|godz|hr|hour|h\\b|tydz|week|miesi|month|rok|year|annum)?'

function findPay(text: string): { amount: number; max: number | null; unit: PayUnit } | null {
  const folded = fold(text).replace(/(\d),(\d{3})\b/g, '$1$2')
  const pound = new RegExp(
    `£\\s?(\\d{2,6})(?:[.,]\\d{1,2})?(?:\\s?(?:-|–|—|do)\\s?£?\\s?(\\d{2,6}))?(?:[.,]\\d{1,2})?\\s*(?:\\/|za|na|per)?\\s*${UNIT}`,
  )
  const trailing = new RegExp(`\\b(\\d{2,4})\\s?(?:£|funt\\w*|gbp)\\s*(?:\\/|za|na|per)?\\s*${UNIT}`)

  let amount: number
  let max: number | null = null
  let unitRaw = ''
  const byPound = pound.exec(folded)
  if (byPound) {
    amount = Number(byPound[1])
    max = byPound[2] ? Number(byPound[2]) : null
    unitRaw = byPound[3] ?? ''
  } else {
    const byWord = trailing.exec(folded)
    if (!byWord) return null
    amount = Number(byWord[1])
    unitRaw = byWord[2] ?? ''
  }

  const perDay = (days: number) => ({
    amount: Math.round(amount / days),
    max: max ? Math.round(max / days) : null,
    unit: 'day' as const,
  })
  if (/tydz|week/.test(unitRaw)) return perDay(5)
  if (/miesi|month/.test(unitRaw)) return perDay(21.7)
  if (/rok|year|annum/.test(unitRaw)) return perDay(260)
  const hourly = /godz|hr|hour|^h$/.test(unitRaw) || (!unitRaw && amount < 60)
  return { amount, max, unit: hourly ? 'hour' : 'day' }
}

function findStart(folded: string) {
  if (/(od zaraz|od dzis|dzisiaj|\basap\b|\btoday\b|na juz)/.test(folded)) return TODAY
  if (/(od jutra|\bjutro\b|tomorrow)/.test(folded)) return addDays(TODAY, 1)
  const date = folded.match(/\b(\d{1,2})[./](\d{1,2})(?:[./](\d{2,4}))?\b/)
  if (date) {
    const day = Number(date[1])
    const month = Number(date[2])
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12) {
      const year = date[3] ? (date[3].length === 2 ? 2000 + Number(date[3]) : Number(date[3])) : month < 11 ? 2027 : 2026
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    }
  }
  for (const [words, target] of WEEKDAYS) {
    if (words.some((word) => folded.includes(word))) {
      const diff = (target - weekday(TODAY) + 7) % 7 || 7
      return addDays(TODAY, diff)
    }
  }
  return TODAY
}

function findDuration(folded: string) {
  if (/(na stale|stala wspolprac|stalej wspolprac|long[- ]term|dlugoterm|na dluzej)/.test(folded)) {
    return 'Long-term cooperation'
  }
  const hit = folded.match(/(\d+)\s*(dni|dzien|dnia|days?|tydz\w*|tygodn\w*|weeks?|miesi\w*|months?)/)
  if (hit) {
    const n = Number(hit[1])
    const unit = hit[2]
    if (/^(tydz|tygod|week)/.test(unit)) return `${n} ${n === 1 ? 'week' : 'weeks'}`
    if (/^(miesi|month)/.test(unit)) return `${n} ${n === 1 ? 'month' : 'months'}`
    return `${n} ${n === 1 ? 'day' : 'days'}`
  }
  if (/(tydzien pracy|na tydzien|one week)/.test(folded)) return '1 week'
  return 'To be agreed'
}

function findEngagement(folded: string, duration: string, unit: PayUnit): Engagement {
  if (/(podwykonaw|subcontract)/.test(folded)) return 'Subcontract'
  if (duration === 'Long-term cooperation') return 'Long-term'
  if (/(zlecenie|kontrakt|contract|za calosc|price work)/.test(folded) && unit === 'negotiable') return 'Contract'
  return 'Day rate'
}

export function readPost(raw: string, marker: string, titleFor: (kind: Kind, trade: string) => string): PostDraft {
  const sourceUrl = /https?:\/\/(?:www\.)?londynek\.net\/\S+/i.exec(raw)?.[0] ?? ''
  const { text, removed } = stripContacts(sourceUrl ? raw.replace(sourceUrl, '') : raw, marker)
  const folded = fold(raw)
  const workerish = WORKER_CUES.some((cue) => folded.includes(cue))
  const companyish = COMPANY_CUES.some((cue) => folded.includes(cue))
  const kind: Kind = workerish && !folded.includes('szukam pracownik') ? 'worker' : companyish ? 'company' : 'job'
  const trade = earliest(folded, TRADE_KEYS) ?? 'Labour'
  const place = findPlace(folded) ?? placeByPostcode(raw) ?? placeByRegion(folded)
  const pay = findPay(raw)
  const duration = findDuration(folded)
  const payUnit: PayUnit = pay ? pay.unit : 'negotiable'
  const experience = folded.match(/(\d{1,2})\s*[- ]?\s*(?:lat|letni\w*|years?|yrs)/)
  const languages = ['Polish']
  if (/(angiel|english)/.test(folded)) languages.push('English')

  return {
    kind,
    title: titleFor(kind, trade),
    trade,
    place: place?.name ?? '',
    payAmount: pay?.amount ?? null,
    payMax: pay?.max ?? null,
    payUnit,
    start: findStart(folded),
    duration,
    urgent: URGENT_CUES.some((cue) => folded.includes(cue)),
    engagement: findEngagement(folded, duration, payUnit),
    summary: text.slice(0, 600),
    experience: experience ? `${Number(experience[1])} ${Number(experience[1]) === 1 ? 'year' : 'years'}` : '',
    languages,
    certifications: /cscs/.test(folded) ? [kind === 'job' ? 'CSCS required' : 'CSCS'] : [],
    contactsRemoved: removed,
    sourceUrl,
  }
}

function payLabel(draft: PostDraft) {
  if (draft.payUnit === 'negotiable' || draft.payAmount == null) return 'Negotiable'
  const suffix = draft.payUnit === 'hour' ? '/hour' : '/day'
  if (draft.payMax && draft.payMax > draft.payAmount) return `£${draft.payAmount}–${draft.payMax}${suffix}`
  return `£${draft.payAmount}${suffix}`
}

function availability(start: string) {
  if (start <= TODAY) return 'Available today'
  if (start === addDays(TODAY, 1)) return 'Available tomorrow'
  const [, m, d] = start.split('-').map(Number)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `From ${d} ${months[m - 1]}`
}

function initials(title: string) {
  const letters = title
    .split(/\s+/)
    .filter((word) => /^\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
  return letters.join('') || 'TT'
}

export function draftToRecord(draft: PostDraft, place: Place, seq: number): MarketplaceRecord {
  const angle = seq * 2.4
  const offset = 0.0035 + (seq % 3) * 0.0015
  const dayRate =
    draft.payUnit === 'negotiable' || draft.payAmount == null
      ? null
      : draft.payUnit === 'hour'
        ? draft.payAmount * 8
        : draft.payAmount
  const dayMax = draft.payMax && dayRate != null ? (draft.payUnit === 'hour' ? draft.payMax * 8 : draft.payMax) : dayRate
  const source = draft.sourceUrl ? sourceOf(draft.sourceUrl) : null

  return {
    id: `import-${seq}`,
    kind: draft.kind,
    title: draft.title.trim() || draft.trade,
    initials: initials(draft.title),
    poster: source ? source.name : draft.kind === 'job' ? 'Pasted post' : undefined,
    source: source ?? undefined,
    trade: draft.trade,
    trades: [draft.trade],
    location: place.name,
    borough: place.borough,
    lat: place.lat + Math.sin(angle) * offset,
    lng: place.lng + Math.cos(angle) * offset * 1.6,
    payLabel: payLabel(draft),
    payMin: dayRate,
    payMax: dayMax,
    start: draft.start || TODAY,
    duration: draft.duration || 'To be agreed',
    verified: false,
    urgent: draft.urgent,
    applicants: draft.kind === 'job' ? 0 : undefined,
    summary: draft.summary.trim(),
    engagement: draft.engagement,
    engagements: [draft.engagement],
    skills: [],
    experience: draft.kind === 'worker' ? draft.experience || undefined : undefined,
    radiusKm: draft.kind === 'worker' ? 15 : undefined,
    availability: draft.kind === 'worker' ? availability(draft.start || TODAY) : undefined,
    languages: draft.languages,
    certifications: draft.certifications,
    preferences: [],
    scores: null,
    collaborations: draft.kind === 'company' ? 0 : undefined,
    lastActive: TODAY,
    history: [],
    seeking: draft.kind === 'company' ? draft.trade : undefined,
    imported: true,
    contactsRemoved: draft.contactsRemoved,
    postedHours: draft.postedHours ?? 0,
  }
}

export const SAMPLE_POSTS = {
  job: 'PILNIE! Szukam 2 pomocników na budowę w Stratford od jutra. Praca na 2 tygodnie, £150/dzień, płatne co piątek. Karta CSCS wymagana. Więcej info na priv albo dzwoń 07700 900123',
  worker:
    'Hej, jestem glazurnikiem z 8-letnim doświadczeniem, szukam zleceń w okolicach Ealing i Acton. Łazienki, kuchnie, duże formaty. Wolny od poniedziałku, stawka od £200/dzień. Mówię po angielsku. tel. 07700 900456',
}
