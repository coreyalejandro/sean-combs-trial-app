// Day 10: December 2011, Told by Six Witnesses. A corroboration strip of who described which event.
// Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactMeta, FactsTable } from '../day-08/kit/ui'
import { valueText } from '../day-08/kit/geom'
import { Day10Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import css from './day10.module.css'

export { meta }

export default function Day10Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  const clark = m.witnesses.find((w) => w.id === 'clark')
  return (
    <div>
      <Day10Interactive view={{ events: m.events, witnesses: m.witnesses, window: m.window, book: m.book }} />
      {m.clark.length > 0 && (
        <aside className={css.clark} aria-label="Capricorn Clark's own account">
          <h3>{clark?.name ?? 'Capricorn Clark'}, the only witness on Day {day.day}, also testified</h3>
          <ul>
            {m.clark.map((f) => (
              <li key={f.key}><span className="num">{valueText(f.value, f.unit)}</span>: {f.text} <FactMeta fact={f} book={m.book} /></li>
            ))}
          </ul>
        </aside>
      )}
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
      <FactsTable caption={`Events and accounts in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}
