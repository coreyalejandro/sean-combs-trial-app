// Day 15: Where the $100,000 for the Hotel Video Went (Builder 3).
// A Sankey of the cash Garcia described, with a "two or more outlets only" switch and a pay ruler.
// Layout is computed here at build time (d3-sankey, d3 scales); the client child only switches and selects.
import { scaleLinear, ticks } from 'd3'
import { formatDate } from '@/lib/data'
import { formatInt } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { describe } from './describe'
import { flowLayout } from './geometry'
import Day15Interactive, { type Day15View, type RulerGeo } from './Interactive'
import { extrasFrom, numSources } from '@/viz/kits/days-15-21/sources'
import { VizTable } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { meta } from './meta'
import { select, usdCents, type NodeId } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

const SHORT: Record<NodeId, string> = {
  cash: 'Cash for the video',
  garcia: 'Garcia',
  rest: 'The rest',
  supervisor: 'His boss',
  officer: 'Another officer',
  nda: 'NDA he signed',
}

const WIDE = { width: layout.chartWidth, height: layout.breakpoint / 2 + layout.margin.top * 2 }
const NARROW = { width: layout.phoneWidth - layout.gap * 2, height: layout.chartWidth - layout.phoneWidth + layout.margin.top * 2 }

function ruler(width: number, hours: number): RulerGeo {
  const x0 = layout.gap
  const x = scaleLinear().domain([0, hours]).range([x0, width - layout.gap])
  const count = Math.max(2, Math.floor(width / (layout.tap * 2)))
  return {
    width,
    height: layout.tap + layout.gap,
    x0,
    barEnd: x(hours),
    ticks: ticks(0, hours, count).map((t) => ({ x: x(t), label: formatInt(t) })),
  }
}

export function buildView(sel: ReturnType<typeof select>): Day15View {
  const both = (size: { width: number; height: number }, vertical: boolean) => ({
    full: flowLayout(sel, { ...size, vertical, onlyConfirmed: false }),
    confirmed: flowLayout(sel, { ...size, vertical, onlyConfirmed: true }),
  })
  return {
    nodes: sel.nodes.map((n) => ({ id: n.id, name: n.name, shortName: SHORT[n.id], amount: n.amount, level: n.level, sources: n.sources, words: n.words, formula: n.formula, note: n.note })),
    steps: sel.steps,
    pool: sel.pool,
    geo: { wide: both(WIDE, false), narrow: both(NARROW, true) },
    dateText: sel.incidentDate ? formatDate(String(sel.incidentDate.value)) : null,
    pay:
      sel.payHours && sel.wage
        ? {
            hours: sel.payHours.hours,
            level: sel.payHours.level,
            formula: sel.payHours.formula,
            wageText: `${usdCents.format(Number(sel.wage.value))} an hour`,
            wageSources: numSources(sel.wage, sel.pool),
            ruler: { wide: ruler(WIDE.width, sel.payHours.hours), narrow: ruler(NARROW.width, sel.payHours.hours) },
          }
        : null,
  }
}

export default function Day15Viz({ day }: DayVizProps) {
  const sel = select(day)
  if (sel.nodes.length === 0) return <p>The record for this day has no cash figure to draw.</p>
  return (
    <div className={k.viz} data-viz="day-15">
      <Day15Interactive view={buildView(sel)} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { paragraphs, rows } = describe(sel)
  return (
    <div className={k.longDesc}>
      {paragraphs.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`The money in Garcia's account, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} whenLabel="Date" />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
