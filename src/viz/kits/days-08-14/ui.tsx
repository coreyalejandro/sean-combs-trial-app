// Builder 2 kit (Days 8 to 14): small pieces every picture uses. No hooks here, so both server and
// client components can use them.
import type { ReactNode } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { redactThirdParties, resolveSources, type ReportedNumber, type TrialDay } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import type { ExtraSource } from '@/viz/types'
import type { Fact, SourceBook, SourceLink, SrcRec } from './facts'
import s from './kit.module.css'

export { s as kit }

/** Footnote links for a list of source ids, wrapped so the page test can check each id is listed. */
export function Refs({ refs, book }: { refs: SrcRec[]; book: SourceBook }) {
  const links = refs.map((r) => book.byUrl[r.url]).filter((l): l is SourceLink => !!l)
  if (links.length === 0) return null
  return (
    <span className={s.refs} data-source-ids={links.map((l) => l.key).join(' ')}>
      {links.map((l) => (
        <a key={l.key} href={`#source-${l.key}`} className="source-ref" aria-label={`Source ${l.n}: ${l.outlet}`}>
          <sup>[{l.n}]</sup>
        </a>
      ))}
    </span>
  )
}

/** A fact's confidence (mark and words) plus its sources. */
export function FactMeta({ fact, book, compact = false }: { fact: Fact; book: SourceBook; compact?: boolean }) {
  return (
    <span className={s.factMeta}>
      <ConfidenceMark level={fact.confidence} withLabel={!compact} />
      <Refs refs={fact.refs} book={book} />
    </span>
  )
}

/** The small "calculated" tag (DESIGN_29) for numbers the app derives. */
export function Calc({ formula }: { formula?: string }) {
  return (
    <span className={s.calc} title={formula}>
      calculated{formula ? <span className="visually-hidden">: {formula}</span> : null}
    </span>
  )
}

/** "Day 9" style references for the days a fact comes from. */
export function dayList(days: number[]): string {
  if (days.length === 0) return ''
  const words = days.map((d) => `Day ${d}`)
  return words.length === 1 ? words[0] : `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

/** Sources the picture cites from other days (or additions.json), for the shell's Sources panel, in footnote order. */
export function bookExtras(book: SourceBook): ExtraSource[] {
  return book.extras.map((x) => ({
    id: x.key,
    outlet: x.outlet,
    title: x.title,
    url: x.url,
    date: x.date,
    origin: x.fromDay ? `from the Day ${x.fromDay} record` : 'added for this picture',
  }))
}

export interface TableRow {
  key: string
  /** First cell: the value as text (already formatted from data). */
  value: ReactNode
  what: ReactNode
  fact: Fact | null
  /** Extra words after the confidence, e.g. "outlets disagree: $200,000 vs $250,000". */
  note?: ReactNode
  /** For numbers the app derives: the formula, shown with the "calculated" tag. */
  calc?: string
}

/**
 * The one data table of a text version: the picture's own rows, then every other figure reported on
 * this day (so the table changes when the day's record changes).
 */
export function FactsTable({ caption, rows, day, book, used = [] }: { caption: string; rows: TableRow[]; day: TrialDay; book: SourceBook; used?: ReportedNumber[] }) {
  const rest = day.numbers.filter((n) => !used.includes(n))
  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Value</th>
            <th scope="col">What it is</th>
            <th scope="col">How sure</th>
            <th scope="col">Sources</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} data-confidence={r.fact?.confidence ?? 'none'}>
              <td className="num">{r.value}</td>
              <td>{r.what}{r.fact && r.fact.days.length ? <span className="muted"> ({dayList(r.fact.days)})</span> : null}</td>
              <td>{r.calc ? <><Calc formula={r.calc} /> <span className="muted">{r.calc}</span></> : r.fact ? <ConfidenceMark level={r.fact.confidence} /> : <span className="muted">not stated in coverage</span>}{r.note ? <> {r.note}</> : null}</td>
              <td>{r.fact ? <Refs refs={r.fact.refs} book={book} /> : null}</td>
            </tr>
          ))}
        </tbody>
        {rest.length > 0 && (
          <tbody>
            <tr>
              <th scope="colgroup" colSpan={2 + 2} className={s.groupHead}>Also reported on Day {day.day}</th>
            </tr>
            {rest.map((num, i) => {
              const refs = resolveSources(num, day.sources).map((x) => ({ id: x.id, url: x.url, outlet: x.outlet, title: x.title, date: x.date, fromDay: day.day }))
              return (
                <tr key={`rest-${i}`} data-confidence={num.confidence}>
                  <td className="num">{formatValue(num.value, num.unit)}</td>
                  <td>{redactThirdParties(num.what)}</td>
                  <td><ConfidenceMark level={num.confidence} /></td>
                  <td><Refs refs={refs} book={book} /></td>
                </tr>
              )
            })}
          </tbody>
        )}
      </table>
    </div>
  )
}

/**
 * A data dot drawn the way the confidence mark is drawn: solid (two or more outlets), hollow (one outlet),
 * dashed hollow (one outlet, unconfirmed), split (outlets disagree). Words are always given elsewhere.
 */
export function ConfDot({ cx, cy, r, level, color = 'var(--ink)' }: { cx: number; cy: number; r: number; level: Fact['confidence'] | null; color?: string }) {
  const w = r / 2
  if (level === null) return <circle cx={cx} cy={cy} r={r} fill="var(--paper)" stroke="var(--neutral)" strokeWidth={1} strokeDasharray="2 2" aria-hidden="true" />
  if (level === 'high') return <circle cx={cx} cy={cy} r={r} fill={color} stroke={color} strokeWidth={2} aria-hidden="true" />
  if (level === 'conflict')
    return (
      <g aria-hidden="true">
        <circle cx={cx} cy={cy} r={r - w / 2} fill="#fff" stroke={color} strokeWidth={w} />
        <path d={`M${cx} ${cy - r} A${r} ${r} 0 0 0 ${cx} ${cy + r} Z`} fill={color} />
      </g>
    )
  return <circle cx={cx} cy={cy} r={r - w / 2} fill="#fff" stroke={color} strokeWidth={w} strokeDasharray={level === 'low' ? `${w} ${w / 2 + 1}` : undefined} aria-hidden="true" />
}
