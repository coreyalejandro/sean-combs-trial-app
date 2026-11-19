// Tag any number printed in a caption, label or text version with its sources.
// The e2e test checks that every [data-source-ids] resolves to a source listed on the page.
import type { ReactNode } from 'react'
import { resolveSources, sourceById, type ReportedNumber, type Source } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { ConfidenceMark } from './ConfidenceMark'

export function SourceRef({ ids, children }: { ids: string[]; children: ReactNode }) {
  return (
    <span data-source-ids={ids.join(' ')}>
      {children}
      {ids.map((id) => (
        <a key={id} href={`#source-${id}`} className="source-ref" aria-label={`Source: ${sourceById(id)?.outlet ?? 'listed below'}`}>
          <sup>[{sourceById(id) ? shortOutlet(sourceById(id)!.outlet) : 'source'}]</sup>
        </a>
      ))}
    </span>
  )
}

function shortOutlet(outlet: string): string {
  return outlet.split(/\s[(/]|\svia\s/)[0]
}

/**
 * A reported number, formatted, with its confidence mark and source links. Links are numbered by the source's place
 * in `pool`, which is right when `pool` is the page's own list; for a number from another day's record pass
 * numbered={false} and the links show the outlet's name instead (the page's panel numbers those sources differently).
 */
export function Cite({ num, pool, showMark = true, numbered = true }: { num: ReportedNumber; pool: Source[]; showMark?: boolean; numbered?: boolean }) {
  const sources = resolveSources(num, pool)
  return (
    <span className="cite" data-source-ids={sources.map((s) => s.id).join(' ')} data-confidence={num.confidence}>
      <span className="num">{formatValue(num.value, num.unit)}</span>
      {showMark ? <> <ConfidenceMark level={num.confidence} /></> : null}
      {sources.map((s) => (
        <a key={s.id} href={`#source-${s.id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
          <sup>[{numbered ? pool.indexOf(s) + 1 : shortOutlet(s.outlet)}]</sup>
        </a>
      ))}
    </span>
  )
}
