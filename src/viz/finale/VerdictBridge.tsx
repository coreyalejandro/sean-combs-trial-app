// The verdict page's sourced record: how the jury decided each count, and the sentence on one ruler.
// Server component; every fact comes from getVerdict() / getCharges() (trial_days.json).
import { ConfidenceMark } from '@/components/shell/ConfidenceMark'
import { formatDate, getCharges, getVerdict, resolveSources, type ReportedNumber, type Source, type Verdict } from '@/lib/data'
import { formatValue } from '@/lib/viz/format'

const MONTHS_PER_YEAR = 12
const PERCENT = 100
const LABEL_FLIP = 0.6 // labels past 60% of the ruler hang to the left of their mark

function pick(v: Verdict, re: RegExp): ReportedNumber {
  const n = v.numbers.find((x) => re.test(x.what))
  if (!n) throw new Error(`verdict record has no number matching ${re}`)
  return n
}

const DAY_MS = 86400000

/**
 * The verdict's sources for one number, narrowed to the articles from the day it was reported (the verdict
 * or the sentencing), so a figure is not tagged with every article from the same outlet. The list keeps the
 * shared numbering of the sources panel.
 */
function poolFor(num: ReportedNumber, v: Verdict, phaseDate: string): Source[] {
  const all = resolveSources(num, v.sources)
  const day = Date.parse(phaseDate)
  const near = all.filter((s) => Math.abs(Date.parse(s.date.slice(0, 10)) - day) <= DAY_MS)
  return near.length ? near : all
}

function VCite({ num, v, phaseDate, mark = true }: { num: ReportedNumber; v: Verdict; phaseDate: string; mark?: boolean }) {
  const sources = poolFor(num, v, phaseDate)
  return (
    <span className="cite" data-source-ids={sources.map((s) => s.id).join(' ')} data-confidence={num.confidence}>
      <span className="num">{formatValue(num.value, num.unit)}</span>
      {mark ? <> <ConfidenceMark level={num.confidence} /></> : null}
      {sources.map((s) => (
        <a key={s.id} href={`#source-${s.id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
          <sup>[{v.sources.indexOf(s) + 1}]</sup>
        </a>
      ))}
    </span>
  )
}

function Refs({ ids, pool }: { ids: string[]; pool: Verdict['sources'] }) {
  return (
    <span data-source-ids={ids.join(' ')}>
      {ids.map((id) => {
        const s = pool.find((x) => x.id === id)
        if (!s) return null
        return (
          <a key={id} href={`#source-${id}`} className="source-ref" aria-label={`Source: ${s.outlet}`}>
            <sup>[{pool.indexOf(s) + 1}]</sup>
          </a>
        )
      })}
    </span>
  )
}

/** Count by count: the charge in plain words, who it named, the outcome in words, and its sources. */
export function VerdictCounts() {
  const v = getVerdict()
  const charges = getCharges()
  const verdictPhase = v.phases.find((p) => p.label === 'Verdict')
  const level = verdictPhase?.confidence ?? v.confidence.level
  const convicted = pick(v, /Counts of conviction/)
  const acquitted = pick(v, /Counts of acquittal/)
  const vd = verdictPhase?.date ?? v.phases[v.phases.length - 1].date
  return (
    <section aria-labelledby="counts-heading" className="vt-counts-wrap">
      <div className="table-scroll" role="region" aria-labelledby="counts-heading" tabIndex={0}>
        <table className="vt-counts">
          <caption id="counts-heading">How the jury decided each count</caption>
          <thead>
            <tr><th scope="col">Count</th><th scope="col">Charge, in plain words</th><th scope="col">Verdict</th><th scope="col">Sources</th></tr>
          </thead>
          <tbody>
            {charges.map((c) => (
              <tr key={c.count} data-count={c.count}>
                <th scope="row" className="mono">Count {c.count}</th>
                <td><strong>{c.short}</strong>. {c.plain}.</td>
                <td><span className={`vt-outcome is-${c.outcome.replace(' ', '-')}`}>{c.outcome}</span></td>
                <td className="vt-src"><Refs ids={c.source_ids} pool={v.sources} /> <ConfidenceMark level={level} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="measure">
        Guilty on <VCite num={convicted} v={v} phaseDate={vd} /> (both transportation counts); not guilty on <VCite num={acquitted} v={v} phaseDate={vd} /> (racketeering
        conspiracy and both sex-trafficking counts).
      </p>
    </section>
  )
}

/** The sentence ruler (DESIGN_29): defense ask, sentence imposed, prosecution ask, statutory maximum, in months. */
export function SentenceRuler() {
  const v = getVerdict()
  const defense = pick(v, /Defense request/)
  const imposed = pick(v, /Sentence imposed/)
  const prosecution = pick(v, /Prosecution request/)
  const maxYears = pick(v, /Combined statutory maximum/)
  const fine = pick(v, /Fine imposed/)
  const supervised = pick(v, /Supervised release/)
  const sentencing = v.phases.find((p) => p.label === 'Sentencing')
  const verdictDate = v.phases.find((p) => p.label === 'Verdict')?.date ?? ''
  const sd = sentencing?.date ?? verdictDate
  const maxMonths = Number(maxYears.value) * MONTHS_PER_YEAR
  const marks: Array<{ months: number; label: string; num: ReportedNumber; calculated?: boolean; key: string }> = [
    { key: 'defense', months: Number(defense.value), label: 'the defense asked for no more than', num: defense },
    { key: 'imposed', months: Number(imposed.value), label: 'the sentence imposed', num: imposed },
    { key: 'prosecution', months: Number(prosecution.value), label: 'the prosecution asked for at least', num: prosecution },
    { key: 'max', months: maxMonths, label: 'the most the law allowed for the two counts', num: maxYears, calculated: true },
  ]
  const x = (m: number) => (m / maxMonths) * PERCENT
  return (
    <section className="vt-sentence" aria-labelledby="sentence-heading">
      <h2 id="sentence-heading" className="vt-h2">The sentence, on one ruler{sentencing ? <> <span className="muted vt-date">({formatDate(sentencing.date)})</span></> : null}</h2>
      <div className="vt-ruler-html" role="group" aria-label={`Sentence ruler in months, from 0 to ${maxMonths}`}>
        <div className="vt-axis" aria-hidden="true">
          <span className="vt-served" style={{ width: `${x(Number(imposed.value))}%` }} />
          {marks.map((m) => <i key={m.key} style={{ left: `${x(m.months)}%` }} />)}
        </div>
        <ul className="vt-marks">
          {marks.map((m) => {
            const flip = x(m.months) / PERCENT > LABEL_FLIP
            return (
              <li
                key={m.key}
                className={`vt-mark ${flip ? 'is-flip' : ''} ${m.key === 'imposed' ? 'is-imposed' : ''}`}
                style={flip ? { marginRight: `${PERCENT - x(m.months)}%`, maxWidth: `${x(m.months)}%` } : { marginLeft: `${x(m.months)}%`, maxWidth: `${PERCENT - x(m.months)}%` }}
              >
                {m.calculated ? (
                  <>
                    <span className="num">{m.months} months</span> <span className="vt-what">{m.label}</span>{' '}
                    <span className="vt-calc-wrap">(<VCite num={m.num} v={v} phaseDate={verdictDate} mark={false} /> × {MONTHS_PER_YEAR}<span className="vt-calc">calculated</span>)</span>
                  </>
                ) : (
                  <>
                    <VCite num={m.num} v={v} phaseDate={sd} mark={false} /> <span className="vt-what">{m.label}</span>
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
      <ul className="vt-terms">
        <li>Fine: <VCite num={fine} v={v} phaseDate={sd} />, the maximum for these counts.</li>
        <li>Supervised release after prison: <VCite num={supervised} v={v} phaseDate={sd} />.</li>
        <li className="muted">Months on the ruler are as reported; {formatValue(maxYears.value, maxYears.unit)} is converted to months.</li>
      </ul>
    </section>
  )
}
