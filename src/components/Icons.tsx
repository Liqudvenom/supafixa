import type { ReactNode } from 'react'

export type IconName =
  | 'map'
  | 'bookmark'
  | 'clipboard'
  | 'briefcase'
  | 'users'
  | 'building'
  | 'star'
  | 'activity'
  | 'settings'
  | 'search'
  | 'bell'
  | 'shield'
  | 'locate'
  | 'close'
  | 'menu'
  | 'paste'
  | 'external'
  | 'lock'
  | 'home'
  | 'plus'
  | 'user'
  | 'swap'
  | 'filter'
  | 'check'

const paths: Record<IconName, ReactNode> = {
  map: (
    <>
      <path d="M9 18.5 3.5 20V6.5L9 5l6 1.5 5.5-1.5V17L15 18.5 9 17" />
      <path d="M9 5v12M15 6.5V18.5" />
    </>
  ),
  bookmark: (
    <path d="M7 4.5h10a1 1 0 0 1 1 1V20l-6-3.2L6 20V5.5a1 1 0 0 1 1-1z" />
  ),
  clipboard: (
    <>
      <rect x="6" y="4.5" width="12" height="15.5" rx="2" />
      <path d="M9 4.5h6v2.2H9zM9 11h6M9 14.5h4" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3.5" y="7" width="17" height="12" rx="2" />
      <path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3.5 12h17" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9" r="2.4" />
      <circle cx="16" cy="9.5" r="2" />
      <path d="M4.8 18.5c.7-2.6 2.4-3.9 4.2-3.9s3.5 1.3 4.2 3.9M13.2 14.7c1.5-.2 3 .6 3.8 2.8" />
    </>
  ),
  building: (
    <>
      <path d="M4.5 20V6.2L12 3.5l7.5 2.7V20" />
      <path d="M9 20v-4h6v4M9 9h.01M15 9h.01M9 13h.01M15 13h.01" />
    </>
  ),
  star: <path d="m12 3.8 2.1 4.4 4.8.7-3.5 3.4.8 4.8L12 15.1 7.8 17.1l.8-4.8L5.1 8.9l4.8-.7L12 3.8z" />,
  activity: <path d="M3.5 12h4l2.2-5.5 3.6 11 2.2-5.5h5" />,
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3.5v2.2M12 18.3v2.2M4.8 6.8l1.6 1.6M17.6 15.6l1.6 1.6M3.5 12h2.2M18.3 12h2.2M4.8 17.2l1.6-1.6M17.6 8.4l1.6-1.6" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  bell: (
    <>
      <path d="M6.2 16.5h11.6l-1.2-2V10a4.6 4.6 0 0 0-9.2 0v4.5l-1.2 2z" />
      <path d="M10 16.5a2 2 0 0 0 4 0" />
    </>
  ),
  shield: <path d="M12 3.5 19 6v5.4c0 4-2.8 6.6-7 8.6-4.2-2-7-4.6-7-8.6V6l7-2.5z" />,
  locate: (
    <>
      <circle cx="12" cy="12" r="3" />
      <circle cx="12" cy="12" r="7" />
      <path d="M12 2.8v2.2M12 19v2.2M2.8 12h2.2M19 12h2.2" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  paste: (
    <>
      <rect x="6" y="4.5" width="12" height="15.5" rx="2" />
      <path d="M9 4.5h6v2.2H9zM12 10v6M9 13h6" />
    </>
  ),
  external: (
    <>
      <path d="M13.5 4.5h6v6M19.5 4.5 11 13" />
      <path d="M17.5 13.5v4.5a1.5 1.5 0 0 1-1.5 1.5H6a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 6 6.5h4.5" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" />
      <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </>
  ),
  home: (
    <>
      <path d="M4 11.2 12 4.5l8 6.7" />
      <path d="M6.2 9.6V19.5h11.6V9.6M10 19.5v-5h4v5" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 19.5c1.2-3.4 3.6-5 7-5s5.8 1.6 7 5" />
    </>
  ),
  swap: <path d="M7 7.5h12l-3-3M17 16.5H5l3 3" />,
  filter: <path d="M4 6.5h16M7 12h10M10 17.5h4" />,
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
}

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
