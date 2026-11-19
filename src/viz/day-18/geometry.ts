// Day 18 geometry (build time): one hours axis for the nights, a second axis for recovery.
import { scaleLinear, ticks } from 'd3'
import { formatInt } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { HOURS_PER_DAY } from '../day-15/kit/time'
import type { Day18Selection, Who } from './select'

export interface Tick { x: number; label: string }
export interface Ticks { hours: Tick[]; days: Tick[] }
export interface RowGeo { id: string; who: Who; y: number; x0: number; x1: number; labelX: number; labelY: number }
export interface PanelGeo { top: number; bottom: number; ticks: Ticks; dayLines: number[]; title: string }
export interface Day18Geo {
  width: number
  height: number
  plotX0: number
  plotX1: number
  rows: RowGeo[]
  headers: Array<{ who: Who; y: number }>
  panels: PanelGeo[]
  overlap: { x0: number; x1: number; y0: number; y1: number } | null
  stacked: boolean
}

const dec = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })

function axisTicks(x: (h: number) => number, max: number, width: number): Ticks {
  const count = Math.max(2, Math.floor(width / (layout.tap * 2)))
  return {
    hours: ticks(0, max, count).map((h) => ({ x: x(h), label: `${formatInt(h)} h` })),
    days: ticks(0, max / HOURS_PER_DAY, count).map((d) => ({ x: x(d * HOURS_PER_DAY), label: `${dec.format(d)} d` })),
  }
}

export function layoutDay18(sel: Day18Selection, width: number, stacked: boolean): Day18Geo {
  const plotX0 = stacked ? layout.stroke.mark : layout.tap * (layout.dot + 1)
  const plotX1 = width - layout.margin.right
  const rowH = stacked ? layout.tap + layout.dot : layout.margin.top + layout.dot * 2
  const headH = layout.margin.top + layout.dot * 2
  const axisH = layout.margin.top + layout.gap / 2
  const night = sel.spans.filter((s) => s.who !== 'recovery')
  const rec = sel.spans.filter((s) => s.who === 'recovery')
  const nightMax = scaleLinear().domain([0, Math.max(...night.map((s) => s.hi), 1)]).nice().domain()[1]
  const recMax = scaleLinear().domain([0, Math.max(...rec.map((s) => s.hi), 1)]).nice().domain()[1]
  const xN = scaleLinear().domain([0, nightMax]).range([plotX0, plotX1])
  const xR = scaleLinear().domain([0, recMax]).range([plotX0, plotX1])

  const rows: RowGeo[] = []
  const headers: Day18Geo['headers'] = []
  const panels: PanelGeo[] = []
  let y = axisH
  let overlapTop = 0
  let overlapBottom = 0
  for (const who of ['ventura', 'jane', 'recovery'] as Who[]) {
    const list = sel.spans.filter((s) => s.who === who)
    if (list.length === 0) continue
    if (who === 'recovery') {
      const top = y + layout.gap
      y = top + axisH
      panels.push({ top, bottom: 0, ticks: { hours: [], days: [] }, dayLines: [], title: 'Recovery, on its own longer scale' })
    }
    headers.push({ who, y: y + headH - layout.dot * 2 })
    if (who !== 'recovery' && overlapTop === 0) overlapTop = y + headH
    y += headH
    const x = who === 'recovery' ? xR : xN
    for (const s of list) {
      const cy = stacked ? y + rowH - layout.gap : y + rowH / 2
      rows.push({ id: s.id, who, y: cy, x0: x(s.lo), x1: x(s.hi), labelX: stacked ? plotX0 : layout.stroke.mark, labelY: stacked ? y + layout.fontSize.label : cy + layout.dot - 1 })
      y += rowH
    }
    if (who === 'jane') overlapBottom = y
  }
  const nightPanel: PanelGeo = {
    top: 0, bottom: overlapBottom || y, ticks: axisTicks(xN, nightMax, plotX1 - plotX0),
    dayLines: ticks(0, nightMax / HOURS_PER_DAY, Math.ceil(nightMax / HOURS_PER_DAY)).filter((d) => d > 0 && Number.isInteger(d)).map((d) => xN(d * HOURS_PER_DAY)), title: '',
  }
  if (panels[0]) {
    panels[0].bottom = y
    panels[0].ticks = axisTicks(xR, recMax, plotX1 - plotX0)
    panels[0].dayLines = []
  }
  return {
    width,
    height: y + layout.dot,
    plotX0,
    plotX1,
    rows,
    headers,
    panels: [nightPanel, ...panels],
    overlap: sel.overlap ? { x0: xN(sel.overlap.lo), x1: xN(sel.overlap.hi), y0: overlapTop - layout.dot, y1: overlapBottom } : null,
    stacked,
  }
}
