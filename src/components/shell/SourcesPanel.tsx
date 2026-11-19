// Sources for a day (or the verdict): numbered, outlet, title, date, link; plus how sure the day is
// and where outlets disagree. Rendered on every day page by the shell, so every visualization shows its sources.
// Sources the picture draws from other days' records or from additions.json are listed after the day's own,
// numbered on from them, so every source on the page sits in one list.
import { plainSourceTitle, redactThirdParties, type DayConfidence, type Source } from '@/lib/data'
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

/** Where an extra source comes from, in reader words ("first cited on Day 15"), whatever wording a picture used. */
export function plainOrigin(origin: string): string {
  const day = origin.match(/Day (\d+)/)
  if (day) return `first cited on Day ${day[1]}`
  if (/verdict/i.test(origin)) return 'first cited on the verdict page'
  return 'added to check a detail on this page'
}

/** "6 sources from 3 outlet families (ABC, AP, CBS); numbers: ..." -> "6 news reports, from ABC, AP and CBS." */
export function plainSourcesSummary(summary: string, count: number): string {
  const list = summary.match(/\(([^)]*)\)/)?.[1]?.split(/,\s*/).filter(Boolean) ?? []
  const names = list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list[0]
  const reports = `${count} news report${count === 1 ? '' : 's'}`
  return names ? `This page draws on ${reports}, from ${names}.` : `This page draws on ${reports}.`
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
          <a href={s.url} rel="noopener noreferrer" target="_blank">{plainSourceTitle(s.title)}</a>.{' '}
          <time className="src-date" dateTime={s.date.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? undefined}>{s.date.replace(/\s*\(.*$/, '')}</time>
          <span className="src-flag"> ({plainOrigin(s.origin)})</span>
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
      <p className="sources-confidence">{plainSourcesSummary(confidence.summary, sources.length)}</p>
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
          </li>
        ))}
      </ol>
      {plan.listed.length > 0 && (
        <>
          <h3 id="sources-extra-heading">Also cited on this page</h3>
          <p className="sources-extra-note">
            These reports were first cited on other pages of this site, or were added to check a detail (each is marked).
            The numbers continue from the list above.
          </p>
          <ExtraSourcesList plan={plan} start={sources.length + 1} />
        </>
      )}
      {discrepancies.length > 0 && (
        <>
          <h3>Where news reports differ</h3>
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
          <strong>Some outlets number this trial day differently:</strong> {outletLabels.join('; ')}
        </p>
      )}
    </section>
  )
}
