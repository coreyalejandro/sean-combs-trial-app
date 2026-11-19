// The five counts. On day pages: plain-language definitions, outcome hidden. On the verdict page: resolved.
import { getCharges } from '@/lib/data'

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
    </section>
  )
}
