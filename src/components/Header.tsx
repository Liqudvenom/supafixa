import { useEffect, useRef, useState } from 'react'
import { useI18n } from '../i18n'
import type { Profile } from '../profiles'
import { Icon } from './Icons'

export type Kpi = {
  value: number
  label: string
  note: string
}

type Notice = {
  id: string
  title: string
  detail: string
  onOpen: () => void
}

type Props = {
  title: string
  subtitle: string
  kpis: Kpi[]
  profile: Profile
  quickRole: string
  notices: Notice[]
  onHome: () => void
  onMenu: () => void
  onAccount: () => void
  onQuickSwitch: () => void
}

export function Header({ title, subtitle, kpis, profile, quickRole, notices, onHome, onMenu, onAccount, onQuickSwitch }: Props) {
  const { t, lang, setLang } = useI18n()
  const [bellOpen, setBellOpen] = useState(false)
  const bellRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!bellOpen) return
    const onPointer = (event: MouseEvent) => {
      if (bellRef.current?.contains(event.target as Node)) return
      setBellOpen(false)
    }
    window.addEventListener('mousedown', onPointer)
    return () => window.removeEventListener('mousedown', onPointer)
  }, [bellOpen])

  return (
    <header className="topbar">
      <button type="button" className="menu-btn" onClick={onMenu} aria-label={t('nav.open')}>
        <Icon name="menu" />
      </button>
      <div className="title-block">
        <p className="eyebrow">{profile.role[lang]}</p>
        <div className="title-row">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="kpis">
        {kpis.map((kpi) => (
          <div className="kpi" key={kpi.label}>
            <b>{kpi.value}</b>
            <span>{kpi.label}</span>
            <small>{kpi.note}</small>
          </div>
        ))}
      </div>

      <div className="top-tools">
        <button type="button" className="quick-switch" onClick={onQuickSwitch}>
          <Icon name="swap" size={15} />
          {t('profile.switchTo', { role: quickRole })}
        </button>
        <div className="lang-switch" role="group" aria-label={t('head.language')}>
          {(['pl', 'en'] as const).map((code) => (
            <button
              key={code}
              type="button"
              className={lang === code ? 'on' : ''}
              aria-pressed={lang === code}
              onClick={() => setLang(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
        <button type="button" className="region" onClick={onHome}>
          {t('head.region')}
        </button>
        <span className="demo-pill">
          <i />
          {t('head.demo')}
        </span>
        <div className="pop-anchor" ref={bellRef}>
          <button
            type="button"
            className="icon-btn"
            aria-label={t('head.notices')}
            aria-expanded={bellOpen}
            onClick={() => setBellOpen((open) => !open)}
          >
            <Icon name="bell" />
          </button>
          {bellOpen && (
            <div className="popover" role="dialog" aria-label={t('head.notices')}>
              <p className="popover-label">{t('head.notices')}</p>
              {notices.map((notice) => (
                <button
                  type="button"
                  key={notice.id}
                  className="notice"
                  onClick={() => {
                    setBellOpen(false)
                    notice.onOpen()
                  }}
                >
                  <strong>{notice.title}</strong>
                  <span>{notice.detail}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button type="button" className={`avatar ${profile.id}`} aria-label={t('head.account')} onClick={onAccount}>
          {profile.initials}
        </button>
      </div>
    </header>
  )
}
