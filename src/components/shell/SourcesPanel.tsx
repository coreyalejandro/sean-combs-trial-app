// Sources for a day (or the verdict): numbered, outlet, title, date, link; plus how sure the day is
// and where outlets disagree. Rendered on every day page by the shell, so every visualization shows its sources.
import { redactThirdParties, type DayConfidence, type Source } from '@/lib/data'
import { ConfidenceLegend, ConfidenceMark } from './ConfidenceMark'

export function SourcesPanel({
  sources,
  confidence,
  discrepancies = [],
  outletLabels = [],
  heading = 'Sources',
}: {
  sources: Source[]
  confidence: DayConfidence
  discrepancies?: string[]
  outletLabels?: string[]
  heading?: string
}) {
  return (
    <section className="sources-panel" aria-labelledby="sources-heading" id="sources">
      <h2 id="sources-heading">{heading}</h2>
      <p className="sources-confidence">
        <strong>How sure this page is:</strong> <ConfidenceMark level={confidence.level === 'high' ? 'high' : confidence.level} />{' '}
        <span>{confidence.summary}</span>
      </p>
      <details className="legend-details">
        <summary>What the marks mean</summary>
        <ConfidenceLegend />
      </details>
      <ol className="sources-list">
        {sources.map((s) => (
          <li key={s.id} id={`source-${s.id}`}>
            <span className="src-outlet">{s.outlet}</span>.{' '}
            <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>.{' '}
            <time className="src-date" dateTime={s.date.slice(0, 10)}>{s.date}</time>
            {s.opened_this_pass ? null : <span className="src-flag"> (read in an earlier research pass)</span>}
          </li>
        ))}
      </ol>
      {discrepancies.length > 0 && (
        <>
          <h3>Where outlets disagree or were corrected</h3>
          <ul className="discrepancies">
            {discrepancies.map((d, i) => (
              <li key={i}>
                <ConfidenceMark level="conflict" withLabel={false} /> {redactThirdParties(d)}
              </li>
            ))}
          </ul>
        </>
      )}
      {outletLabels.length > 0 && (
        <p className="outlet-labels">
          <strong>Outlets number this day differently:</strong> {outletLabels.join('; ')}
        </p>
      )}
    </section>
  )
}
