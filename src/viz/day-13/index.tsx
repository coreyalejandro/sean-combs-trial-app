// Day 13: Asked, Settled, Received: Money in the Record on One Scale. A log-scale dot line with
// Mia's mediation as a step down and other amounts as context. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { bookExtras, FactMeta, FactsTable, kit } from '@/viz/kits/days-08-14/ui'
import { Day13Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day13Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day13Interactive view={{ mia: m.mia, context: m.context, book: m.book }} />
      <p className={kit.note}>
        A demand is a lawyer&rsquo;s opening figure in a negotiation, not a measure of harm or of what anyone is owed.
        {m.purpose ? (
          <>
            {' '}Global News reports that Mia&rsquo;s settlement reimbursed promised bonuses that were never paid and unpaid overtime, and that she said
            she never told her lawyers about the sexual abuse. <FactMeta fact={m.purpose} book={m.book} />
          </>
        ) : null}{' '}
        The judge struck the defense&rsquo;s &ldquo;money grab&rdquo; phrase from the record (Day 14).
      </p>
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const m = select(day, getDay)
  const d = describe(m)
  return (
    <>
      {d.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <FactsTable caption={`Amounts in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return bookExtras(select(day, getDay).book)
}
