'use client'
// Day 8 picture: the dumbbell of waiting. One row per account; the open dot is the earliest event
// described, the red dot the first step toward a court or police (or the first contact with
// investigators), and the red beads between them count the years. Rows without a date say so.
import { useState } from 'react'
import { scaleLinear } from 'd3'
import { useRovingFocus } from '@/lib/viz/roving'
import { g } from './kit/geom'
import { ConfDot, FactMeta, kit, dayList } from './kit/ui'
import type { SourceBook } from './kit/facts'
import { MODES, type Mode, type Row } from './select'
import css from './day08.module.css'

export interface Day08View {
  rows: Row[]
  years: [number, number]
  book: SourceBook
}

const yearsWord = (n: number) => `${n} ${n === 1 ? 'year' : 'years'}`

function gapOf(row: Row, mode: Mode): number | null {
  const a = row.start.year
  const b = row.ends[mode].year
  return a === null || b === null ? null : b - a
}

const monthOf = (v: number | string | null | undefined) => (v === null || v === undefined ? null : String(v).match(/\b\d{4}-\d{2}/)?.[0] ?? null)

function gapWords(row: Row, mode: Mode): string {
  const n = gapOf(row, mode)
  if (n === null) return 'not stated in coverage'
  const m1 = monthOf(row.start.fact?.value)
  const m2 = monthOf(row.ends[mode].fact?.value)
  if (n === 0 && m1 && m1 === m2) return 'same month'
  return yearsWord(n)
}

function Chart({ view, mode, width, narrow, selected, onSelect }: { view: Day08View; mode: Mode; width: number; narrow: boolean; selected: number | null; onSelect: (i: number) => void }) {
  const { rows, years } = view
  const roving = useRovingFocus(rows.length, { onSelect })
  const labelW = narrow ? 0 : g.labelW
  const gapCol = narrow ? g.tap * 2 : g.tap * 2 + g.gap * 2
  const rowH = narrow ? g.rowH + g.gap : g.rowH
  const top = g.top + g.gap
  const height = top + rows.length * rowH + g.half
  const x = scaleLinear().domain([years[0] - 1, years[1] + 1]).range([labelW + g.gap, width - gapCol - g.gap])
  const ticks = x.ticks(narrow ? g.quarter : g.font.small).filter((t) => Number.isInteger(t))
  const trackY = (i: number) => top + i * rowH + (narrow ? g.font.label + g.gap : rowH / 2)
  const r = g.bigDot
  return (
    <svg
      className={kit.svg}
      viewBox={`0 0 ${width} ${height}`}
      role="group"
      aria-label={`Dumbbell chart: years from the earliest event each account describes to ${MODES.find((m) => m.id === mode)?.long}. Use the arrow keys to move between rows and Enter to open one.`}
      onKeyDown={roving.onKeyDown}
    >
      {/* year grid */}
      <g aria-hidden="true">
        {ticks.map((t) => (
          <g key={t} transform={`translate(${x(t)},0)`}>
            <line y1={top - g.half} y2={height - g.half} stroke="var(--rule-paper)" strokeWidth={1} />
            <text y={top - g.half - 2 - 2} textAnchor="middle" className="mono" fontSize={g.font.small} fill="var(--muted-ink)">{t}</text>
          </g>
        ))}
        <text x={width - gapCol / 2} y={top - g.half - 2 - 2} textAnchor="middle" fontSize={g.font.small} className="mono" fill="var(--muted-ink)">wait</text>
      </g>
      {rows.map((row, i) => {
        const y = trackY(i)
        const end = row.ends[mode]
        const x0 = row.start.year !== null ? x(row.start.year) : null
        const x1 = end.year !== null ? x(end.year) : null
        const n = gapOf(row, mode)
        const beads = n && n > 1 && row.start.year !== null ? Array.from({ length: n - 1 }, (_, k) => (row.start.year as number) + k + 1) : []
        const isSel = selected === i
        return (
          <g
            key={row.id}
            data-roving-index={i}
            tabIndex={roving.tabIndexFor(i)}
            role="button"
            aria-pressed={isSel}
            data-selected={isSel}
            aria-label={`${row.who}${row.pseudonym ? ' (pseudonym)' : ''}: ${row.start.label}, ${row.start.year ?? 'year not stated'}; ${end.label}, ${end.year ?? 'not stated in coverage'}. Wait: ${gapWords(row, mode)}.`}
            onClick={() => onSelect(i)}
            onFocus={() => roving.setActive(i)}
          >
            <rect className={kit.focusRing} x={1} y={y - rowH / 2 + (narrow ? -g.half : 2)} width={width - 2} height={rowH - 2 - 2} rx={2} />
            <rect x={0} y={y - rowH / 2} width={width} height={rowH} className={isSel ? css.rowSel : css.rowBg} />
            <text x={narrow ? g.half : 0} y={narrow ? y - g.gap - 2 : y + g.font.label / 2 - 2} fontSize={g.font.label + 2} fontWeight="bold">
              {row.who}
              {row.pseudonym ? <tspan fontWeight="normal" fill="var(--muted-ink)" fontSize={g.font.small}> (pseudonym)</tspan> : null}
            </text>
            {x0 !== null && x1 !== null ? (
              <>
                <line x1={x0} x2={x1} y1={y} y2={y} stroke="var(--red)" strokeWidth={g.stroke.emphasis + 2} strokeLinecap="round" className={css.bar} />
                {beads.map((b) => (
                  <circle key={b} cx={x(b)} cy={y} r={2} fill="#fff" aria-hidden="true" />
                ))}
              </>
            ) : x0 !== null ? (
              <line x1={x0} x2={width - gapCol - g.half} y1={y} y2={y} stroke="var(--neutral)" strokeWidth={g.stroke.mark} strokeDasharray={g.dash} />
            ) : null}
            {x0 !== null && <ConfDot cx={x0} cy={y} r={r} level={row.start.fact?.confidence ?? null} color="var(--ink)" />}
            {x0 !== null && (
              <text x={x0} y={y + r + g.font.small + 2} textAnchor={x1 !== null && x1 - x0 < g.tap ? 'end' : 'middle'} fontSize={g.font.small} className="mono" fill="var(--muted-ink)">{row.start.year}</text>
            )}
            {x1 !== null && (
              <g className={css.endDot} style={{ transform: `translate(${x1}px, 0px)` }}>
                <ConfDot cx={0} cy={y} r={r} level={end.fact?.confidence ?? null} color="var(--red)" />
                {x0 !== null && x1 !== x0 ? (
                  <text x={0} y={y + r + g.font.small + 2} textAnchor="middle" fontSize={g.font.small} className="mono" fill="var(--muted-ink)">{end.year}</text>
                ) : null}
              </g>
            )}
            <text x={width - gapCol / 2} y={y + g.font.value / 2 - 2} textAnchor="middle" fontSize={n === null ? g.font.small : g.font.value} fontWeight={n === null ? 'normal' : 'bold'} className="mono" fill={n === null ? 'var(--muted-ink)' : 'var(--ink)'}>
              {n === null ? (narrow ? 'not stated' : 'not in coverage') : gapWords(row, mode)}
            </text>
            {n !== null ? (
              <text x={width - gapCol / 2} y={y + g.font.value + 2 + 2} textAnchor="middle" fontSize={g.font.small - 2} className="mono" fill="var(--muted-ink)">calculated</text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export function Day08Interactive({ view }: { view: Day08View }) {
  const [mode, setMode] = useState<Mode>('legal')
  const [selected, setSelected] = useState<number | null>(null)
  const row = selected !== null ? view.rows[selected] : null
  const other: Mode = mode === 'legal' ? 'official' : 'legal'
  return (
    <div className={css.root}>
      <div className={kit.controls} role="group" aria-label="Measure the wait to">
        <span className={kit.controlLabel} aria-hidden="true">Measure to</span>
        <span className={kit.seg}>
          {MODES.map((m) => (
            <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</button>
          ))}
        </span>
      </div>
      <div className={kit.wide}>
        <Chart view={view} mode={mode} width={g.wideW} narrow={false} selected={selected} onSelect={setSelected} />
      </div>
      <div className={kit.narrow}>
        <Chart view={view} mode={mode} width={g.narrowW} narrow selected={selected} onSelect={setSelected} />
      </div>
      <div className={kit.legendRow} aria-hidden="true">
        <span><svg width={g.gap} height={g.gap}><ConfDot cx={g.half} cy={g.half} r={g.half - 2} level="high" /></svg> earliest event described</span>
        <span><svg width={g.gap} height={g.gap}><ConfDot cx={g.half} cy={g.half} r={g.half - 2} level="high" color="var(--red)" /></svg> first step (as chosen above)</span>
        <span>white beads = one per year in between</span>
        <span>dot style = how sure: solid, hollow, dashed, split</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {row ? (
          <>
            <p className={kit.kicker}>{row.who}{row.pseudonym ? ' (pseudonym)' : ''}</p>
            <h3>{gapWords(row, mode) === 'not stated in coverage' ? 'The wait is not stated in coverage' : `Wait: ${gapWords(row, mode)}`}</h3>
            <ul>
              <li>
                <strong>{row.start.label}:</strong> {row.start.year ?? 'year not stated'}
                {row.start.fact ? <> · {row.start.fact.text} <span className="muted">({dayList(row.start.fact.days)})</span> <FactMeta fact={row.start.fact} book={view.book} /></> : null}
              </li>
              {[mode, other].map((m) => {
                const e = row.ends[m]
                return (
                  <li key={m}>
                    <strong>{MODES.find((x) => x.id === m)?.label}{m === mode ? ' (shown)' : ''}:</strong> {e.label}, {e.year ?? 'not stated in coverage'}
                    {e.fact ? <> · {e.fact.text} <span className="muted">({dayList(e.fact.days)})</span> <FactMeta fact={e.fact} book={view.book} /></> : null}
                  </li>
                )
              })}
            </ul>
            {gapOf(row, mode) !== null ? (
              <p className="muted">Calculated: {row.ends[mode].year} minus {row.start.year} = {gapWords(row, mode)}, counted in whole years.</p>
            ) : null}
          </>
        ) : (
          <p className={kit.panelHint}>Select a row (or use Tab, then the arrow keys and Enter) to see both dates, how sure each one is, and where it was reported.</p>
        )}
      </div>
    </div>
  )
}

