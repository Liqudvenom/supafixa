import { useI18n } from '../i18n'
import type { Key } from '../i18n'
import type { ProfileId } from '../profiles'

type Props = {
  profileId?: ProfileId
  fading?: boolean
  page?: boolean
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

function Truck() {
  return (
    <div className="dump-truck" aria-hidden="true">
      <div className="front" />
      <div className="bucket" />
      <div className="dirt">
        <div className="dirt-spill" />
      </div>
      <div className="base" />
      <div className="wheel wheel-front" />
      <div className="wheel wheel-middle" />
      <div className="wheel wheel-back" />
    </div>
  )
}

export function DumpTruckLoader({ profileId = 'seller', fading, page }: Props) {
  const { t } = useI18n()
  const title = page ? t('splash.title') : t(TITLE[profileId])
  const sub = page ? t('splash.sub') : t(SUB[profileId])

  return (
    <div
      className={fading ? 'boot-overlay dump-boot out' : 'boot-overlay dump-boot'}
      role="status"
      aria-live="polite"
      aria-busy={!fading}
    >
      <div className="dump-scene">
        <div className="progress-container">
          <div className="progress-box">
            <div className="progress-fill" />
          </div>
          <div className="progress-state state-load">{t('splash.loading')}</div>
          <div className="progress-state state-finish">{t('splash.done')}</div>
        </div>
        <Truck />
      </div>
      <h2>{title}</h2>
      <p>{sub}</p>
    </div>
  )
}
