// Day 22: Six Days on the Stand: Jane's Testimony, Hour by Hour.
// A testimony Gantt: one row per court day Jane testified, bars along clock time, shaded by who was asking.
// Server component: the SVG is computed here from the records and is in the static HTML.
import { Cite } from '@/components/shell/SourceRef'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { formatDate } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { formatClock, formatDuration } from './clock'
import { ganttGeometry } from './geometry'
import { GanttInteractive } from './Interactive'
import { Calc, crossDayExtras, XRef } from '@/viz/kits/days-22-28/kit'
import { meta } from './meta'
import { EXAM_LABEL, selectDay22, type Day22Selection, type TimeFact } from './select'
import { Day22Text } from './describe'
import styles from './day22.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

function Time({ f }: { f: TimeFact }) {
  return (
    <XRef ids={f.sources.map((s) => s.id)}>
      <span className="num">{formatClock(f.date)}</span> <ConfidenceMark level={f.confidence} />
    </XRef>
  )
}

export function allSourceIds(sel: Day22Selection): string[] {
  const ids = sel.rows.flatMap((r) => [
    ...r.sources.map((s) => s.id),
    ...r.segments.flatMap((s) => [s.start, s.end].flatMap((f) => (f ? f.sources.map((x) => x.id) : []))),
    ...(r.lunch ? [...r.lunch.start.sources, ...r.lunch.end.sources].map((s) => s.id) : []),
    ...(r.lunchReturn ? r.lunchReturn.sources.map((s) => s.id) : []),
  ])
  return [...ids, ...(sel.finalAnswer ? sel.finalAnswer.sources.map((s) => s.id) : [])]
}

function Legend({ sel }: { sel: Day22Selection }) {
  const swatch = (cls: string, label: string) => (
    <li><span className={`${styles.swatch} ${cls}`} aria-hidden="true" /> {label}</li>
  )
  return (
    <div className={styles.legendWrap}>
      <ul className={styles.legend} aria-label="Key">
        {swatch(styles.sDirect, EXAM_LABEL.direct)}
        {swatch(styles.sCross, EXAM_LABEL.cross)}
        {swatch(styles.sRedirect, EXAM_LABEL.redirect)}
        {swatch(styles.sRecross, EXAM_LABEL['re-cross'])}
        {swatch(styles.sClosed, EXAM_LABEL.closed)}
        {swatch(styles.sOpen, 'Dashed outline: times approximate or not reported')}
      </ul>
      {sel.daysReported ? (
        <p className={styles.count}>
          <strong>Days on the stand:</strong>{' '}
          <Cite num={sel.daysReported} pool={sel.sources} showMark={false} /> by the court-day record, or{' '}
          <span className="num">{sel.daysCounted}</span> <Calc formula="court days with Jane listed as a witness" /> counting her first
          afternoon. <ConfidenceMark level="conflict" />
        </p>
      ) : null}
    </div>
  )
}

export default function Day22Viz({ day }: DayVizProps) {
  const sel = selectDay22(day)
  const wide = ganttGeometry(sel, layout.chartWidth)
  const narrow = ganttGeometry(sel, layout.phoneWidth)
  const details = sel.rows.flatMap((r) =>
    r.segments
      .map((s, j) => ({ s, j }))
      .filter(({ j }) => wide.bars.some((b) => b.key === `${r.n}-${j}`))
      .map(({ s, j }) => {
        const topics = s.topics ?? r.topics
        return (
          <div key={`${r.n}-${j}`} className={styles.detailBody}>
            <h3 className={styles.detailHead}>
              Day {r.n}, {formatDate(r.date, { weekday: true, year: false })}: {EXAM_LABEL[s.exam]}
            </h3>
            {s.by ? <p>Asked by {s.by}.</p> : null}
            {s.start && s.end ? (
              <p>
                {s.approximate ? 'About ' : 'From '}<Time f={s.start} /> to <Time f={s.end} />
                {s.exam === 'closed' ? ' (start placed at the hour jurors were told to arrive; length as reported)' : ''}.
              </p>
            ) : (
              <p>The record gives no clock times for this part of the day; it lists the order of questioning only.</p>
            )}
            {r.lunch && s.exam !== 'closed' ? (
              <p>Lunch: <Time f={r.lunch.start} /> to <Time f={r.lunch.end} />.</p>
            ) : null}
            {r.lunchReturn ? <p>Jurors were due back from lunch at <Time f={r.lunchReturn} />; when lunch began was not reported.</p> : null}
            {r.minutes !== null && s.exam !== 'closed' ? (
              <p>
                Time questioned this day: about <span className="num">{formatDuration(r.minutes)}</span> <Calc formula={r.minutesFormula} />.
              </p>
            ) : null}
            {topics.length > 0 ? (
              <>
                <p className={styles.topicsHead}>Topics the record lists{s.topics ? ' for this part of the day' : ' for this day'}:</p>
                <ul className={styles.topics}>
                  {topics.map((t) => (
                    <li key={t.label}>{t.label}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        )
      }),
  )
  return (
    <div className={styles.viz}>
      <GanttInteractive wide={wide} narrow={narrow} details={details} legend={<Legend sel={sel} />} />
      {sel.finalAnswer ? (
        <blockquote className={styles.quote}>
          <p>&ldquo;{sel.finalAnswer.text}&rdquo;</p>
          <footer>
            Jane&apos;s last answer on the stand, Day {sel.finalAnswer.day} (the red dot).{' '}
            <XRef ids={sel.finalAnswer.sources.map((s) => s.id)} />
          </footer>
        </blockquote>
      ) : null}
      <p className={styles.total}>
        Across the {sel.rowsWithTimes} days with reported times, Jane was questioned for about{' '}
        <span className="num" data-source-ids={[...new Set(sel.rows.flatMap((r) => r.sources.map((s) => s.id)))].join(' ')}>
          {formatDuration(sel.totalMinutes)}
        </span>{' '}
        <Calc formula="sum of each day's end time minus start time, minus reported lunch breaks" />, approximate; the last day&apos;s
        questioning had no reported times and is not counted.
      </p>
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  return <Day22Text sel={selectDay22(day)} day={day} />
}

/** Other days' sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return crossDayExtras(allSourceIds(selectDay22(day)), day)
}
