// Day 24: the jury box across the trial. Every event is read from a day record, the June 18 calendar
// note, or the verdict record; seats change only where coverage reported a change.
import {
  getDays,
  getGaps,
  getVerdict,
  lowerConfidence,
  resolveSources,
  type Confidence,
  type ReportedNumber,
  type Source,
  type TrialDay,
} from '@/lib/data'
import { toNumber } from '@/lib/viz/format'
import { redact } from '@/viz/kits/days-22-28/kit'

export type SeatState = 'seated' | 'at-issue' | 'removal-announced' | 'replaced'

export interface JuryEvent {
  key: string
  date: string
  /** Testimony day, when the event happened on one. */
  day: number | null
  headline: string
  /** What the record says, redacted. */
  record: string
  sources: Source[]
  confidence: Confidence
  /** The numbered seat this event changes, if any. */
  seatState: SeatState | null
  alternates: number | null
  /** An event about a juror whose seat was not reported. */
  unnamedJuror: boolean
  numbers: ReportedNumber[]
  pool: Source[]
}

export interface Day24Selection {
  jurors: number
  alternatesStart: number
  men: number | null
  women: number | null
  seat: number | null
  events: JuryEvent[]
  strikes: { a: ReportedNumber; aDay: TrialDay; b: ReportedNumber; bDay: TrialDay } | null
  raceClaim: { num: ReportedNumber; day: TrialDay } | null
  seatPeople: { removed: string | null; replacement: string | null; sources: Source[] }
}

const OUTLET_TOKEN = /\b(NBC|CBS|ABC|GMA|Fox5?|CNN|AP|NPR|CrimeOnline|NY1)\b/g

/** Sources named inside an event's text ("(NBC, CBS, NY1 headline)"), else the whole day's list. */
function sourcesNamed(text: string, pool: Source[]): Source[] {
  const tokens = [...new Set(text.match(OUTLET_TOKEN) ?? [])]
  if (tokens.length === 0) return pool
  const found = resolveSources({ source: tokens.join(';'), outlets: tokens }, pool)
  return found.length > 0 ? found : pool
}

/** Keep the sources published on the event's date (or the day after), when there are any. */
function onDate(list: Source[], iso: string): Source[] {
  const next = new Date(Date.parse(iso) + (Date.parse('1970-01-02') - Date.parse('1970-01-01'))).toISOString().slice(0, iso.length)
  const same = list.filter((s) => s.date.startsWith(iso) || s.date.startsWith(next))
  return same.length > 0 ? same : list
}

const findNum = (day: TrialDay, re: RegExp) => day.numbers.find((n) => re.test(`${n.what} ${n.unit}`))
const findText = (day: TrialDay, re: RegExp) => [...day.legal_events, ...day.key_points].find((t) => re.test(t))

export function selectDay24(today: TrialDay): Day24Selection {
  const days = getDays().map((d) => (d.day === today.day ? today : d))
  const first = days[0]
  const seatedNum = findNum(first, /seated jurors/i)
  const altNum = findNum(first, /alternate jurors seated/i)
  const jurors = seatedNum ? toNumber(seatedNum.value) ?? 0 : 0
  const alternatesStart = altNum ? toNumber(altNum.value) ?? 0 : 0
  const mw = seatedNum?.what.match(/(?<m>\d+) men, (?<w>\d+) women/)
  const men = mw?.groups ? Number(mw.groups.m) : null
  const women = mw?.groups ? Number(mw.groups.w) : null

  const events: JuryEvent[] = []
  const push = (e: Omit<JuryEvent, 'key'>) => events.push({ ...e, key: `${e.date}-${events.length}` })

  if (seatedNum) {
    push({
      date: first.date, day: first.day, headline: 'The jury is sworn in',
      record: redact(`${seatedNum.what}. ${altNum ? `${altNum.value} ${altNum.unit}: ${altNum.what}.` : ''}`),
      sources: [...resolveSources(seatedNum, first.sources), ...(altNum ? resolveSources(altNum, first.sources) : [])],
      confidence: lowerConfidence(seatedNum.confidence, altNum?.confidence ?? 'high'),
      seatState: null, alternates: alternatesStart, unnamedJuror: false, numbers: [seatedNum, ...(altNum ? [altNum] : [])], pool: first.sources,
    })
  }

  // The juror at issue: the first day whose figures name a juror number prosecutors sought to remove.
  const motionDay = days.find((d) => d.numbers.some((n) => /seek removal/i.test(n.what)))
  const motionNum = motionDay ? findNum(motionDay, /seek removal/i) : undefined
  const seatMatch = motionNum?.what.match(/Juror No\. (?<n>\d+)/)
  const seat = seatMatch?.groups ? Number(seatMatch.groups.n) : null
  if (motionDay && motionNum) {
    const text = findText(motionDay, /remove Juror No/i) ?? motionNum.what
    push({
      date: motionDay.date, day: motionDay.day, headline: `Prosecutors ask to remove Juror ${seat}`,
      record: redact(text), sources: resolveSources(motionNum, motionDay.sources), confidence: motionNum.confidence,
      seatState: 'at-issue', alternates: null, unnamedJuror: false, numbers: [motionNum], pool: motionDay.sources,
    })
  }
  const postponed = days.find((d) => findText(d, /judge postponed decision/i))
  if (postponed) {
    const text = findText(postponed, /judge postponed decision/i) as string
    push({
      date: postponed.date, day: postponed.day, headline: 'The judge puts off a decision',
      record: redact(text), sources: sourcesNamed(text, postponed.sources), confidence: 'medium',
      seatState: 'at-issue', alternates: null, unnamedJuror: false, numbers: [], pool: postponed.sources,
    })
  }
  const announced = days.find((d) => d.legal_events.some((l) => /announced removal of Juror/i.test(l)))
  if (announced) {
    const text = announced.legal_events.find((l) => /announced removal of Juror/i.test(l)) as string
    const detail = findText(announced, /would be removed for lack of candor about where he lived/i)
    push({
      date: announced.date, day: announced.day, headline: `The judge says Juror ${seat} will be removed`,
      record: redact(detail ?? text), sources: sourcesNamed(text, announced.sources), confidence: 'medium',
      seatState: 'removal-announced', alternates: null, unnamedJuror: false, numbers: [], pool: announced.sources,
    })
  }
  const swapped = days.find((d) => d.legal_events.some((l) => /formally dismissed and replaced/i.test(l)))
  let seatPeople: Day24Selection['seatPeople'] = { removed: null, replacement: null, sources: [] }
  if (swapped) {
    const text = swapped.legal_events.find((l) => /formally dismissed and replaced/i.test(l)) as string
    const why = findText(swapped, /decision rested/i)
    const alt = findNum(swapped, /alternate pool/i)
    const remain = alt?.unit.match(/(?<n>\d+) remain/)
    const letter = findNum(swapped, /letter opposing/i)
    const removedAge = findNum(swapped, /age of dismissed juror/i)
    const replAge = findNum(swapped, /age of replacement juror/i)
    const who = findText(swapped, /Alternate juror, a/i)
    const removedText = why?.match(/\((?<w>[^)]*Black man)\)/)?.groups?.w ?? null
    const replText = who?.match(/Alternate juror, (?<w>a [^,;]+),/)?.groups?.w ?? null
    seatPeople = {
      removed: removedText,
      replacement: replText,
      sources: [...(removedAge ? resolveSources(removedAge, swapped.sources) : []), ...(replAge ? resolveSources(replAge, swapped.sources) : [])],
    }
    push({
      date: swapped.date, day: swapped.day, headline: `Juror ${seat} is dismissed; an alternate takes the seat`,
      record: redact(why ?? text),
      sources: [...new Map([...sourcesNamed(text, swapped.sources), ...(alt ? resolveSources(alt, swapped.sources) : [])].map((s) => [s.id, s])).values()],
      confidence: alt ? alt.confidence : 'medium',
      seatState: 'replaced', alternates: remain?.groups ? Number(remain.groups.n) : null, unnamedJuror: false,
      numbers: [alt, letter, removedAge, replAge].filter((n): n is ReportedNumber => Boolean(n)), pool: swapped.sources,
    })
  }
  for (const gap of getGaps()) {
    const noteDay = days.find((d) => d.day === gap.afterDay)
    const ill = gap.note.match(/a juror reported [^,;]+/i)?.[0]
    if (noteDay && ill) {
      push({
        date: gap.date, day: null, headline: 'No testimony: a juror is ill',
        record: redact(gap.note), sources: sourcesNamed(gap.note, noteDay.sources), confidence: 'medium',
        seatState: null, alternates: null, unnamedJuror: true, numbers: [], pool: noteDay.sources,
      })
    }
  }
  const kept = days.find((d) => d.legal_events.some((l) => /kept a juror/i.test(l)))
  if (kept) {
    const text = kept.legal_events.find((l) => /kept a juror/i.test(l)) as string
    push({
      date: kept.date, day: kept.day, headline: 'A juror with outside communications stays on',
      record: redact(text), sources: sourcesNamed(text, kept.sources), confidence: 'medium',
      seatState: null, alternates: null, unnamedJuror: true, numbers: [], pool: kept.sources,
    })
  }
  const v = getVerdict()
  const notePhase = v.phases.find((p) => p.facts.some((f) => /foreperson sent a note/i.test(f)))
  if (notePhase) {
    const fact = notePhase.facts.find((f) => /foreperson sent a note/i.test(f)) as string
    const sentence = fact.split(/(?<=\.)\s+/).find((s) => /foreperson/i.test(s)) ?? fact
    push({
      date: notePhase.date, day: null, headline: 'Deliberations: the first jury note about a juror',
      record: redact(sentence), sources: onDate(sourcesNamed(fact, v.sources), notePhase.date), confidence: notePhase.confidence,
      seatState: null, alternates: null, unnamedJuror: true, numbers: [], pool: v.sources,
    })
  }
  const verdictPhase = v.phases.find((p) => p.facts.some((f) => /^Jury: /i.test(f)))
  if (verdictPhase) {
    const fact = verdictPhase.facts.find((f) => /^Jury: /i.test(f)) as string
    const sentence = fact.split(/(?<=\.)\s+/)[0]
    push({
      date: verdictPhase.date, day: null, headline: 'The verdict',
      record: redact(sentence), sources: onDate(sourcesNamed(sentence, v.sources), verdictPhase.date), confidence: verdictPhase.confidence,
      seatState: null, alternates: null, unnamedJuror: false, numbers: [], pool: v.sources,
    })
  }
  events.sort((a, b) => a.date.localeCompare(b.date))

  // Strikes: the first day and a later day give different prosecution figures.
  const sDay = first
  const sA = findNum(sDay, /defense strikes used/i)
  const bDay = days.find((d) => d.numbers.some((n) => /government peremptory strikes/i.test(n.what)))
  const sB = bDay ? findNum(bDay, /government peremptory strikes/i) : undefined
  const race = findNum(first, /black jurors the defense said/i)

  return {
    jurors,
    alternatesStart,
    men,
    women,
    seat,
    events,
    strikes: sA && sB && bDay ? { a: sA, aDay: sDay, b: sB, bDay } : null,
    raceClaim: race ? { num: race, day: first } : null,
    seatPeople,
  }
}

/** Seat states after event i (inclusive). */
export function stateAt(sel: Day24Selection, i: number): { seat: SeatState; alternates: number; unnamed: boolean } {
  let seat: SeatState = 'seated'
  let alternates = sel.alternatesStart
  for (const e of sel.events.slice(0, i + 1)) {
    if (e.seatState) seat = e.seatState
    if (e.alternates !== null) alternates = e.alternates
  }
  return { seat, alternates, unnamed: sel.events[i]?.unnamedJuror ?? false }
}
