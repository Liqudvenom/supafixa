export type Place = {
  name: string
  borough: string
  lat: number
  lng: number
  aliases?: string[]
}

export const PLACES: Place[] = [
  { name: 'Acton', borough: 'Ealing', lat: 51.5086, lng: -0.2634 },
  { name: 'North Acton', borough: 'Ealing', lat: 51.5235, lng: -0.259 },
  { name: 'Park Royal', borough: 'Ealing', lat: 51.5288, lng: -0.2845 },
  { name: 'West Ealing', borough: 'Ealing', lat: 51.5108, lng: -0.3188 },
  { name: 'Ealing', borough: 'Ealing', lat: 51.513, lng: -0.305 },
  { name: 'Southall', borough: 'Ealing', lat: 51.5118, lng: -0.3764 },
  { name: 'Greenford', borough: 'Ealing', lat: 51.5415, lng: -0.3488 },
  { name: 'Hanwell', borough: 'Ealing', lat: 51.509, lng: -0.338 },
  { name: 'Northolt', borough: 'Ealing', lat: 51.548, lng: -0.368 },
  { name: 'Wembley', borough: 'Brent', lat: 51.556, lng: -0.2795, aliases: ['north wembley'] },
  { name: 'Kilburn', borough: 'Brent', lat: 51.547, lng: -0.194 },
  { name: 'Willesden', borough: 'Brent', lat: 51.549, lng: -0.234 },
  { name: 'Harrow', borough: 'Harrow', lat: 51.5802, lng: -0.3412 },
  { name: 'Edgware', borough: 'Barnet', lat: 51.613, lng: -0.275 },
  { name: 'Hendon', borough: 'Barnet', lat: 51.583, lng: -0.226 },
  { name: 'Finchley', borough: 'Barnet', lat: 51.6, lng: -0.193 },
  { name: 'Hammersmith', borough: 'Hammersmith and Fulham', lat: 51.4927, lng: -0.2254 },
  { name: 'Fulham', borough: 'Hammersmith and Fulham', lat: 51.473, lng: -0.201 },
  {
    name: "Shepherd's Bush",
    borough: 'Hammersmith and Fulham',
    lat: 51.5048,
    lng: -0.2238,
    aliases: ['shepherds bush', 'shepherd bush'],
  },
  { name: 'Chiswick', borough: 'Hounslow', lat: 51.492, lng: -0.258 },
  { name: 'Hounslow', borough: 'Hounslow', lat: 51.4692, lng: -0.3634 },
  { name: 'Feltham', borough: 'Hounslow', lat: 51.445, lng: -0.41 },
  { name: 'Brentford', borough: 'Hounslow', lat: 51.486, lng: -0.309 },
  { name: 'Hayes', borough: 'Hillingdon', lat: 51.5134, lng: -0.4216 },
  { name: 'Uxbridge', borough: 'Hillingdon', lat: 51.546, lng: -0.478 },
  { name: 'Heathrow', borough: 'Hillingdon', lat: 51.47, lng: -0.454 },
  { name: 'Richmond', borough: 'Richmond upon Thames', lat: 51.4613, lng: -0.3037 },
  { name: 'Twickenham', borough: 'Richmond upon Thames', lat: 51.447, lng: -0.329 },
  { name: 'Kingston', borough: 'Kingston upon Thames', lat: 51.412, lng: -0.3 },
  { name: 'Wimbledon', borough: 'Merton', lat: 51.4214, lng: -0.2064 },
  { name: 'Morden', borough: 'Merton', lat: 51.402, lng: -0.195 },
  { name: 'Sutton', borough: 'Sutton', lat: 51.3618, lng: -0.1945 },
  { name: 'Croydon', borough: 'Croydon', lat: 51.3721, lng: -0.1 },
  { name: 'Brixton', borough: 'Lambeth', lat: 51.4613, lng: -0.1156 },
  { name: 'Clapham', borough: 'Lambeth', lat: 51.462, lng: -0.138 },
  { name: 'Battersea', borough: 'Wandsworth', lat: 51.47, lng: -0.165 },
  { name: 'Wandsworth', borough: 'Wandsworth', lat: 51.457, lng: -0.193 },
  { name: 'Tooting', borough: 'Wandsworth', lat: 51.427, lng: -0.168 },
  { name: 'Peckham', borough: 'Southwark', lat: 51.474, lng: -0.069 },
  { name: 'Lewisham', borough: 'Lewisham', lat: 51.4618, lng: -0.0114 },
  { name: 'Greenwich', borough: 'Greenwich', lat: 51.4842, lng: -0.0084 },
  { name: 'Woolwich', borough: 'Greenwich', lat: 51.49, lng: 0.065 },
  { name: 'Bromley', borough: 'Bromley', lat: 51.4064, lng: 0.0156 },
  { name: 'Bexleyheath', borough: 'Bexley', lat: 51.456, lng: 0.144 },
  { name: 'Canary Wharf', borough: 'Tower Hamlets', lat: 51.5054, lng: -0.0235 },
  { name: 'Whitechapel', borough: 'Tower Hamlets', lat: 51.519, lng: -0.06 },
  { name: 'Shoreditch', borough: 'Hackney', lat: 51.526, lng: -0.078 },
  { name: 'Hackney', borough: 'Hackney', lat: 51.545, lng: -0.055 },
  { name: 'Islington', borough: 'Islington', lat: 51.538, lng: -0.103 },
  { name: 'Camden', borough: 'Camden', lat: 51.5392, lng: -0.1436 },
  { name: 'Westminster', borough: 'Westminster', lat: 51.4975, lng: -0.1357 },
  {
    name: 'Central London',
    borough: 'Westminster',
    lat: 51.5145,
    lng: -0.13,
    aliases: ['centrum londynu', 'soho', 'covent garden'],
  },
  { name: 'City of London', borough: 'City of London', lat: 51.5155, lng: -0.0922, aliases: ['the city'] },
  { name: 'Chelsea', borough: 'Kensington and Chelsea', lat: 51.4875, lng: -0.1687 },
  { name: 'Kensington', borough: 'Kensington and Chelsea', lat: 51.5, lng: -0.1925 },
  { name: 'Tottenham', borough: 'Haringey', lat: 51.5876, lng: -0.0688 },
  { name: 'Wood Green', borough: 'Haringey', lat: 51.597, lng: -0.109 },
  { name: 'Edmonton', borough: 'Enfield', lat: 51.615, lng: -0.07 },
  { name: 'Enfield', borough: 'Enfield', lat: 51.652, lng: -0.081 },
  { name: 'Walthamstow', borough: 'Waltham Forest', lat: 51.583, lng: -0.02 },
  { name: 'Leyton', borough: 'Waltham Forest', lat: 51.56, lng: -0.015 },
  { name: 'Stratford', borough: 'Newham', lat: 51.5416, lng: -0.0042 },
  { name: 'East Ham', borough: 'Newham', lat: 51.539, lng: 0.051 },
  { name: 'Ilford', borough: 'Redbridge', lat: 51.5594, lng: 0.0712 },
  { name: 'Barking', borough: 'Barking and Dagenham', lat: 51.5386, lng: 0.0824 },
  { name: 'Dagenham', borough: 'Barking and Dagenham', lat: 51.541, lng: 0.148 },
  { name: 'Romford', borough: 'Havering', lat: 51.575, lng: 0.183 },
  { name: 'Southfields', borough: 'Wandsworth', lat: 51.445, lng: -0.211 },
  { name: 'Streatham', borough: 'Lambeth', lat: 51.4277, lng: -0.1318 },
  { name: 'Blackheath', borough: 'Greenwich', lat: 51.468, lng: 0.007, aliases: ['blackheath /se3/'] },
  { name: 'Lee', borough: 'Lewisham', lat: 51.452, lng: 0.013, aliases: ['lee /se12/'] },
  { name: 'Palmers Green', borough: 'Enfield', lat: 51.618, lng: -0.097 },
  { name: 'Clapham Junction', borough: 'Wandsworth', lat: 51.4646, lng: -0.1705 },
  { name: 'Hornchurch', borough: 'Havering', lat: 51.556, lng: 0.218, aliases: ['hornchurch /rm12/'] },
  { name: 'Woodside Park', borough: 'Barnet', lat: 51.618, lng: -0.185, aliases: ['woodside park /n12/'] },
  { name: 'Worcester Park', borough: 'Sutton', lat: 51.381, lng: -0.245 },
  { name: 'Putney', borough: 'Wandsworth', lat: 51.461, lng: -0.216 },
  { name: 'Golders Green', borough: 'Barnet', lat: 51.572, lng: -0.194 },
  { name: 'Maze Hill', borough: 'Greenwich', lat: 51.481, lng: 0.003, aliases: ['maze hill /se10/'] },
  { name: 'Brent Cross', borough: 'Barnet', lat: 51.576, lng: -0.213 },
  { name: 'Seven Sisters', borough: 'Haringey', lat: 51.582, lng: -0.075 },
  { name: 'Molesey', borough: 'Richmond upon Thames', lat: 51.401, lng: -0.363, aliases: ['west molesey', 'molesey /kt8/'] },
  { name: 'Slough', borough: 'Slough', lat: 51.508, lng: -0.595, aliases: ['slough /sl1/'] },
  { name: 'Didcot', borough: 'South Oxfordshire', lat: 51.606, lng: -1.241, aliases: ['didcot /ox11/'] },
  { name: 'Brentwood', borough: 'Brentwood', lat: 51.62, lng: 0.305 },
  { name: 'Billericay', borough: 'Basildon', lat: 51.628, lng: 0.418, aliases: ['billericay /cm12/'] },
  { name: 'Harlow', borough: 'Harlow', lat: 51.772, lng: 0.094, aliases: ['harlow /cm20/'] },
  { name: 'Cobham', borough: 'Elmbridge', lat: 51.329, lng: -0.409 },
  { name: 'Thame', borough: 'South Oxfordshire', lat: 51.748, lng: -0.978, aliases: ['thame /ox9/'] },
  { name: 'Welwyn Garden City', borough: 'Welwyn Hatfield', lat: 51.803, lng: -0.208, aliases: ['welwyn'] },
  { name: 'Byfleet', borough: 'Elmbridge', lat: 51.34, lng: -0.504, aliases: ['byfleet & new haw', 'new haw'] },
]

export function placeByName(name: string) {
  return PLACES.find((place) => place.name === name)
}

const DISTRICT_PLACES: Record<string, string> = {
  E1: 'Whitechapel', E2: 'Shoreditch', E3: 'Stratford', E5: 'Hackney', E6: 'East Ham', E8: 'Hackney', E9: 'Hackney',
  E10: 'Leyton', E11: 'Leyton', E13: 'East Ham', E14: 'Canary Wharf', E15: 'Stratford', E17: 'Walthamstow',
  N1: 'Islington', N2: 'Finchley', N3: 'Finchley', N4: 'Islington', N5: 'Islington', N7: 'Islington', N8: 'Wood Green',
  N9: 'Edmonton', N12: 'Woodside Park', N15: 'Tottenham', N17: 'Tottenham', N18: 'Edmonton', N22: 'Wood Green',
  NW1: 'Camden', NW3: 'Camden', NW4: 'Hendon', NW5: 'Camden', NW6: 'Kilburn', NW7: 'Hendon', NW9: 'Hendon',
  NW10: 'Willesden',
  SE1: 'Central London', SE3: 'Blackheath', SE10: 'Greenwich', SE12: 'Lee', SE13: 'Lewisham', SE15: 'Peckham', SE18: 'Woolwich',
  SW1: 'Westminster', SW2: 'Brixton', SW3: 'Chelsea', SW4: 'Clapham', SW5: 'Kensington', SW6: 'Fulham', SW7: 'Kensington',
  SW8: 'Battersea', SW9: 'Brixton', SW10: 'Chelsea', SW11: 'Battersea', SW17: 'Tooting', SW18: 'Wandsworth',
  SW19: 'Wimbledon', SW20: 'Wimbledon',
  W1: 'Central London', W2: 'Central London', W3: 'Acton', W4: 'Chiswick', W5: 'Ealing', W6: 'Hammersmith',
  W7: 'Hanwell', W8: 'Kensington', W12: "Shepherd's Bush", W13: 'West Ealing', W14: 'Hammersmith',
  HA0: 'Wembley', HA8: 'Edgware', HA9: 'Wembley',
  RM8: 'Dagenham', RM9: 'Dagenham', RM10: 'Dagenham', RM12: 'Hornchurch',
  KT8: 'Molesey', SL1: 'Slough', OX9: 'Thame', OX11: 'Didcot', CM12: 'Billericay', CM20: 'Harlow', AL8: 'Welwyn Garden City',
  TW1: 'Twickenham', TW2: 'Twickenham', TW7: 'Hounslow', TW8: 'Brentford', TW9: 'Richmond', TW10: 'Richmond',
  TW13: 'Feltham', TW14: 'Feltham',
  UB1: 'Southall', UB2: 'Southall', UB3: 'Hayes', UB4: 'Hayes', UB5: 'Northolt', UB6: 'Greenford', UB8: 'Uxbridge',
  UB10: 'Uxbridge', IG11: 'Barking',
}

const AREA_PLACES: Record<string, string> = {
  E: 'Stratford', EC: 'City of London', WC: 'Central London', N: 'Islington', NW: 'Camden', SE: 'Lewisham',
  SW: 'Clapham', W: 'Ealing', BR: 'Bromley', CR: 'Croydon', DA: 'Bexleyheath', EN: 'Enfield', HA: 'Harrow',
  IG: 'Ilford', KT: 'Kingston', RM: 'Romford', SM: 'Sutton', TW: 'Hounslow', UB: 'Southall',
}

export function placeByPostcode(text: string): Place | null {
  const pattern = /\b(EC|WC|NW|SE|SW|BR|CR|DA|EN|HA|IG|KT|RM|SM|TW|UB|OX|CM|AL|SL|E|N|W)(\d{1,2})[A-Z]?(?:\s?\d[A-Z]{2})?\b/g
  for (const hit of text.toUpperCase().matchAll(pattern)) {
    const name = DISTRICT_PLACES[`${hit[1]}${hit[2]}`] ?? AREA_PLACES[hit[1]]
    if (name) return placeByName(name) ?? null
  }
  return null
}

const REGION_PLACES: [RegExp, string][] = [
  [/londyn\s+pd\.?\s*-?\s*zach/, 'Wandsworth'],
  [/londyn\s+pn\.?\s*-?\s*zach/, 'Willesden'],
  [/londyn\s+pd\.?\s*-?\s*wsch/, 'Lewisham'],
  [/londyn\s+pn\.?\s*-?\s*wsch/, 'Walthamstow'],
  [/poludniowo\s*-?\s*zachodni\s+londyn/, 'Wandsworth'],
  [/poludn[io]{1,2}wy\s+londyn/, 'Brixton'],
  [/polnocny\s+londyn/, 'Wood Green'],
  [/zachodni\s+londyn/, 'Ealing'],
  [/caly\s+londyn/, 'Central London'],
  [/londyn\s+pd\b/, 'Brixton'],
  [/londyn\s+pn\b/, 'Wood Green'],
  [/londyn\s+centr/, 'Central London'],
  [/londyn\s+wsch/, 'Stratford'],
  [/londyn\s+zach/, 'Ealing'],
  [/(south|north|east|west)\s+london/, ''],
]

export function placeByRegion(folded: string): Place | null {
  for (const [pattern, name] of REGION_PLACES) {
    const hit = pattern.exec(folded)
    if (!hit) continue
    const english = { south: 'Brixton', north: 'Wood Green', east: 'Stratford', west: 'Ealing' } as Record<string, string>
    return placeByName(name || english[hit[1]]) ?? null
  }
  return null
}
