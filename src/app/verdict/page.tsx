// The bridge between the trial and the march (DESIGN_29, "The verdict and sentence page"):
// the charges resolve (with a sourced verdict per count), the record from closings to sentencing,
// the sentence ruler, then the turn from one case to all survivors (src/viz/finale/VerdictTurn.tsx).
import { ChargeRibbon } from '@/components/shell/ChargeRibbon'
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { SourcesPanel } from '@/components/shell/SourcesPanel'
import { TrialRail } from '@/components/shell/TrialRail'
import { formatDate, getCharges, getVerdict, getWitnesses, redactThirdParties } from '@/lib/data'
import { SentenceRuler, VerdictCounts } from '@/viz/finale/VerdictBridge'
import { VerdictTurn } from '@/viz/finale/VerdictTurn'
import { fmtInt, fmtPeople } from '@/viz/finale/format'
import { summary } from '@/viz/finale/summary'
import '@/viz/finale/finale.css'

export const metadata = { title: 'The verdict and the sentence' }

const MILLION = 1e6
const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five']

export default function VerdictPage() {
  const v = getVerdict()
  const witnesses = getWitnesses()
  const verdictDay = v.phases.find((p) => p.label === 'Verdict')?.date ?? v.phases[v.phases.length - 1].date
  const named = new Set(getCharges().map((c) => c.person).filter(Boolean))
  const namedLine = `${NUMBER_WORDS[named.size] ?? named.size} women named in its charges.`
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

        <VerdictCounts />

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

        <SentenceRuler />

        <VerdictTurn
          witnesses={witnesses.length}
          namedLine={namedLine}
          peoplePerDot={fmtInt(summary.people_per_dot)}
          survivors={fmtPeople(summary.totals.central)}
          survivorsRound={`${fmtInt(summary.totals.central / MILLION)} million`}
          survivorsRange={`${fmtPeople(summary.totals.low)} to ${fmtPeople(summary.totals.high)}`}
        />
        <p className="measure muted">
          The survivor count is the CDC&rsquo;s National Intimate Partner and Sexual Violence Survey 2023/2024 (lifetime contact sexual
          violence, U.S. adults); its sources and method are on the next page.
        </p>

        <SourcesPanel sources={v.sources} confidence={v.confidence} discrepancies={v.discrepancies} heading="Sources for the verdict and sentence" />
      </div>
    </div>
  )
}
