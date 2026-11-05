import { useEffect, useRef } from 'react'
import { useI18n } from '../i18n'
import type { I18n, Key } from '../i18n'
import { formatKm, modeKind } from '../model'
import type { Mode, PlacedRecord } from '../types'

type Props = {
  mode: Mode
  savedView: boolean
  records: PlacedRecord[]
  baseLabel: string
  selectedId: string | null
  savedIds: readonly string[]
  appliedIds: readonly string[]
  invitedIds: readonly string[]
  enquiredIds: readonly string[]
  collapsed: boolean
  emptyTitle: string
  emptyBody: string
  emptyAction: { label: string; run: () => void } | null
  onToggle: () => void
  onOpen: (id: string) => void
  onAct: (id: string) => void
  onSave: (id: string) => void
  onMeasure: (height: number) => void
}

const TITLES: Record<Mode, Key> = {
  work: 'sheet.work',
  workers: 'sheet.workers',
  companies: 'sheet.companies',
}

export function actionLabel(
  record: PlacedRecord | { id: string; kind: PlacedRecord['kind'] },
  ids: { applied: readonly string[]; invited: readonly string[]; enquired: readonly string[] },
  t: I18n['t'],
) {
  if (record.kind === 'job') {
    const done = ids.applied.includes(record.id)
    return { label: t(done ? 'card.applied' : 'card.apply'), done }
  }
  if (record.kind === 'worker') {
    const done = ids.invited.includes(record.id)
    return { label: t(done ? 'card.invited' : 'card.invite'), done }
  }
  const done = ids.enquired.includes(record.id)
  return { label: t(done ? 'card.sent' : 'card.enquire'), done }
}

export function OpportunitySheet({
  mode,
  savedView,
  records,
  baseLabel,
  selectedId,
  savedIds,
  appliedIds,
  invitedIds,
  enquiredIds,
  collapsed,
  emptyTitle,
  emptyBody,
  emptyAction,
  onToggle,
  onOpen,
  onAct,
  onSave,
  onMeasure,
}: Props) {
  const i18n = useI18n()
  const { t } = i18n
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const apply = () => onMeasure(node.offsetHeight)
    apply()
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => observer.disconnect()
  }, [onMeasure, collapsed, records.length])

  useEffect(() => {
    if (!selectedId || collapsed) return
    document.getElementById(`opp-${selectedId}`)?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }, [selectedId, collapsed])

  const facts = (record: PlacedRecord) => {
    const view = i18n.view(record)
    if (record.kind === 'job') {
      return [
        t('card.starts', { date: i18n.day(record.start) }),
        view.duration,
        i18n.count('applicant', record.applicants ?? 0),
      ].join(' · ')
    }
    if (record.kind === 'worker') {
      return [view.availability, view.experience, view.languages.join(' · ')].filter(Boolean).join(' · ')
    }
    return [view.seeking, i18n.count('collab', record.collaborations ?? 0)].filter(Boolean).join(' · ')
  }

  return (
    <section className={collapsed ? 'sheet collapsed' : 'sheet'} ref={ref} aria-label={t('sheet.label')}>
      <div className="sheet-head">
        <div>
          <h2>{t(savedView ? 'sheet.saved' : TITLES[mode])}</h2>
          <p>{t('sheet.count', { count: i18n.count(modeKind(mode), records.length), base: baseLabel })}</p>
        </div>
        <button type="button" className="btn ghost" onClick={onToggle}>
          {t(collapsed ? 'sheet.show' : 'sheet.hide')}
        </button>
      </div>
      {!collapsed && (
        <>
          {records.length === 0 ? (
            <div className="empty">
              <strong>{emptyTitle}</strong>
              <p>{emptyBody}</p>
              {emptyAction && (
                <button type="button" className="btn primary" onClick={emptyAction.run}>
                  {emptyAction.label}
                </button>
              )}
            </div>
          ) : (
            <div className="card-row">
              {records.map((record) => {
                const view = i18n.view(record)
                const action = actionLabel(record, { applied: appliedIds, invited: invitedIds, enquired: enquiredIds }, t)
                const saved = savedIds.includes(record.id)
                return (
                  <article
                    key={record.id}
                    id={`opp-${record.id}`}
                    className={['opp-card', record.urgent ? 'urgent' : '', record.id === selectedId ? 'selected' : '']
                      .filter(Boolean)
                      .join(' ')}
                    onClick={() => onOpen(record.id)}
                  >
                    <div className="card-top">
                      <div className="pills">
                        <span className="pill trade">{view.trade}</span>
                        {record.urgent && <span className="pill warn">{t('card.urgent')}</span>}
                        {record.imported ? (
                          <span className="pill import">
                            {record.source ? t('card.source', { name: record.source.name }) : t('card.imported')}
                          </span>
                        ) : (
                          <span className={record.verified ? 'pill ok' : 'pill wait'}>
                            {t(record.verified ? 'card.verified' : 'card.unverified')}
                          </span>
                        )}
                      </div>
                      <strong className="fare">{view.payLabel}</strong>
                    </div>
                    <h3>{view.title}</h3>
                    <p className="card-meta">
                      {record.location} · {record.borough} · {formatKm(record.distanceKm)}
                      {record.postedHours != null && <> · {t('card.posted', { when: i18n.ago(record.postedHours) })}</>}
                    </p>
                    <p className="card-facts">{facts(record)}</p>
                    <p className="summary">{view.summary}</p>
                    <div className="card-actions">
                      <button
                        type="button"
                        className="btn primary"
                        onClick={(event) => {
                          event.stopPropagation()
                          onOpen(record.id)
                        }}
                      >
                        {t(record.kind === 'worker' ? 'card.profile' : 'card.details')}
                      </button>
                      <button
                        type="button"
                        className="btn ghost"
                        disabled={action.done}
                        onClick={(event) => {
                          event.stopPropagation()
                          onAct(record.id)
                        }}
                      >
                        {action.label}
                      </button>
                      <button
                        type="button"
                        className={saved ? 'btn quiet on' : 'btn quiet'}
                        onClick={(event) => {
                          event.stopPropagation()
                          onSave(record.id)
                        }}
                      >
                        {t(saved ? 'card.saved' : 'card.save')}
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
          <p className="sheet-note">{t('sheet.note')}</p>
        </>
      )}
    </section>
  )
}
