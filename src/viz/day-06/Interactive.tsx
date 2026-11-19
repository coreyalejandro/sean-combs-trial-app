'use client'
// Day 6: the year slider, Play (or step buttons in quiet mode), selectable dots, and the account list.
// The build-time HTML shows the last year, with every dot on the map.
import { useEffect, useState, type ReactNode } from 'react'
import { layout } from '@/lib/viz/layout'
import { useQuiet as useQuietMotion } from '../day-01/kit/useQuiet'
import { useRovingFocus } from '@/lib/viz/roving'
import { Sourced } from '../day-01/kit/Parts'
import type { Level, Ref } from '../day-01/kit/refs'
import type { Account } from './select'
import s from './day06.module.css'

export interface Marker {
  key: string
  accountIds: string[]
  x: number
  y: number
  label: string
  cluster?: boolean
  /** Callout markers: the true location, and which side the label sits on. */
  ax?: number
  ay?: number
  side?: 'left' | 'right'
}

export interface MapPanel {
  id: string
  title: string
  w: number
  h: number
  base: ReactNode
  markers: Marker[]
}

interface PlaceInfo {
  id: string
  name: string
  level: Level
  refs: Ref[]
}

const confClass: Record<Level, string> = { high: s.solid, medium: s.hollow, low: s.dashed, conflict: s.split }

export function DotMap({ panels, accounts, places, shapes, yearFrom, yearTo, labels }: { panels: MapPanel[]; accounts: Account[]; places: PlaceInfo[]; shapes: Record<string, string>; yearFrom: number; yearTo: number; labels: Record<string, string> }) {
  const quiet = useQuietMotion()
  const [year, setYear] = useState(yearTo)
  const [playing, setPlaying] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  useEffect(() => {
    if (!playing || quiet) return
    if (year >= yearTo) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setYear((y) => y + 1), layout.stepMs)
    return () => window.clearTimeout(t)
  }, [playing, quiet, year, yearTo])

  const visible = (a: Account) => a.year === null || a.year <= year
  const byId = (id: string) => accounts.find((a) => a.id === id)
  const listOrder = [...accounts].sort((a, b) => (a.year ?? Infinity) - (b.year ?? Infinity))
  const roving = useRovingFocus(listOrder.length, { onSelect: (i) => setOpen(listOrder[i].id), onExit: () => setOpen(null) })
  const shownCount = accounts.filter((a) => visible(a) && a.year !== null).length
  const openAcc = open ? byId(open) : null
  const placeName = (id: string | null) => places.find((p) => p.id === id)?.name ?? 'Place not reported'

  return (
    <div className={s.mapWrap}>
      <div className={s.controls}>
        <label htmlFor="violence-map-year" className={s.yearLabel}>
          Accounts through <span className={s.yearNum}>{year}</span>
        </label>
        <input
          id="violence-map-year"
          type="range"
          min={yearFrom}
          max={yearTo}
          step={1}
          value={year}
          className={s.slider}
          onChange={(e) => {
            setPlaying(false)
            setYear(Number(e.target.value))
          }}
          aria-valuetext={`Through ${year}: ${shownCount} dated accounts on the map`}
        />
        <div className={s.buttons}>
          {quiet ? null : (
            <button
              type="button"
              className={s.btn}
              aria-pressed={playing}
              onClick={() => {
                if (!playing && year >= yearTo) setYear(yearFrom)
                setPlaying(!playing)
              }}
            >
              {playing ? 'Pause' : 'Play the years'}
            </button>
          )}
          <button type="button" className={s.btn} onClick={() => setYear((y) => Math.max(yearFrom, y - 1))} disabled={year <= yearFrom}>
            Earlier year
          </button>
          <button type="button" className={s.btn} onClick={() => setYear((y) => Math.min(yearTo, y + 1))} disabled={year >= yearTo}>
            Later year
          </button>
        </div>
      </div>

      <div className={s.panels}>
        {panels.map((p) => (
          <div key={p.id} className={`${s.panel} ${s[`panel_${p.id}`] ?? ''}`}>
            <svg viewBox={`0 0 ${p.w} ${p.h}`} className={s.svg} role="img" aria-label={`${p.title}: ${p.markers.filter((m) => m.accountIds.some((id) => { const a = byId(id); return a ? visible(a) : false })).map((m) => m.label).join(', ') || 'no dots yet'}`}>
              {p.base}
              {p.markers.map((m) => {
                const accs = m.accountIds.map(byId).filter((a): a is Account => !!a)
                const vis = accs.filter(visible)
                if (vis.length === 0) return null
                if (m.cluster) {
                  return (
                    <g key={m.key} aria-hidden="true" className={s.clusterMark}>
                      <circle cx={m.x} cy={m.y} r={layout.dot * 2 + layout.stroke.emphasis} className={s.cluster} />
                      <text x={m.x} y={m.y} textAnchor="middle" dominantBaseline="central" className={s.clusterNum}>{vis.length}</text>
                      <text x={m.x + layout.gap + layout.dot} y={m.y} dominantBaseline="central" className={s.mapLabel}>{m.label} (see inset)</text>
                    </g>
                  )
                }
                const a = vis[0]
                const callout = m.ax !== undefined && m.ay !== undefined
                return (
                  <g key={m.key} className={`${s.dot} ${open === a.id ? s.dotOpen : ''} ${a.year === null ? s.undated : ''}`} onClick={() => setOpen(open === a.id ? null : a.id)} aria-hidden="true">
                    {callout ? (
                      <>
                        <line x1={m.x} y1={m.y} x2={m.ax} y2={m.ay} className={s.leader} />
                      </>
                    ) : null}
                    <g transform={`translate(${m.x},${m.y})`}>
                      <path d={shapes[a.witness]} className={`${s.mark} ${confClass[a.level]}`} />
                      {a.year === year ? <circle r={layout.gap} className={s.pulse} /> : null}
                      {callout ? (
                        <text x={(m.side === 'left' ? 1 : -1) * (layout.gap - layout.stroke.emphasis)} dominantBaseline="central" textAnchor={m.side === 'left' ? 'start' : 'end'} className={s.mapLabel}>
                          {a.witness.split(' ').slice(-1)[0]} {a.year ?? '?'}
                        </text>
                      ) : (
                        <text y={-(layout.gap - layout.stroke.mark)} textAnchor="middle" className={s.mapLabel}>
                          {a.witness.split(' ').slice(-1)[0]} {a.year ?? '?'}
                        </text>
                      )}
                    </g>
                  </g>
                )
              })}
            </svg>
            <p className={s.panelTitle}>{p.title}</p>
          </div>
        ))}
      </div>

      <div className={s.listCol}>
        <ol className={s.list} onKeyDown={roving.onKeyDown} aria-label="Every account, by year">
          {listOrder.map((a, i) => (
            <li key={a.id} className={`${visible(a) ? '' : s.notYet} ${open === a.id ? s.listOpen : ''}`}>
              <button
                type="button"
                className={s.listBtn}
                data-roving-index={i}
                tabIndex={roving.tabIndexFor(i)}
                aria-expanded={open === a.id}
                onClick={() => {
                  roving.setActive(i)
                  setOpen(open === a.id ? null : a.id)
                }}
              >
                <svg viewBox={`${-layout.gap / 2} ${-layout.gap / 2} ${layout.gap} ${layout.gap}`} className={s.legendShape} aria-hidden="true">
                  <path d={shapes[a.witness]} className={`${s.mark} ${confClass[a.level]}`} transform={`scale(${layout.stroke.emphasis / (layout.stroke.emphasis + layout.stroke.mark)})`} />
                </svg>
                <span className={s.listYear}>{a.year ?? 'Year not reported'}</span>
                <span className={s.listWho}>{a.witness}</span>
                <span className={s.listWhere}>{placeName(a.placeId)}{a.onFlight ? ', on a flight' : ''}</span>
              </button>
              {open === a.id ? (
                <div className={s.listDetail}>
                  <p>{a.text}</p>
                  <Sourced level={a.level} refs={a.refs} labels={labels} />
                  {a.fromDays.length > 0 ? <p className={s.days}>Testified on {a.fromDays.map((d) => `Day ${d}`).join(', ')}</p> : null}
                </div>
              ) : null}
            </li>
          ))}
        </ol>
        {openAcc ? null : <p className={s.hint}>Select an account (or a dot) to read it, with its source.</p>}
      </div>
    </div>
  )
}
