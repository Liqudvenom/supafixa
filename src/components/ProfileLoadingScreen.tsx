import type { Key } from '../i18n'
import { useI18n } from '../i18n'
import type { ProfileId } from '../profiles'

type Props = {
  profileId: ProfileId
  fading?: boolean
}

const TITLE: Record<ProfileId, Key> = {
  seller: 'boot.title.seller',
  buyer: 'boot.title.buyer',
  business: 'boot.title.business',
}

const SUB: Record<ProfileId, Key> = {
  seller: 'boot.sub.seller',
  buyer: 'boot.sub.buyer',
  business: 'boot.sub.business',
}

export function ProfileLoadingScreen({ profileId, fading }: Props) {
  const { t } = useI18n()

  return (
    <div
      className={fading ? 'boot-overlay out' : 'boot-overlay'}
      role="status"
      aria-live="polite"
      aria-busy={!fading}
    >
      <div className="boot-card">
        <span className="boot-spin" aria-hidden="true" />
        <h2>{t(TITLE[profileId])}</h2>
        <p>{t(SUB[profileId])}</p>
      </div>
    </div>
  )
}
