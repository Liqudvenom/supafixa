import { useI18n } from '../i18n'
import type { Key } from '../i18n'
import { PROFILES, type Profile, type ProfileId } from '../profiles'
import { SUPAFIXA_OFFERS_URL } from '../supafixa'
import type { Mode, View } from '../types'
import { Icon } from './Icons'
import type { IconName } from './Icons'

export const GROUP_URL = 'https://www.facebook.com/groups/pracawlondynie'

type Props = {
  view: View
  mode: Mode
  open: boolean
  counts: Record<Mode, number>
  allowedModes: Mode[]
  profile: Profile
  clientAccess: boolean
  onView: (view: View) => void
  onMode: (mode: Mode) => void
  onClose: () => void
  onAccount: () => void
  onSwitch: (id: ProfileId) => void
  locked?: boolean
}

const modes: { id: Mode; label: Key; icon: IconName }[] = [
  { id: 'work', label: 'nav.work', icon: 'briefcase' },
  { id: 'workers', label: 'nav.workers', icon: 'users' },
  { id: 'companies', label: 'nav.companies', icon: 'building' },
]

export function Sidebar({ view, mode, open, counts, allowedModes, profile, clientAccess, onView, onMode, onClose, onAccount, onSwitch, locked }: Props) {
  const { t, lang } = useI18n()
  const onMap = view === 'map' || view === 'saved'

  const item = (id: View, icon: IconName, label: Key) => (
    <button
      type="button"
      className={view === id ? 'nav-item active' : 'nav-item'}
      aria-current={view === id ? 'page' : undefined}
      onClick={() => onView(id)}
    >
      <Icon name={icon} />
      <span>{t(label)}</span>
    </button>
  )

  return (
    <>
      <button type="button" className={open ? 'nav-scrim show' : 'nav-scrim'} aria-label={t('nav.close')} onClick={onClose} />
      <aside className={open ? 'sidebar open' : 'sidebar'} inert={locked || undefined}>
        <div className="brand">
          <span className="brand-mark">T</span>
          <span className="brand-name">TradeTrust</span>
        </div>

        <nav className="nav" aria-label={t('nav.workspace')}>
          <p className="nav-label">{t('nav.workspace')}</p>
          {item('map', 'map', 'nav.map')}
          <div className="nav-sub">
            {modes.filter((entry) => allowedModes.includes(entry.id)).map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={onMap && mode === entry.id ? 'nav-item mode-on' : 'nav-item'}
                onClick={() => onMode(entry.id)}
              >
                <Icon name={entry.icon} size={16} />
                <span>{t(entry.label)}</span>
                <em>{counts[entry.id]}</em>
              </button>
            ))}
          </div>
          {item('saved', 'bookmark', 'nav.saved')}
          {item('applications', 'clipboard', 'nav.applications')}

          <p className="nav-label">{t('nav.business')}</p>
          <button
            type="button"
            className={view === 'clients' ? 'nav-item nav-link active' : 'nav-item nav-link'}
            aria-current={view === 'clients' ? 'page' : undefined}
            onClick={() => onView('clients')}
          >
            <Icon name={clientAccess ? 'home' : 'lock'} />
            <span>
              {t('nav.clients')}
              <small>{clientAccess ? t('kpi.myReviewsNote') : t('nav.locked')}</small>
            </span>
          </button>

          <p className="nav-label">{t('nav.community')}</p>
          {item('import', 'paste', 'nav.import')}
          <a className="nav-item nav-link" href={GROUP_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="external" />
            <span>
              Praca w Londynie
              <small>{t('nav.groupNote')}</small>
            </span>
          </a>
          <a className="nav-item nav-link" href={SUPAFIXA_OFFERS_URL} target="_blank" rel="noopener noreferrer">
            <Icon name="external" />
            <span>
              {t('nav.supafixa')}
              <small>{t('nav.supafixaNote')}</small>
            </span>
          </a>

          <p className="nav-label">{t('nav.insight')}</p>
          {item('reviews', 'star', 'nav.reviews')}
          {item('risk', 'activity', 'nav.risk')}

          <p className="nav-label">{t('nav.account')}</p>
          {item('settings', 'settings', 'nav.settings')}
        </nav>

        <div className="profile-rail" role="group" aria-label={t('profile.title')}>
          {PROFILES.map((entry) => {
            const active = entry.id === profile.id
            return (
              <button
                key={entry.id}
                type="button"
                className={active ? `rail-avatar on ${entry.id}` : `rail-avatar ${entry.id}`}
                aria-pressed={active}
                aria-label={active ? `${t('profile.active')}: ${entry.role[lang]}` : t('profile.switchTo', { role: entry.role[lang] })}
                title={entry.role[lang]}
                onClick={() => onSwitch(entry.id)}
              >
                {entry.initials}
              </button>
            )
          })}
        </div>
        <button type="button" className="profile-card" onClick={onAccount}>
          <span className={`avatar ${profile.id}`}>{profile.initials}</span>
          <span>
            <strong>{profile.name}</strong>
            <small>{profile.role[lang]}</small>
          </span>
          <Icon name="swap" size={16} />
        </button>
        <p className="sidebar-note">{t('nav.footer')}</p>
      </aside>
    </>
  )
}
