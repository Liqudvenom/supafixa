import { useEffect, useState } from 'react'
import { postTitle } from '../content'
import { ENGAGEMENTS, TRADES } from '../data'
import { useI18n } from '../i18n'
import { SAMPLE_POSTS, readPost, sourceOf } from '../importer'
import type { PayUnit, PostDraft } from '../importer'
import { LONDYNEK_CONSTRUCTION_URL, feedDraft, feedText, loadFeed } from '../londynek'
import type { Feed, FeedItem } from '../londynek'
import { PLACES } from '../places'
import type { Engagement, Kind } from '../types'
import { GROUP_URL } from './Sidebar'
import { PanelShell } from './SidePanels'

type Props = {
  onClose: () => void
  onAdd: (draft: PostDraft) => void
  onAddMany: (drafts: PostDraft[], skipped: number) => void
  sourcesOnMap: string[]
}

const SORTED_PLACES = [...PLACES].sort((a, b) => a.name.localeCompare(b.name))

export function ImportPanel({ onClose, onAdd, onAddMany, sourcesOnMap }: Props) {
  const i18n = useI18n()
  const { t } = i18n
  const [text, setText] = useState('')
  const [draft, setDraft] = useState<PostDraft | null>(null)

  const titleFor = (kind: Kind, trade: string) => postTitle(kind, trade, i18n.lang)
  const sourceBad = !!draft?.sourceUrl.trim() && !sourceOf(draft.sourceUrl.trim())

  const toDraft = (item: FeedItem) => feedDraft(item, t('import.contactRemoved'), t('feed.summary'), titleFor)

  const editFeedItem = (item: FeedItem) => {
    setText(feedText(item))
    setDraft(toDraft(item))
    requestAnimationFrame(() => document.querySelector('.draft')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
  }

  const read = (value = text) => {
    if (!value.trim()) return
    setDraft(readPost(value, t('import.contactRemoved'), titleFor))
  }

  const sample = (kind: 'job' | 'worker') => {
    setText(SAMPLE_POSTS[kind])
    read(SAMPLE_POSTS[kind])
  }

  const patch = (next: Partial<PostDraft>) =>
    setDraft((current) => {
      if (!current) return current
      const merged = { ...current, ...next }
      const autoTitle = current.title === titleFor(current.kind, current.trade)
      if (autoTitle && (next.kind || next.trade)) merged.title = titleFor(merged.kind, merged.trade)
      return merged
    })

  return (
    <PanelShell eyebrow={t('import.eyebrow')} title={t('import.title')} onClose={onClose}>
      <p className="panel-intro">{t('import.intro')}</p>
      <a className="btn ghost wide link-btn" href={GROUP_URL} target="_blank" rel="noopener noreferrer">
        {t('import.open')} ↗
      </a>
      <a className="btn ghost wide link-btn" href={LONDYNEK_CONSTRUCTION_URL} target="_blank" rel="noopener noreferrer">
        {t('import.openLondynek')} ↗
      </a>
      <p className="privacy-note">{t('import.privacy')}</p>

      {import.meta.env.DEV && (
        <FeedSection
          sourcesOnMap={sourcesOnMap}
          toDraft={toDraft}
          onEdit={editFeedItem}
          onAddAll={onAddMany}
        />
      )}

      <textarea
        className="paste-box"
        value={text}
        maxLength={5000}
        onChange={(event) => setText(event.target.value)}
        placeholder={t('import.placeholder')}
        rows={6}
        aria-label={t('import.placeholder')}
      />
      <p className="input-counter">{t('import.charCount', { n: text.length })}</p>
      <div className="import-row">
        <button type="button" className="btn quiet" onClick={() => sample('job')}>
          {t('import.sampleJob')}
        </button>
        <button type="button" className="btn quiet" onClick={() => sample('worker')}>
          {t('import.sampleWorker')}
        </button>
      </div>
      <div className="import-row">
        <button type="button" className="btn primary" disabled={!text.trim()} onClick={() => read()}>
          {t('import.read')}
        </button>
        <button
          type="button"
          className="btn ghost"
          onClick={() => {
            setText('')
            setDraft(null)
          }}
        >
          {t('import.clear')}
        </button>
      </div>

      {draft && (
        <form
          className="draft"
          onSubmit={(event) => {
            event.preventDefault()
            if (!draft.place || sourceBad) return
            onAdd(draft)
            setDraft(null)
            setText('')
          }}
        >
          <h3>{t('import.preview')}</h3>
          {draft.contactsRemoved > 0 && (
            <p className="removed-note">{t('import.removed', { n: draft.contactsRemoved })}</p>
          )}
          <label className="form-field">
            <span>{t('import.kind')}</span>
            <select value={draft.kind} onChange={(event) => patch({ kind: event.target.value as Kind })}>
              <option value="job">{t('kind.job')}</option>
              <option value="worker">{t('kind.worker')}</option>
              <option value="company">{t('kind.company')}</option>
            </select>
          </label>
          <label className="form-field">
            <span>{t('import.titleField')}</span>
            <input value={draft.title} maxLength={100} onChange={(event) => patch({ title: event.target.value })} />
          </label>
          <div className="form-pair">
            <label className="form-field">
              <span>{t('import.trade')}</span>
              <select value={draft.trade} onChange={(event) => patch({ trade: event.target.value })}>
                {TRADES.map((trade) => (
                  <option key={trade} value={trade}>
                    {i18n.trade(trade)}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field">
              <span>{t('import.location')}</span>
              <select
                value={draft.place}
                onChange={(event) => patch({ place: event.target.value })}
                aria-invalid={!draft.place}
              >
                <option value="">{t('import.pickLocation')}</option>
                {SORTED_PLACES.map((place) => (
                  <option key={place.name} value={place.name}>
                    {place.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {!draft.place && <p className="field-warn">{t('import.noLocation')}</p>}
          <div className="form-pair">
            <label className="form-field">
              <span>{t('import.payAmount')}</span>
              <input
                type="number"
                min={0}
                inputMode="numeric"
                value={draft.payAmount ?? ''}
                disabled={draft.payUnit === 'negotiable'}
                onChange={(event) =>
                  patch({ payAmount: event.target.value ? Number(event.target.value) : null, payMax: null })
                }
              />
            </label>
            <label className="form-field">
              <span>{t('import.payUnit')}</span>
              <select value={draft.payUnit} onChange={(event) => patch({ payUnit: event.target.value as PayUnit })}>
                <option value="day">{t('unit.day')}</option>
                <option value="hour">{t('unit.hour')}</option>
                <option value="negotiable">{t('unit.negotiable')}</option>
              </select>
            </label>
          </div>
          <div className="form-pair">
            <label className="form-field">
              <span>{t('import.start')}</span>
              <input type="date" value={draft.start} onChange={(event) => patch({ start: event.target.value })} />
            </label>
            <label className="form-field">
              <span>{t('import.duration')}</span>
              <input
                value={i18n.tx(draft.duration)}
                onChange={(event) => patch({ duration: event.target.value })}
              />
            </label>
          </div>
          <div className="form-pair">
            <label className="form-field">
              <span>{t('m.employment')}</span>
              <select
                value={draft.engagement}
                onChange={(event) => patch({ engagement: event.target.value as Engagement })}
              >
                {ENGAGEMENTS.map((item) => (
                  <option key={item} value={item}>
                    {i18n.engagement(item)}
                  </option>
                ))}
              </select>
            </label>
            <label className="check-field">
              <input type="checkbox" checked={draft.urgent} onChange={(event) => patch({ urgent: event.target.checked })} />
              <span>{t('import.urgent')}</span>
            </label>
          </div>
          <label className="form-field">
            <span>{t('import.summary')}</span>
            <textarea rows={5} maxLength={600} value={draft.summary} onChange={(event) => patch({ summary: event.target.value })} />
          </label>
          <label className="form-field">
            <span>{t('import.sourceUrl')}</span>
            <input
              type="url"
              inputMode="url"
              placeholder="https://londynek.net/… or https://facebook.com/groups/pracawlondynie/…"
              value={draft.sourceUrl}
              aria-invalid={sourceBad}
              onChange={(event) => patch({ sourceUrl: event.target.value })}
            />
          </label>
          {sourceBad && <p className="field-warn">{t('import.sourceBad')}</p>}
          <button type="submit" className="btn primary wide" disabled={!draft.place || sourceBad}>
            {t('import.add')}
          </button>
          <p className="disclaimer">{t('import.local')}</p>
        </form>
      )}
    </PanelShell>
  )
}

const PREVIEW = 6

function FeedSection({
  sourcesOnMap,
  toDraft,
  onEdit,
  onAddAll,
}: {
  sourcesOnMap: string[]
  toDraft: (item: FeedItem) => PostDraft
  onEdit: (item: FeedItem) => void
  onAddAll: (drafts: PostDraft[], skipped: number) => void
}) {
  const i18n = useI18n()
  const { t } = i18n
  const [feed, setFeed] = useState<Feed | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [all, setAll] = useState(false)

  useEffect(() => {
    loadFeed(false)
      .then(setFeed)
      .catch(() => undefined)
  }, [])

  const sync = () => {
    setBusy(true)
    setError('')
    loadFeed(true)
      .then(setFeed)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : String(reason)))
      .finally(() => setBusy(false))
  }

  const items = feed?.items ?? []
  const fresh = items.filter((item) => !sourcesOnMap.includes(item.url)).map(toDraft)
  const placed = fresh.filter((draft) => draft.place)
  const when = feed?.fetchedAt
    ? new Date(feed.fetchedAt).toLocaleString(i18n.lang === 'pl' ? 'pl-PL' : 'en-GB', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : ''

  return (
    <section className="feed">
      <div className="feed-head">
        <h3>{t('feed.title')}</h3>
        <span className="pill warn">{t('feed.badge')}</span>
      </div>
      <p className="feed-intro">{t('feed.intro')}</p>
      <button type="button" className="btn primary wide" disabled={busy} onClick={sync}>
        {busy ? t('feed.fetching') : t('feed.fetch')}
      </button>
      <p className="feed-status">
        {feed?.fetchedAt ? t('feed.status', { n: items.length, when }) : t('feed.never')}
        {feed?.cooldown ? ` ${t('feed.cooldown')}` : ''}
      </p>
      {error && <p className="field-warn">{t('feed.error', { msg: error })}</p>}

      {items.length > 0 && (
        <>
          <button
            type="button"
            className="btn quiet wide"
            disabled={!placed.length}
            onClick={() => onAddAll(placed, fresh.length - placed.length)}
          >
            {t('feed.addAll', { n: placed.length })}
          </button>
          <ul className="feed-list">
            {(all ? items : items.slice(0, PREVIEW)).map((item) => {
              const onMap = sourcesOnMap.includes(item.url)
              const area = toDraft(item).place
              return (
                <li key={item.id} className={onMap ? 'feed-item on' : 'feed-item'}>
                  <strong>{item.title}</strong>
                  <span>{[item.location, item.price, item.refreshed || item.added].filter(Boolean).join(' · ')}</span>
                  <span className={area ? 'feed-area' : 'feed-area none'}>
                    {area ? `→ ${area}` : t('feed.noArea')}
                  </span>
                  <div className="feed-actions">
                    {onMap ? (
                      <span className="pill ok">{t('feed.onMap')}</span>
                    ) : (
                      <button type="button" className="btn quiet" onClick={() => onEdit(item)}>
                        {t('feed.edit')}
                      </button>
                    )}
                    <a className="feed-link" href={item.url} target="_blank" rel="noopener noreferrer">
                      {t('feed.open')} ↗
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
          {!all && items.length > PREVIEW && (
            <button type="button" className="btn ghost wide" onClick={() => setAll(true)}>
              {t('feed.more', { n: items.length })}
            </button>
          )}
        </>
      )}
      <p className="disclaimer">{t('feed.devOnly')}</p>
    </section>
  )
}
