'use client'
// Day 13 picture: a log-scale dot line. Each gridline is ten times the one before, so amounts from
// tens of thousands to tens of millions fit on one line. Mia's mediation is drawn as a step down
// (asked, settled, to her); other amounts named at trial are context dots by kind. A switch redraws it
// on an ordinary scale to show why the log scale is needed. Wide screens run left to right; phones
// run top to bottom.
import { useMemo, useState } from 'react'
import { scaleLinear, scaleLog } from 'd3'
import { useRovingFocus } from '@/lib/viz/roving'
import { formatUSDShort } from '@/lib/viz/format'
import { g } from '@/viz/kits/days-08-14/geom'
import { ConfDot, FactMeta, kit, dayList } from '@/viz/kits/days-08-14/ui'
import type { SourceBook } from '@/viz/kits/days-08-14/facts'
import { KINDS, type Amount, type Kind } from './select'
import css from './day13.module.css'

export interface Day13View { mia: Amount[]; context: Amount[]; book: SourceBook }

const kindColor: Record<Kind, string> = { settlement: 'var(--prosecution)', ask: 'var(--ink)', payment: 'var(--defense)' }
const kindLabel = (k: Kind) => KINDS.find((x) => x.id === k)?.label ?? k

function powersOfTen(lo: number, hi: number): number[] {
  const ticks = scaleLog().domain([lo, hi]).ticks()
  return ticks.filter((t) => Number.isInteger(Math.log10(t)) || Math.abs(Math.log10(t) - Math.round(Math.log10(t))) < Number.EPSILON * t)
}

interface Placed { a: Amount; pos: number; lane: number; off: number; labelPos: number }

function Chart({ view, kinds, linear, vertical, sel, setSel }: { view: Day13View; kinds: Set<Kind | 'mia'>; linear: boolean; vertical: boolean; sel: string | null; setSel: (id: string | null) => void }) {
  const all = [...view.mia, ...view.context]
  const values = all.flatMap((a) => (a.alt ? [a.value, a.alt.value] : [a.value]))
  const log = scaleLog().domain([Math.min(...values), Math.max(...values)]).nice()
  const [lo, hi] = log.domain()
  const len = vertical ? g.rowH * (2 * 2 + 2 + 2 + 1) : g.wideW - g.labelW - g.gap * 2
  const start = vertical ? g.top + g.gap : g.labelW
  const scale = linear ? scaleLinear().domain([0, hi]).range(vertical ? [start + len, start] : [start, start + len]) : log.copy().range(vertical ? [start + len, start] : [start, start + len])
  const grid = linear ? scaleLinear().domain([0, hi]).ticks(g.quarter) : powersOfTen(lo, hi)
  const visibleMia = kinds.has('mia') ? view.mia : []
  const ctx = view.context.filter((a) => kinds.has(a.kind))
  const items = [...visibleMia, ...ctx]
  const roving = useRovingFocus(items.length, { onSelect: (i) => setSel(items[i]?.id ?? null), onExit: () => setSel(null) })

  // lanes: Mia first, then one per kind (wide); on phones, Mia in one column and the rest in another.
  const laneOf = (a: Amount) => (view.mia.includes(a) ? 0 : vertical ? 1 : 1 + KINDS.findIndex((k) => k.id === a.kind))
  const laneSize = vertical ? (g.narrowW - g.tap - g.gap * 2) / (2 + 1) : g.rowH + g.gap
  const levelStep = g.font.small * (2 + 1) + g.gap
  const laneStart = vertical ? g.tap + g.gap * 2 : g.top + g.gap * 2
  const labelW = g.tap * (2 + 1) + g.gap

  const placed: Placed[] = useMemo(() => {
    const out: Placed[] = []
    const byLane = new Map<number, Amount[]>()
    for (const a of items) byLane.set(laneOf(a), [...(byLane.get(laneOf(a)) ?? []), a])
    for (const [lane, as] of byLane) {
      const sorted = [...as].sort((p, q) => p.value - q.value)
      const lastEnd: number[] = []
      let lastLabel = -Infinity
      for (const a of sorted) {
        const pos = scale(a.value) as number
        if (vertical) {
          // labels to the right of the dots, pushed apart along the axis with a leader line
          const labelPos = Math.min(pos, lastLabel === -Infinity ? pos : lastLabel - (g.gap * 2 - 2))
          lastLabel = labelPos
          out.push({ a, pos, lane, off: 0, labelPos })
        } else {
          let level = lastEnd.findIndex((end) => pos - end > labelW)
          if (level < 0) level = lastEnd.length
          lastEnd[level] = pos
          out.push({ a, pos, lane, off: level, labelPos: pos })
        }
      }
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.map((a) => a.id).join(), linear, vertical])

  const levels = (lane: number) => Math.max(1, ...placed.filter((p) => p.lane === lane).map((p) => p.off + 1))
  const laneTop = (lane: number) => {
    let y = laneStart
    for (let l = 0; l < lane; l++) y += laneSize + (vertical ? 0 : (levels(l) - 1) * levelStep)
    return y
  }
  const laneCount = vertical ? 2 : KINDS.length + 1
  const W = vertical ? g.narrowW : g.wideW
  const H = vertical ? start + len + g.gap * 2 : laneTop(laneCount) + g.gap
  const r = g.bigDot
  const colX = (lane: number) => (lane === 0 ? g.tap + g.gap * 2 : g.narrowW / 2 + g.gap)
  const miaPts = placed.filter((p) => p.lane === 0).sort((p, q) => q.a.value - p.a.value)
  const xy = (p: Placed) => {
    const across = vertical ? colX(p.lane) : laneTop(p.lane) + g.gap + p.off * levelStep
    return vertical ? { x: across, y: p.pos } : { x: p.pos, y: across }
  }

  return (
    <svg className={kit.svg} viewBox={`0 0 ${W} ${H}`} role="group" aria-label={`Amounts named at trial on a ${linear ? 'ordinary' : 'logarithmic'} scale. Tab into the dots, use the arrow keys to move, and Enter to read one.`} onKeyDown={roving.onKeyDown}>
      <g aria-hidden="true">
        {grid.map((t) => {
          const p = scale(t) as number
          return vertical ? (
            <g key={t}>
              <line x1={g.tap + g.gap} x2={W} y1={p} y2={p} className={css.grid} />
              <text x={2} y={p - 2} textAnchor="start" className={css.gridText}>{formatUSDShort(t)}</text>
            </g>
          ) : (
            <g key={t}>
              <line x1={p} x2={p} y1={g.top} y2={H - g.half} className={css.grid} />
              <text x={p} y={g.top - g.quarter} textAnchor="middle" className={css.gridText}>{formatUSDShort(t)}</text>
            </g>
          )
        })}
        {!vertical &&
          Array.from({ length: laneCount }, (_, l) => (
            <text key={l} x={0} y={laneTop(l) + g.gap + g.quarter} className={css.laneText}>{l === 0 ? "Mia's mediation" : kindLabel(KINDS[l - 1].id)}</text>
          ))}
        {vertical ? (
          <>
            <text x={colX(0) - r} y={start - g.half} className={css.laneText}>Mia</text>
            <text x={colX(1) - r} y={start - g.half} className={css.laneText}>Other amounts</text>
          </>
        ) : null}
        {/* Mia's step-down */}
        {miaPts.length > 1 && (
          <path
            d={miaPts.map((p, i) => {
              const { x, y } = xy(p)
              return `${i === 0 ? 'M' : 'L'}${x} ${y}`
            }).join(' ')}
            className={css.step}
          />
        )}
      </g>
      {placed.map((p) => {
        const i = items.indexOf(p.a)
        const { x, y } = xy(p)
        const isSel = sel === p.a.id
        const color = view.mia.includes(p.a) ? 'var(--red)' : kindColor[p.a.kind]
        const altPos = p.a.alt ? (scale(p.a.alt.value) as number) : null
        const labelX = vertical ? x + r + g.gap : x
        const labelY = vertical ? p.labelPos - g.quarter : y + r + g.font.small + 2
        return (
          <g key={p.a.id} data-roving-index={i} tabIndex={roving.tabIndexFor(i)} role="button" aria-pressed={isSel} data-selected={isSel}
            aria-label={`${p.a.who}, ${p.a.label}: ${formatUSDShort(p.a.value)}${p.a.alt ? ` (another outlet: ${formatUSDShort(p.a.alt.value)})` : ''}`}
            onClick={() => setSel(isSel ? null : p.a.id)} onFocus={() => roving.setActive(i)} className={css.dotG}>
            <circle className={kit.focusRing} cx={x} cy={y} r={r + g.quarter} />
            {altPos !== null ? (
              <g aria-hidden="true">
                <line x1={x} y1={y} x2={vertical ? x : altPos} y2={vertical ? altPos : y} stroke={color} strokeDasharray={g.dash} />
                <circle cx={vertical ? x : altPos} cy={vertical ? altPos : y} r={r - 2} fill="#fff" stroke={color} strokeWidth={2} />
              </g>
            ) : null}
            <ConfDot cx={x} cy={y} r={r} level={p.a.fact.confidence} color={color} />
            {vertical && Math.abs(p.labelPos - p.pos) > 1 ? <line x1={x + r} y1={y} x2={labelX - 2} y2={p.labelPos} stroke="var(--muted-ink)" strokeWidth={1} aria-hidden="true" /> : null}
            <text x={labelX} y={labelY} textAnchor={vertical ? 'start' : 'middle'} className={css.dotLabel}>
              <tspan fontWeight="bold">{view.mia.includes(p.a) ? p.a.label : p.a.who}</tspan>
              {vertical ? <tspan x={labelX} dy={g.font.small + 2} className={css.mono}>{formatUSDShort(p.a.value)}</tspan> : <>{' '}<tspan className={css.mono}>{formatUSDShort(p.a.value)}</tspan></>}
            </text>
            {!view.mia.includes(p.a) && !vertical ? (
              <text x={labelX} y={labelY + g.font.small + 2} textAnchor="middle" className={css.dotSub}>{p.a.label}</text>
            ) : null}
          </g>
        )
      })}
    </svg>
  )
}

export function Day13Interactive({ view }: { view: Day13View }) {
  const [kinds, setKinds] = useState<Set<Kind | 'mia'>>(new Set(['mia', ...KINDS.map((k) => k.id)]))
  const [linear, setLinear] = useState(false)
  const [sel, setSel] = useState<string | null>(null)
  const a = [...view.mia, ...view.context].find((x) => x.id === sel) ?? null
  const toggle = (k: Kind | 'mia') => {
    const next = new Set(kinds)
    if (next.has(k)) next.delete(k)
    else next.add(k)
    setKinds(next)
  }
  return (
    <div>
      <div className={kit.controls} role="group" aria-label="Which amounts to show">
        <span className={kit.controlLabel} aria-hidden="true">Show</span>
        <button type="button" className={kit.chipBtn} aria-pressed={kinds.has('mia')} onClick={() => toggle('mia')}>
          <svg width={g.gap} height={g.gap} aria-hidden="true"><circle cx={g.half} cy={g.half} r={g.half - 2} fill="var(--red)" /></svg> Mia&apos;s mediation
        </button>
        {KINDS.map((k) => (
          <button key={k.id} type="button" className={kit.chipBtn} aria-pressed={kinds.has(k.id)} onClick={() => toggle(k.id)}>
            <svg width={g.gap} height={g.gap} aria-hidden="true"><circle cx={g.half} cy={g.half} r={g.half - 2} fill={kindColor[k.id]} stroke="#fff" strokeWidth={1} /></svg> {k.label}
          </button>
        ))}
      </div>
      <div className={kit.controls}>
        <span className={kit.controlLabel} aria-hidden="true">Scale</span>
        <span className={kit.seg} role="group" aria-label="Scale">
          <button type="button" aria-pressed={!linear} onClick={() => setLinear(false)}>Each gridline ten times the last</button>
          <button type="button" aria-pressed={linear} onClick={() => setLinear(true)}>Show on an ordinary scale</button>
        </span>
      </div>
      <p className={kit.note}>{linear ? 'On an ordinary scale, every amount under a million dollars crowds into the corner at zero. That is why the log scale is used.' : 'On this scale each gridline is ten times the one before it, so small and very large amounts both fit.'}</p>
      <div className={kit.wide}><Chart view={view} kinds={kinds} linear={linear} vertical={false} sel={sel} setSel={setSel} /></div>
      <div className={kit.narrow}><Chart view={view} kinds={kinds} linear={linear} vertical sel={sel} setSel={setSel} /></div>
      <div className={kit.legendRow} aria-hidden="true">
        <span>solid dot = two or more outlets; hollow = one outlet; dashed = one outlet, unconfirmed; half-filled = outlets disagree (the small open dot is the other outlet&apos;s figure)</span>
      </div>
      <div className={kit.panel} aria-live="polite">
        {a ? (
          <>
            <p className={kit.kicker}>{view.mia.includes(a) ? "Mia's mediation" : KINDS.find((k) => k.id === a.kind)?.plain}</p>
            <h3>{a.who}, {a.label}: {formatUSDShort(a.value)}</h3>
            <p>{a.fact.text} <span className="muted">({dayList(a.fact.days)})</span> <FactMeta fact={a.fact} book={view.book} /></p>
            {a.alt ? <p>Outlets disagree: {formatUSDShort(a.value)} in some reports, {formatUSDShort(a.alt.value)} per {a.alt.note}.</p> : null}
          </>
        ) : (
          <p className={kit.panelHint}>Select a dot for the amount, what it was for, how sure it is and where it was reported. A settlement is not an admission by either side.</p>
        )}
      </div>
    </div>
  )
}
