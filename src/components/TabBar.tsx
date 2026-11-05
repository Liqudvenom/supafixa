import { useI18n } from '../i18n'
import type { Key } from '../i18n'
import type { View } from '../types'
import { Icon } from './Icons'
import type { IconName } from './Icons'

type Props = {
  view: View
  accountOpen: boolean
  clientAccess: boolean
  savedCount: number
  onView: (view: View) => void
  onAccount: () => void
}

export function TabBar({ view, accountOpen, clientAccess, savedCount, onView, onAccount }: Props) {
  const { t } = useI18n()
  const tabs: { id: View; icon: IconName; label: Key; badge?: number }[] = [
    { id: 'map', icon: 'map', label: 'tab.map' },
    { id: 'saved', icon: 'bookmark', label: 'tab.saved', badge: savedCount },
    { id: 'clients', icon: clientAccess ? 'home' : 'lock', label: 'tab.clients' },
    { id: 'import', icon: 'plus', label: 'tab.add' },
  ]

  return (
    <nav className="tabbar" aria-label={t('nav.workspace')}>
      {tabs.map((tab) => {
        const on = !accountOpen && view === tab.id
        return (
          <button
            key={tab.id}
            type="button"
            className={on ? 'on' : ''}
            aria-current={on ? 'page' : undefined}
            onClick={() => onView(tab.id)}
          >
            <span className="tab-icon">
              <Icon name={tab.icon} size={21} />
              {tab.badge ? <em>{tab.badge}</em> : null}
            </span>
            {t(tab.label)}
          </button>
        )
      })}
      <button type="button" className={accountOpen ? 'on' : ''} aria-expanded={accountOpen} onClick={onAccount}>
        <span className="tab-icon">
          <Icon name="user" size={21} />
        </span>
        {t('tab.account')}
      </button>
    </nav>
  )
}
