// The five counts. On day pages: plain-language definitions, outcome hidden. On the verdict page: resolved.
import { getCharges, type Charge } from '@/lib/data'

const list = (xs: number[]) => (xs.length > 1 ? `${xs.slice(0, -1).join(', ')} and ${xs[xs.length - 1]}` : String(xs[0]))

/** "not guilty on Counts 1, 2 and 4; guilty on Counts 3 and 5." from the charges table. */
export function outcomeLine(charges: Charge[]): string {
  const by = (o: Charge['outcome']) => charges.filter((c) => c.outcome === o).map((c) => c.count)
  const ng = by('not guilty')
  const g = by('guilty')
  const part = (word: string, xs: number[]) => (xs.length ? `${word} on Count${xs.length > 1 ? 's' : ''} ${list(xs)}` : '')
  return `${[part('not guilty', ng), part('guilty', g)].filter(Boolean).join('; ')}. Not guilty means the jury was not persuaded beyond a reasonable doubt.`
}

export function ChargeRibbon({ highlight = [], resolved = false }: { highlight?: number[]; resolved?: boolean }) {
  const charges = getCharges()
  return (
    <section className={`charge-ribbon ${resolved ? 'is-resolved' : ''}`} aria-label="The five charges">
      <h2 className="ribbon-title">{resolved ? 'How the jury decided each charge' : `The ${charges.length} charges`}</h2>
      <ol className="ribbon-list">
        {charges.map((c) => (
          <li
            key={c.count}
            className={`ribbon-item ${highlight.includes(c.count) ? 'is-highlight' : ''} ${resolved ? `outcome-${c.outcome.replace(' ', '-')}` : ''}`}
            data-count={c.count}
            data-source-ids={resolved ? c.source_ids.join(' ') : undefined}
          >
            <details>
              <summary>
                <span className="ribbon-count">Count {c.count}</span> <span className="ribbon-short">{c.short}</span>
                {resolved ? <span className="ribbon-outcome">{c.outcome}</span> : null}
              </summary>
              <p>{c.plain}.</p>
            </details>
          </li>
        ))}
      </ol>
      {resolved ? null : (
        <p className="ribbon-outcome-line">
          <strong>How it ended:</strong> {outcomeLine(charges)}{' '}
          <a href="/verdict/">See the verdict</a>.
        </p>
      )}
    </section>
  )
}
