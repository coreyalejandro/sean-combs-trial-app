// Day 12: Workdays Without an End. 24-hour clocks as small multiples, one per former staff member.
// Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { bookExtras, FactsTable } from '@/viz/kits/days-08-14/ui'
import { Day12Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day12Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day12Interactive view={{ people: m.people, standardDay: m.standardDay, standardWeek: m.standardWeek, book: m.book }} />
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

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return bookExtras(select(day, getDay).book)
}
