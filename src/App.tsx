import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { buildReports, CLIENT_ADDRESSES, CLIENT_REVIEWS, formatPostcode, JOB_ADDRESS, stripPeople } from './clients'
import type { ClientAddress, ClientReview } from './clients'
import { AccountSheet } from './components/AccountSheet'
import { ClientCheckPanel, LockedPanel } from './components/ClientCheckPanel'
import type { ClientTab, ReviewDraft } from './components/ClientCheckPanel'
import { CommandBar } from './components/CommandBar'
import { TabBar } from './components/TabBar'
import { DetailDrawer } from './components/DetailDrawer'
import { Header } from './components/Header'
import { DumpTruckLoader } from './components/DumpTruckLoader'
import { ImportPanel } from './components/ImportPanel'
import { Legend, MapCanvas } from './components/MapCanvas'
import { OpportunitySheet, actionLabel } from './components/OpportunitySheet'
import { Sidebar } from './components/Sidebar'
import { ApplicationsPanel, ReviewsPanel, RiskPanel, SettingsPanel } from './components/SidePanels'
import { postTitle } from './content'
import { BASES, RECORDS } from './data'
import { I18nContext, makeI18n } from './i18n'
import type { Lang } from './i18n'
import { draftToRecord, sourceOf, stripContacts } from './importer'
import type { PostDraft } from './importer'
import { boroughCenter, boroughNames, kindMode, modeKind, place, visibleRecords } from './model'
import { placeByName } from './places'
import { profileById, quickTarget } from './profiles'
import type { ProfileId } from './profiles'
import { getProfileUiConfig, loadProfileEnvironment, profileEnvironment } from './profileSession'
import type { ProfileBoot } from './profileSession'
import { loadSupafixaFeed, offerDraft } from './supafixa'
import type {
  DateWindow,
  Engagement,
  FilterState,
  Frame,
  FrameRequest,
  MarketplaceRecord,
  Mode,
  View,
} from './types'

function readStore(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStore(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be blocked; the choice still applies to this tab.
  }
}

function initialLang(): Lang {
  return readStore('tt-lang') === 'en' ? 'en' : 'pl'
}

function initialProfile(): ProfileId {
  const stored = readStore('tt-profile')
  return stored === 'buyer' || stored === 'business' ? stored : 'seller'
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [profileId, setProfileId] = useState<ProfileId>(initialProfile)
  const [environment, setEnvironment] = useState(() => profileEnvironment(initialProfile()))
  const [profileBoot, setProfileBoot] = useState<ProfileBoot>('ready')
  const [bootTarget, setBootTarget] = useState<ProfileId>(initialProfile)
  const [bootFading, setBootFading] = useState(false)
  const [pageBoot, setPageBoot] = useState<'loading' | 'ready'>('loading')
  const [pageFading, setPageFading] = useState(false)
  const [requested, setRequested] = useState<ProfileId[]>([])
  const [accountOpen, setAccountOpen] = useState(false)
  const [clientReviews, setClientReviews] = useState<ClientReview[]>(CLIENT_REVIEWS)
  const [extraAddresses, setExtraAddresses] = useState<ClientAddress[]>([])
  const [addressId, setAddressId] = useState<string | null>(null)
  const [clientTab, setClientTab] = useState<ClientTab>('check')
  const [view, setView] = useState<View>('map')
  const [mode, setMode] = useState<Mode>(() => profileById(initialProfile()).defaultMode)
  const [query, setQuery] = useState('')
  const [borough, setBorough] = useState('all')
  const [radiusKm, setRadiusKm] = useState<number | null>(null)
  const [trade, setTrade] = useState('all')
  const [dateWindow, setDateWindow] = useState<DateWindow>('any')
  const [payFloor, setPayFloor] = useState<number | null>(null)
  const [engagement, setEngagement] = useState<Engagement | 'all'>('all')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [urgentOnly, setUrgentOnly] = useState(false)
  const [baseId, setBaseId] = useState('acton')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(true)
  const [saved, setSaved] = useState<string[]>([])
  const [applied, setApplied] = useState<string[]>([])
  const [invited, setInvited] = useState<string[]>([])
  const [enquired, setEnquired] = useState<string[]>([])
  const [imported, setImported] = useState<MarketplaceRecord[]>([])
  const [reviewFocus, setReviewFocus] = useState<string | null>(null)
  const [pulse, setPulse] = useState(true)
  const [navOpen, setNavOpen] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [sheetSpace, setSheetSpace] = useState(280)
  const [frame, setFrame] = useState<Frame>({ seq: 0, kind: 'home' })
  const seq = useRef(0)
  const importSeq = useRef(0)
  const reviewSeq = useRef(0)
  const toastTimer = useRef(0)
  const bootGen = useRef(0)
  const fadeTimer = useRef(0)
  const pageFade = useRef(0)

  const setLang = useCallback((next: Lang) => {
    setLangState(next)
    writeStore('tt-lang', next)
  }, [])

  const profile = profileById(profileId)
  const reports = useMemo(() => buildReports([...CLIENT_ADDRESSES, ...extraAddresses], clientReviews), [extraAddresses, clientReviews])
  const booting = profileBoot === 'loading' || pageBoot === 'loading'

  const i18n = useMemo(() => makeI18n(lang, setLang), [lang, setLang])
  const { t } = i18n

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = lang === 'pl' ? 'TradeTrust · Giełda pracy w Londynie' : 'TradeTrust · Greater London marketplace'
  }, [lang])

  const records = useMemo(() => [...RECORDS, ...imported], [imported])
  const lookup = useCallback((id: string) => records.find((record) => record.id === id), [records])
  const boroughs = useMemo(() => boroughNames(records), [records])

  const base = BASES.find((item) => item.id === baseId) ?? BASES[0]
  const showSheet = view === 'map' || view === 'saved'

  const notify = useCallback((message: string) => {
    setToast(message)
    window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const pushFrame = useCallback((next: FrameRequest) => {
    seq.current += 1
    if (next.kind === 'home') setFrame({ seq: seq.current, kind: 'home' })
    else setFrame({ ...next, seq: seq.current })
  }, [])

  useEffect(() => {
    let cancelled = false
    const started = Date.now()
    const titleFor = (kind: 'job' | 'worker' | 'company', trade: string) => postTitle(kind, trade, lang)
    void (async () => {
      let error = ''
      let added = 0
      try {
        const feed = await loadSupafixaFeed()
        const records: MarketplaceRecord[] = []
        for (const item of feed.items) {
          const draft = offerDraft(item, t('import.contactRemoved'), t('splash.summary'), titleFor)
          const where = placeByName(draft.place)
          if (!where) continue
          importSeq.current += 1
          records.push(draftToRecord(draft, where, importSeq.current))
        }
        added = records.length
        if (!cancelled && records.length) setImported((prev) => [...prev, ...records])
      } catch (reason) {
        error = reason instanceof Error ? reason.message : String(reason)
      }
      const wait = 2600 - (Date.now() - started)
      if (wait > 0) await new Promise((done) => setTimeout(done, wait))
      if (cancelled) return
      if (added) notify(t('toast.supafixa', { n: added }))
      else if (error) notify(t('toast.supafixaFail', { msg: error }))
      setPageBoot('ready')
      setPageFading(true)
      window.clearTimeout(pageFade.current)
      pageFade.current = window.setTimeout(() => setPageFading(false), 280)
    })()
    return () => {
      cancelled = true
    }
    // First paint only: splash + live offer fetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filter = useMemo<FilterState>(
    () => ({
      mode,
      query,
      borough,
      radiusKm,
      trade,
      dateWindow,
      payFloor,
      engagement,
      verifiedOnly,
      urgentOnly,
      base,
      savedOnly: view === 'saved',
      savedIds: saved,
    }),
    [mode, query, borough, radiusKm, trade, dateWindow, payFloor, engagement, verifiedOnly, urgentOnly, base, view, saved],
  )

  const visible = useMemo(() => visibleRecords(records, filter), [records, filter])
  const matchCounts = useMemo(
    () => ({
      work: visibleRecords(records, { ...filter, mode: 'work' }).length,
      workers: visibleRecords(records, { ...filter, mode: 'workers' }).length,
      companies: visibleRecords(records, { ...filter, mode: 'companies' }).length,
    }),
    [records, filter],
  )
  const catalog = useMemo(
    () => ({
      work: records.filter((record) => record.kind === 'job').length,
      workers: records.filter((record) => record.kind === 'worker').length,
      companies: records.filter((record) => record.kind === 'company').length,
    }),
    [records],
  )

  const selectedRecord = selectedId ? lookup(selectedId) : undefined
  const selected = selectedRecord ? place(selectedRecord, base) : null
  const panelView =
    view === 'reviews' ||
    view === 'risk' ||
    view === 'applications' ||
    view === 'settings' ||
    view === 'import' ||
    view === 'clients'
  const recordDrawer = showSheet && drawerOpen && selected != null
  const sideOpen = recordDrawer || panelView

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setDrawerOpen(false)
      setNavOpen(false)
      setAccountOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(fadeTimer.current)
      window.clearTimeout(pageFade.current)
    }
  }, [])

  const chooseView = (next: View) => {
    setView(next)
    setNavOpen(false)
    setAccountOpen(false)
    if (next !== 'map' && next !== 'saved') setDrawerOpen(false)
    if (next === 'reviews') setReviewFocus(null)
  }

  const clearFilters = () => {
    setQuery('')
    setBorough('all')
    setRadiusKm(null)
    setTrade('all')
    setDateWindow('any')
    setPayFloor(null)
    setEngagement('all')
    setVerifiedOnly(false)
    setUrgentOnly(false)
  }

  const endBoot = () => {
    setProfileBoot('ready')
    setBootFading(true)
    window.clearTimeout(fadeTimer.current)
    fadeTimer.current = window.setTimeout(() => setBootFading(false), 280)
  }

  const switchProfile = (id: ProfileId) => {
    if (id === profileId && profileBoot !== 'loading') {
      setAccountOpen(false)
      return
    }
    const gen = ++bootGen.current
    const next = profileById(id)
    window.clearTimeout(fadeTimer.current)
    setBootFading(false)
    setBootTarget(id)
    setProfileBoot('loading')
    setAccountOpen(false)
    setNavOpen(false)
    setDrawerOpen(false)
    void loadProfileEnvironment(id).then(
      (env) => {
        if (gen !== bootGen.current) return
        // New environment: reset marketplace filters, keep language and session
        // lists (saved / applied). Per-profile session storage is a later TODO.
        setEnvironment(env)
        setProfileId(id)
        writeStore('tt-profile', id)
        setMode(env.defaultMode)
        clearFilters()
        setSelectedId(null)
        endBoot()
        notify(t('profile.switched', { role: next.role[lang] }))
      },
      () => {
        if (gen !== bootGen.current) return
        setBootTarget(profileId)
        endBoot()
        notify(t('boot.error'))
      },
    )
  }

  const selectAddress = (id: string | null) => {
    setAddressId(id)
    if (!id) return
    setView('clients')
    setClientTab('check')
    setDrawerOpen(false)
    const report = reports.find((item) => item.id === id)
    if (report) pushFrame({ kind: 'point', lat: report.lat, lng: report.lng, zoom: 15 })
  }

  const publishReview = (draft: ReviewDraft) => {
    reviewSeq.current += 1
    const n = reviewSeq.current
    let targetId = draft.addressId
    let target: { line: string; lat: number; lng: number } | undefined = reports.find((item) => item.id === targetId)
    if (!targetId && draft.newAddress) {
      const where = placeByName(draft.newAddress.area)
      if (!where) return
      const address: ClientAddress = {
        id: `a-new-${n}`,
        line: draft.newAddress.line,
        postcode: formatPostcode(draft.newAddress.postcode),
        area: where.name,
        borough: where.borough,
        lat: where.lat + (((n * 37) % 9) - 4) * 0.0011,
        lng: where.lng + (((n * 53) % 9) - 4) * 0.0016,
        property: draft.newAddress.property,
        added: true,
      }
      setExtraAddresses((prev) => [...prev, address])
      targetId = address.id
      target = address
    }
    if (!targetId || !target) return
    const contacts = stripContacts(draft.text, t('import.contactRemoved'))
    const people = stripPeople(contacts.text, t('cc.form.person'))
    const review: ClientReview = {
      id: `cr-mine-${n}`,
      addressId: targetId,
      trade: draft.trade,
      date: draft.date,
      stars: draft.stars,
      ratings: draft.ratings,
      paid: draft.paid,
      unpaidExtra: draft.unpaidExtra,
      text: { pl: people.text, en: people.text },
      mine: true,
    }
    setClientReviews((prev) => [review, ...prev])
    setAddressId(targetId)
    setClientTab('check')
    pushFrame({ kind: 'point', lat: target.lat, lng: target.lng, zoom: 15 })
    const removed = contacts.removed + people.removed
    notify(
      [t('cc.toast.published', { address: target.line }), removed ? t('cc.toast.cleaned', { n: removed }) : '']
        .filter(Boolean)
        .join(' '),
    )
  }

  const chooseMode = (next: Mode) => {
    if (!environment.allowedModes.includes(next)) return
    setMode(next)
    setView('map')
    setNavOpen(false)
  }

  const resetView = () => {
    clearFilters()
    setSelectedId(null)
    setDrawerOpen(false)
    setView('map')
    setNavOpen(false)
    pushFrame({ kind: 'home' })
  }

  const changeBase = (id: string) => {
    const next = BASES.find((item) => item.id === id)
    if (!next) return
    setBaseId(id)
    pushFrame({ kind: 'point', lat: next.lat, lng: next.lng, zoom: 12 })
  }

  const changeBorough = (value: string) => {
    setBorough(value)
    if (value === 'all') return
    const center = boroughCenter(records, value)
    if (center) pushFrame({ kind: 'point', lat: center.lat, lng: center.lng, zoom: 12 })
  }

  const changeRadius = (value: number | null) => {
    setRadiusKm(value)
    if (value == null) return
    pushFrame({ kind: 'radius', lat: base.lat, lng: base.lng, radiusKm: value })
  }

  const openRecord = (id: string) => {
    const record = lookup(id)
    if (!record) return
    setSelectedId(id)
    setDrawerOpen(true)
    setNavOpen(false)
    if (view !== 'saved') setView('map')
    pushFrame({ kind: 'point', lat: record.lat, lng: record.lng, zoom: 15 })
  }

  const reveal = (record: MarketplaceRecord, message: string) => {
    const recordMode = kindMode(record.kind)
    setMode(environment.allowedModes.includes(recordMode) ? recordMode : environment.defaultMode)
    clearFilters()
    setView('map')
    setSelectedId(record.id)
    setDrawerOpen(true)
    setSheetOpen(true)
    setNavOpen(false)
    pushFrame({ kind: 'point', lat: record.lat, lng: record.lng, zoom: 15 })
    notify(message)
  }

  const revealId = (id: string) => {
    const record = lookup(id)
    if (record) reveal(record, t('toast.shown'))
  }

  const act = (id: string) => {
    const record = lookup(id)
    if (!record) return
    if (record.kind === 'job') {
      setApplied((prev) => (prev.includes(id) ? prev : [...prev, id]))
      notify(t('toast.applied'))
      return
    }
    if (record.kind === 'worker') {
      setInvited((prev) => (prev.includes(id) ? prev : [...prev, id]))
      notify(t('toast.invited'))
      return
    }
    setEnquired((prev) => (prev.includes(id) ? prev : [...prev, id]))
    notify(t('toast.enquired'))
  }

  const toggleSave = (id: string) => {
    const has = saved.includes(id)
    setSaved((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
    notify(t(has ? 'toast.unsaved' : 'toast.saved'))
  }

  const addImported = (draft: PostDraft) => {
    const where = placeByName(draft.place)
    if (!where) return
    const source = draft.sourceUrl.trim()
    const normalisedSource = source ? sourceOf(source)?.url : undefined
    if (source && !normalisedSource) {
      notify(t('import.sourceBad'))
      return
    }
    if (normalisedSource && imported.some((record) => record.source?.url === normalisedSource)) {
      notify(t('import.duplicate'))
      return
    }
    importSeq.current += 1
    const record = draftToRecord(draft, where, importSeq.current)
    setImported((prev) => [...prev, record])
    reveal(record, t('toast.imported'))
  }

  const sourcesOnMap = useMemo(
    () => imported.flatMap((record) => (record.source ? [record.source.url] : [])),
    [imported],
  )

  const addImportedMany = (drafts: PostDraft[], skipped: number) => {
    const records: MarketplaceRecord[] = []
    let duplicates = 0
    const seen = new Set(sourcesOnMap)
    for (const draft of drafts) {
      const where = placeByName(draft.place)
      const source = draft.sourceUrl.trim()
      const normalisedSource = source ? sourceOf(source)?.url : undefined
      if (!where || (source && !normalisedSource) || (normalisedSource && seen.has(normalisedSource))) {
        duplicates += 1
        continue
      }
      if (normalisedSource) seen.add(normalisedSource)
      importSeq.current += 1
      records.push(draftToRecord(draft, where, importSeq.current))
    }
    setImported((prev) => [...prev, ...records])
    setMode('work')
    clearFilters()
    setView('map')
    setSheetOpen(true)
    setNavOpen(false)
    pushFrame({ kind: 'home' })
    notify(t('toast.importedMany', { n: records.length, skipped: skipped + duplicates }))
  }

  const removeImported = (id: string) => {
    setImported((prev) => prev.filter((record) => record.id !== id))
    setSaved((prev) => prev.filter((item) => item !== id))
    setApplied((prev) => prev.filter((item) => item !== id))
    setInvited((prev) => prev.filter((item) => item !== id))
    setEnquired((prev) => prev.filter((item) => item !== id))
    setSelectedId(null)
    setDrawerOpen(false)
    notify(t('toast.removed'))
  }

  const measureSheet = useCallback((height: number) => setSheetSpace(height + 22), [])

  const alternate = environment.allowedModes
    .filter((item) => item !== mode)
    .map((item) => ({ mode: item, count: matchCounts[item] }))
    .sort((a, b) => b.count - a.count)[0]

  const empty =
    visible.length === 0 && alternate && alternate.count > 0
      ? {
          title: t('empty.noMode', { noun: i18n.word(modeKind(mode), 5) }),
          body: t('empty.alt', { count: i18n.count(modeKind(alternate.mode), alternate.count) }),
          action: {
            label: t('empty.show', { noun: i18n.word(modeKind(alternate.mode), 5) }),
            run: () => {
              setMode(alternate.mode)
              if (view !== 'saved') setView('map')
            },
          },
        }
      : {
          title: t(view === 'saved' ? 'empty.savedTitle' : 'empty.title'),
          body: t(view === 'saved' ? 'empty.savedBody' : 'empty.body'),
          action: view === 'saved' ? null : { label: t('f.reset'), run: resetView },
        }

  const ids = { applied, invited, enquired }
  const sessionIds = [...applied, ...invited, ...enquired]
  const jobAddress = selected?.kind === 'job' ? JOB_ADDRESS[selected.id] : undefined
  const jobReport = jobAddress ? reports.find((report) => report.id === jobAddress) : undefined
  const ui = getProfileUiConfig({
    environment,
    view,
    jobReport,
    stats: {
      reports: reports.length,
      flagged: reports.filter((report) => report.level === 'watch' || report.level === 'risk').length,
      myReviews: clientReviews.filter((review) => review.mine).length,
      jobs: catalog.work,
      workers: catalog.workers,
      companies: catalog.companies,
      urgent: records.filter((record) => record.urgent).length,
      applied: applied.length,
      invited: invited.length,
      saved: saved.length,
    },
    copy: {
      addresses: t('kpi.addresses'),
      addressesNote: t('kpi.addressesNote'),
      flagged: t('kpi.flagged'),
      flaggedNote: t('kpi.flaggedNote'),
      myReviews: t('kpi.myReviews'),
      myReviewsNote: t('kpi.myReviewsNote'),
      jobs: t('kpi.jobs'),
      jobsNote: t('kpi.jobsNote'),
      workers: t('kpi.workers'),
      workersNote: t('kpi.workersNote'),
      companies: t('kpi.companies'),
      companiesNote: t('kpi.companiesNote'),
      urgent: t('kpi.urgent'),
      urgentNote: t('kpi.urgentNote'),
      myApps: t('kpi.myApps'),
      saved: t('kpi.saved'),
      sessionNote: t('kpi.sessionNote'),
      invites: t('kpi.invites'),
    },
  })
  const { clientCheck, showAddresses, mapLayers, drawerClient, kpis } = ui

  return (
    <I18nContext.Provider value={i18n}>
      <div
        className={`workspace env-${booting ? bootTarget : profileId}${booting ? ' is-booting' : ''}`}
        aria-busy={booting}
      >
        <a className="skip-link" href="#main-content">{t('a11y.skip')}</a>
        <Sidebar
          view={view}
          mode={mode}
          open={navOpen}
          counts={catalog}
          allowedModes={environment.allowedModes}
          profile={profile}
          clientAccess={clientCheck}
          onView={chooseView}
          onMode={chooseMode}
          onClose={() => setNavOpen(false)}
          onAccount={() => {
            setNavOpen(false)
            setAccountOpen(true)
          }}
          onSwitch={switchProfile}
          locked={booting}
        />
        <main id="main-content" className="main" tabIndex={-1} inert={booting || undefined}>
          <Header
            title={
              view === 'clients'
                ? t('head.clientsTitle')
                : t(profileId === 'seller' ? 'head.dashboard.seller' : profileId === 'buyer' ? 'head.dashboard.buyer' : 'head.dashboard.business')
            }
            subtitle={view === 'clients' ? t('head.clientsSub') : profile.note[lang]}
            kpis={kpis}
            profile={profile}
            quickRole={profileById(quickTarget(profileId)).role[lang]}
            onHome={() => pushFrame({ kind: 'home' })}
            onMenu={() => setNavOpen(true)}
            onAccount={() => setAccountOpen((open) => !open)}
            onQuickSwitch={() => switchProfile(quickTarget(profileId))}
            notices={[
              {
                id: 'stratford',
                title: t('notice.urgentTitle'),
                detail: t('notice.urgentBody'),
                onOpen: () => {
                  clearFilters()
                  setMode('work')
                  setView('map')
                  setUrgentOnly(true)
                  setBorough('Newham')
                  const center = boroughCenter(records, 'Newham')
                  if (center) pushFrame({ kind: 'point', lat: center.lat, lng: center.lng, zoom: 12 })
                },
              },
              {
                id: 'harbour',
                title: t('notice.harbourTitle'),
                detail: t('notice.harbourBody'),
                onOpen: () => revealId('company-harbour'),
              },
              {
                id: 'today',
                title: t('notice.todayTitle'),
                detail: t('notice.todayBody'),
                onOpen: () => {
                  clearFilters()
                  setMode('workers')
                  setView('map')
                  setQuery(t('notice.todayQuery'))
                },
              },
            ]}
          />
          <div
            className={sideOpen ? 'stage drawer-open' : 'stage'}
            style={{ ['--sheet-space' as string]: `${showSheet ? sheetSpace : 16}px` }}
          >
            <MapCanvas
              records={mapLayers.showMarketplace ? visible : []}
              addresses={mapLayers.showClientAddresses ? reports : []}
              selectedId={selectedId}
              selectedAddressId={addressId}
              base={base}
              radiusKm={mapLayers.showClientAddresses ? null : radiusKm}
              frame={frame}
              pulse={pulse}
              showRisk={mapLayers.showRiskOverlay}
              onSelect={openRecord}
              onAddress={selectAddress}
            />
            {!showAddresses && (
            <CommandBar
              query={query}
              mode={mode}
              allowedModes={environment.allowedModes}
              counts={matchCounts}
              baseId={baseId}
              borough={borough}
              boroughs={boroughs}
              radiusKm={radiusKm}
              trade={trade}
              dateWindow={dateWindow}
              payFloor={payFloor}
              engagement={engagement}
              verifiedOnly={verifiedOnly}
              urgentOnly={urgentOnly}
              onQuery={setQuery}
              onMode={chooseMode}
              onBase={changeBase}
              onBorough={changeBorough}
              onRadius={changeRadius}
              onTrade={setTrade}
              onDate={setDateWindow}
              onPay={setPayFloor}
              onEngagement={setEngagement}
              onVerified={() => setVerifiedOnly((value) => !value)}
              onUrgent={() => setUrgentOnly((value) => !value)}
              onReset={resetView}
            />
            )}
            <Legend
              showRisk={view === 'risk'}
              addresses={showAddresses}
              count={showAddresses ? reports.length : visible.length}
            />
            {showSheet && (
              <OpportunitySheet
                mode={mode}
                savedView={view === 'saved'}
                records={visible}
                baseLabel={base.label}
                selectedId={selectedId}
                savedIds={saved}
                appliedIds={applied}
                invitedIds={invited}
                enquiredIds={enquired}
                collapsed={!sheetOpen}
                emptyTitle={empty.title}
                emptyBody={empty.body}
                emptyAction={empty.action}
                onToggle={() => setSheetOpen((open) => !open)}
                onOpen={openRecord}
                onAct={act}
                onSave={toggleSave}
                onMeasure={measureSheet}
              />
            )}
            {recordDrawer && selected && (
              <DetailDrawer
                record={selected}
                saved={saved.includes(selected.id)}
                done={actionLabel(selected, ids, t).done}
                actionLabel={actionLabel(selected, ids, t).label}
                onClose={() => setDrawerOpen(false)}
                onAct={() => act(selected.id)}
                onSave={() => toggleSave(selected.id)}
                onReviews={() => {
                  setReviewFocus(selected.id)
                  setView('reviews')
                  setDrawerOpen(false)
                }}
                onRemove={() => removeImported(selected.id)}
                client={drawerClient}
                onClientReport={() => {
                  if (clientCheck && jobAddress) selectAddress(jobAddress)
                  else chooseView('clients')
                }}
              />
            )}
            {view === 'clients' &&
              (clientCheck ? (
                <ClientCheckPanel
                  reports={reports}
                  selectedId={addressId}
                  tab={clientTab}
                  onTab={setClientTab}
                  onSelect={selectAddress}
                  onPublish={publishReview}
                  onClose={() => setView('map')}
                />
              ) : (
                <LockedPanel
                  requested={requested.includes(profileId)}
                  onRequest={() => {
                    setRequested((prev) => [...prev, profileId])
                    notify(t('toast.requested'))
                  }}
                  onSwitch={() => switchProfile('business')}
                  onClose={() => setView('map')}
                />
              ))}
            {view === 'reviews' && (
              <ReviewsPanel
                focusId={reviewFocus}
                onClose={() => setView('map')}
                onClearFocus={() => setReviewFocus(null)}
                onShow={revealId}
              />
            )}
            {view === 'risk' && (
              <RiskPanel
                onClose={() => setView('map')}
                onFocus={(item) => pushFrame({ kind: 'point', lat: item.lat, lng: item.lng, zoom: 12 })}
              />
            )}
            {view === 'applications' && (
              <ApplicationsPanel ids={sessionIds} lookup={lookup} onClose={() => setView('map')} onShow={revealId} />
            )}
            {view === 'import' && (
              <ImportPanel
                onClose={() => setView('map')}
                onAdd={addImported}
                onAddMany={addImportedMany}
                sourcesOnMap={sourcesOnMap}
              />
            )}
            {view === 'settings' && (
              <SettingsPanel
                baseId={baseId}
                pulse={pulse}
                onClose={() => setView('map')}
                onBase={changeBase}
                onPulse={() => setPulse((value) => !value)}
                onClear={() => {
                  setSaved([])
                  setApplied([])
                  setInvited([])
                  setEnquired([])
                  notify(t('toast.cleared'))
                }}
              />
            )}
            {toast && <div className="toast">{toast}</div>}
          </div>
          <TabBar
            view={view}
            accountOpen={accountOpen}
            clientAccess={clientCheck}
            savedCount={saved.length}
            onView={chooseView}
            onAccount={() => setAccountOpen((open) => !open)}
          />
        </main>
        {accountOpen && !booting && (
          <AccountSheet
            profileId={profileId}
            onSwitch={switchProfile}
            onSettings={() => chooseView('settings')}
            onClose={() => setAccountOpen(false)}
          />
        )}
        {(pageBoot === 'loading' || pageFading) && <DumpTruckLoader page fading={pageFading} />}
        {(profileBoot === 'loading' || bootFading) && pageBoot === 'ready' && !pageFading && (
          <DumpTruckLoader profileId={bootTarget} fading={bootFading} />
        )}
      </div>
    </I18nContext.Provider>
  )
}
