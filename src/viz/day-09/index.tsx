// Day 9: One Man, Many Names: The Hotel Aliases. A two-sided network of aliases and the places
// their records turned up. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactsTable } from '../day-08/kit/ui'
import { Day09Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'

export { meta }

export default function Day09Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day09Interactive view={{ aliases: m.aliases, places: m.places, links: m.links, book: m.book }} />
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
      <FactsTable caption={`Names, places and records in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}
