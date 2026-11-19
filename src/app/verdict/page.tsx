// The bridge between the trial and the march (DESIGN_29, "The verdict and sentence page").
// Scaffold version: the charges resolve, the deliberation and sentence record, and the turn toward the finale.
// The finale porter replaces the turn with the star-to-dot transition (see BUILDER_BRIEF.md).
import Link from 'next/link'
import { ChargeRibbon } from '@/components/shell/ChargeRibbon'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { SourcesPanel } from '@/components/shell/SourcesPanel'
import { TrialRail } from '@/components/shell/TrialRail'
import { formatDate, getCharges, getVerdict, getWitnesses, redactThirdParties } from '@/lib/data'

export const metadata = { title: 'The verdict and the sentence' }

export default function VerdictPage() {
  const v = getVerdict()
  const witnesses = getWitnesses()
  const verdictDay = v.phases.find((p) => p.label === 'Verdict')?.date ?? v.phases[v.phases.length - 1].date
  const named = new Set(getCharges().map((c) => c.person).filter(Boolean))
  return (
    <div className="page-dark verdict-page">
      <header className="day-cover">
        <div className="wrap cover-inner">
          <span className="cover-number" aria-hidden="true">V</span>
          <div className="cover-text">
            <p className="cover-eyebrow mono">{formatDate(verdictDay, { weekday: true })}</p>
            <h1 className="cover-title">The verdict and the sentence</h1>
          </div>
        </div>
      </header>
      <TrialRail current="verdict" />
      <div className="wrap day-body">
        <aside className="content-note on-dark" aria-label="Content note">
          <p><strong>Content note.</strong> {v.content_note}</p>
        </aside>
        <ChargeRibbon resolved />
        <p className="verdict-meaning measure">
          Not guilty means the jury was not persuaded beyond a reasonable doubt. It is not a finding about what anyone lived through.
        </p>

        <section aria-labelledby="record-heading" className="verdict-record">
          <h2 id="record-heading">From the close of evidence to the sentence</h2>
          <ol className="phase-list">
            {v.phases.map((p) => (
              <li key={p.date + p.label} data-confidence={p.confidence}>
                <p className="phase-head">
                  <time className="mono" dateTime={p.date}>{formatDate(p.date, { weekday: true })}</time> <strong>{p.label}</strong>{' '}
                  <ConfidenceMark level={p.confidence} />
                </p>
                <ul>
                  {p.facts.map((f, i) => <li key={i}>{redactThirdParties(f)}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="verdict-turn" aria-labelledby="turn-heading">
          <h2 id="turn-heading" className="turn-line">
            One trial. {witnesses.length} witnesses. {named.size === 2 ? 'Two women' : `${named.size} people`} named in its charges.
          </h2>
          <p className="turn-next">Then the camera pulls back.</p>
          <Link href="/finale/" className="btn btn-red">Begin the march</Link>
        </section>

        <SourcesPanel sources={v.sources} confidence={v.confidence} discrepancies={v.discrepancies} heading="Sources for the verdict and sentence" />
      </div>
    </div>
  )
}
