import type { Lang } from './content'
import type { Mode } from './types'

export type ProfileId = 'seller' | 'buyer' | 'business'

type Text = Record<Lang, string>

export type Profile = {
  id: ProfileId
  initials: string
  name: string
  role: Text
  note: Text
  defaultMode: Mode
  allowedModes: Mode[]
  clientCheck: boolean
}

export const ACCOUNT_EMAIL = 'tomasz.demo@tradetrust.test'

export const PROFILES: Profile[] = [
  {
    id: 'seller',
    initials: 'TN',
    name: 'Tomasz Nowicki',
    role: { pl: 'Fachowiec · Elektryk', en: 'Tradesperson · Electrician' },
    note: { pl: 'Sprzedajesz usługi i szukasz zleceń.', en: 'You sell your work and look for jobs.' },
    defaultMode: 'work',
    allowedModes: ['work'],
    clientCheck: false,
  },
  {
    id: 'buyer',
    initials: 'TN',
    name: 'Tomasz Nowicki',
    role: { pl: 'Zleceniodawca', en: 'Client' },
    note: { pl: 'Kupujesz usługi i szukasz fachowców.', en: 'You buy services and hire trades.' },
    defaultMode: 'workers',
    allowedModes: ['workers', 'companies'],
    clientCheck: false,
  },
  {
    id: 'business',
    initials: 'NE',
    name: 'Nowicki Electrical Ltd',
    role: { pl: 'Firma · program „Sprawdź klienta”', en: 'Business · Client Check programme' },
    note: {
      pl: 'Wybrana firma. Widzisz i wystawiasz opinie o adresach klientów.',
      en: 'Selected business. You can read and leave reviews of client addresses.',
    },
    defaultMode: 'work',
    allowedModes: ['work', 'workers', 'companies'],
    clientCheck: true,
  },
]

export function quickTarget(id: ProfileId): ProfileId {
  return id === 'buyer' ? 'seller' : 'buyer'
}

export function profileById(id: ProfileId) {
  return PROFILES.find((profile) => profile.id === id) ?? PROFILES[0]
}
