// Day 11: The Car Fire Investigation: Where the Trail Stopped. A chain of evidence with broken links
// where testimony says a step did not happen. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactsTable } from '../day-08/kit/ui'
import { Day11Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'

export { meta }

export default function Day11Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day11Interactive view={{ steps: m.steps, court: m.court, stoppedAfter: m.stoppedAfter, book: m.book }} />
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
      <FactsTable caption={`Investigation steps and court rulings in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}
