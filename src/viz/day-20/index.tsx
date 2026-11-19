// Day 20: Motions, Rulings and Immunity: The Legal Fights Behind the Testimony (Builder 3).
// A docket tracker: five lanes of legal events placed by trial day, each with an outcome shape and word.
// Counts are computed from the events, never typed.
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { extrasFrom, levelWords } from '@/viz/kits/days-15-21/sources'
import { VizTable, type TableRow } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { docketGeo } from './geometry'
import Day20Interactive from './Interactive'
import { meta } from './meta'
import { KINDS, select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day20Viz({ day }: DayVizProps) {
  const sel = select(day)
  return (
    <div className={k.viz} data-viz="day-20">
      <Day20Interactive events={sel.events} geo={docketGeo(sel.events, layout.chartWidth)} pool={sel.pool} counts={sel.counts} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const c = sel.counts
  const p: string[] = [
    `The picture is a docket tracker: ${KINDS.length} lanes (${KINDS.map((x) => x.name.toLowerCase()).join('; ')}), with each legal event placed at the trial day it happened and marked by an outcome shape and word. It holds ${c.total} events (calculated): ${c.motions} motions to end the case, ${c.motionsDenied} of them denied; ${c.immunity} witnesses who testified under immunity orders; ${c.denied} requests denied in all.`,
    ...KINDS.map((kind) => {
      const list = sel.events.filter((e) => e.kind === kind.id)
      return `${kind.name}: ${list.map((e) => `${e.dayLabel}, ${e.title.charAt(0).toLowerCase()}${e.title.slice(1)} (${e.outcome}; ${levelWords(e.level)})`).join('; ')}.`
    }),
  ]
  const rows: TableRow[] = sel.events.map((e) => ({
    key: e.id,
    what: `${e.title} (${KINDS.find((x) => x.id === e.kind)?.name})`,
    value: e.outcome,
    when: e.dayLabel,
    level: e.level,
    sources: e.sources,
  }))
  return (
    <div className={k.longDesc}>
      {p.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`The trial's legal events, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} whenLabel="Trial day" />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
