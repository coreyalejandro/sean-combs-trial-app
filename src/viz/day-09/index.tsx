// Day 9: One Man, Many Names: The Hotel Aliases. A two-sided network of aliases and the places
// their records turned up. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { bookExtras, FactsTable, kit } from '@/viz/kits/days-08-14/ui'
import { Day09Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day09Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day09Interactive view={{ aliases: m.aliases, places: m.places, links: m.links, book: m.book }} />
      {m.aliases.some((a) => /Pines/.test(a.name)) ? (
        <p className={kit.note}>
          &ldquo;Phillip Pines&rdquo; is also the name of a real person who worked for Combs. It is listed here only as it appeared in hotel records.
        </p>
      ) : null}
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

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return bookExtras(select(day, getDay).book)
}
