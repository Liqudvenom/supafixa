export type Mode = 'work' | 'workers' | 'companies'

export type View = 'map' | 'saved' | 'applications' | 'reviews' | 'risk' | 'settings' | 'import' | 'clients'

export type Engagement = 'Day rate' | 'Contract' | 'Subcontract' | 'Long-term'

export type DateWindow = 'any' | 'week' | 'fortnight' | 'month'

export type Kind = 'job' | 'worker' | 'company'

export type Scores = {
  overall: number
  payment: number
  communication: number
  scope: number
  site: number
}

export type HistoryItem = {
  title: string
  with: string
  when: string
}

export type MarketplaceRecord = {
  id: string
  kind: Kind
  title: string
  initials: string
  poster?: string
  trade: string
  trades: string[]
  location: string
  borough: string
  lat: number
  lng: number
  payLabel: string
  payMin: number | null
  payMax: number | null
  start: string
  duration: string
  verified: boolean
  urgent: boolean
  applicants?: number
  summary: string
  engagement: Engagement
  engagements: Engagement[]
  skills: string[]
  experience?: string
  radiusKm?: number
  availability?: string
  languages: string[]
  certifications: string[]
  preferences: string[]
  scores: Scores | null
  collaborations?: number
  extraCost?: string
  lastActive: string
  history: HistoryItem[]
  seeking?: string
  postedHours?: number
  imported?: boolean
  contactsRemoved?: number
  source?: { name: string; url: string }
}

export type Review = {
  id: string
  recordId: string
  author: string
  role: string
  date: string
  stars: number
  text: string
}

export type BoroughRisk = {
  borough: string
  lat: number
  lng: number
  payment: number
  disputes: 'Low' | 'Watch'
  verification: string
  note: string
}

export type BasePoint = {
  id: string
  label: string
  lat: number
  lng: number
}

export type PlacedRecord = MarketplaceRecord & {
  distanceKm: number
}

export type Frame =
  | { seq: number; kind: 'home' }
  | { seq: number; kind: 'point'; lat: number; lng: number; zoom: number }
  | { seq: number; kind: 'radius'; lat: number; lng: number; radiusKm: number }

export type FrameRequest =
  | { kind: 'home' }
  | { kind: 'point'; lat: number; lng: number; zoom: number }
  | { kind: 'radius'; lat: number; lng: number; radiusKm: number }

export type FilterState = {
  mode: Mode
  query: string
  borough: string
  radiusKm: number | null
  trade: string
  dateWindow: DateWindow
  payFloor: number | null
  engagement: Engagement | 'all'
  verifiedOnly: boolean
  urgentOnly: boolean
  base: BasePoint
  savedOnly: boolean
  savedIds: readonly string[]
}
