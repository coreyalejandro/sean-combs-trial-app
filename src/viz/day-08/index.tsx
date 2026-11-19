// Day 8: Why Many Survivors Wait to Tell. A dumbbell chart of the waits in this trial's own record,
// framed by the four general patterns Dr. Dawn Hughes described. Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, FactMeta, FactsTable, kit } from './kit/ui'
import { money } from './kit/geom'
import { Day08Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import css from './day08.module.css'

export { meta }

export default function Day08Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  const headId = `concepts-day-${day.day}`
  return (
    <div>
      {m.concepts.length > 0 && (
        <section className={css.concepts} aria-labelledby={headId}>
          <h3 id={headId} className={css.conceptsHead}>What Dr. Dawn Hughes described, in general terms. She evaluated no one in this case.</h3>
          <ul className={css.conceptList}>
            {m.concepts.map((c) => (
              <li key={c.id}>
                <strong>{c.label}</strong>
                <span>{c.plain}</span>
              </li>
            ))}
          </ul>
          {m.fees.length > 0 && (
            <p className={css.fee}>
              Her pay as reported:{' '}
              {m.fees.map((f, i) => (
                <span key={f.key}>
                  {i > 0 ? ' and ' : ''}
                  <span className="num">{typeof f.value === 'number' ? money(f.value, f.unit) : f.value}</span> <FactMeta fact={f} book={m.book} />
                </span>
              ))}
              {m.feeNote ? <>. {m.feeNote}</> : null}
            </p>
          )}
        </section>
      )}
      <Day08Interactive view={{ rows: m.rows, years: m.years, book: m.book }} />
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
      <FactsTable caption={`Dates, waits and figures in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
      <p className={kit.note}>Waits are calculated from the years shown, counted in whole years. A missing date is shown as not stated in coverage, never estimated.</p>
    </>
  )
}
