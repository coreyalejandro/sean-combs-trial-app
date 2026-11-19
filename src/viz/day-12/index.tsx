// Day 12: Workdays Without an End. 24-hour clocks as small multiples, one per former staff member.
// Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactsTable } from '../day-08/kit/ui'
import { Day12Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'

export { meta }

export default function Day12Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day12Interactive view={{ people: m.people, standardDay: m.standardDay, standardWeek: m.standardWeek, book: m.book }} />
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
      <FactsTable caption={`Hours, sleep and pay in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}
