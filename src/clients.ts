import type { Lang } from './content'
import { fold } from './model'

export type PropertyType = 'house' | 'flat' | 'commercial'
export type PaidStatus = 'onTime' | 'late' | 'unpaid'
export type RiskLevel = 'good' | 'watch' | 'risk'

export type ClientAddress = {
  id: string
  line: string
  postcode: string
  area: string
  borough: string
  lat: number
  lng: number
  property: PropertyType
  added?: boolean
}

export type ClientRatings = {
  payment: number
  communication: number
  scope: number
  site: number
}

export type ClientReview = {
  id: string
  addressId: string
  trade: string
  date: string
  stars: number
  ratings: ClientRatings
  paid: PaidStatus
  unpaidExtra: number
  text: Record<Lang, string>
  mine?: boolean
}

export type AddressReport = ClientAddress & {
  reviews: ClientReview[]
  rating: number | null
  ratings: ClientRatings | null
  level: RiskLevel | null
  late: number
  unpaid: number
  unpaidTotal: number
}

export const CLIENT_ADDRESSES: ClientAddress[] = [
  { id: 'a-acton', line: '14 Willowmere Road', postcode: 'W3 9ZZ', area: 'Acton', borough: 'Ealing', lat: 51.5062, lng: -0.2712, property: 'house' },
  { id: 'a-ealing', line: 'Flat 3, 22 Quillan Court', postcode: 'W5 9ZZ', area: 'Ealing', borough: 'Ealing', lat: 51.5162, lng: -0.3002, property: 'flat' },
  { id: 'a-wembley', line: '7 Brambleside Avenue', postcode: 'HA9 9ZZ', area: 'Wembley', borough: 'Brent', lat: 51.5596, lng: -0.2868, property: 'house' },
  { id: 'a-stratford', line: 'Unit 4, Fennwick Yard', postcode: 'E15 9ZZ', area: 'Stratford', borough: 'Newham', lat: 51.5446, lng: -0.0018, property: 'commercial' },
  { id: 'a-croydon', line: '31 Ashcombe Rise', postcode: 'CR0 9ZZ', area: 'Croydon', borough: 'Croydon', lat: 51.3758, lng: -0.0941, property: 'house' },
  { id: 'a-hounslow', line: '18 Kestrel Mead', postcode: 'TW3 9ZZ', area: 'Hounslow', borough: 'Hounslow', lat: 51.4693, lng: -0.3622, property: 'house' },
  { id: 'a-hammersmith', line: 'Flat 12, Orchid Wharf', postcode: 'W6 9ZZ', area: 'Hammersmith', borough: 'Hammersmith and Fulham', lat: 51.4914, lng: -0.2262, property: 'flat' },
  { id: 'a-greenwich', line: '5 Larkspur Terrace', postcode: 'SE10 9ZZ', area: 'Greenwich', borough: 'Greenwich', lat: 51.4806, lng: -0.0082, property: 'house' },
  { id: 'a-tottenham', line: '56 Corbel Street', postcode: 'N17 9ZZ', area: 'Tottenham', borough: 'Haringey', lat: 51.5904, lng: -0.0712, property: 'house' },
  { id: 'a-bromley', line: '9 Heathfield Copse', postcode: 'BR1 9ZZ', area: 'Bromley', borough: 'Bromley', lat: 51.4058, lng: 0.0162, property: 'house' },
]

const r = (payment: number, communication: number, scope: number, site: number): ClientRatings => ({
  payment,
  communication,
  scope,
  site,
})

export const CLIENT_REVIEWS: ClientReview[] = [
  {
    id: 'cr-1', addressId: 'a-acton', trade: 'Plumbing', date: '2026-10-21', stars: 5, ratings: r(5, 5, 5, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Wymiana pionu w łazience. Zakres ustalony na piśmie, zapłata w dniu odbioru. Parking pod domem.',
      en: 'Bathroom riser replacement. Scope agreed in writing, paid on the day of sign-off. Parking outside.',
    },
  },
  {
    id: 'cr-2', addressId: 'a-acton', trade: 'Electrical', date: '2026-08-02', stars: 5, ratings: r(5, 4, 5, 5), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Nowa rozdzielnia. Dostęp od 8:00, prąd odłączony zgodnie z planem. Bez problemów.',
      en: 'New consumer unit. Access from 8 am, power off as planned. No issues.',
    },
  },
  {
    id: 'cr-3', addressId: 'a-acton', trade: 'Painting & decorating', date: '2026-05-14', stars: 4, ratings: r(5, 4, 4, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Malowanie dwóch pokoi. Jedna drobna zmiana koloru, dopłata uzgodniona bez dyskusji.',
      en: 'Two rooms painted. One small colour change, the extra was agreed without argument.',
    },
  },
  {
    id: 'cr-4', addressId: 'a-ealing', trade: 'Carpentry', date: '2026-10-09', stars: 4, ratings: r(4, 4, 3, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Szafy na wymiar. W trakcie doszły półki w przedpokoju – zapłacone, ale trzeba było przypominać.',
      en: 'Fitted wardrobes. Hallway shelves were added mid-job – paid, but it took reminders.',
    },
  },
  {
    id: 'cr-5', addressId: 'a-ealing', trade: 'Tiling', date: '2026-06-30', stars: 3, ratings: r(4, 3, 2, 4), paid: 'late', unpaidExtra: 0,
    text: {
      pl: 'Płytki w kuchni. Zakres zmieniany trzy razy, płatność tydzień po terminie. Ustalajcie wszystko na piśmie.',
      en: 'Kitchen tiling. Scope changed three times, paid a week late. Put everything in writing.',
    },
  },
  {
    id: 'cr-6', addressId: 'a-wembley', trade: 'Painting & decorating', date: '2026-10-28', stars: 2, ratings: r(1, 2, 2, 3), paid: 'unpaid', unpaidExtra: 420,
    text: {
      pl: 'Malowanie całego domu. Ostatnia rata niezapłacona od 3 tygodni, dodatkowe prace „miały być w cenie”.',
      en: 'Whole-house painting. Final instalment unpaid for 3 weeks; extra work was "meant to be included".',
    },
  },
  {
    id: 'cr-7', addressId: 'a-wembley', trade: 'Plastering', date: '2026-07-11', stars: 2, ratings: r(2, 3, 2, 2), paid: 'late', unpaidExtra: 220,
    text: {
      pl: 'Tynki w dwóch pokojach. Pomieszczenia nieopróżnione mimo ustaleń, zapłata po miesiącu i bez części za dodatki.',
      en: 'Plastering two rooms. Rooms not cleared as agreed; paid after a month and without the extras.',
    },
  },
  {
    id: 'cr-8', addressId: 'a-wembley', trade: 'Electrical', date: '2026-03-03', stars: 3, ratings: r(3, 3, 3, 3), paid: 'late', unpaidExtra: 0,
    text: {
      pl: 'Gniazdka i oświetlenie. Zapłacone z opóźnieniem, poza tym w porządku.',
      en: 'Sockets and lighting. Paid late, otherwise fine.',
    },
  },
  {
    id: 'cr-9', addressId: 'a-stratford', trade: 'Labour', date: '2026-10-15', stars: 5, ratings: r(5, 5, 4, 5), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Fit-out lokalu. Kierownik na miejscu, przepustki gotowe, faktury płacone w 14 dni.',
      en: 'Unit fit-out. Manager on site, passes ready, invoices paid within 14 days.',
    },
  },
  {
    id: 'cr-10', addressId: 'a-stratford', trade: 'Drylining', date: '2026-09-02', stars: 4, ratings: r(4, 4, 4, 5), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Ścianki działowe. Dobra organizacja, rozładunek tylko rano – warto wiedzieć wcześniej.',
      en: 'Partition walls. Well organised; deliveries only in the morning – worth knowing early.',
    },
  },
  {
    id: 'cr-11', addressId: 'a-croydon', trade: 'Electrical', date: '2026-09-25', stars: 3, ratings: r(4, 3, 3, 1), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Dwa razy brak dostępu w umówiony dzień. Zapłata w porządku, ale stracone dniówki.',
      en: 'No access twice on the agreed day. Payment fine, but we lost two day rates.',
    },
  },
  {
    id: 'cr-12', addressId: 'a-croydon', trade: 'Roofing', date: '2026-04-19', stars: 3, ratings: r(3, 3, 4, 2), paid: 'late', unpaidExtra: 0,
    text: {
      pl: 'Naprawa dachu. Rusztowanie postawione dopiero po tygodniu, płatność z poślizgiem.',
      en: 'Roof repair. Scaffold only went up a week late, payment slipped.',
    },
  },
  {
    id: 'cr-13', addressId: 'a-hounslow', trade: 'Renovation', date: '2026-10-30', stars: 5, ratings: r(5, 5, 5, 5), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Remont parteru. Etapy rozliczane co tydzień, decyzje szybko. Polecam współpracę.',
      en: 'Ground-floor renovation. Weekly stage payments, quick decisions. Recommended.',
    },
  },
  {
    id: 'cr-14', addressId: 'a-hounslow', trade: 'Plumbing', date: '2026-07-07', stars: 5, ratings: r(5, 5, 5, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Nowa łazienka. Materiały zamówione przed startem, zapłata od ręki.',
      en: 'New bathroom. Materials ordered before the start, paid straight away.',
    },
  },
  {
    id: 'cr-15', addressId: 'a-hammersmith', trade: 'Plumbing', date: '2026-10-03', stars: 4, ratings: r(4, 5, 4, 3), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Przeciek pod zlewem. Dostęp przez zarządcę budynku – trzeba zgłosić dzień wcześniej.',
      en: 'Leak under the sink. Access via the building manager – book a day ahead.',
    },
  },
  {
    id: 'cr-16', addressId: 'a-hammersmith', trade: 'Painting & decorating', date: '2026-02-18', stars: 4, ratings: r(4, 4, 4, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Odświeżenie mieszkania przed wynajmem. Konkretnie i na czas.',
      en: 'Flat refresh before letting. Clear and on time.',
    },
  },
  {
    id: 'cr-17', addressId: 'a-greenwich', trade: 'Electrical', date: '2026-10-12', stars: 1, ratings: r(1, 1, 2, 3), paid: 'unpaid', unpaidExtra: 640,
    text: {
      pl: 'Przerobiona instalacja w kuchni. Brak zapłaty za dodatkowe obwody, kontakt urwany po odbiorze.',
      en: 'Kitchen rewire. Extra circuits never paid; contact stopped after sign-off.',
    },
  },
  {
    id: 'cr-18', addressId: 'a-greenwich', trade: 'Carpentry', date: '2026-06-06', stars: 2, ratings: r(2, 2, 1, 3), paid: 'late', unpaidExtra: 180,
    text: {
      pl: 'Zakres zmieniany codziennie, bez akceptacji kosztów. Część dopłat do dziś nierozliczona.',
      en: 'Scope changed daily with no cost sign-off. Some extras are still unsettled.',
    },
  },
  {
    id: 'cr-19', addressId: 'a-tottenham', trade: 'Plastering', date: '2026-09-18', stars: 4, ratings: r(4, 3, 4, 3), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Tynki po rozbiórce. Gruz nie był wywieziony przed startem, poza tym ok.',
      en: 'Plastering after strip-out. Rubble wasn’t cleared before we started, otherwise fine.',
    },
  },
  {
    id: 'cr-20', addressId: 'a-tottenham', trade: 'Labour', date: '2026-05-02', stars: 3, ratings: r(3, 4, 3, 3), paid: 'late', unpaidExtra: 0,
    text: {
      pl: 'Pomoc przy rozbiórce. Płatność kilka dni po terminie.',
      en: 'Strip-out labour. Paid a few days late.',
    },
  },
  {
    id: 'cr-21', addressId: 'a-bromley', trade: 'Roofing', date: '2026-10-19', stars: 5, ratings: r(5, 5, 4, 5), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Wymiana rynien i dachówek. Dostęp do ogrodu, prąd i woda na miejscu, zapłata w dniu odbioru.',
      en: 'Gutters and tiles replaced. Garden access, power and water on site, paid on sign-off.',
    },
  },
  {
    id: 'cr-22', addressId: 'a-bromley', trade: 'Painting & decorating', date: '2026-04-08', stars: 4, ratings: r(5, 4, 4, 4), paid: 'onTime', unpaidExtra: 0,
    text: {
      pl: 'Elewacja. Pogoda przesunęła termin, klient wyrozumiały.',
      en: 'Exterior painting. Weather moved the dates; the client was understanding.',
    },
  },
]

export const JOB_ADDRESS: Record<string, string> = {
  'job-plumber-acton': 'a-acton',
  'job-carpenter-ealing': 'a-ealing',
  'job-painter-wembley': 'a-wembley',
  'job-labour-stratford': 'a-stratford',
  'job-electrician-croydon': 'a-croydon',
  'job-renovation-hounslow': 'a-hounslow',
  'job-leak-hammersmith': 'a-hammersmith',
  'job-electrician-greenwich': 'a-greenwich',
  'job-plasterer-tottenham': 'a-tottenham',
  'job-roofer-bromley': 'a-bromley',
}

const avg = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length

export function levelOf(rating: number): RiskLevel {
  if (rating >= 4.2) return 'good'
  if (rating >= 3.2) return 'watch'
  return 'risk'
}

export function buildReports(addresses: ClientAddress[], reviews: ClientReview[]): AddressReport[] {
  return addresses.map((address) => {
    const own = reviews.filter((review) => review.addressId === address.id).sort((a, b) => b.date.localeCompare(a.date))
    if (!own.length) {
      return { ...address, reviews: own, rating: null, ratings: null, level: null, late: 0, unpaid: 0, unpaidTotal: 0 }
    }
    const rating = avg(own.map((review) => review.stars))
    return {
      ...address,
      reviews: own,
      rating,
      ratings: {
        payment: avg(own.map((review) => review.ratings.payment)),
        communication: avg(own.map((review) => review.ratings.communication)),
        scope: avg(own.map((review) => review.ratings.scope)),
        site: avg(own.map((review) => review.ratings.site)),
      },
      level: levelOf(rating),
      late: own.filter((review) => review.paid === 'late').length,
      unpaid: own.filter((review) => review.paid === 'unpaid').length,
      unpaidTotal: own.reduce((sum, review) => sum + review.unpaidExtra, 0),
    }
  })
}

export function normalisePostcode(value: string) {
  return value.toUpperCase().replace(/\s+/g, '')
}

export function formatPostcode(value: string) {
  const compact = normalisePostcode(value)
  return compact.length > 3 ? `${compact.slice(0, -3)} ${compact.slice(-3)}` : compact
}

export function validPostcode(value: string) {
  return /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/.test(normalisePostcode(value))
}

export function searchReports(reports: AddressReport[], query: string) {
  const q = fold(query.trim())
  if (!q) return reports
  const compact = normalisePostcode(query)
  return reports.filter(
    (report) =>
      normalisePostcode(report.postcode).startsWith(compact) ||
      fold(`${report.line} ${report.area} ${report.borough}`).includes(q),
  )
}

export function sameAddress(a: { line: string; postcode: string }, b: { line: string; postcode: string }) {
  return normalisePostcode(a.postcode) === normalisePostcode(b.postcode) && fold(a.line.trim()) === fold(b.line.trim())
}

const PERSON = /\b(Pan|Pani|Państwo|Panu|Pana|Panią|Mr|Mrs|Ms|Miss|Dr)\.?\s+[A-ZŁŚŻŹĆŃÓ][\p{L}'-]+(\s+[A-ZŁŚŻŹĆŃÓ][\p{L}'-]+)?/gu

export function stripPeople(text: string, marker: string) {
  let removed = 0
  const cleaned = text.replace(PERSON, () => {
    removed += 1
    return marker
  })
  return { text: cleaned, removed }
}
