// Day 22 text version: the long description and the session table, from the same selection as the picture.
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { formatDate, type TrialDay } from '@/lib/data'
import { formatClock, formatDuration, minutesBetween } from './clock'
import { Calc, RowList, XRef } from './kit'
import { meta } from './meta'
import { EXAM_LABEL, type Day22Selection } from './select'

export function Day22Text({ sel, day }: { sel: Day22Selection; day: TrialDay }) {
  const first = sel.rows[0]
  const last = sel.rows[sel.rows.length - 1]
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        Jane testified on {sel.rows.length} court days, from {first ? formatDate(first.date, { weekday: true }) : ''} to{' '}
        {last ? formatDate(last.date, { weekday: true }) : ''}. The prosecution questioned her first (direct examination), then the
        defense (cross-examination); on the last day the prosecution asked more questions (redirect) and the defense asked a last
        round (re-cross). Clock times come from news live blogs, mostly one outlet, so each is marked with how sure it is. Across the{' '}
        {sel.rowsWithTimes} days with reported times she was questioned for about {formatDuration(sel.totalMinutes)} (calculated: the
        sum of each day&apos;s end time minus start time, minus reported lunch breaks; spans that include an unreported lunch are not
        reduced). On the last day the court first met in a closed conference (its reported length is in the table below); the times of the
        questioning that followed were not reported.
      </p>
      {sel.daysDiscrepancy ? (
        <p>
          <ConfidenceMark level="conflict" /> {sel.daysDiscrepancy}
        </p>
      ) : null}
      {sel.finalAnswer ? <p>Her last answer, as reported: &ldquo;{sel.finalAnswer.text}&rdquo;</p> : null}
      <RowList
        caption="Jane's sessions on the stand, by court day"
        columns={['Day', 'Who was asking', 'Clock time', 'Length', 'How sure']}
        rows={sel.rows.flatMap((r) =>
          r.segments.map((s, j) => {
            const ids = [s.start, s.end].flatMap((f) => (f ? f.sources.map((x) => x.id) : r.sources.map((x) => x.id)))
            const conf = s.start && s.end ? (s.start.confidence === 'low' || s.end.confidence === 'low' ? 'low' : s.start.confidence) : 'low'
            return {
              key: `${r.n}-${j}`,
              sourceIds: [...new Set(ids)].join(' '),
              cells: [
                `Day ${r.n}, ${formatDate(r.date, { weekday: true, year: false })}`,
                `${EXAM_LABEL[s.exam]}${s.by ? `, ${s.by}` : ''}`,
                <span key="t" className="num">
                  <XRef ids={[...new Set(ids)]}>
                    {s.start && s.end ? `${s.approximate ? 'about ' : ''}${formatClock(s.start.date)} to ${formatClock(s.end.date)}` : 'not reported'}
                  </XRef>
                  {r.lunch && s.exam !== 'closed' ? ` (lunch ${formatClock(r.lunch.start.date)} to ${formatClock(r.lunch.end.date)})` : ''}
                  {r.lunchReturn ? ` (back from lunch ${formatClock(r.lunchReturn.date)})` : ''}
                </span>,
                s.start && s.end ? (
                  <span key="l">{formatDuration(minutesBetween(s.start.date, s.end.date))} <Calc formula="end time minus start time" /></span>
                ) : (
                  'not reported'
                ),
                <ConfidenceMark key="c" level={conf} />,
              ],
            }
          }),
        )}
      />
      <NumbersTable numbers={sel.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
    </>
  )
}
