'use client'
// Day 3: the evidence matrix that fills over the trial. An ARIA grid (arrow keys move, Enter opens a cell),
// a day slider with Play (or step buttons in quiet mode). The build-time HTML shows the final day, fully filled.
import { scaleLinear } from 'd3'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { layout } from '@/lib/viz/layout'
import { useQuietMotion } from '@/lib/viz/motion'
import { Calculated, Sourced } from '@/viz/kits/days-01-07/Parts'
import type { MatrixRow, Piece } from './select'
import s from './day03.module.css'

export interface MatrixProps {
  rows: MatrixRow[]
  kinds: ReadonlyArray<{ id: string; label: string; short: string }>
  pieces: Piece[]
  firstDay: number
  lastDay: number
  filledByDay: number[]
  labels: Record<string, string>
}

export function Matrix(p: MatrixProps) {
  const quiet = useQuietMotion()
  const [day, setDay] = useState(p.lastDay)
  const [playing, setPlaying] = useState(false)
  const [active, setActive] = useState<[number, number]>([0, 0])
  const [open, setOpen] = useState<string | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!playing || quiet) return
    if (day >= p.lastDay) {
      setPlaying(false)
      return
    }
    const t = window.setTimeout(() => setDay((d) => d + 1), layout.stepMs)
    return () => window.clearTimeout(t)
  }, [playing, quiet, day, p.lastDay])

  const cellPieces = (rowId: string, kind: string) => p.pieces.filter((x) => x.row === rowId && x.kind === kind)
  const shown = (pcs: Piece[]) => pcs.filter((x) => x.day <= day)
  const filledNow = p.filledByDay[day - p.firstDay] ?? 0
  const total = p.rows.length * p.kinds.length

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const [r, c] = active
    let nr = r
    let nc = c
    if (e.key === 'ArrowRight') nc = Math.min(p.kinds.length - 1, c + 1)
    else if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1)
    else if (e.key === 'ArrowDown') nr = Math.min(p.rows.length - 1, r + 1)
    else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1)
    else if (e.key === 'Home') nc = 0
    else if (e.key === 'End') nc = p.kinds.length - 1
    else if (e.key === 'Enter' || e.key === ' ') {
      const key = `${p.rows[r].id}:${p.kinds[c].id}`
      setOpen(open === key ? null : key)
      e.preventDefault()
      return
    } else if (e.key === 'Escape') {
      setOpen(null)
      return
    } else return
    e.preventDefault()
    e.stopPropagation()
    setActive([nr, nc])
    gridRef.current?.querySelector<HTMLElement>(`[data-cell="${nr}-${nc}"]`)?.focus()
  }

  const openPieces = open ? p.pieces.filter((x) => `${x.row}:${x.kind}` === open) : []
  const openRow = open ? p.rows.find((r) => open.startsWith(`${r.id}:`)) : null
  const openKind = open ? p.kinds.find((k) => open.endsWith(`:${k.id}`)) : null

  // progress sparkline
  const sw = layout.phoneWidth
  const sh = layout.tap
  const sx = scaleLinear().domain([p.firstDay, p.lastDay]).range([0, sw])
  const sy = scaleLinear().domain([0, total]).range([sh, 0])
  const area = p.filledByDay.map((v, i) => `${i === 0 ? 'M' : 'L'}${sx(p.firstDay + i)} ${sy(v)}`).join(' ')

  return (
    <div className={s.matrixWrap}>
      <div className={s.controls}>
        <label htmlFor="evidence-matrix-day" className={s.dayLabel}>
          Trial day <span className={s.dayNum}>{day}</span>
        </label>
        <input
          id="evidence-matrix-day"
          type="range"
          className={s.slider}
          min={p.firstDay}
          max={p.lastDay}
          step={1}
          value={day}
          onChange={(e) => {
            setPlaying(false)
            setDay(Number(e.target.value))
          }}
          aria-valuetext={`Day ${day}: ${filledNow} of ${total} squares filled`}
        />
        <div className={s.buttons}>
          {quiet ? null : (
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                if (!playing && day >= p.lastDay) setDay(p.firstDay)
                setPlaying(!playing)
              }}
              aria-pressed={playing}
            >
              {playing ? 'Pause' : 'Play the trial'}
            </button>
          )}
          <button type="button" className={s.btn} onClick={() => setDay((d) => Math.max(p.firstDay, d - 1))} disabled={day <= p.firstDay}>
            Previous day
          </button>
          <button type="button" className={s.btn} onClick={() => setDay((d) => Math.min(p.lastDay, d + 1))} disabled={day >= p.lastDay}>
            Next day
          </button>
        </div>
        <div className={s.progress}>
          <svg viewBox={`0 0 ${sw} ${sh}`} preserveAspectRatio="none" className={s.spark} aria-hidden="true">
            <path d={`${area} L${sx(p.lastDay)} ${sh} L${sx(p.firstDay)} ${sh} Z`} className={s.sparkArea} />
            <line x1={sx(day)} x2={sx(day)} y1={0} y2={sh} className={s.sparkNow} />
          </svg>
          <p className={s.progressText} aria-live="polite">
            By Day {day}: <strong>{filledNow}</strong> of {total} squares filled <Calculated formula="cells with at least one piece of evidence that had arrived by this day" />
          </p>
        </div>
      </div>

      <div ref={gridRef} role="grid" aria-label="Events from Ventura's testimony by kind of evidence the jury saw" aria-rowcount={p.rows.length + 1} className={s.grid} onKeyDown={onKey} style={{ ['--cols' as string]: p.kinds.length }}>
        <div role="row" className={s.headRow}>
          <span role="columnheader" className={s.corner}>Event</span>
          {p.kinds.map((k) => (
            <span key={k.id} role="columnheader" className={s.colHead} aria-label={k.label}>
              <span className={s.longLabel} aria-hidden="true">{k.label}</span>
              <span className={s.shortLabel} aria-hidden="true">{k.short}</span>
            </span>
          ))}
        </div>
        {p.rows.map((row, ri) => (
          <div role="row" key={row.id} className={s.row}>
            <span role="rowheader" className={s.rowHead}>
              <span className={s.rowDate}>{row.label}</span>
              <span className={s.rowWhat}>{row.what}</span>
            </span>
            {p.kinds.map((k, ci) => {
              const all = cellPieces(row.id, k.id)
              const now = shown(all)
              const key = `${row.id}:${k.id}`
              const first = now[0]
              const isActive = active[0] === ri && active[1] === ci
              return (
                <div
                  key={k.id}
                  role="gridcell"
                  tabIndex={isActive ? 0 : -1}
                  data-cell={`${ri}-${ci}`}
                  data-filled={now.length > 0}
                  aria-selected={open === key}
                  aria-label={`${row.label}, ${k.label}: ${now.length === 0 ? 'nothing yet' : `${now.length} ${now.length === 1 ? 'piece' : 'pieces'}, first on Day ${first.day}`}`}
                  className={`${s.cell} ${now.length > 0 ? s.filled : ''} ${now.some((x) => x.day === day) ? s.fresh : ''} ${open === key ? s.open : ''} ${first && first.level !== 'medium' && first.level !== 'high' ? s.unsure : ''}`}
                  onClick={() => {
                    setActive([ri, ci])
                    setOpen(open === key ? null : key)
                  }}
                >
                  {first ? (
                    <>
                      <span className={s.cellDay} aria-hidden="true">D{first.day}</span>
                      {now.length > 1 ? (
                        <span className={s.pips} aria-hidden="true">
                          {now.slice(1).map((x) => (
                            <span key={x.id} className={s.pip} />
                          ))}
                        </span>
                      ) : null}
                    </>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className={s.detail} aria-live="polite">
        {open && openRow && openKind ? (
          <>
            <h3 className={s.detailTitle}>
              {openRow.label} · {openKind.label}
            </h3>
            {openPieces.length === 0 ? (
              <p className={s.detailEmpty}>The records hold no evidence of this kind for this event.</p>
            ) : (
              <ol className={s.detailList}>
                {openPieces.map((x) => (
                  <li key={x.id} className={x.day > day ? s.later : ''}>
                    <a href={`/day/${x.day}/`} className={s.dayLink}>Day {x.day}</a> {x.label}
                    {x.day > day ? <span className={s.notYet}> (arrives later)</span> : null} <Sourced level={x.level} refs={x.refs} labels={p.labels} whole={x.whole} />
                  </li>
                ))}
              </ol>
            )}
          </>
        ) : (
          <p className={s.detailEmpty}>Select a square (or use the arrow keys and Enter) to see which day, witness or exhibit filled it, with sources.</p>
        )}
      </div>
    </div>
  )
}
