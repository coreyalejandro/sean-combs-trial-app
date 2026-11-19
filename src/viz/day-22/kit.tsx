// Small helpers shared by Builder 4's days (22 to 28). Server-safe: no hooks, no browser APIs.
// - redact(): the shared redactor plus names the shared list does not hold yet (see SHARED_REQUEST.md).
// - XRef / CrossDaySources: cite a source recorded on ANOTHER day. The page's own sources panel lists
//   only this day's sources, so every cross-day source cited here is listed once, under the picture,
//   with id="source-<id>" (the page test checks that every data-source-ids id is on the page).
import type { ReactNode } from 'react'
import { redactThirdParties, sourceById, type Source, type TrialDay } from '@/lib/data'
import styles from './kit.module.css'

const ISO_DATE = 'YYYY-MM-DD'

/** Third parties the shared redactor does not cover yet (care rule 4). Requested in SHARED_REQUEST.md. */
const EXTRA_REDACTIONS: Array<[RegExp, string]> = [
  [/\bfor escort Jules Theodore\b/g, 'for a sex worker named in court records'],
  [/\bJules Theodore\b/g, 'a sex worker named in court records'],
  [/\bEscort 'Paul' and 'Anton'/g, 'Two escorts named in court records'],
]

export function redact(text: string): string {
  return EXTRA_REDACTIONS.reduce((t, [re, rep]) => t.replace(re, rep), redactThirdParties(text))
}

/** A link to a source by id, with the day it was recorded on. */
export function XRef({ ids, children }: { ids: string[]; children?: ReactNode }) {
  return (
    <span data-source-ids={ids.join(' ')}>
      {children}
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`} className="source-ref" aria-label={`Source: ${sourceById(id)?.outlet ?? id}`}>
          <sup>[{id}]</sup>
        </a>
      ))}
    </span>
  )
}

/** Sources from other days, listed once under the picture so every cross-day reference resolves. */
export function CrossDaySources({ ids, day, extra }: { ids: string[]; day: TrialDay; extra?: ReactNode }) {
  const own = new Set(day.sources.map((s) => s.id))
  const list = [...new Set(ids)]
    .filter((id) => !own.has(id))
    .map((id) => sourceById(id))
    .filter((s): s is Source => Boolean(s))
  if (list.length === 0 && !extra) return null
  return (
    <section className={styles.xsources} aria-label="Sources from other days used in this picture">
      {list.length > 0 && (
        <>
          <h3 className={styles.xhead}>Sources from other days used in this picture</h3>
          <ul className={styles.xlist}>
            {list.map((s) => (
              <li key={s.id} id={`source-${s.id}`}>
                <span className="mono">[{s.id}]</span> <strong>{s.outlet}</strong>.{' '}
                <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>.{' '}
                <time className="src-date" dateTime={s.date.slice(0, ISO_DATE.length)}>{s.date}</time>
              </li>
            ))}
          </ul>
        </>
      )}
      {extra}
    </section>
  )
}

/** The small "calculated" tag DESIGN_29 puts on every number the app derives. */
export function Calc({ formula }: { formula: string }) {
  return (
    <span className="tag" title={`Calculated: ${formula}`}>
      calculated
    </span>
  )
}

/** Reference facts from this folder's additions.json, with their links, for the text version. */
export interface AdditionSource { outlet: string; outlet_family: string; title: string; url: string; date: string }
export interface AdditionItem {
  id: string
  kind: string
  text: string
  value?: number | string
  unit?: string
  date?: string
  from_days: number[]
  confidence: 'high' | 'medium' | 'low'
  sources: AdditionSource[]
  source_ids?: string[]
}

export function AdditionsList({ items, heading }: { items: AdditionItem[]; heading: string }) {
  if (items.length === 0) return null
  return (
    <>
      <h3 className={styles.xhead}>{heading}</h3>
      <ul className={styles.xlist}>
        {items.map((it) => (
          <li key={it.id}>
            {it.text}
            {it.value !== undefined ? <span className="mono"> ({String(it.value)})</span> : null}:{' '}
            {it.sources.map((s, i) => (
              <span key={s.url}>
                {i > 0 ? '; ' : ''}
                <a href={s.url} rel="noopener noreferrer" target="_blank">{s.outlet}, {s.title}</a>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </>
  )
}

/** Days are linked by their page address. */
export function dayLink(n: number): string {
  return `/day/${n}/`
}

/**
 * Rows of labelled values, for a second table-like listing in a text version. The shared registry test
 * expects exactly one <table> (the day's figures), so further listings use this accessible list form:
 * each row is a list item holding a description list of "column: value" pairs.
 */
export function RowList({ caption, columns, rows }: { caption: string; columns: string[]; rows: Array<{ key: string; cells: ReactNode[]; sourceIds?: string }> }) {
  return (
    <section className={styles.rowlist} aria-label={caption}>
      <h3 className={styles.xhead}>{caption}</h3>
      <ol className={styles.rows}>
        {rows.map((r) => (
          <li key={r.key} data-source-ids={r.sourceIds || undefined}>
            <dl className={styles.pairs}>
              {r.cells.map((c, i) => (
                <div key={columns[i]} className={styles.pair}>
                  <dt>{columns[i]}</dt>
                  <dd>{c}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
    </section>
  )
}
