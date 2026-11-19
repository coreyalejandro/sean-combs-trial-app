// Day 3: What Backs Each Part of Her Account. An evidence matrix that fills over the trial.
import { redactThirdParties } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { RefMarks, RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, toExtraSources, uniqueRefs } from '@/viz/kits/days-01-07/refs'
import { Matrix } from './Interactive'
import { meta } from './meta'
import { KINDS, select } from './select'
import s from './day03.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day03Viz({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  return (
    <div className={s.viz}>
      <Matrix rows={sel.rows} kinds={KINDS} pieces={sel.pieces.map((p) => ({ ...p, source: '' }))} firstDay={sel.firstDay} lastDay={sel.lastDay} filledByDay={sel.filledByDay} labels={labels} />
      <p className={s.aside}>
        <strong>Column key:</strong> {KINDS.map((k) => `${k.short} = ${k.label.toLowerCase()}`).join('; ')}. The event dates are as reported on
        Day {day.day} <RefMarks refs={uniqueRefs(sel.rows.flatMap((r) => r.refs))} labels={labels} />.
      </p>
      {sel.views ? (
        <p className={s.aside}>
          By the end of Day {day.day} the jury had watched the hotel video <span className="num">{sel.views.value}</span> times. <Sourced level={sel.views.level} refs={sel.views.refs} labels={labels} />
        </p>
      ) : null}
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const kindLabel = (id: string) => KINDS.find((k) => k.id === id)?.label ?? id
  const filled = sel.filledByDay[sel.filledByDay.length - 1] ?? 0
  const total = sel.rows.length * KINDS.length
  const pieceRows: TableRow[] = sel.rows.flatMap((r) =>
    sel.pieces
      .filter((p) => p.row === r.id)
      .map((p, i) => ({
        key: p.id,
        group: i === 0 ? `${r.label}: ${r.what}` : undefined,
        cells: [`Day ${p.day}`, kindLabel(p.kind), p.label],
        level: p.level,
        refs: p.refs,
        whole: p.whole,
      })),
  )
  const numberRows: TableRow[] = day.numbers.map((n, i) => ({
    key: `n${i}`,
    group: i === 0 ? `Every figure reported on Day ${day.day}` : undefined,
    cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, n.unit, redactThirdParties(n.what)],
    level: n.confidence,
    refs: numberRefs(day, n),
  }))
  const emptyKinds = sel.rows.map((r) => ({ r, missing: KINDS.filter((k) => !sel.pieces.some((p) => p.row === r.id && p.kind === k.id)).map((k) => k.label.toLowerCase()) }))
  return (
    <>
      <p>
        A grid of {sel.rows.length} events from Cassie Ventura&rsquo;s testimony ({sel.rows.map((r) => r.label).join('; ')}) against {KINDS.length} kinds of
        evidence ({KINDS.map((k) => k.label.toLowerCase()).join(', ')}). A square fills on the trial day that kind of evidence first reached the jury for that
        event; small dots count later pieces of the same kind. By Day {sel.lastDay}, {filled} of {total} squares are filled (calculated from the pieces listed below).
      </p>
      <p>
        A filled square means the jury saw that kind of evidence, not that it believed it. Still empty at the end of the trial:{' '}
        {emptyKinds.map(({ r, missing }) => `${r.label}, ${missing.length > 0 ? missing.join(', ') : 'none'}`).join('; ')}. A piece marked &ldquo;in that day&rsquo;s coverage&rdquo; was
        reported in that day&rsquo;s news reports without one article being tied to it, so it cites that day&rsquo;s whole list.
      </p>
      <RowsTable caption={`Day ${day.day}: each piece of evidence by event, and every figure reported`} columns={['Day or value', 'Kind', 'What it was']} rows={[...pieceRows, ...numberRows]} labels={labels} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
