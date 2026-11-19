// Small helpers shared by Builder 4's days (22 to 28). Server-safe: no hooks, no browser APIs.
// - redact(): the shared redactor (src/lib/data/redact.ts now holds every name these days need hidden).
// - XRef: cite sources by id, including sources recorded on ANOTHER day.
// - crossDayExtras(): the other days' sources a picture cites, for the shell's Sources panel (listed after the
//   day's own, with id="source-<id>", so every data-source-ids tag on the page resolves).
import type { ReactNode } from 'react'
import { redactThirdParties, sourceById, sourceHome, type TrialDay, plainSourceTitle } from '@/lib/data'
import type { ExtraSource } from '@/viz/types'
import styles from './kit.module.css'

export function redact(text: string): string {
  return redactThirdParties(text)
}

/** The outlet's short name ("NBC News", "CBS News"), used as the link text for a source. */
export function shortOutlet(outlet: string): string {
  return outlet.split(/\s[(/]|\svia\s/)[0]
}

/** Links to sources by id (any day's record), labelled with the outlet's name. */
export function XRef({ ids, children }: { ids: string[]; children?: ReactNode }) {
  return (
    <span data-source-ids={ids.join(' ')}>
      {children}
      {ids.map((id) => {
        const outlet = sourceById(id)?.outlet
        return (
          <a key={id} href={`#source-${id}`} className="source-ref" aria-label={`Source: ${outlet ?? 'listed below'}`}>
            <sup>[{outlet ? shortOutlet(outlet) : 'source'}]</sup>
          </a>
        )
      })}
    </span>
  )
}

/** Sources from other days a picture cites, for the shell's Sources panel (the day's own are listed already). */
export function crossDayExtras(ids: string[], day: TrialDay): ExtraSource[] {
  const own = new Set(day.sources.map((s) => s.id))
  const out: ExtraSource[] = []
  for (const id of new Set(ids)) {
    if (own.has(id)) continue
    const s = sourceById(id)
    if (!s) continue
    const home = sourceHome(id)
    out.push({ id, outlet: s.outlet, title: s.title, url: s.url, date: s.date, origin: home === 'verdict' ? 'from the verdict record' : `from the Day ${home} record` })
  }
  return out
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
                <a href={s.url} rel="noopener noreferrer" target="_blank">{s.outlet}, {plainSourceTitle(s.title)}</a>
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
