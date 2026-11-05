import { useEffect, useRef } from 'react'
import L from '../leafletGlobal'
import 'leaflet.markercluster'
import { BOROUGH_RISK } from '../data'
import { useI18n } from '../i18n'
import { esc, LONDON } from '../model'
import type { AddressReport } from '../clients'
import type { BasePoint, Frame, PlacedRecord } from '../types'
import { Icon } from './Icons'

type Props = {
  records: PlacedRecord[]
  addresses: AddressReport[]
  selectedId: string | null
  selectedAddressId: string | null
  base: BasePoint
  radiusKm: number | null
  frame: Frame
  pulse: boolean
  showRisk: boolean
  onSelect: (id: string) => void
  onAddress: (id: string) => void
}

const HOUSE = '<path d="M4 11.2 12 4.5l8 6.7"/><path d="M6.2 9.6V19.5h11.6V9.6"/>'

function houseIcon(report: AddressReport, selected: boolean) {
  const label = report.rating == null ? '–' : report.rating.toFixed(1)
  return L.divIcon({
    className: 'tt-marker',
    iconSize: [64, 30],
    iconAnchor: [32, 15],
    html: `<div class="house-pin ${report.level ?? 'none'}${selected ? ' selected' : ''}"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${HOUSE}</svg><b>${label}</b><i>★</i></div>`,
  })
}

const GLYPHS: Record<string, string> = {
  job: '<rect x="3.5" y="7" width="17" height="12.5" rx="2"/><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7M3.5 12h17"/>',
  worker: '<circle cx="12" cy="8" r="3"/><path d="M5.2 19.2c1.2-3.1 3.4-4.6 6.8-4.6s5.6 1.5 6.8 4.6"/>',
  company: '<path d="M4.5 20.2V6.2L12 3.4l7.5 2.8v14"/><path d="M9.2 20.2v-4.4h5.6v4.4M9 9h.01M15 9h.01M9 13h.01M15 13h.01"/>',
  urgent: '<path d="M13 2.4 4.4 13.2H11l-.8 8.4 8.6-10.8H13l1-8.4z"/>',
}

function pinIcon(record: PlacedRecord, selected: boolean, pulse: boolean) {
  const tone = record.urgent ? 'urgent' : record.kind
  const glyph = record.urgent ? GLYPHS.urgent : GLYPHS[record.kind]
  const pulseHtml = record.urgent && pulse ? '<i class="pin-pulse"></i>' : ''
  return L.divIcon({
    className: 'tt-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    html: `<div class="pin ${tone}${selected ? ' selected' : ''}">${pulseHtml}<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${glyph}</svg></div>`,
  })
}

function youIcon(label: string) {
  return L.divIcon({
    className: 'tt-marker',
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    html: `<div class="you-wrap"><span class="you-dot"></span><span class="you-label">${esc(label)}</span></div>`,
  })
}

export function MapCanvas({
  records,
  addresses,
  selectedId,
  selectedAddressId,
  base,
  radiusKm,
  frame,
  pulse,
  showRisk,
  onSelect,
  onAddress,
}: Props) {
  const i18n = useI18n()
  const { t } = i18n
  const youLabel = t('map.you', { base: base.label })
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null)
  const youRef = useRef<L.Marker | null>(null)
  const circleRef = useRef<L.Circle | null>(null)
  const riskRef = useRef<L.LayerGroup | null>(null)
  const houseRef = useRef<L.LayerGroup | null>(null)
  const selectRef = useRef(onSelect)
  const addressRef = useRef(onAddress)

  useEffect(() => {
    selectRef.current = onSelect
    addressRef.current = onAddress
  }, [onSelect, onAddress])

  useEffect(() => {
    const el = elRef.current
    if (!el || mapRef.current) return

    const map = L.map(el, {
      zoomControl: false,
      minZoom: 9,
      maxZoom: 16,
      zoomSnap: 0.5,
      maxBounds: L.latLngBounds([51.18, -0.72], [51.8, 0.45]),
      maxBoundsViscosity: 0.65,
    }).setView([LONDON.lat, LONDON.lng], LONDON.zoom)

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const cluster = L.markerClusterGroup({
      maxClusterRadius: 52,
      disableClusteringAtZoom: 14,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      animate: true,
      animateAddingMarkers: false,
      removeOutsideVisibleBounds: false,
      spiderfyDistanceMultiplier: 1.55,
      spiderLegPolylineOptions: { weight: 1.25, color: '#5e1426', opacity: 0.5 },
      iconCreateFunction: (group) =>
        L.divIcon({
          className: 'tt-marker',
          html: `<div class="tt-cluster">${group.getChildCount()}</div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 24],
        }),
    })
    map.addLayer(cluster)

    const you = L.marker([base.lat, base.lng], {
      icon: youIcon(youLabel),
      interactive: false,
      keyboard: false,
      zIndexOffset: 900,
    }).addTo(map)

    const circle = L.circle([base.lat, base.lng], {
      radius: 1000,
      color: '#b0213e',
      weight: 1.5,
      dashArray: '5 7',
      fillColor: '#b0213e',
      fillOpacity: 0.06,
    })

    const risk = L.layerGroup().addTo(map)
    const houses = L.layerGroup().addTo(map)
    const observer = new ResizeObserver(() => map.invalidateSize())
    observer.observe(el)

    mapRef.current = map
    clusterRef.current = cluster
    youRef.current = you
    circleRef.current = circle
    riskRef.current = risk
    houseRef.current = houses

    return () => {
      observer.disconnect()
      map.remove()
      mapRef.current = null
      clusterRef.current = null
      youRef.current = null
      circleRef.current = null
      riskRef.current = null
      houseRef.current = null
    }
    // Map is created once. Base is applied by the following effect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const you = youRef.current
    const circle = circleRef.current
    if (!map || !you || !circle) return
    you.setLatLng([base.lat, base.lng])
    you.setIcon(youIcon(youLabel))
    if (radiusKm == null) {
      if (map.hasLayer(circle)) map.removeLayer(circle)
      return
    }
    circle.setLatLng([base.lat, base.lng])
    circle.setRadius(radiusKm * 1000)
    if (!map.hasLayer(circle)) circle.addTo(map)
  }, [base, radiusKm, youLabel])

  useEffect(() => {
    const group = clusterRef.current
    if (!group) return
    group.clearLayers()
    const markers = records.map((record) => {
      const view = i18n.view(record)
      const marker = L.marker([record.lat, record.lng], {
        icon: pinIcon(record, record.id === selectedId, pulse),
        title: view.title,
        riseOnHover: true,
        keyboard: false,
      })
      marker.bindTooltip(`<strong>${esc(view.title)}</strong><span>${esc(record.location)} · ${esc(view.payLabel)}</span>`, {
        className: 'tt-tip',
        direction: 'top',
        offset: [0, -14],
        opacity: 1,
      })
      marker.on('click', () => selectRef.current(record.id))
      return marker
    })
    group.addLayers(markers)
  }, [records, selectedId, pulse, i18n])

  useEffect(() => {
    const houses = houseRef.current
    if (!houses) return
    houses.clearLayers()
    for (const report of addresses) {
      const marker = L.marker([report.lat, report.lng], {
        icon: houseIcon(report, report.id === selectedAddressId),
        title: report.line,
        riseOnHover: true,
        keyboard: false,
        zIndexOffset: report.id === selectedAddressId ? 800 : 0,
      })
      marker.bindTooltip(`<strong>${esc(report.line)}</strong><span>${esc(report.postcode)} · ${esc(report.area)}</span>`, {
        className: 'tt-tip',
        direction: 'top',
        offset: [0, -14],
        opacity: 1,
      })
      marker.on('click', () => addressRef.current(report.id))
      houses.addLayer(marker)
    }
  }, [addresses, selectedAddressId])

  useEffect(() => {
    const risk = riskRef.current
    if (!risk) return
    risk.clearLayers()
    if (!showRisk) return
    for (const borough of BOROUGH_RISK) {
      const color = borough.payment >= 8.5 ? '#1f9d57' : borough.payment >= 7.8 ? '#d0893a' : '#c46a4e'
      const marker = L.circleMarker([borough.lat, borough.lng], {
        radius: 22,
        color,
        weight: 2,
        fillColor: color,
        fillOpacity: 0.16,
      })
      const status = t(borough.disputes === 'Watch' ? 'risk.watch' : 'risk.low').toLowerCase()
      marker.bindTooltip(
        `<strong>${esc(borough.borough)}</strong><span>${esc(t('risk.tip', { score: borough.payment.toFixed(1), status }))}</span>`,
        { className: 'tt-tip', direction: 'top', opacity: 1 },
      )
      risk.addLayer(marker)
    }
  }, [showRisk, t])

  useEffect(() => {
    const map = mapRef.current
    if (!map || frame.seq === 0) return
    if (frame.kind === 'home') {
      map.flyTo([LONDON.lat, LONDON.lng], LONDON.zoom, { duration: 0.75 })
      return
    }
    if (frame.kind === 'point') {
      map.flyTo([frame.lat, frame.lng], frame.zoom, { duration: 0.7 })
      return
    }
    const bounds = L.latLng(frame.lat, frame.lng).toBounds(frame.radiusKm * 2200)
    map.flyToBounds(bounds, { duration: 0.7, padding: [48, 48] })
  }, [frame])

  return (
    <div className="map-wrap">
      <div ref={elRef} className="map" />
      <div className="zoom-stack">
        <button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label={t('map.zoomIn')}>
          +
        </button>
        <button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label={t('map.zoomOut')}>
          −
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.flyTo([base.lat, base.lng], 13, { duration: 0.6 })}
          aria-label={t('map.centre', { base: base.label })}
        >
          <Icon name="locate" size={16} />
        </button>
      </div>
    </div>
  )
}

export function Legend({ showRisk, count, addresses }: { showRisk: boolean; count: number; addresses: boolean }) {
  const { t } = useI18n()
  if (addresses) {
    return (
      <div className="legend">
        <div className="legend-row">
          <i className="dot good" /> {t('cc.good')}
          <i className="dot watch" /> {t('cc.watch')}
          <i className="dot bad" /> {t('cc.risk')}
        </div>
        <p>{t('legend.addresses', { n: count })}</p>
      </div>
    )
  }
  return (
    <div className="legend">
      <div className="legend-row">
        <i className="dot job" /> {t('legend.jobs')}
        <i className="dot worker" /> {t('legend.workers')}
        <i className="dot company" /> {t('legend.companies')}
      </div>
      <div className="legend-row">
        <i className="dot urgent" /> {t('legend.urgent')}
        <i className="dot cluster" /> {t('legend.cluster')}
        <i className="dot you" /> {t('legend.you')}
        {showRisk && (
          <>
            <i className="dot risk" /> {t('legend.risk')}
          </>
        )}
      </div>
      <p>{t('legend.count', { n: count })}</p>
    </div>
  )
}
