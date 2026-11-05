import { polishSearchText } from './content'
import type { BasePoint, DateWindow, FilterState, Kind, MarketplaceRecord, Mode, PlacedRecord } from './types'

export const LONDON = { lat: 51.47, lng: -0.16, zoom: 10 }

const WINDOW_END: Record<Exclude<DateWindow, 'any'>, string> = {
  week: '2026-11-11',
  fortnight: '2026-11-18',
  month: '2026-12-04',
}

export function distanceKm(a: Pick<BasePoint, 'lat' | 'lng'>, b: Pick<BasePoint, 'lat' | 'lng'>) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)))
}

export function place(record: MarketplaceRecord, base: BasePoint): PlacedRecord {
  return { ...record, distanceKm: distanceKm(base, record) }
}

export function modeKind(mode: Mode): Kind {
  if (mode === 'work') return 'job'
  if (mode === 'workers') return 'worker'
  return 'company'
}

export function kindMode(kind: Kind): Mode {
  if (kind === 'job') return 'work'
  if (kind === 'worker') return 'workers'
  return 'companies'
}

export function fold(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[łŁ]/g, 'l')
    .toLowerCase()
}

function matches(record: PlacedRecord, filter: FilterState) {
  if (filter.verifiedOnly && !record.verified) return false
  if (filter.urgentOnly && !record.urgent) return false
  if (filter.borough !== 'all' && record.borough !== filter.borough) return false
  if (filter.radiusKm != null && record.distanceKm > filter.radiusKm) return false
  if (filter.trade !== 'all' && record.trade !== filter.trade && !record.trades.includes(filter.trade)) return false
  if (filter.payFloor != null && (record.payMin == null || record.payMin < filter.payFloor)) return false
  if (filter.engagement !== 'all' && !record.engagements.includes(filter.engagement)) return false
  if (filter.dateWindow !== 'any' && record.start > WINDOW_END[filter.dateWindow]) return false

  const query = fold(filter.query.trim())
  if (!query) return true
  const haystack = fold(
    [
      record.title,
      record.poster ?? '',
      record.trade,
      record.trades.join(' '),
      record.location,
      record.borough,
      record.summary,
      record.skills.join(' '),
      record.certifications.join(' '),
      record.preferences.join(' '),
      record.seeking ?? '',
      record.languages.join(' '),
      record.availability ?? '',
      polishSearchText(record),
    ].join(' '),
  )
  return haystack.includes(query)
}

export function visibleRecords(records: readonly MarketplaceRecord[], filter: FilterState) {
  const kind = modeKind(filter.mode)
  const matchesFilter: PlacedRecord[] = []
  for (const record of records) {
    if (filter.savedOnly && !filter.savedIds.includes(record.id)) continue
    if (record.kind !== kind) continue
    const placed = place(record, filter.base)
    if (matches(placed, filter)) matchesFilter.push(placed)
  }
  matchesFilter.sort((a, b) => a.distanceKm - b.distanceKm || a.title.localeCompare(b.title))
  return matchesFilter
}

export function formatKm(km: number) {
  if (km < 1) return `${Math.max(100, Math.round(km * 1000 / 50) * 50)} m`
  const digits = km < 10 ? 1 : 0
  return `${km.toFixed(digits)} km`
}

export function boroughNames(records: readonly MarketplaceRecord[]) {
  return [...new Set(records.map((record) => record.borough))].sort((a, b) => a.localeCompare(b))
}

export function boroughCenter(records: readonly MarketplaceRecord[], borough: string) {
  const rows = records.filter((record) => record.borough === borough)
  if (!rows.length) return null
  return {
    lat: rows.reduce((sum, row) => sum + row.lat, 0) / rows.length,
    lng: rows.reduce((sum, row) => sum + row.lng, 0) / rows.length,
  }
}

export function esc(value: string) {
  return value.replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return map[char]
  })
}
