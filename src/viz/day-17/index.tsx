// Day 17: Two Places at Once? A Hotel Bill Tests a Date (Builder 3).
// A space-and-time contradiction diff: a U.S. map with the two cities, above one shared date strip,
// with the witness's answer and the judge's ruling as their own lanes.
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { formatInt } from '@/lib/viz/format'
import { layout } from '@/lib/viz/layout'
import { extrasFrom, lowest, type Level } from '@/viz/kits/days-15-21/sources'
import { VizTable, type TableRow } from '@/viz/kits/days-15-21/VizTable'
import k from '@/viz/kits/days-15-21/kit.module.css'
import { formatDate } from '@/lib/data'
import { mapGeo, stripGeo } from './geometry'
import Day17Interactive, { type Day17View } from './Interactive'
import { meta } from './meta'
import { select, stripDays, type Day17Selection } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

const WIDE_MAP = { w: layout.breakpoint / 2, h: layout.chartWidth / (2 * 2) }
const NARROW_W = layout.phoneWidth - layout.gap * 2
const NARROW_MAP = { w: NARROW_W, h: (NARROW_W * layout.margin.top) / layout.margin.bottom }
const WIDE_STRIP = layout.chartWidth - layout.breakpoint / 2

function clashDay(sel: Day17Selection, days: string[]): string | null {
  return days.find((d) => {
    const lanes = new Set(sel.marks.filter((m) => m.start <= d && d <= m.end && m.layer === 'records').map((m) => m.lane))
    return lanes.has('ny') && lanes.has('la')
  }) ?? null
}

function buildView(sel: Day17Selection): Day17View {
  const days = stripDays(sel.marks)
  const cityLevel: Level = sel.cities.reduce<Level>((acc, c) => lowest(acc, c.level), 'high')
  return {
    marks: sel.marks,
    map: { wide: mapGeo(sel.cities, WIDE_MAP.w, WIDE_MAP.h), narrow: mapGeo(sel.cities, NARROW_MAP.w, NARROW_MAP.h) },
    strip: { wide: stripGeo(days, sel.marks, WIDE_STRIP), narrow: stripGeo(days, sel.marks, NARROW_W) },
    miles: sel.miles,
    distanceSources: [...sel.cities.flatMap((c) => c.sources), ...sel.distanceSources],
    cityLevel,
    witness: sel.witness,
    ruling: sel.ruling,
    wordsOnly: sel.wordsOnly,
    pool: sel.pool,
    clashDay: clashDay(sel, days),
  }
}

export default function Day17Viz({ day }: DayVizProps) {
  const sel = select(day)
  return (
    <div className={k.viz} data-viz="day-17">
      <Day17Interactive view={buildView(sel)} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const days = stripDays(sel.marks)
  const clash = clashDay(sel, days)
  const when = (a: string, b: string) => (a === b ? formatDate(a) : `${formatDate(a)} to ${formatDate(b)}`)
  const p: string[] = [
    `The picture has a map of the United States with Los Angeles and New York marked${sel.miles ? `, about ${formatInt(sel.miles)} miles apart in a straight line (calculated from the two cities' coordinates)` : ''}, above a date strip from ${days.length ? when(days[0], days[days.length - 1]) : 'the dates in the record'} with one row per place.`,
    ...sel.marks.map((m) => `${m.label}: ${when(m.start, m.end)} (row: ${m.lane === 'ny' ? 'New York' : m.lane === 'la' ? 'Los Angeles' : 'no place stated'}). ${m.words.join(' ')}`),
  ]
  if (clash) p.push(`On ${formatDate(clash)}, the records place marks in both cities: that is the contradiction the defense raised.`)
  if (sel.witness) p.push(`What the witness said: ${sel.witness.words.join('; ')}.`)
  p.push(...sel.wordsOnly)
  if (sel.ruling) p.push(`What the judge ruled on ${formatDate(sel.ruling.date)} (Day ${sel.ruling.day}): ${sel.ruling.words.join(' ')}`)
  const rows: TableRow[] = [
    ...sel.marks.map((m) => ({ key: m.id, what: m.label, value: m.lane === 'ny' ? 'New York' : m.lane === 'la' ? 'Los Angeles' : 'No place stated', when: when(m.start, m.end), level: m.level, sources: m.sources })),
    ...(sel.miles ? [{ key: 'miles', what: 'Distance from Los Angeles to New York (calculated: great-circle distance)', value: `about ${formatInt(sel.miles)} miles`, level: sel.cities.reduce<Level>((a, c) => lowest(a, c.level), 'high'), sources: [...sel.cities.flatMap((c) => c.sources), ...sel.distanceSources] }] : []),
    ...(sel.ruling ? [{ key: 'ruling', what: 'Second mistrial motion over this date', value: 'Denied', when: formatDate(sel.ruling.date), level: sel.ruling.level, sources: sel.ruling.sources }] : []),
  ]
  return (
    <div className={k.longDesc}>
      {p.map((t) => <p key={t}>{t}</p>)}
      <VizTable caption={`The disputed date, and every other figure from Day ${day.day}`} rows={rows} pool={sel.pool} other={sel.other} dayNumber={day.day} />
    </div>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return extrasFrom(sel.extraSources, sel.pool)
}
