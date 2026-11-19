// Day 19: After the Lawsuit: November 2023 to September 2024, Person by Person (Builder 3).
// Swimlanes: one lane per person or group; each event sits in the lane of whoever acted, with a line to whoever
// it reached. Geometry for every zoom level is computed here at build time.
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { extrasFrom, levelWords } from '@/viz/kits/days-15-21/sources'
import { OmittedNote, VizTable, type TableRow } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { whenText } from './format'
import { swimGeo, zoomKeys } from './geometry'
import Day19Interactive from './Interactive'
import { meta } from './meta'
import { LANES, select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

const laneName = (id: string | null) => LANES.find((l) => l.id === id)?.name ?? 'no one named'

export default function Day19Viz({ day }: DayVizProps) {
  const sel = select(day)
  const zooms = zoomKeys(sel.events)
  const geo = Object.fromEntries(
    zooms.map((z) => [z, { wide: swimGeo(sel.events, z, false, layout.chartWidth), narrow: swimGeo(sel.events, z, true, layout.phoneWidth - layout.gap * 2) }]),
  )
  return (
    <div className={k.viz} data-viz="day-19">
      <Day19Interactive events={sel.events} geo={geo} zooms={zooms} pool={sel.pool} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const p: string[] = [
    `The picture is a swimlane timeline with ${LANES.length} lanes: ${LANES.map((l) => l.name).join(', ')}. It holds ${sel.events.length} events in time order. Each event sits in the lane of whoever acted, with a line to the lane of the person it reached. Order is not cause: the chart shows what happened when, not why.`,
    ...sel.events.map((e) => `${whenText(e)}: ${e.title} (${laneName(e.from)}${e.to ? ` to ${laneName(e.to)}` : ''}; ${levelWords(e.level)}; Day ${e.fromDay}).`),
  ]
  const rows: TableRow[] = sel.events.map((e) => ({
    key: e.id,
    what: e.title,
    value: `${laneName(e.from)}${e.to ? ` to ${laneName(e.to)}` : ''}`,
    when: whenText(e),
    level: e.level,
    sources: e.sources,
  }))
  return (
    <div className={k.longDesc}>
      {p.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`Events from ${sel.events.length ? whenText(sel.events[0]) : ''} to ${sel.events.length ? whenText(sel.events[sel.events.length - 1]) : ''}, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} />
      <OmittedNote count={sel.omitted} why="they describe injuries." />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
