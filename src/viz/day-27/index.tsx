// Day 27: Crossing State Lines: The Trips Behind the Transportation Charges. An arc map in SVG with
// d3-geo: lifted great-circle arcs only where records name both ends of a trip; rings at arrival cities otherwise.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { AdditionsList, crossDayExtras, dayLink, RowList, XRef } from '@/viz/kits/days-22-28/kit'
import kitStyles from '@/viz/kits/days-22-28/kit.module.css'
import { ArcMapInteractive, type TripMeta } from './Interactive'
import { mapGeometry } from './mapgeo'
import { meta } from './meta'
import { selectDay27, type Day27Selection, type Trip } from './select'
import styles from './day27.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

function periodWords(sel: Day27Selection, t: Trip): string {
  const p = sel.periods.find((x) => x.count === t.count)
  return p ? `Dated within the ${p.person} relationship period named in Count ${p.count} (${p.from} to ${p.to})` : 'Not dated within either count’s relationship period'
}

function shortLabel(sel: Day27Selection, t: Trip): string {
  const name = (id: string) => sel.places.find((p) => p.id === id)?.name.split(',')[0] ?? id
  if (t.from && t.to.length) return `${name(t.from)} to ${t.to.map(name).join(', ')}${t.stay.length ? `, stay in ${t.stay.map(name).join(', ')}` : ''}`
  if (t.to.length) return `Arrivals: ${t.to.map(name).join(', ')} (start not reported)`
  return 'Route not reported'
}

function Detail({ sel, t }: { sel: Day27Selection; t: Trip }) {
  return (
    <div>
      <p>{t.text}.</p>
      <p>
        {periodWords(sel, t)}. Reported on <a href={dayLink(t.day)}>Day {t.day}</a>. <XRef ids={t.sources.map((s) => s.id)} />{' '}
        <ConfidenceMark level={t.confidence} />
      </p>
    </div>
  )
}

export default function Day27Viz({ day }: DayVizProps) {
  const sel = selectDay27(day)
  const wide = mapGeometry(sel, layout.chartWidth, layout.chartWidth / 2)
  const narrow = mapGeometry(sel, layout.phoneWidth, layout.phoneWidth * (2 / (2 + 1)))
  const [a, b] = sel.periods
  const trips: TripMeta[] = sel.trips.map((t) => ({
    id: t.id,
    label: shortLabel(sel, t),
    date: t.date,
    style: t.count === a?.count ? 'count-a' : t.count === b?.count ? 'count-b' : 'none',
  }))
  const details = Object.fromEntries(sel.trips.map((t) => [t.id, <Detail key={t.id} sel={sel} t={t} />]))
  return (
    <div className={styles.viz}>
      <ul className={styles.legend} aria-label="Key">
        {a ? <li><span className={`${styles.key} ${styles.k_count_a}`} aria-hidden="true" /> solid: dated in the period of Count {a.count} ({a.person}, {a.from} to {a.to})</li> : null}
        {b ? <li><span className={`${styles.key} ${styles.k_count_b}`} aria-hidden="true" /> dashed red: dated in the period of Count {b.count} ({b.person}, {b.from} to {b.to})</li> : null}
        <li><span className={styles.keyRing} aria-hidden="true" /> ring: arrival city only; where the trip began was not reported</li>
      </ul>
      <ArcMapInteractive wide={wide} narrow={narrow} trips={trips} details={details} />
      <p className={styles.note}>
        The reporting does not say which count each trip was offered for, so trips are grouped by date against the two relationships the
        transportation counts name. The people paid for sex who travelled are never named.
      </p>
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay27(day)
  const withArc = sel.trips.filter((t) => t.from && t.to.length)
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        {sel.trips.length} trips or sets of trips appear in the reporting. Only {withArc.length} names both a starting city and an arrival
        city, so only {withArc.length === 1 ? 'that one is' : 'those are'} drawn as an arc; for the rest only the arrival cities were
        reported, and they are drawn as rings. Trips are grouped by date: Count{' '}
        {sel.periods.map((p) => `${p.count} covers ${p.person} (${p.from} to ${p.to})`).join('; Count ')}.
      </p>
      <RowList
        caption="Trips in the reporting, in date order"
        columns={['Date', 'Route', 'What was reported', 'Count period', 'How sure']}
        rows={sel.trips.map((t) => ({
          key: t.id,
          sourceIds: t.sources.map((s) => s.id).join(' '),
          cells: [t.date, shortLabel(sel, t), `${t.text} (Day ${t.day})`, t.count ? `Count ${t.count}` : 'neither', <ConfidenceMark key="c" level={t.confidence} />],
        }))}
      />
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
      <section className={kitStyles.xsources} aria-label="Where the cities sit on the map">
        <AdditionsList items={sel.placeSources} heading="Where the cities sit on the map (reference points for drawing, not trial facts)" />
      </section>
    </>
  )
}

/** Other days' sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return crossDayExtras(selectDay27(day).trips.flatMap((t) => t.sources.map((s) => s.id)), day)
}
