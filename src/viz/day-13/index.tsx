// Day 13: Asked, Settled, Received: Money in the Record on One Scale. A log-scale dot line with
// Mia's mediation as a step down and other amounts as context. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactsTable } from '../day-08/kit/ui'
import { Day13Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'

export { meta }

export default function Day13Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day13Interactive view={{ mia: m.mia, context: m.context, book: m.book }} />
      <ExtraSources book={m.book} day={day} />
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
