// Day 16: The Life of One Video, from Hotel Camera to Jury Room (Builder 3).
// A chain-of-custody line: stops in time order, each from the day that reported it. Waits between stops
// are computed from the dates; the track length grows with the wait on a compressed (log) scale.
import { scaleLog, utcDay, utcMonth } from 'd3'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { extrasFrom } from '@/viz/kits/days-15-21/sources'
import { MONTHS_PER_YEAR } from '@/viz/kits/days-15-21/time'
import { OmittedNote, VizTable } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { layout } from '@/lib/viz/layout'
import { describe } from './describe'
import Day16Interactive, { type StationView } from './Interactive'
import { meta } from './meta'
import { select, type Day16Selection } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

function waits(sel: Day16Selection): Array<{ px: number; text: string | null }> {
  const spans = sel.stations.map((st, i) => (i === 0 ? 0 : Math.max(0, utcDay.count(sel.stations[i - 1].when.date, st.when.date))))
  const longest = Math.max(1, ...spans)
  const px = scaleLog().domain([1, longest]).range([layout.gap, layout.tap * 2 + layout.gap]).clamp(true)
  return sel.stations.map((st, i) => {
    const days = spans[i]
    const months = i === 0 ? 0 : utcMonth.count(sel.stations[i - 1].when.date, st.when.date)
    const years = Math.round(months / MONTHS_PER_YEAR)
    const text = years >= 1 ? `about ${years === 1 ? 'a year' : `${years} years`} later` : null
    return { px: days > 0 ? px(days) : layout.gap, text }
  })
}

export default function Day16Viz({ day }: DayVizProps) {
  const sel = select(day)
  const w = waits(sel)
  const stations: StationView[] = sel.stations.map((st, i) => ({
    id: st.id, title: st.title, holder: st.holder, whenText: st.whenText, words: st.words, level: st.level,
    sources: st.sources, fromDay: st.fromDay, era: st.era, gapPx: w[i].px, gapText: w[i].text,
  }))
  return (
    <div className={k.viz} data-viz="day-16">
      <Day16Interactive stations={stations} pool={sel.pool} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { paragraphs, rows } = describe(sel, waits(sel).map((x) => x.text))
  return (
    <div className={k.longDesc}>
      {paragraphs.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`The video's stops, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} whenLabel="When" />
      <OmittedNote count={sel.omitted} why="it describes a witness's body, which this project does not chart (care rule 2)." />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
