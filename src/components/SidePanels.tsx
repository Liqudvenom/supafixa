import type { ReactNode } from 'react'
import { REVIEW_PL, RISK_PL } from '../content'
import { BASES, BOROUGH_RISK, REVIEWS, recordById } from '../data'
import { useI18n } from '../i18n'
import { PROFILES } from '../profiles'
import type { ProfileId } from '../profiles'
import type { BoroughRisk, MarketplaceRecord } from '../types'
import { Icon } from './Icons'

export function PanelShell({
  eyebrow,
  title,
  onClose,
  children,
}: {
  eyebrow: string
  title: string
  onClose: () => void
  children: ReactNode
}) {
  const { t } = useI18n()
  return (
    <aside className="drawer" aria-label={title}>
      <div className="drawer-head">
        <span>{eyebrow}</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('panel.close')}>
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="drawer-body">
        <h2 className="panel-title">{title}</h2>
        {children}
      </div>
    </aside>
  )
}

function Stars({ count }: { count: number }) {
  return (
    <span className="stars" aria-label={`${count} / 5`}>
      {'★★★★★'.slice(0, count)}
      {'☆☆☆☆☆'.slice(count)}
    </span>
  )
}

export function ReviewsPanel({
  focusId,
  onClose,
  onClearFocus,
  onShow,
}: {
  focusId: string | null
  onClose: () => void
  onClearFocus: () => void
  onShow: (id: string) => void
}) {
  const i18n = useI18n()
  const { t, lang } = i18n
  const reviews = focusId ? REVIEWS.filter((review) => review.recordId === focusId) : REVIEWS
  const focus = focusId ? recordById(focusId) : undefined

  return (
    <PanelShell eyebrow={t('reviews.eyebrow')} title={t('reviews.title')} onClose={onClose}>
      <p className="panel-intro">{t('reviews.intro')}</p>
      {focus && (
        <button type="button" className="filter-chip" onClick={onClearFocus}>
          {t('reviews.showAll', { title: i18n.view(focus).title })}
        </button>
      )}
      {reviews.length === 0 && <p className="muted-line">{t('reviews.empty')}</p>}
      <div className="stack">
        {reviews.map((review) => {
          const subject = recordById(review.recordId)
          return (
            <article key={review.id} className="review-card">
              <div className="review-top">
                <Stars count={review.stars} />
                <time dateTime={review.date}>{i18n.day(review.date)}</time>
              </div>
              <p>{lang === 'pl' ? (REVIEW_PL[review.id] ?? review.text) : review.text}</p>
              <p className="review-by">
                {review.author} · {i18n.tx(review.role)}
              </p>
              {subject && (
                <button type="button" className="btn ghost" onClick={() => onShow(subject.id)}>
                  {t('reviews.show', { title: i18n.view(subject).title })}
                </button>
              )}
            </article>
          )
        })}
      </div>
    </PanelShell>
  )
}

export function RiskPanel({ onClose, onFocus }: { onClose: () => void; onFocus: (borough: BoroughRisk) => void }) {
  const { t, lang } = useI18n()
  return (
    <PanelShell eyebrow={t('risk.eyebrow')} title={t('risk.title')} onClose={onClose}>
      <p className="panel-intro">{t('risk.intro')}</p>
      <div className="stack">
        {BOROUGH_RISK.map((borough) => (
          <button type="button" key={borough.borough} className="risk-row" onClick={() => onFocus(borough)}>
            <div className="risk-top">
              <strong>{borough.borough}</strong>
              <b>{borough.payment.toFixed(1)}</b>
            </div>
            <div className="bar-track">
              <i
                className={borough.payment >= 8.5 ? 'good' : borough.payment >= 7.8 ? 'mid' : 'warm'}
                style={{ width: `${borough.payment * 10}%` }}
              />
            </div>
            <p>
              {t(borough.disputes === 'Watch' ? 'risk.watch' : 'risk.low')} · {t('risk.verified', { v: borough.verification })}
            </p>
            <span>{lang === 'pl' ? (RISK_PL[borough.borough] ?? borough.note) : borough.note}</span>
          </button>
        ))}
      </div>
    </PanelShell>
  )
}

export function ApplicationsPanel({
  ids,
  lookup,
  onClose,
  onShow,
}: {
  ids: readonly string[]
  lookup: (id: string) => MarketplaceRecord | undefined
  onClose: () => void
  onShow: (id: string) => void
}) {
  const i18n = useI18n()
  const { t } = i18n
  const records = ids.map(lookup).filter((record) => record != null)

  return (
    <PanelShell eyebrow={t('apps.eyebrow')} title={t('apps.title')} onClose={onClose}>
      <p className="panel-intro">{t('apps.intro')}</p>
      {records.length === 0 && <p className="muted-line">{t('apps.empty')}</p>}
      <div className="stack">
        {records.map((record) => {
          const view = i18n.view(record)
          return (
            <article key={record.id} className="app-row">
              <div>
                <strong>{view.title}</strong>
                <span>
                  {record.location} · {view.payLabel}
                </span>
              </div>
              <em>{t('apps.stored')}</em>
              <button type="button" className="btn ghost" onClick={() => onShow(record.id)}>
                {t('apps.show')}
              </button>
            </article>
          )
        })}
      </div>
    </PanelShell>
  )
}

export function SettingsPanel({
  baseId,
  pulse,
  access,
  onClose,
  onBase,
  onPulse,
  onClear,
  onAccess,
}: {
  baseId: string
  pulse: boolean
  access: Record<ProfileId, boolean>
  onClose: () => void
  onBase: (id: string) => void
  onPulse: () => void
  onClear: () => void
  onAccess: (id: ProfileId) => void
}) {
  const { t, lang, setLang } = useI18n()
  return (
    <PanelShell eyebrow={t('settings.eyebrow')} title={t('settings.title')} onClose={onClose}>
      <p className="panel-intro">{t('settings.intro')}</p>
      <label className="setting-row">
        <span>{t('head.language')}</span>
        <select value={lang} onChange={(event) => setLang(event.target.value === 'en' ? 'en' : 'pl')}>
          <option value="pl">Polski</option>
          <option value="en">English</option>
        </select>
      </label>
      <label className="setting-row">
        <span>{t('settings.from')}</span>
        <select value={baseId} onChange={(event) => onBase(event.target.value)}>
          {BASES.map((base) => (
            <option key={base.id} value={base.id}>
              {base.label}
            </option>
          ))}
        </select>
      </label>
      <button type="button" className={pulse ? 'toggle on' : 'toggle'} aria-pressed={pulse} onClick={onPulse}>
        {t('settings.pulse')}
      </button>
      <button type="button" className="btn ghost wide" onClick={onClear}>
        {t('settings.clear')}
      </button>
      <h3>{t('settings.features')}</h3>
      <p className="panel-intro">{t('settings.featuresIntro')}</p>
      <div className="stack">
        {PROFILES.map((profile) => (
          <label key={profile.id} className="setting-row feature-row">
            <span>
              <strong>{profile.role[lang]}</strong>
              <small>CLIENT_CHECK={access[profile.id] ? 'true' : 'false'}</small>
            </span>
            <input type="checkbox" className="switch" checked={access[profile.id]} onChange={() => onAccess(profile.id)} />
          </label>
        ))}
      </div>
    </PanelShell>
  )
}
