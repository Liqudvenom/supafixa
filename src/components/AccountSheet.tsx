import { useI18n } from '../i18n'
import { ACCOUNT_EMAIL, PROFILES, profileById, quickTarget } from '../profiles'
import type { ProfileId } from '../profiles'
import { Icon } from './Icons'

type Props = {
  profileId: ProfileId
  access: Record<ProfileId, boolean>
  onSwitch: (id: ProfileId) => void
  onSettings: () => void
  onClose: () => void
}

export function AccountSheet({ profileId, access, onSwitch, onSettings, onClose }: Props) {
  const { t, lang } = useI18n()
  const current = profileById(profileId)
  const quick = profileById(quickTarget(profileId))

  return (
    <>
      <button type="button" className="sheet-scrim" aria-label={t('profile.close')} onClick={onClose} />
      <div className="account-sheet" role="dialog" aria-label={t('profile.title')}>
        <div className="account-head">
          <span className={`avatar big ${current.id}`}>{current.initials}</span>
          <div>
            <strong>{current.name}</strong>
            <span>{ACCOUNT_EMAIL}</span>
          </div>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t('profile.close')}>
            <Icon name="close" size={16} />
          </button>
        </div>

        <button type="button" className="btn primary wide switch-btn" onClick={() => onSwitch(quick.id)}>
          <Icon name="swap" size={16} />
          {t('profile.switchTo', { role: quick.role[lang] })}
        </button>

        <p className="popover-label">{t('profile.title')}</p>
        <p className="account-copy">{t('profile.intro')}</p>
        <div className="profile-list">
          {PROFILES.map((profile) => {
            const active = profile.id === profileId
            return (
              <button
                type="button"
                key={profile.id}
                className={active ? 'profile-row active' : 'profile-row'}
                aria-pressed={active}
                onClick={() => onSwitch(profile.id)}
              >
                <span className={`avatar ${profile.id}`}>{profile.initials}</span>
                <span className="profile-text">
                  <strong>{profile.role[lang]}</strong>
                  <small>{profile.note[lang]}</small>
                  <span className={access[profile.id] ? 'flag on' : 'flag'}>
                    {access[profile.id] ? <Icon name="check" size={12} /> : <Icon name="lock" size={12} />}
                    {t('profile.feature')}: {t(access[profile.id] ? 'profile.on' : 'profile.off')}
                  </span>
                </span>
                {active && <em>{t('profile.active')}</em>}
              </button>
            )
          })}
        </div>
        <p className="disclaimer">{t('profile.test')}</p>
        <button type="button" className="btn ghost wide" onClick={onSettings}>
          <Icon name="settings" size={15} /> {t('nav.settings')}
        </button>
      </div>
    </>
  )
}
