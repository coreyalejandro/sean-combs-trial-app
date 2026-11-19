// The one data table each of Builder 3's text versions carries: the picture's items first, then
// every other figure the day reported (so nothing in the record is hidden), then a note on any
// figures left out under care rule 2. Built from the same selection as the picture.
import type { ReactNode } from 'react'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { redactThirdParties, type ReportedNumber, type Source } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { numSources, SrcTags, type Level } from './sources'
import styles from './kit.module.css'

const COLUMN_COUNT = ['What', 'Value', 'When', 'How sure', 'Sources'].length

export interface TableRow {
  key: string
  what: ReactNode
  value: ReactNode
  when?: ReactNode
  level: Level
  sources: Source[]
}

export function VizTable({
  caption,
  rows,
  pool,
  other = [],
  dayNumber,
  whenLabel = 'When',
}: {
  caption: string
  rows: TableRow[]
  pool: Source[]
  other?: ReportedNumber[]
  dayNumber: number
  whenLabel?: string
}) {
  return (
    <div className="table-scroll" role="region" aria-label={caption} tabIndex={0}>
      <table className={`data-table ${styles.table}`}>
        <caption>{caption}</caption>
        <thead>
          <tr>
            {['What', 'Value', whenLabel, 'How sure', 'Sources'].map((h) => (
              <th key={h} scope="col">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} data-source-ids={r.sources.map((s) => s.id).join(' ')} data-confidence={r.level}>
              <td>{r.what}</td>
              <td className="num">{r.value}</td>
              <td>{r.when ?? <span className="muted">not stated</span>}</td>
              <td><ConfidenceMark level={r.level} /></td>
              <td><SrcTags sources={r.sources} pool={pool} /></td>
            </tr>
          ))}
        </tbody>
        {other.length > 0 && (
          <tbody>
            <tr className={styles.groupRow}>
              <th scope="colgroup" colSpan={COLUMN_COUNT}>
                Other figures reported on Day {dayNumber}
              </th>
            </tr>
            {other.map((num, i) => {
              const sources = numSources(num, pool)
              return (
                <tr key={`other-${i}`} data-source-ids={sources.map((s) => s.id).join(' ')} data-confidence={num.confidence}>
                  <td>{redactThirdParties(num.what)}</td>
                  <td className="num">{formatValue(num.value, num.unit)}</td>
                  <td><span className="muted">Day {dayNumber}</span></td>
                  <td><ConfidenceMark level={num.confidence} /></td>
                  <td><SrcTags sources={sources} pool={pool} /></td>
                </tr>
              )
            })}
          </tbody>
        )}
      </table>
    </div>
  )
}

/** A sentence saying which of the day's figures this page leaves out, and why. */
export function OmittedNote({ count, why }: { count: number; why: string }) {
  if (count <= 0) return null
  return (
    <p className={styles.omitted}>
      {count === 1 ? 'One figure' : `${count} figures`} from this day {count === 1 ? 'is' : 'are'} left out of this page: {why} They remain in the
      sources listed below.
    </p>
  )
}
