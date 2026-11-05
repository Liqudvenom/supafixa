import type { Engagement, MarketplaceRecord } from './types'

export type Lang = 'pl' | 'en'

export function plForm(n: number) {
  const abs = Math.abs(n)
  if (abs === 1) return 0
  const m10 = abs % 10
  const m100 = abs % 100
  if (m10 >= 2 && m10 <= 4 && !(m100 >= 12 && m100 <= 14)) return 1
  return 2
}

export const TRADE_PL: Record<string, string> = {
  Plumbing: 'Hydraulika',
  Electrical: 'Elektryka',
  'Painting & decorating': 'Malowanie i wykończenia',
  Labour: 'Prace pomocnicze',
  Carpentry: 'Stolarka',
  Tiling: 'Glazura i płytki',
  Plastering: 'Tynki i gładzie',
  Roofing: 'Dekarstwo',
  Groundworks: 'Roboty ziemne',
  Cleaning: 'Sprzątanie',
  Transport: 'Transport',
  Renovation: 'Remonty',
  Construction: 'Budownictwo',
  Brickwork: 'Murarstwo',
  Drylining: 'Regipsy i suche zabudowy',
}

const TRADE_NOUN: Record<string, { pl: string; en: string; fem?: boolean }> = {
  Plumbing: { pl: 'hydraulik', en: 'plumber' },
  Electrical: { pl: 'elektryk', en: 'electrician' },
  'Painting & decorating': { pl: 'malarz', en: 'painter and decorator' },
  Labour: { pl: 'pomocnik budowlany', en: 'labourer' },
  Carpentry: { pl: 'stolarz', en: 'carpenter' },
  Tiling: { pl: 'glazurnik', en: 'tiler' },
  Plastering: { pl: 'tynkarz', en: 'plasterer' },
  Roofing: { pl: 'dekarz', en: 'roofer' },
  Groundworks: { pl: 'ekipa do robót ziemnych', en: 'groundworks team', fem: true },
  Cleaning: { pl: 'osoba do sprzątania', en: 'cleaner', fem: true },
  Transport: { pl: 'kierowca z busem', en: 'van driver' },
  Renovation: { pl: 'ekipa remontowa', en: 'renovation team', fem: true },
  Construction: { pl: 'budowlaniec', en: 'builder' },
  Brickwork: { pl: 'murarz', en: 'bricklayer' },
  Drylining: { pl: 'monter regipsów', en: 'dryliner' },
}

const cap = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

export function postTitle(kind: 'job' | 'worker' | 'company', trade: string, lang: Lang) {
  const noun = TRADE_NOUN[trade] ?? { pl: trade.toLowerCase(), en: trade.toLowerCase() }
  if (lang === 'pl') {
    if (kind === 'worker') return `${cap(noun.pl)} szuka pracy`
    if (kind === 'company') return `Firma szuka: ${noun.pl}`
    return `${noun.fem ? 'Potrzebna' : 'Potrzebny'} ${noun.pl}`
  }
  if (kind === 'worker') return `${cap(noun.en)} looking for work`
  if (kind === 'company') return `Company looking for: ${noun.en}`
  return `${cap(noun.en)} needed`
}

export const ENGAGEMENT_PL: Record<Engagement, string> = {
  'Day rate': 'Dniówka',
  Contract: 'Zlecenie',
  Subcontract: 'Podwykonawstwo',
  'Long-term': 'Stała współpraca',
}

export const RECORD_PL: Record<string, { title?: string; summary: string }> = {
  'job-plumber-acton': {
    title: 'Potrzebny hydraulik',
    summary:
      'Szukamy hydraulika na drugi etap przy remoncie domu (3 sypialnie) w Acton. Start w poniedziałek, 5 dni, £220/dzień. Materiały na miejscu, miejsce na piec ustalone. Płatne co tydzień przelewem.',
  },
  'job-painter-wembley': {
    title: 'Malarz – dwa mieszkania',
    summary:
      'Szukam malarza na dwa puste mieszkania na Wembley. Głównie emulsja i stolarka, rozpiska kolorów gotowa. £180–220/dzień w zależności od doświadczenia, ok. 8 dni roboty.',
  },
  'job-labour-stratford': {
    title: 'Dwóch pomocników od zaraz',
    summary:
      'PILNIE potrzebnych 2 pomocników na budowę w Stratford od czwartku. Demontaże i noszenie materiału, winda zarezerwowana. £140/dzień, 3 dni. Karta CSCS obowiązkowo.',
  },
  'job-electrician-croydon': {
    title: 'Elektryk – podwykonawstwo',
    summary:
      'Firma szuka elektryka na podwykonawstwo w Croydon: pierwszy i drugi etap na piętrze biurowym. Koryta kablowe zapewnione. Stawka do ustalenia po oględzinach, ok. 6 tygodni.',
  },
  'job-renovation-hounslow': {
    title: 'Ekipa remontowa na stałe',
    summary:
      'Szukamy zgranej ekipy remontowej na stałą współpracę przez zimę. Domy zamieszkane, na start dwa zlecenia w Hounslow. Stawki do omówienia, praca ciągła.',
  },
  'job-labour-park-royal': {
    title: 'Pomocnik na Park Royal',
    summary:
      'Potrzebny pomocnik do ekipy cieśli na Park Royal. Wczesny start, buty robocze i karta CSCS. £150/dzień, 2 tygodnie pracy, kantyna na budowie.',
  },
  'job-carpenter-ealing': {
    title: 'Stolarz na poddasze',
    summary:
      'Szukam stolarza do poddasza w West Ealing: podłoga, ścianka działowa i obróbka wokół nowych schodów. Tylko szkic odręczny, bez pełnej dokumentacji. £200/dzień, ok. 10 dni.',
  },
  'job-tiler-north-acton': {
    title: 'Glazurnik – dwie łazienki',
    summary:
      'Płytki ścienne i podłogowe na miejscu, hydroizolacja zrobiona. Dwie małe łazienki w nowym bloku w North Acton. £190/dzień, ok. 6 dni.',
  },
  'job-leak-hammersmith': {
    title: 'Awaria – przeciek, na dziś',
    summary:
      'PILNE: przeciek z sufitu w zamieszkanym mieszkaniu w Hammersmith. Zakręcić, naprawić widoczne złącze i zostawić notatkę, co jeszcze zostało. £45/godz.',
  },
  'job-painter-bush': {
    title: 'Malowanie klatki schodowej',
    summary:
      "Klatka schodowa i półpiętra w Shepherd's Bush. Wejście tylko w dni robocze rano. £170/dzień, 4 dni. Ogłoszeniodawca jeszcze niezweryfikowany.",
  },
  'job-groundworks-hayes': {
    title: 'Ekipa do robót ziemnych',
    summary:
      'Kanalizacja i wykop pod dwie działki w Hayes. Koparka z operatorem zamówiona. £160/dzień, ok. 3 tygodnie. Karta CSCS wymagana.',
  },
  'job-clean-wharf': {
    title: 'Sprzątanie po remoncie',
    summary:
      'Sprzątanie po budowie wykończonego biura w Canary Wharf, razem z myciem szyb i końcowym przetarciem przed odbiorem. £18/godz., 3 dni.',
  },
  'job-driver-southall': {
    title: 'Kierowca z busem',
    summary:
      'Kursy między Southall, Park Royal i bazą w Hounslow. Mile widziany własny bus. £130/dzień, 2 tygodnie. Congestion charge zwracany osobno.',
  },
  'job-roofer-bromley': {
    title: 'Drobna naprawa dachu',
    summary:
      'Wymiana zsuniętych dachówek i sprawdzenie kosza w Bromley. Rusztowanie nie jest wliczone. £210/dzień, 2 dni. Ogłoszeniodawca niezweryfikowany.',
  },
  'job-plasterer-tottenham': {
    title: 'Tynkarz do mieszkania',
    summary:
      'Gładź w dwóch pokojach i korytarzu po wymianie elektryki w Tottenham. Płyty przykręcone, rusztowanie w mieszkaniu. £180/dzień, tydzień pracy.',
  },
  'job-electrician-greenwich': {
    title: 'Elektryk – pierwszy etap',
    summary:
      'Pierwszy etap elektryki w 8 mieszkaniach w Greenwich. Rysunki wydane, drugi etap osobno w dalszej części miesiąca. £240/dzień, 3 tygodnie.',
  },
  'job-brick-camden': {
    title: 'Murarz – mur ogrodowy',
    summary:
      'Odbudowa muru granicznego w Camden z przewiązaniem do istniejącego słupka. Cegły dobrane i ułożone w ogrodzie. £230/dzień, 4 dni.',
  },
  'job-dryline-barking': {
    title: 'Regipsy – dwa domy',
    summary:
      'Płyty i szpachlowanie w dwóch nowych domach w Barking. Profile w pierwszym już stoją, płyty w garażu. £185/dzień, 2 tygodnie.',
  },
  'worker-marek': {
    summary:
      'Elektryk z kartą ECS Gold. Pierwszy i drugi etap, mniejsze instalacje komercyjne. Mam własny sprzęt pomiarowy. Szukam podwykonawstwa lub dniówek.',
  },
  'worker-anna': {
    summary:
      'Malarka – mieszkania puste i zamieszkane. Dokładne odcięcia, a wilgoć zgłaszam, zanim cokolwiek zamaluję. Wolny termin od jutra.',
  },
  'worker-piotr': {
    summary:
      'Hydraulik: łazienki i ogrzewanie. Małe zlecenia robię sam, przy pełnym remoncie z pomocnikiem. Własny bus, Gas Safe.',
  },
  'worker-tomasz': {
    summary:
      'Pomocnik budowlany: demontaże, rozładunek, pomoc ekipie. Własne BHP i ważna karta CSCS. Mówię też po ukraińsku.',
  },
  'worker-magdalena': {
    summary:
      'Malarka, kładę też flizelinę i robię ściany dekoracyjne. Proszę o rozpiskę kolorów na piśmie.',
  },
  'worker-jakub': {
    summary:
      'Stolarz: ścianki działowe, ościeżnice, kuchnie, poddasza. Mogę wycenić całość albo pracować na dniówkę.',
  },
  'worker-agnieszka': {
    summary:
      'Glazurniczka – łazienki i fartuchy kuchenne. Nie zaczynam, dopóki podłoże nie jest równe.',
  },
  'worker-pawel': {
    summary:
      'Kierowca z busem (Transit) – dostawy na budowy i wywóz odpadów. Bus z przegrodą i bagażnikiem dachowym.',
  },
  'worker-ewa': {
    summary:
      'Tynkarka – gładzie i tynki wyrównawcze. Rezerwuję termin po ustaleniu podłoża i czasu schnięcia.',
  },
  'worker-bartek': {
    summary:
      'Dekarz: naprawy dachówek i małe dachy skośne. Profil jeszcze niezweryfikowany. Rusztowanie po stronie zleceniodawcy.',
  },
  'worker-natalia': {
    summary:
      'Sprzątanie po budowie, mogę przyjść z drugą osobą. Pracuję według pisemnej listy pomieszczeń, nie z ustnego obchodu.',
  },
  'worker-filip': {
    summary:
      'Roboty ziemne: kanalizacja, krawężniki, wykopy. Mogę być banksmanem przy wynajętej maszynie.',
  },
  'company-harbour': {
    summary:
      'Zweryfikowany klient biznesowy, remonty w centralnym Londynie. Publikuje zakres prac, zanim poprosi fachowca o wycenę.',
  },
  'company-vistula': {
    summary:
      'Wykonawca z zachodniego Londynu, zatrudnia pomocników i ekipy przy remontach. Stawki dzienne zawsze podane w ogłoszeniu.',
  },
  'company-baltic': {
    summary:
      'Firma ze wschodniego Londynu szuka podwykonawców elektrycznych i wykończeniowców. Rysunki wysyła przed wizją lokalną.',
  },
  'company-oak': {
    summary:
      'Firma remontowa z krótką listą sprawdzonych malarzy, glazurników i hydraulików do zamieszkanych domów.',
  },
  'company-meridian': {
    summary: 'Szukamy ekipy remontowej na kilka domów z rzędu, a nie na jedną dniówkę.',
  },
  'company-northolt': {
    summary: 'Mała firma stolarska szuka stolarzy. Profil niezweryfikowany, zakres prac zwykle tylko na szkicu.',
  },
  'company-croydon': {
    summary:
      'Wykonawca wykończeń szuka podwykonawców: elektryka i regipsy na piętrach komercyjnych w południowym Londynie.',
  },
  'company-riverside': {
    summary:
      'Biuro, które rezerwuje busy dla budowlańców. Szukamy kierowców znających bazy i wysypiska w zachodnim Londynie.',
  },
}

export const REVIEW_PL: Record<string, string> = {
  'rev-1': 'Przelew przyszedł w piątek, kiedy zamknęliśmy piętro. Rysunki zgadzały się z obchodem.',
  'rev-2': 'Zakres przy drugiej łazience się nie zmienił. Dostęp był załatwiony, płytki na miejscu.',
  'rev-3': 'Dniówka była taka, jak w ogłoszeniu. Parking wyjaśnili przed pierwszym rankiem.',
  'rev-4': 'Przyjechał z właściwymi kartami, a kuchnia nadawała się do użytku jeszcze tego samego dnia.',
  'rev-5': 'Równe odcięcia, a plamę wilgoci zgłosiła, zanim ją zamalowała.',
  'rev-6': 'W umowie podwykonawczej jasno było napisane, kto dostarcza koryta kablowe.',
  'rev-7': 'Lista pomieszczeń została odhaczona, a szyby przy odbiorze naprawdę były czyste.',
  'rev-8': 'Czysty pierwszy etap kuchni. Dodatkową godzinę zapisano, zanim się zaczęła.',
}

export const RISK_PL: Record<string, string> = {
  Ealing: 'Dniówki w zweryfikowanych ogłoszeniach zwykle zgadzają się z wypłatą.',
  Brent: 'Dużo remontów domów. Pisemna rozpiska kolorów ogranicza poprawki.',
  Newham: 'Kilka ogłoszeń przy demontażach zmieniło godziny po starcie. Sprawdź czas trwania.',
  Croydon: 'Pakiety wykończeniowe są jaśniejsze, gdy koryta kablowe są wpisane jako zapewnione.',
  Hounslow: 'Częste dłuższe remonty. Zapytaj, kto prowadzi harmonogram.',
  Westminster: 'Zweryfikowani klienci z centrum mają w tym demo najlepszą historię płatności.',
  Greenwich: 'Pierwszy etap w mieszkaniach jest zaplanowany, zasady wejścia są w ogłoszeniu.',
  'Tower Hamlets': 'Sprzątanie przed odbiorem wymaga listy pomieszczeń. Ustne obchody kończyły się dopłatami.',
  Hillingdon: 'Roboty ziemne trwają dłużej. Wynajem maszyny zwykle jest osobno.',
  Bromley: 'Więcej niezweryfikowanych ogłoszeń o naprawach. Rusztowanie często nie jest w cenie.',
}

const PHRASES: Record<string, string> = {
  'Day rate or subcontract': 'Dniówka lub podwykonawstwo',
  'Available for short contracts': 'Krótkie zlecenia',
  'Available for call-out': 'Wyjazdy na wezwanie',
  'Day work': 'Praca na dniówki',
  'This month': 'W tym miesiącu',
  'Site or bench': 'Na budowie lub w warsztacie',
  'Short contracts': 'Krótkie zlecenia',
  'Van and driver': 'Bus z kierowcą',
  'Rooms or full flats': 'Pokoje lub całe mieszkania',
  'Repairs and small renewals': 'Naprawy i małe wymiany',
  'Teams of two': 'Ekipa dwuosobowa',
  'Gang or machine banksman': 'Ekipa lub banksman przy maszynie',
  'Project packages': 'Pakiety projektowe',
  'Rolling site work': 'Ciągła praca na budowach',
  'Subcontract packages': 'Pakiety podwykonawcze',
  'House renovations': 'Remonty domów',
  'Winter programme': 'Program zimowy',
  'Joinery packages': 'Pakiety stolarskie',
  'Fit-out packages': 'Pakiety wykończeniowe',
  'Regular runs': 'Stałe kursy',
  'Long-term cooperation': 'Stała współpraca',
  'To be agreed': 'Do ustalenia',
  'Available today': 'Od dziś',
  'Available tomorrow': 'Od jutra',
  'Available this week': 'W tym tygodniu',
  'Second fix': 'Drugi etap (second fix)',
  'First fix': 'Pierwszy etap (first fix)',
  Bathrooms: 'Łazienki',
  Heating: 'Ogrzewanie',
  Emulsion: 'Farby emulsyjne',
  Woodwork: 'Malowanie stolarki',
  'Occupied sites': 'Budowy w użytkowaniu',
  'Strip-out': 'Demontaże',
  'Material handling': 'Rozładunek materiałów',
  Containment: 'Koryta kablowe',
  Commercial: 'Obiekty komercyjne',
  Refurbishment: 'Remonty',
  'Occupied houses': 'Domy zamieszkane',
  Lofts: 'Poddasza',
  'Stud walls': 'Ścianki działowe',
  'Leak tracing': 'Szukanie przecieków',
  'Occupied property': 'Lokal zamieszkany',
  Apartments: 'Mieszkania',
  Testing: 'Pomiary elektryczne',
  Wallpaper: 'Tapetowanie',
  'Occupied homes': 'Domy zamieszkane',
  Loading: 'Załadunek',
  'Making good': 'Poprawki',
  'Feature walls': 'Ściany dekoracyjne',
  'Lining paper': 'Flizelina',
  Spraying: 'Malowanie natryskowe',
  Kitchens: 'Kuchnie',
  'Door linings': 'Ościeżnice',
  'Large format': 'Duże formaty',
  Splashbacks: 'Fartuchy kuchenne',
  'Site deliveries': 'Dostawy na budowę',
  'Tip runs': 'Wywóz odpadów',
  'Multi-drop': 'Wiele punktów dostaw',
  Skim: 'Gładzie',
  Float: 'Tynk wyrównawczy',
  Patches: 'Łatanie',
  'Pitched roofs': 'Dachy skośne',
  Valleys: 'Kosze dachowe',
  'Lead patches': 'Obróbki ołowiane',
  'Builders’ clean': 'Sprzątanie po budowie',
  'Sparkle clean': 'Sprzątanie końcowe',
  Glass: 'Mycie szyb',
  Drainage: 'Kanalizacja',
  Kerbs: 'Krawężniki',
  'Fit-out': 'Wykończenia',
  'Occupied buildings': 'Budynki w użytkowaniu',
  'Written scopes': 'Pisemny zakres prac',
  'Site logistics': 'Logistyka budowy',
  'Commercial floors': 'Piętra komercyjne',
  'House refurbishment': 'Remonty domów',
  'External works': 'Prace zewnętrzne',
  Studwork: 'Ścianki działowe',
  'Commercial fit-out': 'Wykończenia komercyjne',
  'Night handovers': 'Odbiory nocne',
  'Site access': 'Dostęp do budów',
  'CSCS required': 'Wymagana karta CSCS',
  'Full UK licence': 'Prawo jazdy UK',
  Insured: 'Ubezpieczenie OC',
  'Own van': 'Własny bus',
  'Weekday hours': 'Dni robocze',
  'Commercial sites': 'Budowy komercyjne',
  'Own tools': 'Własne narzędzia',
  'Weekday starts': 'Start w dni robocze',
  Residential: 'Mieszkaniówka',
  'Own brushes': 'Własne pędzle',
  'No night work': 'Bez pracy nocnej',
  'Day rate': 'Dniówka',
  'West London': 'Zachodni Londyn',
  'Early starts': 'Wczesne starty',
  'East London': 'Wschodni Londyn',
  'Written schedule': 'Pisemny harmonogram',
  'Site packages': 'Pakiety na budowie',
  'Prepared backgrounds': 'Przygotowane podłoże',
  Weekdays: 'Dni robocze',
  'Fuel discussed up front': 'Paliwo ustalone z góry',
  'Clear drying time': 'Jasny czas schnięcia',
  'Scaffold included': 'Rusztowanie w cenie',
  'No fragile roofs without a plan': 'Kruche dachy tylko z planem',
  'Written room list': 'Pisemna lista pomieszczeń',
  Daytime: 'Praca w dzień',
  'Team of two': 'Ekipa dwuosobowa',
  'Longer bookings': 'Dłuższe zlecenia',
  'PPE supplied': 'Zapewnione BHP',
  'Verified cards': 'Zweryfikowane karty',
  'Central London': 'Centralny Londyn',
  'Drawings first': 'Najpierw rysunki',
  'Tidy sites': 'Porządek na budowie',
  'North-west London': 'Północno-zachodni Londyn',
  'Named lead': 'Wskazany kierownik',
  'Long-term': 'Stała współpraca',
  'Polish and English': 'Polski i angielski',
  'Own small tools': 'Własne drobne narzędzia',
  'Day rate trial first': 'Najpierw dniówka próbna',
  'South London': 'Południowy Londyn',
  'Named supervisor': 'Wskazany nadzór',
  'Fuel terms written': 'Pisemne zasady za paliwo',
  'Fit-out subcontractors': 'Podwykonawcy wykończeń',
  'Labour and carpentry gangs': 'Pomocnicy i ekipy stolarskie',
  'Electrical subcontractors': 'Podwykonawcy elektryczni',
  'Painters and finishers': 'Malarze i wykończeniowcy',
  'Renovation partners': 'Ekipy remontowe',
  Carpenters: 'Stolarze',
  'Electrical and drylining': 'Elektryka i regipsy',
  'Van drivers': 'Kierowcy busów',
  'Office first fix': 'Pierwszy etap elektryki w biurze',
  'Apartment test and inspect': 'Pomiary w mieszkaniach',
  'Two-flat decoration': 'Malowanie dwóch mieszkań',
  'Boiler swap': 'Wymiana pieca',
  'Kitchen first fix': 'Pierwszy etap kuchni',
  'Office strip-out': 'Demontaż biura',
  'Kitchen package': 'Pakiet kuchenny',
  'Bathroom walls': 'Ściany łazienki',
  'Bathroom package': 'Pakiet łazienkowy',
  'Private client, demo': 'Klient prywatny (demo)',
  'Pasted post': 'Wklejony post',
  Electrician: 'Elektryk',
  Tiler: 'Glazurnik',
  Carpenter: 'Stolarz',
  Client: 'Klient',
  Contractor: 'Wykonawca',
  Plumber: 'Hydraulik',
  Polish: 'Polski',
  English: 'Angielski',
  Ukrainian: 'Ukraiński',
  Negotiable: 'Do negocjacji',
  'Project rates': 'Stawki projektowe',
  'Package rates': 'Stawki za pakiet',
}

const MONTHS_PL: Record<string, string> = {
  Jan: 'sty',
  Feb: 'lut',
  Mar: 'mar',
  Apr: 'kwi',
  May: 'maj',
  Jun: 'cze',
  Jul: 'lip',
  Aug: 'sie',
  Sep: 'wrz',
  Oct: 'paź',
  Nov: 'lis',
  Dec: 'gru',
}

const UNITS_PL: Record<string, [string, string, string]> = {
  day: ['dzień', 'dni', 'dni'],
  week: ['tydzień', 'tygodnie', 'tygodni'],
  month: ['miesiąc', 'miesiące', 'miesięcy'],
  year: ['rok', 'lata', 'lat'],
}

export function tx(value: string, lang: Lang) {
  if (lang === 'en' || !value) return value
  const exact = PHRASES[value]
  if (exact) return exact
  const span = value.match(/^(\d+) (day|week|month|year)s?$/)
  if (span) {
    const n = Number(span[1])
    return `${n} ${UNITS_PL[span[2]][plForm(n)]}`
  }
  const from = value.match(/^From (\d+) (\w{3})$/)
  if (from && MONTHS_PL[from[2]]) return `Od ${from[1]} ${MONTHS_PL[from[2]]}`
  const month = value.match(/^(\w{3}) (\d{4})$/)
  if (month && MONTHS_PL[month[1]]) return `${MONTHS_PL[month[1]]} ${month[2]}`
  return value
}

export function txPay(label: string, lang: Lang) {
  if (lang === 'en') return label
  return tx(label, lang).replace('/day', '/dzień').replace('/hour', '/godz.')
}

export function txTrade(trade: string, lang: Lang) {
  return lang === 'pl' ? (TRADE_PL[trade] ?? trade) : trade
}

export function txEngagement(engagement: Engagement, lang: Lang) {
  return lang === 'pl' ? ENGAGEMENT_PL[engagement] : engagement
}

export type Localized = {
  title: string
  summary: string
  trade: string
  payLabel: string
  duration: string
  availability: string
  experience: string
  seeking: string
  poster: string
  skills: string[]
  certifications: string[]
  preferences: string[]
  languages: string[]
  engagements: string[]
  history: { title: string; with: string; when: string }[]
}

export function localize(record: MarketplaceRecord, lang: Lang): Localized {
  const pl = lang === 'pl' ? RECORD_PL[record.id] : undefined
  const list = (items: string[]) => items.map((item) => tx(item, lang))
  return {
    title: pl?.title ?? record.title,
    summary: pl?.summary ?? record.summary,
    trade: txTrade(record.trade, lang),
    payLabel: txPay(record.payLabel, lang),
    duration: tx(record.duration, lang),
    availability: tx(record.availability ?? '', lang),
    experience: tx(record.experience ?? '', lang),
    seeking: tx(record.seeking ?? '', lang),
    poster: tx(record.poster ?? '', lang),
    skills: list(record.skills),
    certifications: list(record.certifications),
    preferences: list(record.preferences),
    languages: list(record.languages),
    engagements: record.engagements.map((item) => txEngagement(item, lang)),
    history: record.history.map((item) => ({ ...item, title: tx(item.title, lang), when: tx(item.when, lang) })),
  }
}

export function polishSearchText(record: MarketplaceRecord) {
  const view = localize(record, 'pl')
  return [
    view.title,
    view.summary,
    view.trade,
    record.trades.map((trade) => txTrade(trade, 'pl')).join(' '),
    view.duration,
    view.availability,
    view.seeking,
    view.skills.join(' '),
    view.certifications.join(' '),
    view.preferences.join(' '),
    view.languages.join(' '),
  ].join(' ')
}
