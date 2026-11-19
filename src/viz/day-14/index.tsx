// Day 14: What Mia Posted, and What She Said Was Happening. A mirrored two-track timeline.
// Owned by Builder 2.
import { getDay } from '@/lib/data'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { bookExtras, FactMeta, FactsTable } from '@/viz/kits/days-08-14/ui'
import { valueText } from '@/viz/kits/days-08-14/geom'
import { Day14Interactive } from './Interactive'
import { describe } from './describe'
import { meta } from './meta'
import { select } from './select'
import css from './day14.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day14Viz({ day }: DayVizProps) {
  const m = select(day, getDay)
  return (
    <div>
      <Day14Interactive view={{ publicItems: m.publicItems, account: m.account, explanations: m.explanations, repetitions: m.repetitions, years: m.years, book: m.book }} />
      {(m.meetings || m.laterJob || m.court.length > 0) && (
        <aside className={css.aside} aria-label="Also from her cross-examination">
          <h3>Also from her cross-examination</h3>
          <ul>
            {m.meetings ? <li>{m.meetings.text}: <span className="num">{valueText(m.meetings.value, m.meetings.unit)}</span> <FactMeta fact={m.meetings} book={m.book} /></li> : null}
            {m.laterJob ? <li>{m.laterJob.fact.text}. {m.laterJob.conflict} <FactMeta fact={m.laterJob.fact} book={m.book} /></li> : null}
            {m.court.map((f) => <li key={f.key}>{f.text} <FactMeta fact={f} book={m.book} /></li>)}
          </ul>
        </aside>
      )}
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const m = select(day, getDay)
  const d = describe(m)
  return (
    <>
      {d.paragraphs.map((p, i) => <p key={i}>{p}</p>)}
      <FactsTable caption={`Posts, texts and her account in the Day ${day.day} picture`} rows={d.rows} day={day} book={m.book} used={m.used} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return bookExtras(select(day, getDay).book)
}
