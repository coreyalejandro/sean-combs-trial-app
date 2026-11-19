// Day 23: Three Searches, Side by Side. A shared-unit waffle: one square = one bottle in every grid.
// Server component: grids are computed here from the records and are in the static HTML.
import type { CSSProperties } from 'react'
import { Cite } from '@/components/shell/SourceRef'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { NumbersTable } from '@/components/shell/NumbersTable'
import { formatDate, getDay } from '@/lib/data'
import { layout } from '@/lib/viz/layout'
import { formatInt, formatValue } from '@/lib/viz/format'
import type { DayVizProps, ExtraSource } from '@/viz/types'
import { Calc, crossDayExtras, RowList, XRef } from '@/viz/kits/days-22-28/kit'
import { WaffleStage } from './Interactive'
import { meta } from './meta'
import { selectDay23, type Day23Selection, type Site } from './select'
import { waffle, type WaffleGrid } from './waffle'
import styles from './day23.module.css'
import type { TrialDay } from '@/lib/data'

export { meta }

/** "2024-03-24 or 25" -> "March 24, 2024 (or 25)"; amounts keep their dollar sign. */
function show(num: { value: number | string; unit: string }): string {
  const v = String(num.value)
  const iso = v.match(/^(\d{4}-\d{2}-\d{2})(.*)$/)
  if (iso) return `${formatDate(iso[1])}${iso[2] ? ` (${iso[2].trim()})` : ''}`
  return /usd/i.test(num.unit) ? formatValue(num.value, num.unit) : formatValue(num.value, '')
}

const KIND_LABEL = { 'baby oil': 'baby oil', lubricant: 'lubricant' } as const

function Grid({ g, cls, title }: { g: WaffleGrid; cls: string; title: string }) {
  return (
    <svg className={cls} viewBox={`0 0 ${g.width} ${g.height}`} role="img" aria-label={title}>
      {g.labels.map((l) => (
        <text key={l.kind} x={0} y={l.y} fontSize={layout.fontSize.small} className={styles.blockLabel} data-source-ids={l.sourceIds}>
          {formatInt(l.count)} bottles of {KIND_LABEL[l.kind]}
        </text>
      ))}
      {g.rows.map((r, i) => (
        <path
          key={`${r.kind}-${r.y}`}
          d={r.d}
          className={`${styles.row} ${r.kind === 'lubricant' ? styles.lube : styles.oil}`}
          style={{ '--i': i, '--n': g.rows.length } as CSSProperties}
        />
      ))}
    </svg>
  )
}

function SiteCard({ site, colWide, colNarrow }: { site: Site; colWide: number; colNarrow: number }) {
  const wide = waffle(site, colWide, false)
  const narrow = waffle(site, colNarrow, true)
  const title = `${site.name}: ${site.bottles.map((b) => `${formatInt(b.count)} bottles of ${KIND_LABEL[b.kind]}`).join(' and ')}, one square per bottle.`
  return (
    <section className={`${styles.card} ${site.confidence === 'high' ? '' : styles.cardThin}`} aria-label={site.name}>
      <header className={styles.cardHead}>
        <h3 className={styles.siteName}>{site.name}</h3>
        <p className={styles.siteMeta}>
          {site.date ? (
            <XRef ids={site.date.sources.map((s) => s.id)}>
              <span className="num">{show(site.date.num)}</span>
            </XRef>
          ) : null}
          {site.agent ? <> · agent on the stand: {site.agent}</> : null} · <a href={`/day/${site.day}/`}>Day {site.day}</a>
        </p>
        <p className={styles.total}>
          <span className={styles.totalNum} data-source-ids={site.bottles.flatMap((b) => b.sources.map((s) => s.id)).join(' ')}>
            {formatInt(site.total)}
          </span>{' '}
          bottles {site.bottles.length > 1 ? <Calc formula={site.bottles.map((b) => `${b.count} ${b.kind}`).join(' + ')} /> : null}{' '}
          <ConfidenceMark level={site.confidence} />
        </p>
      </header>
      <Grid g={wide} cls={styles.wide} title={title} />
      <Grid g={narrow} cls={styles.narrow} title={title} />
      {site.items.length + site.notes.length > 0 ? (
        <ul className={styles.items} aria-label={`Other items, ${site.name}`}>
          {site.items.map((it) => (
            <li key={it.label}>
              <XRef ids={it.sources.map((s) => s.id)}>
                <span className="num">{show(it.num)}</span>
              </XRef>{' '}
              {it.label} <ConfidenceMark level={it.num.confidence} withLabel={false} />
            </li>
          ))}
          {site.notes.map((n) => (
            <li key={n.text}>
              <XRef ids={n.sources.map((s) => s.id)}>{n.text}</XRef>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  )
}

function SitesTable({ sel }: { sel: Day23Selection }) {
  return (
    <div className="table-scroll" role="region" aria-label="What agents said they seized, by search" tabIndex={0}>
      <table className="data-table">
        <caption>What agents said they seized, by search</caption>
        <thead>
          <tr>
            <th scope="col">Search</th>
            <th scope="col">Bottles</th>
            <th scope="col">Other items</th>
            <th scope="col">How sure</th>
          </tr>
        </thead>
        <tbody>
          {sel.sites.map((s) => (
            <tr key={s.id} data-source-ids={s.bottles.flatMap((b) => b.sources.map((x) => x.id)).join(' ')}>
              <td>
                {s.name}
                {s.date ? `, ${show(s.date.num)}` : ''} (agent: {s.agent ?? 'not reported'}; Day {s.day})
              </td>
              <td className="num">
                {s.bottles.map((b) => `${formatInt(b.count)} ${b.kind}`).join(', ')} = {formatInt(s.total)} (calculated)
              </td>
              <td>{[...s.items.map((i) => `${show(i.num)} ${i.label}`), ...s.notes.map((n) => n.text)].join('; ') || 'none reported'}</td>
              <td><ConfidenceMark level={s.confidence} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function allIds(sel: Day23Selection): string[] {
  return sel.sites.flatMap((s) => [
    ...s.bottles.flatMap((b) => b.sources.map((x) => x.id)),
    ...s.items.flatMap((i) => i.sources.map((x) => x.id)),
    ...s.notes.flatMap((n) => n.sources.map((x) => x.id)),
    ...(s.date ? s.date.sources.map((x) => x.id) : []),
  ])
}

export default function Day23Viz({ day }: DayVizProps) {
  const sel = selectDay23(day)
  const colWide = (layout.chartWidth - layout.gap * (sel.sites.length - 1)) / sel.sites.length
  const colNarrow = layout.phoneWidth - layout.gap * 2
  const la = sel.sites.find((s) => s.id === 'la')
  const smallest = sel.sites.reduce((a, b) => (b.total < a.total ? b : a), sel.sites[0])
  return (
    <div className={styles.viz}>
      <ul className={styles.key} aria-label="Key">
        <li><span className={`${styles.sw} ${styles.swLube}`} aria-hidden="true" /> one bottle of lubricant</li>
        <li><span className={`${styles.sw} ${styles.swOil}`} aria-hidden="true" /> one bottle of baby oil</li>
        <li><span className={`${styles.sw} ${styles.swThin}`} aria-hidden="true" /> dashed top rule: one outlet</li>
      </ul>
      <WaffleStage
        grids={
          <div className={styles.cards}>
            {sel.sites.map((s) => (
              <SiteCard key={s.id} site={s} colWide={colWide} colNarrow={colNarrow} />
            ))}
          </div>
        }
        table={<SitesTable sel={sel} />}
      />
      {la && smallest && smallest.total > 0 ? (
        <p className={styles.ratio}>
          The Los Angeles count is about <span className="num">{formatInt(Math.round(la.total / smallest.total))}</span> times the arrest-room
          count <Calc formula={`${la.total} / ${smallest.total}`} />, drawn at the same square size so the difference is exact.
        </p>
      ) : null}
      {sel.verification ? (
        <p className={styles.note}>
          <ConfidenceMark level="low" /> The Los Angeles agent&apos;s name was given by one outlet and is not confirmed, so it is not shown.
          The Los Angeles counts come from Good Morning America and the ABC live blog, which are one outlet family.
        </p>
      ) : null}
    </div>
  )
}

export function TextVersion({ day }: DayVizProps) {
  const sel = selectDay23(day)
  return (
    <>
      <p>{meta.altShort}</p>
      <p>
        Agents testified about three searches. {sel.sites.map((s) => `${s.name}: ${formatInt(s.total)} bottles (${s.bottles.map((b) => `${formatInt(b.count)} ${b.kind}`).join(', ')}), described on Day ${s.day}${s.date ? `, search dated ${show(s.date.num)}` : ''}.`).join(' ')}{' '}
        Totals are calculated by adding the reported counts. {sel.defenseQuestion ? sel.defenseQuestion.text : ''}
      </p>
      <RowList
        caption="What agents said they seized, by search"
        columns={['Search', 'Bottles', 'Other items', 'How sure']}
        rows={sel.sites.map((s) => ({
          key: s.id,
          sourceIds: s.bottles.flatMap((b) => b.sources.map((x) => x.id)).join(' '),
          cells: [
            `${s.name}${s.date ? `, ${show(s.date.num)}` : ''} (agent: ${s.agent ?? 'not reported'}; Day ${s.day})`,
            `${s.bottles.map((b) => `${formatInt(b.count)} ${b.kind}`).join(', ')} = ${formatInt(s.total)} (calculated)`,
            [...s.items.map((i) => `${show(i.num)} ${i.label}`), ...s.notes.map((n) => n.text)].join('; ') || 'none reported',
            <ConfidenceMark key="c" level={s.confidence} />,
          ],
        }))}
      />
      <NumbersTable numbers={day.numbers} pool={day.sources} caption={`Figures reported on Day ${day.day}`} />
      <p className="muted">
        Bottle counts: {sel.sites.map((s) => s.bottles.map((b) => <span key={`${s.id}-${b.kind}`}><Cite num={b.num} pool={getPool(day, b.day)} showMark numbered={b.day === day.day} /> ({s.name}, {b.kind}); </span>))}
      </p>
    </>
  )
}

function getPool(day: DayVizProps['day'], n: number) {
  return n === day.day ? day.sources : getDay(n).sources
}

/** Other days' sources this page cites; the shell's Sources panel lists them after the day's own. */
export function extraSources(day: TrialDay): ExtraSource[] {
  return crossDayExtras(allIds(selectDay23(day)), day)
}
