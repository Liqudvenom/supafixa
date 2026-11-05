import { useMemo, useState } from 'react'
import { normalisePostcode, sameAddress, searchReports, validPostcode } from '../clients'
import type { AddressReport, ClientRatings, PaidStatus, PropertyType } from '../clients'
import { TRADES } from '../data'
import { useI18n } from '../i18n'
import type { Key } from '../i18n'
import { TODAY } from '../importer'
import { PLACES } from '../places'
import { Icon } from './Icons'
import { PanelShell } from './SidePanels'

export type ClientTab = 'check' | 'review' | 'mine'

export type ReviewDraft = {
  addressId: string | null
  newAddress: { line: string; postcode: string; area: string; property: PropertyType } | null
  trade: string
  date: string
  stars: number
  ratings: ClientRatings
  paid: PaidStatus
  unpaidExtra: number
  text: string
}

type Props = {
  reports: AddressReport[]
  selectedId: string | null
  tab: ClientTab
  onTab: (tab: ClientTab) => void
  onSelect: (id: string | null) => void
  onPublish: (draft: ReviewDraft) => void
  onClose: () => void
}

const LEVEL_KEY = { good: 'cc.good', watch: 'cc.watch', risk: 'cc.risk' } as const
const PAID: PaidStatus[] = ['onTime', 'late', 'unpaid']
const PROPERTIES: PropertyType[] = ['house', 'flat', 'commercial']
const RATING_KEYS: { id: keyof ClientRatings; label: Key }[] = [
  { id: 'payment', label: 'bar.payment' },
  { id: 'communication', label: 'bar.communication' },
  { id: 'scope', label: 'bar.scope' },
  { id: 'site', label: 'bar.site' },
]

const money = (value: number) => `£${Math.round(value).toLocaleString('en-GB')}`

function flags(report: AddressReport): { key: Key; good: boolean }[] {
  if (!report.ratings) return []
  const out: { key: Key; good: boolean }[] = []
  const slips = report.late + report.unpaid
  if (report.ratings.payment < 3.2 || slips >= 2) out.push({ key: 'cc.flagLate', good: false })
  if (report.unpaidTotal > 0) out.push({ key: 'cc.flagUnpaid', good: false })
  if (report.ratings.scope < 3.2) out.push({ key: 'cc.flagScope', good: false })
  if (report.ratings.site < 3.2) out.push({ key: 'cc.flagSite', good: false })
  if (report.ratings.payment >= 4.6 && slips === 0) out.push({ key: 'cc.flagPays', good: true })
  if (report.ratings.scope >= 4.5) out.push({ key: 'cc.flagClear', good: true })
  return out
}

export function RatingBadge({ report, large = false }: { report: AddressReport; large?: boolean }) {
  const { t } = useI18n()
  if (report.rating == null) return <span className={large ? 'rating-badge none large' : 'rating-badge none'}>{t('cc.none')}</span>
  return (
    <span className={`rating-badge ${report.level}${large ? ' large' : ''}`}>
      {report.rating.toFixed(1)} <i>★</i>
    </span>
  )
}

function StarInput({ value, onChange, label }: { value: number; onChange: (value: number) => void; label: string }) {
  return (
    <div className="star-input" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} / 5`}
          className={n <= value ? 'on' : ''}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export function ClientCheckPanel({ reports, selectedId, tab, onTab, onSelect, onPublish, onClose }: Props) {
  const i18n = useI18n()
  const { t } = i18n
  const [query, setQuery] = useState('')
  const [prefill, setPrefill] = useState('')
  const selected = reports.find((report) => report.id === selectedId) ?? null
  const mine = reports.flatMap((report) => report.reviews.filter((review) => review.mine).map((review) => ({ review, report })))

  const startReview = (postcode = '') => {
    setPrefill(postcode)
    onTab('review')
  }

  return (
    <PanelShell eyebrow={t('cc.eyebrow')} title={t('cc.title')} onClose={onClose}>
      <div className="seg" role="tablist" aria-label={t('cc.title')}>
        {(
          [
            ['check', 'cc.tabCheck'],
            ['review', 'cc.tabReview'],
            ['mine', 'cc.tabMine'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => onTab(id)}>
            {t(label)}
            {id === 'mine' && mine.length > 0 && <em>{mine.length}</em>}
          </button>
        ))}
      </div>

      {tab === 'check' &&
        (selected ? (
          <AddressDetail report={selected} onBack={() => onSelect(null)} onReview={() => startReview()} />
        ) : (
          <AddressList
            reports={reports}
            query={query}
            onQuery={setQuery}
            onSelect={onSelect}
            onNew={() => startReview(validPostcode(query) ? query : '')}
          />
        ))}

      {tab === 'review' && (
        <ReviewForm
          key={`${selectedId ?? 'none'}-${prefill}`}
          reports={reports}
          initialId={selectedId}
          initialPostcode={prefill}
          onPublish={(draft) => {
            setPrefill('')
            onPublish(draft)
          }}
        />
      )}

      {tab === 'mine' && (
        <div className="stack">
          {mine.length === 0 && <p className="muted-line">{t('cc.mineEmpty')}</p>}
          {mine.map(({ review, report }) => (
            <button
              type="button"
              key={review.id}
              className="address-row"
              onClick={() => {
                onSelect(report.id)
                onTab('check')
              }}
            >
              <RatingBadge report={{ ...report, rating: review.stars, level: review.stars >= 4 ? 'good' : review.stars >= 3 ? 'watch' : 'risk' }} />
              <span>
                <strong>{report.line}</strong>
                <small>
                  {report.postcode} · {i18n.day(review.date)}
                </small>
              </span>
            </button>
          ))}
        </div>
      )}

      <p className="disclaimer">{t('cc.fictional')}</p>
    </PanelShell>
  )
}

function AddressList({
  reports,
  query,
  onQuery,
  onSelect,
  onNew,
}: {
  reports: AddressReport[]
  query: string
  onQuery: (value: string) => void
  onSelect: (id: string) => void
  onNew: () => void
}) {
  const { t, count } = useI18n()
  const results = useMemo(
    () =>
      searchReports(reports, query).sort(
        (a, b) => (b.reviews[0]?.date ?? '').localeCompare(a.reviews[0]?.date ?? ''),
      ),
    [reports, query],
  )

  return (
    <>
      <p className="panel-intro">{t('cc.intro')}</p>
      <label className="search light">
        <Icon name="search" size={17} />
        <input value={query} onChange={(event) => onQuery(event.target.value)} placeholder={t('cc.search')} aria-label={t('cc.search')} />
        {query && (
          <button type="button" className="clear-search" onClick={() => onQuery('')} aria-label={t('search.clear')}>
            ×
          </button>
        )}
      </label>
      {results.length === 0 ? (
        <div className="empty-box">
          <strong>{t('cc.noMatch')}</strong>
          <p>{t('cc.noMatchBody')}</p>
          <button type="button" className="btn primary" onClick={onNew}>
            {t('cc.reviewNew')}
          </button>
        </div>
      ) : (
        <>
          <p className="list-count">{count('address', results.length)}</p>
          <div className="stack">
            {results.map((report) => (
              <button type="button" key={report.id} className="address-row" onClick={() => onSelect(report.id)}>
                <RatingBadge report={report} />
                <span>
                  <strong>{report.line}</strong>
                  <small>
                    {report.postcode} · {report.area}
                  </small>
                </span>
                <em className={`level ${report.level ?? 'none'}`}>
                  {report.level ? t(LEVEL_KEY[report.level]) : t('cc.none')}
                  <small>{count('review', report.reviews.length)}</small>
                </em>
              </button>
            ))}
          </div>
          <button type="button" className="btn ghost wide" onClick={onNew}>
            {t('cc.reviewNew')}
          </button>
        </>
      )}
    </>
  )
}

function AddressDetail({ report, onBack, onReview }: { report: AddressReport; onBack: () => void; onReview: () => void }) {
  const i18n = useI18n()
  const { t, count } = i18n
  const total = report.reviews.length
  const onTime = report.reviews.filter((review) => review.paid === 'onTime').length

  return (
    <>
      <button type="button" className="back-link" onClick={onBack}>
        ← {t('cc.back')}
      </button>
      <div className="identity">
        <span className={`avatar-tile house ${report.level ?? 'none'}`}>
          <Icon name="home" size={22} />
        </span>
        <div>
          <h2>{report.line}</h2>
          <p className="where">
            {report.postcode} · {report.area} · {report.borough}
          </p>
        </div>
      </div>

      <div className={`rating-hero ${report.level ?? 'none'}`}>
        <RatingBadge report={report} large />
        <div>
          <strong>{report.level ? t(LEVEL_KEY[report.level]) : t('cc.none')}</strong>
          <span>{total ? count('review', total) : t('cc.noHistory')}</span>
        </div>
      </div>

      {report.ratings && (
        <div className="bars">
          {RATING_KEYS.map((item) => {
            const value = report.ratings![item.id]
            return (
              <div className="bar-row" key={item.id}>
                <div>
                  <span>{t(item.label)}</span>
                  <b>{value.toFixed(1)} / 5</b>
                </div>
                <div className="bar-track">
                  <i className={value >= 4.2 ? 'good' : value >= 3.2 ? 'mid' : 'bad'} style={{ width: `${value * 20}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      <dl className="meta-list">
        <div>
          <dt>{t('cc.statOnTime')}</dt>
          <dd>{total ? t('cc.statOnTimeValue', { n: onTime, total }) : '—'}</dd>
        </div>
        <div>
          <dt>{t('cc.statUnpaid')}</dt>
          <dd className={report.unpaidTotal > 0 ? 'bad-text' : ''}>{money(report.unpaidTotal)}</dd>
        </div>
        <div>
          <dt>{t('cc.statLast')}</dt>
          <dd>{report.reviews[0] ? i18n.day(report.reviews[0].date) : '—'}</dd>
        </div>
        <div>
          <dt>{t('cc.statProperty')}</dt>
          <dd>{t(`cc.property.${report.property}`)}</dd>
        </div>
      </dl>

      {flags(report).length > 0 && (
        <ul className="chips">
          {flags(report).map((flag) => (
            <li key={flag.key} className={flag.good ? 'chip-good' : 'chip-bad'}>
              {t(flag.key)}
            </li>
          ))}
        </ul>
      )}

      <button type="button" className="btn primary wide" onClick={onReview}>
        {t('cc.reviewThis')}
      </button>

      {total > 0 && (
        <>
          <h3>{t('cc.reviewsTitle')}</h3>
          <div className="stack">
            {report.reviews.map((review) => (
              <article key={review.id} className={review.mine ? 'review-card mine' : 'review-card'}>
                <div className="review-top">
                  <span className="stars">
                    {'★★★★★'.slice(0, review.stars)}
                    <span className="stars-off">{'★★★★★'.slice(review.stars)}</span>
                  </span>
                  <time dateTime={review.date}>{i18n.day(review.date)}</time>
                </div>
                <p>{review.text[i18n.lang]}</p>
                <div className="review-foot">
                  <span className="review-by">{t(review.mine ? 'cc.byYou' : 'cc.by', { trade: i18n.trade(review.trade) })}</span>
                  <span className={`pill paid-${review.paid}`}>{t(`cc.paid.${review.paid}`)}</span>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </>
  )
}

function ReviewForm({
  reports,
  initialId,
  initialPostcode,
  onPublish,
}: {
  reports: AddressReport[]
  initialId: string | null
  initialPostcode: string
  onPublish: (draft: ReviewDraft) => void
}) {
  const i18n = useI18n()
  const { t } = i18n
  const [addressId, setAddressId] = useState<string>(initialPostcode ? 'new' : (initialId ?? ''))
  const [line, setLine] = useState('')
  const [postcode, setPostcode] = useState(initialPostcode)
  const [area, setArea] = useState('')
  const [property, setProperty] = useState<PropertyType>('house')
  const [trade, setTrade] = useState(TRADES[0])
  const [date, setDate] = useState(TODAY)
  const [stars, setStars] = useState(0)
  const [ratings, setRatings] = useState<ClientRatings>({ payment: 0, communication: 0, scope: 0, site: 0 })
  const [paid, setPaid] = useState<PaidStatus>('onTime')
  const [extra, setExtra] = useState('')
  const [text, setText] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [tried, setTried] = useState(false)

  const isNew = addressId === 'new'
  const postcodeOk = validPostcode(postcode)
  const existing = isNew && line.trim() && postcodeOk ? reports.find((report) => sameAddress(report, { line, postcode })) : undefined
  const addressOk = isNew ? line.trim().length > 2 && postcodeOk && area !== '' : addressId !== ''
  const ready = addressOk && stars > 0 && text.trim().length >= 10 && confirmed

  const submit = () => {
    setTried(true)
    if (!ready) return
    const filled = (Object.keys(ratings) as (keyof ClientRatings)[]).reduce(
      (acc, key) => ({ ...acc, [key]: ratings[key] || stars }),
      ratings,
    )
    onPublish({
      addressId: isNew ? (existing?.id ?? null) : addressId,
      newAddress: isNew && !existing ? { line: line.trim(), postcode: normalisePostcode(postcode), area, property } : null,
      trade,
      date,
      stars,
      ratings: filled,
      paid,
      unpaidExtra: paid === 'onTime' ? 0 : Math.max(0, Number(extra) || 0),
      text: text.trim(),
    })
  }

  return (
    <form
      className="draft"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <p className="privacy-note">{t('cc.form.textHint')}</p>
      <label className="form-field">
        <span>{t('cc.form.address')}</span>
        <select value={addressId} onChange={(event) => setAddressId(event.target.value)} aria-invalid={tried && !addressOk}>
          <option value="">{t('cc.form.pick')}</option>
          {reports.map((report) => (
            <option key={report.id} value={report.id}>
              {report.line}, {report.postcode}
            </option>
          ))}
          <option value="new">{t('cc.form.new')}</option>
        </select>
      </label>

      {isNew && (
        <>
          <label className="form-field">
            <span>{t('cc.form.line')}</span>
            <input value={line} onChange={(event) => setLine(event.target.value)} placeholder="12 Example Road" />
          </label>
          <div className="form-pair">
            <label className="form-field">
              <span>{t('cc.form.postcode')}</span>
              <input
                value={postcode}
                onChange={(event) => setPostcode(event.target.value.toUpperCase())}
                placeholder="W3 9ZZ"
                aria-invalid={postcode !== '' && !postcodeOk}
              />
            </label>
            <label className="form-field">
              <span>{t('cc.form.area')}</span>
              <select value={area} onChange={(event) => setArea(event.target.value)} aria-invalid={tried && !area}>
                <option value="">{t('import.pickLocation')}</option>
                {PLACES.map((place) => (
                  <option key={place.name} value={place.name}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {postcode !== '' && !postcodeOk && <p className="field-warn">{t('cc.form.badPostcode')}</p>}
          {existing && <p className="removed-note">{t('cc.form.exists')}</p>}
          <label className="form-field">
            <span>{t('cc.form.property')}</span>
            <select value={property} onChange={(event) => setProperty(event.target.value as PropertyType)}>
              {PROPERTIES.map((item) => (
                <option key={item} value={item}>
                  {t(`cc.property.${item}`)}
                </option>
              ))}
            </select>
          </label>
        </>
      )}

      <div className="form-pair">
        <label className="form-field">
          <span>{t('cc.form.trade')}</span>
          <select value={trade} onChange={(event) => setTrade(event.target.value)}>
            {TRADES.map((item) => (
              <option key={item} value={item}>
                {i18n.trade(item)}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>{t('cc.form.date')}</span>
          <input type="date" value={date} max={TODAY} onChange={(event) => setDate(event.target.value)} />
        </label>
      </div>

      <div className="rate-block">
        <div className="rate-row main">
          <span>{t('cc.form.overall')}</span>
          <StarInput value={stars} onChange={setStars} label={t('cc.form.overall')} />
        </div>
        {RATING_KEYS.map((item) => (
          <div className="rate-row" key={item.id}>
            <span>{t(item.label)}</span>
            <StarInput
              value={ratings[item.id]}
              onChange={(value) => setRatings((prev) => ({ ...prev, [item.id]: value }))}
              label={t(item.label)}
            />
          </div>
        ))}
      </div>

      <div className="form-field">
        <span>{t('cc.form.paid')}</span>
        <div className="seg small">
          {PAID.map((item) => (
            <button key={item} type="button" className={paid === item ? 'on' : ''} aria-pressed={paid === item} onClick={() => setPaid(item)}>
              {t(`cc.paid.${item}`)}
            </button>
          ))}
        </div>
      </div>
      {paid !== 'onTime' && (
        <label className="form-field">
          <span>{t('cc.form.extra')}</span>
          <input inputMode="numeric" value={extra} onChange={(event) => setExtra(event.target.value.replace(/[^\d]/g, ''))} placeholder="0" />
        </label>
      )}

      <label className="form-field">
        <span>{t('cc.form.text')}</span>
        <textarea rows={4} maxLength={500} value={text} onChange={(event) => setText(event.target.value)} />
      </label>

      <label className="check-field">
        <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
        <span>{t('cc.form.confirm')}</span>
      </label>

      {tried && !ready && <p className="field-warn">{t('cc.form.missing')}</p>}
      <button type="submit" className="btn primary wide">
        {t('cc.form.submit')}
      </button>
    </form>
  )
}

export function LockedPanel({
  requested,
  onRequest,
  onSwitch,
  onClose,
}: {
  requested: boolean
  onRequest: () => void
  onSwitch: () => void
  onClose: () => void
}) {
  const { t } = useI18n()
  return (
    <PanelShell eyebrow={t('nav.locked')} title={t('lock.title')} onClose={onClose}>
      <div className="lock-hero">
        <Icon name="lock" size={26} />
      </div>
      <p className="panel-intro">{t('lock.body')}</p>
      <ul className="ticks">
        {(['lock.point1', 'lock.point2', 'lock.point3'] as const).map((key) => (
          <li key={key}>
            <Icon name="check" size={16} />
            {t(key)}
          </li>
        ))}
      </ul>
      <button type="button" className="btn primary wide" disabled={requested} onClick={onRequest}>
        {t(requested ? 'lock.requested' : 'lock.request')}
      </button>
      <button type="button" className="btn ghost wide" onClick={onSwitch}>
        <Icon name="swap" size={15} /> {t('lock.switch')}
      </button>
      <p className="disclaimer">{t('profile.test')}</p>
    </PanelShell>
  )
}
