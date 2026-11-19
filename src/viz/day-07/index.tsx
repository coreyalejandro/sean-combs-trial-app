// Day 7: The $20,000 That Went to Combs and Came Back. A money path on a calendar.
import { redactThirdParties } from '@/lib/data'
import { PlaceholderTextVersion, PlaceholderViz } from '@/components/shell/Placeholder'
import { formatValue } from '@/lib/viz/format'
import type { DayVizProps } from '@/viz/types'
import { ExtraSources, RowsTable, Sourced, type TableRow } from '../day-01/kit/Parts'
import { monthName, numberRefs } from '../day-01/kit/refs'
import { MoneyPath } from './Interactive'
import { meta } from './meta'
import { select } from './select'
import s from './day07.module.css'

export { meta }

export default function Day07Viz(props: DayVizProps) {
  const sel = select(props.day)
  if (!sel) return <PlaceholderViz {...props} meta={meta} />
  const { labels, extras } = sel.index
  return (
    <div className={s.viz}>
      <div className={s.head}>
        <p className={s.amount}>
          <span className="num">{sel.amountText}</span>
          <span className={s.amountNote}>demanded from Regina Ventura, Cassie Ventura&rsquo;s mother</span>
          <Sourced level={sel.demand.level} refs={sel.demand.refs} labels={labels} />
        </p>
        <p className={s.demand}>{sel.demand.text}</p>
        {sel.loan ? (
          <p className={s.demand}>
            She said the family took a home-equity loan to pay it and wired the money, which was later returned. <Sourced level={sel.loan.level} refs={sel.loan.refs} labels={labels} compact />
          </p>
        ) : null}
      </div>
      <MoneyPath
        amountText={sel.amountText}
        monthName={monthName(sel.month)}
        month={sel.month}
        year={sel.year}
        daysInMonth={sel.daysInMonth}
        firstWeekday={sel.firstWeekday}
        bank={sel.bank}
        bankDay={sel.bankDay}
        context={sel.context}
        labels={labels}
      />
      {sel.ruling ? (
        <p className={s.ruling}>
          {sel.ruling.text} <Sourced level={sel.ruling.level} refs={sel.ruling.refs} labels={labels} />
        </p>
      ) : null}
      <ExtraSources extras={extras} labels={labels} />
    </div>
  )
}

export function TextVersion(props: DayVizProps) {
  const { day } = props
  const sel = select(day)
  if (!sel) return <PlaceholderTextVersion {...props} meta={meta} />
  const { labels } = sel.index
  const mn = monthName(sel.month)
  const wire = sel.bank.find((b) => b.kind === 'in')
  const ret = sel.bank.find((b) => b.kind === 'out')
  const pathRows: TableRow[] = [
    { key: 'demand', group: 'The path of the money', cells: ['date not reported', `${sel.amountText} demanded. ${sel.demand.text}`], level: sel.demand.level, refs: sel.demand.refs },
    ...(sel.loan ? [{ key: 'loan', cells: ['date not reported', `Home-equity loan: ${sel.loan.text}.`], level: sel.loan.level, refs: sel.loan.refs }] : []),
    ...sel.bank.map((b) => ({ key: `b${b.date}`, cells: [`${mn} ${b.date}, ${sel.year}`, `${sel.amountText} ${b.text} (bank records${sel.bankDay ? `, Day ${sel.bankDay}` : ''})`], level: b.level, refs: b.refs })),
    ...sel.context.map((c, i) => ({ key: c.id, group: i === 0 ? 'Also dated that month' : undefined, cells: [`${mn} ${c.date}, ${sel.year}`, c.label], level: c.level, refs: c.refs })),
  ]
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
        A calendar of {mn} {sel.year} with two lanes, the Ventura family and a Combs-related account. Regina Ventura testified that Combs demanded {sel.amountText} and
        that the family took a home-equity loan and wired the money, which was later returned; the date of the loan was not reported, so it sits before the calendar.
        {wire ? ` Bank records shown on Day ${sel.bankDay} put the wire from her father on ${mn} ${wire.date}` : ''}
        {ret ? ` and ${sel.amountText} going back out, marked as a return of funds, on ${mn} ${ret.date}` : ''}
        {wire && ret ? `: ${ret.date - wire.date} days later (calculated, ${ret.date} minus ${wire.date}).` : '.'}
      </p>
      <p>Marks below the calendar give other dates from that month: an email and photographs (shown only as dates). No image is reproduced.</p>
      <RowsTable caption={`Day ${day.day}: each step of the money path, other dates that month, and every figure reported`} columns={['Date or value', 'What the record says']} rows={[...pathRows, ...numberRows]} labels={labels} />
    </>
  )
}
