// Day 24: The Jury Box, Seat by Seat, Across the Trial. A seat-map tracker with a scrubber.
// The server builds every frame from the records; the client only chooses which frame to show.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { Cite } from '@/components/shell/SourceRef'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { formatDate, resolveSources, type Source } from '@/lib/data'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { crossDayExtras, dayLink, XRef } from '@/viz/kits/days-22-28/kit'
import { JuryTracker, type SeatFrame } from './Interactive'
import { meta } from './meta'
import { selectDay24, stateAt, type Day24Selection, type JuryEvent } from './select'
import styles from './day24.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

function EventBody({ e }: { e: JuryEvent }) {
  return (
    <div className={styles.eventBody}>
      <h3 className={styles.eventHead}>{e.headline}</h3>
      <p>
        {e.record} <XRef ids={e.sources.map((s) => s.id)} /> <ConfidenceMark level={e.confidence} />
      </p>
      {e.numbers.length > 0 ? (
        <ul className={styles.nums}>
          {e.numbers.map((n) => (
            <li key={n.what}>
              <Cite num={n} pool={e.pool} numbered={false} /> {n.what}
            </li>
          ))}
        </ul>
      ) : null}
      {e.day ? <p className={styles.dayLink}><a href={dayLink(e.day)}>Day {e.day}</a></p> : null}
    </div>
  )
}

function frames(sel: Day24Selection): SeatFrame[] {
  return sel.events.map((e, i) => {
    const s = stateAt(sel, i)
    return { seat: s.seat, alternates: s.alternates, unnamed: s.unnamed, label: e.headline, date: formatDate(e.date, { year: false }) }
  })
}

function seatNotes(sel: Day24Selection): string[] {
  return sel.events.map((_, i) => {
    const s = stateAt(sel, i).seat
    if (s === 'replaced') return [sel.seatPeople.replacement ? `Now ${sel.seatPeople.replacement}.` : ''].join(' ')
    return ''
  })
}

export function allIds(sel: Day24Selection): string[] {
  const ids = (n: { source: string; outlets: string[] }, pool: Source[]) => resolveSources(n, pool).map((s) => s.id)
  return [
    ...sel.events.flatMap((e) => [...e.sources.map((s) => s.id), ...e.numbers.flatMap((n) => ids(n, e.pool))]),
    ...(sel.strikes ? [...ids(sel.strikes.a, sel.strikes.aDay.sources), ...ids(sel.strikes.b, sel.strikes.bDay.sources)] : []),
    ...(sel.raceClaim ? ids(sel.raceClaim.num, sel.raceClaim.day.sources) : []),
    ...sel.seatPeople.sources.map((s) => s.id),
  ]
}

function Facts({ sel, dayN }: { sel: Day24Selection; dayN: number }) {
  return (
    <div className={styles.facts}>
      {sel.men !== null && sel.women !== null ? (
        <p>
          Sworn in: <span className="num">{sel.jurors}</span> jurors (<span className="num">{sel.men}</span> men,{' '}
          <span className="num">{sel.women}</span> women) and <span className="num">{sel.alternatesStart}</span> alternates.{' '}
          {sel.events[0] ? <XRef ids={sel.events[0].sources.map((s) => s.id)} /> : null}
        </p>
      ) : null}
      {sel.strikes ? (
        <p>
          <ConfidenceMark level="conflict" /> Prosecution strikes during jury selection:{' '}
          <span className="num">{String(sel.strikes.a.what.match(/prosecution (?<n>\d+)/)?.groups?.n ?? '')}</span> on Day {sel.strikes.aDay.day}{' '}
          <XRef ids={resolveSources(sel.strikes.a, sel.strikes.aDay.sources).map((s) => s.id)} /> versus{' '}
          <Cite num={sel.strikes.b} pool={sel.strikes.bDay.sources} showMark={false} numbered={sel.strikes.bDay.day === dayN} /> on Day {sel.strikes.bDay.day} (each from one outlet).
        </p>
      ) : null}
      {sel.raceClaim ? (
        <p>
          The defense said prosecutors struck Black prospective jurors (<Cite num={sel.raceClaim.num} pool={sel.raceClaim.day.sources} numbered={sel.raceClaim.day.day === dayN} />); the
          judge accepted the prosecution&apos;s race-neutral reasons.
        </p>
      ) : null}
    </div>
  )
}

export default function Day24Viz({ day }: DayVizProps) {
  const sel = selectDay24(day)
  return (
    <div className={styles.viz}>
      <JuryTracker
        jurors={sel.jurors}
        alternatesStart={sel.alternatesStart}
        seat={sel.seat}
        frames={frames(sel)}
        seatNotes={seatNotes(sel)}
        items={sel.events.map((e) => <EventBody key={e.key} e={e} />)}
      />
      <Facts sel={sel} dayN={day.day} />
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay24(day)
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        The picture is a jury box of {sel.jurors} numbered seats and {sel.alternatesStart} alternate seats. Each step is a change that
        coverage reported, in date order; only Juror {sel.seat}&apos;s seat and the alternate count change, because no other seat
        changes were reported. Events about a juror whose seat was not reported are marked on the whole box.
      </p>
      <ol>
        {sel.events.map((e) => (
          <li key={e.key}>
            <strong>{formatDate(e.date)}: {e.headline}.</strong> {e.record} <XRef ids={e.sources.map((s) => s.id)} />{' '}
            <ConfidenceMark level={e.confidence} />
          </li>
        ))}
      </ol>
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}

/** Other days' sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return crossDayExtras(allIds(selectDay24(day)), day)
}
