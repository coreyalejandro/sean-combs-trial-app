// Day 21 geometry (build time): a monthly-money panel (dollars per month over time) above a swarm of one-time
// payments (dots sized by amount, area true to dollars). Undated amounts and the total use the same dot scale.
import { scaleLinear, scaleSqrt, scaleUtc, utcYear } from 'd3'
import { formatUSDShort } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { isoToDate } from '@/viz/kits/days-15-21/time'
import type { Day21Selection } from './select'

export interface Day21Geo {
  width: number
  height: number
  x0: number
  x1: number
  monthly: { top: number; bottom: number; ticks: Array<{ y: number; label: string }> }
  swarm: { top: number; bottom: number; mid: number }
  years: Array<{ x: number; label: string }>
  bands: Array<{ id: string; x0: number; x1: number; yLo: number; yHi: number; y0: number }>
  lines: Array<{ id: string; x0: number; x1: number; y: number }>
  dots: Array<{ id: string; x: number; y: number; r: number }>
  /** Radius for any dollar amount, on the swarm's scale (for the cards). */
  rFor: Record<string, number>
}

export function layoutDay21(sel: Day21Selection, width: number, narrow: boolean): Day21Geo {
  const x0 = layout.margin.left + (narrow ? 0 : layout.gap)
  const x1 = width - layout.margin.right
  const start = isoToDate(sel.domain[0])?.date ?? new Date(0)
  const end = isoToDate(sel.domain[1])?.date ?? new Date(0)
  const x = scaleUtc().domain([start, end]).range([x0, x1])
  const monthlyItems = sel.items.filter((i) => i.kind === 'monthly' || i.kind === 'asked-monthly' || (i.kind === 'income' && i.id !== 'child'))
  const top = layout.margin.top
  const panelH = narrow ? layout.tap * (2 + 2) : layout.tap * (2 + 2) + layout.margin.top
  const yMax = scaleLinear().domain([0, Math.max(1, ...monthlyItems.map((i) => i.hi))]).nice().domain()[1]
  const y = scaleLinear().domain([0, yMax]).range([top + panelH, top])
  const total = sel.items.find((i) => i.kind === 'total')?.hi ?? Math.max(1, ...sel.items.map((i) => i.hi))
  const rTotal = narrow ? layout.tap - layout.dot : layout.tap + layout.gap
  const r = scaleSqrt().domain([0, total]).range([0, rTotal])
  const swarmTop = top + panelH + layout.margin.bottom
  const biggest = Math.max(layout.gap, ...sel.items.filter((i) => i.kind === 'payment' || i.kind === 'asked').map((i) => r(i.hi)))
  const mid = swarmTop + biggest + layout.dot
  const swarmBottom = mid + biggest + layout.dot

  const at = (iso: string | null) => (iso ? x(isoToDate(iso)?.date ?? start) : x0)
  const bands: Day21Geo['bands'] = []
  const lines: Day21Geo['lines'] = []
  for (const i of monthlyItems) {
    const a = i.start ? at(i.start) : x0
    const b = i.end ? at(i.end) : x1
    if (i.kind === 'income') lines.push({ id: i.id, x0: a, x1: b, y: y(i.hi) })
    else bands.push({ id: i.id, x0: a, x1: b, yLo: y(i.lo), yHi: y(i.hi), y0: y(0) })
  }
  // one-time payments: dodge so dots never overlap
  const placed: Day21Geo['dots'] = []
  for (const i of sel.items.filter((m) => m.kind === 'payment' || m.kind === 'asked').sort((a, b) => b.hi - a.hi)) {
    const cx = at(i.start)
    const ri = r(i.hi)
    // an "asked" ring shares its centre with the payment it was asked for
    const twin = placed.find((p) => Math.abs(p.x - cx) < 1)
    const twinKind = twin ? sel.items.find((m) => m.id === twin.id)?.kind : undefined
    const concentric = twin && (i.kind === 'asked' || twinKind === 'asked')
    const cy = !twin ? mid : concentric ? twin.y : twin.y + twin.r + ri + layout.stroke.mark
    placed.push({ id: i.id, x: cx, y: cy, r: ri })
  }
  const rFor = Object.fromEntries(sel.items.map((i) => [i.id, r(i.hi)]))
  const ticks = y.ticks(narrow ? 2 + 1 : layout.dot).map((v) => ({ y: y(v), label: formatUSDShort(v) }))
  return {
    width,
    height: swarmBottom + layout.gap,
    x0,
    x1,
    monthly: { top, bottom: top + panelH, ticks },
    swarm: { top: swarmTop, bottom: swarmBottom, mid },
    years: utcYear.range(start, end).map((d) => ({ x: x(d), label: String(d.getUTCFullYear()) })),
    bands,
    lines,
    dots: placed,
    rFor,
  }
}
