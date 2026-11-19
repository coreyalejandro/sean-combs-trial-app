// Builder 1 kit: small pieces every Day 1-7 picture shares. No hooks, so server and client components can both use them.
import type { ReactNode } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { layout } from '@/lib/viz/layout'
import { OpenOnHash } from './OpenOnHash'
import type { Level, Ref } from './refs'
import s from './kit.module.css'

/** Source links for a printed fact. Carries data-source-ids (the page test resolves every id). */
export function RefMarks({ refs, labels }: { refs: Ref[]; labels: Record<string, string> }) {
  if (refs.length === 0) return null
  return (
    <span className={s.refs} data-source-ids={refs.map((r) => r.id).join(' ')}>
      {refs.map((r) => (
        <a key={r.id} href={`#source-${r.id}`} className="source-ref" aria-label={`Source: ${r.outlet}${r.fromDay ? `, Day ${r.fromDay} record` : ''}`}>
          <sup>[{labels[r.id] ?? '?'}]</sup>
        </a>
      ))}
    </span>
  )
}

/** A confidence mark with words, then the source links. */
export function Sourced({ level, refs, labels, compact = false }: { level: Level; refs: Ref[]; labels: Record<string, string>; compact?: boolean }) {
  return (
    <span className={s.sourced}>
      <ConfidenceMark level={level} withLabel={!compact} />
      <RefMarks refs={refs} labels={labels} />
    </span>
  )
}

/** The small "calculated" tag DESIGN_29 puts on every number the app derives. */
export function Calculated({ formula }: { formula?: string }) {
  return (
    <span className={s.calc} title={formula}>
      calculated{formula ? <span className="visually-hidden">: {formula}</span> : null}
    </span>
  )
}

/** Sources used by the picture that the shell's panel does not list (other days' records, additions.json). */
export function ExtraSources({ extras, labels }: { extras: Ref[]; labels: Record<string, string> }) {
  if (extras.length === 0) return null
  return (
    <section className={s.extras} aria-label="More sources used in this picture">
      <details open={extras.length <= layout.gap / 2}>
        <summary className={s.extrasTitle}>More sources used in this picture ({extras.length})</summary>
        <p className={s.extrasNote}>Lettered sources come from other days&rsquo; records or were added for this picture. Numbered ones are in the sources list below.</p>
        <ol className={s.extrasList}>
          {extras.map((r) => (
            <li key={r.id} id={`source-${r.id}`}>
              <span className={s.extrasLabel}>{labels[r.id]}.</span> <span className={s.outlet}>{r.outlet}</span>.{' '}
              <a href={r.url} rel="noopener noreferrer" target="_blank">{r.title}</a>.{' '}
              <time className={s.date}>{r.date}</time>{' '}
              <span className={s.from}>{r.fromDay ? `(cited in the Day ${r.fromDay} record)` : r.origin ? `(${r.origin})` : '(added for this picture)'}</span>
            </li>
          ))}
        </ol>
      </details>
      <OpenOnHash />
    </section>
  )
}

export interface TableRow {
  key: string
  cells: ReactNode[]
  level: Level
  refs: Ref[]
  /** A section heading row placed before this row. */
  group?: string
}

/** The one data table of a text version: built from the same selection as the picture. */
export function RowsTable({ caption, columns, rows, labels }: { caption: string; columns: string[]; rows: TableRow[]; labels: Record<string, string> }) {
  const span = columns.length + 2
  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className="data-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} scope="col">{c}</th>
            ))}
            <th scope="col">How sure</th>
            <th scope="col">Sources</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <RowWithGroup key={r.key} row={r} span={span} labels={labels} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function RowWithGroup({ row, span, labels }: { row: TableRow; span: number; labels: Record<string, string> }) {
  return (
    <>
      {row.group ? (
        <tr className={s.groupRow} data-group-row="true">
          <th scope="colgroup" colSpan={span}>{row.group}</th>
        </tr>
      ) : null}
      <tr data-source-ids={row.refs.map((r) => r.id).join(' ')} data-confidence={row.level}>
        {row.cells.map((c, i) => (
          <td key={i}>{c}</td>
        ))}
        <td><ConfidenceMark level={row.level} /></td>
        <td><RefMarks refs={row.refs} labels={labels} /></td>
      </tr>
    </>
  )
}

/** A short line naming who or what a count leaves out (care rule 8). */
export function Missing({ children }: { children: ReactNode }) {
  return <p className={s.missing}><strong>Not in this picture:</strong> {children}</p>
}
