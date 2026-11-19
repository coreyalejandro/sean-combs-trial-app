// The day's reported numbers as an accessible table: value, what it is, how sure, sources.
// Used by every placeholder text version; builders may reuse it for their own table.
import { redactThirdParties, resolveSources, type ReportedNumber, type Source } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'
import { ConfidenceMark } from './ConfidenceMark'

export function NumbersTable({ numbers, pool, caption }: { numbers: ReportedNumber[]; pool: Source[]; caption: string }) {
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
          {numbers.map((num, i) => {
            const sources = resolveSources(num, pool)
            return (
              <tr key={i} data-source-ids={sources.map((s) => s.id).join(' ')} data-confidence={num.confidence}>
                <td className="num">{formatValue(num.value, num.unit)}</td>
                <td>{redactThirdParties(num.what)}</td>
                <td><ConfidenceMark level={num.confidence} /></td>
                <td>
                  {sources.length === 0 ? (
                    <span>{num.outlets.join(', ')}</span>
                  ) : (
                    sources.map((s) => (
                      <a key={s.id} href={`#source-${s.id}`} className="source-ref">
                        [{pool.indexOf(s) + 1}] {s.outlet.split(' (')[0]}
                      </a>
                    ))
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
