// Tag any number printed in a caption, label or text version with its sources.
// The e2e test checks that every [data-source-ids] resolves to a source listed on the page.
import type { ReactNode } from 'react'
import { resolveSources, type ReportedNumber, type Source } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { ConfidenceMark } from './ConfidenceMark'

export function SourceRef({ ids, children }: { ids: string[]; children: ReactNode }) {
  return (
    <span data-source-ids={ids.join(' ')}>
      {children}
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`} className="source-ref" aria-label={`Source: ${id}`}>
          <sup>[{id}]</sup>
        </a>
      ))}
    </span>
  )
}

/** A reported number, formatted, with its confidence mark and source links. */
export function Cite({ num, pool, showMark = true }: { num: ReportedNumber; pool: Source[]; showMark?: boolean }) {
  const sources = resolveSources(num, pool)
  return (
    <span className="cite" data-source-ids={sources.map((s) => s.id).join(' ')} data-confidence={num.confidence}>
      <span className="num">{formatValue(num.value, num.unit)}</span>
      {showMark ? <> <ConfidenceMark level={num.confidence} /></> : null}
      {sources.map((s) => (
        <a key={s.id} href={`#source-${s.id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
          <sup>[{pool.indexOf(s) + 1}]</sup>
        </a>
      ))}
    </span>
  )
}
