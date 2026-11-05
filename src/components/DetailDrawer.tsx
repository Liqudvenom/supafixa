import { useI18n } from '../i18n'
import { formatKm } from '../model'
import type { AddressReport } from '../clients'
import type { PlacedRecord } from '../types'
import { RatingBadge } from './ClientCheckPanel'
import { Icon } from './Icons'

type Props = {
  record: PlacedRecord
  saved: boolean
  done: boolean
  actionLabel: string
  onClose: () => void
  onAct: () => void
  onSave: () => void
  onReviews: () => void
  onRemove: () => void
  client: { report: AddressReport } | 'locked' | null
  onClientReport: () => void
}

function tone(value: number) {
  if (value >= 8.8) return 'good'
  if (value >= 8.2) return 'mid'
  return 'warm'
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div className="bar-row">
      <div>
        <span>{label}</span>
        <b>{value.toFixed(1)} / 10</b>
      </div>
      <div className="bar-track">
        <i className={tone(value)} style={{ width: `${value * 10}%` }} />
      </div>
    </div>
  )
}

export function DetailDrawer({
  record,
  saved,
  done,
  actionLabel,
  onClose,
  onAct,
  onSave,
  onReviews,
  onRemove,
  client,
  onClientReport,
}: Props) {
  const i18n = useI18n()
  const { t } = i18n
  const view = i18n.view(record)

  const status = record.source
    ? t('status.source', { name: record.source.name })
    : record.imported
      ? t('status.imported')
    : record.verified
      ? t(record.kind === 'company' ? 'status.company' : record.kind === 'worker' ? 'status.worker' : 'status.job', {
          trade: view.trade,
        })
      : t('status.pending')

  return (
    <aside className="drawer" aria-label={t('drawer.label')}>
      <div className="drawer-head">
        <span>{t('drawer.label')}</span>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t('drawer.close')}>
          <Icon name="close" size={16} />
        </button>
      </div>
      <div className="drawer-body">
        <div className="identity">
          <span className={`avatar-tile ${record.urgent ? 'urgent' : record.kind}`}>{record.initials}</span>
          <div>
            <h2>{view.title}</h2>
            <p className={record.verified ? 'pill ok' : 'pill wait'}>{status}</p>
            <p className="where">
              {record.location} · {record.borough} · {formatKm(record.distanceKm)}
            </p>
          </div>
        </div>

        {client === 'locked' && (
          <button type="button" className="client-strip locked" onClick={onClientReport}>
            <Icon name="lock" size={16} />
            <span>
              <strong>{t('cc.jobClient')}</strong>
              <small>{t('cc.lockedTeaser')}</small>
            </span>
          </button>
        )}
        {client && client !== 'locked' && (
          <button type="button" className={`client-strip ${client.report.level ?? 'none'}`} onClick={onClientReport}>
            <RatingBadge report={client.report} />
            <span>
              <strong>{t('cc.jobClient')}</strong>
              <small>
                {client.report.level ? t(`cc.${client.report.level}`) : t('cc.noHistory')} · {t('cc.openReport')}
              </small>
            </span>
          </button>
        )}

        {record.scores ? (
          <>
            <div className="score-block">
              <div>
                <p>{t(record.kind === 'job' ? 'score.poster' : 'score.ops')}</p>
                <strong>
                  {record.scores.overall.toFixed(1)} <span>/ 10</span>
                </strong>
              </div>
              <span className="shield">
                <Icon name="shield" size={18} />
              </span>
            </div>
            <div className="bars">
              <Bar label={t('bar.payment')} value={record.scores.payment} />
              <Bar label={t('bar.communication')} value={record.scores.communication} />
              <Bar label={t('bar.scope')} value={record.scores.scope} />
              <Bar label={t('bar.site')} value={record.scores.site} />
            </div>
          </>
        ) : (
          <div className="score-block empty-score">
            <div>
              <p>{t('score.none')}</p>
              <span>{t('score.noneBody')}</span>
            </div>
          </div>
        )}

        <dl className="meta-list">
          {record.kind === 'job' && (
            <>
              <div>
                <dt>{t('m.postedBy')}</dt>
                <dd>{view.poster}</dd>
              </div>
              <div>
                <dt>{t('m.applicants')}</dt>
                <dd>{record.applicants}</dd>
              </div>
              <div>
                <dt>{t('m.starts')}</dt>
                <dd>{i18n.day(record.start)}</dd>
              </div>
              <div>
                <dt>{t('m.duration')}</dt>
                <dd>{view.duration}</dd>
              </div>
            </>
          )}
          {record.kind === 'worker' && (
            <>
              <div>
                <dt>{t('m.trade')}</dt>
                <dd>{view.trade}</dd>
              </div>
              <div>
                <dt>{t('m.experience')}</dt>
                <dd>{view.experience || '—'}</dd>
              </div>
              <div>
                <dt>{t('m.radius')}</dt>
                <dd>{record.radiusKm} km</dd>
              </div>
              <div>
                <dt>{t('m.availability')}</dt>
                <dd>{view.availability}</dd>
              </div>
            </>
          )}
          {record.kind === 'company' && (
            <>
              <div>
                <dt>{t('m.seeking')}</dt>
                <dd>{view.seeking}</dd>
              </div>
              <div>
                <dt>{t('m.collabs')}</dt>
                <dd>{record.collaborations}</dd>
              </div>
              <div>
                <dt>{t('m.extra')}</dt>
                <dd>{record.extraCost ?? '—'}</dd>
              </div>
              <div>
                <dt>{t('m.last')}</dt>
                <dd>{i18n.day(record.lastActive)}</dd>
              </div>
            </>
          )}
          <div>
            <dt>{t('m.employment')}</dt>
            <dd>{view.engagements.join(', ')}</dd>
          </div>
          <div>
            <dt>{t(record.kind === 'company' ? 'm.payBasis' : 'm.pay')}</dt>
            <dd>{view.payLabel}</dd>
          </div>
        </dl>

        <p className="lead">{view.summary}</p>

        {record.kind === 'worker' && (
          <>
            <h3>{t('sec.skills')}</h3>
            <Chips items={view.skills} none={t('sec.none')} />
            <h3>{t('sec.certs')}</h3>
            <Chips items={view.certifications} none={t('sec.none')} />
            <h3>{t('sec.languages')}</h3>
            <Chips items={view.languages} none={t('sec.none')} />
            <h3>{t('sec.prefs')}</h3>
            <Chips items={view.preferences} none={t('sec.none')} />
          </>
        )}
        {record.kind !== 'worker' && view.skills.length > 0 && (
          <>
            <h3>{t(record.kind === 'company' ? 'sec.hires' : 'sec.scope')}</h3>
            <Chips items={view.skills} none={t('sec.none')} />
          </>
        )}
        {record.kind === 'job' && view.certifications.length > 0 && (
          <>
            <h3>{t('sec.certs')}</h3>
            <Chips items={view.certifications} none={t('sec.none')} />
          </>
        )}
        {record.kind === 'company' && view.preferences.length > 0 && (
          <>
            <h3>{t('sec.terms')}</h3>
            <Chips items={view.preferences} none={t('sec.none')} />
          </>
        )}
        {view.history.length > 0 && (
          <>
            <h3>{t('sec.history')}</h3>
            <ul className="history">
              {view.history.map((item) => (
                <li key={`${item.title}-${item.when}`}>
                  <strong>{item.title}</strong>
                  <span>
                    {item.with} · {item.when}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
        {record.source && (
          <div className="source-box">
            <p>{t('drawer.sourceNote', { name: record.source.name })}</p>
            <a className="btn ghost wide link-btn" href={record.source.url} target="_blank" rel="noopener noreferrer">
              {t('drawer.original', { name: record.source.name })} ↗
            </a>
          </div>
        )}
        {record.imported && record.contactsRemoved ? (
          <p className="disclaimer">{t('drawer.contacts', { n: record.contactsRemoved })}</p>
        ) : null}
        <p className="disclaimer">{t('drawer.disclaimer')}</p>
      </div>
      <div className="drawer-actions">
        <button type="button" className="btn primary" disabled={done} onClick={onAct}>
          {actionLabel}
        </button>
        <button type="button" className={saved ? 'btn quiet on' : 'btn ghost'} onClick={onSave}>
          {t(saved ? 'card.saved' : 'card.save')}
        </button>
        {record.imported ? (
          <button type="button" className="btn ghost" onClick={onRemove}>
            {t('drawer.remove')}
          </button>
        ) : (
          <button type="button" className="btn ghost" onClick={onReviews}>
            {t('drawer.reviews')}
          </button>
        )}
      </div>
    </aside>
  )
}

function Chips({ items, none }: { items: string[]; none: string }) {
  if (!items.length) return <p className="muted-line">{none}</p>
  return (
    <ul className="chips">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}
