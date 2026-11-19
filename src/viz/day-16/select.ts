// Day 16: the stations of the 2016 hotel video's chain of custody, each read from the day that reported it.
// A station whose fact is missing from the record is left out, so the line always matches the data.
import { getVerdict, redactThirdParties, resolveSources, type ReportedNumber, type Source, type TrialDay } from '@/lib/data'
import { formatUSD, formatValue, toNumber, midSentence } from '@/lib/viz/format'
import { dayRef } from '@/viz/kits/days-15-21/days'
import { lowest, type Level } from '@/viz/kits/days-15-21/sources'
import { datesInText, formatDated, isoToDate, type Dated } from '@/viz/kits/days-15-21/time'

export interface Station {
  id: string
  title: string
  /** Who had the video, or who acted on it, at this station. */
  holder: string
  /** "Who had it" by default; "Who acted" where the stop is about something done, not possession. */
  holderLabel?: string
  when: Dated
  whenText: string
  words: string[]
  level: Level
  sources: Source[]
  /** Testimony day the fact comes from (links to that page). */
  fromDay: number | null
  era: 'before' | 'trial'
}

export interface Day16Selection {
  stations: Station[]
  used: ReportedNumber[]
  other: ReportedNumber[]
  omitted: number
  pool: Source[]
  extraSources: Source[]
}

/** A fact read from a day's summary text: at most "one outlet", and never above the day's own level. */
const textLevel = (d: TrialDay): Level => lowest(d.confidence.level, 'medium')

/** The sentence (or clause) in a passage that matches, without a leading "Name:" label. */
export function clause(text: string, re: RegExp): string | null {
  const parts = text.split(/;\s+|(?<=\.)\s+(?=[A-Z])/)
  const hit = parts.find((p) => re.test(p))
  return hit ? redactThirdParties(hit.replace(/^[A-Z][\w' ]+( \([^)]*\))?:\s*/, '').trim().replace(/\.$/, '')) : null
}

const findText = (list: string[], re: RegExp) => list.find((t) => re.test(t)) ?? null

const MAX_SOURCES = 1 + 2

/** The day's sources whose research note or title mention the topic; all of them if none do. */
export function sourcesFor(day: { sources: Source[] }, re: RegExp): Source[] {
  const hits = day.sources.filter((s) => re.test(`${s.title} ${s.note}`))
  return (hits.length > 0 ? hits : day.sources).slice(0, MAX_SOURCES)
}

/** Figures about bodies or injuries, left out of this page (care rule 2). */
const BODY = /height and weight|lbs/i

export function select(day: TrialDay): Day16Selection {
  const stations: Station[] = []
  const used: ReportedNumber[] = []
  const d1 = dayRef('Day 1')
  const d3 = dayRef('Day 3')
  const d15 = dayRef('Day 15')
  const d19 = dayRef('Day 19')
  const d25 = dayRef('Day 25')
  const verdict = getVerdict()

  // 1. Recorded (date from the day the payment was described, two or more outlets)
  const recorded = d15.numbers.find((n) => n.unit === 'date' && /InterContinental/i.test(n.what))
  const recordedDate = recorded ? isoToDate(String(recorded.value)) : null
  if (recorded && recordedDate) {
    stations.push({
      id: 'recorded', title: "Recorded by the hotel's hallway camera", holder: "The hotel's security system",
      when: recordedDate, whenText: formatDated(recordedDate), words: [], level: recorded.confidence,
      sources: resolveSources(recorded, d15.sources), fromDay: d15.day, era: 'before',
    })
  }
  const year2016: Dated | null = recordedDate ? { date: recordedDate.date, precision: 'year' } : null

  // 2. A guard films it on his own phone (Day 1)
  const phone = findText(d1.key_points, /own phone/i)
  if (phone && year2016) {
    stations.push({
      id: 'phone', title: 'A hotel security officer films it on his own phone', holder: 'A hotel security officer (Israel Florez)',
      when: year2016, whenText: formatDated(year2016), words: [clause(phone, /own phone/i) ?? ''].filter(Boolean),
      level: textLevel(d1), sources: sourcesFor(d1, /Florez|hotel video|phone/i), fromDay: d1.day, era: 'before',
    })
  }

  // 3. The chief of staff asks; cash buys "the only copy" (Day 15)
  const cash = d15.numbers.find((n) => /cash .*paid .*video|counted in/i.test(n.what) && toNumber(n.value) !== null)
  const ask = findText(d15.key_points, /chief of staff/i)
  const only = findText(d15.key_points, /only copy/i)
  if (cash && recordedDate) {
    const amount = toNumber(cash.value) ?? 0
    stations.push({
      id: 'bought', title: `${formatUSD(amount)} in cash buys "the only copy"`, holder: 'Combs, from the hotel security staff',
      when: { date: recordedDate.date, precision: 'month' }, whenText: formatDated({ date: recordedDate.date, precision: 'month' }),
      words: [ask ? clause(ask, /chief of staff/i) : null, only ? clause(only, /only copy/i) : null].filter((x): x is string => !!x),
      level: cash.confidence, sources: resolveSources(cash, d15.sources), fromDay: d15.day, era: 'before',
    })
  }

  // 4. Texts from 2016 about keeping it private (shown on Day 25; one outlet, unconfirmed per DESIGN_29)
  const texts = findText(d25.key_points, /keep .*video .*public|from becoming public/i)
  if (texts && year2016) {
    stations.push({
      id: 'texts', title: 'Texts about keeping it from becoming public', holder: "Combs's chief of staff, who sent the texts (she was not charged and did not testify)", holderLabel: 'Who acted',
      when: year2016, whenText: `${formatDated(year2016)} (shown to the jury on Day ${d25.day})`,
      words: [clause(texts, /public/i) ?? ''].filter(Boolean),
      level: lowest(textLevel(d25), 'low'), sources: sourcesFor(d25, /Khorram|texts|hotel/i), fromDay: d25.day, era: 'before',
    })
  }

  // 5. CNN publishes it (Day 19 testimony)
  const cnn = findText(d19.key_points, /CNN release/i)
  const cnnDate = cnn ? datesInText(cnn)[0] : undefined
  if (cnn && cnnDate) {
    stations.push({
      id: 'cnn', title: 'CNN publishes it', holder: 'CNN, and everyone who saw it',
      when: cnnDate, whenText: formatDated(cnnDate), words: [clause(cnn, /CNN/i) ?? ''].filter(Boolean),
      level: textLevel(d19), sources: sourcesFor(d19, /CNN|video/i), fromDay: d19.day, era: 'before',
    })
  }

  // 6. In court from Day 1; watched again and again by Day 3
  const exclude = findText(d1.legal_events, /exclude the 2016 hotel video/i)
  const viewings = d3.numbers.find((n) => /watched the hotel video/i.test(n.what))
  const opening = isoToDate(d1.date)
  if (opening && (exclude || viewings)) {
    const words = [exclude ? redactThirdParties(exclude) : null, viewings ? `Jurors had watched it ${formatValue(viewings.value, viewings.unit)} by Day ${d3.day}.` : null]
    stations.push({
      id: 'court', title: 'Shown to the jury, again and again', holder: 'The court and the jury',
      when: opening, whenText: `${formatDated(opening)} (Day ${d1.day}) onward`, words: words.filter((x): x is string => !!x),
      level: lowest(exclude ? textLevel(d1) : 'high', viewings ? viewings.confidence : 'high'),
      sources: [...(exclude ? sourcesFor(d1, /exclude|video/i) : []), ...(viewings ? resolveSources(viewings, d3.sources) : [])],
      fromDay: d1.day, era: 'trial',
    })
  }

  // 7. The forensic analyst: "no anomalies" (this day)
  const piazza = findText(day.key_points, /no anomalies/i)
  const checked = day.numbers.find((n) => n.unit === 'date' && /authenticated/i.test(n.what))
  const today = isoToDate(day.date)
  if (piazza && today) {
    if (checked) used.push(checked)
    stations.push({
      id: 'analyst', title: 'A forensic analyst finds "no anomalies"', holder: 'Frank Piazza, forensic video analyst for the prosecution',
      when: today, whenText: `${formatDated(today)} (Day ${day.day})`,
      words: piazza.split(/(?<=\.)\s+(?=[A-Z])/).filter((t) => /anomal|chronological/i.test(t)).map((t) => `Frank Piazza ${redactThirdParties(t.replace(/^Piazza:\s*/, '').replace(/\.$/, ''))}.`),
      level: checked ? checked.confidence : textLevel(day), sources: checked ? resolveSources(checked, day.sources) : day.sources,
      fromDay: day.day, era: 'trial',
    })
  }

  // 8. The jury asks to rehear testimony about it (deliberations)
  const phase = verdict.phases.find((p) => p.facts.some((f) => /review testimony .*hotel incident/i.test(f)))
  const fact = phase?.facts.find((f) => /review testimony .*hotel incident/i.test(f))
  const phaseDate = phase ? isoToDate(phase.date) : null
  if (phase && fact && phaseDate) {
    const cited = fact.match(/\(([^)]+)\)\s*\.?$/)?.[1] ?? ''
    const all = resolveSources({ source: cited, outlets: cited.split(/[,;/]\s*/) }, verdict.sources)
    const sameDay = all.filter((x) => x.date.startsWith(phase.date))
    const src = sameDay.length > 0 ? sameDay : all
    stations.push({
      id: 'jury', title: 'The jury asks to rehear testimony about the incident', holder: 'The jury, deliberating',
      when: phaseDate, whenText: `${formatDated(phaseDate)} (${midSentence(phase.label)})`, words: [redactThirdParties(fact)],
      level: phase.confidence, sources: src.length > 0 ? src : verdict.sources.slice(0, 1), fromDay: null, era: 'trial',
    })
  }

  const omittedList = day.numbers.filter((n) => BODY.test(n.what))
  const pool = day.sources
  const ids = new Set(pool.map((s) => s.id))
  return {
    stations,
    used,
    other: day.numbers.filter((n) => !used.includes(n) && !omittedList.includes(n)),
    omitted: omittedList.length,
    pool,
    extraSources: stations.flatMap((s) => s.sources).filter((s) => !ids.has(s.id)),
  }
}
