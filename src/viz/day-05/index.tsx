// Day 5: What Agents Found in the Hotel Room on the Day of the Arrest. An isotype pictograph.
import { redactThirdParties } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, toExtraSources } from '@/viz/kits/days-01-07/refs'
import { Isotype } from './Interactive'
import { meta } from './meta'
import { select } from './select'
import s from './day05.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

export default function Day05Viz({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  return (
    <div className={s.viz}>
      {sel.stand ? (
        <div className={s.stand}>
          <span className={s.crossLabel}>Ventura on the stand</span>
          <ol className={s.standDays} aria-label={`Cassie Ventura testified on ${sel.stand.days.map((d) => `Day ${d}`).join(', ')}`}>
            {sel.stand.allDays.map((d) => (
              <li key={d} className={sel.stand!.days.includes(d) ? s.standOn : s.standOff} aria-hidden="true">
                <span>Day {d}</span>
              </li>
            ))}
          </ol>
          <p className={s.standText}>
            <span className="num">{sel.stand.count}</span>
            {sel.stand.endedToday ? ', ending today' : ''}. <Sourced level={sel.stand.level} refs={sel.stand.refs} labels={labels} />
          </p>
        </div>
      ) : null}
      <h3 className={s.partHead}>After her testimony, a federal agent listed what was found when Combs was arrested</h3>
      {sel.arrest ? (
        <p className={s.dateline}>
          <span className={s.datelineDate}>{sel.arrest.date}</span>
          {sel.arrest.place ? <span className={s.datelinePlace}>{sel.arrest.place}</span> : null}
          <Sourced level={sel.arrest.level} refs={sel.arrest.refs} labels={labels} />
        </p>
      ) : null}
      <div className={s.layout}>
        <Isotype items={sel.items} agent={sel.agent} labels={labels} />
        <aside className={s.sideCol}>
          {sel.belongings ? (
            <div className={s.cross}>
              <span className={s.crossLabel}>On cross-examination</span>
              <p>The defense pointed out that {sel.belongings.text.replace(/^a /, 'a ')}.</p>
              <Sourced level={sel.belongings.level} refs={sel.belongings.refs} labels={labels} />
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = select(day)
  const { labels } = sel.index
  const itemRows: TableRow[] = sel.items.map((it, i) => ({
    key: it.id,
    group: i === 0 ? 'The icons' : undefined,
    cells: [it.countReported ? String(it.icons) : 'not reported', `${it.name}. One icon = ${it.perIcon}.`],
    level: it.level,
    refs: it.refs,
  }))
  const numberRows: TableRow[] = day.numbers.map((n, i) => ({
    key: `n${i}`,
    group: i === 0 ? `Every figure reported on Day ${day.day}` : undefined,
    cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, redactThirdParties(n.what)],
    level: n.confidence,
    refs: numberRefs(day, n),
  }))
  return (
    <>
      <p>
        {sel.agent ? `${sel.agent.name}, a federal agent, ` : 'A federal agent '}listed what agents found in the hotel room when Sean Combs was arrested
        {sel.arrest ? ` on ${sel.arrest.date}${sel.arrest.place ? ` at ${sel.arrest.place}` : ''}` : ''}. The picture draws one plain icon per unit:{' '}
        {sel.items.map((it) => `${it.icons} for ${it.name} (one icon = ${it.perIcon})`).join('; ')}. Solid icons were reported by two or more outlets, outlined icons by one.
      </p>
      <p>
        The agent&rsquo;s full list, as reported: {sel.listed.map(redactThirdParties).join('; ')}.
        {sel.belongings ? ` On cross-examination the defense pointed out that ${sel.belongings.text}.` : ''}
        {sel.stand ? ` This was also the last of Cassie Ventura's ${sel.stand.count} on the witness stand.` : ''}
      </p>
      <RowsTable caption={`Day ${day.day}: the items in the picture, and every figure reported`} columns={['Count or value', 'What it is']} rows={[...itemRows, ...numberRows]} labels={labels} />
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
