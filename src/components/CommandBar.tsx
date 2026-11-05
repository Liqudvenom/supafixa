import { useState } from 'react'
import { BASES, ENGAGEMENTS, TRADES } from '../data'
import { useI18n } from '../i18n'
import type { Key } from '../i18n'
import type { DateWindow, Engagement, Mode } from '../types'
import { Icon } from './Icons'

type Props = {
  query: string
  mode: Mode
  allowedModes: Mode[]
  counts: Record<Mode, number>
  baseId: string
  borough: string
  boroughs: string[]
  radiusKm: number | null
  trade: string
  dateWindow: DateWindow
  payFloor: number | null
  engagement: Engagement | 'all'
  verifiedOnly: boolean
  urgentOnly: boolean
  onQuery: (value: string) => void
  onMode: (mode: Mode) => void
  onBase: (id: string) => void
  onBorough: (value: string) => void
  onRadius: (value: number | null) => void
  onTrade: (value: string) => void
  onDate: (value: DateWindow) => void
  onPay: (value: number | null) => void
  onEngagement: (value: Engagement | 'all') => void
  onVerified: () => void
  onUrgent: () => void
  onReset: () => void
}

const MODES: { id: Mode; label: Key }[] = [
  { id: 'work', label: 'nav.work' },
  { id: 'workers', label: 'nav.workers' },
  { id: 'companies', label: 'nav.companies' },
]

export function CommandBar(props: Props) {
  const { t, trade: tradeName, engagement: engagementName } = useI18n()
  const [filtersOpen, setFiltersOpen] = useState(false)
  const active = [
    props.borough !== 'all',
    props.radiusKm != null,
    props.trade !== 'all',
    props.dateWindow !== 'any',
    props.payFloor != null,
    props.engagement !== 'all',
    props.verifiedOnly,
    props.urgentOnly,
  ].filter(Boolean).length

  return (
    <div className="command">
      <div className="command-card">
        <div className="search-row">
          <label className="search">
            <Icon name="search" size={18} />
            <input
              value={props.query}
              onChange={(event) => props.onQuery(event.target.value)}
              placeholder={t('search.placeholder')}
              aria-label={t('search.placeholder')}
            />
            {props.query && (
              <button type="button" className="clear-search" onClick={() => props.onQuery('')} aria-label={t('search.clear')}>
                ×
              </button>
            )}
          </label>
          <button
            type="button"
            className={filtersOpen || active ? 'filter-btn on' : 'filter-btn'}
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((open) => !open)}
          >
            <Icon name="filter" size={17} />
            <span>{t('f.filters')}</span>
            {active > 0 && <em>{active}</em>}
          </button>
        </div>

        {props.allowedModes.length > 1 && <div className="modes" role="tablist" aria-label={t('search.modes')}>
          {MODES.filter((item) => props.allowedModes.includes(item.id)).map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={props.mode === item.id}
              className={props.mode === item.id ? 'mode-btn active' : 'mode-btn'}
              onClick={() => props.onMode(item.id)}
            >
              {t(item.label)}
              <span>{props.counts[item.id]}</span>
            </button>
          ))}
        </div>}

        <div className={filtersOpen ? 'filters open' : 'filters'}>
          <label className="field">
            <span>{t('f.from')}</span>
            <select value={props.baseId} onChange={(event) => props.onBase(event.target.value)} aria-label={t('f.fromAria')}>
              {BASES.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('f.location')}</span>
            <select value={props.borough} onChange={(event) => props.onBorough(event.target.value)} aria-label={t('f.location')}>
              <option value="all">{t('f.allBoroughs')}</option>
              {props.boroughs.map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('f.radius')}</span>
            <select
              value={props.radiusKm ?? 'any'}
              onChange={(event) => props.onRadius(event.target.value === 'any' ? null : Number(event.target.value))}
              aria-label={t('f.radiusAria')}
            >
              <option value="any">{t('f.anyDistance')}</option>
              {[5, 10, 15, 25, 40].map((km) => (
                <option key={km} value={km}>
                  {km} km
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('f.trade')}</span>
            <select value={props.trade} onChange={(event) => props.onTrade(event.target.value)} aria-label={t('f.tradeAria')}>
              <option value="all">{t('f.allTrades')}</option>
              {TRADES.map((trade) => (
                <option key={trade} value={trade}>
                  {tradeName(trade)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('f.date')}</span>
            <select
              value={props.dateWindow}
              onChange={(event) => props.onDate(event.target.value as DateWindow)}
              aria-label={t('f.date')}
            >
              <option value="any">{t('f.anyDate')}</option>
              <option value="week">{t('f.week')}</option>
              <option value="fortnight">{t('f.fortnight')}</option>
              <option value="month">{t('f.month')}</option>
            </select>
          </label>
          <label className="field">
            <span>{t('f.pay')}</span>
            <select
              value={props.payFloor ?? 'any'}
              onChange={(event) => props.onPay(event.target.value === 'any' ? null : Number(event.target.value))}
              aria-label={t('f.payAria')}
            >
              <option value="any">{t('f.anyPay')}</option>
              {[120, 160, 200].map((n) => (
                <option key={n} value={n}>
                  {t('f.payFloor', { n })}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>{t('f.type')}</span>
            <select
              value={props.engagement}
              onChange={(event) => props.onEngagement(event.target.value as Engagement | 'all')}
              aria-label={t('f.typeAria')}
            >
              <option value="all">{t('f.allTypes')}</option>
              {ENGAGEMENTS.map((item) => (
                <option key={item} value={item}>
                  {engagementName(item)}
                </option>
              ))}
            </select>
          </label>
          <button type="button" className={props.verifiedOnly ? 'toggle on' : 'toggle'} aria-pressed={props.verifiedOnly} onClick={props.onVerified}>
            {t('f.verified')}
          </button>
          <button type="button" className={props.urgentOnly ? 'toggle on urgent' : 'toggle'} aria-pressed={props.urgentOnly} onClick={props.onUrgent}>
            {t('f.urgent')}
          </button>
          <button type="button" className="reset-btn" onClick={props.onReset}>
            {t('f.reset')}
          </button>
        </div>
      </div>
    </div>
  )
}
