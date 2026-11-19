// Day 4: Her Old Messages, Read Two Ways. A message-thread timeline with two annotation lanes.
import { redactThirdParties } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, toExtraSources } from '@/viz/kits/days-01-07/refs'
import { Thread } from './Interactive'
import { meta } from './meta'
import { select } from './select'
import s from './day04.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day04Viz({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  return (
    <div className={s.viz}>
      <Thread messages={sel.messages} labels={labels} />
      <ul className={s.facts} aria-label="Also from this cross-examination">
        {sel.agreed ? (
          <li>
            <span className={s.factValue}>{sel.agreed.value}</span> years together, agreed on cross-examination <Sourced level={sel.agreed.level} refs={sel.agreed.refs} labels={labels} />
          </li>
        ) : null}
        {sel.occasions ? (
          <li>
            <span className={s.factValue}>{sel.occasions.value.replace('~', 'about ')}</span> occasions she said she saw Combs with other women <Sourced level={sel.occasions.level} refs={sel.occasions.refs} labels={labels} />
          </li>
        ) : null}
        {sel.deadline ? (
          <li>
            <span className={s.factValue}>{sel.deadline.value}</span> the judge&rsquo;s deadline for the cross-examination to end, because of her pregnancy <Sourced level={sel.deadline.level} refs={sel.deadline.refs} labels={labels} />
          </li>
        ) : null}
      </ul>
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const yearText = (m: (typeof sel.messages)[number]) => (m.from === m.to ? String(m.from) : `${m.from} to ${m.to}`)
  const msgRows: TableRow[] = sel.messages.flatMap((m, i) => [
    { key: `${m.id}-d`, group: i === 0 ? 'The messages, with both readings' : undefined, cells: [yearText(m), m.paraphrase, `Defense: ${m.defense.text}`], level: m.defense.level, refs: m.defense.refs },
    { key: `${m.id}-v`, cells: [yearText(m), '', `Ventura: ${m.ventura?.text ?? 'her answer is not in the record.'}`], level: m.ventura?.level ?? 'low', refs: m.ventura?.refs ?? [] },
    ...m.again.map((a) => ({ key: `${m.id}-a${a.day}`, cells: [`Day ${a.day}`, '', a.text], level: a.level, refs: a.refs })),
  ])
  const numberRows: TableRow[] = day.numbers.map((n, i) => ({
    key: `n${i}`,
    group: i === 0 ? `Every figure reported on Day ${day.day}` : undefined,
    cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, n.unit, redactThirdParties(n.what)],
    level: n.confidence,
    refs: numberRefs(day, n),
  }))
  const first = sel.messages[0]
  const last = sel.messages[sel.messages.length - 1]
  return (
    <>
      <p>
        On cross-examination the defense showed Cassie Ventura messages she had written years earlier. The picture places {sel.messages.length} of them on a time
        line{first && last ? ` from ${first.from} to ${last.to}` : ''}, oldest first, each paraphrased. Beside each message are two readings: what the defense put to
        her, and what she answered. Where her answer to a message is not in the record, the picture says so instead of guessing.
      </p>
      <p>The thread is short on purpose: only these messages can be dated from the reporting. Messages are paraphrased; this page reproduces no sexual content.</p>
      <RowsTable caption={`Day ${day.day}: the messages and both readings, and every figure reported`} columns={['Year or value', 'Message', 'Reading']} rows={[...msgRows, ...numberRows]} labels={labels} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
