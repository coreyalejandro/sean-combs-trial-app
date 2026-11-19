// Day 21: Every Payment Named in Jane's Testimony (Builder 3).
// Monthly money as bands, one-time payments as a swarm of dots sized by amount, and the undated amounts and the
// total beside them on the same dot scale. Everything is read from Days 17 to 22.
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { extrasFrom, levelWords } from '@/viz/kits/days-15-21/sources'
import { OmittedNote, VizTable, type TableRow } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { amountText } from './format'
import { layoutDay21 } from './geometry'
import Day21Interactive from './Interactive'
import { meta } from './meta'
import { select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day21Viz({ day }: DayVizProps) {
  const sel = select(day)
  const geo = { wide: layoutDay21(sel, layout.chartWidth - layout.margin.top * (layout.dot * 2 + 1) - layout.gap, false), narrow: layoutDay21(sel, layout.phoneWidth - layout.gap * 2, true) }
  return (
    <div className={k.viz} data-viz="day-21">
      <Day21Interactive items={sel.items} geo={geo} pool={sel.pool} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const p: string[] = [
    'The picture has two panels on one time axis. The upper panel shows money paid each month as bands; the lower panel shows one-time payments as dots whose area is proportional to the dollars. Red dashed marks are amounts Jane asked for, not amounts paid. Amounts with no date, and the total, sit beside the chart on the same dot scale.',
    ...sel.items.map((m) => `${m.label}: ${amountText(m)}, ${m.when}${m.formula ? ` (calculated: ${m.formula})` : ''} (${levelWords(m.level)}; Day ${m.fromDays.join(' and Day ')}).`),
  ]
  const rows: TableRow[] = sel.items.map((m) => ({
    key: m.id, what: m.label, value: `${amountText(m)}${m.formula ? ' (calculated)' : ''}`, when: m.when, level: m.level, sources: m.sources,
  }))
  return (
    <div className={k.longDesc}>
      {p.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`Money between Combs and Jane, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} />
      <OmittedNote count={sel.omitted} why="they count sexual encounters." />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
