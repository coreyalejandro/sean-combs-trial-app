// Sources for a day (or the verdict): numbered, outlet, title, date, link; plus how sure the day is
// and where outlets disagree. Rendered on every day page by the shell, so every visualization shows its sources.
// Sources the picture draws from other days' records or from additions.json are listed after the day's own,
// numbered on from them, so every source on the page sits in one list.
import { redactThirdParties, type DayConfidence, type Source } from '@/lib/data'
import type { ExtraSource } from '@/viz/types'
import { ConfidenceLegend, ConfidenceMark } from './ConfidenceMark'

export interface SourcesPlan {
  /** Extra sources to list, in order, after the day's own (duplicates removed). */
  listed: ExtraSource[]
  /** Listed id -> other ids that name the same article; each gets its own anchor inside that list item. */
  aliases: Record<string, string[]>
}

/**
 * De-duplicate the extra sources against the day's own list and against each other. The same article can carry
 * different ids on different days (or an additions.json id), so duplicates are matched by id and by URL; a
 * duplicate is not listed twice, but its id still resolves (an anchor inside the list item it duplicates).
 */
export function planSources(own: Pick<Source, 'id' | 'url'>[], extras: ExtraSource[]): SourcesPlan {
  const byId = new Set(own.map((s) => s.id))
  const byUrl = new Map(own.map((s) => [s.url, s.id]))
  const listed: ExtraSource[] = []
  const aliases: Record<string, string[]> = {}
  for (const x of extras) {
    if (byId.has(x.id)) continue
    byId.add(x.id)
    const same = byUrl.get(x.url)
    if (same) {
      ;(aliases[same] ??= []).push(x.id)
      continue
    }
    byUrl.set(x.url, x.id)
    listed.push(x)
  }
  return { listed, aliases }
}

function Aliases({ ids }: { ids?: string[] }) {
  if (!ids || ids.length === 0) return null
  return (
    <>
      {ids.map((a) => (
        <span key={a} id={`source-${a}`} className="source-alias" />
      ))}
    </>
  )
}

/** The page's source list items for extra sources (also used by unit tests to resolve every tag). */
export function ExtraSourcesList({ plan, start }: { plan: SourcesPlan; start: number }) {
  if (plan.listed.length === 0) return null
  return (
    <ol className="sources-list sources-extra" start={start}>
      {plan.listed.map((s) => (
        <li key={s.id} id={`source-${s.id}`}>
          <Aliases ids={plan.aliases[s.id]} />
          <span className="src-outlet">{s.outlet}</span>.{' '}
          <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>.{' '}
          <time className="src-date" dateTime={s.date.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? undefined}>{s.date}</time>
          <span className="src-flag"> ({s.origin})</span>
        </li>
      ))}
    </ol>
  )
}

export function SourcesPanel({
  sources,
  confidence,
  discrepancies = [],
  outletLabels = [],
  extras = [],
  heading = 'Sources',
}: {
  sources: Source[]
  confidence: DayConfidence
  discrepancies?: string[]
  outletLabels?: string[]
  extras?: ExtraSource[]
  heading?: string
}) {
  const plan = planSources(sources, extras)
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
            <Aliases ids={plan.aliases[s.id]} />
            <span className="src-outlet">{s.outlet}</span>.{' '}
            <a href={s.url} rel="noopener noreferrer" target="_blank">{s.title}</a>.{' '}
            <time className="src-date" dateTime={s.date.slice(0, 10)}>{s.date}</time>
            {s.opened_this_pass ? null : <span className="src-flag"> (read in an earlier research pass)</span>}
          </li>
        ))}
      </ol>
      {plan.listed.length > 0 && (
        <>
          <h3 id="sources-extra-heading">Also used on this page: other days&rsquo; records and added facts</h3>
          <p className="sources-extra-note">
            The picture also draws on these. They come from the records of other trial days, or were added to check a detail
            (each is marked). The numbers continue from the list above.
          </p>
          <ExtraSourcesList plan={plan} start={sources.length + 1} />
        </>
      )}
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
