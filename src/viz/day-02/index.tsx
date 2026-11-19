// Day 2: How Old Cassie Ventura Was When It Began, and How Long It Lasted. A dual lifeline.
// The server selects; the client child draws both age lines (in the static HTML too) and adds the year cursor.
import { redactThirdParties, type ReportedNumber } from '@/lib/data'
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import { formatValue } from '@/lib/viz/format'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { Calculated, RowsTable, Sourced, type TableRow } from '@/viz/kits/days-01-07/Parts'
import { numberRefs, uniqueRefs, toExtraSources } from '@/viz/kits/days-01-07/refs'
import { Lifeline } from './Interactive'
import { meta } from './meta'
import { select } from './select'
import s from './day02.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

function firmYears(text: string): number | null {
  const m = text.match(/\d+/)
  return m ? Number(m[0]) : null
}

export default function Day02Viz(props: DayVizProps) {
  const sel = select(props.day)
  if (!sel) return <PlaceholderViz {...props} meta={meta} />
  const { labels } = sel.index
  const rel = sel.relationship
  const firstReading = rel?.readings[0]?.text ?? ''
  const firm = rel && /just over|about/i.test(firstReading) ? rel.from + (firmYears(firstReading) ?? 0) : null
  return (
    <div className={s.viz}>
      <Lifeline
        startYear={sel.startYear}
        endYear={sel.endYear}
        herAgeMet={sel.herAgeMet}
        hisAgeMet={sel.hisAgeMet}
        metYear={sel.metYear}
        gap={sel.gap}
        events={sel.events}
        together={rel ? { from: rel.from, firm, to: rel.to } : null}
        labels={labels}
      />
      <div className={s.side}>
        {rel ? (
          <section className={s.box} aria-label="How long the relationship lasted">
            <h3 className={s.boxTitle}>How long it lasted</h3>
            <p className={s.small}>
              Drawn from {rel.from} to {rel.to}. The solid band is the shortest reading; the hatched end is where outlets disagree.
            </p>
            <ul className={s.readings}>
              {rel.readings.map((r) => (
                <li key={r.text}>
                  {redactThirdParties(r.text)} <Sourced level={r.level} refs={r.refs} labels={labels} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
        {sel.deal ? (
          <section className={s.box} aria-label="The record deal">
            <h3 className={s.boxTitle}>The record deal</h3>
            <div className={s.squares} role="img" aria-label={`${sel.deal.size} squares for the albums in the deal; ${sel.deal.released} filled for the one release.`}>
              {Array.from({ length: sel.deal.size }, (_, i) => (
                <span key={i} className={i < sel.deal!.released ? s.squareOn : s.square} aria-hidden="true" />
              ))}
            </div>
            <p className={s.small}>
              {sel.deal.size} squares, one per album in the deal; {sel.deal.released} filled for the one release. What that release was, and when, is reported two ways:
            </p>
            <ul className={s.readings}>
              {sel.deal.readings.map((r) => (
                <li key={r.text}>
                  {r.text} <Sourced level={sel.deal!.readings.length > 1 ? 'conflict' : r.level} refs={r.refs} labels={labels} />
                </li>
              ))}
            </ul>
            {sel.deal.note ? (
              <p className={s.note}>
                {sel.deal.note.text} <Sourced level={sel.deal.note.level} refs={sel.deal.note.refs} labels={labels} />
              </p>
            ) : null}
          </section>
        ) : null}
      </div>
    </div>
  )
}

export function TextVersion(props: DayVizProps) {
  const { day } = props
  const sel = select(day)
  if (!sel) return <PlaceholderTextVersion {...props} meta={meta} />
  const { labels } = sel.index
  const herEnd = sel.herAgeMet + (sel.endYear - sel.metYear)
  const hisEnd = sel.hisAgeMet + (sel.endYear - sel.metYear)
  const eventRows: TableRow[] = sel.events.map((e, i) => ({
    key: e.id,
    group: i === 0 ? 'The marks on the lifeline' : undefined,
    cells: [e.yearEnd ? `${e.year} or ${e.yearEnd}` : String(e.year), `${e.label}. ${e.detail}`],
    level: e.level,
    refs: e.refs,
  }))
  const numberRows: TableRow[] = day.numbers.map((n: ReportedNumber, i) => ({
    key: `n${i}`,
    group: i === 0 ? `Every figure reported on Day ${day.day}` : undefined,
    cells: [<span key="v" className="num">{formatValue(n.value, n.unit)}</span>, redactThirdParties(n.what)],
    level: n.confidence,
    refs: numberRefs(day, n),
  }))
  return (
    <>
      <p>
        Two lines run from {sel.startYear} to {sel.endYear}. The upper line is Cassie Ventura&rsquo;s age, the lower line Sean Combs&rsquo;s. She testified
        that they met in {sel.metYear}, when she was {sel.herAgeMet} and he was {sel.hisAgeMet}: {sel.gap} years apart
        <Calculated formula={`${sel.hisAgeMet} minus ${sel.herAgeMet}`} />. By {sel.endYear} she was about {herEnd} and he about {hisEnd}
        <Calculated formula="age in the year they met plus the years since" />.
      </p>
      <p>
        Numbered marks show the dates she gave: {sel.events.map((e) => `${e.label.toLowerCase()} (${e.yearEnd ? `${e.year} or ${e.yearEnd}` : e.year})`).join('; ')}.
        {sel.relationship ? ` The band between the lines shows the relationship, ${sel.relationship.from} to ${sel.relationship.to}; outlets give its length as ${sel.relationship.readings.map((r) => r.text).join(', or ')}.` : ''}
        {sel.deal ? ` A small inset of ${sel.deal.size} squares, ${sel.deal.released} filled, stands for her record deal and its one release.` : ''}
      </p>
      <RowsTable caption={`Day ${day.day}: the dates on the lifeline, and every figure reported`} columns={['Year or figure', 'What the record says']} rows={[...eventRows, ...numberRows]} labels={labels} />
      <p className="visually-hidden">{uniqueRefs(sel.events.flatMap((e) => e.refs)).length} sources back the marks.</p>
    </>
  )
}

/** Other days' and added sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  const sel = select(day)
  return sel ? toExtraSources(sel.index.extras) : []
}
