'use client'
// Day 27 interaction: select a trip (from the list or the map) to read its record, count period and sources;
// "Play in date order" steps through the trips (never under quiet mode or reduced motion).
import { useEffect, useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useQuiet as useQuietMotion } from '@/viz/day-22/useQuiet'
import type { MapGeometry } from './mapgeo'
import styles from './day27.module.css'

export interface TripMeta {
  id: string
  label: string
  date: string
  style: 'count-a' | 'count-b' | 'none'
}

function TripMap({ g, trips, selected, onSelect }: { g: MapGeometry; trips: TripMeta[]; selected: string | null; onSelect: (id: string) => void }) {
  const styleOf = (id: string) => trips.find((t) => t.id === id)?.style ?? 'none'
  const cls = (id: string) => `${styles[styleOf(id).replace('-', '_')]} ${selected === null ? '' : selected === id ? styles.on : styles.off}`
  const { fontSize, dashUnconfirmed, dot } = layout
  return (
    <svg className={g.narrow ? styles.narrow : styles.wide} viewBox={`0 0 ${g.width} ${g.height}`} role="img" aria-label="Map of the trips in the records. Arcs join both ends of a trip where records name them; rings mark arrival cities where only the destination was reported.">
      <path d={g.land} className={styles.land} />
      <path d={g.states} className={styles.states} />
      {g.inset ? (
        <g aria-hidden="true">
          <rect x={g.inset.x} y={g.inset.y} width={g.inset.w} height={g.inset.h} className={styles.insetBox} />
          <path d={g.inset.land} className={styles.land} />
          <text x={g.inset.x + dot} y={g.inset.y + g.inset.h - dot} fontSize={fontSize.small} className={styles.insetLabel}>{g.inset.label}</text>
        </g>
      ) : null}
      {g.places.map((p) => (
        <g key={p.id} aria-hidden="true">
          <circle cx={p.x} cy={p.y} r={2} className={styles.dot} />
          <text x={p.x + (p.anchor === 'end' ? -dot * 2 : dot * 2 + 2)} y={p.ly - dot} textAnchor={p.anchor} fontSize={g.narrow ? fontSize.small : fontSize.label} className={styles.placeLabel}>
            {p.name}
          </text>
        </g>
      ))}
      {g.rings.map((r) => (
        <circle key={r.key} cx={r.x} cy={r.y} r={r.r} className={`${styles.ring} ${cls(r.tripId)}`} strokeDasharray={styleOf(r.tripId) === 'count-b' ? dashUnconfirmed : undefined} onClick={() => onSelect(r.tripId)} />
      ))}
      {g.arcs.map((a) => (
        <g key={a.tripId} onClick={() => onSelect(a.tripId)}>
          <path d={a.d} className={styles.arcHalo} />
          <path d={a.d} className={`${styles.arc} ${cls(a.tripId)}`} strokeDasharray={styleOf(a.tripId) === 'count-b' ? dashUnconfirmed : undefined} />
          <circle cx={a.head.x} cy={a.head.y} r={dot - 1} className={`${styles.head} ${cls(a.tripId)}`} />
        </g>
      ))}
    </svg>
  )
}

export function ArcMapInteractive({ wide, narrow, trips, details }: { wide: MapGeometry; narrow: MapGeometry; trips: TripMeta[]; details: Record<string, ReactNode> }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const quiet = useQuietMotion()
  useEffect(() => {
    if (!playing || quiet) return
    const i = trips.findIndex((t) => t.id === selected)
    const t = window.setTimeout(() => {
      if (i >= trips.length - 1) setPlaying(false)
      else setSelected(trips[i + 1].id)
    }, layout.stepMs * (2 + 2))
    return () => window.clearTimeout(t)
  }, [playing, quiet, selected, trips])
  const select = (id: string) => setSelected(selected === id ? null : id)
  const idx = trips.findIndex((t) => t.id === selected)
  return (
    <div className={styles.root} data-testid="day27-map">
      <div className={styles.controls}>
        {!quiet ? (
          <button type="button" className="btn" aria-pressed={playing} onClick={() => { if (!playing) setSelected(trips[0]?.id ?? null); setPlaying((p) => !p) }}>
            {playing ? 'Pause' : 'Play in date order'}
          </button>
        ) : null}
        <button type="button" className="btn" disabled={idx <= 0} onClick={() => setSelected(trips[idx - 1]?.id ?? null)}>Earlier trip</button>
        <button type="button" className="btn" disabled={idx >= trips.length - 1} onClick={() => setSelected(trips[idx + 1]?.id ?? trips[0]?.id ?? null)}>Later trip</button>
      </div>
      <TripMap g={wide} trips={trips} selected={selected} onSelect={select} />
      <TripMap g={narrow} trips={trips} selected={selected} onSelect={select} />
      <ol className={styles.trips} aria-label="Trips in date order">
        {trips.map((t) => (
          <li key={t.id} className={selected === t.id ? styles.tripOn : undefined}>
            <button type="button" className={styles.tripBtn} aria-pressed={selected === t.id} onClick={() => select(t.id)}>
              <span className={`${styles.key} ${styles[`k_${t.style.replace('-', '_')}`]}`} aria-hidden="true" />
              <span className="mono">{t.date}</span> {t.label}
            </button>
            {selected === t.id ? <div className={styles.detail} aria-live="polite">{details[t.id]}</div> : null}
          </li>
        ))}
      </ol>
    </div>
  )
}
